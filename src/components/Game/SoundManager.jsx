class SoundManager {
    constructor() {
      this.sounds = {};
      this.muted = false;
      this.initialized = false;
      this.volume = 0.5;
      this.bgmVolume = 0.3;
    }
  
    init() {
      if (this.initialized) return;
      
      // Create audio elements
      this.sounds = {
        match: new Audio(),
        swap: new Audio(),
        fall: new Audio(),
        gameOver: new Audio(),
        levelUp: new Audio(),
        select: new Audio(),
        start: new Audio(),
        bgm: new Audio()
      };
  
      // Set up audio - since we don't have actual files,
      // we'll generate simple audio using Web Audio API
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create placeholder sounds
      this.generateSounds();
      
      // Loop background music
      this.sounds.bgm.loop = true;
      this.sounds.bgm.volume = this.bgmVolume;
      
      this.initialized = true;
    }
  
    generateSounds() {
      // Generate placeholder sounds using Web Audio API
      this.generateSelectSound();
      this.generateSwapSound();
      this.generateMatchSound();
      this.generateFallSound();
      this.generateLevelUpSound();
      this.generateGameOverSound();
      this.generateStartSound();
      this.generateBgmSound();
    }
  
    generateSelectSound() {
      const audioCtx = this.audioContext;
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
      
      // Record the sound
      this.recordSound(audioCtx, gainNode, 0.2, 'select');
    }
  
    generateSwapSound() {
      const audioCtx = this.audioContext;
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(660, audioCtx.currentTime); // E5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15); // A4
      
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
      
      // Record the sound
      this.recordSound(audioCtx, gainNode, 0.2, 'swap');
    }
  
    generateMatchSound() {
      const audioCtx = this.audioContext;
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.4);
      
      // Record the sound
      this.recordSound(audioCtx, gainNode, 0.4, 'match');
    }
  
    generateFallSound() {
      const audioCtx = this.audioContext;
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3); // A4
      
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
      
      // Record the sound
      this.recordSound(audioCtx, gainNode, 0.3, 'fall');
    }
  
    generateLevelUpSound() {
      const audioCtx = this.audioContext;
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      oscillator.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.1); // C#5
      oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2); // E5
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.6);
      
      // Record the sound
      this.recordSound(audioCtx, gainNode, 0.6, 'levelUp');
    }
  
    generateGameOverSound() {
      const audioCtx = this.audioContext;
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.5); // A3
      
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
      
      // Record the sound
      this.recordSound(audioCtx, gainNode, 0.5, 'gameOver');
    }
  
    generateStartSound() {
      const audioCtx = this.audioContext;
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime + 0.1); // C5
      oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2); // E5
      oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
      
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
      
      // Record the sound
      this.recordSound(audioCtx, gainNode, 0.5, 'start');
    }
  
    generateBgmSound() {
      // Simple placeholder for background music
      // In a real app, you would load an actual audio file
      const audioCtx = this.audioContext;
      
      // We'll create a simple looping pattern
      const now = audioCtx.currentTime;
      let time = now;
      const notes = [440, 523.25, 659.25, 783.99, 659.25, 523.25]; // A4, C5, E5, G5, E5, C5
      const noteDuration = 0.2;
      const loopDuration = notes.length * noteDuration;
      
      // Create a buffer for our BGM
      const sampleRate = audioCtx.sampleRate;
      const buffer = audioCtx.createBuffer(1, sampleRate * loopDuration, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Fill the buffer with a simple melody pattern
      for (let i = 0; i < notes.length; i++) {
        const frequency = notes[i];
        const startSample = i * noteDuration * sampleRate;
        const endSample = startSample + noteDuration * sampleRate;
        
        for (let j = startSample; j < endSample; j++) {
          const t = (j - startSample) / sampleRate;
          data[j] = 0.2 * Math.sin(2 * Math.PI * frequency * t);
          
          // Apply simple envelope
          const envelopeProgress = (j - startSample) / (endSample - startSample);
          if (envelopeProgress < 0.1) {
            data[j] *= envelopeProgress * 10; // Attack
          } else if (envelopeProgress > 0.8) {
            data[j] *= (1 - envelopeProgress) * 5; // Release
          }
        }
      }
      
      // Create source from buffer and connect
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = this.bgmVolume;
      
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      // Instead of playing now, we'll save this setup for later
      this.bgmSetup = { source, gainNode };
    }
  
    recordSound(audioCtx, node, duration, soundName) {
      // This is a simplified simulation of recording sound
      // In a real app, you would use proper audio files
      
      // For our purposes, we'll just use a reference to replay the sound later
      this.sounds[soundName]._play = () => {
        // Create a new oscillator setup that matches the one we defined
        this.replaySound(soundName);
      };
    }
  
    replaySound(soundName) {
      // Re-generate the sound on demand
      const audioCtx = this.audioContext;
      
      switch (soundName) {
        case 'select':
          {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(this.volume * 0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.2);
          }
          break;
          
        case 'swap':
          {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(660, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15);
            
            gainNode.gain.setValueAtTime(this.volume * 0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.2);
          }
          break;
          
        case 'match':
          {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime);
            oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(this.volume * 0.3, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(this.volume * 0.3, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(this.volume * 0.3, audioCtx.currentTime + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.4);
          }
          break;
          
        case 'fall':
          {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(this.volume * 0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.3);
          }
          break;
          
        case 'levelUp':
          {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
            oscillator.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(this.volume * 0.2, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(this.volume * 0.2, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(this.volume * 0.2, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(this.volume * 0.3, audioCtx.currentTime + 0.3);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.6);
          }
          break;
          
        case 'gameOver':
          {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(this.volume * 0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
          }
          break;
          
        case 'start':
          {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
            oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(this.volume * 0.2, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(this.volume * 0.2, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(this.volume * 0.2, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(this.volume * 0.3, audioCtx.currentTime + 0.3);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
          }
          break;
          
        default:
          break;
      }
    }
  
    play(soundName) {
      if (this.muted || !this.initialized) return;
      
      const sound = this.sounds[soundName];
      if (sound && sound._play) {
        sound._play();
      }
    }
  
    stopAll() {
      if (!this.initialized) return;
      
      // Stop BGM
      if (this.bgmSetup && this.bgmSetup.source) {
        try {
          this.bgmSetup.source.stop();
        } catch (e) {
          console.log("BGM stop failed:", e);
        }
      }
    }
  
    playBgm() {
      if (this.muted || !this.initialized || !this.bgmSetup) return;
      
      // Create a new source (you can't reuse a stopped source)
      const audioCtx = this.audioContext;
      const source = audioCtx.createBufferSource();
      source.buffer = this.bgmSetup.source.buffer;
      source.loop = true;
      
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = this.bgmVolume;
      
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      source.start();
      
      // Update our reference
      this.bgmSetup.source = source;
      this.bgmSetup.gainNode = gainNode;
    }
  
    stopBgm() {
      if (!this.initialized || !this.bgmSetup) return;
      
      try {
        this.bgmSetup.source.stop();
      } catch (e) {
        console.log("BGM stop failed:", e);
      }
    }
  
    toggleMute() {
      this.muted = !this.muted;
      
      if (this.initialized && this.bgmSetup) {
        if (this.muted) {
          this.bgmSetup.gainNode.gain.value = 0;
        } else {
          this.bgmSetup.gainNode.gain.value = this.bgmVolume;
        }
      }
      
      return this.muted;
    }
  
    // Resume audio context on user interaction
    resume() {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
    }
  }
  
  // Singleton instance
  const soundManager = new SoundManager();
  export default soundManager;