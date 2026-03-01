"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const arabicAlphabet = [
  { char: 'ا', name: 'Alif', type: 'norm' },
  { char: 'ب', name: 'Ba', type: 'qalqalah' },
  { char: 'ت', name: 'Ta', type: 'norm' },
  { char: 'ث', name: 'Tha', type: 'norm' },
  { char: 'ج', name: 'Jiim', type: 'qalqalah' },
  { char: 'ح', name: 'Ha', type: 'norm' },
  { char: 'خ', name: 'Kha', type: 'norm' },
  { char: 'د', name: 'Dal', type: 'qalqalah' },
  { char: 'ذ', name: 'Dhal', type: 'norm' },
  { char: 'ر', name: 'Ra', type: 'norm' },
  { char: 'ز', name: 'Zay', type: 'norm' },
  { char: 'س', name: 'Siin', type: 'norm' },
  { char: 'ش', name: 'Shiin', type: 'norm' },
  { char: 'ص', name: 'Saad', type: 'norm' },
  { char: 'ض', name: 'Daad', type: 'norm' },
  { char: 'ط', name: 'Ta', type: 'qalqalah' },
  { char: 'ظ', name: 'Za', type: 'norm' },
  { char: 'ع', name: 'Ayn', type: 'norm' },
  { char: 'غ', name: 'Ghayn', type: 'norm' },
  { char: 'ف', name: 'Fa', type: 'norm' },
  { char: 'ق', name: 'Qaaf', type: 'qalqalah' },
  { char: 'ك', name: 'Kaaf', type: 'norm' },
  { char: 'ل', name: 'Laam', type: 'norm' },
  { char: 'م', name: 'Miim', type: 'ghunnah' },
  { char: 'ن', name: 'Nuun', type: 'ghunnah' },
  { char: 'ه', name: 'Ha', type: 'norm' },
  { char: 'و', name: 'Waw', type: 'norm' },
  { char: 'ي', name: 'Ya', type: 'norm' },
];

