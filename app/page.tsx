"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Navbar     from "./components/Navbar";
import VideoModal from "./components/VideoModal";
import AdminPanel from "./components/AdminPanel";

const ThreeCanvas = dynamic(() => import("./components/ThreeCanvas"), { ssr: false });
const Cursor      = dynamic(() => import("./components/Cursor"),      { ssr: false });
const HeroBg      = dynamic(() => import("./components/HeroBg"),      { ssr: false });

type Video    = { id:string; title:string; youtubeId:string; category:string; artist:string; year:number; description?:string };
type Hero     = { type:"video"|"image"; value:string };
type Settings = { siteName:string; adminPassword:string };
type Lyric    = { id:string; title:string; artist:string; category:string; script:string; lyrics:string };

const ARTISTS = [
  { id:"nadeem-sarwar", name:"Nadeem Sarwar", role:"Noha Khan", desc:"The most iconic voice in Azadari — new nohay every Muharram." },
  { id:"mir-hasan-mir", name:"Mir Hasan Mir", role:"Noha Khan", desc:"Soulful recitations that bring Karbala to life with raw emotion." },
  { id:"ali-shanawar",  name:"Ali Shanawar",  role:"Noha Khan", desc:"Powerful nohay that resonate deeply with the Azadar community." },
  { id:"shadman-raza",  name:"Shadman Raza",  role:"Noha Khan", desc:"Moving elegies dedicated to Ahle Bait with heartfelt devotion." },
];
const FILTERS = [
  { id:"all",           label:"All"           },
  { id:"nadeem-sarwar", label:"Nadeem Sarwar" },
  { id:"mir-hasan-mir", label:"Mir Hasan Mir" },
  { id:"ali-shanawar",  label:"Ali Shanawar"  },
  { id:"shadman-raza",  label:"Shadman Raza"  },
  { id:"manqabat",      label:"Manqabat"      },
  { id:"majlis",        label:"Majlis"        },
   { id:"nohay",        label:"nohay"        },
];
const TICKER = ["Nadeem Sarwar","Mir Hasan Mir","Ali Shanawar","Shadman Raza","Manqabat","Majlis","Karbala","Muharram","Azadari","Ya Hussain","Noha","Ya Ali"];
const FEATURED = [
  { ytId:"8CY7eRxg_Nc", artist:"Nadeem Sarwar · 2026", title:"Ya Mazloom Imam", sub:"The Masterpiece",  desc:"One of the most emotional nohay — dedicated to the tragedy of Karbala and patience of Bibi Zainab (S.A)." },
  { ytId:"46zF8Mt5mx0", artist:"Mir Hasan Mir · 2026", title:"Karbala Walo", sub:"A Timeless Classic",desc:"A deeply moving noha about the journey to Karbala, recited with raw emotion by Mir Hasan Mir." },
  { ytId:"w5E3a8lWoeQ", artist:"Syed Raza Abbas· 2026",  title:"Pani Sakina Ko Pilao",sub:"Tribute to Imam",  desc:"Syed Raza Abbas powerful tribute to Imam Hussain (A.S) — feel the pain of Karbala in every word." },
];

// Secret admin unlock — 3 ways:
// 1. Type "admin" on keyboard
// 2. Tap logo 5 times on mobile
// 3. URL param ?admin=true
// 4. URL param ?key=YOUR_PASSWORD
function useAdminUnlock(password: string) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [typed,   setTyped]   = useState("");
  const SECRET = "admin";

  useEffect(() => {
    // Check URL params on load
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true" || params.get("key") === password) {
      setIsAdmin(true);
      // Clean URL silently
      window.history.replaceState({}, "", window.location.pathname);
    }

    // Check localStorage (persist across refresh)
    if (localStorage.getItem("nm_admin") === "1") {
      setIsAdmin(true);
    }
  }, [password]);

  // Keyboard: type "admin"
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const next = (typed + e.key).slice(-SECRET.length);
      setTyped(next);
      if (next === SECRET) {
        setIsAdmin(true);
        localStorage.setItem("nm_admin", "1");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [typed]);

  const activate = () => {
    setIsAdmin(true);
    localStorage.setItem("nm_admin", "1");
  };
  const deactivate = () => {
    setIsAdmin(false);
    localStorage.removeItem("nm_admin");
  };

  return { isAdmin, setIsAdmin: activate, deactivateAdmin: deactivate };
}

