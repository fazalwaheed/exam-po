"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = (path, opts={}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : "";
  return fetch(path, {
    ...opts,
    headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}`, ...(opts.headers||{}) }
  }).then(r => r.json());
};

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [pw, setPw]         = useState("");
  const [err, setErr]       = useState("");
  const [tab, setTab]       = useState("questions");

  useEffect(() => {
    if (localStorage.getItem("adminToken")) setAuthed(true);
  }, []);

  const login = async () => {
    if (!pw) return setErr("Enter password");
    const res = await fetch("/api/auth", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ password: pw })
    }).then(r=>r.json());
    if (res.token) { localStorage.setItem("adminToken", res.token); setAuthed(true); }
    else setErr(res.error || "Incorrect password");
  };

  if (!authed) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem",background:"var(--bg)"}}>
      <div style={{width:"100%",maxWidth:"420px"}}>
        <div style={{fontSize:"1.8rem",fontWeight:800,marginBottom:".5rem"}}>🔐 Admin Login</div>
        <p style={{color:"var(--muted)",fontSize:".85rem",marginBottom:"2rem"}}>Default password: <b>admin123</b></p>
        {err && <div className="error-msg">{err}</div>}
        <input className="input" type="password" placeholder="Enter password" value={pw}
          onChange={e=>{setPw(e.target.value);setErr("");}}
          onKeyDown={e=>e.key==="Enter"&&login()} />
        <div style={{display:"flex",gap:".8rem"}}>
          <button className="btn btn-ghost" style={{flex:1}} onClick={()=>router.push("/")}>Back</button>
          <button className="btn btn-primary" style={{flex:1}} onClick={login}>Login</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <div className="page">
        <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"2rem"}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>router.push("/")}>← Home</button>
          <div style={{fontSize:"1.5rem",fontWeight:700}}>Admin Panel</div>
          <button className="btn btn-ghost btn-sm" style={{marginLeft:"auto"}}
            onClick={()=>{localStorage.removeItem("adminToken");setAuthed(false);}}>
            Logout
          </button>
        </div>
        <div style={{display:"flex",gap:".5rem",marginBottom:"1.5rem",borderBottom:"1px solid var(--border)",paddingBottom:".8rem",flexWrap:"wrap"}}>
          {[{id:"questions",l:"📋 Questions"},{id:"students",l:"👥 Students"},{id:"results",l:"📊 Results"},{id:"settings",l:"⚙️ Settings"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{background:tab===t.id?"var(--surface)":"none",border:"none",color:tab===t.id?"var(--accent)":"var(--muted)",fontFamily:"'Sora',sans-serif",fontSize:".9rem",padding:".5rem 1rem",cursor:"pointer",borderRadius:"8px",fontWeight:tab===t.id?600:400}}>
              {t.l}
            </button>
          ))}
        </div>
        {tab==="questions" && <QuestionsTab />}
        {tab==="students"  && <StudentsTab  />}
        {tab==="results"   && <ResultsTab   />}
        {tab==="settings"  && <SettingsTab  />}
      </div>
    </div>
  );
}

function QuestionsTab() {
  const [qs, setQs]       = useState([]);
  const [show, setShow]   = useState(false);
  const [msg, setMsg]     = useState({t:"",s:""});
  const [nq, setNq]       = useState({question:"",options:["","","",""],correct:0,explanation:"",category:""});

  const load = () => API("/api/questions").then(setQs);
  useEffect(()=>{load();},[]);

  const add = async () => {
    if (!nq.question || nq.options.some(o=>!o)) return setMsg({t:"Fill question and all 4 options",s:"error"});
    await API("/api/questions",{method:"POST",body:JSON.stringify(nq)});
    setMsg({t:"Question added ✓",s:"success"});
    setNq({question:"",options:["","","",""],correct:0,explanation:"",category:""});
    setShow(false); load(); setTimeout(()=>setMsg({t:"",s:""}),3000);
  };

  const del = async id => {
    if(!window.confirm("Delete?")) return;
    await API(`/api/questions/${id}`,{method:"DELETE"}); load();
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"1rem",alignItems:"center"}}>
        <span style={{color:"var(--muted)",fontSize:".85rem"}}>{qs.length} questions</span>
        <button className="btn btn-primary btn-sm" onClick={()=>setShow(!show)}>{show?"✕ Cancel":"+ Add Question"}</button>
      </div>
      {msg.t && <div className={msg.s==="error"?"error-msg":"success-msg"}>{msg.t}</div>}
      {show && (
        <div className="card">
          <div className="card-title">➕ New Question</div>
          <label className="field-label">Question *</label>
          <input className="input" placeholder="Type question..." value={nq.question} onChange={e=>setNq({...nq,question:e.target.value})}/>
          <label className="field-label">Category (optional)</label>
          <input className="input" placeholder="e.g. Thermochemistry, Chapter 5..." value={nq.category} onChange={e=>setNq({...nq,category:e.target.value})}/>
          <label className="field-label">4 Options *</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".5rem",marginBottom:".8rem"}}>
            {nq.options.map((o,i)=>(
              <input key={i} className="input" placeholder={`Option ${String.fromCharCode(65+i)}`} value={o} style={{marginBottom:0}}
                onChange={e=>{const ops=[...nq.options];ops[i]=e.target.value;setNq({...nq,options:ops});}}/>
            ))}
          </div>
          <label className="field-label">Correct Answer *</label>
          <select className="input" value={nq.correct} onChange={e=>setNq({...nq,correct:+e.target.value})}>
            {nq.options.map((o,i)=><option key={i} value={i}>{String.fromCharCode(65+i)}. {o||"(empty)"}</option>)}
          </select>
          <label className="field-label">Explanation (shown when student answers wrong)</label>
          <textarea className="input" rows={3} placeholder="Explain the correct answer..." value={nq.explanation} onChange={e=>setNq({...nq,explanation:e.target.value})}/>
          <div style={{display:"flex",gap:".5rem"}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>setShow(false)}>Cancel</button>
            <button className="btn btn-success btn-sm" onClick={add}>✓ Save</button>
          </div>
        </div>
      )}
      {qs.map((q,i)=>(
        <div key={q._id} style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:"12px",padding:"1.2rem",marginBottom:"1rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:".5rem"}}>
            <div>
              <span style={{color:"var(--muted)",fontSize:".75rem",fontFamily:"monospace"}}>Q{i+1}</span>
              {q.category&&<span className="badge badge-blue" style={{marginLeft:".5rem",fontSize:".7rem"}}>{q.category}</span>}
            </div>
            <button className="btn btn-danger btn-sm" onClick={()=>del(q._id)}>Delete</button>
          </div>
          <div style={{fontWeight:600,marginBottom:".7rem",lineHeight:1.5}}>{q.question}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".5rem"}}>
            {q.options.map((o,j)=>(
              <div key={j} style={{padding:".5rem .8rem",borderRadius:"8px",fontSize:".85rem",
                border:`1px solid ${j===q.correct?"var(--green)":"var(--border)"}`,
                background:j===q.correct?"rgba(16,185,129,.1)":"var(--surface)",
                color:j===q.correct?"var(--green)":"var(--text)"}}>
                {String.fromCharCode(65+j)}. {o} {j===q.correct&&"✓"}
              </div>
            ))}
          </div>
          {q.explanation&&<div style={{marginTop:".8rem",padding:".7rem 1rem",borderRadius:"8px",background:"rgba(245,158,11,.07)",border:"1px solid rgba(245,158,11,.2)",fontSize:".82rem",lineHeight:1.5}}><span style={{fontWeight:600,color:"var(--yellow)"}}>💡 </span>{q.explanation}</div>}
        </div>
      ))}
    </div>
  );
}

function StudentsTab() {
  const [sts, setSts] = useState([]);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState({t:"",s:""});
  const [res, setRes] = useState([]);

  useEffect(()=>{
    API("/api/students").then(setSts);
    API("/api/results").then(setRes);
  },[]);

  const add = async () => {
    if (!email||!email.includes("@")) return setMsg({t:"Enter valid email",s:"error"});
    const r = await API("/api/students",{method:"POST",body:JSON.stringify({email})});
    if(r.error) return setMsg({t:r.error,s:"error"});
    setMsg({t:"Student added ✓",s:"success"}); setEmail("");
    API("/api/students").then(setSts);
    setTimeout(()=>setMsg({t:"",s:""}),3000);
  };

  const remove = async id => {
    if(!window.confirm("Remove?")) return;
    await API(`/api/students/${id}`,{method:"DELETE"});
    API("/api/students").then(setSts);
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">Add Student Email</div>
        {msg.t&&<div className={msg.s==="error"?"error-msg":"success-msg"}>{msg.t}</div>}
        <div style={{display:"flex",gap:".7rem"}}>
          <input className="input" placeholder="student@email.com" value={email}
            onChange={e=>setEmail(e.target.value)} style={{marginBottom:0,flex:1}}
            onKeyDown={e=>e.key==="Enter"&&add()}/>
          <button className="btn btn-primary" onClick={add}>Add</button>
        </div>
        <p style={{color:"var(--muted)",fontSize:".78rem",marginTop:".5rem"}}>Only added emails can access the exam</p>
      </div>
      <div className="card">
        <div className="card-title">Allowed Students ({sts.length})</div>
        {sts.length===0&&<p style={{color:"var(--muted)"}}>No students added yet</p>}
        {sts.map(s=>(
          <div key={s._id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:".9rem 1rem",borderBottom:"1px solid var(--border)"}}>
            <div>
              <div style={{fontFamily:"monospace",fontSize:".85rem"}}>{s.email}</div>
              {res.find(r=>r.email===s.email)&&<div style={{fontSize:".72rem",color:"var(--muted)",marginTop:".2rem"}}>Score: {res.find(r=>r.email===s.email).score}%</div>}
            </div>
            <div style={{display:"flex",gap:".5rem",alignItems:"center"}}>
              <span className={`badge ${s.hasAttempted?"badge-green":"badge-yellow"}`}>{s.hasAttempted?"✓ Done":"Pending"}</span>
              <button className="btn btn-danger btn-sm" onClick={()=>remove(s._id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsTab() {
  const [res, setRes] = useState([]);
  useEffect(()=>{API("/api/results").then(setRes);},[]);
  if(!res.length) return <div className="card" style={{textAlign:"center",padding:"3rem"}}><div style={{fontSize:"2rem",marginBottom:"1rem"}}>📊</div><p style={{color:"var(--muted)"}}>No results yet</p></div>;
  const avg=Math.round(res.reduce((s,r)=>s+r.score,0)/res.length);
  const pass=res.filter(r=>r.score>=50).length;
  return(
    <div>
      <div className="card">
        <div style={{display:"flex",gap:"2rem",flexWrap:"wrap"}}>
          {[{v:avg+"%",l:"Average",c:"var(--accent)"},{v:pass,l:"Passed",c:"var(--green)"},{v:res.length-pass,l:"Failed",c:"var(--red)"},{v:res.length,l:"Total",c:"var(--text)"}].map((s,i)=>(
            <div key={i}><div style={{fontSize:"1.5rem",fontWeight:800,color:s.c,fontFamily:"monospace"}}>{s.v}</div><div style={{color:"var(--muted)",fontSize:".8rem"}}>{s.l}</div></div>
          ))}
        </div>
      </div>
      <div className="card">
        {res.map((r,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",padding:".9rem 1rem",borderBottom:"1px solid var(--border)"}}>
            <div style={{minWidth:"200px"}}>
              <div style={{fontFamily:"monospace",fontSize:".82rem"}}>{r.email}</div>
              <div style={{fontSize:".72rem",color:"var(--muted)"}}>{r.correct}/{r.total} correct · {new Date(r.createdAt).toLocaleDateString()}</div>
            </div>
            <div style={{flex:1,margin:"0 1rem"}}>
              <div style={{height:"6px",borderRadius:"3px",background:"var(--border)",overflow:"hidden"}}>
                <div style={{height:"100%",width:`${r.score}%`,borderRadius:"3px",background:r.score>=50?"var(--green)":"var(--red)"}}/>
              </div>
            </div>
            <span className={`badge ${r.score>=50?"badge-green":"badge-red"}`} style={{minWidth:"55px",textAlign:"center"}}>{r.score}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  const [dur,setDur]=useState(10); const [qps,setQps]=useState(0); const [se,setSe]=useState(true);
  const [dm,setDm]=useState("");
  const [op,setOp]=useState(""); const [np,setNp]=useState(""); const [cp,setCp]=useState("");
  const [sp,setSp]=useState(false); const [pm,setPm]=useState({t:"",s:""});

  useEffect(()=>{
    API("/api/settings").then(s=>{setDur(s.examDuration);setQps(s.questionsPerStudent||0);setSe(s.showExplanation!==false);});
  },[]);

  const save=async()=>{
    await API("/api/settings",{method:"PUT",body:JSON.stringify({examDuration:dur,questionsPerStudent:qps,showExplanation:se})});
    setDm("Settings saved ✓"); setTimeout(()=>setDm(""),3000);
  };

  const chpw=async()=>{
    if(!op||!np||!cp) return setPm({t:"Fill all fields",s:"error"});
    if(np!==cp) return setPm({t:"Passwords don't match",s:"error"});
    if(np.length<6) return setPm({t:"Min 6 characters",s:"error"});
    const v=await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"verify",password:op})}).then(r=>r.json());
    if(v.error) return setPm({t:"Current password incorrect",s:"error"});
    await API("/api/auth",{method:"POST",body:JSON.stringify({action:"changePassword",newPassword:np})});
    setPm({t:"Password changed ✓",s:"success"}); setOp(""); setNp(""); setCp("");
    setTimeout(()=>setPm({t:"",s:""}),3000);
  };

  return(
    <div>
      <div className="card">
        <div className="card-title">⏱️ Exam Settings</div>
        {dm&&<div className="success-msg">{dm}</div>}
        <label className="field-label">Exam Duration (minutes)</label>
        <input className="input" type="number" min="1" max="180" value={dur} onChange={e=>setDur(+e.target.value)} style={{maxWidth:"200px"}}/>
        <label className="field-label" style={{marginTop:".5rem"}}>Questions per Student <span style={{color:"var(--muted)",fontWeight:400,fontSize:".8rem"}}>(0 = all)</span></label>
        <input className="input" type="number" min="0" value={qps} onChange={e=>setQps(+e.target.value)} style={{maxWidth:"200px"}}/>
        <p style={{color:"var(--muted)",fontSize:".78rem",marginBottom:".8rem"}}>e.g. 50 questions → set 30 → each student gets 30 random different questions.</p>
        <label style={{display:"flex",alignItems:"center",gap:".6rem",cursor:"pointer",marginBottom:"1rem"}}>
          <input type="checkbox" checked={se} onChange={e=>setSe(e.target.checked)} style={{width:"16px",height:"16px"}}/>
          <span style={{fontSize:".9rem"}}>Show explanation popup when student answers incorrectly</span>
        </label>
        <button className="btn btn-primary btn-sm" onClick={save}>💾 Save Settings</button>
      </div>
      <div className="card">
        <div className="card-title">🔐 Change Password</div>
        {pm.t&&<div className={pm.s==="error"?"error-msg":"success-msg"}>{pm.t}</div>}
        <label className="field-label">Current Password</label>
        <input className="input" type={sp?"text":"password"} placeholder="Current password" value={op} onChange={e=>{setOp(e.target.value);setPm({t:"",s:""});}}/>
        <label className="field-label">New Password</label>
        <input className="input" type={sp?"text":"password"} placeholder="New password (min 6 chars)" value={np} onChange={e=>{setNp(e.target.value);setPm({t:"",s:""});}}/>
        <label className="field-label">Confirm New Password</label>
        <input className="input" type={sp?"text":"password"} placeholder="Repeat new password" value={cp} onChange={e=>{setCp(e.target.value);setPm({t:"",s:""});}}/>
        <div style={{display:"flex",gap:"1rem",alignItems:"center",flexWrap:"wrap"}}>
          <button className="btn btn-danger btn-sm" onClick={chpw}>🔑 Update Password</button>
          <label style={{display:"flex",alignItems:"center",gap:".4rem",fontSize:".82rem",color:"var(--muted)",cursor:"pointer"}}>
            <input type="checkbox" checked={sp} onChange={e=>setSp(e.target.checked)}/> Show passwords
          </label>
        </div>
      </div>
    </div>
  );
}
