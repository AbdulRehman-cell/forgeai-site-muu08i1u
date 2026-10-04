import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import QuizArena from './pages/QuizArena';
import Results from './pages/Results';
import Admin from './pages/Admin.jsx';

export default function App() {
  const [activePlayers, setActivePlayers] = useState(134);
  const location = useLocation();

  // Pulse effect simulation for active player counter in header
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePlayers(prev => {
        const change = Math.floor(Math.random() * 7) - 3;
        const next = prev + change;
        return next > 80 ? next : 80;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Smooth scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Dynamic Ambient Background Glows */}
      <div style={{
        position: 'fixed',
        top: '-10%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(0, 255, 102, 0.05) 0%, rgba(0,0,0,0) 70%)',
        zIndex: -1,
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'fixed',
        bottom: '-10%',
        right: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(0, 240, 255, 0.05) 0%, rgba(0,0,0,0) 70%)',
        zIndex: -1,
        pointerEvents: 'none'
      }}></div>

      {/* Persistent Retro Header with semi-opaque background & backdrop-blur */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(12, 15, 18, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '1rem 2rem'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: 0
        }}>
          <Link to="/" className="brand" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none'
          }}>
            <span style={{
              fontFamily: '"Orbitron", sans-serif',
              fontWeight: 900,
              fontSize: '1.5rem',
              letterSpacing: '2px',
              background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 10px rgba(0, 255, 102, 0.2)'
            }}>
              BRAIN<span style={{ color: 'var(--text)', WebkitTextFillColor: 'initial' }}>SPAN</span>
            </span>
            <span style={{
              fontSize: '0.65rem',
              fontFamily: '"Orbitron", sans-serif',
              color: 'var(--accent)',
              border: '1px solid var(--accent)',
              padding: '2px 6px',
              borderRadius: '4px',
              letterSpacing: '1px',
              fontWeight: 700,
              textShadow: '0 0 5px rgba(255, 59, 48, 0.3)'
            }}>
              V2.0
            </span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              style={({ isActive }) => ({
                fontFamily: '"Orbitron", sans-serif',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '1px',
                textDecoration: 'none',
                color: isActive ? 'var(--primary)' : 'var(--muted)',
                transition: 'all 0.2s ease',
                textShadow: isActive ? '0 0 8px rgba(0, 255, 102, 0.3)' : 'none'
              })}
            >
              ARENA
            </NavLink>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(0, 255, 102, 0.08)',
              border: '1px solid rgba(0, 255, 102, 0.2)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '600',
              fontFamily: '"Orbitron", sans-serif',
              color: 'var(--primary)',
              boxShadow: '0 0 10px rgba(0, 255, 102, 0.05)'
            }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                backgroundColor: 'var(--primary)',
                borderRadius: '50%',
                boxShadow: '0 0 8px var(--primary)',
                animation: 'pulse 1.5s infinite alternate'
              }}></span>
              {activePlayers} COGNITIVE_UNITS_ONLINE
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content Areas */}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz/:slug" element={<QuizArena />} />
          <Route path="/results" element={<Results />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {/* High-Octane Footer */}
      <footer style={{
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        padding: '3rem 2rem 2rem 2rem',
        marginTop: 'auto'
      }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{ maxWidth: '400px' }}>
              <span style={{
                fontFamily: '"Orbitron", sans-serif',
                fontWeight: 900,
                fontSize: '1.2rem',
                letterSpacing: '1px',
                background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block',
                marginBottom: '1rem'
              }}>
                BRAINSNAP
              </span>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Speed or extinction. Choose your category. BrainSnap is a high-octane, 15-second-decay trivia platform built for hyper-focused minds who think faster than light.
              </p>
            </div>

            <div>
              <h4 style={{ fontFamily: '"Orbitron", sans-serif', color: 'var(--text)', fontSize: '0.9rem', marginBottom: '1rem', letterSpacing: '1px' }}>
                SYSTEM SECTORS
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><Link to="/" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>The Arena (Home)</Link></li>
                <li><a href="#how-it-works" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Decay Mechanics</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontFamily: '"Orbitron", sans-serif', color: 'var(--text)', fontSize: '0.9rem', marginBottom: '1rem', letterSpacing: '1px' }}>
                STATUS METRICS
              </h4>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--muted)',
                lineHeight: '1.6',
                fontFamily: 'monospace'
              }}>
                <div>SYSTEM STATUS: <span style={{ color: 'var(--primary)' }}>NOMINAL</span></div>
                <div>LATENCY: 12ms</div>
                <div>CORE TEMPERATURE: 32°C</div>
                <div>SHARDS: ACTIVE [US-EAST]</div>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.85rem',
            color: 'var(--muted)'
          }}>
            <div>
              © {new Date().getFullYear()} BRAINSNAP // SECURE_ACCESS_NODE_MUU08I1U
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span style={{ color: 'var(--primary)', textShadow: '0 0 5px rgba(0, 255, 102, 0.3)' }}>THINK LIKE A PARTICLE ACCELERATOR</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}