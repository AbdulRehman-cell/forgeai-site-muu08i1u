import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  // Topic States
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState('');
  
  // Topic Form States
  const [topicForm, setTopicForm] = useState({
    title: '',
    description: '',
    difficulty: 'MEDIUM',
    slug: ''
  });
  const [topicSubmitLoading, setTopicSubmitLoading] = useState(false);
  const [topicSuccess, setTopicSuccess] = useState('');
  const [topicFormError, setTopicFormError] = useState('');
  const [editingTopicId, setEditingTopicId] = useState(null);

  // Question States
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState('');

  // Question Form States
  const [questionForm, setQuestionForm] = useState({
    topicId: '',
    questionText: '',
    option0: '',
    option1: '',
    option2: '',
    option3: '',
    correctOptionIndex: 0,
    points: 10
  });
  const [questionSubmitLoading, setQuestionSubmitLoading] = useState(false);
  const [questionSuccess, setQuestionSuccess] = useState('');
  const [questionFormError, setQuestionFormError] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  // Stats
  const [totalPoints, setTotalPoints] = useState(0);

  // Fetch initial data
  useEffect(() => {
    fetchTopics();
    fetchQuestions();
  }, []);

  const fetchTopics = async () => {
    setTopicsLoading(true);
    try {
      const res = await axios.get('/api/topics');
      setTopics(res.data || []);
      setTopicsError('');
    } catch (err) {
      console.error(err);
      setTopicsError('Failed to fetch topics from the synaptic mainframe.');
    } finally {
      setTopicsLoading(false);
    }
  };

  const fetchQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const res = await axios.get('/api/questions');
      const data = res.data || [];
      setQuestions(data);
      
      // Calculate total points
      const points = data.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
      setTotalPoints(points);
      
      setQuestionsError('');
    } catch (err) {
      console.error(err);
      setQuestionsError('Failed to fetch questions from the database.');
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Generate Slug automatically from title
  const handleTitleChange = (e) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setTopicForm(prev => ({
      ...prev,
      title: val,
      slug: generatedSlug
    }));
  };

  // Submit Topic (Create / Update)
  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    if (!topicForm.title || !topicForm.description || !topicForm.slug) {
      setTopicFormError('All fields must be verified before neural compilation.');
      return;
    }

    setTopicSubmitLoading(true);
    setTopicFormError('');
    setTopicSuccess('');

    try {
      if (editingTopicId) {
        await axios.put(`/api/topics/${editingTopicId}`, topicForm);
        setTopicSuccess('✓ Synaptic Topic Successfully Restructured!');
      } else {
        await axios.post('/api/topics', topicForm);
        setTopicSuccess('✓ New Synaptic Topic Loaded Into System Core!');
      }

      // Reset form & state
      setTopicForm({
        title: '',
        description: '',
        difficulty: 'MEDIUM',
        slug: ''
      });
      setEditingTopicId(null);
      fetchTopics();

      // Clear success alert after 5s
      setTimeout(() => setTopicSuccess(''), 5000);
    } catch (err) {
      console.error(err);
      setTopicFormError(err.response?.data?.message || 'Error executing topic configuration.');
    } finally {
      setTopicSubmitLoading(false);
    }
  };

  // Submit Question (Create / Update)
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    const optionsArray = [
      questionForm.option0.trim(),
      questionForm.option1.trim(),
      questionForm.option2.trim(),
      questionForm.option3.trim()
    ];

    if (!questionForm.topicId || !questionForm.questionText || optionsArray.some(opt => !opt)) {
      setQuestionFormError('A complete answer matrix (4 options) and target topic are mandatory.');
      return;
    }

    setQuestionSubmitLoading(true);
    setQuestionFormError('');
    setQuestionSuccess('');

    const payload = {
      topicId: questionForm.topicId,
      questionText: questionForm.questionText,
      options: optionsArray,
      correctOptionIndex: Number(questionForm.correctOptionIndex),
      points: Number(questionForm.points) || 10
    };

    try {
      if (editingQuestionId) {
        await axios.put(`/api/questions/${editingQuestionId}`, payload);
        setQuestionSuccess('✓ Synaptic Question Modified Successfully!');
      } else {
        await axios.post('/api/questions', payload);
        setQuestionSuccess('✓ New Synaptic Vector Formed and Primed!');
      }

      // Reset form
      setQuestionForm({
        topicId: questionForm.topicId, // Keep topic ID selected for quick continuous additions
        questionText: '',
        option0: '',
        option1: '',
        option2: '',
        option3: '',
        correctOptionIndex: 0,
        points: 10
      });
      setEditingQuestionId(null);
      fetchQuestions();

      // Clear success alert after 5s
      setTimeout(() => setQuestionSuccess(''), 5000);
    } catch (err) {
      console.error(err);
      setQuestionFormError(err.response?.data?.message || 'Failed to inject question vector.');
    } finally {
      setQuestionSubmitLoading(false);
    }
  };

  // Edit triggers
  const startEditTopic = (topic) => {
    setEditingTopicId(topic._id);
    setTopicForm({
      title: topic.title,
      description: topic.description,
      difficulty: topic.difficulty || 'MEDIUM',
      slug: topic.slug
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const cancelEditTopic = () => {
    setEditingTopicId(null);
    setTopicForm({
      title: '',
      description: '',
      difficulty: 'MEDIUM',
      slug: ''
    });
  };

  const startEditQuestion = (q) => {
    setEditingQuestionId(q._id);
    setQuestionForm({
      topicId: q.topicId,
      questionText: q.questionText,
      option0: q.options[0] || '',
      option1: q.options[1] || '',
      option2: q.options[2] || '',
      option3: q.options[3] || '',
      correctOptionIndex: q.correctOptionIndex,
      points: q.points || 10
    });
    window.scrollTo({ top: 800, behavior: 'smooth' });
  };

  const cancelEditQuestion = () => {
    setEditingQuestionId(null);
    setQuestionForm({
      topicId: '',
      questionText: '',
      option0: '',
      option1: '',
      option2: '',
      option3: '',
      correctOptionIndex: 0,
      points: 10
    });
  };

  // Deletions
  const deleteTopic = async (id) => {
    if (window.confirm('Are you absolutely sure? Purging this topic will isolate its associated question vectors.')) {
      try {
        await axios.delete(`/api/topics/${id}`);
        fetchTopics();
      } catch (err) {
        console.error(err);
        alert('Transmission error trying to purge topic.');
      }
    }
  };

  const deleteQuestion = async (id) => {
    if (window.confirm('Confirm permanent deletion of this synaptic question.')) {
      try {
        await axios.delete(`/api/questions/${id}`);
        fetchQuestions();
      } catch (err) {
        console.error(err);
        alert('Transmission error trying to delete question.');
      }
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      
      {/* Header Banner */}
      <section className="section" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
        <div className="section-head" style={{ textAlign: 'center', marginBottom: 0 }}>
          <span className="eyebrow" style={{ color: 'var(--secondary)' }}>CORE CONTROLS</span>
          <h1 style={{ fontFamily: '"Orbitron", sans-serif', textTransform: 'uppercase' }}>
            Curator <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="hero-subtitle" style={{ maxWidth: '700px', margin: '1rem auto 0' }}>
            Configure battlegrounds, design rapid-decay challenge prompts, and control the active neural database vector metrics in real-time.
          </p>
        </div>
      </section>

      {/* Stats Board */}
      <section className="section" style={{ padding: '2rem 0' }}>
        <div className="grid grid-3">
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <span className="eyebrow">ACTIVE TOPICS</span>
            <div className="stat-value" style={{ 
              fontSize: '2.5rem', 
              color: 'var(--secondary)', 
              filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.4))',
              fontFamily: '"Orbitron", sans-serif',
              fontWeight: 900
            }}>
              {topicsLoading ? '...' : topics.length}
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Operational Domains</p>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <span className="eyebrow">TOTAL QUESTIONS</span>
            <div className="stat-value" style={{ 
              fontSize: '2.5rem', 
              color: 'var(--primary)', 
              filter: 'drop-shadow(0 0 8px rgba(0,255,102,0.4))',
              fontFamily: '"Orbitron", sans-serif',
              fontWeight: 900
            }}>
              {questionsLoading ? '...' : questions.length}
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Synapses Ready for Discharge</p>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <span className="eyebrow">COMBAT ENERGY POTENTIAL</span>
            <div className="stat-value" style={{ 
              fontSize: '2.5rem', 
              color: 'var(--accent)', 
              filter: 'drop-shadow(0 0 8px rgba(255,59,48,0.4))',
              fontFamily: '"Orbitron", sans-serif',
              fontWeight: 900
            }}>
              {questionsLoading ? '...' : totalPoints} PTS
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Cumulative Global Point-Pool</p>
          </div>
        </div>
      </section>

      {/* Topic Constructor Grid */}
      <section className="section" style={{ padding: '2rem 0', borderTop: '1px solid var(--border)' }}>
        <div className="grid grid-2" style={{ gap: '2rem' }}>
          
          {/* List of Topics */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: '"Orbitron", sans-serif', fontSize: '1.5rem', margin: 0 }}>ACTIVE SECTOR MAP</h2>
              <span className="pill" style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--secondary)' }}>LOCAL CACHE</span>
            </div>

            {topicsLoading ? (
              <div className="skeleton skeleton-card" style={{ height: '200px' }}></div>
            ) : topicsError ? (
              <div className="alert alert-error">{topicsError}</div>
            ) : topics.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--muted)' }}>No battle sectors currently deployed.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {topics.map(t => (
                  <div key={t._id} className="card" style={{ 
                    border: '1px solid var(--border)', 
                    background: 'var(--surface-2)',
                    padding: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span className="pill" style={{ 
                          fontSize: '0.75rem',
                          background: t.difficulty === 'BRUTAL' ? 'rgba(255,59,48,0.1)' : t.difficulty === 'MEDIUM' ? 'rgba(0,240,255,0.1)' : 'rgba(0,255,102,0.1)',
                          color: t.difficulty === 'BRUTAL' ? 'var(--accent)' : t.difficulty === 'MEDIUM' ? 'var(--secondary)' : 'var(--primary)'
                        }}>{t.difficulty}</span>
                        <h3 style={{ margin: '0.5rem 0 0.25rem 0', fontFamily: '"Orbitron", sans-serif' }}>{t.title}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '0 0 0.5rem 0' }}>{t.description}</p>
                        <code style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>slug: {t.slug}</code>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => startEditTopic(t)}>
                          EDIT
                        </button>
                        <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'var(--accent)' }} onClick={() => deleteTopic(t._id)}>
                          PURGE
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create / Edit Topic Form */}
          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', alignSelf: 'start' }}>
            <h3 style={{ fontFamily: '"Orbitron", sans-serif', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginTop: 0 }}>
              {editingTopicId ? 'REWRITE DOMAIN DATA' : 'CONSTRUCT NEW SECTOR'}
            </h3>

            {topicSuccess && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{topicSuccess}</div>}
            {topicFormError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{topicFormError}</div>}

            <form onSubmit={handleTopicSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                  Sector Name / Title
                </label>
                <input 
                  type="text" 
                  value={topicForm.title} 
                  onChange={handleTitleChange} 
                  placeholder="e.g., Quantum Physics"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: 'var(--text)'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                  System Slug (Auto-compiled)
                </label>
                <input 
                  type="text" 
                  value={topicForm.slug} 
                  onChange={(e) => setTopicForm(prev => ({ ...prev, slug: e.target.value }))} 
                  placeholder="quantum-physics"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: 'var(--secondary)'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                  Difficulty Scale
                </label>
                <select
                  value={topicForm.difficulty}
                  onChange={(e) => setTopicForm(prev => ({ ...prev, difficulty: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: 'var(--text)'
                  }}
                >
                  <option value="EASY">EASY (Novice Synapses)</option>
                  <option value="MEDIUM">MEDIUM (Standard Cognitive Load)</option>
                  <option value="BRUTAL">BRUTAL (Neural Overclock Needed)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                  Decay Warning / Sector Description
                </label>
                <textarea 
                  value={topicForm.description} 
                  onChange={(e) => setTopicForm(prev => ({ ...prev, description: e.target.value }))} 
                  placeholder="Instantly hook users with rapid countdown reminders..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: 'var(--text)'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={topicSubmitLoading}
                  style={{ flex: 1 }}
                >
                  {topicSubmitLoading ? 'TRANSMITTING...' : editingTopicId ? 'APPLY MODIFICATIONS' : 'DEPLOY SECTOR'}
                </button>
                {editingTopicId && (
                  <button type="button" className="btn btn-secondary" onClick={cancelEditTopic}>
                    CANCEL
                  </button>
                )}
              </div>
            </form>
          </div>

        </div>
      </section>

      {/* Question Constructor Matrix */}
      <section className="section" style={{ padding: '2rem 0', borderTop: '1px solid var(--border)' }}>
        <div className="grid grid-2" style={{ gap: '2rem' }}>
          
          {/* Question Creator / Editor Form */}
          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', alignSelf: 'start' }}>
            <h3 style={{ fontFamily: '"Orbitron", sans-serif', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginTop: 0 }}>
              {editingQuestionId ? 'MUTATE QUESTION VECTOR' : 'CONSTRUCT NEW QUESTION VECTOR'}
            </h3>

            {questionSuccess && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{questionSuccess}</div>}
            {questionFormError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{questionFormError}</div>}

            <form onSubmit={handleQuestionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                  Target Sector Map
                </label>
                <select
                  value={questionForm.topicId}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, topicId: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: 'var(--text)'
                  }}
                  required
                >
                  <option value="">-- SELECT SECTOR TARGET --</option>
                  {topics.map(t => (
                    <option key={t._id} value={t._id}>{t.title} [{t.difficulty}]</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                  Question Text / Cognitive Decryptor
                </label>
                <textarea 
                  value={questionForm.questionText} 
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, questionText: e.target.value }))} 
                  placeholder="e.g., Which quantum mechanical principle asserts that two identical fermions cannot occupy same state?"
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: 'var(--text)'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                  Response Grid (Exactly 4 Options)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontFamily: '"Orbitron", sans-serif', color: 'var(--muted)', width: '20px' }}>A</span>
                    <input 
                      type="text" 
                      value={questionForm.option0} 
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, option0: e.target.value }))} 
                      placeholder="Option A Option"
                      style={{ flex: 1, padding: '0.5rem', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontFamily: '"Orbitron", sans-serif', color: 'var(--muted)', width: '20px' }}>B</span>
                    <input 
                      type="text" 
                      value={questionForm.option1} 
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, option1: e.target.value }))} 
                      placeholder="Option B Option"
                      style={{ flex: 1, padding: '0.5rem', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontFamily: '"Orbitron", sans-serif', color: 'var(--muted)', width: '20px' }}>C</span>
                    <input 
                      type="text" 
                      value={questionForm.option2} 
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, option2: e.target.value }))} 
                      placeholder="Option C Option"
                      style={{ flex: 1, padding: '0.5rem', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontFamily: '"Orbitron", sans-serif', color: 'var(--muted)', width: '20px' }}>D</span>
                    <input 
                      type="text" 
                      value={questionForm.option3} 
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, option3: e.target.value }))} 
                      placeholder="Option D Option"
                      style={{ flex: 1, padding: '0.5rem', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                  True Core Matrix (Correct Answer Option Index)
                </label>
                <select
                  value={questionForm.correctOptionIndex}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, correctOptionIndex: Number(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: 'var(--primary)'
                  }}
                >
                  <option value={0}>A (Option 1)</option>
                  <option value={1}>B (Option 2)</option>
                  <option value={2}>C (Option 3)</option>
                  <option value={3}>D (Option 4)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                  Synaptic Energy Potential (Points Score Weight)
                </label>
                <input 
                  type="number" 
                  value={questionForm.points} 
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, points: Number(e.target.value) }))} 
                  min="5"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: 'var(--text)'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={questionSubmitLoading}
                  style={{ flex: 1, borderColor: 'var(--secondary)' }}
                >
                  {questionSubmitLoading ? 'MUTATING ARRAY...' : editingQuestionId ? 'UPDATE SYNAPTIC DATA' : 'LOAD SYNAPTIC QUESTION'}
                </button>
                {editingQuestionId && (
                  <button type="button" className="btn btn-secondary" onClick={cancelEditQuestion}>
                    CANCEL
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List of Questions */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: '"Orbitron", sans-serif', fontSize: '1.5rem', margin: 0 }}>STORED SYNAPTIC MATRIX</h2>
              <span className="pill" style={{ background: 'rgba(0, 255, 102, 0.1)', color: 'var(--primary)' }}>ACTIVE DECK</span>
            </div>

            {questionsLoading ? (
              <div className="skeleton skeleton-card" style={{ height: '300px' }}></div>
            ) : questionsError ? (
              <div className="alert alert-error">{questionsError}</div>
            ) : questions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--muted)' }}>No interactive vectors deployed in the database core.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '800px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {questions.map((q, idx) => {
                  const targetTopic = topics.find(t => t._id === q.topicId);
                  return (
                    <div key={q._id} className="card" style={{ 
                      border: '1px solid var(--border)', 
                      background: 'var(--surface-2)',
                      padding: '1.25rem',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span className="pill" style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', marginRight: '0.5rem' }}>
                            {targetTopic ? targetTopic.title : 'Orphan Vector'}
                          </span>
                          <span className="pill" style={{ fontSize: '0.7rem', background: 'rgba(0,255,102,0.05)', color: 'var(--primary)' }}>
                            {q.points} PTS
                          </span>
                          <h4 style={{ margin: '0.75rem 0', fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 }}>
                            {idx + 1}. {q.questionText}
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                            {q.options?.map((opt, i) => (
                              <div key={i} style={{ 
                                padding: '4px 8px', 
                                border: '1px solid',
                                borderColor: q.correctOptionIndex === i ? 'rgba(0,255,102,0.3)' : 'transparent',
                                background: q.correctOptionIndex === i ? 'rgba(0,255,102,0.05)' : 'transparent',
                                color: q.correctOptionIndex === i ? 'var(--primary)' : 'var(--muted)'
                              }}>
                                {String.fromCharCode(65 + i)}: {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                          <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => startEditQuestion(q)}>
                            EDIT
                          </button>
                          <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--accent)' }} onClick={() => deleteQuestion(q._id)}>
                            DELETE
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}