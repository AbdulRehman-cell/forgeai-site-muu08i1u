import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeFeed, setActiveFeed] = useState([
    { id: 1, user: '@HyperDrive', action: 'scorched the Pop Culture gauntlet', stats: '10/10 in 42 seconds' },
    { id: 2, user: '@GigaBrain', action: 'just initialized Science challenge', stats: 'Difficulty: BRUTAL' },
    { id: 3, user: '@ChronosX', action: 'failed to survive the 15s decay in History', stats: 'Result: 4/10' }
  ]);
  const [loading, setLoading] = useState(true);

  // Mock interactive countdown sample question in Hero
  const [mockTime, setMockTime] = useState(15);
  const [selectedMockOption, setSelectedMockOption] = useState(null);
  const [mockScore, setMockScore] = useState(140);
  const [mockStreak, setMockStreak] = useState(4);

  // Real-time ticker simulation
  useEffect(() => {
    const feedInterval = setInterval(() => {
      const users = ['@NeuroSpike', '@BitSurfer', '@VoidRunner', '@CyberScribe', '@Lumina_IV', '@NexusMind'];
      const actions = [
        'just conquered Science category',
        'survived History with high-efficiency',
        'unlocked the SECURE RANK badge',
        'is currently speedrunning Pop Culture'
      ];
      const stats = ['9/10 in 54s', '10/10 in 48s', '8/10 in 61s', 'Active Now!'];
      
      const newFeedItem = {
        id: Date.now(),
        user: users[Math.floor(Math.random() * users.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        stats: stats[Math.floor(Math.random() * stats.length)]
      };

      setActiveFeed(prev => [newFeedItem, ...prev.slice(0, 2)]);
    }, 4500);

    return () => clearInterval(feedInterval);
  }, []);

  // Fetch Leaderboard from API
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await axios.get('/api/scores');
        setLeaderboard(res.data || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    }
    fetchLeaderboard();
  }, []);

  // Mock question timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setMockTime(prev => {
        if (prev <= 1) {
          setSelectedMockOption(null);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real topics from MERN API on mount
  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await axios.get('/api/topics');
        setTopics(res.data);
      } catch (err) {
        console.error('Error fetching topics:', err);
        // Fallback robust seed categories if backend is fresh/empty
        setTopics([
          { _id: '1', title: 'Science', description: 'Quantum phenomena, astrophysics, molecular warfare, and high-energy terminal physics.', difficulty: 'BRUTAL', slug: 'science' },
          { _id: '2', title: 'History', description: 'Collapse of empires, shadow alliances, warfare logistics, and paradigm-shifting revolutions.', difficulty: 'MEDIUM', slug: 'history' },
          { _id: '3', title: 'Pop Culture', description: 'Cyberpunk movies, retro synth music, elite gaming history, and iconic virtual realities.', difficulty: 'EASY', slug: 'pop-culture' }
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchTopics();
  }, []);

  // Scroll smooth helper
  const scrollToArena = (e) => {
    e.preventDefault();
    const element = document.getElementById('arena-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMockSelect = (index) => {
    setSelectedMockOption(index);
    if (index === 2) {
      setMockScore(prev => prev + 15);
      setMockStreak(prev => prev + 1);
    } else {
      setMockStreak(0);
    }
  };

  return (
    <div className="home-page-wrapper">
      
      {/* 1. HERO SECTION: THE LAUNCHPAD */}
      <section className="hero" style={{ position: 'relative', overflow: 'hidden', padding: 'var(--section-padding) 0' }}>
        <img className="hero-bg" src="https://picsum.photos/seed/vintagearcade/1600/900" alt="Vintage Arcade Glow" style={{ opacity: 0.15, filter: 'grayscale(1) brightness(0.5)' }} />
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', zIndex: 10, position: 'relative' }}>
          
          <div>
            <span className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '3px' }}>
              ⚡ SPEED OR EXTINCTION
            </span>
            <h1 style={{ fontFamily: 'var(--font-headings)', fontSize: 'var(--h-1)', color: 'var(--text)', lineHeight: 1.1, margin: '1rem 0' }}>
              HYPER-DOPAMINE TRIVIA AT <span className="gradient-text">TERMINAL</span> VELOCITY.
            </h1>
            <p className="hero-subtitle" style={{ color: 'var(--muted)', fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.6' }}>
              Your brain has exactly 15 seconds to survive this. No search engines. No lifelines. Just raw cognitive velocity.
            </p>
            <div className="hero-actions" style={{ display: 'flex', gap: '15px' }}>
              <a href="#arena-section" onClick={scrollToArena} className="btn btn-primary" style={{ padding: '15px 30px', fontWeight: 'bold' }}>
                ENTER THE ARENA
              </a>
            </div>
          </div>

          {/* Interactive Simulation Panel */}
          <div className="card" style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            padding: '30px',
            borderRadius: '12px',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <span className="pill" style={{ background: 'rgba(0,255,102,0.1)', color: 'var(--primary)', animation: 'pulse 1.5s infinite', fontSize: '0.85rem' }}>
                ● LIVE TRAINING MODULE
              </span>
              <div style={{ display: 'flex', gap: '15px', fontFamily: '"Orbitron", sans-serif' }}>
                <span style={{ color: 'var(--secondary)' }}>STREAK: {mockStreak}🔥</span>
                <span style={{ color: 'var(--primary)' }}>SCORE: {mockScore}</span>
              </div>
            </div>

            {/* Question Text */}
            <p style={{ fontFamily: 'var(--font-headings)', fontSize: '1.2rem', color: 'var(--text)', marginBottom: '20px', minHeight: '60px' }}>
              "Which quantum mechanical principle asserts that two identical fermions cannot occupy the same quantum state simultaneously?"
            </p>

            {/* Simulated Options */}
            <div className="grid grid-2" style={{ gap: '12px', marginBottom: '25px' }}>
              {['Heisenberg Uncertainty', 'Schrödinger Cat', 'Pauli Exclusion Principle', 'Planck Quantum Rule'].map((opt, idx) => {
                let borderStyle = '1px solid var(--border)';
                let glowStyle = {};
                if (selectedMockOption === idx) {
                  if (idx === 2) {
                    borderStyle = '1px solid var(--primary)';
                    glowStyle = { boxShadow: '0 0 15px rgba(0,255,102,0.25)', background: 'rgba(0,255,102,0.05)' };
                  } else {
                    borderStyle = '1px solid var(--accent)';
                    glowStyle = { boxShadow: '0 0 15px rgba(255,59,48,0.25)', background: 'rgba(255,59,48,0.05)' };
                  }
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleMockSelect(idx)}
                    className="btn btn-ghost"
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 15px',
                      fontSize: '0.9rem',
                      border: borderStyle,
                      borderRadius: '8px',
                      color: 'var(--text)',
                      transition: 'all 0.18s ease',
                      ...glowStyle
                    }}
                  >
                    {idx + 1}. {opt}
                  </button>
                );
              })}
            </div>

            {/* Countdown Ring Mock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ position: 'relative', width: '50px', height: '50px' }}>
                <svg width="50" height="50" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="transparent" stroke="var(--border)" strokeWidth="4" />
                  <circle cx="25" cy="25" r="20" fill="transparent" stroke={mockTime <= 5 ? 'var(--accent)' : 'var(--secondary)'} strokeWidth="4"
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 - (125.6 * mockTime) / 15}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: '"Orbitron", sans-serif', fontSize: '0.9rem', color: mockTime <= 5 ? 'var(--accent)' : 'var(--text)', fontWeight: 'bold' }}>
                  {mockTime}s
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="progress-bar" style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div className="progress-bar-fill" style={{
                    width: `${(mockTime / 15) * 100}%`,
                    height: '100%',
                    background: mockTime <= 5 ? 'var(--accent)' : 'linear-gradient(90deg, var(--secondary), var(--primary))',
                    transition: 'width 1s linear'
                  }}></div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                  DECAY STATUS: {mockTime <= 5 ? 'HIGH THREAT VAPORIZATION' : 'SYSTEM OK'}
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. GLOBAL LIVE FEED: THE PULSE */}
      <section style={{ background: 'var(--surface)', borderY: '1px solid var(--border)', padding: '1.2rem 0', overflow: 'hidden' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1s infinite' }}></span>
            <span style={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '1.5px', color: 'var(--text)' }}>
              LIVE_FEED_SYS:
            </span>
          </div>
          <div style={{ display: 'flex', gap: '40px', overflowX: 'auto', whiteSpace: 'nowrap', width: '100%', paddingBottom: '3px' }}>
            {activeFeed.map(feed => (
              <div key={feed.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{feed.user}</span>
                <span style={{ color: 'var(--muted)' }}>{feed.action}</span>
                <span className="pill" style={{ fontSize: '0.75rem', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--primary)' }}>
                  {feed.stats}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THE ARENA: TOPIC SELECTOR */}
      <section id="arena-section" className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="eyebrow">CHOOSE YOUR BATTLEGROUND</span>
            <h2 style={{ color: 'var(--text)', fontFamily: 'var(--font-headings)' }}>THE ACTIVE SYST_VECTORS</h2>
            <p style={{ color: 'var(--muted)', maxWidth: '600px', margin: '0 auto' }}>
              Every topic is preloaded with lethal, high-stakes question stacks. Speed is calculated down to the millisecond.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-3" style={{ gap: '20px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton skeleton-card" style={{ height: '280px', borderRadius: '12px' }}></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-3" style={{ gap: '25px' }}>
              {topics.map((topic, index) => {
                const colors = {
                  'BRUTAL': 'var(--accent)',
                  'MEDIUM': 'var(--secondary)',
                  'EASY': 'var(--primary)'
                };
                const difficultyColor = colors[topic.difficulty] || 'var(--primary)';
                const sampleImages = [
                  'https://picsum.photos/seed/quantum/600/400',
                  'https://picsum.photos/seed/historywar/600/400',
                  'https://picsum.photos/seed/cyberesports/600/400'
                ];
                const imageSrc = sampleImages[index % sampleImages.length];

                return (
                  <div key={topic._id} className="card" style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}>
                    <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                      <img src={imageSrc} alt={topic.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7) contrast(1.1)' }} />
                      <span className="pill" style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'rgba(12,15,18,0.85)',
                        border: `1px solid ${difficultyColor}`,
                        color: difficultyColor,
                        fontFamily: '"Orbitron", sans-serif',
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}>
                        {topic.difficulty}
                      </span>
                    </div>

                    <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h3 style={{ fontFamily: 'var(--font-headings)', fontSize: '1.4rem', color: 'var(--text)', marginBottom: '10px' }}>
                        {topic.title}
                      </h3>
                      <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.5', flex: 1, marginBottom: '20px' }}>
                        {topic.description}
                      </p>

                      <Link to={`/quiz/${topic.slug || topic._id}`} className="btn btn-primary" style={{
                        width: '100%',
                        textAlign: 'center',
                        justifyContent: 'center',
                        display: 'flex',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(0,255,102,0.15)'
                      }}>
                        IGNITE RUN ⚡
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. THE ANATOMY OF A SNAP: MECHANICS SHOWCASE */}
      <section className="section" style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="eyebrow">COGNITIVE ARCHITECTURE</span>
            <h2 style={{ color: 'var(--text)', fontFamily: 'var(--font-headings)' }}>THE ANATOMY OF A SNAP</h2>
            <p style={{ color: 'var(--muted)', maxWidth: '600px', margin: '0 auto' }}>
              Decay Mechanics: The timer doesn't wait. When the neon bar hits zero, your score for that round vaporizes.
            </p>
          </div>

          <div className="step-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px' }}>
            <div className="card" style={{ padding: '30px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: '"Orbitron", sans-serif', color: 'var(--secondary)' }}>01</span>
                <span className="pill" style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--secondary)' }}>INITIALIZE</span>
              </div>
              <h4 style={{ color: 'var(--text)', fontFamily: 'var(--font-headings)', fontSize: '1.2rem', marginBottom: '10px' }}>Select Vector</h4>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
                Deploy your consciousness into specific intellectual matrices: Science, History, or high-fidelity Pop Culture.
              </p>
            </div>

            <div className="card" style={{ padding: '30px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: '"Orbitron", sans-serif', color: 'var(--accent)' }}>02</span>
                <span className="pill" style={{ background: 'rgba(255, 59, 48, 0.1)', color: 'var(--accent)' }}>THE DECAY</span>
              </div>
              <h4 style={{ color: 'var(--text)', fontFamily: 'var(--font-headings)', fontSize: '1.2rem', marginBottom: '10px' }}>15s Atomic Timer</h4>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
                A continuous retro countdown scales your potential scoring potential downwards. Answer instantaneously for maximum power.
              </p>
            </div>

            <div className="card" style={{ padding: '30px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: '"Orbitron", sans-serif', color: 'var(--primary)' }}>03</span>
                <span className="pill" style={{ background: 'rgba(0, 255, 102, 0.1)', color: 'var(--primary)' }}>SECURE RANK</span>
              </div>
              <h4 style={{ color: 'var(--text)', fontFamily: 'var(--font-headings)', fontSize: '1.2rem', marginBottom: '10px' }}>Synaptic Autopsy</h4>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
                Extract absolute results. Review the wreckage, learn exact failure locations, and lock your metrics onto the permanent leaderboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PHOTO SHOWCASE / ATMOSPHERE GALLERY */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="eyebrow">COGNITIVE STAGES</span>
            <h2 style={{ color: 'var(--text)', fontFamily: 'var(--font-headings)' }}>THE TRIVIA COLOSSEUMS</h2>
            <p style={{ color: 'var(--muted)', maxWidth: '600px', margin: '0 auto' }}>
              Where cyber-intellect and lightning reflex collide. Here are the nerve centers of the global brain.
            </p>
          </div>

          <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {[
              { title: 'Esports Arena Stage', src: 'https://picsum.photos/seed/esportsarena/600/450' },
              { title: 'Vintage Neon Cabinet', src: 'https://picsum.photos/seed/cabinetglow/600/450' },
              { title: 'Professional Arena Host', src: 'https://picsum.photos/seed/triviahost/600/450' },
              { title: 'Victory Celebration', src: 'https://picsum.photos/seed/studentsscore/600/450' }
            ].map((imgItem, idx) => (
              <div key={idx} className="gallery-item" style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                height: '240px',
                border: '1px solid var(--border)'
              }}>
                <img src={imgItem.src} alt={imgItem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(0deg, rgba(12,15,18,0.9) 0%, transparent 100%)',
                  padding: '15px',
                  display: 'flex',
                  alignItems: 'flex-end'
                }}>
                  <span style={{ fontFamily: 'var(--font-headings)', fontSize: '0.85rem', color: 'var(--text)' }}>
                    {imgItem.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. THE HALL OF LEGENDS: GLOBAL LEADERBOARD */}
      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div className="section-head" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="eyebrow">THE LEADERBOARD OF THE 0.1%</span>
            <h2 style={{ color: 'var(--text)', fontFamily: 'var(--font-headings)' }}>THE APEX MINDS</h2>
            <p style={{ color: 'var(--muted)' }}>
              Speed is absolutely nothing without absolute precision. The top active profiles this week.
            </p>
          </div>

          <div style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px 3fr 1.5fr 1.5fr 2fr',
              padding: '15px 30px',
              borderBottom: '1px solid var(--border)',
              background: 'rgba(0,0,0,0.2)',
              fontFamily: '"Orbitron", sans-serif',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              color: 'var(--muted)'
            }}>
              <span>RANK</span>
              <span>SYNAPTIC AGENT</span>
              <span>ACCURACY</span>
              <span>SPEEDRUN</span>
              <span>COGNITIVE RANK</span>
            </div>

            {leaderboard.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)' }}>
                No database scores registered yet. Complete an arena to claim your spot!
              </div>
            ) : (
              leaderboard.map((player, idx) => {
                const rankString = String(idx + 1).padStart(2, '0');
                let rankTitle = 'COGNITIVE ROOKIE';
                if (player.accuracy >= 90) rankTitle = 'SYNAPSE OVERLORD';
                else if (player.accuracy >= 75) rankTitle = 'QUANTUM MIND';
                else if (player.accuracy >= 50) rankTitle = 'NEURAL CHASER';

                return (
                  <div key={player._id || idx} style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 3fr 1.5fr 1.5fr 2fr',
                    padding: '18px 30px',
                    borderBottom: '1px solid var(--border)',
                    alignItems: 'center',
                    transition: 'background 0.15s ease',
                    background: idx === 0 ? 'rgba(0, 255, 102, 0.02)' : 'transparent'
                  }}>
                    <span style={{
                      fontFamily: '"Orbitron", sans-serif',
                      fontWeight: 900,
                      fontSize: '1.2rem',
                      color: idx === 0 ? 'var(--primary)' : 'var(--text)',
                      textShadow: idx === 0 ? '0 0 10px rgba(0,255,102,0.3)' : 'none'
                    }}>
                      {rankString}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={`https://i.pravatar.cc/100?img=${(idx * 7) % 70 + 1}`} alt={player.playerName} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)' }} />
                      <span style={{ fontWeight: 'bold', color: 'var(--text)' }}>{player.playerName}</span>
                    </div>

                    <span style={{ fontFamily: '"Orbitron", sans-serif', color: 'var(--primary)', fontWeight: 'bold', filter: 'drop-shadow(0 0 8px rgba(0,255,102,0.4))' }}>
                      {player.accuracy}%
                    </span>

                    <span style={{ color: 'var(--secondary)', fontFamily: '"Orbitron", sans-serif' }}>
                      {player.score} PTS
                    </span>

                    <div>
                      <span className="pill" style={{
                        fontSize: '0.75rem',
                        background: 'rgba(0, 240, 255, 0.1)',
                        color: 'var(--secondary)',
                        fontWeight: 'bold'
                      }}>
                        {rankTitle}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="section" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="eyebrow font-orbitron">CRITICAL USER BACKFEED</span>
            <h2 style={{ color: 'var(--text)', fontFamily: 'var(--font-headings)' }}>COMMUNICATIONS DEPLOYMENT</h2>
          </div>

          <div className="grid grid-3" style={{ gap: '25px' }}>
            <div className="testimonial-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '30px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '15px' }}>
                <img src="https://i.pravatar.cc/100?img=1" alt="Dev" style={{ width: '45px', height: '45px', borderRadius: '50%' }} />
                <div>
                  <h4 style={{ color: 'var(--text)', margin: 0 }}>Vance Pierce</h4>
                  <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>Senior Physics Researcher</span>
                </div>
              </div>
              <p style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.95rem', lineHeight: '1.6' }}>
                "The countdown pressure is excruciating. Unlike average platforms, you can't cheat with secondary panels. Your reflexes are challenged just as much as your knowledge."
              </p>
            </div>

            <div className="testimonial-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '30px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '15px' }}>
                <img src="https://i.pravatar.cc/100?img=52" alt="Dev" style={{ width: '45px', height: '45px', borderRadius: '50%' }} />
                <div>
                  <h4 style={{ color: 'var(--text)', margin: 0 }}>Hana Kimura</h4>
                  <span style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>Esports Competitor</span>
                </div>
              </div>
              <p style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.95rem', lineHeight: '1.6' }}>
                "Incredible UI. The 45-degree micro-grid background textures and glowing responsive states makes me feel like I am interfacing with a high-stakes mainframe."
              </p>
            </div>

            <div className="testimonial-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '30px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '15px' }}>
                <img src="https://i.pravatar.cc/100?img=3" alt="Dev" style={{ width: '45px', height: '45px', borderRadius: '50%' }} />
                <div>
                  <h4 style={{ color: 'var(--text)', margin: 0 }}>Marcus Cole</h4>
                  <span style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>Software Engineer</span>
                </div>
              </div>
              <p style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.95rem', lineHeight: '1.6' }}>
                "No bloat, no filler. You step in, select Science or Pop Culture, and instantly begin the fire-fight. It has revolutionized my morning brain boot sequence."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CTA SECTION */}
      <section className="container" style={{ margin: '4rem auto', padding: 0 }}>
        <div className="cta-section" style={{
          background: 'linear-gradient(135deg, var(--surface-2) 0%, var(--surface) 100%)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '60px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--secondary), transparent)'
          }}></div>
          
          <span className="eyebrow" style={{ color: 'var(--secondary)' }}>SYSTEM TERMINAL INITIALIZED</span>
          <h2 style={{ fontFamily: 'var(--font-headings)', fontSize: '2.5rem', color: 'var(--text)', margin: '15px 0' }}>
            READY TO RUPTURE YOUR SYNAPSES?
          </h2>
          <p style={{ color: 'var(--muted)', maxWidth: '600px', margin: '0 auto 30px auto', lineHeight: '1.6' }}>
            Stop hesitating. Join over 12,000+ weekly active neurons. Choose a challenge and claim your crown.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
            <a href="#arena-section" onClick={scrollToArena} className="btn btn-primary" style={{ padding: '15px 40px' }}>
              LAUNCH GAME ⚡
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'rgba(12,15,18,0.98)', borderTop: '1px solid var(--border)', padding: '50px 0 30px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '40px', marginBottom: '40px' }}>
            <div>
              <span style={{
                fontFamily: '"Orbitron", sans-serif',
                fontWeight: 900,
                fontSize: '1.5rem',
                letterSpacing: '2px',
                background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                BRAINSNAP
              </span>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '15px', maxWidth: '360px', lineHeight: '1.5' }}>
                A high-octane, 15-second-decay trivia platform built for hyper-focused minds who think faster than light.
              </p>
            </div>
            <div>
              <h5 style={{ fontFamily: '"Orbitron", sans-serif', color: 'var(--text)', fontSize: '0.95rem', marginBottom: '15px' }}>CHALLENGES</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                <li><a href="#arena-section" onClick={scrollToArena} style={{ color: 'var(--muted)', textDecoration: 'none' }}>Science Vector</a></li>
                <li><a href="#arena-section" onClick={scrollToArena} style={{ color: 'var(--muted)', textDecoration: 'none' }}>History Core</a></li>
                <li><a href="#arena-section" onClick={scrollToArena} style={{ color: 'var(--muted)', textDecoration: 'none' }}>Pop Culture</a></li>
              </ul>
            </div>
            <div>
              <h5 style={{ fontFamily: '"Orbitron", sans-serif', color: 'var(--text)', fontSize: '0.95rem', marginBottom: '15px' }}>OPERATOR</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                <li><a href="#arena-section" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Term of Use</a></li>
                <li><a href="#arena-section" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy Matrix</a></li>
              </ul>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '20px', fontSize: '0.85rem', color: 'var(--muted)' }}>
            <span>© {new Date().getFullYear()} BRAINSNAP CORE. SECURED AND EXECUTING.</span>
            <span>LATENCY: 14MS | REGION: GLOBAL_NODE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}