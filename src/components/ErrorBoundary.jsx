import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Portfolio error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', background: '#08080c', color: '#f0f0f6',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 16, textAlign: 'center', padding: '0 24px',
          fontFamily: "'Inter', sans-serif",
        }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: '#6382ff', letterSpacing: '-0.04em' }}>
            Oops
          </div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Something went wrong</div>
          <div style={{ fontSize: 14, color: '#8888a0', maxWidth: 380, lineHeight: 1.7 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </div>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{
              marginTop: 8, padding: '10px 28px', borderRadius: 100,
              background: '#6382ff', color: '#fff', border: 'none',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Reload page
          </button>
          <a
            href="mailto:krishnakanthe99@gmail.com"
            style={{ fontSize: 12, color: '#8888a0', textDecoration: 'none' }}
          >
            krishnakanthe99@gmail.com
          </a>
        </div>
      )
    }
    return this.props.children
  }
}
