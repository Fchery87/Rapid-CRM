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
      include: { account: true, bureaus: true, tradelines: true, inquiries: true, publicRecords: true }
    });
    if (!report) throw new NotFoundException("Report not found");

    // Scores from BureauReport
    const scores: Record<string, number | null | undefined> = {};
    for (const b of report.bureaus) {
      scores[b.bureau] = b.score ?? null;
    }

    // KPI counts from normalized tables
    const kpis = {
      scores: { TU: scores["TU"] ?? null, EX: scores["EX"] ?? null, EQ: scores["EQ"] ?? null },
      counts: {
        tradelines: report.tradelines.length,
        inquiries: report.inquiries.length,
        publicRecords: report.publicRecords.length
      }
    };

    // Utilization computation
    const withLimits = report.tradelines.filter((t) => t.balance != null && t.creditLimit != null && t.creditLimit! > 0);
    const totalBalance = withLimits.reduce((acc, t) => acc + (t.balance || 0), 0);
    const totalLimit = withLimits.reduce((acc, t) => acc + (t.creditLimit || 0), 0);
    const currentUtil = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;
    const target = 10;

    // Per-bureau utilization using reportedBureaus attribution when available; fallback to overall
    const byBureau: { TU?: number; EX?: number; EQ?: number } = {};
    const bureaus: Array<"TU" | "EX" | "EQ"> = ["TU", "EX", "EQ"];
    for (const b of bureaus) {
      const tForBureau = withLimits.filter((t) => Array.isArray(t.reportedBureaus) && t.reportedBureaus.includes(b));
      if (tForBureau.length) {
        const bal = tForBureau.reduce((acc, t) => acc + (t.balance || 0), 0);
        const lim = tForBureau.reduce((acc, t) => acc + (t.creditLimit || 0), 0);
        byBureau[b] = lim > 0 ? Math.round((bal / lim) * 100) : 0;
      } else {
        // Fallback only if bureau exists on the report
        const present = report.bureaus.some((br) => br.bureau === b);
        if (present) byBureau[b] = currentUtil;
      }
    }

    const utilization = {
      overall: { current: currentUtil, target, delta: currentUtil - target },
      byBureau
    };

    // Negative items from tradelines and public records
    const negativeItems: AuditDTO["negativeItems"] = [];

    for (const t of report.tradelines) {
      const flags: string[] = [];
      const issues = t.issues || [];
      if (issues.includes("high_utilization") || (t.utilization != null && t.utilization >= 90)) flags.push("high_utilization");
      if (issues.includes("late_payment")) flags.push("late_payment");
      if (issues.includes("charge_off")) flags.push("charge_off");

      if (t.isNegative || flags.length > 0) {
        let priority: "P1" | "P2" | "P3" = "P3";
        if (flags.includes("charge_off") || flags.includes("high_utilization")) priority = "P1";
        else if (flags.includes("late_payment")) priority = "P2";

        negativeItems.push({
          id: `tl_${t.id}`,
          account: t.creditorName,
          issue: issues.length ? issues.join(", ") : "negative tradeline",
          priority,
          flags,
          bureauDates: {}
        });
      }
    }

    for (const pr of report.publicRecords) {
      if (pr.isNegative) {
        negativeItems.push({
          id: `pr_${pr.id}`,
          account: pr.kind,
          issue: pr.description || pr.kind,
          priority: "P1",
          flags: ["public_record"],
          bureauDates: {}
        });
      }
    }

    // Placeholders (no personal info table yet, no cross-bureau duplicates without bureau attribution)
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