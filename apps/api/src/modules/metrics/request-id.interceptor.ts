import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    let rid = req.headers["x-request-id"] as string | undefined;
    if (!rid) {
      // generate an id if missing
      rid = uuidv4();
    }
    // expose back to callers
    try {
      res.setHeader("X-Request-ID", rid);
    } catch {}
    // attach to request for downstream logs if needed
    req.requestId = rid;
    return next.handle();
  }
}