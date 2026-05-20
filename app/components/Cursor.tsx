"use client";
import { useEffect, useRef } from "react";

export default function Cursor() {
  const curRef = useRef<HTMLDivElement>(null);
  const folRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let fx = window.innerWidth/2, fy = window.innerHeight/2, rafId: number;

    const onMove = (e: MouseEvent) => {
      if (curRef.current) {
        curRef.current.style.left = e.clientX + "px";
        curRef.current.style.top  = e.clientY + "px";
      }
      fx += (e.clientX - fx) * 0.14;
      fy += (e.clientY - fy) * 0.14;
    };

    const loop = () => {
      if (folRef.current) {
        folRef.current.style.left = fx + "px";
        folRef.current.style.top  = fy + "px";
      }
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    loop();

    const addHover = () => {
      document.querySelectorAll("a,button,[data-hover]").forEach(el => {
        el.addEventListener("mouseenter", () => {
          curRef.current?.classList.add("cursor-hover");
          folRef.current?.classList.add("follower-hover");
        });
        el.addEventListener("mouseleave", () => {
          curRef.current?.classList.remove("cursor-hover");
          folRef.current?.classList.remove("follower-hover");
        });
      });
    };
    addHover();
    const obs = new MutationObserver(addHover);
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
      obs.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={curRef}  className="cursor" />
      <div ref={folRef} className="cursor-follower" />
    </>
  );
}
