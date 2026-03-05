import { Request, Response, NextFunction } from "express";
import { httpRequestDuration, httpRequestsTotal } from "shared";

export const metricsMiddleware = (serviceName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    res.on("finish", () => {
      const duration = (Date.now() - start) / 1000;
      const labels = {
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode.toString(),
        service: serviceName,
      };

      httpRequestDuration.observe(labels, duration);
      httpRequestsTotal.inc(labels);
    });

    next();
  };
};
