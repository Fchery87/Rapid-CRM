import { Injectable } from "@nestjs/common";
import { Counter, Histogram, Gauge, Registry, collectDefaultMetrics } from "prom-client";
import IORedis from "ioredis";
import { Queue } from "bullmq";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

@Injectable()
export class MetricsService {
  private registry = new Registry();

  jobsEnqueued: Counter;
  jobsCompleted: Counter;
  jobsFailed: Counter;
  jobDuration: Histogram;
  queueWaiting: Gauge;
  queueActive: Gauge;

  httpRequests: Counter;
  httpDuration: Histogram;

  pdfGenerated: Counter;

  private queue: Queue;

  constructor() {
    collectDefaultMetrics({ register: this.registry });

    this.jobsEnqueued = new Counter({
      name: "parse_jobs_enqueued_total",
      help: "Total number of parse jobs enqueued",
      registers: [this.registry]
    });
    this.jobsCompleted = new Counter({
      name: "parse_jobs_completed_total",
      help: "Total number of parse jobs completed",
      registers: [this.registry]
    });
    this.jobsFailed = new Counter({
      name: "parse_jobs_failed_total",
      help: "Total number of parse jobs failed",
      registers: [this.registry]
    });
    this.jobDuration = new Histogram({
      name: "parse_job_duration_seconds",
      help: "Duration of parse jobs in seconds",
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
      registers: [this.registry]
    });
    this.queueWaiting = new Gauge({
      name: "parse_queue_waiting",
      help: "Number of jobs waiting in parse queue",
      registers: [this.registry]
    });
    this.queueActive = a new Gauge({
      name: "parse_queue_active",
      help: "Number of active jobs in parse queue",
      registers: [this.registry]
    });

    this.httpRequests = new Counter({
      name: "http_requests_total",
      help: "Total HTTP requests",
      labelNames: ["method", "route", "status"] as const,
      registers: [this.registry]
    });

    this.httpDuration = new Histogram({
      name: "http_request_duration_seconds",
      help: "Duration of HTTP requests in seconds",
      labelNames: ["method", "route"] as const,
      buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
      registers: [this.registry]
    });

    this.pdfGenerated = new Counter({
      name: "pdf_generated_total",
      help: "Number of PDFs generated",
      labelNames: ["type"] as const,
      registers: [this.registry]
    });

    const connection = new IORedis(REDIS_URL);
    this.queue = new Queue("parse", { connection });
  }

  markEnqueued() {
    this.jobsEnqueued.inc();
  }

  markCompleted(durationSeconds: number) {
    this.jobsCompleted.inc();
    this.jobDuration.observe(durationSeconds);
  }

  markFailed() {
    this.jobsFailed.inc();
  }

  incHttp(method: string, route: string, status: number, durationSeconds: number) {
    this.httpRequests.inc({ method, route, status: String(status) });
    this.httpDuration.labels(method, route).observe(durationSeconds);
  }

  incPdf(type: "audit" | "letter") {
    this.pdfGenerated.inc({ type });
  }

  async sampleQueueSizes() {
    const counts = await this.queue.getJobCounts("waiting", "active");
    this.queueWaiting.set(counts.waiting || 0);
    this.queueActive.set(counts.active || 0);
  }

  async metricsText(): Promise<string> {
    await this.sampleQueueSizes();
    return this.registry.metrics();
  }
}