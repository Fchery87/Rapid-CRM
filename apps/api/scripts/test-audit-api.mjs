import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function assert(cond, msg) {
  if (!cond) throw new Error("Assertion failed: " + msg);
}

async function main() {
  console.log("Running Audit API validation (requires API on :4000 and seeded data)...");

  // Get a known seeded report
  const report = await prisma.creditReport.findFirst({
    where: { rawObjectKey: "seed/demo-report-1.html" },
    include: { tradelines: true, inquiries: true, publicRecords: true, bureaus: true }
  });

  if (!report) {
    console.warn("No seeded report found (seed/demo-report-1.html). Did you run pnpm demo:up?");
    process.exit(0); // don't fail CI; local validation only
  }

  // Call API
  const res = await fetch(`http://localhost:4000/api/audit/${report.id}`);
  assert(res.ok, `Audit API responded with status ${res.status}`);
  const data = await res.json();

  // Check scores exist for present bureaus
  const presentBureaus = new Set(report.bureaus.map((b) => b.bureau));
  if (presentBureaus.has("TU")) assert("TU" in data.kpis.scores, "Missing TU score in API");
  if (presentBureaus.has("EX")) assert("EX" in data.kpis.scores, "Missing EX score in API");
  if (presentBureaus.has("EQ")) assert("EQ" in data.kpis.scores, "Missing EQ score in API");

  // KPI counts should match normalized tables
  assert(data.kpis.counts.tradelines === report.tradelines.length, "Tradelines count mismatch");
  assert(data.kpis.counts.inquiries === report.inquiries.length, "Inquiries count mismatch");
  assert(data.kpis.counts.publicRecords === report.publicRecords.length, "Public records count mismatch");

  // Utilization overall check
  const withLimits = report.tradelines.filter((t) => t.balance != null && t.creditLimit != null && t.creditLimit > 0);
  const totalBalance = withLimits.reduce((acc, t) => acc + (t.balance || 0), 0);
  const totalLimit = withLimits.reduce((acc, t) => acc + (t.creditLimit || 0), 0);
  const expectedUtil = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;
  assert(
    data.utilization.overall.current === expectedUtil,
    `Overall utilization mismatch: expected ${expectedUtil}, got ${data.utilization.overall.current}`
  );

  // Negative items flags presence
  const hasLate = data.negativeItems.some((n) => n.flags.includes("late_payment"));
  const hasHighUtil = data.negativeItems.some((n) => n.flags.includes("high_utilization"));
  assert(hasLate, "Expected at least one negative item with late_payment");
  assert(hasHighUtil, "Expected at least one negative item with high_utilization");

  console.log("Audit API validation passed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });