class SoundManager {
    constructor() {
      this.sounds = {};
      this.muted = false;
      this.initialized = false;
      this.volume = 0.5;
      this.bgmVolume = 0.3;
      this.audioContext = null;
      this.bgmSource = null;
      this.bgmBuffer = null;
      this.bgmGainNode = null;
      this.isPlaying = false;
    }
  
    // Initialize sound manager
    init() {
      if (this.initialized) return;
      
      try {
        // Create audio context
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        
        // Initialize sound references
        this.sounds = {
          match: { buffer: null },
          swap: { buffer: null },
          fall: { buffer: null },
          gameOver: { buffer: null },
          levelUp: { buffer: null },
          select: { buffer: null },
          start: { buffer: null }
        };
        
        // Generate sound effects
        this.generateSounds();
        
        this.initialized = true;
        console.log('Sound manager initialized successfully');
      } catch (e) {
        console.error('Error initializing sound manager:', e);
      }
    }
  
    // Generate sound effects
    generateSounds() {
      if (!this.audioContext) return;
      
      // Generate match sound (success sound)
      this.generateMatchSound();
      
      // Generate swap sound (quick tone)
      this.generateSwapSound();
      
      // Generate fall sound (woosh)
      this.generateFallSound();
      
      // Generate game over sound (descending tone)
      this.generateGameOverSound();
      
      // Generate level up sound (ascending jingle)
      this.generateLevelUpSound();
      
      // Generate select sound (click)
      this.generateSelectSound();
      
      // Generate start sound (startup jingle)
      this.generateStartSound();
      
      // Generate background music
      this.generateBackgroundMusic();
    }
  
    // Generate match sound (3+ blocks match)
    generateMatchSound() {
      const duration = 0.4;
      const sampleRate = this.audioContext.sampleRate;
      const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Create a bright arpeggio sound
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        
        // Play three notes in sequence (C, E, G)
        let note = 0;
        if (t < duration/3) {
          note = 261.63; // C4
        } else if (t < 2*duration/3) {
          note = 329.63; // E4
        } else {
          note = 392.00; // G4
        }
        
        // Simple waveform with envelope
        const envelope = Math.max(0, 1 - t / duration * 2);
        data[i] = 0.3 * Math.sin(2 * Math.PI * note * t) * envelope;
      }
      
