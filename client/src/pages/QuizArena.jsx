import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function QuizArena() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // State Management
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Game Play State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answersLog, setAnswersLog] = useState([]); // tracks: { questionId, selectedIndex, isCorrect, pointsEarned, timeSpent }
  const [selectedOption, setSelectedOption] = useState(null); // null, or index of option clicked
  const [isAnswered, setIsAnswered] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [score, setScore] = useState(0);

  // Sound FX simulator using standard Web Audio API to match the "retro-arcade" theme
  const playBeep = (freq, duration, type = 'sine') => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context might be blocked by browser policy until user click
    }
  };

  // Fetch Topic and Questions on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Get Topic Details
        const topicsResponse = await axios.get('/api/topics');
        const activeTopic = topicsResponse.data.find(t => t.slug === slug || t._id === slug);
        
        if (!activeTopic) {
          setError('Arcade Category not found');
          setLoading(false);
          return;
        }
        setTopic(activeTopic);

        // 2. Get Questions for this topic ID
        const questionsResponse = await axios.get('/api/questions');
        const matchedQuestions = questionsResponse.data.filter(q => q.topicId === activeTopic._id);
        
        // Randomize/Shuffle questions for high-stakes dynamic feel
        const shuffled = [...matchedQuestions].sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
        setLoading(false);
      } catch (err) {
        console.error('Error loading arena data:', err);
        setError('Systems failure! Could not connect to the retro gaming server.');
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Countdown timer logic
  useEffect(() => {
    if (loading || error || questions.length === 0 || currentIdx >= questions.length || isAnswered) return;

    if (timeLeft <= 0) {
      // AUTO-TIMEOUT LOGIC
      playBeep(120, 0.4, 'sawtooth');
      handleAnswerSelection(-1); // -1 signifies no answer (timeout)
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        // retro tick warning sound
        if (next <= 5 && next > 0) {
          playBeep(440, 0.05, 'triangle');
        }
        return next;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, currentIdx, questions, loading, error, isAnswered]);

  // Process Option Choice
  const handleAnswerSelection = (index) => {
    if (isAnswered) return; // Prevent double trigger

    const currentQuestion = questions[currentIdx];
    const correctIndex = Number(currentQuestion.correctOptionIndex);
    const isCorrect = index === correctIndex;
    
    // Audio feedbacks
    if (isCorrect) {
      playBeep(880, 0.15, 'sine');
      setTimeout(() => playBeep(1320, 0.25, 'sine'), 80);
    } else {
      playBeep(180, 0.35, 'triangle');
    }

    // Points calculation (Retro scaling: base points + speed multiplier + combo multiplier)
    const basePoints = Number(currentQuestion.points) || 100;
    const timeBonus = isCorrect ? Math.round(timeLeft * 10) : 0;
    const currentCombo = isCorrect ? comboCount + 1 : 0;
    const comboBonus = isCorrect ? Math.min(currentCombo * 20, 200) : 0;
    const earned = isCorrect ? (basePoints + timeBonus + comboBonus) : 0;

    setSelectedOption(index);
    setIsAnswered(true);
    if (isCorrect) {
      setComboCount(prev => prev + 1);
      setScore(prev => prev + earned);
    } else {
      setComboCount(0);
    }

    // Log this answer
    const timeSpent = 15 - timeLeft;
    setAnswersLog(prev => [
      ...prev,
      {
        questionId: currentQuestion._id,
        selectedIndex: index,
        isCorrect,
        pointsEarned: earned,
        timeSpent
      }
    ]);
  };

  // Go to Next Question or Complete Quiz
  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setTimeLeft(15);
      setSelectedOption(null);
      setIsAnswered(false);
      playBeep(600, 0.08, 'sine');
    } else {
      // Quiz Finished! Submit answers to the backend to evaluate final metrics dynamically
      const evaluationPayload = {
        topicId: topic._id,
        answers: answersLog.map(log => ({
          questionId: log.questionId,
          selectedIndex: log.selectedIndex,
          timeSpent: log.timeSpent
        }))
      };

      axios.post('/api/scores/evaluate', evaluationPayload)
        .then(response => {
          navigate('/results', {
            state: {
              topicTitle: topic?.title || 'Retro Challenge',
              score: response.data.score,
              totalQuestions: questions.length,
              correctCount: response.data.correctCount,
              timeSpent: response.data.totalTimeSpent,
              difficulty: topic?.difficulty || 'Normal'
            }
          });
        })
        .catch(err => {
          console.error('Backend score evaluation failure, using client-side calculation fallback:', err);
          // Fallback if specific grading endpoint is unavailable
          const computedCorrect = answersLog.filter(l => l.isCorrect).length;
          const computedTime = answersLog.reduce((acc, curr) => acc + curr.timeSpent, 0);
          navigate('/results', {
            state: {
              topicTitle: topic?.title || 'Retro Challenge',
              score,
              totalQuestions: questions.length,
              correctCount: computedCorrect,
              timeSpent: computedTime,
              difficulty: topic?.difficulty || 'Normal'
            }
          });
        });
    }
  };

  // Render Skeleton/Loading
  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="skeleton skeleton-text" style={{ height: '40px', width: '60%', margin: '0 auto 1.5rem' }}></div>
          <div className="skeleton skeleton-card" style={{ height: '250px', marginBottom: '1.5rem' }}></div>
          <div className="skeleton skeleton-text" style={{ height: '20px', width: '80%', margin: '0 auto 1rem' }}></div>
          <div className="skeleton skeleton-text" style={{ height: '20px', width: '50%', margin: '0 auto' }}></div>
        </div>
      </div>
    );
  }

  // Render Error
  if (error || questions.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="alert alert-error" style={{ display: 'inline-block', maxWidth: '600px' }}>
          <h3 style={{ marginTop: 0, fontFamily: 'monospace' }}>⚡ SYSTEM ERROR ⚡</h3>
          <p>{error || 'No challenges loaded for this terminal zone. Add questions in the admin cockpit!'}</p>
          <div style={{ marginTop: '1.5rem' }}>
            <button className="btn btn-primary" onClick={() => navigate('/')}>RETURN TO MAP</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  // Parse options safely from array
  let optionList = currentQuestion?.options || [];

  const progressPercentage = ((currentIdx + 1) / questions.length) * 100;
  const timePercentage = (timeLeft / 15) * 100;

  return (
    <main style={{ padding: '2rem 1.5rem', flex: 1, position: 'relative' }}>
      
      {/* Dynamic Background Matrix Lines */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0, bottom: 0, left: 0,
        backgroundImage: 'linear-gradient(rgba(0, 255, 102, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 102, 0.02) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        zIndex: -1,
        pointerEvents: 'none'
      }}></div>

      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* ARCADE HEADER HUD PANEL */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          backgroundColor: '#12161b',
          border: '2px solid var(--border)',
          borderRadius: '12px',
          padding: '1.25rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 32px rgba(0, 255, 102, 0.05)'
        }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--primary)', letterSpacing: '1.5px', fontSize: '0.8rem' }}>
              CURRENT MISSION // {topic?.title?.toUpperCase() || 'TRIVIA RUN'}
            </span>
            <h2 style={{ fontSize: '1.5rem', margin: '0.2rem 0 0 0', fontFamily: '"Orbitron", monospace' }}>
              STAGE <span className="gradient-text">{currentIdx + 1}</span> OF {questions.length}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {/* SCORE DISPLAY */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>SCORE</div>
              <div style={{ 
                fontFamily: '"Orbitron", monospace', 
                fontSize: '1.8rem', 
                color: 'var(--secondary)',
                fontWeight: 'bold',
                textShadow: '0 0 10px rgba(0, 240, 255, 0.3)'
              }}>
                {score}
              </div>
            </div>

            {/* COMBO METER */}
            {comboCount > 0 && (
              <div style={{
                textAlign: 'center',
                backgroundColor: 'rgba(0, 255, 102, 0.1)',
                border: '1px solid var(--primary)',
                padding: '4px 12px',
                borderRadius: '8px',
                animation: 'pulse 1s infinite alternate'
              }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '1px' }}>COMBO</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: '"Orbitron", monospace' }}>x{comboCount}</div>
              </div>
            )}
          </div>
        </header>

        {/* TIME BAR TIMER */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: timeLeft <= 5 ? '#ff4a5a' : 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '1px' }}>
              {timeLeft <= 5 ? '⚠️ TIME CRITICAL' : '⚡ SYSTEM COOLDOWN'}
            </span>
            <span style={{ 
              fontFamily: '"Orbitron", monospace', 
              fontSize: '1.2rem', 
              color: timeLeft <= 5 ? '#ff4a5a' : 'var(--primary)',
              fontWeight: 'bold' 
            }}>
              {timeLeft}s
            </span>
          </div>
          <div style={{ 
            height: '10px', 
            backgroundColor: '#1b2028', 
            borderRadius: '5px', 
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{
              height: '100%',
              width: `${timePercentage}%`,
              backgroundColor: timeLeft <= 5 ? '#ff4a5a' : 'var(--primary)',
              boxShadow: timeLeft <= 5 ? '0 0 10px #ff4a5a' : '0 0 10px var(--primary)',
              transition: 'width 1s linear, background-color 0.3s ease'
            }}></div>
          </div>
        </div>

        {/* QUESTION DISPLAY PANEL */}
        <section className="card" style={{
          backgroundColor: '#0c0f12',
          border: '1px solid var(--border)',
          boxShadow: 'inset 0 0 30px rgba(0, 255, 102, 0.02), 0 10px 40px rgba(0,0,0,0.5)',
          padding: '2.5rem 2.5rem 3rem 2.5rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Retro Grid Accent Overlay */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, height: '4px',
            background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)'
          }}></div>

          <p style={{
            fontSize: '0.85rem',
            color: 'var(--primary)',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '1rem'
          }}>
            // INCOMING CHALLENGE:
          </p>

          <h3 style={{ 
            fontSize: '1.6rem', 
            lineHeight: '1.5', 
            fontWeight: '600', 
            marginBottom: '2rem',
            color: '#fff',
            fontFamily: 'inherit'
          }}>
            {currentQuestion?.questionText}
          </h3>

          {/* RESPONSE SLOTS (OPTIONS) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {optionList.map((option, index) => {
              const correctIndex = Number(currentQuestion.correctOptionIndex);
              const isSelected = selectedOption === index;
              
              // Retro Styling States based on user selection logic
              let cardStyle = {
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              };

              if (isAnswered) {
                if (index === correctIndex) {
                  // This is the correct option! Glow green
                  cardStyle = {
                    backgroundColor: 'rgba(0, 255, 102, 0.1)',
                    border: '2px solid var(--primary)',
                    boxShadow: '0 0 15px rgba(0, 255, 102, 0.25)'
                  };
                } else if (isSelected && index !== correctIndex) {
                  // User chose incorrect option! Glow red
                  cardStyle = {
                    backgroundColor: 'rgba(255, 74, 90, 0.1)',
                    border: '2px solid #ff4a5a',
                    boxShadow: '0 0 15px rgba(255, 74, 90, 0.25)'
                  };
                } else {
                  // Unselected non-correct options fade slightly
                  cardStyle = {
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid rgba(255, 255, 255, 0.03)',
                    opacity: 0.5
                  };
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelection(index)}
                  disabled={isAnswered}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '100%',
                    padding: '1.1rem 1.5rem',
                    borderRadius: '10px',
                    cursor: isAnswered ? 'default' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s ease-in-out',
                    color: '#fff',
                    fontFamily: 'inherit',
                    fontWeight: '500',
                    fontSize: '1.05rem',
                    ...cardStyle
                  }}
                  className={!isAnswered ? "option-button-hover" : ""}
                >
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    backgroundColor: isAnswered 
                      ? (index === correctIndex ? 'var(--primary)' : isSelected ? '#ff4a5a' : 'rgba(255,255,255,0.05)')
                      : 'rgba(255, 255, 255, 0.05)',
                    color: isAnswered && (index === correctIndex || isSelected) ? '#000' : 'var(--text-muted)',
                    marginRight: '1rem',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    fontFamily: '"Orbitron", monospace'
                  }}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  
                  <span style={{ flex: 1 }}>{option}</span>

                  {/* Indicator state Icons */}
                  {isAnswered && index === correctIndex && (
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1rem', marginLeft: '0.5rem' }}>
                      ✓ CORRECT
                    </span>
                  )}
                  {isAnswered && isSelected && index !== correctIndex && (
                    <span style={{ color: '#ff4a5a', fontWeight: 'bold', fontSize: '1rem', marginLeft: '0.5rem' }}>
                      ✗ FAILED
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Progression controls */}
          {isAnswered && (
            <div style={{
              marginTop: '2.5rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
              animation: 'fadeIn 0.4s ease-out'
            }}>
              <div>
                {selectedOption === -1 ? (
                  <span style={{ color: '#ff4a5a', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                    ⌛ OUT OF TIME! Quick reflexes earn big rewards.
                  </span>
                ) : selectedOption === Number(currentQuestion.correctOptionIndex) ? (
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                    ✨ SPLENDID! +{score - (answersLog[answersLog.length - 2]?.pointsEarned || 0) || 100} RETRO POINTS
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    Correct answer was option <strong style={{ color: 'var(--primary)' }}>{String.fromCharCode(65 + Number(currentQuestion.correctOptionIndex))}</strong>.
                  </span>
                )}
              </div>

              <button
                className="btn btn-primary"
                onClick={handleNextQuestion}
                style={{
                  padding: '12px 30px',
                  fontFamily: '"Orbitron", sans-serif',
                  letterSpacing: '1px',
                  boxShadow: '0 0 15px rgba(0, 255, 102, 0.4)'
                }}
              >
                {currentIdx + 1 < questions.length ? 'NEXT WAVE →' : 'CALCULATE SCORE ❯'}
              </button>
            </div>
          )}
        </section>

        {/* PROGRESS MINI BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>RUN PROGRESS: {Math.round(progressPercentage)}%</span>
          <span>STABILITY RATING: NOMINAL</span>
        </div>
      </div>

      {/* Embedded CSS injection specifically for option selection hover effects in QuizArena */}
      <style>{`
        .option-button-hover:hover {
          background-color: rgba(0, 255, 102, 0.05) !important;
          border-color: var(--primary) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 255, 102, 0.1);
        }
        @keyframes pulse {
          0% { opacity: 0.8; }
          100% { opacity: 1; box-shadow: 0 0 15px rgba(0, 255, 102, 0.3); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}