import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  root() {
    return { status: "ok" };
  }

  @Get("db")
  async db() {
    // simple query to validate DB connectivity
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: "ok", db: "connected" };
  }
}