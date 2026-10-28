// src/scripts/tts.ts
// Text-to-Speech eksperimental memakai Web Speech API bawaan browser.
// Dukungan suara bergantung pada perangkat dan browser.

export const RATE = { min: 0.8, max: 1.2, step: 0.1, default: 1.0 } as const;

const MAX_CHARS = 180;

type PlayState = "idle" | "playing" | "paused";

const SUPPORTED =
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  "SpeechSynthesisUtterance" in window;

const CONTENT_ROOT = "main";
const TEXT_BLOCKS = "h1, h2, h3, h4, h5, h6, p, li, blockquote, dt, dd, td, th";
const HEADING_BLOCKS = "h1, h2, h3, h4, h5, h6";

// Elemen yang tidak dibacakan: navigasi, popup, rumus, diagram, kode, dan embed
const SKIP = [
  "aside", "nav", "dialog", "button", "script", "style", "svg",
  "pre", "figure", "math",
  ".math-block", ".mermaid-block", ".mermaid",
  ".embed-plot", ".embed-chart", ".embed-youtube", ".embed-iframe",
  ".embed-video", ".embed-grid", ".embed-link", ".embed-image",
  ".dock", "[data-tts-panel]",
].join(", ");

// ----- State modul -----
// Modul hanya dimuat sekali, jadi state ini bertahan antar navigasi.
let playState: PlayState = "idle";
let queue: string[] = [];
let index = 0;
let rate: number = RATE.default;
let lang = "id";
let voiceURI: string | null = null;
let titleOnly = false;
let session = 0;
let onState: ((state: PlayState) => void) | null = null;

function setState(next: PlayState) {
  playState = next;
  onState?.(next);
}

// ----- Pengambilan teks -----

export function splitSentences(text: string): string[] {
  const out: string[] = [];
  for (const part of text.split(/(?<=[.!?…])\s+/)) {
    const s = part.trim();
    if (!s) continue;
    if (s.length <= MAX_CHARS) {
      out.push(s);
    } else {
      const chunks = s.match(new RegExp(`.{1,${MAX_CHARS}}(?:\\s|$)`, "g")) ?? [s];
      out.push(...chunks.map((c) => c.trim()).filter(Boolean));
    }
  }
  return out;
}

// Mode "judul saja" hanya mengambil heading. Mode biasa mengambil semua blok teks.
export function collectSentences(): string[] {
  const root = document.querySelector<HTMLElement>(CONTENT_ROOT);
  if (!root) return [];

  const selector = titleOnly ? HEADING_BLOCKS : TEXT_BLOCKS;
  const sentences: string[] = [];

  root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    if (el.closest(SKIP)) return;
    if (el.querySelector(TEXT_BLOCKS)) return;
    const text = el.textContent?.replace(/\s+/g, " ").trim() ?? "";
    if (text) sentences.push(...splitSentences(text));
  });
  return sentences;
}

function getLang(): string {
  return document.getElementById("note-content")?.lang || "id";
}

// Suara yang dipilih pengguna lebih dulu. Jika tidak ada, pilih yang cocok dengan bahasa.
function pickVoice(code: string): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices();
  if (voiceURI) {
    const chosen = voices.find((v) => v.voiceURI === voiceURI);
    if (chosen) return chosen;
  }
  const prefix = code.slice(0, 2).toLowerCase();
  return voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
}

// Suara yang sesuai bahasa aktif. Jika tidak ada yang cocok, tampilkan semua suara.
export function getVoiceOptions(): { voiceURI: string; name: string; lang: string }[] {
  const prefix = getLang().slice(0, 2).toLowerCase();
  const all = speechSynthesis.getVoices();
  const matched = all.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  return (matched.length ? matched : all).map((v) => ({
    voiceURI: v.voiceURI,
    name: v.name,
    lang: v.lang,
  }));
}

// ----- Pemutaran -----

function speakFrom(start: number) {
  if (start >= queue.length) {
    stop();
    return;
  }

  index = start;
  const mySession = ++session;

  const utterance = new SpeechSynthesisUtterance(queue[start]);
  utterance.rate = rate;
  utterance.lang = lang;
  const voice = pickVoice(lang);
  if (voice) utterance.voice = voice;

  utterance.onend = () => {
    if (mySession !== session || playState !== "playing") return;
    speakFrom(start + 1);
  };

  utterance.onerror = (event) => {
    if (mySession !== session) return;
    if (event.error === "interrupted" || event.error === "canceled") return;
    console.warn("[tts] gagal membacakan:", event.error);
    stop();
  };

  speechSynthesis.speak(utterance);
}

// Mengulang kalimat yang sedang dibacakan dengan pengaturan baru (kecepatan atau suara)
function restartCurrent() {
  const wasPaused = playState === "paused";
  session++;
  speechSynthesis.cancel();
  speakFrom(index);
  if (wasPaused) speechSynthesis.pause();
}

