const { useState, useEffect, useRef } = React;

function confettiPieces(count = 28) {
  return Array.from({ length: count }).map(() => ({
    left: 50 + Math.random() * 30 - 15,
    top: 40 + Math.random() * 10 - 5,
    tx: Math.round(Math.random() * 160 - 80) + 'px',
    ty: Math.round(Math.random() * -180 - 60) + 'px',
    id: Math.random().toString(36).slice(2),
  }));
}

function useTypewriter(text, active) {
  const [out, setOut] = useState('');
  useEffect(() => {
    if (!active) return;
    let i = 0;
    let raf = null;
    const tick = () => {
      setOut(text.slice(0, i));
      i += 1;
      if (i <= text.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
  }, [text, active]);
  return out;
}

function App() {
  const [step, setStep] = useState(0);
  const heartTarget = 6;
  const [caught, setCaught] = useState(0);
  const [popped, setPopped] = useState(new Set());
  const [answer, setAnswer] = useState('');

  const expected = ['H', 'A', 'J', 'A', 'R'];
  const [puzzle, setPuzzle] = useState(() => makePuzzle());
  const [progress, setProgress] = useState(0);
  const [unlocked, setUnlocked] = useState(false);

  const [showFinal, setShowFinal] = useState(false);
  const [confetti, setConfetti] = useState([]);

  const typed = useTypewriter(
    "Hajar, my love, I miss you more than words can ever express. Every day without you feels like a piece of my heart is missing. I think of your smile, your laugh, the way you make everything better just by being you. I cannot wait to hold you close again, to see your beautiful eyes light up, and to make every moment count. You are my everything, and the distance only makes my love for you grow stronger. I miss you endlessly.",
    showFinal
  );

  useEffect(() => {
    document.title = 'Guess What';
  }, []);

  function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  function makePuzzle() {
    return shuffle(expected).map(letter => ({ id: Math.random().toString(36).slice(2), letter, matched: false }));
  }

  function handleHeart(i) {
    if (popped.has(i)) return;
    const next = new Set(popped);
    next.add(i);
    setPopped(next);
    setCaught(c => Math.min(c + 1, heartTarget));
  }

  useEffect(() => {
    if (caught >= heartTarget) {
      // allow moving on
    }
  }, [caught]);

  function handleNext1() {
    if (caught >= heartTarget) setStep(1);
  }

  function handleNext2() {
    if (answer.trim().length >= 5) setStep(2);
  }

  function resetPuzzle() {
    setPuzzle(makePuzzle());
    setProgress(0);
    setUnlocked(false);
  }

  useEffect(() => {
    resetPuzzle();
  }, []);

  function handlePetal(id, letter) {
    // ignore clicks on already-matched petals
    const item = puzzle.find(p => p.id === id);
    if (!item || item.matched) return;

    if (letter === expected[progress]) {
      // mark this petal as matched
      setPuzzle(curr => curr.map(p => p.id === id ? { ...p, matched: true } : p));
      // use functional update to avoid stale progress
      setProgress(p => {
        const next = p + 1;
        if (next === expected.length) setUnlocked(true);
        return next;
      });
    } else {
      // wrong tap: reshuffle and reset progress
      resetPuzzle();
    }
  }

  function reveal() {
    if (!unlocked) return;
    setStep(3);
    setShowFinal(true);
    setConfetti(confettiPieces(28));
  }

  function restart() {
    setStep(0);
    setCaught(0);
    setPopped(new Set());
    setAnswer('');
    resetPuzzle();
    setUnlocked(false);
    setShowFinal(false);
    setConfetti([]);
  }

  return (
    <main className="scene app-root">
      <header className="hero">
        <p className="eyebrow">for my beloved Hajar</p>
        <h1>A Journey Made for You</h1>
        <p className="lede">A few sweet steps crafted just for you, my love. Take your time and let each moment remind you how much you mean to me.</p>
      </header>

      <section className={`card step ${step === 0 ? 'active' : ''}`} aria-hidden={step !== 0}>
        <div className="step-label">Step 1</div>
        <h2>Collect violets for me</h2>
        <p>Tap six glowing flowers to gather them in your heart.</p>
        <div className="heart-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <button
              key={i}
              className={`heart-btn ${popped.has(i) ? 'popped' : ''}`}
              onClick={() => handleHeart(i)}
              aria-label={`flower ${i + 1}`}
              style={{ touchAction: 'manipulation' }}
            />
          ))}
        </div>
        <div className="progress-text">{caught} / {heartTarget} gathered</div>
        <button className="pill" disabled={caught < heartTarget} onClick={handleNext1}>Next</button>
      </section>

      <section className={`card step ${step === 1 ? 'active' : ''}`} aria-hidden={step !== 1}>
        <div className="step-label">Step 2</div>
        <h2>A question for you, Hajar</h2>
        <p>What's the first thing you want us to do when we're together again?</p>
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          rows={3}
          maxLength={160}
          placeholder="Tell me what your heart desires..."
        />
        <div className="hint">{answer.trim().length >= 5 ? 'Perfect. Ready when you are.' : 'Type a few words for me.'}</div>
        <button className="pill" disabled={answer.trim().length < 5} onClick={handleNext2}>Next</button>
      </section>

      <section className={`card step ${step === 2 ? 'active' : ''}`} aria-hidden={step !== 2}>
        <div className="step-label">Step 3</div>
        <h2>Unlock my message</h2>
        <p>Tap the petals in order to spell "HAJAR".</p>
        <div className={`puzzle-grid ${false ? 'shake' : ''}`}>
          {puzzle.map((p, idx) => (
            <button
              key={p.id}
              className={`puzzle-heart ${p.matched ? 'correct' : ''}`}
              onClick={() => handlePetal(p.id, p.letter)}
              disabled={p.matched}
            >
              <span>{p.letter}</span>
            </button>
          ))}
        </div>
        <div className="hint">{unlocked ? 'Unlocked! Ready to reveal.' : 'Spell your beautiful name. A wrong tap will reshuffle.'}</div>
        <button className="pill" disabled={!unlocked} onClick={reveal}>Reveal the message</button>
      </section>

      <section className={`card final ${showFinal ? 'active' : ''}`} aria-hidden={!showFinal}>
        <div className="final-top">
          <p className="eyebrow">From me to you, Hajar</p>
          <h2>What my heart wants to say</h2>
        </div>
        <p className="typed">{typed}</p>
        <div className="final-note">Every moment without you feels incomplete. You're my favorite thought, my sweetest dream.</div>
        <div className="final-actions">
          <button className="pill ghost" onClick={restart}>Replay the journey</button>
        </div>

        <div className="confetti" aria-hidden="true">
          {confetti.map(c => (
            <span key={c.id} style={{ left: `${c.left}%`, top: `${c.top}%`, '--tx': c.tx, '--ty': c.ty }} />
          ))}
        </div>
      </section>
    </main>
  );
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
