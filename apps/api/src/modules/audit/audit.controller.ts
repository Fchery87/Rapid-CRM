import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { JwtAuthGuard } from "../auth/jwt.guard";

@UseGuards(JwtAuthGuard)
@Controller("audit")
export class AuditController {
  constructor(private audit: AuditService) {}

  @Get(":id")
  async get(@Param("id") id: string) {
    return this.audit.getAudit(id);
  }
}