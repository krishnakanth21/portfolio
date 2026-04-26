import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { CASE_STUDIES } from '../data/caseStudies'

const CATEGORIES = ['All', ...Array.from(new Set(CASE_STUDIES.map(cs => cs.category)))]

const AGG_STATS = [
  { value: '11',      label: 'case studies' },
  { value: '7d→30s',  label: 'CDC lag reduction' },
  { value: '0',       label: 'prod downtime incidents' },
  { value: '~40%',    label: 'P95 latency reduction' },
  { value: '6',       label: 'teams coordinated' },
  { value: '↓80%',    label: 'rule change cycle time' },
]

export default function CaseStudies() {
  const navigate = useNavigate()
  const [active, setActive] = useState('All')
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const filtered = active === 'All'
    ? CASE_STUDIES
    : CASE_STUDIES.filter(cs => cs.category === active)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        height: 56, display: 'flex', alignItems: 'center',
        padding: '0 max(24px, calc(50vw - 560px))',
        background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        gap: 16,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 13, fontWeight: 600,
            fontFamily: 'inherit', padding: '5px 0',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={15} /> Portfolio
        </button>
        <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Case Studies</span>
      </div>

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '56px 24px 96px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div className="section-eyebrow" style={{ marginBottom: 12 }}>Engineering deep dives</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 16 }}>
            Case Studies
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 520, lineHeight: 1.75 }}>
            Eleven systems I've designed, built, and operated — each documented with the full situation, architecture decisions, measured outcomes, and follow-up questions.
          </p>
        </div>

        {/* Aggregate stats */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 0,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 14, overflow: 'hidden', marginBottom: 32,
        }}>
          {AGG_STATS.map((s, i) => (
            <div key={s.label} style={{
              padding: '18px 22px', borderRight: i < AGG_STATS.length - 1 ? '1px solid var(--border)' : 'none',
              minWidth: 100,
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--accent)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}>
          {CATEGORIES.map(cat => {
            const count = cat === 'All' ? CASE_STUDIES.length : CASE_STUDIES.filter(c => c.category === cat).length
            const isActive = active === cat
            return (
              <button key={cat} onClick={() => setActive(cat)} style={{
                fontSize: 12, fontWeight: 600,
                padding: '5px 14px', borderRadius: 100,
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                background: isActive ? 'var(--accent)' : 'var(--bg-card)',
                color: isActive ? 'white' : 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}>
                {cat} <span style={{ opacity: 0.65 }}>{count}</span>
              </button>
            )
          })}
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(cs => (
            <CaseStudyCard key={cs.id} cs={cs} onClick={() => navigate(`/case-studies/${cs.id}`)} />
          ))}
        </div>

      </div>
    </div>
  )
}

function CaseStudyCard({ cs, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', textAlign: 'left', fontFamily: 'inherit', color: 'var(--text)',
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--border-accent)' : 'var(--border)'}`,
        borderRadius: 14, padding: '22px 26px',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'border-color 0.2s, transform 0.2s',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'var(--accent)',
              background: 'var(--tag-bg)', border: '1px solid var(--border-accent)',
              borderRadius: 100, padding: '2px 9px', letterSpacing: '0.04em',
            }}>{cs.code}</span>
            <span style={{
              fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 100, padding: '2px 9px',
            }}>{cs.category}</span>
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 3px' }}>{cs.title}</h2>
          <p style={{ fontSize: 13, color: 'var(--accent)', margin: '0 0 2px', fontWeight: 500 }}>{cs.subtitle}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{cs.company} · {cs.period}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, alignSelf: 'flex-start' }}>
          <span style={{
            fontSize: 11, color: 'var(--text-muted)',
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 100, padding: '3px 10px', whiteSpace: 'nowrap',
          }}>{cs.actions.length} actions</span>
          <ChevronRight size={16} color="var(--text-faint)" />
        </div>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 14 }}>{cs.summary}</p>

      {/* Metrics strip */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 0,
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        padding: '10px 0', marginBottom: 14,
      }}>
        {cs.metrics.map(m => (
          <span key={m.label} style={{ marginRight: 20, marginBottom: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.03em' }}>{m.value}</span>
            {' '}
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.label}</span>
          </span>
        ))}
      </div>

      {/* Stack pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {cs.stack.slice(0, 7).map(s => (
          <span key={s} className="pill">{s}</span>
        ))}
        {cs.stack.length > 7 && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>+{cs.stack.length - 7} more</span>
        )}
      </div>
    </button>
  )
}
