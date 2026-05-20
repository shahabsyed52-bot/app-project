import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const videos = (data || []).map(v => ({
    id:          v.id,
    title:       v.title,
    youtubeId:   v.youtube_id,
    category:    v.category,
    artist:      v.artist,
    year:        v.year,
    description: v.description,
    fileUrl:     v.file_url,
  }));
  return NextResponse.json(videos);
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const { data, error } = await supabase
      .from("videos")
      .insert({
        title:       b.title,
        youtube_id:  b.youtubeId || "",
        category:    b.category,
        artist:      b.artist || "",
        year:        b.year || 2025,
        description: b.description || "",
        file_url:    b.fileUrl || "",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      ok: true,
      video: {
        id: data.id, title: data.title, youtubeId: data.youtube_id,
        category: data.category, artist: data.artist, year: data.year,
        description: data.description, fileUrl: data.file_url,
      },
    });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    const { error } = await supabase.from("videos").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
