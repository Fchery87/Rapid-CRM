import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function seedReportDetails(reportId, variant = 1) {
  // Tradelines with reported bureaus
  await prisma.tradeline.create({
    data: {
      creditReportId: reportId,
      creditorName: "Capital One",
      balance: 1200,
      creditLimit: 3000,
      utilization: 40,
      isNegative: variant === 1,
      issues: variant === 1 ? ["late_payment"] : [],
      reportedBureaus: ["TU", "EX"],
      openedDate: daysAgo(400)
    }
  });
  await prisma.tradeline.create({
    data: {
      creditReportId: reportId,
      creditorName: "Chase",
      balance: 50,
      creditLimit: 5000,
      utilization: 1,
      isNegative: false,
      issues: [],
      reportedBureaus: ["EQ"],
      openedDate: daysAgo(800)
    }
  });
  await prisma.tradeline.create({
    data: {
      creditReportId: reportId,
      creditorName: "Discover",
      balance: 2800,
      creditLimit: 3000,
      utilization: 93,
      isNegative: true,
      issues: ["high_utilization"],
      reportedBureaus: ["TU", "EQ"],
      openedDate: daysAgo(200)
    }
  });

  // Inquiries
  await prisma.inquiry.create({
    data: {
      creditReportId: reportId,
      name: "Car Loan Co",
      date: daysAgo(15),
      hard: true
    }
  });
  await prisma.inquiry.create({
    data: {
      creditReportId: reportId,
      name: "Credit Card Offer",
      date: daysAgo(30),
      hard: false
    }
  });

  // Public records
  if (variant === 1) {
    await prisma.publicRecord.create({
      data: {
        creditReportId: reportId,
        kind: "tax_lien",
        description: "County tax lien",
        date: daysAgo(900),
        isNegative: true
      }
    });
  }

  // Personal info per bureau (introduce small inconsistencies)
  await prisma.personalInfo.createMany({
    data: [
      { creditReportId: reportId, bureau: "TU", name: "Alex Q. Doe", ssnLast4: "1234", dob: "1990-01-01", addressLine: "123 Main St", city: "Austin", state: "TX", postal: "78701" },
      { creditReportId: reportId, bureau: "EX", name: "Alex Doe", ssnLast4: "1234", dob: "1990-01-01", addressLine: "123 Main Street", city: "Austin", state: "TX", postal: "78701" },
      { creditReportId: reportId, bureau: "EQ", name: "Alex Q Doe", ssnLast4: "1234", dob: "1990-01-01", addressLine: "125 Main St", city: "Austin", state: "TX", postal: "78701" }
    ],
    skipDuplicates: true
  });
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

  await seedReportDetails(report1.id, 1);
  await seedReportDetails(report2.id, 2);

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