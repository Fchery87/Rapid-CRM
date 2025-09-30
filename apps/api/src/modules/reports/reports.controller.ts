import { Controller, Get, Query } from "@nestjs/common";
import { AuditService } from "../audit/audit.service";

@Controller("reports")
export class ReportsController {
  constructor(private audit: AuditService) {}

  @Get()
  async list(@Query("limit") limit?: string) {
    const n = limit ? Math.max(1, Math.min(100, Number(limit))) : 20;
    return this.audit.listRecentReports(n);
  }
}