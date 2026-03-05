import { status, Metadata, ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import jwt, { JwtPayload } from "jsonwebtoken";

export type Roles = "Admin" | "Customer" | "Supplier" | "Guess";

export type AuthedUser = {
  sub: string;
  roles: Roles[];
};

type AuthedUnaryCall<Req, Res> = ServerUnaryCall<Req, Res> & { context?: CallContext };
type UnaryHandler<Req, Res> = (
  call: AuthedUnaryCall<Req, Res>,
  callback: sendUnaryData<Res>,
) => void;

type UnaryInterceptor<Req, Res> = (
  call: AuthedUnaryCall<Req, Res>,
  callback: sendUnaryData<Res>,
  next: () => void,
) => void;

export type CallContext = {
  user?: AuthedUser;
};

const JWT_SECRET: string = process.env.JWT_SECRET ?? "dev-secret";

type JwtClaims = JwtPayload & {
  sub?: string;
  roles?: unknown;
};

function isJwtClaims(payload: unknown): payload is JwtClaims {
  return typeof payload === "object" && payload !== null;
}

export function getBearerToken(md: Metadata): string | null {
  const raw = md.get("authorization")[0];
  if (!raw || typeof raw !== "string") return null;

  const m = raw.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

export function verifyJwt(token: string): AuthedUser {
  const payload = jwt.verify(token, JWT_SECRET);

  if (!isJwtClaims(payload)) {
    throw new Error("Invalid JWT payload");
  }

  const sub = typeof payload.sub === "string" ? payload.sub : String(payload.sub ?? "");
  const rolesRaw = payload.roles;

  return {
    sub,
    roles: Array.isArray(rolesRaw)
      ? rolesRaw.filter((role): role is Roles =>
          role === "Admin" || role === "Customer" || role === "Supplier" || role === "Guess",
        )
      : [],
  };
}

export function requiredRoles(required: Roles[]) {
  return (user?: AuthedUser) => {
    if (!user) return false;
    const roles = user.roles ?? [];
    return required.some((role) => roles.includes(role));
  };
}

export const authUnaryInterceptor = (roles: Roles[]) => {
  const rolecheck = requiredRoles(roles);

  return function <Req, Res>(
    call: ServerUnaryCall<Req, Res> & { context?: CallContext },
    callback: sendUnaryData<Res>,
    next: () => void,
  ) {
    try {
      const token = getBearerToken(call.metadata);
      if (!token) {
        callback({ code: status.UNAUTHENTICATED, message: "Missing bearer token" });
        return;
      }

      const user = verifyJwt(token);
      call.context = { ...(call.context ?? {}), user };

      if (!rolecheck(user)) {
        callback({
          code: status.PERMISSION_DENIED,
          message: "Insufficient permissions",
        });
        return;
      }
      next();
    } catch {
      callback({
        code: status.UNAUTHENTICATED,
        message: "Invalid token",
      });
    }
  };
};

export function wrapUnary<Req, Res>(
  handler: UnaryHandler<Req, Res>,
  interceptor: UnaryInterceptor<Req, Res>,
): UnaryHandler<Req, Res> {
  return (call, callback) => {
    interceptor(call, callback, () => handler(call, callback));
  };
}
