import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

type User = { id: string; email: string; role: "admin" | "analyst" };

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  // Demo validation: accept any email with password "password"
  async validateUser(email: string, password: string): Promise<User> {
    if (!email || password !== "password") {
      throw new UnauthorizedException("Invalid credentials");
    }
    // In real impl: lookup user from DB
    return { id: "u_demo", email, role: "analyst" };
  }

  async sign(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwt.sign(payload);
  }
}