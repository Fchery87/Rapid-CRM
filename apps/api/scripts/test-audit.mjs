import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function assert(cond, msg) {
  if (!cond) {
    throw new Error("Assertion failed: " + msg);
  }
}

async function main() {
  console.log("Running Audit computation validation (seeded data required)...");

  const report = await prisma.creditReport.findFirst({
    where: { rawObjectKey: "seed/demo-report-1.html" },
    include: { tradelines: true, inquiries: true, publicRecords: true, bureaus: true }
  });

  if (!report) {
    console.warn("No seeded report found (seed/demo-report-1.html). Did you run pnpm demo:up?");
    process.exit(0); // don't fail CI; local validation only
  }

  // KPI checks
  assert(report.tradelines.length === 3, "Expected 3 tradelines");
  assert(report.inquiries.length === 2, "Expected 2 inquiries");
  assert(report.publicRecords.length === 1, "Expected 1 public record");

  // Utilization check: (1200 + 50 + 2800) / (3000 + 5000 + 3000) = 4050/11000 ≈ 36.82 -> 37
  const withLimits = report.tradelines.filter((t) => t.balance != null && t.creditLimit != null && t.creditLimit > 0);
  const totalBalance = withLimits.reduce((acc, t) => acc + (t.balance || 0), 0);
  const totalLimit = withLimits.reduce((acc, t) => acc + (t.creditLimit || 0), 0);
  const util = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;
  assert(util === 37, `Expected overall utilization 37, got ${util}`);

  // Negative items flags present
  const anyLatePayment = report.tradelines.some((t) => (t.issues || []).includes("late_payment"));
  const anyHighUtil = report.tradelines.some((t) => (t.issues || []).includes("high_utilization") || (t.utilization || 0) >= 90);
  assert(anyLatePayment, "Expected a tradeline with late_payment");
  assert(anyHighUtil, "Expected a tradeline with high_utilization");

  console.log("Audit computation validation passed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });