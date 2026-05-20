import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

const DEFAULT = { type: "video", value: "wTM0hT5EAFY" };

export async function GET() {
  const { data } = await supabase.from("settings").select("value").eq("key","hero").single();
  return NextResponse.json(data?.value ?? DEFAULT);
}

export async function POST(req: Request) {
  const body = await req.json();
  await supabase.from("settings").upsert({ key: "hero", value: body });
  return NextResponse.json({ ok: true });
}
