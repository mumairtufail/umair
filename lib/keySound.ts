// Mechanical-keyboard sounds synthesized with Web Audio — no audio files to load.
// The AudioContext is created lazily on the first keypress (browsers require a user gesture).

let ctx: AudioContext | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function noise(ac: AudioContext) {
  if (!noiseBuf) {
    const len = Math.floor(ac.sampleRate * 0.06);
    noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  }
  return noiseBuf;
}

function click(ac: AudioContext, freq: number, gain: number, length: number) {
  const t = ac.currentTime;
  const src = ac.createBufferSource();
  src.buffer = noise(ac);
  src.playbackRate.value = 0.9 + Math.random() * 0.25;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq * (0.85 + Math.random() * 0.3);
  filter.Q.value = 1.4;
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + length);
  src.connect(filter).connect(g).connect(ac.destination);
  src.start(t);
  src.stop(t + length);

  // low "thock" of the key bottoming out
  const osc = ac.createOscillator();
  const og = ac.createGain();
  osc.frequency.value = 140 + Math.random() * 40;
  og.gain.setValueAtTime(gain * 0.35, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
  osc.connect(og).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.04);
}

function tone(ac: AudioContext, freq: number, at: number, length: number, gain = 0.07, type: OscillatorType = "sine") {
  const t = ac.currentTime + at;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + length + 0.02);
}

export type KeySound = "key" | "space" | "back" | "error" | "line" | "finish";

export function playKey(kind: KeySound) {
  try {
    const ac = audio();
    switch (kind) {
      case "key":
        return click(ac, 2400, 0.5, 0.05);
      case "space":
        return click(ac, 1100, 0.6, 0.08);
      case "back":
        return click(ac, 1600, 0.3, 0.04);
      case "error":
        click(ac, 2000, 0.35, 0.05);
        return tone(ac, 150, 0, 0.1, 0.06, "square");
      case "line":
        tone(ac, 880, 0, 0.12);
        return tone(ac, 1320, 0.07, 0.16);
      case "finish":
        [523, 659, 784, 1047].forEach((f, i) => tone(ac, f, i * 0.09, 0.25, 0.08));
        return;
    }
  } catch {
    // audio unavailable — typing still works silently
  }
}
