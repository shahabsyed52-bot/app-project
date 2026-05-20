import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

const BUCKET = "videos";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const ext   = file.name.split(".").pop()?.toLowerCase() || "mp4";
    const fname = `${Date.now()}.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fname, bytes, { contentType: file.type, upsert: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fname);

    return NextResponse.json({ ok: true, url: urlData.publicUrl, name: fname, size: file.size });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function GET() {
  try {
    const { data, error } = await supabase.storage.from(BUCKET).list("", { sortBy: { column: "created_at", order: "desc" } });
    if (error) return NextResponse.json([]);
    const files = (data || []).filter(f => !f.name.startsWith(".")).map(f => ({
      name: f.name,
      url:  supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
      size: f.metadata?.size || 0,
    }));
    return NextResponse.json(files);
  } catch { return NextResponse.json([]); }
}

export async function DELETE(req: Request) {
  try {
    const name = new URL(req.url).searchParams.get("name") || "";
    await supabase.storage.from(BUCKET).remove([name]);
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
