const steps = Array.from(document.querySelectorAll('.step'));
const finalCard = document.getElementById('final-message');
const heartBtns = Array.from(document.querySelectorAll('.heart-btn'));
const heartProgress = document.getElementById('heart-progress');
const next1 = document.getElementById('next-1');
const answer = document.getElementById('answer');
const answerHint = document.getElementById('answer-hint');
const next2 = document.getElementById('next-2');
const puzzleGrid = document.getElementById('puzzle-grid');
const puzzleStatus = document.getElementById('puzzle-status');
const revealBtn = document.getElementById('reveal');
const typedEl = document.getElementById('typed');
const restartBtn = document.getElementById('restart');
const confettiWrap = document.getElementById('confetti');

let heartTarget = 6;
let heartCaught = 0;
let expected = ['H', 'A', 'J', 'A', 'R'];
let progress = 0;

function showStep(index) {
  steps.forEach((step, i) => {
    step.classList.toggle('active', i === index);
  });
  finalCard.classList.remove('active');
}

function updateHeartProgress() {
  heartProgress.textContent = `${heartCaught} / ${heartTarget} caught`;
  if (heartCaught >= heartTarget) {
    next1.disabled = false;
  }
}

function resetHearts() {
  heartCaught = 0;
  heartBtns.forEach(btn => btn.classList.remove('popped'));
  next1.disabled = true;
  updateHeartProgress();
}

function buildPuzzle() {
  puzzleGrid.innerHTML = '';
  progress = 0;
  const shuffled = [...expected].sort(() => Math.random() - 0.5);
  shuffled.forEach(letter => {
    const btn = document.createElement('button');
    btn.className = 'puzzle-heart';
    btn.innerHTML = `<span>${letter}</span>`;
    btn.addEventListener('click', () => handlePuzzleTap(btn, letter));
    puzzleGrid.appendChild(btn);
  });
  puzzleStatus.textContent = 'Spell it in order. A wrong tap will reshuffle.';
  revealBtn.disabled = true;
}

function handlePuzzleTap(btn, letter) {
  if (letter === expected[progress]) {
    btn.classList.add('correct');
    progress += 1;
    puzzleStatus.textContent = progress === expected.length ? 'Unlocked! Ready to reveal.' : 'Beautiful. Keep going...';
    if (progress === expected.length) {
      revealBtn.disabled = false;
    }
  } else {
    puzzleGrid.classList.add('shake');
    setTimeout(() => puzzleGrid.classList.remove('shake'), 350);
    buildPuzzle();
  }
}

function typeMessage(text) {
  typedEl.textContent = '';
  let i = 0;
  const tick = () => {
    if (i <= text.length) {
      typedEl.textContent = text.slice(0, i);
      i += 1;
      requestAnimationFrame(tick);
    }
  };
  tick();
}

function fireConfetti() {
  confettiWrap.innerHTML = '';
  const count = 28;
  for (let i = 0; i < count; i += 1) {
    const bit = document.createElement('span');
    const tx = (Math.random() * 160 - 80).toFixed(0) + 'px';
    const ty = (Math.random() * -180 - 60).toFixed(0) + 'px';
    bit.style.setProperty('--tx', tx);
    bit.style.setProperty('--ty', ty);
    bit.style.left = `${50 + Math.random() * 30 - 15}%`;
    bit.style.top = `${40 + Math.random() * 10 - 5}%`;
    confettiWrap.appendChild(bit);
  }
}

function goToFinal() {
  steps.forEach(step => step.classList.remove('active'));
  finalCard.classList.add('active');
  typeMessage('Hajar, my love, I miss you more than words can ever express. Every day without you feels like a piece of my heart is missing. I think of your smile, your laugh, the way you make everything better just by being you. I cannot wait to hold you close again, to see your beautiful eyes light up, and to make every moment count. You are my everything, and the distance only makes my love for you grow stronger. I miss you endlessly.');
  fireConfetti();
}

heartBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (!btn.classList.contains('popped')) {
      btn.classList.add('popped');
      heartCaught += 1;
      updateHeartProgress();
    }
  });
});

next1.addEventListener('click', () => showStep(1));

answer.addEventListener('input', e => {
  const value = e.target.value.trim();
  const good = value.length >= 5;
  answerHint.textContent = good ? 'Perfect. Ready when you are.' : 'Type a few words for me.';
  next2.disabled = !good;
});

next2.addEventListener('click', () => showStep(2));

revealBtn.addEventListener('click', goToFinal);

restartBtn.addEventListener('click', () => {
  resetHearts();
  buildPuzzle();
  answer.value = '';
  next2.disabled = true;
  typedEl.textContent = '';
  showStep(0);
});

puzzleGrid.addEventListener('animationend', () => puzzleGrid.classList.remove('shake'));

// Initial setup
updateHeartProgress();
buildPuzzle();
