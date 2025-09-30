import { Injectable, OnModuleInit } from "@nestjs/common";
import { Worker, QueueEvents, JobsOptions } from "bullmq";
import IORedis from "ioredis";
import fetch from "node-fetch";
import { PrismaService } from "../prisma/prisma.service";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const PARSER_URL = process.env.PARSER_URL || "http://localhost:8001";

@Injectable()
export class IngestionService implements OnModuleInit {
  private worker!: Worker;
  private queueEvents!: QueueEvents;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    const connection = new IORedis(REDIS_URL);
    this.worker = new Worker(
      "parse",
      async (job) => {
        const { objectKey, downloadUrl, accountId } = job.data as {
          objectKey: string;
          downloadUrl: string;
          accountId: string;
        };

        // Call parser service
        const res = await fetch(`${PARSER_URL}/parse-from-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ downloadUrl, objectKey, accountId })
        });
        if (!res.ok) {
          throw new Error(`Parser failed with status ${res.status}`);
        }
        const parsed = (await res.json()) as { ok: boolean; vendor?: string };

        // Minimal persistence: create a placeholder CreditReport
        await this.prisma.creditReport.create({
          data: {
            accountId,
            vendor: parsed.vendor || "unknown",
            reportDate: new Date(),
            rawObjectKey: objectKey
          }
        });

        return { ok: true };
      },
      { connection }
    );

    this.queueEvents = new QueueEvents("parse", { connection });
    this.queueEvents.on("failed", ({ jobId, failedReason }) => {
      // eslint-disable-next-line no-console
      console.error("Job failed", jobId, failedReason);
    });
  }
}