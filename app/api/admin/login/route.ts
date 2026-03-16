import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ message: "Password non corretta." }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true, admin: true });
}
