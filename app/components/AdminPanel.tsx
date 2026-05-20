"use client";
import { useState, useRef } from "react";

const CATS = [
  {id:"nadeem-sarwar",name:"Nadeem Sarwar"},{id:"mir-hasan-mir",name:"Mir Hasan Mir"},
  {id:"ali-shanawar", name:"Ali Shanawar"}, {id:"shadman-raza", name:"Shadman Raza"},
  {id:"manqabat",name:"Manqabat"},{id:"majlis",name:"Majlis"},
];
const KARBALA_VIDS = [
  {id:"wTM0hT5EAFY",label:"Karbala Aerial View"},
  {id:"JYaOHMrQmKE",label:"Imam Hussain Shrine 4K"},
  {id:"FKkJCTbUPcM",label:"Muharram Atmosphere"},
  {id:"nBuAuQOThFI",label:"Karbala Night"},
];
const KARBALA_IMGS = [
  {url:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Imam_Hussein_Shrine.jpg/1280px-Imam_Hussein_Shrine.jpg",label:"Imam Hussain Shrine"},
  {url:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Karbala_overall.jpg/1280px-Karbala_overall.jpg",label:"Karbala City"},
  {url:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Abbas_Shrine_in_Karbala.jpg/1280px-Abbas_Shrine_in_Karbala.jpg",label:"Abbas Shrine"},
  {url:"https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1920&q=80",label:"Desert Sunset"},
];

type Video    = {id:string;title:string;youtubeId:string;category:string;artist:string;year:number;description?:string};
type Hero     = {type:"video"|"image";value:string};
type Settings = {siteName:string;adminPassword:string};
type Lyric    = {id:string;title:string;artist:string;category:string;script:string;lyrics:string};
type UpFile   = {name:string;url:string;size:number};
type Tab      = "dash"|"videos"|"add"|"upload"|"lyrics"|"hero"|"settings";

interface Props {
  onClose:()=>void;
  onLogout?:()=>void;
  videos:Video[];
  onAdd:(v:Omit<Video,"id">)=>Promise<boolean>;
  onDelete:(id:string)=>void;
  hero:Hero;
  onSaveHero:(h:Hero)=>void;
  settings:Settings;
  onSaveSettings:(s:Record<string,string>)=>Promise<{ok?:boolean;error?:string;settings?:Settings}>;
  lyrics:Lyric[];
  onAddLyric:(l:Omit<Lyric,"id">)=>Promise<boolean>;
  onDeleteLyric:(id:string)=>void;
}

export default function AdminPanel({
  onClose,videos,onAdd,onDelete,hero,onSaveHero,
  settings,onSaveSettings,lyrics,onAddLyric,onDeleteLyric,onLogout
}:Props & {onLogout?:()=>void}) {

  const [authed,  setAuthed]  = useState(false);
  const [pw,      setPw]      = useState("");
  const [pwErr,   setPwErr]   = useState("");
  const [tab,     setTab]     = useState<Tab>("dash");

  // Toast
  const [toast, setToast] = useState({msg:"",ok:true});
  const t3 = (msg:string,ok=true)=>{ setToast({msg,ok}); setTimeout(()=>setToast({msg:"",ok:true}),3500); };

  // Add video
  const [vForm,    setVForm]    = useState({title:"",youtubeId:"",category:"nadeem-sarwar",artist:"",year:2025,description:""});
  const [vPreview, setVPreview] = useState("");
  const [vAdding,  setVAdding]  = useState(false);

  // Video list
  const [search, setSearch] = useState("");
  const [catF,   setCatF]   = useState("all");

  // Upload
  const [uploads,    setUploads]    = useState<UpFile[]>([]);
  const [uploading,  setUploading]  = useState(false);
  const [uploadPct,  setUploadPct]  = useState(0);
  const [drag,       setDrag]       = useState(false);
  const [upTitle,    setUpTitle]    = useState("");
  const [upArtist,   setUpArtist]   = useState("");
  const [upCat,      setUpCat]      = useState("nadeem-sarwar");
  const fileRef = useRef<HTMLInputElement>(null);

  // Lyrics
  const [lForm,   setLForm]   = useState({title:"",artist:"",category:"nadeem-sarwar",script:"roman",lyrics:""});
  const [lAdding, setLAdding] = useState(false);
  const [lSearch, setLSearch] = useState("");

  // Hero
  const [hType, setHType] = useState<"video"|"image">(hero.type);
  const [hVal,  setHVal]  = useState(hero.value);
  const imgRef = useRef<HTMLInputElement>(null);

  // Settings
  const [siteName,   setSiteName]   = useState(settings.siteName);
  const [oldPw,      setOldPw]      = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [saving,     setSaving]     = useState(false);

  const extractId = (v:string)=>{ const m=v.match(/(?:youtu\.be\/|watch\?v=|embed\/)([a-zA-Z0-9_-]{11})/); return m?m[1]:v.trim(); };

  const login = () => {
    if(pw===settings.adminPassword){ setAuthed(true); setPwErr(""); }
    else setPwErr("Incorrect password");
  };

  // Fetch uploaded files
  const loadUploads = async () => {
    try { const r=await fetch("/api/upload"); if(r.ok) setUploads(await r.json()); } catch{}
  };

  const handleUpload = async (file: File) => {
    if(!file) return;
    if(!upTitle.trim()){ t3("Please enter a title first",false); return; }
    setUploading(true); setUploadPct(0);
    try {
      const fd = new FormData();
      fd.append("file", file);
      // Simulate progress
      const interval = setInterval(()=>setUploadPct(p=>Math.min(p+8,90)), 200);
      const r = await fetch("/api/upload",{method:"POST",body:fd});
      clearInterval(interval); setUploadPct(100);
      if(r.ok){
        const d = await r.json();
        // Also add as a video entry with local URL
        await onAdd({title:upTitle,youtubeId:"",category:upCat,artist:upArtist||"Local Upload",year:new Date().getFullYear(),description:`Local file: ${d.url}`});
        await loadUploads();
        setUpTitle(""); setUpArtist(""); t3("✓ File uploaded!");
      } else { t3("Upload failed",false); }
    } catch{ t3("Upload error",false); }
    setUploading(false); setUploadPct(0);
  };

  const deleteUpload = async (name:string) => {
    if(!confirm("Delete this file?")) return;
    await fetch(`/api/upload?name=${encodeURIComponent(name)}`,{method:"DELETE"});
    loadUploads();
    t3("File deleted");
  };

  const handleAddVideo = async () => {
    const ytId = extractId(vForm.youtubeId);
    if(!vForm.title.trim()){ t3("Title is required",false); return; }
    if(ytId.length!==11){ t3("Invalid YouTube URL or ID",false); return; }
    setVAdding(true);
    const ok = await onAdd({...vForm,youtubeId:ytId});
    setVAdding(false);
    if(ok){ setVForm({title:"",youtubeId:"",category:"nadeem-sarwar",artist:"",year:2025,description:""}); setVPreview(""); t3("✓ Video added!"); setTab("videos"); }
    else t3("Failed to add",false);
  };

  const handleAddLyric = async () => {
    if(!lForm.title.trim()||!lForm.lyrics.trim()){ t3("Title and lyrics required",false); return; }
    setLAdding(true);
    const ok = await onAddLyric(lForm);
    setLAdding(false);
    if(ok){ setLForm({title:"",artist:"",category:"nadeem-sarwar",script:"roman",lyrics:""}); t3("✓ Lyrics added!"); }
    else t3("Failed to add",false);
  };

  const handleSaveHero = () => {
    if(!hVal){ t3("Set a value first",false); return; }
    onSaveHero({type:hType,value:hVal}); t3("✓ Hero updated!");
  };

  const handleSaveSettings = async () => {
    if(newPw && newPw!==confirmPw){ t3("Passwords do not match",false); return; }
    if(newPw && newPw.length<6){ t3("Password must be 6+ characters",false); return; }
    setSaving(true);
    const payload:Record<string,string> = {};
    if(siteName!==settings.siteName) payload.siteName = siteName;
    if(newPw){ payload.oldPassword=oldPw; payload.newPassword=newPw; }
    if(!Object.keys(payload).length){ t3("Nothing to save"); setSaving(false); return; }
    const d = await onSaveSettings(payload);
    setSaving(false);
    if(d.ok){ t3("✓ Settings saved!"); setOldPw(""); setNewPw(""); setConfirmPw(""); }
    else t3(d.error||"Error saving",false);
  };

  const filtered = videos.filter(v=>{
    const c=catF==="all"||v.category===catF;
    const s=!search||v.title.toLowerCase().includes(search.toLowerCase())||v.artist.toLowerCase().includes(search.toLowerCase());
    return c&&s;
  });
  const filteredLyrics = lyrics.filter(l=>!lSearch||l.title.toLowerCase().includes(lSearch.toLowerCase())||l.artist.toLowerCase().includes(lSearch.toLowerCase()));

  const fmtSize = (b:number)=>b>1e6?`${(b/1e6).toFixed(1)} MB`:`${(b/1e3).toFixed(0)} KB`;

  const Icon = ({path:d}:{path:string})=>(
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={d}/></svg>
  );

  const TABS:{id:Tab;label:string;icon:string}[] = [
    {id:"dash",    label:"Dashboard",  icon:"M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"},
    {id:"videos",  label:"Videos",     icon:"M23 7l-7 5 7 5V7zM1 5h15v14H1z"},
    {id:"add",     label:"Add Video",  icon:"M12 5v14M5 12h14"},
    {id:"upload",  label:"Upload File",icon:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"},
    {id:"lyrics",  label:"Lyrics",     icon:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8"},
    {id:"hero",    label:"Hero BG",    icon:"M2 3h20v14H2zM8 21h8M12 17v4"},
    {id:"settings",label:"Settings",   icon:"M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"},
  ];

  // ── LOGIN ────────────────────────────────────────────────────────────────
  if(!authed) return (
    <div className="admin-wrap" style={{alignItems:"center",justifyContent:"center"}}>
      <div className="adm-login-card">
        <div className="adm-login-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"1.1rem",fontWeight:800,marginBottom:".4rem"}}>Admin Panel</h2>
        <p style={{fontSize:".75rem",color:"var(--text3)",marginBottom:"2rem"}}>Authorized access only</p>
        <div className="adm-field" style={{marginBottom:".8rem"}}>
          <label>Password</label>
          <input type="password" placeholder="Enter password" value={pw}
            onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>
        </div>
        {pwErr&&<p style={{color:"var(--red)",fontSize:".7rem",marginBottom:".8rem"}}>{pwErr}</p>}
        <button className="adm-btn" style={{width:"100%",marginBottom:".75rem"}} onClick={login} data-hover>Login</button>
        <button className="adm-btn-ghost" style={{width:"100%"}} onClick={onClose} data-hover>Go Back</button>
      </div>
    </div>
  );

  // ── DASHBOARD ────────────────────────────────────────────────────────────
  return (
    <div className="admin-wrap">
      {/* Sidebar */}
      <div className="adm-side">
        <div className="adm-logo">
          <div className="adm-logo-txt">{settings.siteName.split(".")[0]}<span>.</span>{settings.siteName.split(".")[1]}</div>
          <div className="adm-logo-sub">Admin Panel</div>
        </div>
        <nav className="adm-nav">
          {TABS.map(t=>(
            <button key={t.id} className={`adm-nav-btn ${tab===t.id?"act":""}`} onClick={()=>{setTab(t.id);if(t.id==="upload")loadUploads();}}>
              <Icon path={t.icon}/>{t.label}
            </button>
          ))}
        </nav>
        <div style={{padding:"1rem",borderTop:"1px solid var(--border)"}}>
          <button className="adm-nav-btn" onClick={onClose}>
            <Icon path="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>Back to Site
          </button>
          {onLogout && (
            <button className="adm-nav-btn" style={{color:"rgba(239,68,68,.7)"}} onClick={()=>{onClose();onLogout();}}>
              <Icon path="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>Logout Admin
            </button>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="adm-main">
        {/* Top bar */}
        <div className="adm-topbar">
          <h1>{TABS.find(t=>t.id===tab)?.label}</h1>
          <div style={{display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap"}}>
            {toast.msg&&(
              <span style={{fontSize:".7rem",color:toast.ok?"var(--red)":"#ef4444",border:`1px solid ${toast.ok?"rgba(232,23,58,.3)":"rgba(239,68,68,.3)"}`,padding:"6px 14px",background:toast.ok?"var(--red-dim)":"rgba(239,68,68,.1)"}}>
                {toast.msg}
              </span>
            )}
            <button className="adm-btn-ghost" onClick={onClose}>✕ Close</button>
          </div>
        </div>

        <div className="adm-content">

          {/* ── DASHBOARD ── */}
          {tab==="dash"&&(
            <>
              <div className="adm-stats">
                {[
                  {n:videos.length,l:"Total Videos"},
                  {n:lyrics.length,l:"Lyrics"},
                  {n:CATS.length,  l:"Categories"},
                  {n:[...new Set(videos.map(v=>v.artist))].filter(Boolean).length,l:"Artists"},
                ].map(s=>(
                  <div key={s.l} className="adm-stat">
                    <div className="adm-stat-n">{s.n}<span>.</span></div>
                    <div className="adm-stat-l">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="adm-box">
                <div className="adm-box-title">Videos by Category</div>
                {CATS.map(c=>{
                  const cnt=videos.filter(v=>v.category===c.id).length;
                  const pct=videos.length?Math.round(cnt/videos.length*100):0;
                  return(
                    <div key={c.id} style={{marginBottom:"1rem"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
                        <span style={{fontSize:".78rem",color:"var(--text2)",fontWeight:500}}>{c.name}</span>
                        <span style={{fontSize:".72rem",color:"var(--red)",fontWeight:600}}>{cnt}</span>
                      </div>
                      <div className="bar-track"><div className="bar-fill" style={{width:`${pct}%`}}/></div>
                    </div>
                  );
                })}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1rem"}}>
                {[
                  {id:"add" as Tab,  emoji:"＋",title:"Add YouTube Video",desc:"Paste link → live instantly"},
                  {id:"upload" as Tab,emoji:"⬆",title:"Upload Local File",desc:"MP4, MKV from your PC"},
                  {id:"lyrics" as Tab,emoji:"📝",title:"Add Lyrics",       desc:"Noha & Manqabat text"},
                  {id:"hero" as Tab,  emoji:"🖼",title:"Change Hero BG",   desc:"Video or image"},
                  {id:"settings" as Tab,emoji:"⚙",title:"Settings",        desc:"Name, password"},
                ].map(card=>(
                  <div key={card.id} className="adm-box" style={{cursor:"pointer",transition:"border-color .2s"}}
                    onClick={()=>{setTab(card.id);if(card.id==="upload")loadUploads();}}
                    onMouseEnter={e=>(e.currentTarget.style.borderColor="var(--border2)")}
                    onMouseLeave={e=>(e.currentTarget.style.borderColor="var(--border)")}>
                    <div style={{fontSize:"1.5rem",marginBottom:".5rem"}}>{card.emoji}</div>
                    <p style={{fontSize:".85rem",fontWeight:600,marginBottom:"4px"}}>{card.title}</p>
                    <p style={{fontSize:".72rem",color:"var(--text3)"}}>{card.desc}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── VIDEOS LIST ── */}
          {tab==="videos"&&(
            <div className="adm-box">
              <div className="adm-box-title">All Videos ({filtered.length})</div>
              <div style={{display:"flex",gap:".75rem",marginBottom:"1.2rem",flexWrap:"wrap"}}>
                <input placeholder="Search by title or artist…" value={search} onChange={e=>setSearch(e.target.value)}
                  style={{flex:1,minWidth:"180px",background:"var(--bg3)",border:"1px solid var(--border)",padding:"9px 14px",color:"#fff",fontFamily:"'Space Grotesk',sans-serif",fontSize:".8rem",outline:"none"}}/>
                <select value={catF} onChange={e=>setCatF(e.target.value)}
                  style={{background:"var(--bg3)",border:"1px solid var(--border)",padding:"9px 14px",color:"#fff",fontFamily:"'Space Grotesk',sans-serif",fontSize:".75rem",outline:"none",cursor:"pointer"}}>
                  <option value="all">All Categories</option>
                  {CATS.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{maxHeight:"500px",overflowY:"auto"}}>
                {filtered.length===0
                  ? <p style={{color:"var(--text3)",fontSize:".8rem",padding:"2rem",textAlign:"center"}}>No videos found</p>
                  : filtered.map(v=>(
                    <div key={v.id} className="vli">
                      {v.youtubeId
                        ? <img className="vli-thumb" src={`https://img.youtube.com/vi/${v.youtubeId}/default.jpg`} alt={v.title}/>
                        : <div className="vli-thumb" style={{background:"var(--bg4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem"}}>📁</div>
                      }
                      <div className="vli-info">
                        <div className="vli-title">{v.title}</div>
                        <div className="vli-meta">{v.artist} · {v.year}{v.description?.startsWith("Local file:")?" · Local":""}</div>
                      </div>
                      <span className="vli-badge">{v.category.replace(/-/g," ")}</span>
                      <button className="del-btn" data-hover onClick={()=>{if(confirm("Delete?"))onDelete(v.id);}}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* ── ADD YOUTUBE VIDEO ── */}
          {tab==="add"&&(
            <div style={{maxWidth:"620px"}}>
              <div className="adm-box">
                <div className="adm-box-title">Add YouTube Video</div>
                <div className="adm-form-grid">
                  <div className="adm-field" style={{gridColumn:"1/-1"}}>
                    <label>Video Title *</label>
                    <input placeholder="e.g. Ya Hussain 2025" value={vForm.title} onChange={e=>setVForm({...vForm,title:e.target.value})}/>
                  </div>
                  <div className="adm-field" style={{gridColumn:"1/-1"}}>
                    <label>YouTube URL or Video ID *</label>
                    <input placeholder="https://youtube.com/watch?v=... or just the ID"
                      value={vForm.youtubeId}
                      onChange={e=>{setVForm({...vForm,youtubeId:e.target.value});const id=extractId(e.target.value);setVPreview(id.length===11?id:"");}}/>
                    {vPreview&&(
                      <div style={{marginTop:".75rem"}}>
                        <img src={`https://img.youtube.com/vi/${vPreview}/mqdefault.jpg`} alt="preview"
                          style={{width:"100%",maxHeight:"160px",objectFit:"cover",border:"1px solid var(--border)"}}/>
                        <p style={{fontSize:".62rem",color:"var(--red)",marginTop:"5px",fontWeight:600}}>✓ Video found — ID: {vPreview}</p>
                      </div>
                    )}
                  </div>
                  <div className="adm-field">
                    <label>Category *</label>
                    <select value={vForm.category} onChange={e=>setVForm({...vForm,category:e.target.value})}>
                      {CATS.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>Artist Name</label>
                    <input placeholder="e.g. Nadeem Sarwar" value={vForm.artist} onChange={e=>setVForm({...vForm,artist:e.target.value})}/>
                  </div>
                  <div className="adm-field">
                    <label>Year</label>
                    <input type="number" value={vForm.year} onChange={e=>setVForm({...vForm,year:parseInt(e.target.value)||2025})}/>
                  </div>
                  <div className="adm-field">
                    <label>Description (optional)</label>
                    <textarea placeholder="Short description…" value={vForm.description} onChange={e=>setVForm({...vForm,description:e.target.value})}/>
                  </div>
                </div>
                <div style={{marginTop:"1.5rem",display:"flex",gap:".75rem"}}>
                  <button className="adm-btn" onClick={handleAddVideo} disabled={vAdding} data-hover>{vAdding?"Adding…":"Add Video"}</button>
                  <button className="adm-btn-ghost" onClick={()=>{setVForm({title:"",youtubeId:"",category:"nadeem-sarwar",artist:"",year:2025,description:""});setVPreview("");}} data-hover>Clear</button>
                </div>
              </div>
            </div>
          )}

          {/* ── UPLOAD LOCAL FILE ── */}
          {tab==="upload"&&(
            <div style={{maxWidth:"700px"}}>
              <div className="adm-box">
                <div className="adm-box-title">Upload Video from Your Computer</div>
                <p style={{fontSize:".78rem",color:"var(--text3)",marginBottom:"1.5rem",lineHeight:1.7}}>
                  Upload MP4, MKV, WebM files directly from your PC. Files are saved on the server and appear on the website.
                </p>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1.25rem"}}>
                  <div className="adm-field">
                    <label>Video Title *</label>
                    <input placeholder="Title for this video" value={upTitle} onChange={e=>setUpTitle(e.target.value)}/>
                  </div>
                  <div className="adm-field">
                    <label>Artist Name</label>
                    <input placeholder="e.g. Nadeem Sarwar" value={upArtist} onChange={e=>setUpArtist(e.target.value)}/>
                  </div>
                  <div className="adm-field" style={{gridColumn:"1/-1"}}>
                    <label>Category</label>
                    <select value={upCat} onChange={e=>setUpCat(e.target.value)}>
                      {CATS.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Drop zone */}
                <div
                  className={`upload-zone ${drag?"drag":""}`}
                  onDragOver={e=>{e.preventDefault();setDrag(true);}}
                  onDragLeave={()=>setDrag(false)}
                  onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)handleUpload(f);}}
                  onClick={()=>fileRef.current?.click()}
                  data-hover>
                  <input ref={fileRef} type="file" accept="video/*,audio/*" style={{display:"none"}}
                    onChange={e=>{const f=e.target.files?.[0];if(f)handleUpload(f);}}/>
                  <div style={{fontSize:"2.5rem",marginBottom:"1rem"}}>⬆</div>
                  <p style={{fontSize:".9rem",fontWeight:600,color:"var(--text2)",marginBottom:".4rem"}}>Click or drag &amp; drop video file</p>
                  <p style={{fontSize:".7rem",color:"var(--text3)"}}>MP4, MKV, WebM, AVI supported</p>
                </div>

                {uploading&&(
                  <div style={{marginTop:"1rem"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                      <span style={{fontSize:".72rem",color:"var(--text2)"}}>Uploading…</span>
                      <span style={{fontSize:".72rem",color:"var(--red)",fontWeight:600}}>{uploadPct}%</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{width:`${uploadPct}%`}}/></div>
                  </div>
                )}
              </div>

              {/* Uploaded files list */}
              <div className="adm-box">
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
                  <div className="adm-box-title" style={{marginBottom:0}}>Uploaded Files ({uploads.length})</div>
                  <button className="adm-btn-ghost" style={{fontSize:".6rem",padding:"6px 14px"}} onClick={loadUploads} data-hover>Refresh</button>
                </div>
                {uploads.length===0
                  ? <p style={{fontSize:".8rem",color:"var(--text3)",textAlign:"center",padding:"2rem"}}>No files uploaded yet</p>
                  : uploads.map(f=>(
                    <div key={f.name} className="upload-file-row">
                      <div style={{fontSize:"1.2rem",flexShrink:0}}>🎬</div>
                      <div className="upload-file-name">{f.name}</div>
                      <div className="upload-file-size">{fmtSize(f.size)}</div>
                      <a href={f.url} target="_blank" rel="noreferrer"
                        style={{fontSize:".62rem",color:"var(--red)",fontWeight:600,whiteSpace:"nowrap",flexShrink:0}}>
                        View ↗
                      </a>
                      <button className="adm-btn-danger" onClick={()=>deleteUpload(f.name)} data-hover>Delete</button>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* ── LYRICS ── */}
          {tab==="lyrics"&&(
            <div style={{maxWidth:"700px"}}>
              <div className="adm-box">
                <div className="adm-box-title">Add Noha / Manqabat Lyrics</div>
                <div className="adm-form-grid">
                  <div className="adm-field">
                    <label>Title *</label>
                    <input placeholder="e.g. Aye Zainab" value={lForm.title} onChange={e=>setLForm({...lForm,title:e.target.value})}/>
                  </div>
                  <div className="adm-field">
                    <label>Artist</label>
                    <input placeholder="e.g. Nadeem Sarwar" value={lForm.artist} onChange={e=>setLForm({...lForm,artist:e.target.value})}/>
                  </div>
                  <div className="adm-field">
                    <label>Category</label>
                    <select value={lForm.category} onChange={e=>setLForm({...lForm,category:e.target.value})}>
                      {CATS.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>Script / Language</label>
                    <select value={lForm.script} onChange={e=>setLForm({...lForm,script:e.target.value})}>
                      <option value="roman">Roman (English letters)</option>
                      <option value="urdu">Urdu (اردو)</option>
                    </select>
                  </div>
                  <div className="adm-field" style={{gridColumn:"1/-1"}}>
                    <label>Lyrics *</label>
                    <textarea style={{minHeight:"180px"}} placeholder="Paste full lyrics here…" value={lForm.lyrics} onChange={e=>setLForm({...lForm,lyrics:e.target.value})}/>
                  </div>
                </div>
                <button className="adm-btn" style={{marginTop:"1.25rem"}} onClick={handleAddLyric} disabled={lAdding} data-hover>{lAdding?"Adding…":"Add Lyrics"}</button>
              </div>

              <div className="adm-box">
                <div className="adm-box-title">All Lyrics ({filteredLyrics.length})</div>
                <input placeholder="Search lyrics…" value={lSearch} onChange={e=>setLSearch(e.target.value)}
                  style={{width:"100%",background:"var(--bg3)",border:"1px solid var(--border)",padding:"9px 14px",color:"#fff",fontFamily:"'Space Grotesk',sans-serif",fontSize:".8rem",outline:"none",marginBottom:"1rem"}}/>
                <div style={{maxHeight:"400px",overflowY:"auto"}}>
                  {filteredLyrics.length===0
                    ? <p style={{color:"var(--text3)",fontSize:".8rem",textAlign:"center",padding:"2rem"}}>No lyrics yet</p>
                    : filteredLyrics.map(l=>(
                      <div key={l.id} className="vli">
                        <div style={{width:42,height:42,background:"var(--red-dim)",border:"1px solid rgba(232,23,58,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",flexShrink:0}}>📝</div>
                        <div className="vli-info">
                          <div className="vli-title">{l.title}</div>
                          <div className="vli-meta">{l.artist} · {l.category}</div>
                        </div>
                        <span className="vli-badge">{l.category.replace(/-/g," ")}</span>
                        <button className="del-btn" data-hover onClick={()=>{if(confirm("Delete?"))onDeleteLyric(l.id);}}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}

          {/* ── HERO BG ── */}
          {tab==="hero"&&(
            <div style={{maxWidth:"660px"}}>
              <div className="adm-box">
                <div className="adm-box-title">Hero Background — Choose Type</div>
                <div className="hero-type-toggle">
                  {(["video","image"] as const).map((tp,i)=>(
                    <button key={tp} className={`htt-btn ${hType===tp?"act":""}`}
                      style={{borderRight:i===0?"1px solid var(--border)":"none"}}
                      onClick={()=>setHType(tp)} data-hover>
                      {tp==="video"?"🎬 YouTube Video":"🖼 Image"}
                    </button>
                  ))}
                </div>

                {hType==="video"&&(
                  <>
                    <div className="adm-field" style={{marginBottom:"1.25rem"}}>
                      <label>YouTube Video ID or URL</label>
                      <input placeholder="e.g. wTM0hT5EAFY or full URL" value={hVal}
                        onChange={e=>{const id=extractId(e.target.value);setHVal(id.length===11?id:e.target.value);}}/>
                      <p style={{fontSize:".6rem",color:"var(--text3)",marginTop:"4px"}}>Autoplays muted &amp; looped as cinematic background</p>
                    </div>
                    {hVal.length===11&&(
                      <div style={{position:"relative",marginBottom:"1.25rem"}}>
                        <img src={`https://img.youtube.com/vi/${hVal}/maxresdefault.jpg`} alt="preview" className="hero-preview"
                          onError={e=>{(e.target as HTMLImageElement).src=`https://img.youtube.com/vi/${hVal}/hqdefault.jpg`;}}/>
                        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontSize:".65rem",color:"#fff",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",background:"rgba(232,23,58,.8)",padding:"5px 12px"}}>Preview</span>
                        </div>
                      </div>
                    )}
                    <div className="adm-box" style={{background:"var(--bg3)",padding:"1rem",marginBottom:"1.25rem"}}>
                      <div className="adm-box-title" style={{marginBottom:".75rem"}}>Suggested Karbala Videos</div>
                      <div className="preset-grid">
                        {KARBALA_VIDS.map(v=>(
                          <button key={v.id} className="preset-btn"
                            style={{border:`1px solid ${hVal===v.id?"var(--red)":"var(--border)"}`,background:hVal===v.id?"var(--red-dim)":"transparent",color:hVal===v.id?"var(--red)":"var(--text2)"}}
                            onClick={()=>setHVal(v.id)} data-hover>
                            {hVal===v.id?"✓ ":"▶ "}{v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {hType==="image"&&(
                  <>
                    <div className="upload-drop" onClick={()=>imgRef.current?.click()}
                      onDragOver={e=>e.preventDefault()}
                      onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f&&f.type.startsWith("image/")){const r=new FileReader();r.onload=()=>setHVal(r.result as string);r.readAsDataURL(f);}}} data-hover>
                      <div style={{fontSize:"2rem",marginBottom:".5rem"}}>📁</div>
                      <p style={{fontSize:".8rem",fontWeight:600,color:"var(--text2)",marginBottom:"4px"}}>Click or drag &amp; drop image</p>
                      <p style={{fontSize:".65rem",color:"var(--text3)"}}>JPG, PNG, WEBP — 1920×1080 recommended</p>
                      <input ref={imgRef} type="file" accept="image/*" style={{display:"none"}}
                        onChange={e=>{const f=e.target.files?.[0];if(f){const r=new FileReader();r.onload=()=>setHVal(r.result as string);r.readAsDataURL(f);}}}/>
                    </div>
                    <div className="adm-field" style={{margin:"1rem 0"}}>
                      <label>Or paste Image URL</label>
                      <input placeholder="https://example.com/karbala.jpg" value={hVal.startsWith("data:")?"":hVal} onChange={e=>setHVal(e.target.value)}/>
                    </div>
                    {hVal&&<img src={hVal} alt="preview" className="hero-preview" style={{marginBottom:"1.25rem"}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>}
                    <div className="adm-box" style={{background:"var(--bg3)",padding:"1rem",marginBottom:"1.25rem"}}>
                      <div className="adm-box-title" style={{marginBottom:".75rem"}}>Suggested Karbala Images</div>
                      <div className="preset-grid">
                        {KARBALA_IMGS.map(img=>(
                          <div key={img.url} className="preset-img-card" style={{border:`2px solid ${hVal===img.url?"var(--red)":"transparent"}`}} onClick={()=>setHVal(img.url)} data-hover>
                            <img src={img.url} alt={img.label} style={{width:"100%",height:"70px",objectFit:"cover"}} onError={e=>{(e.target as HTMLImageElement).parentElement!.style.display="none";}}/>
                            <div className="preset-img-label">{img.label}</div>
                            {hVal===img.url&&<div className="preset-check">✓</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div style={{paddingTop:".75rem",borderTop:"1px solid var(--border)"}}>
                  <button className="adm-btn" onClick={handleSaveHero} data-hover>Save &amp; Apply</button>
                </div>
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {tab==="settings"&&(
            <div style={{maxWidth:"520px"}}>
              <div className="adm-box">
                <div className="adm-box-title">Site Name</div>
                <div className="adm-field" style={{marginBottom:".5rem"}}>
                  <label>Name (format: Word.Word)</label>
                  <input value={siteName} onChange={e=>setSiteName(e.target.value)} placeholder="Noha.Manqabat"/>
                </div>
                <p style={{fontSize:".6rem",color:"var(--text3)",marginBottom:"1.25rem"}}>Shown in navbar, footer &amp; browser tab</p>
              </div>

              <div className="adm-box">
                <div className="adm-box-title">Change Admin Password</div>
                <div style={{display:"flex",flexDirection:"column",gap:"1rem",marginBottom:".5rem"}}>
                  <div className="adm-field">
                    <label>Current Password</label>
                    <input type="password" placeholder="Current password" value={oldPw} onChange={e=>setOldPw(e.target.value)}/>
                  </div>
                  <div className="adm-field">
                    <label>New Password (min 6 chars)</label>
                    <input type="password" placeholder="New password" value={newPw} onChange={e=>setNewPw(e.target.value)}/>
                  </div>
                  <div className="adm-field">
                    <label>Confirm New Password</label>
                    <input type="password" placeholder="Repeat new password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)}/>
                  </div>
                </div>
              </div>

              <div className="adm-box" style={{background:"var(--bg3)"}}>
                <div className="adm-box-title">Current Info</div>
                {[["Site Name",settings.siteName],["Admin Password",settings.adminPassword],["Total Videos",String(videos.length)],["Total Lyrics",String(lyrics.length)]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:".75rem 0",borderBottom:"1px solid var(--border)"}}>
                    <span style={{fontSize:".75rem",color:"var(--text3)",fontWeight:500}}>{k}</span>
                    <span style={{fontSize:".78rem",color:"var(--red)",fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>

              <button className="adm-btn" onClick={handleSaveSettings} disabled={saving} data-hover style={{width:"100%",marginTop:"1rem"}}>
                {saving?"Saving…":"Save Settings"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
