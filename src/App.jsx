import { useState, useEffect } from "react";
import { Mail, Linkedin, Github, Code2, Send } from "lucide-react";

// ── DATA ──────────────────────────────────────────────────────────────────────

const NAV = [
  { id: "home",       label: "Home" },
  { id: "experience", label: "Experience" },
  { id: "projects",   label: "Projects" },
  { id: "skills",     label: "Skills" },
  { id: "contact",    label: "Contact" },
];

const ROLES = [
  "Backend Engineer",
  "Distributed Systems Engineer",
  "Platform Engineering · DevOps",
  "Java · Spring · Postgres · AWS · Kubernetes",
];

const STATS = [
  { value: "5+",    label: "Years experience" },
  { value: "~40%",  label: "P95 latency cut" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "450+",  label: "LeetCode solved" },
];

const EXPERIENCE = [
  {
    company: "athenahealth",
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
  { value: "~40%",   label: "P95 Latency Reduction",  desc: "Queue-depth autoscaling overhaul" },
  { value: "99.9%",  label: "Uptime Maintained",       desc: "Financial-grade SLA" },
  { value: "60–70%", label: "Startup Speedup",         desc: "S3 binary externalization" },
  { value: "~40%",   label: "Infra Effort Saved",      desc: "CloudFormation → Terraform" },
  { value: "70%",    label: "PreProd Incidents Reduced", desc: "Enhanced monitoring & alerting" },
  { value: "Zero",   label: "Downtime During Migration", desc: "ECS → EKS migration with zero disruption" },
  { value: "80%",   label: "DB Latency Reduced", desc: "Added optimized DB Indexing with intersive monitoring" },
  { value: "< 200ms",   label: "Bulk API Latency", desc: "Built a complex endpoint for UI rqeuiurement with 2-query architecture" },
];

const PROJECTS = [
  {
    title: "Posting Issues Classification & Metrics",
    desc:  "GenAI-powered analytics platform for healthcare insurance billing accuracy. Uses OpenAI + BERT for NLP classification and generates structured corrective metrics.",
    tech:  ["Python", "GenAI", "BERT", "OpenAI API"],
  },
  {
    title: "COVID-19 Social Media Stress Analysis",
    desc:  "Real-time Twitter sentiment analysis pipeline for stress detection, recommending contextual stress-mitigation resources based on classified emotional states.",
    tech:  ["Python", "NLP", "Twitter API", "Sentiment Analysis"],
  },
];

const SKILLS = {
  Languages:       ["Java", "SQL", "Python", "Perl", "Bash", "C++", "Infrastructure as Code (IaC)"],
  Backend:         ["Spring Boot", "REST APIs", "Microservices", "Distributed Systems", "Async Messaging", "Event-Driven Architecture"],
  "Cloud & AWS":   ["ECS", "EKS", "EC2", "S3", "RDS", "SQS", "API Gateway", "CloudWatch", "IAM", "DMS", "SSM", "Secrets Manager", "Parameter Store", "AWS SageMaker"],
  Infrastructure:  ["Terraform", "Docker", "Kubernetes", "Helm", "Jenkins", "Harness", "CI/CD", "KEDA", "ExternalSecrets"],
  Observability:   ["Prometheus", "Grafana 11", "OpenSearch", "GrayLog", "AWS CloudWatch", "AlertManager", "Micrometer"],
  Databases:       ["PostgreSQL", "Flyway", "Liquibase", "Debezium CDC", "Kafka/MSK", "DMS"],
  "Security & Secrets" : ["HashiCorp Vault", "AWS Secrets Manager", "IRSA", "IAM Roles and Groups", "Row-Level Security"],  
  "Testing & Quality" : ["Locust", "JUnit", "Integration Testing", "Performance Testing", "Stress Testing", "Soak Testing", "Spike Testing", "Regression Testing" , "Chaos Engineering" , "Backward Compatibility Testing"],  
  "Other Tools & Frameworks" : ["Drools 8.44.0", "AWS SDK v1", "Spring Batch", "Hibernate", "AOP"],
  Deployment_Strategies : ["Blue-Green Deployment", "Canary Releases", "Rolling Updates", "Feature Toggles", "SDK versioning"]
}

const ACHIEVEMENTS = [
  { icon: "🏆", text: "450+ LeetCode — 500+ day streak" },
  { icon: "⭐", text: "HackerRank 5-Star Gold Badge" },
  { icon: "📄", text: "IEEE Publication — IS'20 Conference" },
  { icon: "🥇", text: "CBSE Gold Medal in English" },
  { icon: "📊", text: "Class XII: 96.8% — Top 1 Percentile" },
  { icon: "🎓", text: "B.E. CS — SSN College (CGPA 8.56)" },
];

// ── HOOKS ─────────────────────────────────────────────────────────────────────

function useTyping(items, speed = 65, pause = 2200) {
  const [display, setDisplay] = useState("");
  const [idx, setIdx]         = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = items[idx];
    let t;
    if (!deleting && display === current) {
      t = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && display === "") {
      setDeleting(false);
      setIdx(i => (i + 1) % items.length);
    } else {
      t = setTimeout(() => {
        setDisplay(prev =>
          deleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1)
        );
      }, deleting ? speed * 0.5 : speed);
    }
    return () => clearTimeout(t);
  }, [display, deleting, idx, items, speed, pause]);

  return display;
}

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

