import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

type LoginDto = {
  email: string;
  password: string;
};

@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post("login")
  @HttpCode(200)
  async login(@Body() body: LoginDto) {
    const user = await this.auth.validateUser(body.email, body.password);
    const token = await this.auth.sign(user);
    return { token, user: { email: user.email, role: user.role } };
  }
}