export function play(): boolean {
  if (!SUPPORTED || playState !== "idle") return false;

  queue = collectSentences();
  if (queue.length === 0) return false;

  lang = getLang();
  speechSynthesis.resume();
  setState("playing");
  speakFrom(0);
  return true;
}

export function pause() {
  if (!SUPPORTED || playState !== "playing") return;
  speechSynthesis.pause();
  setState("paused");
}

export function resume() {
  if (!SUPPORTED || playState !== "paused") return;
  speechSynthesis.resume();
  setState("playing");
}

export function stop() {
  session++;
  if (SUPPORTED) speechSynthesis.cancel();
  queue = [];
  index = 0;
  setState("idle");
}

export function setRate(value: number): number {
  const stepped = Math.round(value / RATE.step) * RATE.step;
  rate = Math.min(RATE.max, Math.max(RATE.min, Number(stepped.toFixed(1))));
  if (playState !== "idle") restartCurrent();
  return rate;
}

// Suara "" atau null berarti otomatis sesuai bahasa
export function setVoice(uri: string | null) {
  voiceURI = uri || null;
  if (playState !== "idle") restartCurrent();
}

// Daftar kalimat berubah, jadi pemutaran dihentikan dan harus dimulai ulang
export function setTitleOnly(on: boolean) {
  titleOnly = on;
  stop();
}

// ----- Integrasi UI -----

export function initTts() {
  const panel = document.querySelector<HTMLElement>("[data-tts-panel]");
  if (!panel || panel.dataset.ready === "true") return;
  panel.dataset.ready = "true";

  const find = <T extends HTMLElement>(sel: string) => panel.querySelector<T>(sel);
  const playBtn = find<HTMLButtonElement>('[data-tts="play"]');
  const pauseBtn = find<HTMLButtonElement>('[data-tts="pause"]');
  const resumeBtn = find<HTMLButtonElement>('[data-tts="resume"]');
  const stopBtn = find<HTMLButtonElement>('[data-tts="stop"]');
  const rateInput = find<HTMLInputElement>("[data-tts-rate]");
  const rateOutput = find<HTMLElement>("[data-tts-rate-value]");
  const voiceSelect = find<HTMLSelectElement>("[data-tts-voice]");
  const titleOnlyInput = find<HTMLInputElement>("[data-tts-title-only]");
  const statusEl = find<HTMLElement>("[data-tts-status]");

  const showMessage = (text: string) => {
    if (statusEl) statusEl.textContent = text;
  };

  if (!SUPPORTED) {
    for (const el of [playBtn, pauseBtn, resumeBtn, stopBtn, rateInput, voiceSelect, titleOnlyInput]) {
      if (el) el.disabled = true;
    }
    showMessage("Browser ini tidak mendukung pembacaan suara.");
    return;
  }

  const LABELS: Record<PlayState, string> = {
    idle: "Siap dibacakan.",
    playing: "Sedang membacakan…",
    paused: "Dijeda.",
  };

  const render = (state: PlayState) => {
    if (playBtn) playBtn.disabled = state !== "idle";
    if (pauseBtn) pauseBtn.disabled = state !== "playing";
    if (resumeBtn) resumeBtn.disabled = state !== "paused";
    if (stopBtn) stopBtn.disabled = state === "idle";
    showMessage(LABELS[state]);
  };

  onState = render;

  playBtn?.addEventListener("click", () => {
    if (!play()) showMessage("Tidak ada teks yang bisa dibacakan di halaman ini.");
  });
  pauseBtn?.addEventListener("click", () => pause());
  resumeBtn?.addEventListener("click", () => resume());
  stopBtn?.addEventListener("click", () => stop());

  if (rateInput && rateOutput) {
    rateInput.min = String(RATE.min);
    rateInput.max = String(RATE.max);
    rateInput.step = String(RATE.step);
    rateInput.value = String(rate);
    rateOutput.textContent = rate.toFixed(1);

    rateInput.addEventListener("input", () => {
      rateOutput.textContent = setRate(Number(rateInput.value)).toFixed(1);
    });
  }

  // Daftar suara diisi ulang saat browser selesai memuat suara (asinkron di Chrome)
  const fillVoices = () => {
    if (!voiceSelect) return;
    const options = getVoiceOptions();
    voiceSelect.replaceChildren(new Option("Otomatis (sesuai bahasa)", ""));
    for (const v of options) {
      voiceSelect.add(new Option(`${v.name} (${v.lang})`, v.voiceURI));
    }
    voiceSelect.value = voiceURI ?? "";
  };

  fillVoices();
  speechSynthesis.onvoiceschanged = fillVoices;

  voiceSelect?.addEventListener("change", () => setVoice(voiceSelect.value || null));

  if (titleOnlyInput) {
    titleOnlyInput.checked = titleOnly;
    titleOnlyInput.addEventListener("change", () => setTitleOnly(titleOnlyInput.checked));
  }

  render(playState);
}

// ----- Pembersihan saat navigasi -----
if (typeof window !== "undefined") {
  document.addEventListener("astro:before-swap", () => stop());
  window.addEventListener("pagehide", () => stop());
}