function Nav({ active, theme, setTheme }) {
  return (
    <nav>
      <a href="#home" className="nav-logo">KK<span>.</span></a>
      <div className="nav-links">
        {NAV.map(n => (
          <a
            key={n.id}
            href={`#${n.id}`}
            className={`nav-link ${active === n.id ? "active" : ""}`}
          >
            {n.label}
          </a>
        ))}
        <button
          className="theme-btn"
          onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>
    </nav>
  );
}

function Hero() {
  const role = useTyping(ROLES);
  return (
    <section id="home">
      <div className="hero-badge">
        <span className="hero-badge-dot" />
        Open to Senior Backend · Platform Engineering · SRE-II roles
      </div>

      <h1 className="hero-name">
        Krishnakanth<br /><span className="accent">Eswaran</span>
      </h1>

      <p className="hero-role">
        {role}<span className="cursor" />
      </p>

      <p className="hero-desc">
        5+ years building high-throughput distributed financial systems on AWS.
        Specialized in resilience engineering, cloud infrastructure, and production reliability at scale.
      </p>

      <div className="hero-relocation">
        📍 Based in Chennai · Open to relocation — EU / London / Berlin / Amsterdam
      </div>

      <div className="hero-ctas">
        <a href="#contact" className="btn-primary">Get in touch →</a>
        <a href="https://linkedin.com/in/krishnakanth-eswaran" target="_blank" rel="noopener noreferrer" className="btn-secondary">
          LinkedIn ↗
        </a>
        <a href="https://github.com/krishnakanth21" target="_blank" rel="noopener noreferrer" className="btn-secondary">
          GitHub ↗
        </a>
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
  const toggle = i => setExpanded(e => (e === i ? -1 : i));

  return (
    <section id="experience">
      <div className="section-eyebrow">02 — Experience</div>
      <h2 className="section-title">Where I've worked</h2>
      <div className="timeline">
        {EXPERIENCE.map((exp, i) => (
          <div className="timeline-item" key={i}>
            <div className={`timeline-dot ${exp.current ? "current" : ""}`} />
            <div
              className={`timeline-card ${expanded === i ? "open" : ""}`}
              onClick={() => toggle(i)}
            >
              <div className="timeline-header">
                <div>
                  <div className="timeline-company">{exp.company}</div>
                  <div className="timeline-role">{exp.role}</div>
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
    <section id="impact" style={{ paddingTop: 0 }}>
      <div className="section-eyebrow" style={{ marginBottom: 18 }}>Impact by the numbers</div>
      <div className="metrics-grid">
        {METRICS.map(m => (
          <div className="metric-card" key={m.label}>
            <div className="metric-value">{m.value}</div>
            <div className="metric-label">{m.label}</div>
            <div className="metric-desc">{m.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Projects() {
  return (
    <section id="projects">
      <div className="section-eyebrow">03 — Projects &amp; Publications</div>
      <h2 className="section-title">Built &amp; published</h2>
      <div className="projects-grid">
        {PROJECTS.map((p, i) => (
          <div className="project-card" key={i}>
            <div className="project-title">{p.title}</div>
            <div className="project-desc">{p.desc}</div>
            <div className="pill-row">
              {p.tech.map(t => <span className="pill" key={t}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>
      <div className="pub-card">
        <span className="pub-badge">IEEE IS'20</span>
        <div>
          <a
            href="https://ieeexplore.ieee.org/abstract/document/9199928"
            target="_blank"
            rel="noopener noreferrer"
            className="pub-link"
          >
            User Independent Human Stress Detection
          </a>
          <p className="pub-desc">
            Proposed a user-independent model eliminating affective-state calibration.
            Achieved 95% (bi-affective), 85% (tri-affective), 83% (multi-affective)
            accuracy on WESAD dataset — outperforming all user-dependent baselines.
          </p>
        </div>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section id="skills">
      <div className="section-eyebrow">04 — Skills &amp; Background</div>
      <h2 className="section-title">Technical toolkit</h2>
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
      <div className="section-eyebrow">05 — Contact</div>
      <h2 className="section-title">Let's talk</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 28, maxWidth: 440, lineHeight: 1.75 }}>
        Open to Senior Backend, Platform Engineering, and SRE-II opportunities globally.
        Happy to chat about distributed systems, infrastructure, or anything else.
      </p>
      <div className="contact-grid">
        {/* Email — copy */}
        <button onClick={copyEmail} className="contact-link">
          <div className="contact-link-icon">
            <Mail size={16} />
          </div>
          <div>
            <div className="contact-link-title">{copied ? "✓ Copied!" : "Copy Email"}</div>
            <div className="contact-link-sub">{EMAIL}</div>
          </div>
        </button>

        {/* Email — send */}
        <a href={`mailto:${EMAIL}`} className="contact-link">
          <div className="contact-link-icon">
            <Send size={16} />
          </div>
          <div>
            <div className="contact-link-title">Send Email</div>
            <div className="contact-link-sub">Open in mail client</div>
          </div>
        </a>

        {/* LinkedIn */}
        <a
          href="https://linkedin.com/in/krishnakanth-eswaran"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-link"
        >
          <div className="contact-link-icon">
            <Linkedin size={16} />
          </div>
          <div>
            <div className="contact-link-title">LinkedIn</div>
            <div className="contact-link-sub">krishnakanth-eswaran</div>
          </div>
        </a>

        {/* GitHub */}
        <a
          href="https://github.com/krishnakanth21"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-link"
        >
          <div className="contact-link-icon">
            <Github size={16} />
          </div>
          <div>
            <div className="contact-link-title">GitHub</div>
            <div className="contact-link-sub">krishnakanth21</div>
          </div>
        </a>

        {/* LeetCode */}
        <a
          href="https://leetcode.com/u/superkk1991/"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-link"
        >
          <div className="contact-link-icon">
            <Code2 size={16} />
          </div>
          <div>
            <div className="contact-link-title">LeetCode</div>
            <div className="contact-link-sub">450+ problems · 500+ day streak</div>
          </div>
        </a>
      </div>
    </section>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [theme, setTheme] = useState("dark");
  const active = useActiveSection();
  useScrollProgress();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <>
      <div id="scroll-progress" style={{ width: "0%" }} />
      <Nav active={active} theme={theme} setTheme={setTheme} />
      <main>
        <Hero />
        <hr className="section-divider" />
        <Experience />
        <hr className="section-divider" />
        <ImpactMetrics />
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
