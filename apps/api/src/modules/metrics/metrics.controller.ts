import { Controller, Get, Header } from "@nestjs/common";
import { MetricsService } from "./metrics.service";

@Controller("metrics")
export class MetricsController {
  constructor(private metrics: MetricsService) {}

  @Get()
  @Header("Content-Type", "text/plain; version=0.0.4")
  async getMetrics(): Promise<string> {
    return this.metrics.metricsText();
  }
}