export default function Home() {
  const [videos,      setVideos]      = useState<Video[]>([]);
  const [hero,        setHero]        = useState<Hero>({ type:"video", value:"wTM0hT5EAFY" });
  const [settings,    setSettings]    = useState<Settings>({ siteName:"Noha.Manqabat", adminPassword:"matammedia2024" });
  const [lyrics,      setLyrics]      = useState<Lyric[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [cat,         setCat]         = useState("all");
  const [modal,       setModal]       = useState<{ytId:string;title:string}|null>(null);
  const [lyricsModal, setLyricsModal] = useState<Lyric|null>(null);
  const [adminOpen,   setAdminOpen]   = useState(false);
  const [contact,     setContact]     = useState({ name:"", email:"", msg:"" });
  const [sent,        setSent]        = useState(false);
  const [slide,       setSlide]       = useState(0);
  const [logoClicks,  setLogoClicks]  = useState(0);
  const timerRef  = useRef<ReturnType<typeof setTimeout>|null>(null);
  const logoTimer = useRef<ReturnType<typeof setTimeout>|null>(null);

  // Admin unlock — hidden from normal users
  const { isAdmin, setIsAdmin, deactivateAdmin } = useAdminUnlock(settings.adminPassword);

  // Logo tap 5 times = admin mode (mobile)
  const handleLogoClick = () => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (logoTimer.current) clearTimeout(logoTimer.current);
    logoTimer.current = setTimeout(() => setLogoClicks(0), 2000);
    if (next >= 5) { setIsAdmin(); setLogoClicks(0); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auto-advance slider
  const nextSlide = useCallback(() => setSlide(s => (s+1) % FEATURED.length), []);
  useEffect(() => {
    timerRef.current = setTimeout(nextSlide, 5000);
    return () => { if(timerRef.current) clearTimeout(timerRef.current); };
  }, [slide, nextSlide]);

  // Load all data from backend
  const load = useCallback(async () => {
    try {
      const [vr,hr,sr,lr] = await Promise.all([
        fetch("/api/videos",   {cache:"no-store"}),
        fetch("/api/hero",     {cache:"no-store"}),
        fetch("/api/settings", {cache:"no-store"}),
        fetch("/api/lyrics",   {cache:"no-store"}),
      ]);
      if(vr.ok) setVideos(await vr.json());
      if(hr.ok) setHero(await hr.json());
      if(sr.ok) setSettings(await sr.json());
      if(lr.ok) setLyrics(await lr.json());
    } catch{}
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  // API actions
  const addVideo    = async (v: Omit<Video,"id">) => { const r=await fetch("/api/videos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(v)}); if(r.ok){const d=await r.json();setVideos(p=>[d.video,...p]);return true;} return false; };
  const deleteVideo = async (id:string) => { await fetch(`/api/videos?id=${id}`,{method:"DELETE"}); setVideos(p=>p.filter(v=>v.id!==id)); };
  const saveHero    = async (h:Hero)    => { await fetch("/api/hero",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(h)}); setHero(h); };
  const saveSetting = async (s:Record<string,string>) => { const r=await fetch("/api/settings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}); const d=await r.json(); if(d.ok)setSettings(d.settings); return d; };
  const addLyric    = async (l: Omit<Lyric,"id">) => { const r=await fetch("/api/lyrics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(l)}); if(r.ok){const d=await r.json();setLyrics(p=>[d.item,...p]);return true;} return false; };
  const deleteLyric = async (id:string) => { await fetch(`/api/lyrics?id=${id}`,{method:"DELETE"}); setLyrics(p=>p.filter(l=>l.id!==id)); };

  const go      = (id:string) => document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
  const visible  = cat==="all" ? videos : videos.filter(v=>v.category===cat);
  const manqVids = videos.filter(v=>v.category==="manqabat").slice(0,4);
  const majlVids = videos.filter(v=>v.category==="majlis");
  const cur      = FEATURED[slide];
  const [n1,n2]  = settings.siteName.split(".");

  const VCard = ({v}:{v:Video}) => (
    <div className="vcard" onClick={()=>setModal({ytId:v.youtubeId,title:`${v.title} — ${v.artist}`})} data-hover>
      <div className="vcard-thumb">
        <img src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`} alt={v.title} loading="lazy"
          onError={e=>{(e.target as HTMLImageElement).src=`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;}}/>
        <div className="vcard-overlay"><div className="vcard-play"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div></div>
      </div>
      <div className="vcard-body">
        <div className="vcard-title">{v.title}</div>
        <div className="vcard-meta"><span className="vcard-artist">{v.artist}</span><span className="vcard-year">{v.year}</span></div>
      </div>
    </div>
  );

  const Empty = ({msg="No videos yet."}:{msg?:string}) => <div className="empty-state"><p>{msg}</p></div>;

  return (
    <>
      <ThreeCanvas/>
      <Cursor/>
      <Navbar
        onAdmin={()=>setAdminOpen(true)}
        siteName={settings.siteName}
        isAdmin={isAdmin}
        onLogoClick={handleLogoClick}
      />

      {/* ══ HERO ══ */}
      <section className="hero">
        <HeroBg type={hero.type} value={hero.value}/>
        <div className="hero-content">
          <div className="hero-tag"><span/>&nbsp;Islamic Media Platform</div>
          <h1 className="hero-title">
            <span className="hero-line">{n1}</span>
            <span className="hero-line red">.{n2??""}</span>
          </h1>
          <p className="hero-sub">The ultimate destination for Nohay, Manqabat &amp; Majalis.<br/>All in one place — always free.</p>
          <div className="hero-ctas">
            <button className="btn-red"   onClick={()=>go("videos")}    data-hover>Watch Nohay</button>
            <button className="btn-ghost" onClick={()=>go("noha-khan")} data-hover>Our Artists</button>
          </div>
        </div>
        <div className="hero-scroll"><span className="hero-scroll-label">Scroll</span><div className="hero-scroll-line"/></div>
      </section>

      {/* ══ TICKER ══ */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...TICKER,...TICKER,...TICKER].map((t,i)=><div key={i} className="marquee-item">{t}<div className="marquee-dot"/></div>)}
        </div>
      </div>

      {/* ══ STATS ══ */}
      <div className="stats-row">
        {[
          {n:loading?"—":String(videos.length),suf:"",  l:"Total Videos"},
          {n:"4",  suf:"+",l:"Artists"},
          {n:"6",  suf:"", l:"Categories"},
          {n:"100",suf:"%",l:"Free Forever"},
        ].map(s=>(
          <div key={s.l} className="stat-item">
            <div className="stat-n">{s.n}<span>{s.suf}</span></div>
            <div className="stat-l">{s.l}</div>
          </div>
        ))}
      </div>

      {/* ══ ARTISTS ══ */}
      <section id="noha-khan" className="sec sec-dark">
        <div className="container">
          <div className="sec-eyebrow">Our Artists</div>
          <h2 className="sec-title">The Voices of <span className="red">Karbala</span></h2>
        </div>
        <div className="artists-grid">
          {ARTISTS.map((a,i)=>(
            <div key={a.id} className="artist-card" data-hover onClick={()=>{setCat(a.id);go("videos");}}>
              <div className="artist-num">0{i+1}</div>
              <div className="artist-icon"><svg viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="1.5" width="18" height="18"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg></div>
              <div className="artist-name">{a.name}</div>
              <div className="artist-role">{a.role}</div>
              <div className="artist-desc">{a.desc}</div>
              <div className="artist-link">View Videos <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURED SLIDER ══ */}
      <section id="videos" className="sec sec-alt" style={{padding:0,overflow:"hidden"}}>
        <div className="featured-split">
          <div className="featured-text">
            <div className="sec-eyebrow" style={{marginBottom:"1.25rem"}}>Featured</div>
            <div className="feat-artist">{cur.artist}</div>
            <h3 className="featured-heading">{cur.title} —<br/><span className="red">{cur.sub}</span></h3>
            <p className="featured-body">{cur.desc}</p>
            <div className="hero-ctas" style={{marginBottom:"1.5rem"}}>
              <button className="btn-red"   onClick={()=>setModal({ytId:cur.ytId,title:cur.title})} data-hover>▶ Play Now</button>
              <button className="btn-ghost" onClick={()=>{setCat("nadeem-sarwar");go("all-videos");}} data-hover>All Nohay</button>
            </div>
            <div className="feat-dots">
              {FEATURED.map((_,i)=>(
                <button key={i} className={`feat-dot ${i===slide?"act":""}`}
                  onClick={()=>{if(timerRef.current)clearTimeout(timerRef.current);setSlide(i);}} data-hover/>
              ))}
            </div>
          </div>
          <div className="featured-media" onClick={()=>setModal({ytId:cur.ytId,title:cur.title})} data-hover>
            <img key={cur.ytId} src={`https://img.youtube.com/vi/${cur.ytId}/maxresdefault.jpg`} alt={cur.title}
              style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}
              onError={e=>{(e.target as HTMLImageElement).src=`https://img.youtube.com/vi/${cur.ytId}/hqdefault.jpg`;}}/>
            <div className="featured-overlay"><div className="f-play"><svg viewBox="0 0 24 24" fill="#fff" width="28" height="28"><polygon points="5 3 19 12 5 21 5 3"/></svg></div></div>
            <div className="featured-badge">Now Playing</div>
            <button className="feat-arrow feat-arrow-l" onClick={e=>{e.stopPropagation();if(timerRef.current)clearTimeout(timerRef.current);setSlide(s=>(s-1+FEATURED.length)%FEATURED.length);}} data-hover>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width="20" height="20"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button className="feat-arrow feat-arrow-r" onClick={e=>{e.stopPropagation();if(timerRef.current)clearTimeout(timerRef.current);nextSlide();}} data-hover>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width="20" height="20"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* ══ ALL VIDEOS ══ */}
      <section id="all-videos" className="sec sec-dark">
        <div className="container">
          <div className="sec-row-between">
            <div><div className="sec-eyebrow">Library</div><h2 className="sec-title" style={{marginBottom:0}}>All Videos</h2></div>
            <div className="filter-row">
              {FILTERS.map(f=><button key={f.id} className={`filt-btn ${cat===f.id?"active":""}`} onClick={()=>setCat(f.id)} data-hover>{f.label}</button>)}
            </div>
          </div>
          {loading
            ? <div className="loading-grid">{Array(6).fill(0).map((_,i)=><div key={i} className="skeleton"/>)}</div>
            : <div className="vgrid">{visible.length?visible.map(v=><VCard key={v.id} v={v}/>):<Empty/>}</div>}
        </div>
      </section>

      {/* ══ MANQABAT ══ */}
      <section id="manqabat" className="sec sec-alt">
        <div className="container">
          <div className="manq-inner">
            <div className="manq-text">
              <div className="sec-eyebrow">Manqabat</div>
              <h2 className="sec-title">Praise of the<br/><span className="red">Ahle Bait</span></h2>
              <p className="sec-body">Devotional poetry praising Ahle Bait and Awliya — soul-soothing recitations bringing peace and spiritual elevation.</p>
              <button className="btn-red" style={{marginTop:"1.5rem"}} onClick={()=>{setCat("manqabat");go("all-videos");}} data-hover>View All Manqabat</button>
            </div>
            <div className="vgrid vgrid-2">
              {!loading&&(manqVids.length?manqVids.map(v=><VCard key={v.id} v={v}/>):<Empty msg="No manqabat yet."/>)}
            </div>
          </div>
        </div>
      </section>

      {/* ══ MAJLIS ══ */}
      <section id="majlis" className="sec sec-dark">
        <div className="container">
          <div className="sec-row-between majlis-hd">
            <div><div className="sec-eyebrow">Majlis</div><h2 className="sec-title" style={{marginBottom:0}}>Molana <span className="red">Majalis</span></h2></div>
            <p className="sec-body" style={{maxWidth:"360px"}}>Religious lectures by scholars — focused on the teachings of Ahle Bait.</p>
          </div>
          <div className="vgrid" style={{marginTop:"2rem"}}>
            {!loading&&(majlVids.length?majlVids.map(v=><VCard key={v.id} v={v}/>):<Empty msg="No majlis videos yet."/>)}
          </div>
        </div>
      </section>

      {/* ══ LYRICS ══ */}
      <section id="lyrics" className="sec sec-alt">
        <div className="container">
          <div className="sec-eyebrow">Lyrics</div>
          <h2 className="sec-title">Noha &amp; Manqabat <span className="red">Lyrics</span></h2>
          {lyrics.length===0
            ? <div className="empty-state"><p>No lyrics added yet.</p></div>
            : <div className="lyrics-grid">
                {lyrics.map(l=>(
                  <div key={l.id} className="lyric-card" onClick={()=>setLyricsModal(l)} data-hover>
                    <div className="lyric-card-header">
                      <div>
                        <div className="lyric-card-title">{l.title}</div>
                        <div className="lyric-card-meta">{l.artist} · <span className="lyric-badge">{l.category.replace(/-/g," ")}</span></div>
                      </div>
                      <div className="lyric-script-badge">{l.script==="urdu"?"اردو":"Roman"}</div>
                    </div>
                    <div className={`lyric-card-preview ${l.script==="urdu"?"urdu-text":""}`}>
                      {l.lyrics.slice(0,200)}{l.lyrics.length>200?"…":""}
                    </div>
                    <div className="lyric-read-more">Read Full Lyrics →</div>
                  </div>
                ))}
              </div>
          }
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      <section id="contact" className="sec sec-dark">
        <div className="container">
          <div className="contact-inner">
            <div>
              <div className="sec-eyebrow">Contact</div>
              <h2 className="sec-title">Get In <span className="red">Touch</span></h2>
              <p className="sec-body" style={{marginBottom:"1.5rem"}}>Have a video request, suggestion or want to get in touch?</p>
              <a href="mailto:matammedia@gmail.com" className="contact-email" data-hover>matammedia@gmail.com</a>
              <div className="contact-tags">
                {["Video Request","Feedback","Partnership"].map(t=><span key={t} className="contact-tag">{t}</span>)}
              </div>
            </div>
            <div>
              {sent
                ? <div className="sent-box"><div style={{fontSize:"2rem",marginBottom:".75rem"}}>✓</div><p style={{fontFamily:"'Syne',sans-serif",fontSize:"1.1rem",fontWeight:700,marginBottom:".4rem"}}>Message Sent!</p><p style={{fontSize:".8rem",color:"var(--text2)"}}>We will get back to you soon.</p></div>
                : <div className="form-stack">
                    <div className="form-row-2">
                      <div><label className="field-label">Your Name</label><input className="field-input" placeholder="Full name" value={contact.name} onChange={e=>setContact({...contact,name:e.target.value})}/></div>
                      <div><label className="field-label">Email</label><input className="field-input" type="email" placeholder="you@email.com" value={contact.email} onChange={e=>setContact({...contact,email:e.target.value})}/></div>
                    </div>
                    <div><label className="field-label">Message</label><textarea className="field-textarea" placeholder="Your message or video request..." value={contact.msg} onChange={e=>setContact({...contact,msg:e.target.value})}/></div>
                    <button className="btn-red" onClick={()=>{if(!contact.name||!contact.email||!contact.msg)return;setSent(true);setContact({name:"",email:"",msg:""});setTimeout(()=>setSent(false),6000);}} data-hover>Send Message</button>
                  </div>
              }
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">{n1}<span>.</span>{n2}</div>
              <p className="footer-tagline">The ultimate Islamic media platform for Nohay, Manqabat and Majalis. Always free, always growing.</p>
            </div>
            <div>
              <div className="foot-col-title">Artists</div>
              {ARTISTS.map((a,i)=><button key={a.id} className="foot-link" onClick={()=>{setCat(["nadeem-sarwar","mir-hasan-mir","ali-shanawar","shadman-raza"][i]);go("all-videos");}}>{a.name}</button>)}
            </div>
            <div>
              <div className="foot-col-title">Sections</div>
              {[["videos","Videos"],["manqabat","Manqabat"],["majlis","Majlis"],["lyrics","Lyrics"],["contact","Contact"]].map(([id,l])=>(
                <button key={id} className="foot-link" onClick={()=>go(id)}>{l}</button>
              ))}
            </div>
            <div>
              <div className="foot-col-title">More</div>
              <a href="mailto:matammedia@gmail.com" className="foot-link">Email Us</a>
            </div>
          </div>
          <div className="foot-bottom">
            <span className="foot-copy">© 2025 {settings.siteName} — All rights reserved</span>
            <div className="foot-dot"/>
            <span className="foot-copy">Ya Hussain (A.S)</span>
          </div>
        </div>
      </footer>

      {/* VIDEO MODAL */}
      {modal&&<VideoModal ytId={modal.ytId} title={modal.title} onClose={()=>setModal(null)}/>}

      {/* LYRICS MODAL */}
      {lyricsModal&&(
        <div className="modal-bg" onClick={()=>setLyricsModal(null)}>
          <div className="lyrics-modal-box" onClick={e=>e.stopPropagation()}>
            <div className="lyrics-modal-hd">
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:"1.1rem",fontWeight:800}}>{lyricsModal.title}</div>
                <div style={{fontSize:".65rem",color:"var(--text3)",marginTop:"4px",textTransform:"uppercase",letterSpacing:".08em"}}>
                  {lyricsModal.artist} · {lyricsModal.category.replace(/-/g," ")} · {lyricsModal.script==="urdu"?"Urdu":"Roman"}
                </div>
              </div>
              <button className="modal-x" onClick={()=>setLyricsModal(null)}>✕</button>
            </div>
            <div className={`lyrics-modal-body ${lyricsModal.script==="urdu"?"urdu-text":""}`}>
              {lyricsModal.lyrics}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN */}
      {adminOpen&&(
        <AdminPanel
          onClose={()=>setAdminOpen(false)}
          onLogout={deactivateAdmin}
          videos={videos} onAdd={addVideo} onDelete={deleteVideo}
          hero={hero} onSaveHero={saveHero}
          settings={settings} onSaveSettings={saveSetting}
          lyrics={lyrics} onAddLyric={addLyric} onDeleteLyric={deleteLyric}
        />
      )}
    </>
  );
}
