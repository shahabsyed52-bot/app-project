"use client";
import { useEffect, useState } from "react";

interface Props {
  type: "video" | "image";
  value: string;
}

const OVERLAY = (
  <div style={{
    position:"absolute", inset:0, zIndex:2, pointerEvents:"none",
    background:"linear-gradient(to bottom,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.15) 45%,rgba(0,0,0,0.82) 100%)"
  }}/>
);

export default function HeroBg({ type, value }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !value) return null;

  /* ── Image ── */
  if (type === "image") return (
    <div style={{ position:"absolute", inset:0, zIndex:1, overflow:"hidden" }}>
      <img
        src={value}
        alt=""
        style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }}
      />
      {OVERLAY}
    </div>
  );

  /* ── YouTube video ─────────────────────────────────────────────────
     Key trick: wrap in a box bigger than viewport so it always fills
     the screen regardless of aspect ratio, on any device.
  ─────────────────────────────────────────────────────────────────── */
  const src = [
    `https://www.youtube-nocookie.com/embed/${value}`,
    "?autoplay=1&mute=1&loop=1",
    `&playlist=${value}`,
    "&controls=0&disablekb=1&fs=0",
    "&iv_load_policy=3&modestbranding=1",
    "&playsinline=1&rel=0&showinfo=0",
  ].join("");

  return (
    <div style={{ position:"absolute", inset:0, zIndex:1, overflow:"hidden", background:"#000" }}>
      {/* Outer box: full viewport */}
      <div style={{
        position:"absolute",
        /* always bigger than viewport — covers any screen / aspect ratio */
        top:"50%", left:"50%",
        width:"max(100vw, 177.8vh)",
        height:"max(100vh, 56.3vw)",
        transform:"translate(-50%,-50%)",
        pointerEvents:"none",
      }}>
        <iframe
          src={src}
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{ width:"100%", height:"100%", border:"none", display:"block" }}
          title="hero-bg"
        />
      </div>
      {OVERLAY}
    </div>
  );
}
