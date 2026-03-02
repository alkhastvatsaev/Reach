"use client";

import React, { useState, useEffect, useRef } from 'react';

const arabicAlphabet = [
  { char: 'ا', name: 'Alif', keywords: ['ا', 'أ', 'إ', 'آ', 'alif', 'ألف', 'halif', 'alice', 'a leaf', 'leaf', 'lif'] },
  { char: 'ب', name: 'Ba', keywords: ['ب', 'ba', 'baa', 'باء', 'bas', 'bah', 'bat'] },
  { char: 'ت', name: 'Ta', keywords: ['ت', 'ta', 'taa', 'تاء', 'tas', 'tard', 'top'] },
  { char: 'ث', name: 'Tha', keywords: ['ث', 'tha', 'sa', 'ثاء', 'ça', 'saw', 'the'] },
  { char: 'ج', name: 'Jiim', keywords: ['ج', 'jim', 'djim', 'jeem', 'جيم', 'gym', 'dj'] },
  { char: 'ح', name: 'Ha', keywords: ['ح', 'ha', 'haa', 'حاء', 'h', 'ah', 'as'] },
  { char: 'خ', name: 'Kha', keywords: ['خ', 'kha', 'ra', 'خاء', 'k', 'ras'] },
  { char: 'د', name: 'Dal', keywords: ['د', 'dal', 'daal', 'دال', 'dalle', 'doll'] },
  { char: 'ذ', name: 'Dhal', keywords: ['ذ', 'dhal', 'zal', 'ذال', 'zall', 'val', 'zappe'] },
  { char: 'ر', name: 'Ra', keywords: ['ر', 'ra', 'raa', 'راء', 'ras', 'rat', 'raw'] },
  { char: 'ز', name: 'Zay', keywords: ['ز', 'zay', 'za', 'zayn', 'زاي', 'زين', 'z', 'zoo'] },
  { char: 'س', name: 'Siin', keywords: ['س', 'sin', 'siin', 'seen', 'سين', 'cygne', 'signe', 'scene'] },
  { char: 'ش', name: 'Shiin', keywords: ['ش', 'shin', 'chin', 'sheen', 'شين', 'chine'] },
  { char: 'ص', name: 'Saad', keywords: ['ص', 'sad', 'saad', 'صاد', 'sade', 'sod'] },
  { char: 'ض', name: 'Daad', keywords: ['ض', 'dad', 'dod', 'daad', 'ضاد', 'dade'] },
  { char: 'ط', name: 'Ta', keywords: ['ط', 'ta', 'to', 'taa', 'طاء', 'tah'] },
  { char: 'ظ', name: 'Za', keywords: ['ظ', 'za', 'zo', 'zaa', 'ظاء', 'zah'] },
  { char: 'ع', name: 'Ayn', keywords: ['ع', 'ain', 'ayn', 'عين', 'aine', 'eye', 'haine'] },
  { char: 'غ', name: 'Ghayn', keywords: ['غ', 'ghain', 'rhain', 'ghayn', 'غين', 'raine', 'gain'] },
  { char: 'ف', name: 'Fa', keywords: ['ف', 'fa', 'faa', 'فاء', 'f', 'femme', 'far'] },
  { char: 'ق', name: 'Qaaf', keywords: ['ق', 'qaf', 'kaf', 'qaaf', 'قاف', 'caf', 'cough'] },
  { char: 'ك', name: 'Kaaf', keywords: ['ك', 'kaf', 'kef', 'kaaf', 'كاف', 'calf', 'k'] },
  { char: 'ل', name: 'Laam', keywords: ['ل', 'lam', 'laam', 'لام', 'lame', 'l\'âme', 'lamb'] },
  { char: 'م', name: 'Miim', keywords: ['م', 'mim', 'meem', 'ميم', 'mime', 'meme'] },
  { char: 'ن', name: 'Nuun', keywords: ['ن', 'nun', 'noun', 'noon', 'nuun', 'نون', 'noune'] },
  { char: 'ه', name: 'Ha', keywords: ['ه', 'ha', 'haa', 'هاء', 'hah'] },
  { char: 'و', name: 'Waw', keywords: ['و', 'waw', 'waaw', 'واو', 'ouaou', 'waouh', 'wow'] },
  { char: 'ي', name: 'Ya', keywords: ['ي', 'ya', 'yaa', 'ياء', 'y\'a', 'y', 'yeah'] },
];

