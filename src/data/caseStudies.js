// caseStudies.js — all 11 engineering case studies (complete STAR content)

export const CASE_STUDIES = [

  // ─── A-1 ────────────────────────────────────────────────────────────────
  {
    id: "claims-view-bulk-api",
    code: "A-1",
    category: "Architecture",
    title: "AR Claims View Bulk API",
    subtitle: "N API calls → 1 · 2-query architecture · 4-layer tenant isolation",
    company: "athenahealth · AR Finance · Patient Wallet Integration",
    period: "April 2026",
    summary: "Designed and implemented bulk receivables API unblocking Patient Wallet Claims View, eliminating N+1 query pattern with 2-query architecture, ghost row handling, and 4-layer defense-in-depth tenant isolation.",
    heroMetric: { value: "N → 1", label: "API calls per page" },
    metrics: [
      { value: "N → 1",   label: "API calls per page" },
      { value: "<2s",     label: "page load (20-30 claims)" },
      { value: "2",       label: "DB queries (fixed)" },
      { value: "4",       label: "tenant isolation layers" },
      { value: "0",       label: "schema migrations" },
    ],
    stack: ["Spring Boot", "PostgreSQL", "JPA", "Native SQL", "Hibernate @Filter", "IAM", "Kong API Gateway", "2-Query Architecture", "Composite Indexes"],
    beforeItems: ["N individual API calls (one per claim)", "20-30 seconds page load", "No bulk endpoint", "Claims View blocked"],
    afterItems:  ["Single bulk API call", "<2s page load", "2 queries (any batch size)", "Feature unblocked"],
    situation: `The Patient Wallet team was building a Claims View — a page showing a patient's full claim history with per-claim financial summaries (charges, payments, adjustments, balances). This was a core AR 2.0 / Patient Wallet feature.

The blocker: No bulk API existed in the AR service to retrieve financial data for multiple claims simultaneously. Without this API, the Patient Wallet UI would be forced to make N individual API calls — one per claim — to retrieve the same data. For a typical patient with 20–30 claims, that is 20–30 sequential or parallel round-trips before the page could render. Page load time would be measured in seconds to tens of seconds, not milliseconds. The Claims View feature was entirely blocked on AR.

The AR service (Spring Boot, PostgreSQL) owns the financial state for every healthcare claim — but the data model has significant non-obvious complexity: ghost rows (transferred balance copies NOT marked voided → double-counting balances), remittance amounts stored as negative numbers, Hibernate filter auto-applies context_id only for JPA (not native SQL → cross-tenant leak), up to 3 claim_receivable rows per claim, TRANSFER is a valid RemitType, outstandingAmount is the real-time balance.`,
    task: `I was responsible for translating the PRD into a technically correct, buildable design. Full scope: deep codebase analysis to uncover data model realities the PRD had no visibility into, authoring the full HLD (20 sections: architecture, query design, data flow, testing, rollout, monitoring, timeline), evolving the API contract through two major revisions with Patient Wallet, producing a worked example walkthrough, and defining all design decisions so the implementing team could not make a wrong choice by accident.

The target bar: <300ms p95 SLA for up to 10 claims, self-contained with zero outbound service calls, and zero schema changes.`,
    actions: [
      { title: "Codebase analysis before design",  body: "Performed full structural analysis of AR codebase first, surfacing 10 critical findings that directly changed the design: BasePracticeEntity Hibernate filter auto-injects context_id for JPA; ghost rows are NOT voided (added explicit ghostedFromClaimReceivableId IS NULL filter); efficient 2-table JOIN exists via remittance_info; RemitType.TRANSFER exists and must be excluded; remittance amounts stored negative; outstandingAmount is real-time authoritative; CustomRepository blocks findById. Impact: prevented at least 4 categories of production bugs before implementation began." },
      { title: "2-query architecture",             body: "Rather than N+1 queries or a single complex 4-table join, designed exactly 2 database queries for any batch size: Query 1 (JPA) reads balances/charges/metadata from claim_receivable with Hibernate filter auto-adding context_id; Query 2 (native SQL) aggregates payments/adjustments via charge_remittance JOIN remittance_info JOIN claim_receivable with explicit context_id (Hibernate filter bypassed). All query paths covered by pre-existing indexes — zero new indexes, zero Flyway migrations." },
      { title: "API contract evolution",           body: "Contract went through two major revisions: Revision 1 (POST→GET) — changed to GET for read-only semantics, bounded batch size to 10 claims, added 3-legged auth scope. Revision 2 (rolled-up → per-transfer-type granularity) — changed from single fields to primaryPayment/secondaryPayment, primaryAdjustment/secondaryAdjustment/patientAdjustment, primaryTransfer/secondaryTransfer/patientTransfer, primaryReceivable/secondaryReceivable/patientReceivable; missing claims omitted from response and listed in meta.missingClaimIds." },
      { title: "4-layer tenant isolation",         body: "Security is non-negotiable in multi-tenant healthcare. Implemented 4 independent isolation layers: Layer 1 — IAM token (Okta OAuth2) + new scope; Layer 2 — Kong API Gateway path validation; Layer 3 — Hibernate @Filter (auto on JPA queries); Layer 4 — Explicit WHERE context_id = :contextId in native SQL (Hibernate filter bypassed). Critical insight: Layers 3 and 4 address the same threat through different mechanisms because Hibernate filters do NOT apply to native SQL queries." },
      { title: "Phased implementation plan",       body: "Structured into 7 phases, each independently mergeable: Discovery, DTOs with Swagger annotations, DAO/repository methods + native aggregate query, BulkClaimReceivableSummaryService (ghost filtering, negation, totals), Controller + integration tests, Load tests, SDK regeneration + PW integration. Total: ~5-6 weeks. Phases 1-5 add new code without exposing endpoint. Phase 6 triggers SDK generation. Rollback = revert SDK version." },
    ],
    results: `API calls per page: N → 1. Page load time: blocked → <2s for 20-30 claims. DB round trips: N+1 → 2 (fixed, any batch size). Schema changes: 0. Feature unblocked: Patient Wallet Claims View shipped. The most technically significant contributions were the upstream thinking: ghost row identification (WHERE voided IS NULL insufficient), Hibernate filter scope boundary (identifying @Filter does NOT apply to native SQL), 2-query architecture (efficient JOIN path reduces 4-table join to 2-table), contract evolution with explicit tradeoffs.`,
    qas: [
      { q: "Why 2 queries instead of a single complex join?", a: "A single 4-table join would work but has three problems: (1) complex to test — edge cases are multiplicative across joins, (2) harder to reason about performance — query planner behavior less predictable, (3) violates separation of concerns — mixing metadata reads (fast, indexed) with aggregate computation (slower, GROUP BY). The 2-query design separates concerns cleanly. At max 10 claims (30 entity rows), the overhead of 2 queries vs 1 is negligible, and the clarity/testability gain is significant." },
      { q: "How did you validate the 4-layer tenant isolation actually worked?", a: "Integration test proof: created a claim under context_id=1122, fetched it (succeeds), switched to context_id=3322, re-fetched → empty result. Cross-tenant access structurally returns nothing. Also tested each layer independently: removed IAM scope → 403, removed Kong validation → 404, disabled Hibernate filter → leaked data in JPA path, removed WHERE context_id in native SQL → leaked data in aggregate path. Each layer is independently sufficient; together they make isolation structurally enforced." },
      { q: "What was the hardest tradeoff decision?", a: "Missing claims: omit vs return zeros. Returning all-zero placeholders is simpler but creates ambiguity: Patient Wallet can't tell whether all zeros means 'no AR data yet' vs 'genuinely has zero balance.' This matters for UI rendering. Decision: omit missing claims from claimSummaries, list in meta.missingClaimIds. PW gets unambiguous signal. Tradeoff: callers must handle variable-length arrays. But the API is explicit — absence is the signal, not a magic enum." },
    ],
  },

  // ─── S-1 ────────────────────────────────────────────────────────────────
  {
    id: "tenant-isolation",
    code: "S-1",
    category: "Reliability",
    title: "Practice ID Tenant Isolation — 8-Layer Defense",
    subtitle: "Filter → ThreadLocal → Hibernate → AOP → RLS → CustomRepo → Schema → Async",
    company: "athenahealth · AR Multi-Tenant Security",
    period: "2024",
    summary: "Designed and implemented defense-in-depth tenant isolation system across 8 independent layers, making tenant leakage structurally impossible in a multi-tenant healthcare SaaS platform serving thousands of HIPAA-covered entities.",
    heroMetric: { value: "8", label: "isolation layers" },
    metrics: [
      { value: "8",     label: "independent isolation layers" },
      { value: "0",     label: "tenant leaks (impossible)" },
      { value: "200+",  label: "queries auto-protected" },
      { value: "50+",   label: "repositories secured" },
    ],
    stack: ["Spring Boot", "PostgreSQL", "Hibernate @FilterDef", "AspectJ AOP", "ThreadLocal", "RLS", "Servlet Filter", "Custom JPA Repository", "NOT NULL Constraints", "Composite Indexes"],
    beforeItems: ["Naive query leaks all tenant data", "Manual WHERE context_id (200+ chances to miss)", "No DB-level enforcement", "Policy-dependent security"],
    afterItems:  ["8 independent isolation layers", "AOP-activated Hibernate filter", "Structurally impossible to leak", "DB-level RLS enforcement"],
    situation: `The Accounts Receivable service is a multi-tenant SaaS platform serving thousands of independent healthcare practices on shared infrastructure. Each context_id (practice ID) represents a legally distinct customer — a HIPAA-covered entity. A data leak between practices is not just a bug; it's a regulatory breach (HIPAA, possibly SOC 2).

The core challenge: a single PostgreSQL schema (ar.*) stores data for all tenants in the same tables. A naive query leaks everyone's data. Scale of the problem: 20+ core tables co-mingling practice data, multiple ingestion paths (synchronous HTTP, async Kafka events, Camunda workflows), UUID primary keys (not sequentially guessable but not access control), persistence via Spring Data JPA + Hibernate (ORM frameworks with no default tenant awareness).`,
    task: `Design and implement a defense-in-depth tenant isolation system that: makes tenant leakage structurally impossible (not just "not likely"), works transparently (developers writing new repositories/queries get isolation for free), handles all ingestion paths (HTTP, events, workflow engine), and is testable at every layer.`,
    actions: [
      { title: "Layer 1: Servlet Filter",                     body: "PracticeIdServletFilter.java extracts and validates contextId from /v1/contexts/{contextId}/... URI before any controller logic. contextId < 2 rejected at boundary (fail loudly). finally block always clears thread-local (prevents context bleeding in thread-pool reuse). Explicit exclusions for /v1/events/* and /v1/camunda/* (inject context from payload, not URL)." },
      { title: "Layer 2: ThreadLocal",                        body: "PracticeIdentifier — ThreadLocal<Long> as canonical context carrier. Default value is -1L (sentinel matching zero real rows). Safe default: unset context returns empty results, not all results. Fail-closed, not fail-open." },
      { title: "Layer 3: Hibernate @FilterDef",               body: "BasePracticeEntity.java — every entity inherits, declares @FilterDef. Hibernate appends AND context_id = :contextId to every SQL SELECT transparently. @PrePersist hook auto-stamps context_id on insert. No developer manually sets context_id — forgetting is structurally impossible." },
      { title: "Layer 4: AOP Interceptor",                    body: "PracticeIdInjector.java — @Before AspectJ advice intercepts every Repository call. Unwraps EntityManager → HibernateSession, session.enableFilter(), session.doWork(SET my.tenant_identifier = contextId). Developer doesn't call enableFilter() — aspect does it automatically." },
      { title: "Layer 5: DB RLS via Session Variable",        body: "SELECT set_config('my.tenant_identifier', ?, true) sets PostgreSQL session variable before every operation. Backs Row-Level Security policies at DB engine level — even if all application layers bypassed, DB enforces isolation." },
      { title: "Layer 6: Custom Repository",                  body: "CustomRepository.java — critical discovery: Hibernate filters do NOT apply to findById() (bypasses filter via EntityManager.find()). Fix: override findById to throw. All methods use getByIdAndIdNotNull (forces JPQL query, goes through filter). Calling findById is a hard fail." },
      { title: "Layer 7: Schema Enforcement",                 body: "Every table has context_id BIGINT NOT NULL. No row exists without practice binding. Composite unique constraints include context_id. Composite indexes on (context_id, ...) ensure tenant-scoped queries use indexes, not full scans." },
      { title: "Layer 8: Async Path Isolation",               body: "For non-HTTP paths, context_id embedded in message payload. Handler calls PracticeIdentifier.setCurrentPracticeId(contextId) at entry and clear() in finally. Same thread-local contract, different source." },
    ],
    results: `Every layer is independently sufficient to prevent most leaks. Together they make tenant isolation structurally enforced, not policy-dependent. Integration test proof: creates claim under context_id=1122, fetches (succeeds), switches to context_id=3322, re-fetches → empty result. Cross-tenant access structurally returns nothing.

Design decisions: Hibernate filter over manual WHERE (1 chance to miss vs 200), findById throws vs filtering (throwing fails loudly vs silent masking), ThreadLocal + AOP over @RequestScope (@RequestScope doesn't work for async paths), default -1L fail-closed (empty queries vs crashes).

Risk flagged: Native DELETE queries don't explicitly check context_id — mitigations are UUID non-guessability + Hibernate filter on DELETE. Senior code review would add explicit context_id conditions to native DELETE/UPDATE as defense-in-depth.`,
    qas: [
      { q: "Why 8 layers instead of just one strong layer?", a: "Defense-in-depth. Each layer protects against different failure modes: servlet filter (malicious URL manipulation), thread-local (async context loss), Hibernate filter (accidental JPA queries), AOP (filter not enabled), DB RLS (raw SQL tools), custom repository (findById bypass), schema NOT NULL (data corruption), async handlers (event ingestion). If any single layer fails (bug, misconfiguration, future code change), the other 7 still hold. This is how you make security structurally reliable in a large, evolving codebase." },
      { q: "What happens if a developer writes native SQL and forgets context_id filter?", a: "Three things catch it: (1) AOP interceptor still sets PostgreSQL session variable (my.tenant_identifier) which backs RLS — if RLS enabled, DB blocks it. (2) Integration tests fail if query returns cross-tenant data (test fixtures with multiple contexts). (3) Code review catches it — native SQL is rare and visible. But it's the weakest link, which is why I flagged it as requiring explicit context_id in native DELETE/UPDATE for true defense-in-depth." },
      { q: "How did you validate all 8 layers work independently?", a: "Tested each in isolation by disabling others: removed servlet filter → controller tests caught it; cleared thread-local mid-request → empty results (fail-closed); disabled Hibernate filter → leaked data; removed AOP aspect → filter never activated; removed DB session variable → RLS tests failed; used findById → hard exception; removed NOT NULL → DB rejected insert; tested async without setCurrentPracticeId → empty results. Each works independently; together they're redundant by design." },
    ],
    architecture: [
      { aspect: "Isolation model",  before: "Naive SQL — every query leaks all tenant data",      after: "8-layer defense-in-depth (structurally impossible to leak)" },
      { aspect: "context_id scope", before: "Manual WHERE clause — 200+ query sites, each a risk", after: "Hibernate @FilterDef auto-stamps every JPA SELECT" },
      { aspect: "AOP activation",   before: "Developer must call enableFilter() — easy to forget", after: "AspectJ interceptor activates filter on every repository call" },
      { aspect: "findById()",       before: "Bypasses Hibernate filter — silent cross-tenant read",  after: "CustomRepository throws hard — no silent bypass" },
      { aspect: "DB enforcement",   before: "None — application layer only",                         after: "PostgreSQL RLS via session variable (my.tenant_identifier)" },
      { aspect: "Async paths",      before: "Kafka / Camunda carry no practice context",             after: "ThreadLocal default -1L + explicit injection on ingest" },
      { aspect: "Schema",           before: "context_id nullable — rows can be orphaned",            after: "NOT NULL + composite indexes on (context_id, …)" },
      { aspect: "Compliance risk",  before: "HIPAA breach on any missed WHERE clause",               after: "Regulatory risk eliminated at architecture level" },
    ],
  },

  // ─── D-1 ────────────────────────────────────────────────────────────────
  {
    id: "cdc-pipeline",
    code: "D-1",
    category: "Data & Streaming",
    title: "FedEx CrewPay — CDC Pipeline",
    subtitle: "P99 replication lag: 7 days → 30 seconds",
    company: "Accolite Digital (client: FedEx)",
    period: "Jan 2021 – Aug 2023",
    summary: "Replaced a batch-based replication system with a real-time CDC pipeline, cutting P99 lag from 7 days to under 30 seconds with zero data loss and zero failures per quarter.",
    heroMetric: { value: "7d → 30s", label: "P99 lag" },
    metrics: [
      { value: "7d → 30s", label: "P99 replication lag" },
      { value: "3 → 0",    label: "failures / quarter" },
      { value: "0",        label: "data loss incidents" },
      { value: "100%",     label: "manual backups eliminated" },
    ],
    stack: ["PostgreSQL WAL", "Debezium", "MSK / Kafka", "Spring Batch", "LSN Checkpointing", "Idempotent Upserts", "DLQ", "Prometheus", "Liquibase"],
    beforeItems: ["P99 lag: 7 days stale data", "3 failures/quarter", "Manual backup restoration each time", "Batch jobs — wrong architecture for streaming"],
    afterItems:  ["P99 lag: under 30 seconds", "0 failures/quarter", "0 data loss incidents", "100% manual backups eliminated"],
    situation: `FedEx CrewPay relied on scheduled batch jobs to synchronise PostgreSQL data to downstream databases. The P99 replication lag was 7 days — crew pay data was a week stale at any given moment. Failures occurred 3 times per quarter, each requiring manual backup restoration that took hours and impacted downstream payroll systems.

The root cause wasn't a single bug — it was an architectural decision to use batch jobs for what was fundamentally a streaming problem. Every schema change required careful manual coordination to avoid data loss mid-batch. There was no observability into lag; teams discovered failures reactively, usually when downstream consumers noticed stale data.`,
    task: `Redesign the data pipeline to achieve near-real-time replication with zero data loss, eliminate manual backup dependencies, and make the system resilient to failures without human intervention. The new architecture also needed to handle schema evolution safely — schema changes are a constant in a live production system.`,
    actions: [
      { title: "Architecture redesign",      body: "Built a full PostgreSQL WAL → Debezium → MSK/Kafka → Spring Batch CDC pipeline. WAL-based capture means every row change is captured transactionally — no polling lag, no missed updates between batch windows." },
      { title: "LSN checkpointing",          body: "Implemented Log Sequence Number checkpointing in the consumer. Each batch commits its LSN position before acknowledging, enabling safe replay from any failure point without reprocessing already-committed data." },
      { title: "Idempotent upserts",         body: "All downstream writes designed as idempotent upserts — processing a message twice produces identical results. This eliminated duplicate data from any reprocessing scenario and meant the system could safely retry without manual intervention." },
      { title: "DLQ + alerting",             body: "Implemented a Dead Letter Queue for messages that failed after retries, with Prometheus alerts firing within minutes of any failure. Ops is now notified proactively rather than discovering issues a week later through stale data complaints." },
      { title: "Liquibase migration gating", body: "Schema changes applied only after CDC connectors are paused, preventing mid-migration data loss. Critical reliability fix — the old batch system had no schema coordination mechanism at all." },
    ],
    results: `P99 lag went from 7 days to under 30 seconds. Failures dropped from 3 per quarter to zero. Manual backup restoration — previously a multi-hour incident — was fully eliminated. The CDC architecture became the reference pattern for other data synchronisation problems at the org.`,
    qas: [
      { q: "How did you handle exactly-once delivery in Kafka?", a: "LSN checkpointing on the consumer side — each batch persists its last processed LSN before committing. Combined with idempotent upserts at the write layer, this gives effectively exactly-once semantics without Kafka transactions, which add producer-side overhead. The insight: idempotency at the write layer gives the same guarantees without the complexity." },
      { q: "What happens if the Debezium connector restarts mid-stream?", a: "Debezium stores its WAL offset in a dedicated Kafka topic. When the connector restarts, it reads from the last committed offset and resumes from exactly that position. Combined with LSN checkpointing on the consumer, we can handle connector restarts, consumer restarts, and partial failures without data loss or duplication. We tested this failure scenario explicitly in staging before rollout." },
      { q: "How did you validate parity before cutting over?", a: "Ran the old batch system and new CDC pipeline in parallel for 2 weeks, comparing outputs row-by-row. Any divergence was flagged and investigated. This caught 2 edge cases in the Debezium connector configuration that would have caused subtle data issues in production." },
    ],
    architecture: [
      { aspect: "Replication method", before: "Batch JDBC polling — queries production tables directly",   after: "Debezium WAL-based CDC — reads PostgreSQL write-ahead log" },
      { aspect: "P99 replication lag", before: "7 days (batch window + queue backlog)",                   after: "30 seconds (streaming, near-real-time)" },
      { aspect: "Production impact",   before: "Heavy read queries on live tables under peak load",        after: "Zero — WAL tailing is non-invasive to the primary" },
      { aspect: "Transport",           before: "Direct DB writes (synchronous, blocking)",                 after: "Kafka/MSK event streams (async, partitioned)" },
      { aspect: "Failure handling",    before: "Jobs fail silently — data gap with no alert",              after: "At-least-once delivery with committed LSN checkpoints" },
      { aspect: "Parallelism",         before: "Sequential batch jobs — head-of-line blocking",            after: "Parallel Kafka consumers per partition" },
      { aspect: "Data loss risk",      before: "Any crash between batches loses that window's events",     after: "Zero data loss — WAL retains events until committed" },
    ],
    diagram: { src: '/diagrams/cdc1.png', alt: 'FedEx CrewPay CDC pipeline: PostgreSQL WAL → Debezium → Kafka (MSK) → Spring Batch consumers', caption: 'FedEx CrewPay CDC Pipeline — WAL tailing, Kafka transport, LSN checkpointing, idempotent upserts' },
  },

  // ─── O-1 ────────────────────────────────────────────────────────────────
  {
    id: "eks-migration",
    code: "O-1",
    category: "Platform Engineering",
    title: "ECS → EKS Platform Migration",
    subtitle: "Zero downtime · 2 AWS regions · 6 teams coordinated in a single prod window",
    company: "athenahealth · AR Finance · COLDEN Domain",
    period: "2024 – 2025",
    summary: "Volunteered to own end-to-end ECS→EKS migration for the AR Finance service across us-east-1 and us-west-2, coordinating 6 teams in a single production window with zero downtime.",
    heroMetric: { value: "0", label: "prod downtime incidents" },
    metrics: [
      { value: "0",    label: "production downtime incidents" },
      { value: "2",    label: "AWS regions migrated" },
      { value: "6",    label: "teams in prod cutover" },
      { value: "~40%", label: "infra management effort reduced" },
      { value: "100%", label: "team self-sufficient post-KT" },
    ],
    stack: ["Helm", "KEDA", "HashiCorp Vault", "ExternalSecrets Operator", "IRSA", "AWS DMS", "Harness CI/CD", "Kong API Gateway", "Flyway → Liquibase", "Prometheus", "Grafana"],
    beforeItems: ["Legacy ECS, manual deployments", "CPU-only autoscaling — wrong signal for I/O workloads", "No standardised DR automation", "No prior Vault, KEDA, or PCA EKS experience on the team"],
    afterItems:  ["0 production downtime incidents", "KEDA autoscaling on SQS queue depth", "2 AWS regions — active/DR standby", "Reference architecture for 2 other services"],
    situation: `The AR Finance service at athenahealth was running on legacy ECS in a distributed AWS account — limited observability, manual deployments, no standardised autoscaling, and a PostgreSQL RDS instance never onboarded to the centralised Product Centric Account (PCA). A platform mandate required all COLPMA services to migrate to Centralised EKS.

What made this unusually high-stakes: the AR cutover was tightly coupled to the Claims service cutover on March 8, 2025. The entire COLDEN domain — Claims, Apply, AR, Debezium CDC connectors, CEP lambdas, and DynamoDB — had to move in a single coordinated production window (9 PM → 4 AM EDT). A failure in any one service could cascade across the domain. I had no prior hands-on experience with HashiCorp Vault, KEDA, or PCA EKS cluster standards — all of which I needed to learn and implement from scratch.`,
    task: `I volunteered to own the migration end-to-end — nobody on the team had done this before. Full scope: EKS onboarding with Helm chart authoring, KEDA autoscaling, Vault secrets via ExternalSecrets Operator, IRSA per region, Kong API Gateway registration; zero-downtime DB migration via AWS DMS Full Load + CDC; Harness CI/CD pipeline; multi-region readiness; and team KT for the entire team.`,
    actions: [
      { title: "Non-prod first strategy",       body: "Stood up EKS in non-prod, validated for 2+ weeks with controlled traffic before touching prod. Every phase had explicit rollback checkpoints and documented go/no-go criteria — no step proceeded without a tested rollback path." },
      { title: "Helm chart architecture",        body: "Built the ar-service Helm chart with a four-level override stack (cluster → datacenter → zone → namespace). One chart drove Dev, Preview, Prod East, and Prod West with purely config-driven differences — no code branches per environment. Authored on ath-reference-chart v1.9.0 with 6 Prometheus alert rules." },
      { title: "KEDA autoscaling",               body: "Replaced CPU-triggered ECS scaling with KEDA on SQS queue depth — scaling now responds to actual financial transaction load, not proxy CPU metrics. Directly fixed the bursty traffic degradation that CPU-based scaling couldn't handle." },
      { title: "Vault + IRSA secret injection",  body: "Implemented HashiCorp Vault secret injection via ExternalSecrets Operator with IRSA per region — learned entirely from scratch. Documented full setup in shared Confluence including troubleshooting common sync failure patterns." },
      { title: "6-team domain cutover",          body: "Coordinated the prod window across Claims, Apply, AR, Debezium connectors, CEP lambdas, and DynamoDB teams. War room with explicit go/no-go criteria, rollback runbooks per service. Cutover ran 9 PM → 4 AM EDT with zero production impact." },
      { title: "KT and team independence",       body: "Led 3 hands-on KT sessions covering Kubernetes fundamentals, kubectl, Harness triggers, and Vault sync troubleshooting. Engineers debugged a sample pod failure and performed a rollback exercise in staging. Measured independence by tracking when teammates filed EKS tickets without pinging me." },
    ],
    results: `Zero production downtime incidents across both regions. The migration became the reference architecture for 2 other services migrating to EKS. The team is fully self-sufficient on routine EKS operations — that independence was intentional. Infra management effort reduced by approximately 40% through Terraform module reuse and standardised CI/CD.`,
    qas: [
      { q: "What was the hardest part of this migration?", a: "The Flyway → Liquibase tooling migration happening in parallel with the EKS work. In non-prod, we hit a schema locking issue because a changeSet was not idempotent and ran twice. Caught it early because we had a dry-run environment. That near-miss is exactly why we spent 2 weeks validating in non-prod before touching prod." },
      { q: "Why did you volunteer — it wasn't originally your responsibility?", a: "The migration was assigned to the platform team to 'eventually' drive. But it was slowing down my team — we couldn't scale effectively, deployments had too much manual toil. I saw it as a problem I could solve, and waiting for someone else to prioritise it would have meant months more of operational drag. I proposed owning it, got buy-in from my tech lead, and the scope grew — but so did the impact." },
      { q: "How did you make sure knowledge didn't stay siloed with you?", a: "Every decision documented in a shared Confluence space with the 'why' behind it, not just the 'what.' The 3 KT sessions were hands-on — engineers actually debugged a sample pod failure and performed a rollback exercise in staging. I tracked when teammates started filing EKS infra tickets without pinging me — that was my measure of independence." },
    ],
    architecture: [
      { aspect: "Cluster",        before: "ECS on EC2 instances (legacy managed)",       after: "EKS with Helm charts (ath-reference-chart v1.9.0)" },
      { aspect: "Autoscaling",    before: "CPU-based — wrong signal for I/O workloads",  after: "KEDA on SQS queue depth — scales with actual load" },
      { aspect: "Secrets",        before: "AWS SSM Parameter Store (manual rotation)",   after: "HashiCorp Vault + ExternalSecrets Operator + IRSA" },
      { aspect: "CI/CD",          before: "Jenkins (manual triggers, toil-heavy)",        after: "Harness pipelines (automated, per-env config)" },
      { aspect: "DB migration",   before: "In-place (schema lock risk, downtime window)", after: "AWS DMS Full Load + CDC (zero-downtime cutover)" },
      { aspect: "Observability",  before: "Ad-hoc CloudWatch (no standardised alerts)",  after: "Prometheus + Grafana with 6 alert rules per SLA" },
      { aspect: "Regions",        before: "Single region (us-east-1 only)",              after: "us-east-1 + us-west-2 active/DR standby" },
      { aspect: "Prod window",    before: "N/A — migration not attempted",               after: "7 hours (9 PM – 4 AM EDT), 6 teams, 0 incidents" },
    ],
    diagram: { src: '/diagrams/eks1.png', alt: 'ECS to EKS migration: before/after cluster topology, Helm chart structure, KEDA autoscaling, dual-region setup', caption: 'ECS → EKS Migration — Helm orchestration, KEDA autoscaling, Vault secrets, us-east-1 + us-west-2' },
  },

  // ─── O-2 ────────────────────────────────────────────────────────────────
  {
    id: "pre-prod-reliability",
    code: "O-2",
    category: "Reliability",
    title: "Pre-Prod Reliability — 6-Team Environment",
    subtitle: "~70% incident reduction · 2 systemic root causes eliminated",
    company: "athenahealth · AR Pre-Production",
    period: "2024",
    summary: "Voluntarily took ownership of a chronically unstable shared pre-prod environment blocking 6+ teams, reducing incidents by ~70% and eliminating 2 systemic root causes that no one had prioritised fixing.",
    heroMetric: { value: "~70%", label: "incident reduction" },
    metrics: [
      { value: "~70%", label: "blocking incidents reduced" },
      { value: "6+",   label: "teams consistently unblocked" },
      { value: "2",    label: "systemic root causes eliminated" },
    ],
    stack: ["OpenSearch", "RDS Performance Insights", "Grafana", "Prometheus", "ECS", "CloudWatch", "Slack"],
    beforeItems: ["2–3 environment-breaking incidents per week", "Teams self-unblocking with quick hacks — creating more instability", "No formal ownership of environment reliability", "Engineers losing hours weekly to debugging not-their-job issues"],
    afterItems:  ["~70% reduction in blocking incidents", "Dedicated Slack channel — 15 min acknowledge SLA", "Grafana dashboards adopted as standard across pre-prod", "6+ teams consistently unblocked"],
    situation: `The AR pre-production environment at athenahealth was a shared integration testing environment used by 6+ engineering teams. Any instability blocked testing for all of them, directly delaying release timelines. Over a 3-month period, we were seeing 2–3 environment-breaking incidents per week — infra flakiness, bad deployments, resource contention. Nobody formally owned this environment's reliability. Teams were self-unblocking with quick hacks, which created new instability. Engineers were losing hours every week to debugging something that wasn't 'their job.'`,
    task: `I stepped in to take full ownership of pre-prod reliability, even though it wasn't assigned to me. Goal: immediate stabilisation (unblock teams fast) and long-term prevention (eliminate recurring failure patterns) — while keeping my primary feature delivery on track.`,
    actions: [
      { title: "Became primary on-call owner",  body: "Set up a dedicated Slack channel for pre-prod incidents. SLA: acknowledge within 15 minutes, diagnosis within 45 minutes. This alone reduced team frustration significantly by creating a single clear channel for escalation." },
      { title: "Root cause over band-aids",      body: "Used OpenSearch for application log analysis and RDS Performance Insights to identify DB query contention causing cascading slowdowns. Never patched without understanding the root cause — prevented the same issue recurring with a different surface presentation." },
      { title: "Proactive monitoring",           body: "Built Grafana dashboards with Prometheus alerts covering CPU/memory spikes, DB connection pool exhaustion, and SQS queue depth anomalies. Shifted the environment from reactive firefighting to early detection." },
      { title: "Identified systemic patterns",   body: "After 3 weeks, ~60% of failures traced to two root causes: a misconfigured ECS task memory limit (OOM kills) and a batch job holding DB locks too long. Shipped permanent fixes for both. Neither was in my sprint backlog." },
      { title: "Cross-team communication",       body: "Sent weekly incident summaries to all 6 teams — root causes, fixes shipped, what to watch for. Reduced duplicate reports and rebuilt trust in the environment." },
    ],
    results: `~70% reduction in blocking incidents. 6+ teams consistently unblocked. Engineering managers from downstream teams specifically mentioned the improvement in sprint retrospectives. The Grafana monitoring dashboards I built were adopted as the standard for other pre-prod environments.`,
    qas: [
      { q: "Why take this on — wasn't it someone else's responsibility?", a: "Platform team had nominal ownership but wasn't prioritising it. Every team was suffering but nobody was fixing systemic issues because it wasn't 'their problem.' The cost of the status quo — engineers losing hours weekly across 6 teams — was much higher than the cost of me spending focused time on a proper fix. I framed it that way to my tech lead, got a week to focus on it, and the impact spoke for itself." },
      { q: "Tell me about the hardest incident you had to debug.", a: "Intermittent 503s during morning deployments, no obvious error pattern. CloudWatch showed healthy ECS tasks. I eventually found through RDS Performance Insights that there was a long-running scheduled analytics query acquiring table locks during the exact deployment window when the app was doing warmup reads. Fix: adding NOWAIT on the query and shifting the analytics job by 30 minutes. Simple fix, hard diagnosis — production problems often live at the intersection of multiple systems." },
    ],
  },

  // ─── O-3 ────────────────────────────────────────────────────────────────
  {
    id: "terraform-migration",
    code: "O-3",
    category: "Platform Engineering",
    title: "CloudFormation → Terraform Migration (RRT)",
    subtitle: "↓40% infra effort · dual-repo state · reusable modules · 7 SQS queues · 6 environments",
    company: "athenahealth · RRT Infrastructure",
    period: "2024",
    summary: "Migrated Remittance Regression Tool infrastructure from CloudFormation to Terraform across 2 repos with remote state dependencies, implementing reusable modules (VPC, ECS, ALB, SQS, IAM) and blue-green deployments enabling instant rollback, reducing infra management effort by 40%.",
    heroMetric: { value: "↓40%", label: "infra management effort" },
    metrics: [
      { value: "↓40%",    label: "infra management effort" },
      { value: "0",       label: "downtime during migration" },
      { value: "Instant", label: "rollback via blue-green" },
      { value: "5+",      label: "teams adopted modules" },
      { value: "2",       label: "repos with remote state wiring" },
      { value: "7",       label: "SQS queues migrated" },
      { value: "6",       label: "environments (dev/int/preprod × 2 regions)" },
    ],
    stack: ["Terraform", "VPC", "ECS", "ALB", "API Gateway", "IAM", "Blue-Green Deployments", "Remote State", "Workspaces", "Prometheus", "SQS", "Kong Gateway", "Liquibase", "Dual-Repo Architecture", "S3 State Backend"],
    beforeItems: ["CloudFormation-managed ECS + SQS", "No OpenSearch logging support (hard blocker)", "Manual deployments", "7 SQS queues split across 2 ownership domains", "No standardised DR automation"],
    afterItems:  ["Terraform modules (regression-infra + regression-deploy)", "OpenSearch logging unblocked", "Reusable modules adopted by 5+ teams", "Dual remote state with branch-based routing", "Blue-green deployments — instant rollback"],
    situation: `The Remittance Regression Tool (RRT) is a Spring Boot application running automated regression testing for the remittance posting pipeline, orchestrating test execution across import, match, preapply, apply, and router services by publishing/consuming messages through 7 SQS queues.

Prior state: RRT's dev environment infrastructure was managed entirely via a CloudFormation stack (RRT-Tool-dev in remittance-cloudformation). The CFN stack managed: 1 ECS cluster with EC2 instances, 7 SQS queue parameters, associated IAM roles, security groups, and networking.

Problem identified: CloudFormation did not support OpenSearch logging configuration, which was required for the regression tool's observability. This was a hard blocker — the team could not add log indexing and search capabilities to the regression environment using CFN.

Queue architecture complexity: Queues were split across two ownership domains — 3 queues lived in posting-common-infra (shared across all posting services: regression_input, regression_apply, regression_notifier), and the remaining 4 queues were RRT-specific (rrt_completion, rrt_dlq, rrt_regression_file_processor, rrt_output_collect, rrt_remittance_file_processor). The producer/consumer pattern was non-trivial: RRT publishes to some queues ROUTER consumes; ROUTER publishes to others RRT consumes; some queues are RRT-only.`,
    task: `Create new Terraform module regression-infra in remittance-iac-infra to replace CFN-managed ECS cluster and RRT-specific SQS queues. Create new Terraform module regression-deploy in remittance-iac-deployment to replace CFN-managed ECS service deployment, IAM policies, API gateway, and service discovery. Wire SQS queues across two Terraform state files (posting-common-infra for shared queues, regression-infra for RRT-specific queues) into the deployment layer. Set up CI/CD pipeline with branch-based environment routing (feature→dev, release→int, preprod-release→preprod). Support multi-region/multi-environment deployment (dev-ue1, dev-uw2, int-ue1, preprod-ue1). Maintain backward compatibility with existing queue naming that other services (ROUTER) depend on.`,
    actions: [
      { title: "Dual-repo architecture with remote state",      body: "Implemented 3-tier state dependency pattern: (1) remittance-iac-infra contains posting-common-infra (shared SQS/SNS/log forwarder outputting regression_input, regression_apply, regression_notifier, log_forwarder) and regression-infra (ECS cluster, RRT SQS, autoscaling outputting rrt_completion, rrt_dlq, rrt_file_processor, rrt_output_collect, rrt_remit_file_proc, cluster_id) — both write S3 state files. (2) remittance-iac-deployment contains regression-deploy which reads BOTH state files via terraform_remote_state, creates ECS service on infra cluster, wires 7 SQS queue names as container env vars, registers with Kong API Gateway, configures IAM policies scoped per-queue. Critical branch-based deployment ID resolution logic: local.use_dev_db = true when branch matches ^feature.* uses dev state, local.use_int_db = true when branch matches ^release.*|prodparallel uses int state, local.use_preprod_db = true when branch matches ^preprod-release.*|preprod uses preprod state. This dual-state-read pattern enables split queue ownership." },
      { title: "Reusable regression-infra module (10 files)",   body: "00-variables.tf (293 lines): Every configurable aspect parameterized (VPC, subnets, cluster sizing, SQS configs — 6 params per queue: message_retention_period 345600s/4 days, delay_seconds 5s, max_message_size 256KB, max_receive_before_deadletter 3, visibility_timeout 3600s/1hr, receive_wait_time_seconds 0). 01-regression-ecs.tf (42 lines): Uses iac-terraform-aws-ecscluster v2.1.5, creates ECS cluster named rrt with ASG, EC2 launch type (not Fargate for cost optimization), asymmetric scaling (configurable scale-up, always scale-down by 1), cooldown 300s, instance type t3a.large for dev. 02-sqs.tf (139 lines): 7 SQS modules using iac-terraform-aws-sqs v0.5.5 — queue names shortened from verbose CFN naming (e.g., remittance-regression-completion-dev → rrt-completion). 99-outputs.tf (46 lines): Exposes 10 outputs (3 ECS cluster details + 7 SQS full details including ARN/name/URL). *.tfvars (6 files): Environment-specific configs for dev-ue1, dev-uw2, int-ue1, preprod-ue1, ftr-ue1, release-ue1 — each with unique VPC, subnets, account IDs. iac-tf-config.yml: Added regression-infra to 3 workspace lists (devue1, intue1, preprodue1) and dependency graph (regression-infra: [posting-common-infra])." },
      { title: "Regression-deploy module (12 files)",           body: "00-remote-state.tf (42 lines): Branch-based deployment ID resolution (nested ternary routing nonprod/preprod checks), reads regression-infra state and posting-common-infra state from S3. 00-local-variables.tf (74 lines): SQS queue ARN/name resolution with graceful fallback (length check → 'dummyqueuearn' prevents plan failures when infra not yet applied), queue-to-state mapping (remittance_regression_input_queue from posting_common_tf_state, rrt_completion_queue from infra_tf_state, etc.), regression_env_vars_from_tf_state constructs 7 env var objects (name/value maps) for Spring Boot env vars, concatenation logic merges dynamic queue env vars with static tfvars, log forwarder sidecar configuration with tag rewrites. 00-variables.tf (158 lines): ECS sizing (cpu 1536, memory 6656 MB in dev/int — 2x default for regression test memory needs), deployment_minimum_healthy_percent 0, deployment_maximum_percent 100 (zero minimum healthy acceptable for non-prod), regression_env_vars and regression_secrets lists. 01-regression-service.tf (80 lines): module regression_container_definition (posting-rrt-container, port 8080 on dynamic host port, 40 env vars = 7 queue names + 33 from tfvars, 18 secrets from SSM Parameter Store), module regression_service_discovery_service (registers as rrt in private DNS, SRV record TTL 300, health check failure threshold 1), module regression_ecs_service (cluster_arn from infra state, launch type EC2, network mode bridge, wait_for_steady_state true, concat app container + log forwarder sidecar). 02-gateway.tf (34 lines): Domain mapping logic (dev.api.athena.io, int.api.athena.io, preprod.api.athena.io), module managed_gateway3_entities using iac-terraform-kong-apigw v0.0.3_patch (enable_blue_green_deployment false for non-prod, gateway_set_active_version true, Division COLLECTOR, Zone RemittanceAndPosting, depends_on regression ECS service). 02-regression-task-policies.tf (162 lines): Fine-grained IAM with 7 policy statements (SSM GetParameter, Secrets Manager GetSecretValue, EC2/RDS Describe, KMS Decrypt/Encrypt, S3 PutObject/GetObject on 2 buckets, SQS input queue with posting-* pattern, SQS completion/DLQ read-only, SQS apply/output/file full access), attaches to both task role and execution role, additionally attaches AWS managed policies (AmazonS3FullAccess, AmazonSQSFullAccess) as safety net. devue1.tfvars (211 lines): 33 env vars, 18 secrets, memory override 6656 MB, Kong admin URL. cicd-model.yml (32 lines): deployer image terraform-docker-worker:0.21.0, 3 accounts, branch routing (develop.* → devue1, integration → intue1 with manual approval gate, ^preprod$ or preprod-release/* → preprodue1). iac-tf-config.yml (15 lines): workspace_prefix COLPDE/posting-services, single workspace across 3 environments." },
      { title: "Blue-green deployment capability",              body: "Introduced blue-green deployment support via improved routing and load balancing, enabling instant rollback without redeploying — rollback is a routing change, not a deployment. Zero downtime during migration. Instant rollback capability via blue-green deployments." },
      { title: "Incremental migration with testing",            body: "Migrated incrementally in non-prod first (dev-ue1 → dev-uw2 → int-ue1 → preprod-ue1), then executed controlled prod cutover with zero downtime. Added Prometheus + Grafana monitoring and centralised logging with OpenSearch as part of migration. Total timeline: infra creation (Aug 16) to deployment creation (Aug 19) = 3 days initial; 413 total commits over lifetime (78 infra + 335 deployment) showing continuous enhancement." },
    ],
    results: `40% reduction in infra management effort. Zero downtime during migration. Instant rollback capability via blue-green deployments. The Terraform module library became the reference architecture adopted by 5+ teams — the investment in clean module design paid compounding dividends. OpenSearch logging unblocked (original blocker resolved). Standardized IaC tooling (all RRT infrastructure now in Terraform, consistent with rest of remittance-iac repos). Enabled iterative improvement (413 commits after initial creation: ABBYY support, dark launch, testkit, MDP domain changes, LLM properties). Multi-environment parity (dev, int, preprod use identical modules with environment-specific tfvars, reducing configuration drift).

Quantitative impact: Total files created ~35 (10 in iac-infra + 25 in iac-deployment). Total lines of code 2,092+ insertions initial (255 infra + 1,837 deployment). AWS resources provisioned 19 (1 ECS cluster + 2 ASG policies + 7 SQS queues + 1 ECS service + 1 container def + 1 service discovery + 1 Kong gateway + 5 IAM policies). SQS queues managed 7 in regression-infra + 3 in posting-common = 10 total. Environment variables per container 40 (7 dynamic from state + 33 from tfvars). Secrets per container 18 (all SSM). Environments supported 6 (dev-ue1, dev-uw2, int-ue1, ftr-ue1, preprod-ue1, release-ue1). Accounts supported 3 (nonprod, preprod, prod). Terraform modules used 8 distinct internal modules (ECS cluster, SQS, ECS service, container def, service discovery, VPC, Kong APIGW, autoscaling role).`,
    qas: [
      { q: "How did you handle state migration without destroying resources?", a: "Used terraform import to bring existing resources under Terraform management without recreating them. Every import step was reviewed and validated in non-prod before executing in prod. Zero resources were destroyed during migration — only state management changed. For resources that couldn't be imported cleanly, I used a parallel-provision-then-cutover approach." },
      { q: "Why was module design so important beyond just making it work?", a: "We were setting a pattern. If our modules had leaky abstractions or hard-coded assumptions, every team adopting them would inherit those problems. I designed each module with a minimal required interface and sensible defaults — other teams could consume them without understanding every internal detail. The VPC module handles CIDR allocation and subnet strategy internally; callers just specify region and environment." },
      { q: "How did the dual-repo remote state wiring work in practice?", a: "The deployment module (regression-deploy) reads TWO separate Terraform state files via terraform_remote_state: (1) posting-common-infra state for shared queues (regression_input, regression_apply, regression_notifier), (2) regression-infra state for RRT-specific queues (rrt_completion, rrt_dlq, etc.). The branch-based deployment ID resolution logic routes feature branches to dev state, release branches to int state, preprod-release to preprod state. This enables split queue ownership — shared queues managed by one team, RRT queues by another — while deployment layer seamlessly wires both together via remote state reads. The graceful fallback (length check returning 'dummyqueuearn') prevents plan failures when infra hasn't been applied yet." },
    ],
  },

  // ─── T-1 ────────────────────────────────────────────────────────────────
  {
    id: "perl-java",
    code: "T-1",
    category: "Architecture",
    title: "Perl → Java Modernization",
    subtitle: "12+ undocumented edge cases · 0 business disruption · transparent migration",
    company: "athenahealth · Rules Core Team",
    period: "2024",
    summary: "Led migration of a legacy Perl billing system to Java, discovering 12+ undocumented edge cases mid-migration, building a regression framework that caught 4 divergences, and managing transparent communication through changing requirements — with zero business disruption on launch.",
    heroMetric: { value: "0", label: "business disruption on launch" },
    metrics: [
      { value: "0",    label: "business disruption on launch" },
      { value: "12+",  label: "edge cases discovered & migrated" },
      { value: "4",    label: "regression divergences caught" },
      { value: "~10%", label: "processing capacity increase" },
    ],
    stack: ["Java", "Spring Boot", "Perl", "JUnit", "Regression Framework", "Feature Flags", "CI Config Validation", "Liquibase"],
    beforeItems: ["Legacy Perl system — undocumented business logic", "12+ hidden edge cases unknown to anyone", "No regression safety net for migration", "Requirements changing mid-migration"],
    afterItems:  ["Java system with full behavioral parity", "Regression framework now standard for future migrations", "~10% processing capacity increase", "0 business disruption on launch"],
    situation: `A legacy Perl-based file processing system at athenahealth handled critical billing workflows — real money, real patients. Years of accumulated business logic were embedded in undocumented Perl scripts with no test coverage. Product had committed to a modernisation to Java, and I was assigned to lead the migration.

Midway through, Product started changing requirements actively — new edge cases surfaced that the Perl code handled silently (no one knew they existed), and the timeline had already been communicated to leadership. I was in a position where I could either quietly over-promise and hope to catch up, or be transparent about the risk.`,
    task: `Deliver the migration with behavioural parity — the new Java system had to produce identical outputs to the legacy Perl system for every input variant. Manage the Product relationship transparently, especially when hidden complexity surfaced that would impact scope and timeline.`,
    actions: [
      { title: "Surfaced hidden complexity early",      body: "Discovered 12+ undocumented edge cases — special payer code handling, file encoding quirks, conditional logic never written down. Called a joint session with Product and my tech lead, walked them through findings with concrete examples, and proposed a revised scope estimate. Uncomfortable but necessary." },
      { title: "Built a regression framework for trust", body: "Created a side-by-side regression tool running both Perl and Java on the same inputs, flagging any output divergence. Gave Product objective, verifiable evidence of parity rather than asking them to trust my word. Tool caught 4 divergences I would have missed in testing." },
      { title: "Transparent timeline communication",    body: "When requirements changed mid-sprint twice, updated estimates openly rather than absorbing scope creep silently. Maintained a shared tracker visible to Product showing migration status per edge case — real-time visibility, not a crafted progress report." },
      { title: "Proactively disclosed a deployment mistake", body: "In one prod rollout, a config flag was set incorrectly — ~40 files were misrouted for 2 hours. I flagged this to my manager and ops team before anyone else noticed. Filed a post-mortem, added pre-deployment config validation in CI to prevent recurrence." },
      { title: "Twice-weekly syncs",                   body: "Rather than touching base only at sprint boundaries, ran frequent syncs showing in-progress work for early feedback. Alignment issues caught at 20% completion, not 80%." },
    ],
    results: `Zero business disruption on launch. 12+ undocumented edge cases discovered and migrated. Regression tool caught 4 divergences that would have been production bugs. ~10% processing capacity increase from Java implementation. Product owner later told my manager I was 'one of the most transparent engineers they'd worked with.' The regression tool became part of the team's standard process for future migrations.`,
    qas: [
      { q: "Tell me about the deployment mistake — what exactly happened?", a: "Feature flag name was wrong in the deployment config — it pointed to the old Perl path instead of the new Java path. Files were silently routed through the old system for about 2 hours before monitoring caught the divergence. I immediately pinged my manager and ops team in Slack — unprompted — with a clear description of what happened, what the impact was, and what my fix would be. Rolled back, reprocessed affected files, filed post-mortem. Added config validation step in CI so the same misconfiguration couldn't be deployed again." },
      { q: "How did you handle the scope change from Product?", a: "Didn't absorb it silently. Called a joint session, showed the specific edge cases with concrete examples, and proposed two options: extend the timeline by 2 weeks to handle all edge cases properly, or descope 3 of the lower-risk scenarios to a follow-up sprint. Product chose option 1. The key was giving them real information to make a real decision rather than pretending I could deliver on the original estimate." },
    ],
  },

  // ─── D-2 ────────────────────────────────────────────────────────────────
  {
    id: "api-performance",
    code: "D-2",
    category: "Data & Streaming",
    title: "API Performance + PPI Integration (v1.5.0)",
    subtitle: "P95/P99 <500ms at 10-20K RPS · Patient Wallet event bus · includeTransactionDetails flag",
    company: "athenahealth · AR Finance APIs",
    period: "2024",
    summary: "Diagnosed and resolved P95/P99 latency degradation in APIs serving 3M+ requests/day at 10–20K RPS peak, achieving <500ms through PostgreSQL index optimisation, autoscaling signal redesign, and API architecture improvements. Extended with PPI v1.5.0 — real-time Patient Wallet event propagation, filtered composite indexes, charge-level API, and OutstandingStatus filtering.",
    heroMetric: { value: "<500ms", label: "P95/P99 latency" },
    metrics: [
      { value: "<500ms", label: "P95/P99 latency" },
      { value: "~40%",   label: "P95 latency reduction" },
      { value: "0",      label: "regression on existing endpoints" },
      { value: "3M+",    label: "requests/day served" },
      { value: "+7",     label: "new query filters (v1.5.0)" },
    ],
    stack: ["PostgreSQL", "EXPLAIN ANALYZE", "CREATE INDEX CONCURRENTLY", "Locust", "ECS", "KEDA", "HPA", "SQS", "Prometheus", "Grafana", "includeTransactionDetails", "OutstandingStatus Enum", "Message Bus", "Filtered Composite Index"],
    beforeItems: ["P95/P99 latencies creeping up under load", "Full sequential scans on high-concurrency queries", "CPU-based autoscaling (wrong signal for I/O)", "No lazy/eager loading distinction in API", "No real-time Patient Wallet notification", "No balance status filtering (client-side only)", "transferRemittances always hydrated (penalizes existing callers)"],
    afterItems:  ["P95/P99 <500ms under high concurrency", "~40% P95 latency reduction", "KEDA autoscaling on real transaction load", "Eager/lazy API variant", "Real-time event published on patient receivable creation", "Server-side OutstandingStatus enum filter (OPEN/CLOSED/OVERPAID/UNDERPAID)", "includeTransactionDetails opt-in flag (default false, protects existing callers)"],
    situation: `We were expanding the financial platform to support PPI (Patient Wallet) integrations — new APIs and message-driven workflows. Existing APIs were already under pressure: traffic was unpredictable, payloads were growing, and P95/P99 latencies were creeping up. The system was serving 3M+ requests/day with peaks at 10–20K RPS. Any regression would directly impact payment flows for patients.

PPI v1.5.0 scope: Three critical gaps existed — (1) No real-time notification when patient receivables created (Patient Wallet had to poll or batch sync, patients saw stale balances), (2) No way to filter receivables by balance status OPEN/CLOSED/OVERPAID/UNDERPAID (consumers had to fetch all and filter in code — expensive, brittle), (3) No charge-level API (only claim-level GET existed — Patient Wallet and Apply couldn't access per-charge detail without over-fetching), (4) transferRemittances always hydrated on every GET response (heavy lazy-load penalized callers who didn't need transaction details, no opt-out).`,
    task: `Diagnose the performance degradation, implement targeted fixes without production disruption, and design the new Patient Wallet APIs to avoid repeating the same patterns.

PPI v1.5.0 full lifecycle: 4 Jira tickets (COLPMA-1642: new GET /charge-receivables/{chargeReceivableId} with full remittance hydration; COLPMA-1645: enrich existing GET endpoints with includeTransactionDetails, outstandingStatus, serviceDate, managedByClaimService, athenanetPatientId filters; COLPMA-1674: publish ar.createdPatientClaimReceivable event to message bus; COLPMA-2004: OutstandingStatus filter enum). Additionally: schema change (new filtered composite index via Liquibase), CEP integration test environment fix (Patient Wallet container orchestration), SDK test coverage, load testing (Python Locust, 500 concurrent users, 10 minutes), backward compatibility validation (INT environment, Apply service consumption).`,
    actions: [
      { title: "Root cause analysis",                         body: "Used EXPLAIN ANALYZE to identify missing indexes causing full sequential scans on tables with millions of rows under high concurrency. Used Locust load profiles to simulate three tiers — baseline, expected, and stress — to quantify the problem precisely before touching anything." },
      { title: "PostgreSQL index strategy",                   body: "Added indexes using CREATE INDEX CONCURRENTLY — no production locks, zero downtime. Validated effectiveness using P95/P99 before and after under identical Locust load. PPI v1.5.0: Created filtered composite index via Liquibase: CREATE INDEX IF NOT EXISTS idx_claim_receivable_filter ON ar.claim_receivable (context_id, transfer_type, outstanding_amount) WHERE voided IS NULL. Partial index excludes voided rows (halves index size, doubles selectivity). Column order: context_id first (highest cardinality), transfer_type (enum, 3 values), outstanding_amount (range scan last). Load test result: AAS < 0.01, buffer cache hit rate 100%, no degradation on deep pagination or large pages." },
      { title: "Eager vs lazy API design",                    body: "Designed includeTransactionDetails as opt-in boolean (default false). When false, transferRemittances explicitly set to null before serialization (not empty list — null unambiguously signals 'not requested' vs 'no data exists'). Tradeoff documented: null vs [] — returning null was deliberate choice. Controller test verified nullification fires exactly once when false, zero times when true. This protected all existing callers (Apply service, Patient Wallet) from regression." },
      { title: "Autoscaling signal redesign",                 body: "Replaced CPU-based ECS autoscaling with I/O and queue-depth signals (KEDA on SQS) — scaling now responded to actual financial transaction load. This cut P95 latency by ~40% by ensuring capacity existed when transactions were actually queuing, not just when CPU happened to spike." },
      { title: "API versioning + idempotency",                body: "Enforced URL-based versioning and idempotent POST handling — clients could safely retry without creating duplicate transactions. Critical for payment flows where network timeouts can trigger client-side retries." },
      { title: "Message bus event (PPI v1.5.0)",              body: "POST /v1/contexts/{contextId}/claim-receivables now publishes PatientWalletMsg event to message bus under specific conditions: published only for PATIENT transfer type OR managedByClaimService=true (insurance receivables not patient-facing — publishing for all would flood Patient Wallet SQS queue). Test-profile guard: log but don't publish (prevents CEP tests from polluting real message bus). Patient Wallet consumption flow validated via INT: AR publishes → Patient Wallet SQS → claimDebitProcessor.execute() → 7-step debit workflow (check outstanding amount → debit charge receivables → process claim-level credits → appointment credits → prepayment plan → other preferences → acknowledge). Verified on DEV: Patient Wallet logs confirmed consumption from message bus." },
      { title: "OutstandingStatus enum (PPI v1.5.0)",         body: "New outstandingStatus query parameter with 4 semantic states: CLOSED (outstandingAmount == 0), OPEN (outstandingAmount != 0), OVERPAID (< 0), UNDERPAID (> 0). Validated against real data on INT: filter CLOSED returned PRIMARY transfer type with outstandingAmount: 0; filter OPEN returned PATIENT with outstandingAmount: 9.22 UNDERPAID. Tradeoff: enum encapsulates business logic server-side — callers express intent, not implementation. OVERPAID (negative balance) is a real production state needed for refund processing." },
      { title: "New charge-level endpoint (PPI v1.5.0)",      body: "GET /v1/contexts/{contextId}/claim-receivables/{claimReceivableId}/charge-receivables/{chargeReceivableId} — fills critical gap: previously callers had to fetch full ClaimReceivable (all charges, all remittances, all transfer mappings) just to inspect one charge. New endpoint returns exactly one charge receivable with full remittance tree (payments, adjustments, transfers, denials). Real validated example from DEV (procedure code G0467, amount $253.00): chargePayments: -$143.67 (ACH), chargeAdjustments: -$34.68 (voided) + -$72.68 (active), chargeTransfers: -$36.65 (COINSURANCE), outstandingAmount: $0.00 CLOSED. SDK integration test added: ChargeReceivableApiTest invoked conditionally only when charge receivables exist on test claim." },
      { title: "CEP integration test fix (PPI v1.5.0)",       body: "Root cause: AR service failing to start in CEP test environment because patient_wallet schema didn't exist. Solution: Two-container orchestration — cep-patient-wallet runs Flyway migrations on startup creating patient_wallet schema, cep-patient-wallet-migration-check sidecar polls until patient_wallet.account table exists (healthcheck), cep-accounts-receivable-service depends_on migration-check with condition: service_healthy. Additional hardening: platform: linux/amd64 (Apple Silicon compat), Redis disabled for AR in test, health check retries 51→100 with start_period: 100s, uuid-ossp extension initialized, max_connections=200, condition: service_healthy dependency chains. Result: AR starts cleanly in CEP, Jenkins green." },
    ],
    results: `P95/P99 latency brought to <500ms under high concurrency. ~40% P95 reduction. Zero regression on existing endpoints. Autoscaling redesign also fixed the bursty traffic degradation that had been an open issue for months.

PPI v1.5.0 quantitative impact: Real-time patient wallet notification (eliminated sync lag). Charge-level API (new capability unblocked). Balance status filtering (reduced over-fetching via server-side enum). Transaction detail overhead (opt-in via includeTransactionDetails=false default protected all existing callers). New filters: 2 → 7 (added outstandingStatus, serviceDate, managedByClaimService, athenanetPatientId, includeTransactionDetails). CEP test environment: broken → green. AR service version: 1.4.2 → 1.5.0. PR scope: 51 files, +3,030 lines, -707 lines.

Load test results (500 concurrent users, 10 minutes): 22,943 total requests, peak DB active sessions 10-13 (of ~100 pool, 85-90% capacity remaining), DB CPU 40-45% peak (55-60% headroom), all SQL queries AAS < 0.05, new index AAS < 0.01, new index buffer cache hit rate 100%, patient outstanding endpoint p95 1-2s at 500 users.

Qualitative impact: Unlocked Patient Wallet real-time debit flow (claimDebitProcessor reacts to AR events without polling). Zero regression to existing callers (includeTransactionDetails=false default, backward compat validated on INT with Apply consuming new release). CEP test environment now stable (migration gate-keeper pattern reusable). Surgical index design (partial filtered index adds zero write overhead, 100% cache hit, graceful degradation).`,
    qas: [
      { q: "How did you identify CPU-based autoscaling as the wrong signal?", a: "Used CloudWatch to correlate CPU metrics against actual request throughput and P95 latency during traffic spikes. Found that CPU was consistently low during latency spikes — the bottleneck was I/O wait, not compute. Financial transaction processing involves significant DB I/O and queue operations. Replacing CPU with SQS queue depth as the scaling trigger meant the system responded to actual load, not a proxy metric that didn't capture the real bottleneck." },
      { q: "Walk me through the PostgreSQL optimisation approach.", a: "Started with EXPLAIN ANALYZE on the slowest queries under load — measuring, not guessing. Found 2 queries doing full sequential scans on tables with millions of rows because indexes were missing on filter columns used in high-concurrency reads. Added indexes with CREATE INDEX CONCURRENTLY to avoid production locking. Then re-ran Locust at all three tiers to validate the improvement was real and hadn't regressed anything. The before/after comparison under identical load was the evidence." },
      { q: "Why null vs empty list for transferRemittances when includeTransactionDetails=false?", a: "An empty list would be ambiguous: 'no transfer remittances exist' vs 'they weren't loaded.' null unambiguously signals 'not requested.' This is a contract design choice that prevents downstream consumers from making wrong assumptions. If they see null, they know to either (a) call again with includeTransactionDetails=true, or (b) that field isn't relevant to their use case. If they see [], they might incorrectly conclude the patient has no transaction history." },
    ],
  },

  // ─── C-1 ────────────────────────────────────────────────────────────────
  {
    id: "multi-region-dr",
    code: "C-1",
    category: "Reliability",
    title: "Multi-Region Disaster Recovery",
    subtitle: "Automated failover · zero downtime across all DR drills · org-wide reference",
    company: "athenahealth · AR Finance · us-east-1 / us-west-2",
    period: "2024",
    summary: "Designed and implemented automated multi-region disaster recovery for AR Finance between us-east-1 and us-west-2, achieving zero downtime across all DR drills and a ~40% P95 latency improvement as a by-product of fixing autoscaling signals.",
    heroMetric: { value: "0", label: "downtime in DR drills" },
    metrics: [
      { value: "~40%",     label: "P95 latency reduction" },
      { value: "0",        label: "downtime in all DR drills" },
      { value: "Org-wide", label: "adopted as reference architecture" },
      { value: "2",        label: "AWS regions automated" },
    ],
    stack: ["API Gateway", "CloudWatch", "ECS", "KEDA", "SQS", "Terraform", "Prometheus", "us-east-1", "us-west-2"],
    beforeItems: ["No automated DR between us-east and us-west", "Regional failure = hours of manual intervention", "CPU-based ECS scaling — wrong signal for I/O workloads", "Latency spikes during financial transaction peaks"],
    afterItems:  ["Automated failover — no client-side changes needed", "0 downtime across all DR drills", "~40% P95 latency reduction (autoscaling fix)", "Framework adopted org-wide as reference architecture"],
    situation: `The AR financial processing service had no automated disaster recovery between us-east and us-west. A regional failure would require manual intervention — potentially hours of downtime impacting billing and collections workflows for thousands of patients. Additionally, ECS autoscaling was CPU-based, causing latency spikes during I/O-heavy financial transaction peaks. The combination of no DR and wrong scaling signals made the system fragile at both the regional and load dimensions.`,
    task: `Design automated regional failover that requires no client-side changes during a DR event, and simultaneously fix the autoscaling signals that were masking the real bottleneck under load.`,
    actions: [
      { title: "Root cause analysis",         body: "Analysed CloudWatch metrics, ECS task health, and DB throughput to confirm that CPU-based scaling was the wrong signal for I/O-heavy workloads. Financial transaction processing is DB-bound and queue-bound, not CPU-bound." },
      { title: "Automated DR scripts",        body: "Designed automated DR scripts to tear down resources in us-east and spin up equivalents in us-west — API Gateway routing reconfigured for region failover without client-side changes. Any client calling the API endpoint continues working through a regional failure." },
      { title: "Correct autoscaling signals", body: "Custom CloudWatch alarms aligned to real throughput (queue depth + I/O) rather than CPU proxies. ECS autoscaling now responds to actual financial transaction load — this delivered the ~40% P95 latency reduction as a side effect of the DR work." },
      { title: "DR simulations",              body: "Led full end-to-end failover drills with DevOps and QA — go/no-go criteria documented, rollback runbooks tested for every service. Each simulation covered trigger → failover → traffic validation → data consistency check." },
    ],
    results: `Zero downtime across all DR drills. ~40% P95 latency reduction from autoscaling fix. DR framework adopted as reference architecture org-wide. No manual intervention required during any simulated regional failure — the automation worked exactly as designed.`,
    qas: [
      { q: "How did you validate the DR mechanism before any real failure?", a: "Led 3 full DR simulations with DevOps and QA. Each covered the full sequence: trigger CloudWatch alarm, execute DR scripts, validate us-west-2 is serving traffic, verify data consistency between regions. Documented go/no-go criteria for each phase so the procedure is repeatable by any on-call engineer, not just me. The runbooks became the standard for other teams." },
      { q: "Why was the latency improvement a side effect rather than the main goal?", a: "The main goal was regional resilience. But while analysing the system for DR design, I noticed CPU metrics were uncorrelated with actual latency — classic sign of wrong scaling signal. Fixing autoscaling was low-risk since we were already instrumenting the system, and the improvement was significant enough to include. The DR work created the right monitoring infrastructure that made the autoscaling fix straightforward." },
    ],
  },

  // ─── R-1 ────────────────────────────────────────────────────────────────
  {
    id: "s3-dmn",
    code: "R-1",
    category: "Architecture",
    title: "S3 DMN/Skrull Externalization",
    subtitle: "2-day R&D cycle → minutes · ↓80% cycle time · 5 services",
    company: "athenahealth · Posting Modernisation",
    period: "2024",
    summary: "Redesigned the skrull-framework core library to load DMN decision tables dynamically from S3, eliminating 15–20MB bloated Docker images across 5 services and reducing business rule change cycle time by 80%.",
    heroMetric: { value: "↓80%", label: "rule change cycle time" },
    metrics: [
      { value: "↓80%",    label: "cycle time for rule changes" },
      { value: "5",       label: "services impacted" },
      { value: "15–20MB", label: "image reduction per service" },
      { value: "0",       label: "R&D involvement for non-prod rules" },
    ],
    stack: ["AWS SDK TransferManager", "Spring Managed Temp Dir", "Drools DMNMarshaller", "S3 Cross-Region Replication", "Prometheus Metrics", "Jenkins", "Liquibase"],
    beforeItems: ["DMN change = full R&D sprint (days–weeks)", "15–20MB bloated Docker images per service", "No DR strategy for business-critical rule files", "A bad DMN commit broke CI across all 5 services"],
    afterItems:  ["Business self-serve in non-prod (minutes)", "Images slimmed across all 5 services", "Cross-region S3 replication — RTO/RPO guaranteed", "Zero R&D involvement for non-prod rule updates"],
    situation: `Across 5 mission-critical remittance processing services (Import, Router, Match, Preapply, Apply), all DMN decision tables and Skrull process JSON definitions were statically bundled inside each service's dependency JAR and baked into Docker images at build time. A 5-minute business logic change — even a minor threshold tweak — required a full R&D sprint, PR review, CI build, and prod deployment. DMN and Skrull files were adding ~15–20MB per service image. A bad DMN file committed to the repo would fail CI builds across all 5 services simultaneously.`,
    task: `As the engineer owning the skrull-framework core library — a shared dependency consumed by all 5 services — every architectural decision would be inherited platform-wide. Full end-to-end ownership of architecting and implementing the dynamic S3-based loading mechanism.`,
    actions: [
      { title: "Core framework changes",         body: "Modified DMNLoader.java and ProcessDefinitionLoader.java to support dual-mode loading. S3 mode: AWS SDK v1 TransferManager bulk-downloads all DMN/Skrull files from S3 into a Spring-managed temp dir, then streams into Drools DMNMarshaller. Toggle via property — empty = classpath fallback, set = S3 mode. No code change to switch modes." },
      { title: "Separate repos for rule files",  body: "Created posting-dmn and posting-skrull-configuration repos with sync scripts pushing to S3 buckets. Business teams now own rule changes directly in these repos without touching service code." },
      { title: "Deployment-ID isolation",        body: "Feature branch in rule repo maps to isolated S3 subfolder. Jenkins hashmap ensures integration tests use isolated DMN versions with zero cross-contamination between parallel feature branches." },
      { title: "Multi-env S3 + cross-region DR", body: "Provisioned 3 environment buckets (DEV/INT/PROD) with cross-region replication to us-west-2. S3 lifecycle policy auto-expires deployment folders after 60 days — zero manual cleanup. Rule files now have better DR posture than when bundled in JARs." },
      { title: "Toggle-driven phased rollout",   body: "Week 1: Import service (highest volume, most DMNs) with 2-day monitoring window. Week 2: Router, Match, Preapply, Apply. Rollback: flip property to empty → classpath restored instantly, no redeploy needed." },
    ],
    results: `DMN change cycle time went from a full R&D sprint to minutes for non-prod updates. Business teams fully autonomous — zero R&D involvement for non-prod rule changes. Docker images slimmed 15–20MB per service across all 5 services. 20 concurrent ECS tasks validated in startup with no S3 throttling issues. Cross-region replication guarantees RTO/RPO for business rules that previously had no DR strategy.`,
    qas: [
      { q: "Why own the framework changes rather than delegating to individual service teams?", a: "The skrull-framework is a shared dependency — if each team independently modified their own loading logic, we'd end up with 5 divergent implementations impossible to maintain or upgrade. Centralising in the framework means a single change benefits all 5 services automatically. This is exactly the kind of leverage that makes the solution scale without ongoing maintenance burden." },
      { q: "How did you handle the risk of S3 being unavailable at service startup?", a: "Two layers of protection. First, the dual-mode toggle — if S3 is unavailable, flip property to empty and fall back to classpath without a code redeploy. Second, we added Prometheus metrics (skrull.dmn.error.counter) with alerting on download failure so ops is notified immediately rather than silently falling back. We tested this failure scenario explicitly in staging before rollout." },
    ],
    architecture: [
      { aspect: "DMN loading",      before: "Classpath JAR — files baked into Docker image at build time",   after: "S3 TransferManager bulk-download at startup — runtime loading" },
      { aspect: "Change cycle",     before: "Full R&D sprint (days–weeks) for any rule update",              after: "Minutes for non-prod — business teams fully autonomous" },
      { aspect: "Image size",       before: "+15–20MB per service (DMN + Skrull files bundled)",             after: "Slimmed across all 5 services — no rule files in image" },
      { aspect: "Rule ownership",   before: "R&D only — business teams file tickets, wait for sprint",       after: "Business teams own non-prod directly in rule repos" },
      { aspect: "Env isolation",    before: "No branch isolation — bad DMN breaks CI across all 5 services", after: "Feature branch → isolated S3 subfolder, zero contamination" },
      { aspect: "DR posture",       before: "None — rules bundled in JARs with no backup strategy",          after: "Cross-region S3 replication to us-west-2, RTO/RPO guaranteed" },
      { aspect: "Cleanup",          before: "Manual — deployment folders accumulate indefinitely",           after: "Automated S3 lifecycle policy (60-day expiry)" },
      { aspect: "Rollback",         before: "Full redeploy required to revert a rule change",                after: "Flip property to empty — classpath restored instantly, no redeploy" },
    ],
    diagram: { src: '/diagrams/s31.png', alt: 'S3 DMN externalization: rule repo → S3 buckets → runtime download into 5 services, cross-region replication', caption: 'S3 DMN/Skrull Externalization — dual-mode loading, 3 environment buckets, cross-region DR, business self-serve' },
  },

  // ─── I-1 ────────────────────────────────────────────────────────────────
  {
    id: "billing-ai",
    code: "I-1",
    category: "AI & Innovation",
    title: "Billing Issue Classification — Agentic AI Pipeline",
    subtitle: "Claude + OpenAI + BERT · insurance error detection · ops review eliminated",
    company: "athenahealth · Posting Modernisation",
    period: "2024",
    summary: "Designed and built an agentic AI pipeline combining Claude, OpenAI, and BERT to automatically detect insurance billing errors, classify root causes, and recommend corrective actions — eliminating manual ops review for classified error categories.",
    heroMetric: { value: "3", label: "AI models in ensemble" },
    metrics: [
      { value: "3",      label: "AI models combined" },
      { value: "↓",      label: "ops review time" },
      { value: "Agentic", label: "AI pipeline in prod domain" },
      { value: "0",      label: "manual review for classified errors" },
    ],
    stack: ["Claude API", "OpenAI API", "BERT", "Python", "NLP", "Jupyter", "Spyder", "JSON Metrics Pipeline", "Windsurf"],
    beforeItems: ["Ops team manually reviewing every billing error", "Slow, inconsistent root cause identification", "Hard to scale as transaction volume grew", "No structured metrics on error distribution"],
    afterItems:  ["Automated classification for all known error categories", "Structured JSON metrics feeding ops dashboards", "Corrective action recommendations per error type", "3-model ensemble for higher accuracy than any single LLM"],
    situation: `The posting modernisation platform at athenahealth processed remittance data from insurance payers — parsing, routing, and applying payments to patient accounts. Incorrect billing (claim denials, wrong remittance matching, posting errors) was a significant operational burden: the ops team was manually reviewing individual transactions to identify root causes — a process that was slow, inconsistent, and hard to scale as transaction volume grew.`,
    task: `Design and build a system to automatically detect insurance billing errors, classify their root causes, and recommend corrective actions — reducing manual ops review time and improving consistency of error resolution.`,
    actions: [
      { title: "Agentic AI pipeline design",        body: "Built an end-to-end pipeline combining Claude (Anthropic) + OpenAI for LLM-based error classification with BERT for domain-specific pattern recognition in billing codes and remittance data. Each model contributes its strength to the ensemble." },
      { title: "Structured metrics output",         body: "System classified errors into actionable categories (denial reason codes, posting mismatches, routing errors) and generated structured JSON metrics that fed into ops dashboards — giving teams quantified visibility into error distribution." },
      { title: "Corrective action recommendations", body: "For each classified error type, the pipeline suggested specific corrective actions based on historical resolution patterns — shifting ops from reactive lookup to guided, consistent resolution." },
      { title: "Domain-specific BERT fine-tuning",  body: "Standard BERT vocabulary doesn't include ICD codes, CARC/RARC codes, or remittance advice formats. Fine-tuned BERT specifically for healthcare billing terminology to improve pattern recognition accuracy in the structured input layer." },
    ],
    results: `Ops issue resolution time reduced for classified error categories. Manual review eliminated for automatically-classified errors. 3-model ensemble produced higher accuracy than any single model alone for healthcare billing domain. Agentic AI pipeline operating in production healthcare billing context.`,
    qas: [
      { q: "Why use multiple LLMs rather than just one?", a: "Each model has different strengths in this context. BERT was fine-tuned for domain-specific billing code pattern recognition — fast and accurate for structured categorical inputs like ICD and CARC codes. Claude and OpenAI were used for the higher-level classification and corrective action reasoning where natural language understanding of error narratives mattered more. The ensemble approach gave better accuracy than any single model alone for a domain as specialised as healthcare billing. We tested each model independently first, then compared ensemble vs single-model accuracy before committing." },
      { q: "What were the biggest engineering challenges?", a: "Two main ones. First, getting BERT to work well with healthcare billing terminology required domain-specific fine-tuning — the standard vocabulary doesn't include ICD codes, CARC/RARC codes, or remittance advice formats. Second, prompt engineering for the LLM classification layer to produce consistently structured JSON output matching the ops dashboard schema. Small variations in output format caused downstream parsing failures. Solved by specifying strict JSON schemas in the system prompt and adding validation layers before the dashboard write." },
    ],
  },
];

// ─── Helper: get by id ───────────────────────────────────────────────────────
export function getCaseStudy(id) {
  return CASE_STUDIES.find((cs) => cs.id === id) || null;
}

// ─── Categories for filter tabs ──────────────────────────────────────────────
export const CATEGORIES = ["All", "Platform Engineering", "Data & Streaming", "Reliability", "Architecture", "AI & Innovation"];
