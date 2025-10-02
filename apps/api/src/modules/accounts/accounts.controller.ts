import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../auth/jwt.guard";

type EnsureAccountDto = { name: string };

@UseGuards(JwtAuthGuard)
@Controller("accounts")
export class AccountsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(200)
  async ensure(@Body() body: EnsureAccountDto) {
    if (!body.name) throw new Error("Missing name");
    const acc = await this.prisma.account.upsert({
      where: { name: body.name },
      create: { name: body.name },
      update: {}
    });
    return acc;
  }

  @Get(":id")
  async get(@Param("id") id: string) {
    return this.prisma.account.findUnique({ where: { id } });
  }
}