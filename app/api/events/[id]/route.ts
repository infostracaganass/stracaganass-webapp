import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin";
import { eventSchema } from "@/lib/utils";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const isAdmin = await isAdminAuthenticated();

  if (!isAdmin) {
    return NextResponse.json({ message: "Non autorizzato." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Dati evento non validi." }, { status: 400 });
  }

  const { data, error } = await db
    .from("events")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json({ message: "Non autorizzato." }, { status: 401 });
  }

  const { id } = await context.params;
  const { error } = await db.from("events").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
