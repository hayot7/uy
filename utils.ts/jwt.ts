import jwt, { SignOptions, Secret, JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const SECRET: Secret = JWT_SECRET;

export function signToken(payload: object, expiresIn: SignOptions["expiresIn"] = "7d"): string {
  const opts: SignOptions = { expiresIn };
  return jwt.sign(payload as string | object | Buffer, SECRET, opts);
}

export function verifyToken<T = JwtPayload>(token: string): T {
  return jwt.verify(token, SECRET) as T;
}