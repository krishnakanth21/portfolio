import { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Mail, Linkedin, Github, Code2, Send, ArrowRight } from "lucide-react";
import CaseStudies from "./pages/CaseStudies.jsx";
import CaseStudyDetail from "./pages/CaseStudyDetail.jsx";
import { CASE_STUDIES } from "./data/caseStudies.js";

// ── DATA ──────────────────────────────────────────────────────────────────────

const NAV = [
  { id: "home",        label: "Home" },
  { id: "experience",  label: "Experience" },
  { id: "casestudies", label: "Case Studies" },
  { id: "writing",     label: "Writing" },
  { id: "projects",    label: "Projects" },
  { id: "skills",      label: "Skills" },
  { id: "contact",     label: "Contact" },
];


const STATS = [
  { value: "5+",    label: "Years experience" },
  { value: "~40%",  label: "P95 latency cut" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "450+",  label: "LeetCode problems" },
];

const EXPERIENCE = [
  {
    company: "athenahealth",
    logo: { type: 'img', src: '/logos/athenahealth.png', bg: '#fff' },
    role: "Member of Technical Staff",
    period: "Aug 2023 – Present",
    location: "Chennai, India",
    current: true,
    bullets: [
      "Redesigned autoscaling (CPU → queue-depth metrics), reducing P95 latency by ~40% under peak load.",
      "Led multi-region disaster recovery (us-east ↔ us-west) with automated failover and zero-downtime drills.",
      "Migrated CloudFormation → Terraform, reducing infrastructure management effort by ~40%.",
      "Orchestrated ECS → EKS migration with zero business disruption across all environments.",
      "Owned pre-prod reliability for 6+ teams; implemented Grafana dashboards and Prometheus alerting.",
      "Maintained 99.9% uptime across mission-critical AR finance workflows.",
    ],
    tech: ["Java", "Spring Boot", "AWS ECS/EKS", "Terraform", "Kubernetes", "PostgreSQL", "Prometheus", "Grafana"],
  },
  {
    company: "Accolite Digital",
    logo: { type: 'img', src: '/logos/accolite.png', bg: '#fff' },
    role: "Senior Software Engineer",
    period: "Jan 2021 – Aug 2023",
    location: "Remote",
    current: false,
    bullets: [
      "Built 10+ REST APIs for FedEx CrewPay — enterprise payroll processing system.",
      "Delivered 10+ large-scale Paytm insurance integrations, enabling real-time data pipelines.",
      "Designed multi-database synchronization layer for distributed fintech operations.",
    ],
    tech: ["Java", "Spring Boot", "REST APIs", "SQL", "Microservices"],
  },
  {
    company: "Profinch",
    logo: { type: 'img', src: '/logos/profinch.png', bg: '#fff', fallbackAbbr: 'PF', fallbackColor: '#4060ee', fallbackBg: 'rgba(64,96,238,0.12)' },
    role: "Data Analyst Intern",
    period: "May 2020 – Jun 2020",
    location: "Bangalore, India",
    current: false,
    bullets: [
      "Built Python AML rule engine over Microsoft SQL Server for fraud detection.",
      "Identified suspicious financial transaction patterns in production data.",
    ],
    tech: ["Python", "SQL Server", "AML", "Data Analysis"],
  },
];

const METRICS = [
  { value: "~40%",     label: "P95 Latency Reduction",      desc: "Queue-depth autoscaling overhaul",           counter: { to: 40,   prefix: "~",   suffix: "%"  } },
  { value: "99.9%",    label: "Uptime Maintained",           desc: "Financial-grade SLA",                        counter: { to: 99.9, prefix: "",    suffix: "%", decimals: 1 } },
  { value: "60–70%",   label: "Startup Speedup",             desc: "S3 binary externalization",                  counter: { to: 70,   prefix: "60–", suffix: "%"  } },
  { value: "~40%",     label: "Infra Effort Saved",          desc: "CloudFormation → Terraform",                 counter: { to: 40,   prefix: "~",   suffix: "%"  } },
  { value: "70%",      label: "PreProd Incidents Reduced",   desc: "Enhanced monitoring & alerting",             counter: { to: 70,   prefix: "",    suffix: "%"  } },
  { value: "0",     label: "Downtime During Migration",   desc: "ECS → EKS migration with zero disruption",   counter: null },
  { value: "80%",      label: "DB Latency Reduced",          desc: "Added optimized DB indexing with intensive monitoring", counter: { to: 80, prefix: "", suffix: "%" } },
  { value: "< 200ms",  label: "Bulk API Latency",            desc: "Complex endpoint with 2-query architecture", counter: { to: 200, prefix: "< ", suffix: "ms" } },
];

