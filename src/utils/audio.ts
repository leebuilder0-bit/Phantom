/**
 * Synthesized Web Audio API Sound Effects + Bustling Rowdy Tavern Ambient Soundscape
 * Features:
 * - Multi-stream vowel-formant modulated tavern crowd chatter, banter & laughter ("吵闹人声鼎沸")
 * - Frequent stein clinks, draft beer foam pours & hearty glug-glug drinking sounds ("碰杯喝酒声")
 * - Warm stone hearth crackle + lively medieval tavern folk lute & wooden stomp pulse
 * Runs 100% in-browser with zero external audio file dependencies.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public ambientEnabled: boolean = true;
  public ambientVolume: number = 0.48;

  private isAmbienceRunning: boolean = false;
  private masterAmbientGain: GainNode | null = null;
  private activeAmbientNodes: Array<AudioScheduledSourceNode | AudioNode> = [];
  private bardIntervalId: number | null = null;
  private revelryIntervalId: number | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const savedSfx = localStorage.getItem('dark_tavern_sfx');
      if (savedSfx !== null) this.enabled = savedSfx === 'true';

      const savedAmb = localStorage.getItem('dark_tavern_ambience');
      if (savedAmb !== null) this.ambientEnabled = savedAmb === 'true';

      const savedVol = localStorage.getItem('dark_tavern_ambience_vol');
      if (savedVol !== null) this.ambientVolume = Math.max(0.05, Math.min(1, Number(savedVol)));

      // Auto-start bustling tavern ambience on first user interaction
      const unlockHandler = () => {
        if (this.ambientEnabled && !this.isAmbienceRunning) {
          this.startAmbience();
        }
        window.removeEventListener('pointerdown', unlockHandler);
        window.removeEventListener('keydown', unlockHandler);
      };
      window.addEventListener('pointerdown', unlockHandler, { passive: true });
      window.addEventListener('keydown', unlockHandler, { passive: true });
    }
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((x) => x !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleSfx(): boolean {
    this.enabled = !this.enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('dark_tavern_sfx', String(this.enabled));
    }
    if (this.enabled) {
      this.playCoin();
    }
    this.notify();
    return this.enabled;
  }

  public toggleAmbience(): boolean {
    this.ambientEnabled = !this.ambientEnabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('dark_tavern_ambience', String(this.ambientEnabled));
    }
    if (this.ambientEnabled) {
      this.startAmbience();
    } else {
      this.stopAmbience();
    }
    this.notify();
    return this.ambientEnabled;
  }

  public setAmbientVolume(vol: number) {
    this.ambientVolume = Math.max(0.05, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('dark_tavern_ambience_vol', String(this.ambientVolume));
    }
    if (this.masterAmbientGain && this.ctx) {
      this.masterAmbientGain.gain.setTargetAtTime(
        this.ambientEnabled ? this.ambientVolume * 0.42 : 0,
        this.ctx.currentTime,
        0.12
      );
    }
    this.notify();
  }

  public get isPlayingAmbience(): boolean {
    return this.isAmbienceRunning && this.ambientEnabled;
  }

  private createPinkNoiseBuffer(seconds = 5): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * seconds);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  /**
   * Starts the Bustling Rowdy Tavern Soundscape:
   * 1) Multi-stream formant-modulated Tavern Crowd Chatter & Hubbub (dozens of Meme patrons talking & laughing)
   * 2) Frequent Drinking Sounds: clinking wooden/glass mugs, fizzy beer pouring, hearty glug-glug swallowing & cheers
   * 3) Warm stone hearth fire + upbeat tavern folk lute & wooden foot-stomp pulse
   */
  public startAmbience() {
    if (!this.ambientEnabled || this.isAmbienceRunning) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isAmbienceRunning = true;
    const now = this.ctx.currentTime;

    const master = this.ctx.createGain();
    master.gain.setValueAtTime(0.001, now);
    master.gain.linearRampToValueAtTime(this.ambientVolume * 0.42, now + 0.9);
    master.connect(this.ctx.destination);
    this.masterAmbientGain = master;

    const pinkBuffer = this.createPinkNoiseBuffer(6);

    if (pinkBuffer) {
      // --- LAYER 1A: Warm Hearth & Wooden Hall Resonance ---
      const roomBed = this.ctx.createBufferSource();
      roomBed.buffer = pinkBuffer;
      roomBed.loop = true;
      const roomFilter = this.ctx.createBiquadFilter();
      roomFilter.type = 'lowpass';
      roomFilter.frequency.setValueAtTime(240, now);
      const roomGain = this.ctx.createGain();
      roomGain.gain.setValueAtTime(0.45, now);
      roomBed.connect(roomFilter);
      roomFilter.connect(roomGain);
      roomGain.connect(master);
      roomBed.start(now);
      this.activeAmbientNodes.push(roomBed, roomFilter, roomGain);

      // --- LAYER 1B: Bustling Tavern Crowd Walla (Baritone & Animated Pub Chatter) ---
      const crowdConfigs = [
        { rate: 0.96, f1: 430, f2: 1080, sylHz: 3.3, waveHz: 0.41, baseGain: 0.34 },
        { rate: 1.05, f1: 640, f2: 1620, sylHz: 4.5, waveHz: 0.57, baseGain: 0.28 },
      ];

      crowdConfigs.forEach((cfg) => {
        if (!this.ctx || !pinkBuffer) return;
        const src = this.ctx.createBufferSource();
        src.buffer = pinkBuffer;
        src.loop = true;
        src.playbackRate.setValueAtTime(cfg.rate, now);

        const formant1 = this.ctx.createBiquadFilter();
        formant1.type = 'bandpass';
        formant1.frequency.setValueAtTime(cfg.f1, now);
        formant1.Q.setValueAtTime(2.4, now);

        const formant2 = this.ctx.createBiquadFilter();
        formant2.type = 'bandpass';
        formant2.frequency.setValueAtTime(cfg.f2, now);
        formant2.Q.setValueAtTime(2.8, now);

        // Syllable-rate vowel shifting so noise sounds like lively animated tavern chatter
        const vowelLfo = this.ctx.createOscillator();
        const vowelDepth = this.ctx.createGain();
        vowelLfo.type = 'sine';
        vowelLfo.frequency.setValueAtTime(cfg.sylHz, now);
        vowelDepth.gain.setValueAtTime(135, now);
        vowelLfo.connect(vowelDepth);
        vowelDepth.connect(formant1.frequency);
        vowelDepth.connect(formant2.frequency);

        const streamGain = this.ctx.createGain();
        streamGain.gain.setValueAtTime(cfg.baseGain, now);

        // Conversational swell LFO
        const swellLfo = this.ctx.createOscillator();
        const swellDepth = this.ctx.createGain();
        swellLfo.type = 'triangle';
        swellLfo.frequency.setValueAtTime(cfg.waveHz, now);
        swellDepth.gain.setValueAtTime(0.11, now);
        swellLfo.connect(swellDepth);
        swellDepth.connect(streamGain.gain);

        src.connect(formant1);
        src.connect(formant2);
        formant1.connect(streamGain);
        formant2.connect(streamGain);
        streamGain.connect(master);

        src.start(now);
        vowelLfo.start(now);
        swellLfo.start(now);

        this.activeAmbientNodes.push(
          src,
          formant1,
          formant2,
          vowelLfo,
          vowelDepth,
          streamGain,
          swellLfo,
          swellDepth
        );
      });
    }

    // --- LAYER 2: Continuous Tavern Drinking, Mug Clinks, Draft Pours & Rowdy Laughter ---
    const triggerAmbientRevelryEvent = () => {
      if (!this.ambientEnabled || !this.ctx || !this.masterAmbientGain || this.ctx.state !== 'running') {
        return;
      }
      const roll = Math.random();
      if (roll < 0.32) {
        // Wooden & glass beer mugs clinking at a nearby table + oak table thud
        this.emitSteinClinkToNode(this.masterAmbientGain, 0.16);
      } else if (roll < 0.58) {
        // Hearty "glug-glug-glug" beer drinking sound
        this.emitGulpSequenceToNode(this.masterAmbientGain, 0.15);
      } else if (roll < 0.80) {
        // Rowdy burst of tavern crowd laughter / cheering ("Ha-ha-ha-hey!")
        this.emitCrowdLaughBurstToNode(this.masterAmbientGain, 0.14);
      } else {
        // Fizzy beer tap pouring into a wooden tankard
        this.emitDraftPourToNode(this.masterAmbientGain, 0.13);
      }
    };

    // Fire an immediate welcome clink + cheer right as ambience begins
    window.setTimeout(() => triggerAmbientRevelryEvent(), 250);
    this.revelryIntervalId = window.setInterval(triggerAmbientRevelryEvent, 1150);

    // --- LAYER 3: Upbeat Tavern Folk Lute & Soft Wooden Stomp ---
    const jigNotes = [146.83, 220.0, 261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 392.0, 329.63];
    const jigPattern = [0, 3, 5, 6, 7, 6, 5, 3, 2, 4, 6, 4, 3, 1, 3, 0];
    let stepIndex = 0;

    const pluckTavernLute = (freq: number, velocity = 0.09) => {
      if (!this.ctx || !this.masterAmbientGain || !this.ambientEnabled) return;
      const t = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const noteGain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(freq * 2, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1650, t);
      filter.frequency.exponentialRampToValueAtTime(340, t + 0.75);

      noteGain.gain.setValueAtTime(0.001, t);
      noteGain.gain.linearRampToValueAtTime(velocity, t + 0.018);
      noteGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.85);

      const overtoneGain = this.ctx.createGain();
      overtoneGain.gain.setValueAtTime(0.14, t);

      osc1.connect(filter);
      osc2.connect(overtoneGain);
      overtoneGain.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterAmbientGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.9);
      osc2.stop(t + 0.9);
    };

    const triggerWoodenBootStomp = (velocity = 0.08) => {
      if (!this.ctx || !this.masterAmbientGain || !this.ambientEnabled) return;
      const t = this.ctx.currentTime;
      const stompOsc = this.ctx.createOscillator();
      const stompGain = this.ctx.createGain();
      stompOsc.type = 'sine';
      stompOsc.frequency.setValueAtTime(112, t);
      stompOsc.frequency.exponentialRampToValueAtTime(46, t + 0.09);
      stompGain.gain.setValueAtTime(velocity, t);
      stompGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
      stompOsc.connect(stompGain);
      stompGain.connect(this.masterAmbientGain);
      stompOsc.start(t);
      stompOsc.stop(t + 0.12);
    };

    this.bardIntervalId = window.setInterval(() => {
      if (!this.ambientEnabled || !this.ctx || this.ctx.state !== 'running') return;
      const beat = stepIndex % jigPattern.length;
      stepIndex++;

      if (beat % 4 === 0) {
        triggerWoodenBootStomp(0.075);
      }
      if (Math.random() < 0.14) return;
      const freq = jigNotes[jigPattern[beat] % jigNotes.length];
      pluckTavernLute(freq, 0.08 + Math.random() * 0.03);
    }, 420);

    this.notify();
  }

  public stopAmbience() {
    if (this.bardIntervalId !== null) {
      clearInterval(this.bardIntervalId);
      this.bardIntervalId = null;
    }
    if (this.revelryIntervalId !== null) {
      clearInterval(this.revelryIntervalId);
      this.revelryIntervalId = null;
    }
    for (const node of this.activeAmbientNodes) {
      try {
        if ('stop' in node && typeof node.stop === 'function') {
          node.stop();
        }
        node.disconnect();
      } catch {
        // ignore cleanup errors
      }
    }
    this.activeAmbientNodes = [];

    if (this.masterAmbientGain) {
      try {
        this.masterAmbientGain.disconnect();
      } catch {
        // ignore
      }
      this.masterAmbientGain = null;
    }
    this.isAmbienceRunning = false;
    this.notify();
  }

  private emitSteinClinkToNode(dest: AudioNode, peakGain = 0.16) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const base = 860 + Math.random() * 260;

    // Clinking glass/wood tankard harmonics
    [base, base * 1.48, base * 2.15].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = idx === 2 ? 'sine' : 'triangle';
      const t0 = now + idx * 0.028;
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(peakGain / (idx + 1), t0);
      g.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.24);
      osc.connect(g);
      g.connect(dest);
      osc.start(t0);
      osc.stop(t0 + 0.26);
    });

    // Heavy wooden tankard set-down thud
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(165, now + 0.14);
    thud.frequency.exponentialRampToValueAtTime(58, now + 0.23);
    thudGain.gain.setValueAtTime(peakGain * 0.55, now + 0.14);
    thudGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.25);
    thud.connect(thudGain);
    thudGain.connect(dest);
    thud.start(now + 0.14);
    thud.stop(now + 0.26);
  }

  private emitGulpSequenceToNode(dest: AudioNode, peakGain = 0.16) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const gulps = 3 + Math.floor(Math.random() * 2);

    for (let i = 0; i < gulps; i++) {
      const t0 = now + i * 0.135;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(165, t0);
      osc.frequency.exponentialRampToValueAtTime(325, t0 + 0.055);
      osc.frequency.exponentialRampToValueAtTime(140, t0 + 0.105);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(480, t0);
      filter.Q.setValueAtTime(2.5, t0);

      g.gain.setValueAtTime(0.001, t0);
      g.gain.linearRampToValueAtTime(peakGain, t0 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.115);

      osc.connect(filter);
      filter.connect(g);
      g.connect(dest);

      osc.start(t0);
      osc.stop(t0 + 0.12);
    }
  }

  private emitDraftPourToNode(dest: AudioNode, peakGain = 0.13) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Fizzy foam head hiss
    const foamBuf = this.createPinkNoiseBuffer(0.5);
    if (foamBuf) {
      const src = this.ctx.createBufferSource();
      src.buffer = foamBuf;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1750, now);
      bp.frequency.linearRampToValueAtTime(950, now + 0.42);
      bp.Q.setValueAtTime(1.8, now);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(peakGain * 0.85, now + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0008, now + 0.45);

      src.connect(bp);
      bp.connect(g);
      g.connect(dest);
      src.start(now);
      src.stop(now + 0.46);
    }

    // Rising liquid bubbles filling the stein
    for (let i = 0; i < 4; i++) {
      const t0 = now + i * 0.085;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      const fStart = 230 + i * 48;
      osc.frequency.setValueAtTime(fStart, t0);
      osc.frequency.exponentialRampToValueAtTime(fStart + 165, t0 + 0.08);
      g.gain.setValueAtTime(peakGain * 0.65, t0);
      g.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.09);
      osc.connect(g);
      g.connect(dest);
      osc.start(t0);
      osc.stop(t0 + 0.095);
    }
  }

  private emitCrowdLaughBurstToNode(dest: AudioNode, peakGain = 0.14) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bursts = 4;
    const basePitch = 155 + Math.random() * 85;

    // Rhythmic "Ha-ha-ha-hey!" vocal formant bursts simulating a rowdy table laugh/cheer
    for (let i = 0; i < bursts; i++) {
      const t0 = now + i * 0.115;
      const osc = this.ctx.createOscillator();
      const formant = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();

      osc.type = 'sawtooth';
      const pitch = basePitch * (i === bursts - 1 ? 1.18 : 1 - i * 0.04);
      osc.frequency.setValueAtTime(pitch, t0);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.86, t0 + 0.095);

      formant.type = 'bandpass';
      formant.frequency.setValueAtTime(720 + Math.random() * 340, t0);
      formant.Q.setValueAtTime(3.2, t0);

      g.gain.setValueAtTime(0.001, t0);
      g.gain.linearRampToValueAtTime(peakGain * 0.72, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.1);

      osc.connect(formant);
      formant.connect(g);
      g.connect(dest);

      osc.start(t0);
      osc.stop(t0 + 0.105);
    }
  }

  playMugClink() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    this.emitSteinClinkToNode(this.ctx.destination, 0.22);
  }

  playHeartyGulp() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    this.emitGulpSequenceToNode(this.ctx.destination, 0.2);
  }

  playCrowdCheer() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    this.emitCrowdLaughBurstToNode(this.ctx.destination, 0.18);
  }

  playPour() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    this.emitDraftPourToNode(this.ctx.destination, 0.18);
  }

  playCauldronBoil() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const startFreq = 120 + Math.random() * 90;
      osc.frequency.setValueAtTime(startFreq, now + i * 0.06);
      osc.frequency.exponentialRampToValueAtTime(startFreq + 180, now + i * 0.06 + 0.12);

      gain.gain.setValueAtTime(0.1, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.15);
    }
  }

  playCoin() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now);
    osc2.frequency.setValueAtTime(1318.51, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.08);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.35);
  }

  playAppleBite() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.3);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  playHalloweenChime() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 466.16, 523.25, 415.3];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.16);
      gain.gain.setValueAtTime(0.09, now + idx * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.16 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.16);
      osc.stop(now + idx * 0.16 + 0.45);
    });
  }

  playDoorOpen() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const creakOsc = this.ctx.createOscillator();
    const creakFilter = this.ctx.createBiquadFilter();
    const creakGain = this.ctx.createGain();

    creakOsc.type = 'sawtooth';
    creakOsc.frequency.setValueAtTime(115, now);
    creakOsc.frequency.linearRampToValueAtTime(168, now + 0.22);
    creakOsc.frequency.linearRampToValueAtTime(98, now + 0.48);

    creakFilter.type = 'bandpass';
    creakFilter.frequency.setValueAtTime(420, now);
    creakFilter.Q.value = 3.5;

    creakGain.gain.setValueAtTime(0.001, now);
    creakGain.gain.linearRampToValueAtTime(0.09, now + 0.08);
    creakGain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);

    creakOsc.connect(creakFilter);
    creakFilter.connect(creakGain);
    creakGain.connect(this.ctx.destination);

    creakOsc.start(now);
    creakOsc.stop(now + 0.54);

    [0.28, 0.48].forEach((offset) => {
      if (!this.ctx) return;
      const stepOsc = this.ctx.createOscillator();
      const stepGain = this.ctx.createGain();
      stepOsc.type = 'sine';
      stepOsc.frequency.setValueAtTime(95, now + offset);
      stepOsc.frequency.exponentialRampToValueAtTime(42, now + offset + 0.09);
      stepGain.gain.setValueAtTime(0.11, now + offset);
      stepGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
      stepOsc.connect(stepGain);
      stepGain.connect(this.ctx.destination);
      stepOsc.start(now + offset);
      stepOsc.stop(now + offset + 0.11);
    });
  }

  playDiceRoll() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [0, 0.07, 0.15, 0.24, 0.35].forEach((offset, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620 + idx * 95, now + offset);
      osc.frequency.exponentialRampToValueAtTime(240, now + offset + 0.05);
      gain.gain.setValueAtTime(0.11, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.055);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.06);
    });
  }

  playTreasureOpen() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const arpeggio = [523.25, 659.25, 783.99, 1046.5];
    arpeggio.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.42);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.45);
    });
  }
}

export const sound = new SoundController();