export default function AlphabetPage() {
  const [activeLetter, setActiveLetter] = useState<{char: string, name: string} | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<{text: string, type: 'success'|'error'|'info'}>({text: "Écoute en cours... 🎤 Prononcez n'importe quelle lettre.", type: 'info'});
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialiser la reconnaissance vocale
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'ar-SA';
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        evaluatePronunciation(transcript.trim());
      };

      rec.onerror = (e: any) => {
        console.error("Erreur reco:", e.error);
        if (e.error !== 'aborted') {
          setFeedback({text: `Erreur micro: ${e.error}`, type: 'error'});
          setIsRecording(false);
        }
      };

      rec.onend = () => {
        // Toujours relancer si on essaye d'écouter en continu (sauf erreur critique)
        try {
          recognitionRef.current?.start();
          setIsRecording(true);
        } catch (e) {
          console.error("Failed to restart recognition", e);
          setIsRecording(false);
        }
      };

      recognitionRef.current = rec;
      
      // Démarrage auto au chargement de la page
      try {
        rec.start();
        setIsRecording(true);
      } catch (e) {
         console.warn("Already started", e);
      }
    } else {
      setFeedback({text: "Votre navigateur ne supporte pas la reconnaissance vocale.", type: 'error'});
    }

    return () => {
      // Nettoyage à la sortie de la page
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
    };
  }, []); // Only run once on mount

  const speakLetter = (char: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(char);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.5;
    window.speechSynthesis.speak(utterance);
  };

  const handleLetterClick = (char: string) => {
    speakLetter(char);
  };

  const evaluatePronunciation = (transcript: string) => {
    if (!transcript) return;
    
    const cleanWord = transcript.replace(/[^\u0600-\u06FF]/g, '').trim(); 
    const lowerTranscript = transcript.toLowerCase();

    // Check if the transcript matches any letter in the alphabet
    let detectedLetter = null;
    
    // First, try to match the exact Arabic character
    detectedLetter = arabicAlphabet.find(l => cleanWord.includes(l.char));
    
    // Fallback, try to match by name (transliteration) if the AI recognized French/English text
    if (!detectedLetter) {
        detectedLetter = arabicAlphabet.find(l => lowerTranscript.includes(l.name.toLowerCase()));
    }

    const currentDetectedChar = detectedLetter?.char;

    if (detectedLetter) {
        setActiveLetter(detectedLetter);
        setFeedback({text: `✅ Magnifique ! J'ai entendu la lettre « ${detectedLetter.name} » (${detectedLetter.char}). Prononcez-en une autre !`, type: 'success'});
        
        // Remove highlighting after 3 seconds so user can try again clearly
        setTimeout(() => {
            setActiveLetter(current => current?.char === currentDetectedChar ? null : current);
        }, 3000);
    }
  };

  return (
    <div style={{minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg)', color: 'white'}}>
      {/* Header local pour la page */}
      <div style={{width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: 'calc(20px + env(safe-area-inset-top))'}}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: '8px', 
          background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '100px', 
          textDecoration: 'none', color: 'white', border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour aux Sourates
        </Link>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: isRecording ? '#fc3c44' : '#555',
            boxShadow: isRecording ? '0 0 10px #fc3c44' : 'none',
            animation: isRecording ? 'pulse 1.5s infinite' : 'none'
          }}></div>
          <span style={{fontSize: '0.9rem', color: 'var(--subtext)'}}>{isRecording ? 'Écoute active...' : 'Microphone inactif'}</span>
        </div>
      </div>

      {/* Barre de feedback */}
      <div style={{
        marginTop: '10px', marginBottom: '30px',
        padding: '15px 20px', 
        borderRadius: '16px', 
        width: '100%', maxWidth: '1000px',
        textAlign: 'center',
        background: feedback.type === 'error' ? 'rgba(255,55,95,0.1)' : feedback.type === 'success' ? 'rgba(52,199,89,0.1)' : 'rgba(255,255,255,0.05)',
        color: feedback.type === 'error' ? '#ff375f' : feedback.type === 'success' ? 'var(--success)' : 'var(--subtext)',
        border: `1px solid ${feedback.type === 'error' ? 'rgba(255,55,95,0.2)' : feedback.type === 'success' ? 'rgba(52,199,89,0.2)' : 'transparent'}`,
        transition: '0.3s all'
      }}>
        {feedback.text}
      </div>

      <div style={{width: '100%', maxWidth: '1000px'}}>
        {/* Grille des lettres (Pleine largeur) */}
        <div style={{
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
          gap: '15px',
          background: 'rgba(20,20,20,0.5)', 
          padding: '20px', 
          borderRadius: '24px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          {arabicAlphabet.map((l) => (
            <div 
              key={l.char}
              onClick={() => handleLetterClick(l.char)}
              title="Cliquer pour entendre"
              style={{
                background: activeLetter?.char === l.char ? 'var(--accent)' : 'rgba(255,255,255,0.05)', 
                border: `1px solid ${activeLetter?.char === l.char ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`, 
                borderRadius: '15px', 
                padding: '25px 5px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer', 
                transition: '0.4s all cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: activeLetter?.char === l.char ? '0 10px 25px rgba(16, 185, 129, 0.4)' : 'none',
                transform: activeLetter?.char === l.char ? 'scale(1.1) translateY(-5px)' : 'scale(1)',
                zIndex: activeLetter?.char === l.char ? 10 : 1
              }}
            >
              <span style={{fontFamily: 'var(--font-arabic)', fontSize: '3rem', color: '#fff'}}>{l.char}</span>
              <span style={{fontSize: '0.75rem', textTransform: 'uppercase', color: activeLetter?.char === l.char ? '#fff' : '#aaa', marginTop: '10px', fontWeight: 700}}>{l.name}</span>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
}