const PROJECTS = [
  {
    title: "Posting Issues Classification & Metrics",
    desc:  "GenAI-powered analytics platform for healthcare insurance billing accuracy. Uses OpenAI + BERT for NLP classification and generates structured corrective metrics.",
    tech:  ["Python", "GenAI", "BERT", "OpenAI API"],
    link:  null,
  },
  {
    title: "COVID-19 Social Media Stress Analysis",
    desc:  "Real-time Twitter sentiment analysis pipeline for stress detection, recommending contextual stress-mitigation resources based on classified emotional states.",
    tech:  ["Python", "NLP", "Twitter API", "Sentiment Analysis"],
    link:  null,
  },
];

const SKILLS = {
  Languages:                  ["Java", "SQL", "Python", "Perl", "Bash", "C++"],
  Backend:                    ["Spring Boot", "REST APIs", "Microservices", "Distributed Systems", "Async Messaging", "Event-Driven Architecture"],
  "Cloud & AWS":              ["ECS", "EKS", "EC2", "S3", "RDS", "SQS", "API Gateway", "CloudWatch", "IAM", "DMS", "SSM", "Secrets Manager", "Parameter Store", "AWS SageMaker"],
  Infrastructure:             ["Terraform", "Docker", "Kubernetes", "Helm", "Jenkins", "Harness", "CI/CD", "KEDA", "ExternalSecrets", "Infrastructure as Code (IaC)"],
  Observability:              ["Prometheus", "Grafana 11", "OpenSearch", "GrayLog", "AWS CloudWatch", "AlertManager", "Micrometer"],
  Databases:                  ["PostgreSQL", "Flyway", "Liquibase", "Debezium CDC", "Kafka/MSK", "DMS"],
  "Security & Secrets":       ["HashiCorp Vault", "AWS Secrets Manager", "IRSA", "IAM Roles and Groups", "Row-Level Security"],
  "Testing & Quality":        ["Locust", "JUnit", "Integration Testing", "Performance Testing", "Stress Testing", "Soak Testing", "Spike Testing", "Regression Testing", "Chaos Engineering", "Backward Compatibility Testing"],
  "Other Tools & Frameworks": ["Drools 8.44.0", "AWS SDK v1", "Spring Batch", "Hibernate", "AOP"],
  "Deployment Strategies":    ["Blue-Green Deployment", "Canary Releases", "Rolling Updates", "Feature Toggles", "SDK versioning"],
};

const ACHIEVEMENTS = [
  { icon: "🏆", text: "450+ LeetCode problems · 500+ day streak" },
  { icon: "⭐", text: "HackerRank 5-Star Gold Badge" },
  { icon: "📄", text: "IEEE Publication — IS'20 Conference" },
  { icon: "🥇", text: "CBSE Gold Medal in English" },
  { icon: "📊", text: "Class XII: 96.8% — Top 1 Percentile" },
  { icon: "🎓", text: "B.E. CS — SSN College (CGPA 8.56)" },
];

// Featured case studies for portfolio preview (3 picks)
const FEATURED_CS = CASE_STUDIES.filter(cs =>
  ["claims-view-bulk-api", "eks-migration", "cdc-pipeline"].includes(cs.id)
);

