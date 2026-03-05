import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { HttpStatus, ResponseTemplate } from "shared";

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(HttpStatus.BAD_REQUEST.code)
      .send(
        new ResponseTemplate(
          HttpStatus.BAD_REQUEST.code,
          HttpStatus.BAD_REQUEST.status,
          HttpStatus.BAD_REQUEST.description,
          errors.array(),
        ),
      );
  }
  next();
};
