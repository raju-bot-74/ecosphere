import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'

// Animated counter hook
function useCounter(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [end, duration, start])
  return count
}

// Intersection observer hook
function useInView() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true)
    }, { threshold: 0.2 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return { ref, inView }
}

// Particle background component
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${4 + Math.random() * 6}s`,
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
            opacity: 0.15 + Math.random() * 0.3,
          }}
        />
      ))}
    </div>
  )
}

// Mini bar chart
function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const { ref, inView } = useInView()
  const max = Math.max(...data.map(d => d.value))
  return (
    <div ref={ref} className="flex items-end gap-3 h-40 mt-4">
      {data.map((d, i) => (
        <div key={d.label} className="flex flex-col items-center flex-1 gap-2">
          <span className="text-xs text-gray-400 font-mono">{d.value}</span>
          <div className="w-full rounded-t-lg relative overflow-hidden" style={{ height: '100px', background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="absolute bottom-0 w-full rounded-t-lg transition-all"
              style={{
                height: inView ? `${(d.value / max) * 100}%` : '0%',
                background: d.color,
                transitionDuration: `${800 + i * 150}ms`,
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
          </div>
          <span className="text-xs text-gray-400 text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

// Line sparkline
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const h = 60, w = 200
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / (max - min)) * h
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${points} ${w},${h}`} fill={`url(#grad-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Donut chart
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const { ref, inView } = useInView()
  const total = segments.reduce((a, b) => a + b.value, 0)
  let cumulative = 0
  const r = 60, cx = 70, cy = 70, stroke = 18
  const circumference = 2 * Math.PI * r

  return (
    <div ref={ref} className="flex items-center gap-6">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const fraction = seg.value / total
          const dash = fraction * circumference
          const offset = circumference - cumulative * circumference / total
          cumulative += seg.value
          return (
            <circle
              key={seg.label}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${inView ? dash : 0} ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: `stroke-dasharray ${600 + i * 200}ms cubic-bezier(0.34,1.56,0.64,1)`, transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          )
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="11" opacity="0.6">Total</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{total}%</text>
      </svg>
      <div className="flex flex-col gap-2">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-gray-300">{s.label}</span>
            <span className="text-xs font-bold text-white ml-auto">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Stat card with counter
function StatCard({ value, label, suffix = '', prefix = '', color, icon, delay = 0 }: {
  value: number; label: string; suffix?: string; prefix?: string; color: string; icon: string; delay?: number
}) {
  const { ref, inView } = useInView()
  const count = useCounter(value, 2000, inView)
  return (
    <div ref={ref} className="stat-card group" style={{ animationDelay: `${delay}ms` }}>
      <div className="text-3xl mb-3">{icon}</div>
      <div className="text-4xl font-black mb-1" style={{ color }}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-gray-400 font-medium">{label}</div>
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at center, ${color}10, transparent)` }} />
    </div>
  )
}