const SYSTEMS = [
  {
    abbr: "S-1",
    metric: "8-Layer",
    metricLabel: "Tenant Isolation",
    title: "Multi-Tenant Security Architecture",
    hook: "HIPAA-compliant isolation enforced at 8 independent layers — from RLS to application-level guards",
    id: "tenant-isolation",
    tags: ["PostgreSQL", "Row-Level Security", "Spring Boot"],
  },
  {
    abbr: "A-1",
    metric: "N → 1",
    metricLabel: "API Calls",
    title: "AR Claims View Bulk API",
    hook: "Collapsed N per-page API calls into a single 2-query architecture, cutting latency to < 200ms",
    id: "claims-view-bulk-api",
    tags: ["Spring Boot", "PostgreSQL", "REST API"],
  },
  {
    abbr: "P-1",
    metric: "0",
    metricLabel: "Downtime",
    title: "Zero-Downtime EKS Migration",
    hook: "ECS → EKS migration coordinating 6 teams across all environments with zero business disruption",
    id: "eks-migration",
    tags: ["Kubernetes", "Helm", "Harness CI/CD"],
  },
];

const ARTICLES = [
  {
    title: "PostgreSQL CDC Done Right: Achieving Sub-30s P99 Replication Lag",
    summary: "How I reduced replication lag from 7 days to under 30 seconds using Debezium and Kafka, with zero data loss and no application downtime.",
    url: "https://medium.com/@krishnakanthe99/postgresql-cdc-done-right-achieving-sub-30s-p99-replication-lag-ca003e0358be",
    tags: ["PostgreSQL", "Debezium", "Kafka", "CDC"],
  },
  {
    title: "Zero-Downtime EKS Migration: Production-Grade Kubernetes at Scale",
    summary: "A step-by-step breakdown of migrating from ECS to EKS across 6 teams — covering Helm, KEDA autoscaling, Vault integration, and rollback strategy.",
    url: "https://medium.com/@krishnakanthe99/zero-downtime-eks-migration-production-grade-kubernetes-at-scale-fe4725cb70bb",
    tags: ["Kubernetes", "EKS", "Helm", "DevOps"],
  },
  {
    title: "Building Secure Financial Applications with Claude Code",
    summary: "Security-first patterns for HIPAA-compliant healthcare systems — multi-tenant isolation, secrets management, audit trails, and AI-assisted development.",
    url: "https://medium.com/@krishnakanthe99/building-secure-financial-applications-with-claude-code-a-security-first-approach-65b8decca971",
    tags: ["Security", "HIPAA", "Claude Code", "FinTech"],
  },
];

// ── HOOKS ─────────────────────────────────────────────────────────────────────


function useActiveSection() {
  const [active, setActive] = useState("home");
  useEffect(() => {
    const ids = NAV.map(n => n.id);
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { threshold: 0.2 }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return active;
}

function useCountUp(target, { decimals = 0, duration = 1800 } = {}, inView) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!inView || started.current || target === null) return;
    started.current = true;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const val = ease * target;
      setCount(decimals > 0 ? parseFloat(val.toFixed(decimals)) : Math.floor(val));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(target);
    };
    requestAnimationFrame(tick);
  }, [inView, target, decimals, duration]);
  return count;
}

function MetricCard({ m }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const animated = useCountUp(
    m.counter ? m.counter.to : null,
    { decimals: m.counter?.decimals || 0, duration: 1600 },
    inView
  );
  const displayValue = m.counter
    ? `${m.counter.prefix}${animated}${m.counter.suffix}`
    : m.value;
  return (
    <div ref={ref} className="metric-card">
      <div className="metric-value" style={{ transition: 'opacity 0.3s', opacity: inView ? 1 : 0 }}>{displayValue}</div>
      <div className="metric-label">{m.label}</div>
      <div className="metric-desc">{m.desc}</div>
    </div>
  );
}

