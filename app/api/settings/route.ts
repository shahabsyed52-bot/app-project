import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

const DEFAULT = { siteName: "Noha.Manqabat", adminPassword: "matammedia2024" };

async function read() {
  const { data } = await supabase.from("settings").select("value").eq("key","appSettings").single();
  return (data?.value as typeof DEFAULT) ?? DEFAULT;
}

export async function GET() {
  return NextResponse.json(await read());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const curr = await read();
    if (body.newPassword !== undefined) {
      if (body.oldPassword !== curr.adminPassword)
        return NextResponse.json({ error: "Wrong current password" }, { status: 401 });
      curr.adminPassword = body.newPassword;
    }
    if (body.siteName) curr.siteName = body.siteName;
    await supabase.from("settings").upsert({ key: "appSettings", value: curr });
    return NextResponse.json({ ok: true, settings: curr });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
