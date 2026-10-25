import { PROJECT_COPY } from './project-copy.mjs';

// Only installed, local voices are used. No speech service or microphone is needed.
export class ChildGuide {
  constructor({ language, enabled, onStatus }) {
    this.language = language; this.enabled = enabled; this.onStatus = onStatus;
    this.pending = null; this.generation = 0;
    this.voicesChanged = () => {
      if (this.pending && this.enabled()) this.say(this.pending);
    };
    window.speechSynthesis?.addEventListener('voiceschanged', this.voicesChanged);
  }
  cancel() {
    this.pending = null; this.generation++;
    window.speechSynthesis?.cancel();
  }
  say(key) {
    this.cancel();
    if (!this.enabled() || document.hidden) return;
    const synth = window.speechSynthesis;
    if (!synth || !window.SpeechSynthesisUtterance) { this.onStatus('voiceUnavailable'); return; }
    const voices = synth.getVoices(), local = voices.filter(voice => voice.localService);
    const desired = this.language(), matches = prefix => local.find(voice => voice.lang.toLowerCase().startsWith(prefix));
    const voice = matches(desired) || matches('en');
    if (!voice) {
      if (!voices.length) this.pending = key;
      this.onStatus('voiceUnavailable'); return;
    }
    const voiceLang = voice.lang.toLowerCase().startsWith('ml') ? 'ml' : 'en';
    this.onStatus(desired === 'ml' && voiceLang !== 'ml' ? 'voiceFallback' : '');
    const copy = PROJECT_COPY[voiceLang];
    if (!copy[key]) return;
    const utterance = new SpeechSynthesisUtterance(copy[key] + (key.startsWith('ready') ? '. ' + copy.readyHint : ''));
    utterance.voice = voice; utterance.lang = voice.lang; utterance.rate = .88; utterance.pitch = 1.05; utterance.volume = .85;
    const generation = this.generation;
    utterance.onerror = event => {
      if (generation === this.generation && !['canceled', 'interrupted'].includes(event.error)) this.onStatus('voiceUnavailable');
    };
    try { synth.speak(utterance); } catch { this.onStatus('voiceUnavailable'); }
  }
}
