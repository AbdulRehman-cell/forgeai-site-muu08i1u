import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve state passed from the QuizArena
  const {
    score = 0,
    totalQuestions = 0,
    correctCount = 0,
    timeSpent = 0,
    topicTitle = 'General Trivia',
    difficulty = 'Medium'
  } = location.state || {};

  // Local state for interactive element (storing dynamic rank name)
  const [rankName, setRankName] = useState('RECRUIT');
  const [badgeColor, setBadgeColor] = useState('var(--primary)');
  const [showHighscoreForm, setShowHighscoreForm] = useState(true);
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Calculate stats robustly
  const percentAccuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const averageTime = correctCount > 0 ? (timeSpent / correctCount).toFixed(1) : 0;

  // Retro ranking title calculation
  useEffect(() => {
    let rank = 'ROOKIE';
    let color = '#a1a1aa'; // Zinc grey

    if (percentAccuracy >= 90) {
      rank = 'GRANDMASTER TRIVIA ARCHON';
      color = '#00ff66'; // Retro Neon green
    } else if (percentAccuracy >= 75) {
      rank = 'ARCADE ELITE COMMANDER';
      color = '#00f0ff'; // Retro Neon cyan
    } else if (percentAccuracy >= 50) {
      rank = 'STELLAR CYBER KNIGHT';
      color = '#f59e0b'; // Retro Neon yellow
    } else if (percentAccuracy >= 25) {
      rank = 'CONTROLLER CLASHER';
      color = '#a855f7'; // Purple
    }

    setRankName(rank);
    setBadgeColor(color);
  }, [percentAccuracy]);

  // Load registered backend high-scores
  const fetchScores = () => {
    axios.get('/api/scores')
      .then(res => {
        setLeaderboard((res.data || []).slice(0, 8));
      })
      .catch(err => {
        console.error('Error fetching scores:', err);
      });
  };

  useEffect(() => {
    fetchScores();
  }, []);

  // Save score to retro scoreboard backend
  const handleSaveScore = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    const payload = {
      playerName: playerName.toUpperCase().slice(0, 10),
      score: score,
      accuracy: percentAccuracy
    };

    axios.post('/api/scores', payload)
      .then(() => {
        setSavedSuccess(true);
        setShowHighscoreForm(false);
        fetchScores();
      })
      .catch(err => {
        console.error('Error uploading score:', err);
      });
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* SECTION 1: HEADER & RETRO BADGE */}
      <section className="section-head" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="eyebrow" style={{ color: 'var(--primary)', letterSpacing: '3px' }}>
          CHALLENGE COMPLETE
        </span>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '900', margin: '1rem 0' }}>
          SESSION <span className="gradient-text">OVER</span>
        </h1>
        <p className="hero-subtitle" style={{ color: 'var(--text-muted)' }}>
          Review your performance, claim your rank, and enter the retro neon leaderboard.
        </p>
      </section>

      {/* SECTION 2: STATS SUMMARY GRID */}
      <section className="section" style={{ padding: '0 0 3rem 0' }}>
        <div style={{
          backgroundColor: 'rgba(25, 30, 36, 0.6)',
          border: `2px solid ${badgeColor}`,
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: `0 0 25px ${badgeColor}25`,
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle grid pattern background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(var(--border) 1px, transparent 0)',
            backgroundSize: '16px 16px',
            opacity: 0.15,
            pointerEvents: 'none'
          }}></div>

          <span style={{
            fontSize: '0.85rem',
            fontWeight: 'bold',
            letterSpacing: '2px',
            color: 'var(--text-muted)',
            display: 'block',
            marginBottom: '0.5rem'
          }}>
            CURRENT TOPIC: {topicTitle.toUpperCase()} ({difficulty.toUpperCase()})
          </span>

          <h2 style={{
            fontFamily: '"Orbitron", sans-serif',
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            color: '#fff',
            margin: '0.5rem 0',
            letterSpacing: '1px'
          }}>
            SCORE: <span style={{ color: badgeColor, textShadow: `0 0 10px ${badgeColor}` }}>{score} PTS</span>
          </h2>

          <div style={{
            display: 'inline-block',
            padding: '0.6rem 1.5rem',
            borderRadius: '50px',
            backgroundColor: `${badgeColor}15`,
            border: `1px solid ${badgeColor}`,
            fontSize: '1rem',
            fontWeight: 'bold',
            color: badgeColor,
            textShadow: `0 0 5px ${badgeColor}40`,
            marginTop: '1rem',
            letterSpacing: '2px'
          }}>
            ★ {rankName} ★
          </div>
        </div>

        {/* 4-column breakdown grid */}
        <div className="grid grid-4" style={{ gap: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem', borderLeft: '3px solid var(--primary)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Accuracy
            </span>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', margin: '0.5rem 0' }}>
              {percentAccuracy}%
            </div>
            <div className="progress-bar" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
              <div 
                className="progress-bar-fill" 
                style={{ 
                  height: '100%', 
                  width: `${percentAccuracy}%`, 
                  backgroundColor: 'var(--primary)',
                  borderRadius: '3px'
                }}
              ></div>
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '1.5rem', borderLeft: '3px solid var(--secondary)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Correct Answers
            </span>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', margin: '0.5rem 0' }}>
              {correctCount} / {totalQuestions}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Completed questions
            </span>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '1.5rem', borderLeft: '3px solid #ff0055' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Total Time
            </span>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', margin: '0.5rem 0' }}>
              {timeSpent}s
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Spent in the arena
            </span>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '1.5rem', borderLeft: '3px solid #f59e0b' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Avg Response
            </span>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', margin: '0.5rem 0' }}>
              {averageTime}s
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Per correct answer
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 3: SPLIT SECTION (SAVE HIGH SCORE & LEADERBOARD) */}
      <section className="section" style={{ padding: '0 0 3rem 0' }}>
        <div className="grid grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
          
          {/* Column A: Highscore entry Form or congratulations */}
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '340px' }}>
            <span className="eyebrow" style={{ color: 'var(--secondary)' }}>ARCHIVE YOUR RUN</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0.5rem 0 1.5rem 0' }}>
              Submit to Hall of Fame
            </h3>

            {showHighscoreForm && !savedSuccess ? (
              <form onSubmit={handleSaveScore} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label htmlFor="playerName" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    ENTER YOUR RETRO CALLSIGN (MAX 10 CHARS)
                  </label>
                  <input
                    type="text"
                    id="playerName"
                    placeholder="e.g. NEO, ACER, TRON"
                    maxLength={10}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border)',
                      color: '#fff',
                      fontSize: '1.1rem',
                      letterSpacing: '2px',
                      fontFamily: '"Orbitron", monospace',
                      textTransform: 'uppercase'
                    }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem' }}>
                  UPLOAD HIGH SCORE ⚡
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>SCORE LOCKED & LOADED</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Your score of {score} pts has been registered on the galactic scoreboard below.
                </p>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button onClick={() => setShowHighscoreForm(true)} className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>
                    Submit Again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Column B: Leaderboard Display */}
          <div className="card" style={{ padding: '2rem', minHeight: '340px' }}>
            <span className="eyebrow" style={{ color: 'var(--primary)' }}>GLOBAL ARENA</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0.5rem 0 1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>High Scores</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--border)' }}>LIVE</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {leaderboard.map((entry, index) => {
                const isCurrentRun = entry.score === score && entry.playerName === playerName.toUpperCase();
                return (
                  <div 
                    key={entry._id || index} 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.7rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: isCurrentRun ? 'rgba(0, 255, 102, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                      border: isCurrentRun ? '1px solid var(--primary)' : '1px solid transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ 
                        fontWeight: 'bold', 
                        color: index === 0 ? 'var(--primary)' : index === 1 ? 'var(--secondary)' : 'var(--text-muted)',
                        width: '24px'
                      }}>
                        #{index + 1}
                      </span>
                      <span style={{ fontWeight: 'bold', letterSpacing: '1px', fontFamily: '"Orbitron", monospace' }}>
                        {entry.playerName} {isCurrentRun && <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>(YOU)</span>}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{entry.accuracy}% Acc</span>
                      <span style={{ fontWeight: '900', color: '#fff', fontSize: '1.1rem' }}>{entry.score} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4: PLAY RETRO VIDEO */}
      <section className="section" style={{ padding: '0 0 3rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span className="eyebrow" style={{ color: 'var(--secondary)' }}>ARCADE RETROSPECTIVE</span>
          <h2>The Golden Era Of Coin-Op Trivia</h2>
        </div>
        <div className="video-embed" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <iframe 
            src="https://www.youtube.com/embed/YpXOn8KWhj4" 
            title="Arcade Trivia History"
            allowFullScreen
            style={{ width: '100%', aspectRatio: '16/9', border: 'none' }}
          ></iframe>
        </div>
      </section>

      {/* SECTION 5: CALL TO ACTION BANNER */}
      <div className="cta-section" style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: '12px', margin: '1rem 0' }}>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>Ready to climb the rankings?</h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
          Pick another topic, try higher difficulties, and lock down your absolute speed run score.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
            🎮 CHOOSE NEW TOPIC
          </Link>
          <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ padding: '0.8rem 2rem' }}>
            🔁 RETRY CURRENT ARENA
          </button>
        </div>
      </div>

    </div>
  );
}