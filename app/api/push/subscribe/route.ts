import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();

  const { error } = await db.from("push_subscribers").insert({
    subscription: body.subscription ?? null,
    user_agent: body.userAgent ?? null,
    platform: body.platform ?? null,
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
