import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const ALLOWED_STATUSES = ["present", "absent", "maybe"] as const;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId")?.trim();

    if (!eventId) {
      return NextResponse.json({ message: "eventId mancante." }, { status: 400 });
    }

    const { data, error } = await db
      .from("event_responses")
      .select("*")
      .eq("event_id", eventId)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json(
      { message: "Errore durante il caricamento delle risposte." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

const eventId = String(body.eventId || "").trim();
const rawName = String(body.name || "").trim();
const name = rawName.replace(/\s+/g, " ");
const normalizedName = name.toLowerCase();
const status = String(body.status || "").trim();
const note = String(body.note || "").trim();

    if (!eventId || !name || !status) {
      return NextResponse.json(
        { message: "eventId, name e status sono obbligatori." },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])) {
      return NextResponse.json({ message: "Status non valido." }, { status: 400 });
    }

    const { data: existing, error: existingError } = await db
      .from("event_responses")
      .select("*")
      .eq("event_id", eventId)
      .eq("name", name)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ message: existingError.message }, { status: 500 });
    }

    if (existing) {
      const { data, error } = await db
        .from("event_responses")
        .update({
          status,
          note: note || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, response: data });
    }

    const { data, error } = await db
      .from("event_responses")
      .insert({
        event_id: eventId,
        name,
        status,
        note: note || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, response: data });
  } catch {
    return NextResponse.json(
      { message: "Errore durante il salvataggio della risposta." },
      { status: 500 }
    );
  }
}
