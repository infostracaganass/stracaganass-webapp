import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin";
import { eventSchema } from "@/lib/utils";
import { sendOneSignalNotification } from "@/lib/onesignal";

export async function GET() {
  const { data, error } = await db.from("events").select("*").order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json({ message: "Non autorizzato." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Dati evento non validi." }, { status: 400 });
  }

  const { data, error } = await db.from("events").insert(parsed.data).select().single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  await sendOneSignalNotification("Nuovo evento Stracaganass", parsed.data.title);

  return NextResponse.json(data);
}
