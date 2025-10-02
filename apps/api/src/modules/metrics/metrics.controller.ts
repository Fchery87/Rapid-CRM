import { Controller, Get, Header, UseGuards } from "@nestjs/common";
import { MetricsService } from "./metrics.service";
import { JwtAuthGuard } from "../auth/jwt.guard";

@UseGuards(JwtAuthGuard)
@Controller("metrics")
export class MetricsController {
  constructor(private metrics: MetricsService) {}

  @Get()
  @Header("Content-Type", "text/plain; version=0.0.4")
  async getMetrics(): Promise<string> {
    return this.metrics.metricsText();
  }
}