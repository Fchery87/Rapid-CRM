import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../auth/jwt.guard";

@UseGuards(JwtAuthGuard)
@Controller("pdfs/jobs")
export class PdfJobsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list(
    @Query("reportId") reportId?: string,
    @Query("status") status?: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED",
    @Query("type") type?: "AUDIT" | "LETTER" | "LETTERS_BATCH",
    @Query("limit") limit?: string
  ) {
    const take = Math.min(Number(limit) || 50, 200);
    const where: any = {};
    if (reportId) where.reportId = reportId;
    if (status) where.status = status;
    if (type) where.type = type;

    const jobs = await this.prisma.pdfJob.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take
    });

    return jobs.map((j) => ({
      id: j.id,
      bullId: j.bullId,
      type: j.type,
      reportId: j.reportId,
      bureau: j.bureau,
      status: j.status,
      resultKey: j.resultKey,
      zipKey: j.zipKey,
      callbackUrl: j.callbackUrl,
      error: j.error,
      createdAt: j.createdAt,
      updatedAt: j.updatedAt
    }));
  }
}