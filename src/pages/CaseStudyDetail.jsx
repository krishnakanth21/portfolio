import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { CASE_STUDIES } from '../data/caseStudies'

export default function CaseStudyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const cs = CASE_STUDIES.find(c => c.id === id)

  useEffect(() => { window.scrollTo(0, 0) }, [id])

  if (!cs) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Case study not found.</p>
      <button onClick={() => navigate('/case-studies')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>← Back to Case Studies</button>
    </div>
  )

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
        <button onClick={() => navigate('/')} style={navBtnStyle} onMouseEnter={e => e.currentTarget.style.color='var(--text)'} onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
          <ArrowLeft size={14} /> Portfolio
        </button>
        <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>/</span>
        <button onClick={() => navigate('/case-studies')} style={navBtnStyle} onMouseEnter={e => e.currentTarget.style.color='var(--text)'} onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
          Case Studies
        </button>
        <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cs.code} — {cs.title}</span>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '52px 24px 96px' }}>

        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', background: 'var(--tag-bg)', border: '1px solid var(--border-accent)', borderRadius: 100, padding: '3px 11px', letterSpacing: '0.04em' }}>{cs.code}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 100, padding: '3px 11px' }}>{cs.category}</span>
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 10 }}>{cs.title}</h1>
          <p style={{ fontSize: 16, color: 'var(--accent)', fontWeight: 500, marginBottom: 6 }}>{cs.subtitle}</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{cs.company} · {cs.period}</p>
        </div>

        {/* Hero metric + summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, marginBottom: 32, alignItems: 'stretch' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: 14, padding: '24px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--accent)', lineHeight: 1 }}><AnimatedNumber value={cs.heroMetric.value} /></div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 7, fontWeight: 500, lineHeight: 1.4 }}>{cs.heroMetric.label}</div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px', display: 'flex', alignItems: 'center' }}>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.75, margin: 0 }}>{cs.summary}</p>
          </div>
        </div>

        {/* Metrics grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
          {cs.metrics.map((m, i) => (
            <div key={m.label} style={{ padding: '18px 20px', borderRight: i < cs.metrics.length - 1 ? '1px solid var(--border)' : 'none', minWidth: 110 }}>
              <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--accent)', lineHeight: 1 }}><AnimatedNumber value={m.value} /></div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500, lineHeight: 1.3 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Before / After */}
        {cs.beforeItems && cs.afterItems && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>Before</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {cs.beforeItems.map((b, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--text-muted)', paddingLeft: 18, position: 'relative', marginBottom: 8, lineHeight: 1.55 }}>
                    <span style={{ position: 'absolute', left: 0, color: '#ef4444' }}>✗</span>{b}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green-text)', marginBottom: 14 }}>After</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {cs.afterItems.map((a, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--text-muted)', paddingLeft: 18, position: 'relative', marginBottom: 8, lineHeight: 1.55 }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--green)' }}>✓</span>{a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Stack */}
        <div style={{ marginBottom: 32 }}>
          <div className="section-eyebrow" style={{ marginBottom: 12 }}>Tech stack</div>
          <div className="pill-row" style={{ marginTop: 0 }}>
            {cs.stack.map(s => <span key={s} className="pill">{s}</span>)}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: 32 }} />

        {/* Situation */}
        <StarSection title="Situation" content={cs.situation} defaultOpen />

        {/* Task */}
        <StarSection title="Task" content={cs.task} />

        {/* Actions */}
        <div style={{ marginBottom: 28 }}>
          <div className="section-eyebrow" style={{ marginBottom: 16 }}>Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cs.actions.map((action, i) => (
              <ActionCard key={i} index={i + 1} action={action} />
            ))}
          </div>
        </div>

        {/* Results */}
        <div style={{ marginBottom: 32 }}>
          <div className="section-eyebrow" style={{ marginBottom: 12 }}>Results</div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: 14, padding: '22px 24px' }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>{cs.results}</p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: 32 }} />

        {/* Q&A */}
        {cs.qas && cs.qas.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div className="section-eyebrow" style={{ marginBottom: 16 }}>Follow-up Q&amp;A</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cs.qas.map((qa, i) => <QACard key={i} qa={qa} />)}
            </div>
          </div>
        )}

        {/* Bottom nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <button onClick={() => navigate('/case-studies')} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '10px 18px',
            color: 'var(--text)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <ArrowLeft size={15} /> All case studies
          </button>
          <NextPrev current={cs} />
        </div>

      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StarSection({ title, content, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ marginBottom: 20 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: open ? '14px 14px 0 0' : 14,
          padding: '14px 20px', cursor: 'pointer', fontFamily: 'inherit',
          color: 'var(--text)', transition: 'border-color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = open ? 'var(--border-accent)' : 'var(--border)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)' }}>S·T·A·R</span>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
        </div>
        {open ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
      </button>
      {open && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-accent)',
          borderTop: 'none', borderRadius: '0 0 14px 14px',
          padding: '20px 24px',
        }}>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.85, margin: 0, whiteSpace: 'pre-line' }}>{content}</p>
        </div>
      )}
    </div>
  )
}

function ActionCard({ index, action }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      background: 'var(--bg-card)', border: `1px solid ${open ? 'var(--border-accent)' : 'var(--border)'}`,
      borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.15s',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          background: 'none', border: 'none', padding: '16px 20px',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        }}
      >
        <span style={{
          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
          background: 'var(--tag-bg)', color: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800,
        }}>{index}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{action.title}</span>
        {open ? <ChevronUp size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
      </button>
      {open && (
        <div style={{ padding: '0 20px 18px 60px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8, margin: 0 }}>{action.body}</p>
        </div>
      )}
    </div>
  )
}

function QACard({ qa }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      background: 'var(--bg-card)', border: `1px solid ${open ? 'var(--border-accent)' : 'var(--border)'}`,
      borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.15s',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14,
          background: 'none', border: 'none', padding: '16px 20px',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>Q: {qa.q}</span>
        <span style={{ flexShrink: 0, marginTop: 2 }}>
          {open ? <ChevronUp size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 20px 18px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8, margin: '14px 0 0' }}>{qa.a}</p>
        </div>
      )}
    </div>
  )
}

function NextPrev({ current }) {
  const navigate = useNavigate()
  const idx = CASE_STUDIES.findIndex(c => c.id === current.id)
  const next = CASE_STUDIES[idx + 1]
  if (!next) return null
  return (
    <button
      onClick={() => navigate(`/case-studies/${next.id}`)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--tag-bg)', border: '1px solid var(--border-accent)',
        borderRadius: 8, padding: '10px 18px',
        color: 'var(--accent)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
        cursor: 'pointer', transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      {next.code}: {next.title} →
    </button>
  )
}

function AnimatedNumber({ value }) {
  const trimmed = String(value).trim()
  const num = parseInt(trimmed, 10)
  const isPlainInt = !isNaN(num) && String(num) === trimmed

  const start = isPlainInt ? (num === 0 ? 100 : 0) : null
  const [display, setDisplay] = useState(start)

  useEffect(() => {
    if (!isPlainInt) return
    const end = num
    const from = num === 0 ? 100 : 0
    const duration = 1000
    const startTime = performance.now()

    const tick = (now) => {
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (end - from) * eased))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [])

  return <>{isPlainInt ? display : value}</>
}

const navBtnStyle = {
  display: 'flex', alignItems: 'center', gap: 6,
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-muted)', fontSize: 13, fontWeight: 600,
  fontFamily: 'inherit', padding: '5px 0',
  transition: 'color 0.15s',
}
