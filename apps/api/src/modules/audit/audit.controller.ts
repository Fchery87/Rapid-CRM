import { Controller, Get, Param } from "@nestjs/common";
import { AuditService } from "./audit.service";

@Controller("audit")
export class AuditController {
  constructor(private audit: AuditService) {}

  @Get(":id")
  async get(@Param("id") id: string) {
    return this.audit.getAudit(id);
  }
}