import { Injectable, LoggerService as NestLoggerService, Scope } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";

export const loggerStorage = new AsyncLocalStorage<{ correlationId: string }>();

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, ...optionalParams: any[]) {
    this.print("log", message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.print("error", message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.print("warn", message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    this.print("debug", message, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.print("verbose", message, ...optionalParams);
  }

  private print(level: string, message: any, ...optionalParams: any[]) {
    const store = loggerStorage.getStore();
    const logObject = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      correlationId: store?.correlationId || null,
      context: this.context || null,
      message,
      ...(optionalParams.length > 0 ? { details: optionalParams } : {}),
    };

    console[level](JSON.stringify(logObject));
  }
}
