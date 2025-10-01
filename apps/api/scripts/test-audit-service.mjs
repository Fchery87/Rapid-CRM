/* eslint-disable no-console */
import { AuditService } from "../src/modules/audit/audit.service.js";

// Minimal mock PrismaService for AuditService.getAudit
class MockPrisma {
  constructor(fixtures) {
    this._fixtures = fixtures;
  }

  creditReport = {
    findUnique: async ({ where }) => {
      const r = this._fixtures.reports.find((x) => x.id === where.id);
      if (!r) return null;
      return {
        ...r,
        reportDate: new Date(r.reportDate),
        createdAt: new Date(),
        account: { id: r.accountId, name: "Demo Account" },
        bureaus: r.bureaus,
        tradelines: r.tradelines,
        inquiries: r.inquiries,
        publicRecords: r.publicRecords
      };
    }
  };

  personalInfo = {
    findMany: async ({ where }) => {
      return this._fixtures.personalInfo.filter((p) => p.creditReportId === where.creditReportId);
    }
  };
}

function assertEqual(actual, expected, msg) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.error("Assertion failed:", msg, "\nExpected:", expected, "\nActual:", actual);
    process.exit(1);
  }
}

function assert(cond, msg) {
  if (!cond) {
    console.error("Assertion failed:", msg);
    process.exit(1);
  }
}

async function main() {
  const reportId = "r1";
  const fixtures = {
    reports: [
      {
        id: reportId,
        accountId: "acct1",
        vendor: "demo-vendor",
        reportDate: "2024-09-20T00:00:00.000Z",
        bureaus: [
          { id: "b1", creditReportId: reportId, bureau: "TU", score: 688, createdAt: new Date() },
          { id: "b2", creditReportId: reportId, bureau: "EX", score: 701, createdAt: new Date() },
          { id: "b3", creditReportId: reportId, bureau: "EQ", score: 695, createdAt: new Date() }
        ],
        tradelines: [
          {
            id: "t1",
            creditReportId: reportId,
            creditorName: "Capital One",
            balance: 1200,
            creditLimit: 3000,
            utilization: 40,
            isNegative: true,
            issues: ["late_payment"],
            reportedBureaus: ["TU", "EX"],
            openedDate: new Date("2023-01-01"),
            closedDate: null
          },
          {
            id: "t2",
            creditReportId: reportId,
            creditorName: "Chase",
            balance: 50,
            creditLimit: 5000,
            utilization: 1,
            isNegative: false,
            issues: [],
            reportedBureaus: ["EQ"],
            openedDate: new Date("2022-01-01"),
            closedDate: null
          },
          {
            id: "t3",
            creditReportId: reportId,
            creditorName: "Discover",
            balance: 2800,
            creditLimit: 3000,
            utilization: 93,
            isNegative: true,
            issues: ["high_utilization"],
            reportedBureaus: ["TU", "EQ"],
            openedDate: new Date("2024-01-01"),
            closedDate: null
          }
        ],
        inquiries: [
          { id: "i1", creditReportId: reportId, name: "Car Loan Co", date: new Date("2024-09-01"), hard: true },
          { id: "i2", creditReportId: reportId, name: "Credit Card Offer", date: new Date("2024-08-15"), hard: false }
        ],
        publicRecords: [{ id: "p1", creditReportId: reportId, kind: "tax_lien", description: "County tax lien", date: new Date("2022-06-01"), isNegative: true }]
      }
    ],
    personalInfo: [
      { id: "pi1", creditReportId: reportId, bureau: "TU", name: "Alex Q. Doe", ssnLast4: "1234", dob: "1990-01-01", addressLine: "123 Main St", city: "Austin", state: "TX", postal: "78701", createdAt: new Date() },
      { id: "pi2", creditReportId: reportId, bureau: "EX", name: "Alex Doe", ssnLast4: "1234", dob: "1990-01-01", addressLine: "123 Main Street", city: "Austin", state: "TX", postal: "78701", createdAt: new Date() },
      { id: "pi3", creditReportId: reportId, bureau: "EQ", name: "Alex Q Doe", ssnLast4: "1234", dob: "1990-01-01", addressLine: "125 Main St", city: "Austin", state: "TX", postal: "78701", createdAt: new Date() }
    ]
  };

  const prisma = new MockPrisma(fixtures);
  const service = new AuditService(prisma);

  const audit = await service.getAudit(reportId);

  // KPIs: bureau scores
  assertEqual(audit.kpis.scores, { TU: 688, EX: 701, EQ: 695 }, "KPI scores");

  // KPI counts
  assertEqual(audit.kpis.counts, { tradelines: 3, inquiries: 2, publicRecords: 1 }, "KPI counts");

  // Utilization: overall
  // With limits: t1 (1200/3000), t2 (50/5000), t3 (2800/3000) => total bal=4050, limit=11000 -> 36.8 => 37
  assert(audit.utilization.overall.current === 37, "Overall utilization should be 37%");
  assert(audit.utilization.overall.target === 10, "Target utilization 10%");
  assert(audit.utilization.overall.delta === 27, "Delta utilization 27%");

  // Per-bureau via reportedBureaus
  // TU: t1(1200/3000), t3(2800/3000) -> 4000/6000 = 67%
  // EX: t1(1200/3000) -> 40%
  // EQ: t2(50/5000), t3(2800/3000) -> 2850/8000 = 36%
  assertEqual(audit.utilization.byBureau, { TU: 67, EX: 40, EQ: 36 }, "Per-bureau utilization");

  // Negative items priority flags
  const flags = audit.negativeItems.reduce((acc, n) => acc.concat(n.flags), []);
  assert(flags.includes("late_payment"), "Negative items include late_payment");
  assert(flags.includes("high_utilization"), "Negative items include high_utilization");
  const p1 = audit.negativeItems.find((n) => n.priority === "P1");
  const p2 = audit.negativeItems.find((n) => n.priority === "P2");
  assert(p1 && p2, "Should have P1 and P2 priorities");

  // Personal info issues should be present for name/address differences
  assert(audit.personalInfoIssues.length > 0, "Personal info issues present");
  const hasName = audit.personalInfoIssues.some((i) => i.field === "name");
  const hasAddress = audit.personalInfoIssues.some((i) => i.field === "addressLine");
  assert(hasName && hasAddress, "Includes name and address issues");

  // Duplicates: tradelines with multiple reportedBureaus present
  assert(audit.duplicates.length >= 1, "Duplicates present");
  const dupe = audit.duplicates.find((d) => d.description.includes("appears on multiple bureaus"));
  assert(dupe, "Found duplicate tradeline across bureaus");

  console.log("AuditService unit tests passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});