function LeetCodeHeatmap() {
  const [calendar, setCalendar] = useState(null);
  const [badges, setBadges]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const cached = sessionStorage.getItem('lc_data');
    if (cached) {
      const { calendar, badges } = JSON.parse(cached);
      setCalendar(calendar);
      setBadges(badges);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    fetch('/api/leetcode', { signal: ctrl.signal })
      .then(r => r.json())
      .then(json => {
        const calendar = JSON.parse(json.submissionCalendar);
        const badges = json.badges || [];
        sessionStorage.setItem('lc_data', JSON.stringify({ calendar, badges }));
        setCalendar(calendar);
        setBadges(badges);
        setLoading(false);
      })
      .catch(e => {
        if (e.name === 'AbortError') return;
        setError(e.message);
        setLoading(false);
      });
    return () => ctrl.abort();
  }, []);

  if (loading) return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginTop: 24, color: 'var(--text-muted)', fontSize: 13 }}>
      ⏳ Loading LeetCode activity…
    </div>
  );
  if (error || !calendar) return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: 14, padding: '20px 24px', marginTop: 24, color: '#f87171', fontSize: 13 }}>
      ⚠ LeetCode heatmap failed — check browser console + Vite terminal for details.
      {error && <div style={{ marginTop: 6, opacity: 0.7, fontSize: 11 }}>{error}</div>}
    </div>
  );

  const MS = 24 * 3600 * 1000;
  const todayUTC = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
  let startMs = todayUTC - 51 * 7 * MS;
  startMs -= new Date(startMs).getUTCDay() * MS; // align to Sunday

  const weeks = [];
  for (let cur = startMs; cur <= todayUTC; cur += 7 * MS) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const ms = cur + d * MS;
      week.push({ ts: ms / 1000, count: calendar[ms / 1000] || 0, date: new Date(ms) });
    }
    weeks.push(week);
  }

  const allDays  = weeks.flat();
  const total    = allDays.reduce((s, d) => s + d.count, 0);
  const active   = allDays.filter(d => d.count > 0).length;
  let maxStreak = 0, streak = 0;
  for (const d of allDays) { d.count > 0 ? (streak++, maxStreak = Math.max(maxStreak, streak)) : (streak = 0); }

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthLabels = [];
  let lastM = -1;
  weeks.forEach((wk, wi) => {
    const m = wk[0].date.getUTCMonth();
    if (m !== lastM) { monthLabels.push({ wi, label: MONTHS[m] }); lastM = m; }
  });

  const color = n => n === 0 ? 'var(--heatmap-0)' : n <= 2 ? '#166534' : n <= 5 ? '#16a34a' : n <= 9 ? '#22c55e' : '#4ade80';
  const CELL = 13, GAP = 3;

  return (
    <div className="heatmap-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>
          <span style={{ color: 'var(--accent)' }}>{total.toLocaleString()}</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> submissions in the past one year</span>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>Total active days: <strong style={{ color: 'var(--text)' }}>{active}</strong></span>
          <span>Max streak: <strong style={{ color: 'var(--text)' }}>{maxStreak}</strong></span>
        </div>
      </div>

      <div className="heatmap-scroll">
        <div style={{ display: 'inline-block' }}>
          <div style={{ display: 'flex', gap: GAP }}>
            {weeks.map((wk, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                {wk.map((day, di) => (
                  <div key={di} title={`${day.date.toISOString().slice(0,10)}: ${day.count}`}
                    style={{ width: CELL, height: CELL, borderRadius: 3, background: color(day.count) }} />
                ))}
              </div>
            ))}
          </div>

          <div style={{ position: 'relative', height: 18, marginTop: 5 }}>
            {monthLabels.map(({ wi, label }) => (
              <span key={label + wi} style={{ position: 'absolute', left: wi * (CELL + GAP), fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="heatmap-scroll-hint">swipe to scroll</div>

      {badges.length > 0 && (
        <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Badges</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {badges.map((b, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 72 }}>
                <img
                  src={b.icon.startsWith('http') ? b.icon : `https://leetcode.com${b.icon}`}
                  alt={b.displayName}
                  style={{ width: 48, height: 48, objectFit: 'contain' }}
                />
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text)', textAlign: 'center', lineHeight: 1.3 }}>{b.displayName}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center' }}>{b.creationDate}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function useScrollProgress() {
  useEffect(() => {
    const update = () => {
      const el = document.getElementById("scroll-progress");
      if (!el) return;
      const total = document.body.scrollHeight - window.innerHeight;
      el.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
}

// ── COMPONENTS ────────────────────────────────────────────────────────────────

function CompanyLogo({ logo, company }) {
  const [failed, setFailed] = useState(false);
  const showImg = logo.type === 'img' && !failed;
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 10, flexShrink: 0,
      background: showImg ? (logo.bg || '#fff') : (logo.fallbackBg || logo.bg),
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", border: "1px solid var(--border)",
    }}>
      {showImg
        ? <img
            src={logo.src}
            alt={company}
            width={36} height={36}
            style={{ width: 36, height: 36, objectFit: "contain" }}
            onError={() => setFailed(true)}
          />
        : <span style={{ fontSize: 12, fontWeight: 800, color: logo.fallbackColor || logo.color, letterSpacing: "-0.02em" }}>
            {logo.fallbackAbbr || logo.abbr}
          </span>
      }
    </div>
  );
}

function Nav({ active, theme, setTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <nav>
        <a href="#home" className="nav-logo" onClick={close}>KK<span>.</span></a>
        <div className="nav-links">
          {NAV.map(n => (
            <a key={n.id} href={`#${n.id}`} className={`nav-link ${active === n.id ? "active" : ""}`}>
              {n.label}
            </a>
          ))}
          <button className="theme-btn" onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))} aria-label="Toggle light/dark theme">
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <button className="hamburger-btn" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          {NAV.map(n => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className={`mobile-nav-link ${active === n.id ? "active" : ""}`}
              onClick={close}
            >
              {n.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}

function Hero() {
  return (
    <section id="home">
      <h1 className="hero-name">
        Krishnakanth<br /><span className="accent">Eswaran</span>
      </h1>

      <p className="hero-role">
        Senior Software Engineer
      </p>

      <p className="hero-desc">
        Building high-throughput distributed financial systems on AWS.
        Specialized in resilience engineering, cloud infrastructure, and production reliability at scale.
      </p>

      <div className="hero-relocation">
        📍 Based in Chennai · Open to relocation — EU / London / Berlin / Amsterdam / Australia
      </div>

      <div className="hero-ctas">
        <a href="#casestudies" className="btn-primary">View Case Studies →</a>
        <a
          href="/Resume_Krishnakanth_EU_2026.pdf"
          download="Resume_Krishnakanth_Eswaran.pdf"
          className="btn-primary"
          style={{ background: 'var(--green)', color: '#fff' }}
        >↓ Resume PDF</a>
      </div>

      <div className="stats-row">
        {STATS.map(s => (
          <div className="stat-item" key={s.label}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Experience() {
  const [expanded, setExpanded] = useState(0);
  return (
    <section id="experience">
      <div className="section-eyebrow">02 — Experience</div>
      <h2 className="section-title">Where I've worked</h2>
      <div className="timeline">
        {EXPERIENCE.map((exp, i) => (
          <div className="timeline-item" key={i}>
            <div className={`timeline-dot ${exp.current ? "current" : ""}`} />
            <div className={`timeline-card ${expanded === i ? "open" : ""}`} onClick={() => setExpanded(e => e === i ? -1 : i)}>
              <div className="timeline-header">
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <CompanyLogo logo={exp.logo} company={exp.company} />
                  <div>
                    <div className="timeline-company">{exp.company}</div>
                    <div className="timeline-role">{exp.role}</div>
                  </div>
                </div>
                <div className="timeline-meta">
                  <div className="timeline-period">{exp.period}</div>
                  <div className="timeline-period">{exp.location}</div>
                  {exp.current && <span className="current-badge">● Current</span>}
                  <div className="expand-indicator" style={{ marginTop: 6 }}>
                    {expanded === i ? "▲ collapse" : "▼ expand"}
                  </div>
                </div>
              </div>
              {expanded === i && (
                <div className="timeline-body">
                  <ul className="timeline-bullets">
                    {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                  <div className="pill-row">
                    {exp.tech.map(t => <span className="pill" key={t}>{t}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ImpactMetrics() {
  return (
    <section style={{ paddingTop: 0 }}>
      <div className="section-eyebrow" style={{ marginBottom: 18 }}>Impact by the numbers</div>
      <div className="metrics-grid">
        {METRICS.map(m => <MetricCard key={m.label} m={m} />)}
      </div>
    </section>
  );
}

function CaseStudiesPreview() {
  const navigate = useNavigate();
  return (
    <section id="casestudies">
      <div className="section-eyebrow">03 — Case Studies</div>
      <h2 className="section-title">Engineering deep dives</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 28, maxWidth: 520, lineHeight: 1.75 }}>
        Eleven systems I've designed, built, and operated: documented with full STAR format, architecture decisions, and real metrics.
      </p>

      <p style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 28, maxWidth: 520, lineHeight: 1.75 }}>
        Click any case study below for a detailed walkthrough of the problem, solution, impact, and before/after metrics.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {FEATURED_CS.map(cs => (
          <FeaturedCsCard key={cs.id} cs={cs} onClick={() => navigate(`/case-studies/${cs.id}`)} />
        ))}
      </div>

      <button
        onClick={() => navigate("/case-studies")}
        className="btn-secondary"
        style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
      >
        View all 11 case studies <ArrowRight size={15} />
      </button>
    </section>
  );
}

function FeaturedCsCard({ cs, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="featured-cs-card"
      style={{
        width: "100%", textAlign: "left", fontFamily: "inherit", color: "var(--text)",
        background: "var(--bg-card)",
        border: `1px solid ${hovered ? "var(--border-accent)" : "var(--border)"}`,
        borderRadius: 14, padding: "18px 22px",
        cursor: "pointer",
        transform: hovered ? "translateX(4px)" : "none",
        transition: "border-color 0.2s, transform 0.2s",
        display: "flex", alignItems: "center", gap: 18,
      }}
    >
      <div style={{
        width: 48, height: 48, flexShrink: 0, borderRadius: 10,
        background: "var(--tag-bg)", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        border: "1px solid var(--border-accent)",
      }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: "var(--accent)", letterSpacing: "-0.04em", lineHeight: 1 }}>{cs.heroMetric.value}</div>
        <div style={{ fontSize: 8, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.2, marginTop: 2 }}>{cs.heroMetric.label}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", background: "var(--tag-bg)", border: "1px solid var(--border-accent)", borderRadius: 100, padding: "1px 8px" }}>{cs.code}</span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 100, padding: "1px 8px" }}>{cs.category}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 2 }}>{cs.title}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{cs.subtitle}</div>
      </div>
      <ArrowRight size={16} color="var(--text-faint)" style={{ flexShrink: 0 }} />
    </button>
  );
}

function Projects() {
  return (
    <section id="projects">
      <div className="section-eyebrow">05 — Projects &amp; Publications</div>
      <h2 className="section-title">Built &amp; published</h2>

      <div className="section-eyebrow" style={{ marginBottom: 14 }}>Publication</div>
      <div className="pub-card" style={{ marginBottom: 24, borderColor: 'var(--border-accent)' }}>
        <span className="pub-badge">IEEE IS'20</span>
        <div>
          <a href="https://ieeexplore.ieee.org/abstract/document/9199928" target="_blank" rel="noopener noreferrer" className="pub-link">
            User Independent Human Stress Detection
          </a>
          <p className="pub-desc">
            Proposed a user-independent model eliminating affective-state calibration.
            Achieved 95% (bi-affective), 85% (tri-affective), 83% (multi-affective) accuracy on WESAD dataset — outperforming all user-dependent baselines.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href="https://ieeexplore.ieee.org/abstract/document/9199928"
              target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600, color:'var(--accent)', background:'var(--tag-bg)', border:'1px solid var(--border-accent)', borderRadius:100, padding:'4px 12px', textDecoration:'none' }}
            >
              Read on IEEE Xplore ↗
            </a>
            {['Python', 'Machine Learning', 'WESAD Dataset', 'Stress Detection'].map(t => (
              <span className="pill" key={t}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="section-eyebrow" style={{ marginBottom: 14 }}>Projects</div>
      <div className="projects-grid">
        {PROJECTS.map((p, i) => (
          <div className="project-card" key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
              <div className="project-title" style={{ margin: 0 }}>{p.title}</div>
              {p.link
                ? <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", background: "var(--tag-bg)", border: "1px solid var(--border-accent)", borderRadius: 100, padding: "2px 10px", whiteSpace: "nowrap", textDecoration: "none", flexShrink: 0 }}>GitHub ↗</a>
                : <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 100, padding: "2px 10px", whiteSpace: "nowrap", flexShrink: 0 }}>Private / NDA</span>
              }
            </div>
            <div className="project-desc">{p.desc}</div>
            <div className="pill-row">
              {p.tech.map(t => <span className="pill" key={t}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section id="skills">
      <div className="section-eyebrow">06 — Skills &amp; Background</div>
      <h2 className="section-title">Technical toolkit</h2>

      <div style={{ marginBottom: 36 }}>
        <div className="section-eyebrow" style={{ marginBottom: 14 }}>Competitive Programming</div>
        <div className="comp-prog-banner">
          <div className="comp-prog-stats">
            <div className="comp-prog-stat">
              <div className="comp-prog-stat-value">450+</div>
              <div className="comp-prog-stat-label">Problems solved</div>
            </div>
            <div className="comp-prog-stat">
              <div className="comp-prog-stat-value">500+</div>
              <div className="comp-prog-stat-label">Day streak</div>
            </div>
            <div className="comp-prog-stat">
              <div className="comp-prog-stat-value">5★</div>
              <div className="comp-prog-stat-label">HackerRank Gold</div>
            </div>
          </div>
          <a
            href="https://leetcode.com/u/superkk1991/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ fontSize: 13, padding: '8px 16px' }}
          >
            LeetCode Profile ↗
          </a>
        </div>
        <LeetCodeHeatmap />
      </div>

      <div className="skills-grid">
        {Object.entries(SKILLS).map(([group, items]) => (
          <div className="skill-group" key={group}>
            <div className="skill-group-title">{group}</div>
            <div className="pill-row">
              {items.map(s => <span className="pill" key={s}>{s}</span>)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 36 }}>
        <div className="section-eyebrow" style={{ marginBottom: 16 }}>Achievements</div>
        <div className="achievements-grid">
          {ACHIEVEMENTS.map((a, i) => (
            <div className="achievement-card" key={i}>
              <span className="achievement-icon">{a.icon}</span>
              <span>{a.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [copied, setCopied] = useState(false);
  const EMAIL = "krishnakanthe99@gmail.com";
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(EMAIL); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <section id="contact">
      <div className="section-eyebrow">07 — Contact</div>
      <h2 className="section-title">Let's talk</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 28, maxWidth: 440, lineHeight: 1.75 }}>
        Open to Senior Backend, Platform Engineering, and SRE-II opportunities globally.
        Happy to chat about distributed systems, infrastructure, or anything else.
      </p>
      <div className="contact-grid">
        <a href="/Resume_Krishnakanth_EU_2026.pdf" download="Resume_Krishnakanth_Eswaran.pdf" className="contact-link" style={{ background: 'var(--green-bg)', borderColor: 'rgba(52,211,153,0.25)' }}>
          <div className="contact-link-icon" style={{ background: 'var(--green-bg)', color: 'var(--green-text)' }}>↓</div>
          <div>
            <div className="contact-link-title" style={{ color: 'var(--green-text)' }}>Download Resume</div>
            <div className="contact-link-sub">PDF</div>
          </div>
        </a>
        <button onClick={copyEmail} className="contact-link">
          <div className="contact-link-icon"><Mail size={16} /></div>
          <div>
            <div className="contact-link-title">{copied ? "✓ Copied!" : "Copy Email"}</div>
            <div className="contact-link-sub">{EMAIL}</div>
          </div>
        </button>
        <a href={`mailto:${EMAIL}`} className="contact-link">
          <div className="contact-link-icon"><Send size={16} /></div>
          <div>
            <div className="contact-link-title">Send Email</div>
            <div className="contact-link-sub">Open in mail client</div>
          </div>
        </a>
        <a href="https://linkedin.com/in/krishnakanth-eswaran" target="_blank" rel="noopener noreferrer" className="contact-link">
          <div className="contact-link-icon"><Linkedin size={16} /></div>
          <div>
            <div className="contact-link-title">LinkedIn</div>
            <div className="contact-link-sub">krishnakanth-eswaran</div>
          </div>
        </a>
        <a href="https://github.com/krishnakanth21" target="_blank" rel="noopener noreferrer" className="contact-link">
          <div className="contact-link-icon"><Github size={16} /></div>
          <div>
            <div className="contact-link-title">GitHub</div>
            <div className="contact-link-sub">krishnakanth21</div>
          </div>
        </a>
        <a href="https://leetcode.com/u/superkk1991/" target="_blank" rel="noopener noreferrer" className="contact-link">
          <div className="contact-link-icon"><Code2 size={16} /></div>
          <div>
            <div className="contact-link-title">LeetCode</div>
            <div className="contact-link-sub">450+ problems solved · 500+ day streak</div>
          </div>
        </a>
      </div>
    </section>
  );
}

function SystemsShowcase() {
  const navigate = useNavigate();
  return (
    <section style={{ paddingTop: 0 }}>
      <div className="section-eyebrow" style={{ marginBottom: 12 }}>Systems I've Built</div>
      <div className="systems-grid">
        {SYSTEMS.map(s => (
          <div
            key={s.id}
            className="system-card"
            onClick={() => navigate(`/case-studies/${s.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && navigate(`/case-studies/${s.id}`)}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', background: 'var(--tag-bg)', border: '1px solid var(--border-accent)', borderRadius: 6, padding: '3px 9px', width: 'fit-content' }}>{s.abbr}</div>
            <div>
              <div className="system-card-metric">{s.metric}</div>
              <div className="system-card-metric-label">{s.metricLabel}</div>
            </div>
            <div className="system-card-title">{s.title}</div>
            <div className="system-card-hook">{s.hook}</div>
            <div className="pill-row" style={{ marginTop: 0 }}>
              {s.tags.map(t => <span className="pill" key={t}>{t}</span>)}
            </div>
            <div className="system-card-link">Read case study →</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Writing() {
  return (
    <section id="writing">
      <div className="section-eyebrow">Writing</div>
      <h2 className="section-title">On distributed systems &amp; infrastructure</h2>
      <div className="writing-grid">
        {ARTICLES.map((a, i) => (
          <a
            key={i}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="article-card"
          >
            <div className="article-card-label">Medium · Article</div>
            <div className="article-card-title">{a.title}</div>
            <div className="article-card-summary">{a.summary}</div>
            <div className="pill-row" style={{ marginTop: 0 }}>
              {a.tags.map(t => <span className="pill" key={t}>{t}</span>)}
            </div>
            <div className="article-card-cta">Read on Medium ↗</div>
          </a>
        ))}
      </div>
      <a
        href="https://medium.com/@krishnakanthe99"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        View all articles on Medium ↗
      </a>
    </section>
  );
}

// ── PORTFOLIO PAGE ────────────────────────────────────────────────────────────

function Portfolio() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const active = useActiveSection();
  useScrollProgress();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <>
      <div id="scroll-progress" style={{ width: "0%" }} />
      <Nav active={active} theme={theme} setTheme={setTheme} />
      <main id="main-content">
        <Hero />
        <hr className="section-divider" />
        <Experience />
        <hr className="section-divider" />
        <ImpactMetrics />
        <hr className="section-divider" />
        <SystemsShowcase />
        <CaseStudiesPreview />
        <hr className="section-divider" />
        <Writing />
        <hr className="section-divider" />
        <Projects />
        <hr className="section-divider" />
        <Skills />
        <hr className="section-divider" />
        <Contact />
      </main>
      <footer>Krishnakanth Eswaran · {new Date().getFullYear()}</footer>
    </>
  );
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: '0 24px' }}>
      <div style={{ fontSize: 72, fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--accent)', lineHeight: 1 }}>404</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>Page not found</div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>This URL doesn't exist.</div>
      <button onClick={() => navigate('/')} style={{ marginTop: 8, padding: '10px 24px', borderRadius: 100, background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
        Back to portfolio
      </button>
    </div>
  );
}

// ── APP WITH ROUTES ───────────────────────────────────────────────────────────

export default function App() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  return (
    <Routes>
      <Route path="/"                   element={<Portfolio />} />
      <Route path="/case-studies"       element={<CaseStudies />} />
      <Route path="/case-studies/:id"   element={<CaseStudyDetail />} />
      <Route path="*"                   element={<NotFound />} />
    </Routes>
  );
}
