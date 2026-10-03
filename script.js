const original = [
  { label: "Do", note: "C4" }, { label: "Si♭", note: "Bb3" }, { label: "La", note: "A3" },
  { label: "Si♭", note: "Bb3" }, { label: "La", note: "A3" }, { label: "La", note: "A3" }, { label: "Sol", note: "G3" },
  { label: "La", note: "A3" }, { label: "Si♭", note: "Bb3" }, { label: "La", note: "A3" },
  { label: "La", note: "A3" }, { label: "Si♭", note: "Bb3" }, { label: "Do", note: "C4" },
  { label: "Si♭", note: "Bb3" }, { label: "Si♭", note: "Bb3" }
];

const adapted = [
  { label: "Re", note: "D4" }, { label: "Do", note: "C4" }, { label: "Si", note: "B3" },
  { label: "Do", note: "C4" }, { label: "Si", note: "B3" }, { label: "Si", note: "B3" }, { label: "La", note: "A3" },
  { label: "Si", note: "B3" }, { label: "Do", note: "C4" }, { label: "Si", note: "B3" },
  { label: "Si", note: "B3" }, { label: "Do", note: "C4" }, { label: "Re", note: "D4" },
  { label: "Do", note: "C4" }, { label: "Do", note: "C4" }
];

const frequencies = {
  "G3": 196.00,
  "G#3": 207.65,
  "A3": 220.00,
  "Bb3": 233.08,
  "B3": 246.94,
  "C4": 261.63,
  "C#4": 277.18,
  "D4": 293.66,
  "D#4": 311.13,
  "E4": 329.63
};

let audioContext;
let activeRun = 0;

function ctx() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return audioContext;
}

function tone(note, duration = 0.34) {
  const audio = ctx();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "triangle";
  osc.frequency.value = frequencies[note];
  gain.gain.setValueAtTime(0.0001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, audio.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + duration + 0.03);
}

function clearHighlights() {
  document.querySelectorAll(".active-key, .active-note").forEach(el => el.classList.remove("active-key", "active-note"));
}

function highlightKey(note) {
  document.querySelectorAll(`[data-note="${note}"]`).forEach(el => el.classList.add("active-key"));
}

function highlightChip(type, index) {
  const chips = [...document.querySelectorAll(`[data-sequence="${type}"] .note-row span`)];
  if (chips[index]) chips[index].classList.add("active-note");
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function playSequence(type) {
  const run = ++activeRun;
  const seq = type === "original" ? original : adapted;
  const speed = Number(document.getElementById("speedRange")?.value || 700);
  const status = document.getElementById("nowPlaying");

  for (let i = 0; i < seq.length; i++) {
    if (run !== activeRun) return;
    clearHighlights();
    const item = seq[i];
    highlightKey(item.note);
    highlightChip(type, i);
    if (status) status.textContent = `${type === "adapted" ? "Versión de inicio" : "Original"}: ${item.label}`;
    tone(item.note, Math.min(.42, speed / 1500));
    await wait(speed);
  }

  if (run === activeRun) {
    clearHighlights();
    if (status) status.textContent = "¡Listo! Repite hasta que el recorrido se sienta natural.";
  }
}

function stopPlayback() {
  activeRun++;
  clearHighlights();
  const status = document.getElementById("nowPlaying");
  if (status) status.textContent = "Reproducción detenida";
}

document.querySelectorAll("[data-play]").forEach(btn => {
  btn.addEventListener("click", () => playSequence(btn.dataset.play));
});

document.getElementById("playAdapted")?.addEventListener("click", () => playSequence("adapted"));
document.getElementById("playAdaptedTop")?.addEventListener("click", () => {
  document.getElementById("practica")?.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => playSequence("adapted"), 450);
});
document.getElementById("stopPlayback")?.addEventListener("click", stopPlayback);

const speedRange = document.getElementById("speedRange");
const speedLabel = document.getElementById("speedLabel");
function updateSpeedLabel() {
  const v = Number(speedRange.value);
  speedLabel.textContent = v >= 900 ? "Lenta" : v >= 700 ? "Normal" : "Rápida";
}
speedRange?.addEventListener("input", updateSpeedLabel);
updateSpeedLabel();

document.querySelectorAll("#piano [data-note]").forEach(key => {
  key.addEventListener("pointerdown", () => {
    stopPlayback();
    clearHighlights();
    key.classList.add("active-key");
    tone(key.dataset.note, .45);
    const label = key.querySelector("span")?.textContent || key.getAttribute("aria-label") || key.dataset.note;
    document.getElementById("nowPlaying").textContent = `Tecla: ${label}`;
  });
  key.addEventListener("pointerup", () => key.classList.remove("active-key"));
  key.addEventListener("pointerleave", () => key.classList.remove("active-key"));
});
