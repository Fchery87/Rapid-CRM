import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private apiKey = process.env.API_KEY;

  canActivate(context: ExecutionContext): boolean {
    if (!this.apiKey) return true; // if not set, allow (demo)
    const req = context.switchToHttp().getRequest();
    const key = req.headers["x-api-key"] || req.headers["x-api_key"];
    if (typeof key === "string" && key === this.apiKey) return true;
    throw new UnauthorizedException("Invalid API key");
  }
}
