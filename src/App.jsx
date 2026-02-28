import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Github,
  Linkedin,
  Mail,
  Phone,
  Menu,
  Clipboard,
  Code2,
  Sun,
  Moon   
} from "lucide-react";

// ===================== NAVBAR =====================

function NavLink({ id, label, active, onClick }) {
  return (
    <a
      href={`#${id}`}
      onClick={onClick}
      className={`relative transition-colors ${
        active === id
          ? "font-semibold text-blue-600 dark:text-blue-400 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:bg-blue-500"
          : "text-gray-700 dark:text-gray-300 hover:text-blue-600"
      }`}
    >
      {label}
    </a>
  );
}

function Navbar({ active, setActive }) {
  const [open, setOpen] = useState(false);

  const sections = [
    "home",
    "about",
    "experience",
    "highlights",
    "projects",
    "publications",
    "achievements",
    "skills",
    "education",
    "contact",
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { threshold: 0.3 },
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [setActive]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/90 dark:bg-black/90 border-b dark:border-gray-800">
      <nav className="max-w-5xl mx-auto flex items-center justify-between h-16 px-6 text-sm">
        <div className="flex items-center gap-3">
          <img
            src="/images/krishna_suit_photo.jpg"
            alt="Krishna's Photo"
            className="w-10 h-10 rounded-full object-cover"
          />
          <a href="#home" className="font-bold text-lg tracking-tight">
            Krishnakanth
          </a>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {sections.map((s) => (
            <NavLink
              key={s}
              id={s}
              label={s.charAt(0).toUpperCase() + s.slice(1)}
              active={active}
              onClick={() => setOpen(false)}
            />
          ))}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)}>
          <Menu size={20} />
        </button>
      </nav>

      {open && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-4 text-sm">
          {sections.map((s) => (
            <NavLink
              key={s}
              id={s}
              label={s.charAt(0).toUpperCase() + s.slice(1)}
              active={active}
              onClick={() => setOpen(false)}
            />
          ))}
        </div>
      )}
    </header>
  );
}

