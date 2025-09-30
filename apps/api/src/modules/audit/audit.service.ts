import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

type AuditDTO = {
  id: string;
  accountId: string;
  vendor: string;
  reportDate: string;
  kpis: {
    scores: { TU?: number | null; EX?: number | null; EQ?: number | null };
    counts: { tradelines: number; inquiries: number; publicRecords: number };
  };
  negativeItems: Array<{
    id: string;
    account: string;
    issue: string;
    priority: "P1" | "P2" | "P3";
    flags: string[];
    bureauDates: { TU?: string; EX?: string; EQ?: string };
  }>;
  utilization: {
    overall: { current: number; target: number; delta: number };
    byBureau: { TU?: number; EX?: number; EQ?: number };
  };
  personalInfoIssues: Array<{ field: string; value: string; risk: "low" | "medium" | "high" }>;
  duplicates: Array<{ description: string; bureaus: ("TU" | "EX" | "EQ")[] }>;
};

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async getAudit(reportId: string): Promise<AuditDTO> {
    const report = await this.prisma.creditReport.findUnique({
      where: { id: reportId },
      include: { account: true, bureaus: true }
    });
    if (!report) throw new NotFoundException("Report not found");

    // For now, use whatever data exists; scores likely null in V1 stubs
    const scores: Record<string, number | null | undefined> = {};
    for (const b of report.bureaus) {
      scores[b.bureau] = b.score ?? null;
    }

    // Placeholders for counts until normalized tables exist
    const kpis = {
      scores: { TU: scores["TU"] ?? null, EX: scores["EX"] ?? null, EQ: scores["EQ"] ?? null },
      counts: { tradelines: 0, inquiries: 0, publicRecords: 0 }
    };

    // Placeholder negative items and utilization; will be populated once parser normalizes data
    const negativeItems: AuditDTO["negativeItems"] = [];
    const utilization: AuditDTO["utilization"] = {
      overall: { current: 0, target: 10, delta: -10 },
      byBureau: { TU: 0, EX: 0, EQ: 0 }
    };
    const personalInfoIssues: AuditDTO["personalInfoIssues"] = [];
    const duplicates: AuditDTO["duplicates"] = [];

    return {
      id: report.id,
      accountId: report.accountId,
      vendor: report.vendor,
      reportDate: report.reportDate.toISOString(),
      kpis,
      negativeItems,
      utilization,
      personalInfoIssues,
      duplicates
    };
  }

  async listRecentReports(limit = 20) {
    const reports = await this.prisma.creditReport.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { account: true }
    });
    return reports.map((r) => ({
      id: r.id,
      accountId: r.accountId,
      accountName: r.account?.name ?? "",
      vendor: r.vendor,
      reportDate: r.reportDate.toISOString(),
      createdAt: r.createdAt.toISOString()
    }));
  }
}