import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, finalize, tap } from "rxjs";
import { MetricsService } from "./metrics.service";

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const started = process.hrtime.bigint();
    const req = context.switchToHttp().getRequest();
    const method = (req?.method || "GET") as string;
    // Prefer route.path from Nest metadata if available, fallback to url
    const route = req?.route?.path || req?.originalUrl || req?.url || "unknown";

    return next.handle().pipe(
      finalize(() => {
        const res = context.switchToHttp().getResponse();
        const status = Number(res?.statusCode || 200);
        const end = process.hrtime.bigint();
        const duration = Number(end - started) / 1e9;
        try {
          this.metrics.incHttp(method, route, status, duration);
        } catch {
          // avoid throwing in interceptor
        }
      })
    );
  }
}