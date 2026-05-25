import { useState } from "react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y, m) { return new Date(y, m, 1).getDay(); }
function dateKey(y, m, d) {
  return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

const PM = {
  High:   { color: "#e07b54", bg: "rgba(224,123,84,0.12)" },
  Medium: { color: "#c9a84c", bg: "rgba(201,168,76,0.12)" },
  Low:    { color: "#6aab8e", bg: "rgba(106,171,142,0.12)" },
};

const SEED = {
  "2026-05-05": [{ id:1, date:"2026-05-05", work:"Quarterly planning review with stakeholders", priority:"High" }],
  "2026-05-12": [{ id:2, date:"2026-05-12", work:"Design handoff and walkthrough with engineering", priority:"Medium" }],
  "2026-05-19": [{ id:3, date:"2026-05-19", work:"Update internal docs and archive sprint notes", priority:"Low" }],
  "2026-05-23": [
    { id:4, date:"2026-05-23", work:"Client call — present revised proposal", priority:"High" },
    { id:5, date:"2026-05-23", work:"Team lunch and retrospective", priority:"Low" },
  ],
  "2026-05-28": [{ id:6, date:"2026-05-28", work:"Prepare monthly report and send to leadership", priority:"Medium" }],
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { background:#0d0d0d; }
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:#111; }
  ::-webkit-scrollbar-thumb { background:#2a2318; border-radius:4px; }
  input[type="date"]::-webkit-calendar-picker-indicator { filter:invert(0.4); cursor:pointer; }
  .day-cell:hover { background:#161410 !important; border-color:#2e2a20 !important; }
  .cell-add { opacity:0; transition:opacity 0.15s; }
  .day-cell:hover .cell-add { opacity:1; }
  .scard { animation:fadeUp 0.3s ease both; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
  .slidein { animation:slideIn 0.25s ease; }
  @keyframes slideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
  .modalin { animation:popIn 0.22s cubic-bezier(.34,1.56,.64,1); }
  @keyframes popIn { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:none; } }
  .addbtn:hover { background:#c9a84c !important; color:#0d0d0d !important; }
  .arrowbtn:hover { color:#c9a84c !important; }
  .iconbtn:hover { background:#1e1a14 !important; color:#c9a84c !important; }
  .delbtn:hover { background:#1e1210 !important; color:#e07b54 !important; }
`;

export default function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [schedules, setSchedules] = useState(SEED);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ date:"", work:"", priority:"Medium" });
  const [view, setView] = useState("cal");
  const [filter, setFilter] = useState("All");

  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y-1); }
    else setMonth(m => m-1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y+1); }
    else setMonth(m => m+1);
  }
  function openAdd(d) {
    setEditItem(null);
    setForm({ date:d, work:"", priority:"Medium" });
    setModal(true);
  }
  function openEdit(item) {
    setEditItem(item);
    setForm({ date:item.date, work:item.work, priority:item.priority });
    setModal(true);
  }
  function save() {
    if (!form.date || !form.work.trim()) return;
    setSchedules(prev => {
      const next = { ...prev };
      if (editItem) {
        next[editItem.date] = (next[editItem.date]||[]).filter(s => s.id !== editItem.id);
        if (!next[editItem.date].length) delete next[editItem.date];
      }
      const item = { id: editItem ? editItem.id : Date.now(), date:form.date, work:form.work, priority:form.priority };
      next[form.date] = [...(next[form.date]||[]), item];
      return next;
    });
    setModal(false);
  }
  function del(dateStr, id) {
    setSchedules(prev => {
      const next = { ...prev };
      next[dateStr] = (next[dateStr]||[]).filter(s => s.id !== id);
      if (!next[dateStr].length) delete next[dateStr];
      return next;
    });
  }

  const all = Object.values(schedules).flat().sort((a,b) => a.date.localeCompare(b.date));
  const filtered = filter === "All" ? all : all.filter(s => s.priority === filter);
  const totalHigh = all.filter(s => s.priority === "High").length;
  const totalMed  = all.filter(s => s.priority === "Medium").length;
  const totalLow  = all.filter(s => s.priority === "Low").length;

  const inputStyle = {
    width:"100%", background:"#141311", border:"1px solid #222",
    borderRadius:6, padding:"11px 14px", color:"#c8c0ae",
    fontSize:13, fontFamily:"Lora, serif", outline:"none"
  };
  const iconBtnStyle = {
    background:"#141414", border:"1px solid #222", color:"#444",
    cursor:"pointer", padding:"5px 9px", borderRadius:4, fontSize:13
  };
  const cardStyle = (priority) => ({
    display:"flex", alignItems:"flex-start", padding:"16px 18px",
    background:"#0f0e0c", border:"1px solid #1e1e1e",
    borderLeft:"3px solid " + PM[priority].color,
    borderRadius:8, marginBottom:10
  });
  const badgeStyle = (priority) => ({
    fontSize:10, padding:"2px 8px", borderRadius:3, letterSpacing:1,
    textTransform:"uppercase", display:"inline-block", marginBottom:8,
    background:PM[priority].bg, color:PM[priority].color
  });

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#0d0d0d", color:"#c8c0ae", fontFamily:"Lora, serif" }}>
      <style>{CSS}</style>

      {/* SIDEBAR */}
      <aside style={{ width:220, flexShrink:0, background:"#0a0a0a", borderRight:"1px solid #191919", display:"flex", flexDirection:"column", padding:"28px 20px", position:"sticky", top:0, height:"100vh" }}>

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
          <div style={{ width:40, height:40, background:"#c9a84c", color:"#0d0d0d", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Playfair Display, serif", fontWeight:700, fontSize:15 }}>CS</div>
          <div>
            <div style={{ fontFamily:"Playfair Display, serif", fontSize:15, fontWeight:700, color:"#e8dfc8" }}>Calendar</div>
            <div style={{ fontSize:11, color:"#555", letterSpacing:1.5, textTransform:"uppercase" }}>Schedule</div>
          </div>
        </div>

        <div style={{ height:1, background:"#181818", marginBottom:20 }} />

        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, color:"#444", letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>This month</div>
          <div style={{ display:"flex", gap:8 }}>
            {[["High",totalHigh,"#e07b54"],["Mid",totalMed,"#c9a84c"],["Low",totalLow,"#6aab8e"]].map(([label,count,color]) => (
              <div key={label} style={{ flex:1, background:"#111", borderRadius:6, padding:"10px 6px", textAlign:"center" }}>
                <div style={{ fontFamily:"Playfair Display, serif", fontSize:22, fontWeight:700, color }}>{count}</div>
                <div style={{ fontSize:9, color:"#444", marginTop:4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height:1, background:"#181818", marginBottom:20 }} />

        <nav style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {[["cal","◫","Calendar"],["list","≡","All Schedules"]].map(([v,icon,label]) => (
            <button key={v} onClick={() => setView(v)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:6, background:view===v?"#1a1710":"transparent", border:"none", color:view===v?"#c9a84c":"#555", cursor:"pointer", fontSize:13, fontFamily:"Lora, serif", textAlign:"left" }}>
              <span>{icon}</span> {label}
            </button>
          ))}
        </nav>

        <div style={{ flex:1 }} />

        <button className="addbtn" onClick={() => openAdd(selected||todayKey)} style={{ padding:"11px 0", background:"#1a1710", border:"1px solid rgba(201,168,76,0.33)", color:"#c9a84c", borderRadius:6, cursor:"pointer", fontSize:13, fontFamily:"Lora, serif", fontStyle:"italic", width:"100%" }}>
          + New Schedule
        </button>
      </aside>

      {/* MAIN */}
      <main style={{ flex:1, padding:"36px 40px", overflowY:"auto" }}>
        {view === "cal" ? (
          <>
            <div style={{ display:"flex", alignItems:"center", gap:24, marginBottom:28 }}>
              <button className="arrowbtn" onClick={prevMonth} style={{ background:"none", border:"none", color:"#444", fontSize:28, cursor:"pointer", fontFamily:"serif" }}>&#8249;</button>
              <div>
                <h1 style={{ fontFamily:"Playfair Display, serif", fontSize:34, fontWeight:700, color:"#e8dfc8" }}>{MONTHS[month]}</h1>
                <div style={{ color:"#555", fontSize:13, marginTop:4 }}>{year}</div>
              </div>
              <button className="arrowbtn" onClick={nextMonth} style={{ background:"none", border:"none", color:"#444", fontSize:28, cursor:"pointer", fontFamily:"serif" }}>&#8250;</button>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:6 }}>
              {DAYS_SHORT.map(d => (
                <div key={d} style={{ textAlign:"center", fontSize:10, color:"#3a3a3a", letterSpacing:2, textTransform:"uppercase", padding:"4px 0" }}>{d}</div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
              {Array(firstDay).fill(null).map((_,i) => <div key={"e"+i} />)}
              {Array(daysInMonth).fill(null).map((_,i) => {
                const day = i+1;
                const key = dateKey(year, month, day);
                const items = schedules[key]||[];
                const isToday = key===todayKey;
                const isSel = key===selected;
                return (
                  <div key={day} className="day-cell" onClick={() => setSelected(key)} style={{ minHeight:96, padding:"8px 8px 6px", border:"1px solid", borderColor:isToday?"#c9a84c":isSel?"#8a7a5a":"#1e1e1e", borderRadius:6, background:isSel?"#1e1a14":isToday?"#181510":"#111", boxShadow:isToday?"0 0 0 1px rgba(201,168,76,0.27)":"none", cursor:"pointer", display:"flex", flexDirection:"column", position:"relative" }}>
                    <div style={{ fontFamily:"Playfair Display, serif", fontSize:14, marginBottom:6, color:isToday?"#c9a84c":isSel?"#d4c9a8":"#555", fontWeight:isToday?700:400 }}>{day}</div>
                    <div style={{ flex:1, overflow:"hidden" }}>
                      {items.slice(0,2).map(s => (
                        <div key={s.id} style={{ fontSize:9, padding:"2px 5px", borderRadius:2, marginBottom:3, fontFamily:"Lora, serif", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", background:PM[s.priority].bg, borderLeft:"2px solid "+PM[s.priority].color, color:PM[s.priority].color }}>
                          {s.work.length>16 ? s.work.slice(0,16)+"…" : s.work}
                        </div>
                      ))}
                      {items.length>2 && <div style={{ fontSize:9, color:"#444" }}>+{items.length-2}</div>}
                    </div>
                    <button className="cell-add" onClick={e => { e.stopPropagation(); openAdd(key); }} style={{ position:"absolute", bottom:5, right:6, background:"none", border:"none", color:"#555", fontSize:16, cursor:"pointer" }}>+</button>
                  </div>
                );
              })}
            </div>

            {selected && (
              <div className="slidein" style={{ marginTop:24, background:"#0f0e0c", border:"1px solid #1e1e1e", borderRadius:10, padding:24 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                  <div>
                    <div style={{ fontFamily:"Playfair Display, serif", fontSize:20, color:"#e8dfc8" }}>{selected}</div>
                    <div style={{ fontSize:12, color:"#444", marginTop:4, fontStyle:"italic" }}>{(schedules[selected]||[]).length} scheduled</div>
                  </div>
                  <button className="addbtn" onClick={() => openAdd(selected)} style={{ padding:"9px 18px", background:"#1a1710", border:"1px solid rgba(201,168,76,0.33)", color:"#c9a84c", borderRadius:6, cursor:"pointer", fontSize:12, fontFamily:"Lora, serif", fontStyle:"italic" }}>+ Add</button>
                </div>
                {!(schedules[selected]||[]).length ? (
                  <div style={{ padding:"32px 0", color:"#333", fontStyle:"italic", textAlign:"center" }}>Nothing planned — a rare open day.</div>
                ) : (
                  (schedules[selected]||[]).map(s => (
                    <div key={s.id} className="scard" style={cardStyle(s.priority)}>
                      <div style={{ flex:1 }}>
                        <span style={badgeStyle(s.priority)}>{s.priority}</span>
                        <div style={{ color:"#c8c0ae", fontSize:14, lineHeight:1.6 }}>{s.work}</div>
                      </div>
                      <div style={{ display:"flex", gap:8, marginLeft:12 }}>
                        <button className="iconbtn" onClick={() => openEdit(s)} style={iconBtnStyle}>&#9998;</button>
                        <button className="iconbtn delbtn" onClick={() => del(s.date, s.id)} style={iconBtnStyle}>&#x2715;</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:12 }}>
              <h1 style={{ fontFamily:"Playfair Display, serif", fontSize:26, fontWeight:700, color:"#e8dfc8" }}>All Schedules</h1>
              <div style={{ display:"flex", gap:8 }}>
                {["All","High","Medium","Low"].map(p => (
                  <button key={p} onClick={() => setFilter(p)} style={{ padding:"7px 14px", border:"1px solid", borderRadius:5, cursor:"pointer", fontSize:12, fontFamily:"Lora, serif", background:filter===p?(p==="All"?"#2a2318":PM[p]?.bg||"#2a2318"):"transparent", color:filter===p?(p==="All"?"#c9a84c":PM[p]?.color||"#c9a84c"):"#555", borderColor:filter===p?(p==="All"?"rgba(201,168,76,0.33)":(PM[p]?.color||"#c9a84c")+"55"):"#222" }}>{p}</button>
                ))}
              </div>
            </div>
            {!filtered.length ? (
              <div style={{ padding:"32px 0", color:"#333", fontStyle:"italic", textAlign:"center" }}>No schedules match this filter.</div>
            ) : (
              filtered.map((s,i) => (
                <div key={s.id} className="scard" style={{ ...cardStyle(s.priority), animationDelay:(i*0.04)+"s" }}>
                  <div style={{ minWidth:110, marginRight:16 }}>
                    <div style={{ color:"#c9a84c", fontSize:13, fontFamily:"Playfair Display, serif", marginBottom:4 }}>{s.date}</div>
                    <span style={badgeStyle(s.priority)}>{s.priority}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ color:"#c8c0ae", fontSize:14, lineHeight:1.6 }}>{s.work}</div>
                  </div>
                  <div style={{ display:"flex", gap:8, marginLeft:12 }}>
                    <button className="iconbtn" onClick={() => openEdit(s)} style={iconBtnStyle}>&#9998;</button>
                    <button className="iconbtn delbtn" onClick={() => del(s.date, s.id)} style={iconBtnStyle}>&#x2715;</button>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </main>

      {/* MODAL */}
      {modal && (
        <div onClick={() => setModal(false)} style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div className="modalin" onClick={e => e.stopPropagation()} style={{ background:"#0f0e0c", border:"1px solid #252218", borderRadius:12, padding:"32px 30px", width:"100%", maxWidth:460, display:"flex", flexDirection:"column", gap:14, boxShadow:"0 30px 80px rgba(0,0,0,0.6)" }}>
            <div style={{ fontFamily:"Playfair Display, serif", fontSize:22, fontWeight:700, color:"#e8dfc8" }}>
              {editItem ? "Edit Schedule" : "New Schedule"}
            </div>
            <div style={{ fontSize:12, color:"#444", fontStyle:"italic", marginTop:-8 }}>
              {editItem ? "Update the details below" : "Fill in the details to block this date"}
            </div>

            <label style={{ fontSize:10, color:"#555", letterSpacing:2, textTransform:"uppercase" }}>Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date:e.target.value }))} style={inputStyle} />

            <label style={{ fontSize:10, color:"#555", letterSpacing:2, textTransform:"uppercase" }}>Work Details</label>
            <textarea rows={4} value={form.work} onChange={e => setForm(f => ({ ...f, work:e.target.value }))} placeholder="What needs to get done on this day?" style={{ ...inputStyle, resize:"vertical", lineHeight:1.6 }} />

            <label style={{ fontSize:10, color:"#555", letterSpacing:2, textTransform:"uppercase" }}>Priority</label>
            <div style={{ display:"flex", gap:10 }}>
              {["High","Medium","Low"].map(p => (
                <button key={p} onClick={() => setForm(f => ({ ...f, priority:p }))} style={{ flex:1, padding:"10px 0", background:form.priority===p?PM[p].bg:"transparent", border:"1px solid "+(form.priority===p?PM[p].color:"#252525"), color:form.priority===p?PM[p].color:"#444", borderRadius:4, cursor:"pointer", fontSize:12, fontFamily:"Lora, serif" }}>{p}</button>
              ))}
            </div>

            <div style={{ display:"flex", gap:12, marginTop:8 }}>
              <button onClick={() => setModal(false)} style={{ flex:1, padding:"11px 0", background:"transparent", border:"1px solid #222", color:"#444", borderRadius:6, cursor:"pointer", fontSize:13, fontFamily:"Lora, serif" }}>Cancel</button>
              <button onClick={save} style={{ flex:1, padding:"11px 0", background:"#c9a84c", border:"none", color:"#0d0d0d", borderRadius:6, cursor:"pointer", fontSize:13, fontFamily:"Playfair Display, serif", fontWeight:700 }}>{editItem ? "Update" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}