// ===================== CARD =====================
function Card({ title, period, summary, bullets = [], techStack = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition"
    >
      <h3 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h3>
      {period && <p className="text-sm text-gray-500 mt-1">{period}</p>}
      {summary && (
        <p className="mt-4 text-gray-700 dark:text-gray-300">{summary}</p>
      )}
      {bullets.length > 0 && (
        <ul className="mt-4 list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
      {techStack.length > 0 && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <strong>Tech:</strong> {techStack.join(", ")}
        </p>
      )}
    </motion.div>
  );
}

function SectionHeading({ id, label, active }) {
  console.log("SectionHeading Props:", { id, label, active }); // Debugging log
  return (
    <h2
      className={`text-2xl md:text-3xl font-semibold tracking-tight inline-block relative pb-2 ${
        active === id
          ? "after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-full after:bg-blue-500"
          : "after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-8 after:bg-gray-300 dark:after:bg-gray-700"
      }`}
    >
      {label}
    </h2>
  );
}

export default function App() {
  const [active, setActive] = useState("home");
  useEffect(() => {
    console.log("Active state updated:", active); // Debugging log
  }, [active]);

  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    const email = "krishnakanthe99@gmail.com";

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        throw new Error();
      }
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = email;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
      } catch {}
      document.body.removeChild(textarea);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 text-[15.5px] leading-relaxed scroll-smooth">
      <Navbar active={active} setActive={setActive} />

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-24 space-y-10">
        {/* HOME */}
        <section id="home" className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Krishnakanth Eswaran
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
            Backend Engineer · Java · Microservices · Distributed Systems · AWS · Terraform ·
            Kubernetes . CICD
          </p>
        </section>

        {/* ABOUT */}
        <section id="about" className="scroll-mt-32 space-y-6">
          <SectionHeading id="about" label="About" active={active} />
          <div className="max-w-4xl space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              Backend Engineer with 5+ years of experience building and
              operating distributed, high-throughput financial systems in Java
              on AWS. I specialize in scalable API design, resilience
              engineering, disaster recovery, and cloud-native production
              systems within regulated financial domains.
            </p>
            <p>
              Currently a Member of Technical Staff at athenahealth, I work on
              modernizing U.S. healthcare revenue cycle platforms — improving
              autoscaling behavior, reducing P95 latency under peak load,
              implementing multi-region disaster recovery, and leading
              infrastructure migrations from CloudFormation to Terraform and ECS
              to EKS.
            </p>
            <p>
              I bring strong end-to-end ownership, from system design and
              performance testing to production reliability and cross-team
              leadership. With 450+ LeetCode problems solved and experience
              delivering enterprise solutions for clients such as FedEx and
              Paytm, I consistently align technical execution with business
              impact.
            </p>
          </div>
        </section>

        {/* EXPERIENCE */}
        <section id="experience" className="scroll-mt-32 space-y-10">
          <SectionHeading id="experience" label="Experience" active={active} />

          <Card
            title="athenahealth — Member of Technical Staff"
            period="Aug 2023 – Present · Chennai"
            summary="Backend engineer in Rules Core Team (Collector Zone) owning mission-critical AR finance workflows."
            bullets={[
              "Redesigned autoscaling strategy reducing P95 latency by ~40%.",
              "Led multi-region disaster recovery implementation (us-east ↔ us-west).",
              "Migrated CloudFormation → Terraform and ECS → EKS with zero downtime.",
              "Maintained 99.9% uptime across financial systems.",
            ]}
            techStack={[
              "Java",
              "Spring",
              "AWS",
              "Terraform",
              "Kubernetes",
              "Postgres",
            ]}
          />

          <Card
            title="Accolite Digital — Senior Software Engineer"
            period="Jan 2021 – Aug 2023"
            summary="Built enterprise-grade REST APIs and integrations across fintech and logistics systems."
            bullets={[
              "Developed 10+ REST APIs for FedEx CrewPay.",
              "Delivered 10+ large-scale Paytm insurance integrations.",
              "Enabled real-time multi-database synchronization.",
            ]}
          />

          <Card
            title="Profinch — Data Analyst Intern"
            period="May 2020 – Jun 2020"
            summary="Developed AML fraud detection tooling."
            bullets={[
              "Built Python rule engine over Microsoft SQL Server.",
              "Detected suspicious financial transaction patterns.",
            ]}
          />
        </section>

        {/* HIGHLIGHTS */}
        <section id="highlights" className="scroll-mt-32 space-y-16">
          <SectionHeading
            id="highlights"
            label="Key Technical Highlights"
            active={active}
          />

          <Card
            title="⭐ Disaster Recovery + Scaling Critical Financial System"
            summary="Owned performance optimization and multi-region disaster recovery for a high-volume backend financial processing service."
            bullets={[
              "Replaced CPU-based autoscaling with queue-depth and request-rate driven scaling using CloudWatch metrics.",
              "Reduced API P95 latency by ~40% during peak traffic.",
              "Designed automated us-east ↔ us-west failover strategy with API Gateway routing updates.",
              "Executed DR simulations with DevOps and QA achieving zero downtime drills.",
              "Framework adopted as reference architecture across teams.",
            ]}
            techStack={[
              "AWS ECS",
              "EC2",
              "CloudWatch",
              "API Gateway",
              "Postgres",
            ]}
          />

          <Card
            title="⭐ S3 Externalization for Performance + CI/CD Modernization"
            summary="Eliminated cold-start instability caused by heavy binaries packaged inside Docker images."
            bullets={[
              "Moved large binaries to S3 and implemented runtime sync bootstrap script.",
              "Integrated IAM least-privilege roles and automated Jenkins artifact workflows.",
              "Improved startup time by 60–70% and eliminated boot failures.",
              "Reduced deployment times and enabled reuse across services.",
            ]}
            techStack={["AWS S3", "IAM", "Jenkins", "Terraform"]}
          />

          <Card
            title="⭐ CloudFormation → Terraform Migration (Architecture Leadership)"
            summary="Led zero-downtime infrastructure migration while improving modularity and reliability."
            bullets={[
              "Audited and modularized monolithic CloudFormation stacks into reusable Terraform modules.",
              "Implemented remote state management and workspace isolation.",
              "Executed staged non-prod → prod cutover without service disruption.",
              "Reduced infrastructure management effort by ~40%.",
            ]}
            techStack={["Terraform", "AWS", "ALB", "IAM"]}
          />

          <Card
            title="⭐ High-Throughput API Expansion + DB Hardening"
            summary="Expanded financial APIs to support PPI integrations while ensuring zero regression under load."
            bullets={[
              "Designed async message-driven APIs with advanced filtering to reduce DB scans.",
              "Added Postgres indexes using CREATE INDEX CONCURRENTLY to avoid locks.",
              "Performed Locust-based load testing (baseline, expected, stress scenarios).",
              "Validated P95/P99 latency improvements and optimized query plans.",
            ]}
            techStack={["Java", "Spring", "Postgres", "Locust"]}
          />

          <Card
            title="⭐ Perl → Java Business Logic Modernization"
            summary="Migrated legacy file-based processing system to maintainable Java architecture."
            bullets={[
              "Reverse-engineered complex Perl workflows with multiple edge cases.",
              "Ensured behavioral parity through regression testing.",
              "Improved file processing capacity in Apply 2.0 by ~10%.",
              "Delivered modernization with zero business disruption.",
            ]}
            techStack={["Java", "Perl", "Regression Testing"]}
          />

          <Card
            title="⭐ Mission-Critical Pre-Prod Reliability Ownership"
            summary="Owned stability of shared integration environment across 6+ teams."
            bullets={[
              "Acted as primary on-call and led incident root cause analysis.",
              "Implemented Grafana dashboards and Prometheus alerts.",
              "Reduced integration-blocking incidents significantly.",
              "Improved cross-team release confidence and stability.",
            ]}
            techStack={["Prometheus", "Grafana", "OpenSearch", "RDS"]}
          />

          <Card
            title="⭐ ECS → EKS Platform Migration"
            summary="Led large-scale container orchestration migration with zero downtime."
            bullets={[
              "Designed non-prod → prod migration rollout strategy.",
              "Configured HPA autoscaling aligned with workload patterns.",
              "Improved observability, deployment confidence, and team velocity.",
              "Migrated DB tooling from Flyway to Liquibase for safer rollbacks.",
            ]}
            techStack={["Kubernetes", "EKS", "Docker", "Liquibase"]}
          />
        </section>

        {/* PROJECTS */}
        <section id="projects" className="scroll-mt-32 space-y-8">
          <SectionHeading id="projects" label="Projects" active={active} />

          <Card
            title="Posting Issues Classification & Metrics"
            summary="GenAI-powered analytics platform detecting incorrect healthcare insurance billing."
            bullets={[
              "Leveraged OpenAI + BERT for NLP classification.",
              "Generated structured corrective metrics.",
              "Improved billing accuracy and turnaround time.",
            ]}
            techStack={["Python", "GenAI", "BERT"]}
          />

          <Card
            title="COVID-19 Social Media Analysis"
            summary="Real-time sentiment analysis system for stress detection."
            bullets={[
              "Analyzed Twitter sentiment streams.",
              "Recommended contextual stress-mitigation resources.",
            ]}
            techStack={["Python", "NLP"]}
          />
        </section>

        {/* PUBLICATIONS */}
        <section id="publications" className="scroll-mt-32 space-y-6">
          <SectionHeading
            id="publications"
            label="Publications"
            active={active}
          />
          <div className="text-gray-700 dark:text-gray-300 space-y-3">
            <a
              href="https://ieeexplore.ieee.org/abstract/document/9199928?casa_token=BskVXYnuWSYAAAAA:fFodUdiZLgy_0_NPKS7F68n6xDBAP-7Gdb7ECIJgznw_zcUZQZclCVK_Hbu6TK1Jpo8UEEjIag"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:text-blue-600"
            >
              User Independent Human Stress Detection — IEEE IS’20
            </a>
            <p>
              Proposed a user-independent stress detection model eliminating
              affective-state calibration. Evaluated on WESAD dataset achieving
              95% (Bi-affective), 85% (Tri-affective), and 83% (Multi-affective)
              classification accuracy, outperforming user-dependent models.
            </p>
          </div>
        </section>

        {/* ACHIEVEMENTS */}
        <section id="achievements" className="scroll-mt-32 space-y-6">
          <SectionHeading
            id="achievements"
            label="Achievements"
            active={active}
          />
          <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>450+ LeetCode problems (500+ day streak)</li>
            <li>HackerRank 5-Star Gold Badge</li>
            <li>Class XII: 96.8% (Top 1 percentile)</li>
            <li>CBSE Gold Medal in English</li>
          </ul>
        </section>

        {/* SKILLS */}
        <section id="skills" className="scroll-mt-32 space-y-6">
          <SectionHeading id="skills" label="Skills" active={active} />
          <p className="text-gray-700 dark:text-gray-300">
            Languages: Java, SQL, Perl, Python, Bash
            <br />
            Backend: Spring Boot, REST APIs, Distributed Systems
            <br />
            Cloud: AWS (ECS, EKS, EC2, S3, RDS, SQS)
            <br />
            Infra: Terraform, Docker, Kubernetes
            <br />
            Observability: Prometheus, Grafana, OpenSearch
          </p>
        </section>

        {/* EDUCATION */}
        <section id="education" className="scroll-mt-32 space-y-6">
          <SectionHeading id="education" label="Education" active={active} />
          <p className="text-gray-700 dark:text-gray-300">
            B.E. Computer Science — SSN College of Engineering (CGPA 8.56)
            <br />
            Higher Secondary — PSBB Chennai (96.8%)
          </p>
        </section>

        {/* CONTACT */}
        <section id="contact" className="scroll-mt-32 space-y-6">
          <SectionHeading id="contact" label="Contact" active={active} />
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-3">
              <a
                href="mailto:krishnakanthe99@gmail.com"
                className="flex items-center gap-2 hover:text-blue-600"
              >
                <Mail size={16} /> krishnakanthe99@gmail.com
              </a>
              <button onClick={copyEmail} className="hover:text-blue-600">
                <Clipboard size={16} />
              </button>
              {copied && (
                <span className="text-xs text-green-500">Copied!</span>
              )}
            </div>

            <a
              href="https://www.linkedin.com/in/krishnakanth-eswaran"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <Linkedin size={16} /> LinkedIn
            </a>

            <a
              href="https://github.com/krishnakanth21"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <Github size={16} /> GitHub
            </a>

            <a
              href="https://leetcode.com/u/superkk1991/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <Code2 size={16} /> LeetCode
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
