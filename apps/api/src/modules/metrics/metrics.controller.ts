import { Controller, Get, Header, UseGuards } from "@nestjs/common";
import { MetricsService } from "./metrics.service";
import { JwtAuthGuard } from "../auth/jwt.guard";

@Controller("metrics")
export class MetricsController {
  constructor(private metrics: MetricsService) {}

  // Guarded metrics (for humans/internal tools)
  @UseGuards(JwtAuthGuard)
  @Get()
  @Header("Content-Type", "text/plain; version=0.0.4")
  async getMetrics(): Promise<string> {
    return this.metrics.metricsText();
  }

  // Public metrics endpoint for Prometheus scraping (no JWT)
  @Get("public")
  @Header("Content-Type", "text/plain; version=0.0.4")
  async getMetricsPublic(): Promise<string> {
    return this.metrics.metricsText();
  }
}