      this.sounds.match.buffer = buffer;
    }
  
    // Generate swap sound
    generateSwapSound() {
      const duration = 0.2;
      const sampleRate = this.audioContext.sampleRate;
      const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Create a quick swoosh sound
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        
        // Frequency sweep from high to low
        const freq = 800 - 400 * (t / duration);
        
        // Simple envelope
        const envelope = Math.max(0, 1 - t / duration * 1.5);
        data[i] = 0.2 * Math.sin(2 * Math.PI * freq * t) * envelope;
      }
      
      this.sounds.swap.buffer = buffer;
    }
  
    // Generate fall sound
    generateFallSound() {
      const duration = 0.3;
      const sampleRate = this.audioContext.sampleRate;
      const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Create a falling sound
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        
        // Frequency sweep from high to low (falling effect)
        const freq = 600 - 400 * (t / duration);
        
        // Simple envelope with longer decay
        const envelope = Math.max(0, 1 - t / duration);
        data[i] = 0.2 * Math.sin(2 * Math.PI * freq * t) * envelope;
      }
      
      this.sounds.fall.buffer = buffer;
    }
  
    // Generate game over sound
    generateGameOverSound() {
      const duration = 1.0;
      const sampleRate = this.audioContext.sampleRate;
      const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Create a descending sad sound
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        
        // Multi-note descending sequence
        let note;
        if (t < duration/4) {
          note = 392.00; // G4
        } else if (t < duration/2) {
          note = 349.23; // F4
        } else if (t < 3*duration/4) {
          note = 329.63; // E4
        } else {
          note = 261.63; // C4
        }
        
        // Add some tremolo for sad effect
        const tremolo = 1 + 0.1 * Math.sin(2 * Math.PI * 8 * t);
        
        // Envelope with longer release
        const envelope = Math.max(0, 1 - t / duration);
        
        // Mix sawtooth and sine for richer sound
        const saw = ((t * note) % 1) * 2 - 1;
        const sine = Math.sin(2 * Math.PI * note * t);
        
        data[i] = 0.3 * (0.7 * sine + 0.3 * saw) * envelope * tremolo;
      }
      
      this.sounds.gameOver.buffer = buffer;
    }
  
    // Generate level up sound
    generateLevelUpSound() {
      const duration = 0.8;
      const sampleRate = this.audioContext.sampleRate;
      const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Create an ascending happy jingle
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        
        // Multi-note ascending sequence
        let note;
        if (t < duration/4) {
          note = 261.63; // C4
        } else if (t < duration/2) {
          note = 329.63; // E4
        } else if (t < 3*duration/4) {
          note = 392.00; // G4
        } else {
          note = 523.25; // C5
        }
        
        // Add some vibrato for happy effect
        const vibrato = 1 + 0.02 * Math.sin(2 * Math.PI * 12 * t);
        
        // Envelope with longer sustain
        let envelope;
        if (t < 3*duration/4) {
          envelope = Math.min(1, t * 8);
        } else {
          envelope = Math.max(0, 1 - (t - 3*duration/4) / (duration/4));
        }
        
        data[i] = 0.3 * Math.sin(2 * Math.PI * note * t * vibrato) * envelope;
      }
      
      this.sounds.levelUp.buffer = buffer;
    }
  
    // Generate select sound
    generateSelectSound() {
      const duration = 0.1;
      const sampleRate = this.audioContext.sampleRate;
      const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Create a simple click sound
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        
        // Quick frequency sweep
        const freq = 700 + 300 * (t / duration);
        
        // Very quick envelope
        const envelope = Math.max(0, 1 - t / duration * 3);
        data[i] = 0.2 * Math.sin(2 * Math.PI * freq * t) * envelope;
      }
      
      this.sounds.select.buffer = buffer;
    }
  
    // Generate start sound
    generateStartSound() {
      const duration = 0.6;
      const sampleRate = this.audioContext.sampleRate;
      const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Create a startup jingle
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        
        // Multi-note sequence
        let note;
        if (t < duration/4) {
          note = 261.63; // C4
        } else if (t < duration/2) {
          note = 329.63; // E4
        } else if (t < 3*duration/4) {
          note = 392.00; // G4
        } else {
          note = 523.25; // C5
        }
        
        // Simple envelope
        const envelope = Math.max(0, 1 - t / duration * 1.2);
        
        // Mix triangle and sine for fuller sound
        const triangle = 2 * Math.abs(2 * ((t * note) % 1) - 1) - 1;
        const sine = Math.sin(2 * Math.PI * note * t);
        
        data[i] = 0.3 * (0.6 * sine + 0.4 * triangle) * envelope;
      }
      
      this.sounds.start.buffer = buffer;
    }
  
    // Generate background music
    generateBackgroundMusic() {
      const duration = 8.0; // 8 second loop
      const sampleRate = this.audioContext.sampleRate;
      const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Simple 8-bit style background music
      const notes = [
        { freq: 261.63, duration: 0.25 }, // C4
        { freq: 329.63, duration: 0.25 }, // E4
        { freq: 392.00, duration: 0.25 }, // G4
        { freq: 523.25, duration: 0.25 }, // C5
        { freq: 392.00, duration: 0.25 }, // G4
        { freq: 329.63, duration: 0.25 }, // E4
        { freq: 261.63, duration: 0.25 }, // C4
        { freq: 329.63, duration: 0.25 }, // E4
        
        { freq: 293.66, duration: 0.25 }, // D4
        { freq: 349.23, duration: 0.25 }, // F4
        { freq: 440.00, duration: 0.25 }, // A4
        { freq: 523.25, duration: 0.25 }, // C5
        { freq: 440.00, duration: 0.25 }, // A4
        { freq: 349.23, duration: 0.25 }, // F4
        { freq: 293.66, duration: 0.25 }, // D4
        { freq: 349.23, duration: 0.25 }, // F4
        
        { freq: 261.63, duration: 0.25 }, // C4
        { freq: 329.63, duration: 0.25 }, // E4
        { freq: 392.00, duration: 0.25 }, // G4
        { freq: 523.25, duration: 0.25 }, // C5
        { freq: 392.00, duration: 0.25 }, // G4
        { freq: 329.63, duration: 0.25 }, // E4
        { freq: 261.63, duration: 0.25 }, // C4
        { freq: 329.63, duration: 0.25 }, // E4
        
        { freq: 246.94, duration: 0.25 }, // B3
        { freq: 293.66, duration: 0.25 }, // D4
        { freq: 392.00, duration: 0.25 }, // G4
        { freq: 493.88, duration: 0.25 }, // B4
        { freq: 392.00, duration: 0.25 }, // G4
        { freq: 293.66, duration: 0.25 }, // D4
        { freq: 246.94, duration: 0.25 }, // B3
        { freq: 293.66, duration: 0.25 }, // D4
      ];
      
      // Generate waveform for each note
      let time = 0;
      for (const note of notes) {
        const startSample = Math.floor(time * sampleRate);
        const endSample = Math.floor((time + note.duration) * sampleRate);
        
        for (let i = startSample; i < endSample; i++) {
          const t = (i - startSample) / sampleRate;
          
          // Envelope
          let envelope = 1;
          if (t < 0.05) {
            envelope = t / 0.05; // Attack
          } else if (t > note.duration - 0.05) {
            envelope = (note.duration - t) / 0.05; // Release
          }
          
          // Mix square and triangle waves for chiptune sound
          const square = Math.sign(Math.sin(2 * Math.PI * note.freq * t));
          const triangle = 2 * Math.abs(2 * ((t * note.freq) % 1) - 1) - 1;
          
          // Apply volume and envelope
          data[i] = 0.15 * (0.6 * square + 0.4 * triangle) * envelope;
        }
        
        time += note.duration;
      }
      
      // Add a simple bassline
      time = 0;
      const bassNotes = [
        { freq: 65.41, duration: 1.0 },  // C2
        { freq: 73.42, duration: 1.0 },  // D2
        { freq: 65.41, duration: 1.0 },  // C2
        { freq: 61.74, duration: 1.0 },  // B1
        { freq: 65.41, duration: 1.0 },  // C2
        { freq: 73.42, duration: 1.0 },  // D2
        { freq: 65.41, duration: 1.0 },  // C2
        { freq: 61.74, duration: 1.0 },  // B1
      ];
      
      for (const note of bassNotes) {
        const startSample = Math.floor(time * sampleRate);
        const endSample = Math.floor((time + note.duration) * sampleRate);
        
        for (let i = startSample; i < endSample; i++) {
          const t = (i - startSample) / sampleRate;
          
          // Simple envelope
          const envelope = Math.max(0, 1 - t / note.duration * 1.2);
          
          // Simple sine wave bass
          const bass = Math.sin(2 * Math.PI * note.freq * t);
          
          // Add to existing data (mix)
          if (i < buffer.length) {
            data[i] += 0.1 * bass * envelope;
          }
        }
        
        time += note.duration;
      }
      
      // Limit audio to prevent clipping
      for (let i = 0; i < buffer.length; i++) {
        data[i] = Math.max(-0.8, Math.min(0.8, data[i]));
      }
      
      this.bgmBuffer = buffer;
    }
  
    // Play a sound effect
    play(soundName) {
      if (this.muted || !this.initialized || !this.audioContext) return;
      
      try {
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
        
        const sound = this.sounds[soundName];
        if (sound && sound.buffer) {
          // Create source
          const source = this.audioContext.createBufferSource();
          source.buffer = sound.buffer;
          
          // Create gain node for volume control
          const gainNode = this.audioContext.createGain();
          gainNode.gain.value = this.volume;
          
          // Connect nodes
          source.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          
          // Play sound
          source.start();
        }
      } catch (e) {
        console.error(`Error playing sound ${soundName}:`, e);
      }
    }
  
    // Play background music
    playBgm() {
      if (this.muted || !this.initialized || !this.audioContext || !this.bgmBuffer || this.isPlaying) return;
      
      try {
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
        
        // Create source
        this.bgmSource = this.audioContext.createBufferSource();
        this.bgmSource.buffer = this.bgmBuffer;
        this.bgmSource.loop = true;
        
        // Create gain node for volume control
        this.bgmGainNode = this.audioContext.createGain();
        this.bgmGainNode.gain.value = this.muted ? 0 : this.bgmVolume;
        
        // Connect nodes
        this.bgmSource.connect(this.bgmGainNode);
        this.bgmGainNode.connect(this.audioContext.destination);
        
        // Play music
        this.bgmSource.start();
        this.isPlaying = true;
      } catch (e) {
        console.error('Error playing background music:', e);
      }
    }
  
    // Stop background music
    stopBgm() {
      if (!this.initialized || !this.bgmSource || !this.isPlaying) return;
      
      try {
        this.bgmSource.stop();
        this.isPlaying = false;
        this.bgmSource = null;
      } catch (e) {
        console.error('Error stopping background music:', e);
      }
    }
  
    // Stop all sounds
    stopAll() {
      this.stopBgm();
    }
  
    // Toggle mute
    toggleMute() {
      this.muted = !this.muted;
      
      if (this.bgmGainNode) {
        this.bgmGainNode.gain.value = this.muted ? 0 : this.bgmVolume;
      }
      
      return this.muted;
    }
  
    // Resume audio context
    resume() {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
    }
  }
  
  // Create singleton instance
  const soundManager = new SoundManager();
  export default soundManager;