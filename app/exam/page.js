"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ExamPage() {
  const router = useRouter();
  const [screen, setScreen]     = useState("access"); // access | exam | result
  const [email, setEmail]       = useState("");
  const [err, setErr]           = useState("");
  const [loading, setLoading]   = useState(false);
  const [questions, setQs]      = useState([]);
  const [answers, setAns]       = useState({});
  const [curQ, setCurQ]         = useState(0);
  const [timeLeft, setTL]       = useState(600);
  const [showExp, setShowExp]   = useState(true);
  const [popup, setPopup]       = useState(null);
  const [result, setResult]     = useState(null);
  const [allQs, setAllQs]       = useState([]);
  const [submitting, setSub]    = useState(false);
  const timerRef = useRef(null);
  const ansRef   = useRef({});
  const emailRef = useRef("");

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const startExam = async (em) => {
    setLoading(true);
    const data = await fetch(`/api/results?email=${encodeURIComponent(em)}`).then(r=>r.json());
    const settings = await fetch("/api/settings").then(r=>r.json());
    setQs(data.questions);
    setShowExp(data.showExplanation);
    setTL(settings.examDuration * 60);
    setAns({}); ansRef.current={}; setCurQ(0);
    emailRef.current = em;
    setScreen("exam");
    setLoading(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(()=>{
      setTL(t=>{ if(t<=1){clearInterval(timerRef.current);doSubmit(em,data.questions);return 0;} return t-1; });
    },1000);
  };

  const checkAccess = async () => {
    if (!email||!email.includes("@")) return setErr("Enter valid email");
    setLoading(true);
    const r = await fetch("/api/students",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"check",email})}).then(r=>r.json());
    if(r.error){setErr(r.error);setLoading(false);return;}
    await startExam(email);
  };

  const doSubmit = async (em, qs) => {
    clearInterval(timerRef.current);
    setSub(true);
    const qList = qs || questions;
    const r = await fetch("/api/results",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ email: em||emailRef.current, answers: ansRef.current, questionIds: qList.map(q=>q._id) })
    }).then(r=>r.json());
    setResult(r.result);
    setAllQs(r.questions);
    setScreen("result");
    setSub(false);
  };

  useEffect(()=>()=>clearInterval(timerRef.current),[]);

  // ── STUDENT ACCESS ──
  if(screen==="access") return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem",background:"var(--bg)"}}>
      <div style={{width:"100%",maxWidth:"420px"}}>
        <div style={{fontSize:"1.8rem",fontWeight:800,marginBottom:".5rem"}}>📝 Student Exam Access</div>
        <p style={{color:"var(--muted)",fontSize:".85rem",marginBottom:"2rem"}}>Enter the email your admin registered for you</p>
        {err&&<div className="error-msg">{err}</div>}
        <input className="input" type="email" placeholder="your@email.com" value={email}
          onChange={e=>{setEmail(e.target.value);setErr("");}}
          onKeyDown={e=>e.key==="Enter"&&checkAccess()}/>
        <div style={{display:"flex",gap:".8rem"}}>
          <button className="btn btn-ghost" style={{flex:1}} onClick={()=>router.push("/")}>Back</button>
          <button className="btn btn-primary" style={{flex:1}} onClick={checkAccess} disabled={loading}>
            {loading?"Checking...":"Start Exam →"}
          </button>
        </div>
        <p style={{color:"var(--muted)",fontSize:".78rem",marginTop:"1.5rem",textAlign:"center"}}>
          🔒 Only admin-approved emails can access the exam
        </p>
      </div>
    </div>
  );

  // ── EXAM ──
  if(screen==="exam") {
    if(!questions.length) return <div className="loading">Loading exam...</div>;
    const q = questions[curQ];
    const answered = Object.keys(answers).length;
    const tc = timeLeft<60?"var(--red)":timeLeft<180?"var(--yellow)":"var(--text)";
    return(
      <div style={{minHeight:"100vh",background:"var(--bg)"}}>
        <div style={{maxWidth:"720px",margin:"0 auto",padding:"2rem 1rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"2rem"}}>
            <div><div style={{fontSize:"1.3rem",fontWeight:700}}>MCQ Exam</div><div style={{fontSize:".8rem",color:"var(--muted)"}}>{email}</div></div>
            <div style={{fontFamily:"monospace",fontSize:"1.2rem",fontWeight:700,padding:".5rem 1.2rem",borderRadius:"10px",background:"var(--surface)",border:`1px solid ${tc}`,color:tc}}>{fmt(timeLeft)}</div>
          </div>
          <div style={{height:"4px",background:"var(--border)",borderRadius:"2px",marginBottom:"2rem",overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(answered/questions.length)*100}%`,background:"linear-gradient(90deg,var(--accent),var(--accent2))",borderRadius:"2px",transition:"width .4s"}}/>
          </div>
          <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"16px",padding:"2rem",marginBottom:"1.5rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:".8rem",fontSize:".85rem",color:"var(--muted)"}}>
              <span>Question {curQ+1} of {questions.length}</span>
              <span className="badge badge-blue">{answered} answered</span>
            </div>
            {q.category&&<div style={{fontSize:".78rem",color:"var(--accent2)",marginBottom:".8rem",fontStyle:"italic"}}>Category: <b>{q.category}</b></div>}
            <div style={{fontSize:"1.1rem",fontWeight:600,lineHeight:1.6,marginBottom:"1.5rem"}}>{q.question}</div>
            {q.options.map((opt,i)=>{
              const locked=answers[q._id]!==undefined; const sel=answers[q._id]===i;
              return(
                <button key={i} disabled={locked}
                  onClick={()=>{
                    if(locked)return;
                    const na={...ansRef.current,[q._id]:i}; setAns(na); ansRef.current=na;
                    if(i!==q.correct&&showExp&&q.explanation) setPopup({chosen:i,correct:q.correct,exp:q.explanation,opts:q.options});
                  }}
                  style={{width:"100%",textAlign:"left",padding:".9rem 1.2rem",borderRadius:"10px",border:`1px solid ${sel?"var(--accent)":"var(--border)"}`,background:sel?"rgba(59,130,246,.15)":"var(--surface2)",color:sel?"var(--accent)":"var(--text)",fontFamily:"'Sora',sans-serif",fontSize:".9rem",cursor:locked?"default":"pointer",marginBottom:".7rem",display:"flex",alignItems:"center",gap:".8rem"}}>
                  <div style={{width:"28px",height:"28px",borderRadius:"50%",border:"1px solid currentColor",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".8rem",fontWeight:700,flexShrink:0}}>{String.fromCharCode(65+i)}</div>
                  {opt}
                </button>
              );
            })}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1rem"}}>
            <div style={{display:"flex",gap:".4rem",flexWrap:"wrap"}}>
              {questions.map((_,i)=>(
                <div key={i} onClick={()=>setCurQ(i)}
                  style={{width:"10px",height:"10px",borderRadius:"50%",cursor:"pointer",transition:"all .2s",background:answers[questions[i]._id]!==undefined?"var(--accent)":"var(--border)",transform:i===curQ?"scale(1.5)":"scale(1)",boxShadow:i===curQ?"0 0 0 2px rgba(59,130,246,.4)":"none"}}/>
              ))}
            </div>
            <div style={{display:"flex",gap:".7rem"}}>
              {curQ>0&&<button className="btn btn-ghost btn-sm" onClick={()=>setCurQ(c=>c-1)}>← Previous</button>}
              {curQ<questions.length-1
                ?<button className="btn btn-primary btn-sm" onClick={()=>setCurQ(c=>c+1)}>Next →</button>
                :<button className="btn btn-success btn-sm" onClick={()=>doSubmit(email,questions)} disabled={submitting}>{submitting?"Submitting...":"✓ Submit Exam"}</button>}
            </div>
          </div>
        </div>
        {popup&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"1rem",backdropFilter:"blur(4px)"}}>
            <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"20px",padding:"2rem",maxWidth:"480px",width:"100%"}}>
              <div style={{fontSize:"2.5rem",textAlign:"center",marginBottom:".5rem"}}>❌</div>
              <div style={{fontSize:"1.2rem",fontWeight:700,textAlign:"center",marginBottom:"1.2rem",color:"var(--red)"}}>Incorrect Answer</div>
              <div style={{display:"flex",gap:".8rem",padding:".7rem 1rem",borderRadius:"10px",marginBottom:".6rem",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",color:"var(--red)"}}>
                <span style={{fontWeight:700,whiteSpace:"nowrap",minWidth:"120px"}}>Your answer:</span>
                <span>{String.fromCharCode(65+popup.chosen)}. {popup.opts[popup.chosen]}</span>
              </div>
              <div style={{display:"flex",gap:".8rem",padding:".7rem 1rem",borderRadius:"10px",marginBottom:".6rem",background:"rgba(16,185,129,.1)",border:"1px solid rgba(16,185,129,.3)",color:"var(--green)"}}>
                <span style={{fontWeight:700,whiteSpace:"nowrap",minWidth:"120px"}}>Correct answer:</span>
                <span>{String.fromCharCode(65+popup.correct)}. {popup.opts[popup.correct]}</span>
              </div>
              {popup.exp&&<div style={{background:"rgba(245,158,11,.07)",border:"1px solid rgba(245,158,11,.25)",borderRadius:"12px",padding:"1rem",marginTop:".8rem"}}>
                <div style={{fontWeight:700,color:"var(--yellow)",marginBottom:".5rem",fontSize:".9rem"}}>💡 Explanation</div>
                <div style={{fontSize:".88rem",lineHeight:1.6}}>{popup.exp}</div>
              </div>}
              <button className="btn btn-primary" style={{width:"100%",marginTop:"1rem"}} onClick={()=>{setPopup(null);if(curQ<questions.length-1)setCurQ(c=>c+1);}}>Got it — Next Question →</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── RESULT ──
  if(screen==="result"&&result) {
    const pass=result.score>=50;
    return(
      <div style={{minHeight:"100vh",background:"var(--bg)"}}>
        <div style={{maxWidth:"720px",margin:"0 auto",padding:"2rem 1rem"}}>
          <div style={{textAlign:"center",padding:"2.5rem 0 1.5rem"}}>
            <div style={{width:"160px",height:"160px",borderRadius:"50%",margin:"0 auto 1.5rem",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",border:`5px solid ${pass?"var(--green)":"var(--red)"}`,color:pass?"var(--green)":"var(--red)"}}>
              <div style={{fontSize:"2.4rem",fontWeight:800,fontFamily:"monospace"}}>{result.score}%</div>
              <div style={{fontSize:".8rem",fontWeight:700,marginTop:".3rem"}}>{pass?"PASS ✓":"FAIL ✗"}</div>
            </div>
            <h2 style={{fontSize:"1.5rem",fontWeight:700,marginBottom:".4rem"}}>{pass?"🎉 Congratulations!":"😔 Better luck next time"}</h2>
            <p style={{color:"var(--muted)",marginBottom:"1rem"}}>You got <b style={{color:"var(--text)"}}>{result.correct}</b> out of <b style={{color:"var(--text)"}}>{result.total}</b> correct</p>
            <div style={{display:"flex",gap:"1rem",justifyContent:"center",flexWrap:"wrap",marginBottom:"1.5rem"}}>
              <span className="badge badge-green">✅ {result.correct} Correct</span>
              <span className="badge badge-red">❌ {result.total-result.correct} Wrong</span>
              <span className="badge badge-blue">📊 {result.score}%</span>
            </div>
            <button className="btn btn-primary" onClick={()=>router.push("/")}>← Back to Home</button>
          </div>
          <h3 style={{margin:"2rem 0 1rem",fontSize:"1.1rem",fontWeight:700}}>📋 Answer Review</h3>
          {allQs.map((q,i)=>{
            const given=answers[q._id]; const ok=given===q.correct;
            return(
              <div key={q._id} style={{borderRadius:"14px",padding:"1.2rem",marginBottom:"1rem",border:`1px solid ${ok?"rgba(16,185,129,.2)":"rgba(239,68,68,.2)"}`,background:ok?"rgba(16,185,129,.04)":"rgba(239,68,68,.04)"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:".6rem"}}>
                  <div><span style={{color:"var(--muted)",fontSize:".75rem",fontFamily:"monospace",marginRight:".5rem"}}>Q{i+1}</span>{q.category&&<span className="badge badge-blue" style={{fontSize:".7rem"}}>{q.category}</span>}</div>
                  <span>{ok?"✅ Correct":"❌ Incorrect"}</span>
                </div>
                <div style={{fontWeight:600,marginBottom:".9rem",lineHeight:1.5}}>{q.question}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".4rem"}}>
                  {q.options.map((o,j)=>(
                    <div key={j} style={{padding:".55rem .9rem",borderRadius:"8px",fontSize:".83rem",lineHeight:1.4,border:`1px solid ${j===q.correct?"var(--green)":j===given&&!ok?"var(--red)":"var(--border)"}`,background:j===q.correct?"rgba(16,185,129,.12)":j===given&&!ok?"rgba(239,68,68,.12)":"var(--surface2)",color:j===q.correct?"var(--green)":j===given&&!ok?"var(--red)":"var(--text)"}}>
                      <b>{String.fromCharCode(65+j)}.</b> {o}{j===q.correct&&<b> ← Correct</b>}{j===given&&!ok&&<b> ← Your answer</b>}
                    </div>
                  ))}
                </div>
                {!ok&&q.explanation&&<div style={{marginTop:".9rem",padding:".9rem 1rem",borderRadius:"10px",background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.25)"}}>
                  <div style={{fontWeight:700,color:"var(--yellow)",marginBottom:".4rem",fontSize:".88rem"}}>💡 Explanation</div>
                  <div style={{fontSize:".86rem",lineHeight:1.65}}>{q.explanation}</div>
                </div>}
              </div>
            );
          })}
          <button className="btn btn-primary" style={{width:"100%",marginTop:"1rem",marginBottom:"3rem"}} onClick={()=>router.push("/")}>← Back to Home</button>
        </div>
      </div>
    );
  }
  return null;
}
