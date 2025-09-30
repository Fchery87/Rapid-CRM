import { Controller, Param, Post } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { S3Service } from "../s3/s3.service";
import { chromium } from "playwright";

const WEB_URL = process.env.WEB_URL || "http://localhost:3000";

@Controller("pdfs")
export class PdfController {
  constructor(private prisma: PrismaService, private s3: S3Service) {}

  @Post(":reportId")
  async generate(@Param("reportId") reportId: string) {
    const report = await this.prisma.creditReport.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new Error("Report not found");
    }

    const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const url = `${WEB_URL}/audit/${reportId}`;

    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForSelector("h1:text(\"Simple Audit\")", { timeout: 15000 });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" }
    });

    await browser.close();

    const key = `pdfs/${reportId}.pdf`;
    await this.s3.putObject(key, pdfBuffer, "application/pdf");
    const downloadUrl = await this.s3.presignGet(key);

    return { ok: true, key, downloadUrl };
  }
}