import { Response, Request, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';


export function assignAnonymousId(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.cookies?.anonymousId) {
    req.anonymousId = req.cookies.anonymousId;
  } else {
    const id = uuidv4();

    res.cookie('anonymousId', id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    });
    req.anonymousId = id;
  }

  next();
}