export default function AlphabetPage() {
  const [isStarted, setIsStarted] = useState(false);
  const [foundLetters, setFoundLetters] = useState<string[]>([]);
  const foundLettersRef = useRef<string[]>([]);
  
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugText, setDebugText] = useState("");

  // Refs for Web Audio API
  const audioContextRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isSpeakingRef = useRef(false);
  const silenceTimerRef = useRef<any>(null);
  const isComponentMounted = useRef(true);

  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch(e) {}
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const evaluateWhisperText = (transcript: string) => {
    const text = transcript.toLowerCase().trim();
    if (!text) return;
    
    setDebugText(text);

    const cleanTextForWords = text.replace(/[,.!?،؛]/g, '');
    const words = cleanTextForWords.split(/\s+/);
    
    let newFoundArray = [...foundLettersRef.current];
    let letterDetected = false;
    
    arabicAlphabet.forEach(letter => {
        if (newFoundArray.includes(letter.char)) return;

        let isMatch = false;
        letter.keywords.forEach(kw => {
            const lowerKw = kw.toLowerCase();
            if (words.includes(lowerKw)) isMatch = true;
            if (cleanTextForWords === lowerKw) isMatch = true;
        });
        
        if (isMatch) {
            newFoundArray.push(letter.char);
            letterDetected = true;
        }
    });
    
    if (letterDetected && isComponentMounted.current) {
        foundLettersRef.current = newFoundArray;
        setFoundLetters([...newFoundArray]);
    }
  };

  const sendToWhisper = async (audioBlob: Blob) => {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append("file", audioBlob);

      try {
          const res = await fetch("/api/whisper", {
              method: "POST",
              body: formData
          });

          if (res.ok) {
              const data = await res.json();
              if (data.text) evaluateWhisperText(data.text);
          } else {
              setDebugText("Erreur avec l'API Whisper");
          }
      } catch (err) {
          console.error("Whisper Request Error", err);
          setDebugText("Erreur de connexion...");
      } finally {
          setIsProcessing(false);
      }
  };

  const initAudio = async () => {
      setIsStarted(true);
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;

          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const audioContext = new AudioContext();
          audioContextRef.current = audioContext;

          const microphone = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 512;
          analyser.minDecibels = -80; // Plus grande plage de détection
          analyser.smoothingTimeConstant = 0.2; // Très réactif
          microphone.connect(analyser);
          
          const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (e) => {
              if (e.data.size > 0) {
                  audioChunksRef.current.push(e.data);
              }
          };

          mediaRecorder.onstop = () => {
              if (audioChunksRef.current.length > 0) {
                  const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                  audioChunksRef.current = [];
                  sendToWhisper(blob);
              }
          };

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          
          const checkAudioLevel = () => {
              if (!isComponentMounted.current) return;
              
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              let max = 0;
              for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i];
                  if (dataArray[i] > max) max = dataArray[i];
              }
              const average = sum / dataArray.length;
              
              // Sensibilité augmentée: On accepte soit une moyenne basse, soit un pic passager (max)
              const isCurrentlySpeaking = average > 2 || max > 10;
              
              if (isCurrentlySpeaking) {
                  if (!isSpeakingRef.current) {
                      isSpeakingRef.current = true;
                      setIsListening(true);
                      
                      if (mediaRecorderRef.current?.state === 'inactive') {
                          audioChunksRef.current = [];
                          mediaRecorderRef.current.start();
                      }
                      if (silenceTimerRef.current) {
                          clearTimeout(silenceTimerRef.current);
                      }
                  } else {
                      if (silenceTimerRef.current) {
                          clearTimeout(silenceTimerRef.current);
                      }
                  }
              } else {
                  if (isSpeakingRef.current) {
                      if (!silenceTimerRef.current) {
                          silenceTimerRef.current = setTimeout(() => {
                              isSpeakingRef.current = false;
                              setIsListening(false);
                              if (mediaRecorderRef.current?.state === 'recording') {
                                  mediaRecorderRef.current.stop();
                              }
                              silenceTimerRef.current = null;
                          }, 1200); // Stop after 1.2 seconds of silence
                      }
                  }
              }

              requestAnimationFrame(checkAudioLevel);
          };
          
          checkAudioLevel();

      } catch (err) {
          console.error("Audio initialization failed", err);
          alert("Impossible d'accéder au microphone.");
      }
  };

  return (
    <div style={{minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0a0a0a', color: 'white'}}>
      
      {!isStarted && (
        <div onClick={initAudio} style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer'
        }}>
          <div style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              padding: '20px 40px', borderRadius: '100px', fontWeight: 700,
              fontSize: '1.2rem', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
              display: 'flex', alignItems: 'center', gap: '15px'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            Activer l'IA Whisper
          </div>
          <p style={{marginTop: '20px', color: '#888'}}>Touchez n'importe où pour démarrer la reconnaissance continue</p>
        </div>
      )}

      <div style={{width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: 'calc(20px + env(safe-area-inset-top))'}}>
        <a href="/" style={{
          display: 'flex', alignItems: 'center', gap: '8px', 
          background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '100px', 
          textDecoration: 'none', color: 'white', border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour
        </a>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <div style={{
            width: '12px', height: '12px', borderRadius: '50%',
            background: isListening ? '#fc3c44' : (isProcessing ? '#3b82f6' : '#555'),
            boxShadow: isListening ? '0 0 10px #fc3c44' : (isProcessing ? '0 0 10px #3b82f6' : 'none'),
            transition: '0.3s all'
          }}></div>
          <span style={{fontSize: '0.9rem', color: '#888'}}>
              {isListening ? 'Enregistrement...' : isProcessing ? 'Analyse Whisper...' : 'En attente de voix...'}
          </span>
        </div>
      </div>

      <div style={{width: '100%', maxWidth: '1000px', textAlign: 'center', marginBottom: '30px'}}>
        <h1 style={{fontSize: '2.5rem', fontWeight: 800, marginBottom: '10px', background: '-webkit-linear-gradient(45deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Alphabet Arabe Master</h1>
        <p style={{color: '#888'}}>Prononcez une lettre, Whisper IA l'analyse et l'allume sur la grille.</p>
        
        <div style={{marginTop: '20px', minHeight: '40px', color: '#aaa', fontSize: '1rem', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
          {isProcessing && (
              <svg width="18" height="18" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" style={{animation: 'spin 1s linear infinite'}}>
                  <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeOpacity="0.2"/>
                  <path d="M12 2a10 10 0 0 1 10 10"/>
                  <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              </svg>
          )}
          {debugText ? `Dernière détection : "${debugText}"` : "Le micro intelligent vous écoute en continu..."}
        </div>
      </div>

      <div style={{width: '100%', maxWidth: '1000px'}}>
        <div style={{
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
          gap: '15px',
        }}>
          {arabicAlphabet.map((l) => {
            const isFound = foundLetters.includes(l.char);
            return (
              <div 
                key={l.char}
                style={{
                  background: isFound ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)', 
                  border: `2px solid ${isFound ? '#10b981' : 'rgba(255,255,255,0.08)'}`, 
                  borderRadius: '16px', 
                  padding: '25px 10px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  transition: '0.3s all cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isFound ? '0 0 20px rgba(16, 185, 129, 0.2)' : 'none',
                  transform: isFound ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <span style={{fontFamily: 'var(--font-arabic)', fontSize: '3rem', color: isFound ? '#10b981' : '#fff', transition: '0.3s color'}}>{l.char}</span>
                <span style={{fontSize: '0.8rem', textTransform: 'uppercase', color: isFound ? '#10b981' : '#666', marginTop: '10px', fontWeight: 700, transition: '0.3s color'}}>{l.name}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {foundLetters.length > 0 && (
          <button 
            onClick={() => {
                foundLettersRef.current = [];
                setFoundLetters([]);
            }}
            style={{
                marginTop: '40px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '100px',
                cursor: 'pointer'
            }}
          >
            Réinitialiser la progression
          </button>
      )}
    </div>
  );
}
