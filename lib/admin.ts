import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "straca_admin_session";

function sign(value: string) {
  const secret = process.env.ADMIN_COOKIE_SECRET || "fallback-secret";
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export async function createAdminSession() {
  const token = `admin:${Date.now()}`;
  const signature = sign(token);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, `${token}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return false;

  const [token, signature] = value.split(".");
  if (!token || !signature) return false;

  return sign(token) === signature;
}
