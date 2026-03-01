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
  const [feedback, setFeedback] = useState<{text: string, type: 'success'|'error'|'info'}>({text: "Appuyez sur le micro et prononcez n'importe quelle lettre.", type: 'info'});
  
  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

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
        if (isRecordingRef.current) {
          try {
            recognitionRef.current?.start();
          } catch (e) {
            console.error("Failed to restart recognition", e);
            setIsRecording(false);
          }
        }
      };

      recognitionRef.current = rec;
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

  const handleLetterClick = (char: string, name: string) => {
    setActiveLetter({ char, name });
    speakLetter(char);
    setFeedback({text: `Lettre « ${name} », écoutez ou prononcez une autre lettre !`, type: 'info'});
  };

  const toggleMic = () => {
    if (isRecording) {
      isRecordingRef.current = false;
      setIsRecording(false);
      recognitionRef.current?.stop();
      setFeedback({text: "Écoute arrêtée.", type: 'info'});
    } else {
      try {
        setFeedback({text: "Écoute continue... 🎤 Prononcez une lettre au hasard.", type: 'info'});
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e: any) {
        console.warn("Speech start err:", e);
        if (e.name === "InvalidStateError") {
            setIsRecording(true);
        } else {
            setFeedback({text: `Erreur: ${e.message}`, type: 'error'});
            setIsRecording(false);
        }
      }
    }
  };

  const evaluatePronunciation = (transcript: string) => {
    if (!transcript) return;
    console.log("Transcript original:", transcript);
    
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

    if (detectedLetter) {
        setActiveLetter(detectedLetter);
        setFeedback({text: `✅ Magnifique ! J'ai bien entendu la lettre « ${detectedLetter.name} » (${detectedLetter.char}).`, type: 'success'});
    }
  };

  return (
    <div style={{minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg)', color: 'white'}}>
      {/* Header local pour la page */}
      <div style={{width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', marginTop: 'calc(20px + env(safe-area-inset-top))'}}>
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
        <h1 style={{fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--accent)'}}>
            <path d="M4 7V4h16v3M9 20h6M12 4v16" />
          </svg>
          Alphabet Tajwid
        </h1>
      </div>

      <div style={{display: 'flex', width: '100%', maxWidth: '1000px', gap: '30px', flexDirection: 'row', flexWrap: 'wrap-reverse', justifyContent: 'center'}}>
        {/* Grille des lettres */}
        <div style={{
          flex: '1 1 500px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
          gap: '12px',
          background: 'rgba(20,20,20,0.5)', 
          padding: '20px', 
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          {arabicAlphabet.map((l) => (
            <div 
              key={l.char}
              onClick={() => handleLetterClick(l.char, l.name)}
              style={{
                background: activeLetter?.char === l.char ? 'var(--accent)' : 'rgba(255,255,255,0.05)', 
                border: `1px solid ${activeLetter?.char === l.char ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`, 
                borderRadius: '15px', 
                padding: '15px 5px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer', 
                transition: '0.2s all',
                boxShadow: activeLetter?.char === l.char ? '0 8px 20px rgba(16, 185, 129, 0.4)' : 'none',
                transform: activeLetter?.char === l.char ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <span style={{fontFamily: 'var(--font-arabic)', fontSize: '2.5rem', color: '#fff'}}>{l.char}</span>
              <span style={{fontSize: '0.65rem', textTransform: 'uppercase', color: activeLetter?.char === l.char ? '#fff' : '#aaa', marginTop: '8px', fontWeight: 700}}>{l.name}</span>
            </div>
          ))}
        </div>

        {/* Panel d'apprentissage IA */}
        <div style={{
          flex: '1 1 300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '30px',
          padding: '40px 20px',
          position: 'sticky',
          top: '20px',
          height: 'fit-content'
        }}>
          {!activeLetter ? (
            <div style={{opacity: 0.5, textAlign: 'center'}}>
               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: '20px'}}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              <p>Touchez une lettre pour démarrer l'apprentissage.</p>
            </div>
          ) : (
            <>
              <div 
                onClick={() => speakLetter(activeLetter.char)}
                title="Écouter la lettre"
                style={{
                  width: '150px', 
                  height: '150px', 
                  borderRadius: '50%', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '2px dashed var(--accent)',
                  marginBottom: '20px',
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.2) inset'
              }}>
                <span style={{fontFamily: 'var(--font-arabic)', fontSize: '5rem', color: 'var(--accent)'}}>{activeLetter.char}</span>
              </div>
              <h2 style={{fontSize: '2rem', marginBottom: '5px'}}>{activeLetter.name}</h2>
              <p style={{color: 'var(--subtext)', marginBottom: '30px'}}>Appuyez sur la lettre pour l'écouter.</p>

              <button 
                onClick={toggleMic}
                style={{
                  background: isRecording ? '#ff375f' : 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '100px',
                  padding: '16px 40px',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: isRecording ? '0 10px 30px rgba(255, 55, 95, 0.4)' : '0 10px 30px rgba(16, 185, 129, 0.4)',
                  transition: '0.3s all',
                  animation: isRecording ? 'pulse 1.5s infinite' : 'none'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill={isRecording ? "white" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="22"/>
                </svg>
                {isRecording ? "Je vous écoute..." : "Prononcer"}
              </button>

              <div style={{
                marginTop: '30px', 
                padding: '15px 20px', 
                borderRadius: '16px', 
                width: '100%',
                textAlign: 'center',
                background: feedback.type === 'error' ? 'rgba(255,55,95,0.1)' : feedback.type === 'success' ? 'rgba(52,199,89,0.1)' : 'rgba(255,255,255,0.05)',
                color: feedback.type === 'error' ? '#ff375f' : feedback.type === 'success' ? 'var(--success)' : 'var(--subtext)',
                border: `1px solid ${feedback.type === 'error' ? 'rgba(255,55,95,0.2)' : feedback.type === 'success' ? 'rgba(52,199,89,0.2)' : 'transparent'}`
              }}>
                {feedback.text}
              </div>
            </>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 55, 95, 0.7); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(255, 55, 95, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 55, 95, 0); }
        }
      `}} />
    </div>
  );
}
