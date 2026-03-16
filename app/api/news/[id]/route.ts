import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json({ message: "Non autorizzato." }, { status: 401 });
  }

  const { id } = await context.params;
  const { error } = await db.from("news").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
