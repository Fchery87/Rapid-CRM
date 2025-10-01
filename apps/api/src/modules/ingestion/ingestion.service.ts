import { Injectable, OnModuleInit } from "@nestjs/common";
import { Worker, QueueEvents } from "bullmq";
import IORedis from "ioredis";
import { PrismaService } from "../prisma/prisma.service";
import { MetricsService } from "../metrics/metrics.service";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const PARSER_URL = process.env.PARSER_URL || "http://localhost:8001";

type Normalized = {
  ok: boolean;
  vendor: string;
  reportDate: string; // ISO date
  objectKey: string;
  accountId: string;
  bureaus: Array<{ bureau: "TU" | "EX" | "EQ"; score?: number | null }>;
  personalInfo: Array<{
    bureau: "TU" | "EX" | "EQ";
    name?: string | null;
    ssnLast4?: string | null;
    dob?: string | null;
    addressLine?: string | null;
    city?: string | null;
    state?: string | null;
    postal?: string | null;
  }>;
  tradelines: Array<{
    creditorName: string;
    balance?: number | null;
    creditLimit?: number | null;
    utilization?: number | null;
    isNegative?: boolean;
    issues?: string[];
    reportedBureaus?: Array<"TU" | "EX" | "EQ">;
    openedDate?: string | null;
    closedDate?: string | null;
  }>;
  inquiries: Array<{ name: string; date?: string | null; hard?: boolean }>;
  publicRecords: Array<{ kind: string; description?: string | null; date?: string | null; isNegative?: boolean }>;
};

@Injectable()
export class IngestionService implements OnModuleInit {
  private worker!: Worker;
  private queueEvents!: QueueEvents;

  constructor(private prisma: PrismaService, private metrics: MetricsService) {}

  onModuleInit() {
    const connection = new IORedis(REDIS_URL);
    this.worker = new Worker(
      "parse",
      async (job) => {
        const start = process.hrtime.bigint();

        const { objectKey, downloadUrl, accountId } = job.data as {
          objectKey: string;
          downloadUrl: string;
          accountId: string;
        };

        // Call parser service using global fetch (Node 20)
        const res = await fetch(`${PARSER_URL}/parse-from-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ downloadUrl, objectKey, accountId })
        } as any);
        if (!res.ok) {
          throw new Error(`Parser failed with status ${res.status}`);
        }
        const parsed = (await res.json()) as Normalized;

        // Persist normalized data idempotently per (accountId, rawObjectKey)
        const existing = await this.prisma.creditReport.findFirst({
          where: { accountId, rawObjectKey: objectKey },
          select: { id: true }
        });

        const report =
          existing ??
          (await this.prisma.creditReport.create({
            data: {
              accountId,
              vendor: parsed.vendor || "unknown",
              reportDate: new Date(parsed.reportDate || new Date().toISOString()),
              rawObjectKey: objectKey
            },
            select: { id: true }
          }));

        // Update vendor/reportDate in case they change
        await this.prisma.creditReport.update({
          where: { id: report.id },
          data: {
            vendor: parsed.vendor || "unknown",
            reportDate: new Date(parsed.reportDate || new Date().toISOString())
          }
        });

        // Replace child records
        await this.prisma.$transaction([
          this.prisma.bureauReport.deleteMany({ where: { creditReportId: report.id } }),
          this.prisma.personalInfo.deleteMany({ where: { creditReportId: report.id } }),
          this.prisma.tradeline.deleteMany({ where: { creditReportId: report.id } }),
          this.prisma.inquiry.deleteMany({ where: { creditReportId: report.id } }),
          this.prisma.publicRecord.deleteMany({ where: { creditReportId: report.id } })
        ]);

        if (parsed.bureaus?.length) {
          await this.prisma.bureauReport.createMany({
            data: parsed.bureaus.map((b) => ({
              creditReportId: report.id,
              bureau: b.bureau,
              score: b.score ?? null
            }))
          });
        }

        if (parsed.personalInfo?.length) {
          await this.prisma.personalInfo.createMany({
            data: parsed.personalInfo.map((p) => ({
              creditReportId: report.id,
              bureau: p.bureau,
              name: p.name || null,
              ssnLast4: p.ssnLast4 || null,
              dob: p.dob || null,
              addressLine: p.addressLine || null,
              city: p.city || null,
              state: p.state || null,
              postal: p.postal || null
            }))
          });
        }

        if (parsed.tradelines?.length) {
          // createMany for arrays (issues, reportedBureaus) works via Prisma JSON/array field support
          await this.prisma.tradeline.createMany({
            data: parsed.tradelines.map((t) => ({
              creditReportId: report.id,
              creditorName: t.creditorName,
              balance: t.balance ?? null,
              creditLimit: t.creditLimit ?? null,
              utilization: t.utilization ?? null,
              isNegative: t.isNegative ?? false,
              issues: t.issues ?? [],
              reportedBureaus: (t.reportedBureaus ?? []) as any,
              openedDate: t.openedDate ? new Date(t.openedDate) : null,
              closedDate: t.closedDate ? new Date(t.closedDate) : null
            }))
          });
        }

        if (parsed.inquiries?.length) {
          await this.prisma.inquiry.createMany({
            data: parsed.inquiries.map((i) => ({
              creditReportId: report.id,
              name: i.name,
              date: i.date ? new Date(i.date) : null,
              hard: i.hard ?? true
            }))
          });
        }

        if (parsed.publicRecords?.length) {
          await this.prisma.publicRecord.createMany({
            data: parsed.publicRecords.map((pr) => ({
              creditReportId: report.id,
              kind: pr.kind,
              description: pr.description || null,
              date: pr.date ? new Date(pr.date) : null,
              isNegative: pr.isNegative ?? true
            }))
          });
        }

        const end = process.hrtime.bigint();
        const durationSeconds = Number(end - start) / 1e9;
        this.metrics.markCompleted(durationSeconds);

        return {
          ok: true,
          reportId: report.id,
          counts: {
            bureaus: parsed.bureaus?.length || 0,
            personalInfo: parsed.personalInfo?.length || 0,
            tradelines: parsed.tradelines?.length || 0,
            inquiries: parsed.inquiries?.length || 0,
            publicRecords: parsed.publicRecords?.length || 0
          }
        };
      },
      { connection }
    );

    const events = new QueueEvents("parse", { connection });
    this.queueEvents = events;
    events.on("failed", ({ jobId, failedReason }) => {
      this.metrics.markFailed();
      // eslint-disable-next-line no-console
      console.error("Job failed", jobId, failedReason);
    });
  }
}