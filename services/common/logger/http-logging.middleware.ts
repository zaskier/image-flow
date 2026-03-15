import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { LoggerService, loggerStorage } from "./logger.service";
import { randomUUID } from "crypto";

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext("HTTP");
  }

  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = (req.headers["x-correlation-id"] as string) || randomUUID();

    loggerStorage.run({ correlationId }, () => {
      const { ip, method, originalUrl } = req;
      const userAgent = req.get("user-agent") || "";

      res.on("finish", () => {
        const { statusCode } = res;
        this.logger.log(
          `${method} ${originalUrl} ${statusCode} - ${userAgent} ${ip}`,
        );
      });

      next();
    });
  }
}
