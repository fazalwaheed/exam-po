"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      background:"radial-gradient(ellipse at 20% 20%,rgba(59,130,246,.08),transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(6,182,212,.06),transparent 50%),#0a0e1a"}}>
      <div style={{textAlign:"center",padding:"2rem"}}>
        <div style={{fontSize:"2.8rem",fontWeight:800,letterSpacing:"-1px",marginBottom:".5rem"}}>
          Exam<span style={{background:"linear-gradient(135deg,#3b82f6,#06b6d4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Portal</span>
        </div>
        <p style={{color:"var(--muted)",marginBottom:"3rem"}}>Secure Online MCQ Examination System</p>
        <div style={{display:"flex",gap:"1.5rem",flexWrap:"wrap",justifyContent:"center"}}>
          {[
            {icon:"🔐",title:"Admin",desc:"Create tests, manage students & view results",path:"/admin"},
            {icon:"📝",title:"Student",desc:"Enter your email to access your exam",path:"/exam"},
          ].map((c,i)=>(
            <div key={i} onClick={()=>router.push(c.path)}
              style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"16px",
                padding:"2rem 2.5rem",cursor:"pointer",width:"220px",transition:"all .25s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 16px 40px rgba(59,130,246,.2)"}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none"}}>
              <div style={{fontSize:"2.5rem",marginBottom:"1rem"}}>{c.icon}</div>
              <h3 style={{fontSize:"1.1rem",fontWeight:700,marginBottom:".4rem"}}>{c.title}</h3>
              <p style={{color:"var(--muted)",fontSize:".82rem"}}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
