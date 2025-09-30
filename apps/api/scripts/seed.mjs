import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log("Seeding demo data...");

  // Ensure a demo account
  const account = await prisma.account.upsert({
    where: { name: "Demo Account" },
    create: { name: "Demo Account" },
    update: {}
  });

  // Create two demo reports
  const report1 = await prisma.creditReport.create({
    data: {
      accountId: account.id,
      vendor: "demo-vendor",
      reportDate: daysAgo(7),
      rawObjectKey: "seed/demo-report-1.html",
      bureaus: {
        create: [
          { bureau: "TU", score: 688 },
          { bureau: "EX", score: 701 },
          { bureau: "EQ", score: 695 }
        ]
      }
    }
  });

  const report2 = await prisma.creditReport.create({
    data: {
      accountId: account.id,
      vendor: "demo-vendor",
      reportDate: daysAgo(1),
      rawObjectKey: "seed/demo-report-2.html",
      bureaus: {
        create: [
          { bureau: "TU", score: 702 },
          { bureau: "EX", score: 709 },
          { bureau: "EQ", score: 698 }
        ]
      }
    }
  });

  console.log("Seed complete.", { account: account.name, reports: [report1.id, report2.id] });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });