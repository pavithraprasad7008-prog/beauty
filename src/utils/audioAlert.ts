/**
 * Synthesizes a high-fidelity beauty salon doorbell alert chime (multi-tone G-chord)
 * and narrates the customer's booking detail using browser Speech Synthesis.
 */
export function playBeauticianAudioAlert(customerName: string, date: string, timeSlot: string) {
  try {
    // 1. Play professional multi-tone synthesizer chime (Alert Chime) using Web Audio API
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();

      // Core oscillator sound nodes for a luxurious beauty check melody (C5 -> E5 -> G5)
      const playTone = (frequency: number, delayRatio: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, ctx.currentTime + delayRatio);
        
        gain.gain.setValueAtTime(0, ctx.currentTime + delayRatio);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + delayRatio + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delayRatio + duration);
        
        osc.start(ctx.currentTime + delayRatio);
        osc.stop(ctx.currentTime + delayRatio + duration);
      };

      // Play C-major arpeggio chime representing active booking arrival
      playTone(523.25, 0.0, 0.35);    // C5
      playTone(659.25, 0.08, 0.35);   // E5
      playTone(783.99, 0.16, 0.45);   // G5 (highest accent note)
    }
  } catch (error) {
    console.warn("Web Audio API was either blocked by autoplay security policy or not supported in this frame:", error);
  }

  // 2. Clear previous speech and announce the ticket arrival through SpeechSynthesis
  try {
    if ('speechSynthesis' in window) {
      // Immediate announcement dispatch
      window.speechSynthesis.cancel();
      
      const readableDate = new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
      });
      
      const welcomeSentence = `Beautician Alert! A new salon booking has been registered for client ${customerName}, scheduled on ${readableDate} at ${timeSlot}. The appointment is now updated live in your Manage Bookings screen.`;
      
      const utterance = new SpeechSynthesisUtterance(welcomeSentence);
      utterance.rate = 0.94; // Premium cadence
      utterance.pitch = 1.05; // Friendly pitch
      utterance.volume = 1.0;

      // Select high quality Indian accented English voice or general English voice if found
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const matchingVoice = 
          voices.find(v => v.lang.includes('en-IN')) || 
          voices.find(v => v.lang.includes('en-GB')) || 
          voices.find(v => v.lang.includes('en-US')) || 
          voices[0];
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }
      
      window.speechSynthesis.speak(utterance);
    }
  } catch (err) {
    console.warn("Speech Synthesis support error in customer sandbox frame:", err);
  }
}
