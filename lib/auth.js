import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export function getTokenFromHeader(req) {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  return auth.split(" ")[1];
}

export function isAdmin(req) {
  const token = getTokenFromHeader(req);
  if (!token) return false;
  const decoded = verifyToken(token);
  return !!decoded;
}
