"use client";
import { useEffect, useState } from "react";

const LINKS = [
  ["noha-khan","Artists"],["videos","Videos"],["manqabat","Manqabat"],
  ["majlis","Majlis"],["lyrics","Lyrics"],["contact","Contact"],
];

interface Props {
  onAdmin: () => void;
  siteName: string;
  isAdmin: boolean;
  onLogoClick?: () => void;
}

export default function Navbar({ onAdmin, siteName, isAdmin, onLogoClick }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);
  const parts = siteName.split(".");
  const n1 = parts[0] ?? "Noha";
  const n2 = parts[1] ?? "Manqabat";

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 60);
  };

  return (
    <>
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-logo" onClick={onLogoClick ?? (() => window.scrollTo({ top:0, behavior:"smooth" }))} style={{ cursor:"pointer" }} data-hover>
          {n1}<span>.</span>{n2}
        </div>
        <div className="nav-links">
          {LINKS.map(([id,label]) => (
            <button key={id} className="nav-link" onClick={() => go(id)} data-hover>{label}</button>
          ))}
          {/* Admin button — only visible when isAdmin */}
          {isAdmin && (
            <button className="nav-btn" onClick={onAdmin} data-hover>Admin</button>
          )}
        </div>
        <button className="mob-menu-btn" onClick={() => setOpen(true)} aria-label="Menu" data-hover>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </nav>

      <div className={`mob-drawer-overlay ${open?"open":""}`} onClick={() => setOpen(false)}/>
      <div className={`mob-drawer ${open?"open":""}`}>
        <div className="mob-drawer-top">
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1rem" }}>
            {n1}<span style={{ color:"var(--red)" }}>.</span>{n2}
          </span>
          <button className="mob-drawer-close" onClick={() => setOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        {LINKS.map(([id,label]) => (
          <button key={id} className="mob-drawer-link" onClick={() => go(id)}>{label}</button>
        ))}
        {/* Admin in drawer — only when isAdmin */}
        {isAdmin && (
          <button className="mob-drawer-admin" onClick={() => { setOpen(false); onAdmin(); }}>
            Admin Panel
          </button>
        )}
      </div>
    </>
  );
}