export default function Home() {
  const [carbonForm, setCarbonForm] = useState({ energy: '10', transport: 'car', diet: 'meat', flights: '0', shopping: 'average' })
  const [carbonResult, setCarbonResult] = useState<null | { daily: number; yearly: number; grade: string; tips: string[] }>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('emissions')
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleCalc = () => {
    const energy = parseFloat(carbonForm.energy) || 0
    const transport = carbonForm.transport === 'car' ? 4.6 : carbonForm.transport === 'bus' ? 0.18 : carbonForm.transport === 'ev' ? 0.5 : 0.05
    const diet = carbonForm.diet === 'meat' ? 7.2 : carbonForm.diet === 'vegetarian' ? 3.8 : 1.5
    const flights = parseFloat(carbonForm.flights) * 0.9
    const shopping = carbonForm.shopping === 'high' ? 3.5 : carbonForm.shopping === 'average' ? 1.8 : 0.8
    const daily = energy * 0.92 + transport + diet + (flights / 365) + shopping
    const yearly = daily * 365
    const grade = yearly < 2000 ? 'A+' : yearly < 4000 ? 'A' : yearly < 6000 ? 'B' : yearly < 10000 ? 'C' : 'D'
    const tips = [
      transport === 4.6 ? '🚗 Switch to EV or public transit — saves ~1,500kg/year' : '✅ Great transport choice!',
      diet === 7.2 ? '🥩 Try Meatless Monday — saves ~800kg/year' : '✅ Excellent diet choice!',
      energy > 15 ? '💡 Switch to LED & solar — saves ~500kg/year' : '✅ Good energy usage!',
    ]
    setCarbonResult({ daily, yearly, grade, tips })
  }

  const co2Data = [
    { label: '1960', value: 317, color: '#4ade80' },
    { label: '1980', value: 339, color: '#86efac' },
    { label: '2000', value: 369, color: '#fbbf24' },
    { label: '2010', value: 390, color: '#f97316' },
    { label: '2020', value: 413, color: '#ef4444' },
    { label: '2024', value: 421, color: '#dc2626' },
  ]

  const tempData = [310, 314, 318, 325, 334, 344, 355, 370, 385, 400, 413, 421]

  const emissionSegments = [
    { label: 'Energy', value: 34, color: '#f97316' },
    { label: 'Transport', value: 24, color: '#3b82f6' },
    { label: 'Agriculture', value: 19, color: '#22c55e' },
    { label: 'Industry', value: 23, color: '#a855f7' },
  ]

  return (
    <>
      <Head>
        <title>EcoSphere — Climate Action Platform</title>
        <meta name="description" content="Advanced climate action platform with real-time data, carbon calculator, and sustainability tools." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --green: #00d97e;
          --green-dark: #00a85a;
          --bg: #050f0a;
          --bg2: #0a1a10;
          --bg3: #0f2418;
          --text: #e8f5ee;
          --muted: #6b8f77;
          --card: rgba(255,255,255,0.04);
          --border: rgba(0,217,126,0.12);
        }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
        h1,h2,h3,h4 { font-family: 'Syne', sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--green-dark); border-radius: 2px; }

        /* Particle */
        .particle {
          position: absolute;
          background: var(--green);
          border-radius: 50%;
          animation: float linear infinite;
        }
        @keyframes float {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }

        /* Glow text */
        .glow { text-shadow: 0 0 40px rgba(0,217,126,0.4); }
        .glow-sm { text-shadow: 0 0 20px rgba(0,217,126,0.3); }

        /* Gradient text */
        .grad-text {
          background: linear-gradient(135deg, #00d97e 0%, #00bfff 50%, #00d97e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200%;
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer { 0% { background-position: 0% } 100% { background-position: 200% } }

        /* Nav */
        .nav-glass {
          background: rgba(5,15,10,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .nav-link {
          color: var(--muted);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: color 0.2s;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--green);
          transition: width 0.3s;
        }
        .nav-link:hover { color: var(--green); }
        .nav-link:hover::after { width: 100%; }

        /* Buttons */
        .btn-primary {
          background: var(--green);
          color: #050f0a;
          font-weight: 700;
          padding: 14px 32px;
          border-radius: 100px;
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
          font-family: 'Syne', sans-serif;
          transition: all 0.3s;
          box-shadow: 0 0 30px rgba(0,217,126,0.3);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 50px rgba(0,217,126,0.5);
        }
        .btn-outline {
          background: transparent;
          color: var(--green);
          border: 1px solid rgba(0,217,126,0.4);
          padding: 13px 32px;
          border-radius: 100px;
          cursor: pointer;
          font-size: 0.95rem;
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        .btn-outline:hover {
          background: rgba(0,217,126,0.1);
          border-color: var(--green);
        }

        /* Cards */
        .card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 28px;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        .card:hover {
          border-color: rgba(0,217,126,0.3);
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,217,126,0.03), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .card:hover::before { opacity: 1; }

        .stat-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 28px;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
          text-align: center;
        }
        .stat-card:hover {
          border-color: rgba(0,217,126,0.3);
          transform: translateY(-6px);
        }

        /* Section */
        .section { padding: 100px 0; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        /* Hero bg */
        .hero-bg {
          background:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,217,126,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(0,191,255,0.08) 0%, transparent 50%),
            var(--bg);
        }

        /* Grid bg pattern */
        .grid-bg {
          background-image:
            linear-gradient(rgba(0,217,126,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,217,126,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* Tag */
        .tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(0,217,126,0.1);
          border: 1px solid rgba(0,217,126,0.25);
          color: var(--green);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 600;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.05em;
        }

        /* Progress bar */
        .progress-bar {
          height: 6px;
          background: rgba(255,255,255,0.06);
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 1.5s cubic-bezier(0.34,1.56,0.64,1);
        }

        /* Input */
        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 16px;
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          transition: border-color 0.2s;
          outline: none;
        }
        .input-field:focus { border-color: rgba(0,217,126,0.5); }
        .input-field option { background: #0a1a10; }
        .input-label {
          display: block;
          font-size: 0.82rem;
          color: var(--muted);
          font-weight: 500;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        /* Grade badge */
        .grade-badge {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
        }

        /* Tab */
        .tab-btn {
          padding: 8px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        .tab-active { background: var(--green); color: #050f0a; }
        .tab-inactive { background: transparent; color: var(--muted); }
        .tab-inactive:hover { color: var(--text); }

        /* Ticker */
        .ticker-wrap {
          overflow: hidden;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: rgba(0,217,126,0.03);
        }
        .ticker {
          display: flex;
          gap: 60px;
          animation: ticker 20s linear infinite;
          white-space: nowrap;
          padding: 10px 0;
        }
        @keyframes ticker { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }

        /* Feature icon */
        .feat-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          margin-bottom: 16px;
        }

        /* SDG pill */
        .sdg-pill {
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 0.82rem;
          font-weight: 700;
          font-family: 'Syne', sans-serif;
          text-align: center;
          cursor: default;
          transition: transform 0.2s;
        }
        .sdg-pill:hover { transform: scale(1.05); }

        /* Mobile menu */
        .mobile-menu {
          background: rgba(5,15,10,0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }

        /* Fade in up */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeInUp 0.7s ease forwards; }
        .fade-in-2 { animation: fadeInUp 0.7s 0.15s ease forwards; opacity: 0; }
        .fade-in-3 { animation: fadeInUp 0.7s 0.3s ease forwards; opacity: 0; }
        .fade-in-4 { animation: fadeInUp 0.7s 0.45s ease forwards; opacity: 0; }

        /* Pulse ring */
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .pulse-ring {
          position: absolute;
          inset: -8px;
          border: 2px solid var(--green);
          border-radius: 50%;
          animation: pulseRing 2s infinite;
        }

        /* Globe spin */
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin-slow { animation: spin-slow 30s linear infinite; }

        /* Responsive */
        @media (max-width: 768px) {
          .section { padding: 60px 0; }
          h1 { font-size: 2.8rem !important; }
        }
      `}</style>

      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

        {/* NAV */}
        <nav className="nav-glass" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--green)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🌍</div>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>Eco<span style={{ color: 'var(--green)' }}>Sphere</span></span>
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="hidden md:flex">
              {['features', 'data', 'calculator', 'about'].map(s => (
                <a key={s} href={`#${s}`} className="nav-link" style={{ textTransform: 'capitalize' }}>{s}</a>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <a href="#calculator" className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.85rem', display: 'none' }} id="nav-cta">
                Get Started
              </a>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--text)', fontSize: '1.1rem' }}
                className="md:hidden"
              >
                {menuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="mobile-menu" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {['features', 'data', 'calculator', 'about'].map(s => (
                <a key={s} href={`#${s}`} onClick={() => setMenuOpen(false)} style={{ color: 'var(--muted)', textDecoration: 'none', fontWeight: 500, textTransform: 'capitalize' }}>{s}</a>
              ))}
              <a href="#calculator" className="btn-primary" style={{ width: 'fit-content' }}>Get Started →</a>
            </div>
          )}
        </nav>

        {/* TICKER */}
        <div className="ticker-wrap">
          <div className="ticker">
            {[...Array(2)].map((_, ri) => (
              <React.Fragment key={ri}>
                {['🌡️ CO₂: 421ppm', '🌊 Sea Rise: +3.7mm/yr', '🔥 Temp: +1.1°C', '🧊 Arctic Ice: -13%/decade', '🌪️ Extreme Events: +40%', '🌱 Renewable Energy: 30% global', '💨 CH₄ Levels: Record High'].map(t => (
                  <span key={t} style={{ color: 'var(--muted)', fontSize: '0.82rem', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{t}</span>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* HERO */}
        <section className="hero-bg grid-bg" style={{ padding: '120px 0 100px', position: 'relative', overflow: 'hidden' }} ref={heroRef}>
          <Particles />
          <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div className="tag fade-in" style={{ marginBottom: '24px' }}>
              <span>●</span> Live Climate Data 2026
            </div>
            <h1 className="fade-in-2 glow" style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', fontWeight: 800, lineHeight: 1.05, marginBottom: '24px', letterSpacing: '-0.02em' }}>
              The Planet Is<br />
              <span className="grad-text">Running Out of Time</span>
            </h1>
            <p className="fade-in-3" style={{ fontSize: '1.2rem', color: 'var(--muted)', maxWidth: '560px', margin: '0 auto 40px', lineHeight: 1.7 }}>
              Track your carbon footprint, explore live climate data, and join millions taking action for a sustainable future.
            </p>
            <div className="fade-in-4" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#calculator" className="btn-primary">Calculate My Impact →</a>
              <a href="#data" className="btn-outline">Explore Data</a>
            </div>

            {/* Hero stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginTop: '72px', maxWidth: '700px', margin: '72px auto 0' }}>
              {[
                { val: '421', unit: 'ppm', label: 'Atmospheric CO₂', color: '#ef4444' },
                { val: '1.1', unit: '°C', label: 'Temp Increase', color: '#f97316' },
                { val: '3.7', unit: 'mm', label: 'Annual Sea Rise', color: '#3b82f6' },
                { val: '2030', unit: '', label: 'Critical Deadline', color: '#00d97e' },
              ].map(s => (
                <div key={s.label} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Syne', color: s.color }}>
                    {s.val}<span style={{ fontSize: '1rem' }}>{s.unit}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS COUNTERS */}
        <section className="section" style={{ background: 'var(--bg2)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div className="tag" style={{ marginBottom: '16px' }}>By The Numbers</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800 }}>The Scale of the Crisis</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <StatCard value={421} label="PPM CO₂ in Atmosphere" color="#ef4444" icon="🌡️" suffix=" ppm" delay={0} />
              <StatCard value={8100} label="Million People at Risk" color="#f97316" icon="🌍" suffix="M" delay={100} />
              <StatCard value={150} label="Species Lost Per Day" color="#a855f7" icon="🦋" suffix="+" delay={200} />
              <StatCard value={97} label="Scientists Agree on Climate Change" color="#00d97e" icon="🔬" suffix="%" delay={300} />
              <StatCard value={2030} label="Net Zero Target Year" color="#3b82f6" icon="🎯" delay={400} />
              <StatCard value={50000} label="Renewable Jobs Created in 2025" color="#22c55e" icon="⚡" suffix="+" delay={500} />
            </div>
          </div>
        </section>

        {/* DATA DASHBOARD */}
        <section id="data" className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div className="tag" style={{ marginBottom: '16px' }}>Live Dashboard</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '12px' }}>Climate Data Hub</h2>
              <p style={{ color: 'var(--muted)', fontSize: '1.05rem' }}>Real data. Real urgency. Real time to act.</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: 'rgba(255,255,255,0.04)', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
              {['emissions', 'temperature', 'sources'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-btn ${activeTab === tab ? 'tab-active' : 'tab-inactive'}`} style={{ textTransform: 'capitalize' }}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'emissions' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                <div className="card">
                  <h3 style={{ fontWeight: 700, marginBottom: '4px' }}>Atmospheric CO₂ (ppm)</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Historical rise since 1960</p>
                  <BarChart data={co2Data} />
                </div>
                <div className="card">
                  <h3 style={{ fontWeight: 700, marginBottom: '4px' }}>Emission Sources</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '16px' }}>Global breakdown by sector</p>
                  <DonutChart segments={emissionSegments} />
                </div>
              </div>
            )}

            {activeTab === 'temperature' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div className="card">
                  <h3 style={{ fontWeight: 700, marginBottom: '4px' }}>CO₂ Trend (2013–2024)</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Atmospheric concentration rise</p>
                  <Sparkline values={tempData} color="#ef4444" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>
                    <span>2013: 310ppm</span><span>2024: 421ppm</span>
                  </div>
                </div>
                <div className="card">
                  <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Climate Indicators</h3>
                  {[
                    { label: 'Arctic Ice Coverage', value: 60, color: '#3b82f6', note: '40% below 1979 levels' },
                    { label: 'Ocean Heat Content', value: 87, color: '#ef4444', note: 'Record high in 2024' },
                    { label: 'Renewable Adoption', value: 30, color: '#00d97e', note: '30% of global energy' },
                    { label: 'Deforestation Rate', value: 73, color: '#f97316', note: '73% of target area lost' },
                  ].map(item => (
                    <div key={item.label} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.label}</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{item.note}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${item.value}%`, background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'sources' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {[
                  { icon: '⚡', title: 'Energy Production', pct: '34%', desc: 'Burning fossil fuels for electricity and heat is the single largest source of global GHG emissions.', color: '#f97316' },
                  { icon: '🚗', title: 'Transportation', pct: '24%', desc: 'Cars, trucks, ships, trains, and planes burning petroleum-based fuels contribute nearly a quarter of emissions.', color: '#3b82f6' },
                  { icon: '🌾', title: 'Agriculture', pct: '19%', desc: 'Livestock, rice cultivation, synthetic fertilizers, and deforestation for farmland are major drivers.', color: '#22c55e' },
                  { icon: '🏭', title: 'Industry', pct: '23%', desc: 'Manufacturing, construction, and chemical processes including cement and steel production.', color: '#a855f7' },
                ].map(s => (
                  <div key={s.title} className="card">
                    <div className="feat-icon" style={{ background: `${s.color}18` }}>{s.icon}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h3 style={{ fontWeight: 700 }}>{s.title}</h3>
                      <span style={{ color: s.color, fontWeight: 800, fontFamily: 'Syne', fontSize: '1.2rem' }}>{s.pct}</span>
                    </div>
                    <p style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="section" style={{ background: 'var(--bg2)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div className="tag" style={{ marginBottom: '16px' }}>Platform Features</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '12px' }}>Everything You Need to Act</h2>
              <p style={{ color: 'var(--muted)', fontSize: '1.05rem' }}>From data to action — we've built the tools that matter.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {[
                { icon: '📊', title: 'Live Data Dashboard', desc: 'Real-time CO₂ levels, temperature anomalies, sea level data from NASA, NOAA, and IPCC sources updated daily.', color: '#00d97e', bg: '#00d97e18' },
                { icon: '🧮', title: 'Advanced Carbon Calculator', desc: 'Calculate your footprint across energy, transport, diet, flights, and shopping — get a personalized grade and action plan.', color: '#3b82f6', bg: '#3b82f618' },
                { icon: '🗺️', title: 'Interactive Climate Maps', desc: 'Explore heat zones, flood risk areas, deforestation hotspots, and find local green businesses near you.', color: '#f97316', bg: '#f9731618' },
                { icon: '👥', title: 'Community & Challenges', desc: 'Join local climate groups, participate in monthly challenges, earn impact badges, and see your global ranking.', color: '#a855f7', bg: '#a855f718' },
                { icon: '📚', title: 'Education Hub', desc: 'Curated climate science articles, research papers, video tutorials, and expert insights — all in one place.', color: '#fbbf24', bg: '#fbbf2418' },
                { icon: '🏆', title: 'Impact Tracker', desc: 'Track your monthly CO₂ reduction, see your cumulative impact, and share milestones with your network.', color: '#22c55e', bg: '#22c55e18' },
              ].map(f => (
                <div key={f.title} className="card">
                  <div className="feat-icon" style={{ background: f.bg }}>{f.icon}</div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '10px', color: 'var(--text)' }}>{f.title}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.65 }}>{f.desc}</p>
                  <div style={{ marginTop: '20px', color: f.color, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Learn more →</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CARBON CALCULATOR */}
        <section id="calculator" className="section" style={{ background: 'var(--bg3)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div className="tag" style={{ marginBottom: '16px' }}>Carbon Calculator</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '12px' }}>What's Your Carbon Grade?</h2>
              <p style={{ color: 'var(--muted)', fontSize: '1.05rem' }}>Get your personalised footprint score and action plan in 30 seconds.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: carbonResult ? '1fr 1fr' : '1fr', maxWidth: carbonResult ? '900px' : '560px', margin: '0 auto', gap: '24px' }}>
              {/* Form */}
              <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: '24px', fontSize: '1.1rem' }}>Your Lifestyle Data</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label className="input-label">Daily Energy Usage (kWh)</label>
                    <input type="number" className="input-field" value={carbonForm.energy} onChange={e => setCarbonForm({ ...carbonForm, energy: e.target.value })} placeholder="10" />
                  </div>
                  <div>
                    <label className="input-label">Primary Transport</label>
                    <select className="input-field" value={carbonForm.transport} onChange={e => setCarbonForm({ ...carbonForm, transport: e.target.value })}>
                      <option value="car">🚗 Petrol/Diesel Car</option>
                      <option value="ev">⚡ Electric Vehicle</option>
                      <option value="bus">🚌 Public Transit</option>
                      <option value="bike">🚲 Bike / Walk</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Diet Type</label>
                    <select className="input-field" value={carbonForm.diet} onChange={e => setCarbonForm({ ...carbonForm, diet: e.target.value })}>
                      <option value="meat">🥩 Heavy Meat Eater</option>
                      <option value="vegetarian">🥗 Vegetarian</option>
                      <option value="vegan">🌱 Vegan</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Flights Per Year</label>
                    <input type="number" className="input-field" value={carbonForm.flights} onChange={e => setCarbonForm({ ...carbonForm, flights: e.target.value })} placeholder="0" />
                  </div>
                  <div>
                    <label className="input-label">Shopping Habits</label>
                    <select className="input-field" value={carbonForm.shopping} onChange={e => setCarbonForm({ ...carbonForm, shopping: e.target.value })}>
                      <option value="high">🛍️ Heavy Shopper</option>
                      <option value="average">🛒 Average</option>
                      <option value="minimal">♻️ Minimal / Secondhand</option>
                    </select>
                  </div>
                  <button className="btn-primary" onClick={handleCalc} style={{ width: '100%', justifyContent: 'center' }}>
                    Calculate My Grade →
                  </button>
                </div>
              </div>

              {/* Result */}
              {carbonResult && (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Your Carbon Report</h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="grade-badge" style={{
                      background: carbonResult.grade === 'A+' || carbonResult.grade === 'A' ? 'rgba(0,217,126,0.15)' : carbonResult.grade === 'B' ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)',
                      border: `3px solid ${carbonResult.grade === 'A+' || carbonResult.grade === 'A' ? '#00d97e' : carbonResult.grade === 'B' ? '#fbbf24' : '#ef4444'}`,
                      color: carbonResult.grade === 'A+' || carbonResult.grade === 'A' ? '#00d97e' : carbonResult.grade === 'B' ? '#fbbf24' : '#ef4444',
                      position: 'relative',
                    }}>
                      {carbonResult.grade}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '4px' }}>Your carbon grade</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
                        {carbonResult.grade === 'A+' ? '🌱 Exceptional! You\'re a climate hero.' :
                         carbonResult.grade === 'A' ? '✅ Great! Well below average.' :
                         carbonResult.grade === 'B' ? '⚡ Good, but room to improve.' :
                         carbonResult.grade === 'C' ? '⚠️ Above average. Take action.' :
                         '🔴 High footprint. Let\'s fix this.'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#00d97e', fontFamily: 'Syne' }}>{carbonResult.daily.toFixed(1)}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '4px' }}>kg CO₂e / day</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f97316', fontFamily: 'Syne' }}>{(carbonResult.yearly / 1000).toFixed(1)}t</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '4px' }}>tonnes CO₂e / year</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>vs Global Average (4.7t)</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{
                        width: `${Math.min((carbonResult.yearly / 1000 / 10) * 100, 100)}%`,
                        background: carbonResult.yearly < 4000 ? 'var(--green)' : carbonResult.yearly < 7000 ? '#fbbf24' : '#ef4444'
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>
                      <span>0t</span><span>Avg 4.7t</span><span>10t+</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>💡 Your Action Plan</div>
                    {carbonResult.tips.map((tip, i) => (
                      <div key={i} style={{ fontSize: '0.85rem', color: 'var(--muted)', padding: '8px 0', borderBottom: i < carbonResult.tips.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SDG SECTION */}
        <section className="section" style={{ background: 'var(--bg)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div className="tag" style={{ marginBottom: '16px' }}>UN Alignment</div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, marginBottom: '12px' }}>Aligned with the UN SDGs</h2>
              <p style={{ color: 'var(--muted)' }}>Our platform directly supports 6 of the 17 Sustainable Development Goals</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {[
                { n: 'SDG 7', t: 'Clean Energy', c: '#fbbf24', bg: '#fbbf2415' },
                { n: 'SDG 11', t: 'Sustainable Cities', c: '#f97316', bg: '#f9731615' },
                { n: 'SDG 12', t: 'Responsible Consumption', c: '#d97706', bg: '#d9770615' },
                { n: 'SDG 13', t: 'Climate Action', c: '#00d97e', bg: '#00d97e15' },
                { n: 'SDG 14', t: 'Life Below Water', c: '#3b82f6', bg: '#3b82f615' },
                { n: 'SDG 15', t: 'Life on Land', c: '#22c55e', bg: '#22c55e15' },
              ].map(sdg => (
                <div key={sdg.n} className="sdg-pill" style={{ background: sdg.bg, color: sdg.c, border: `1px solid ${sdg.c}30`, minWidth: '140px' }}>
                  <div style={{ fontWeight: 800 }}>{sdg.n}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>{sdg.t}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="section" style={{ background: 'var(--bg2)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
              <div>
                <div className="tag" style={{ marginBottom: '20px' }}>About EcoSphere</div>
                <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '20px', lineHeight: 1.15 }}>
                  Built for the<br /><span className="grad-text">Climate Generation</span>
                </h2>
                <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: '16px' }}>
                  EcoSphere is a next-generation climate action platform that combines live scientific data, powerful personal tools, and a global community to drive real-world change.
                </p>
                <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: '32px' }}>
                  We believe that data without action is just noise. Our platform bridges the gap — turning complex climate science into simple, actionable steps everyone can take today.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center' }}>
                  {[{ v: '50K+', l: 'Members' }, { v: '120+', l: 'Countries' }, { v: '2M+', l: 'Tonnes Saved' }].map(s => (
                    <div key={s.l}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--green)', fontFamily: 'Syne' }}>{s.v}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: '4px' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: '🔬', title: 'Science-Backed Data', desc: 'All data sourced from NASA, NOAA, IPCC, and peer-reviewed research.' },
                  { icon: '🔒', title: 'Privacy First', desc: 'Your data is yours. We never sell personal information to third parties.' },
                  { icon: '🌐', title: 'Open Source', desc: 'Our codebase is open source and community-audited for transparency.' },
                  { icon: '📱', title: 'Mobile Ready', desc: 'Fully responsive — use it anywhere, on any device.' },
                ].map(item => (
                  <div key={item.title} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '20px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: '4px' }}>{item.title}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.87rem' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, rgba(0,217,126,0.12), rgba(0,191,255,0.08))', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '16px' }}>
              Ready to Make a <span className="grad-text">Difference?</span>
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginBottom: '36px', maxWidth: '500px', margin: '0 auto 36px' }}>
              Join 50,000+ people already using EcoSphere to track and reduce their climate impact.
            </p>
            <a href="#calculator" className="btn-primary" style={{ fontSize: '1rem', padding: '16px 40px' }}>
              Start for Free →
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <footer id="contact" style={{ padding: '60px 0 32px', background: 'var(--bg)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '48px' }}>
              <div style={{ gridColumn: 'span 2' }} className="col-span-2">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '32px', height: '32px', background: 'var(--green)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌍</div>
                  <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem' }}>Eco<span style={{ color: 'var(--green)' }}>Sphere</span></span>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '300px', marginBottom: '16px' }}>
                  Empowering individuals and communities to take meaningful action on climate change.
                </p>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>📧 hello@ecosphere.dev</p>
              </div>
              {[
                { title: 'Platform', links: ['Features', 'Calculator', 'Data Hub', 'Community'] },
                { title: 'Resources', links: ['IPCC Reports', 'NASA Climate', 'UN SDGs', 'UNEP'] },
                { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              ].map(col => (
                <div key={col.title}>
                  <div style={{ fontWeight: 700, marginBottom: '16px', fontFamily: 'Syne', fontSize: '0.9rem', color: 'var(--text)' }}>{col.title}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {col.links.map(link => (
                      <a key={link} href="#" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.87rem', transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--green)'}
                        onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--muted)'}>
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>© 2026 EcoSphere. All rights reserved.</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Built with 💚 for our planet</p>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
