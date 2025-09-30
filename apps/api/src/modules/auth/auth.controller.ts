import { Body, Controller, HttpCode, Post } from "@nestjs/common";

type LoginDto = {
  email: string;
  password: string;
};

@Controller("auth")
export class AuthController {
  @Post("login")
  @HttpCode(200)
  login(@Body() body: LoginDto) {
    // Skeleton only: no real authentication; returns a placeholder token
    const { email } = body;
    return {
      token: "dev-token",
      user: { email }
    };
  }
}