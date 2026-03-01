"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const arabicAlphabet = [
  { char: 'ا', name: 'Alif', keywords: ['ا', 'أ', 'إ', 'آ', 'alif'] },
  { char: 'ب', name: 'Ba', keywords: ['ب', 'ba', 'baa'] },
  { char: 'ت', name: 'Ta', keywords: ['ت', 'ta'] },
  { char: 'ث', name: 'Tha', keywords: ['ث', 'tha', 'sa'] },
  { char: 'ج', name: 'Jiim', keywords: ['ج', 'jim', 'djim'] },
  { char: 'ح', name: 'Ha', keywords: ['ح', 'ha', 'haa'] },
  { char: 'خ', name: 'Kha', keywords: ['خ', 'kha', 'ra'] },
  { char: 'د', name: 'Dal', keywords: ['د', 'dal', 'daal'] },
  { char: 'ذ', name: 'Dhal', keywords: ['ذ', 'dhal', 'zal'] },
  { char: 'ر', name: 'Ra', keywords: ['ر', 'ra'] },
  { char: 'ز', name: 'Zay', keywords: ['ز', 'zay', 'za'] },
  { char: 'س', name: 'Siin', keywords: ['س', 'sin'] },
  { char: 'ش', name: 'Shiin', keywords: ['ش', 'shin', 'chin'] },
  { char: 'ص', name: 'Saad', keywords: ['ص', 'sad'] },
  { char: 'ض', name: 'Daad', keywords: ['ض', 'dad', 'dod'] },
  { char: 'ط', name: 'Ta', keywords: ['ط', 'ta', 'to'] },
  { char: 'ظ', name: 'Za', keywords: ['ظ', 'za', 'zo'] },
  { char: 'ع', name: 'Ayn', keywords: ['ع', 'ain', 'ayn'] },
  { char: 'غ', name: 'Ghayn', keywords: ['غ', 'ghain', 'rhain'] },
  { char: 'ف', name: 'Fa', keywords: ['ف', 'fa'] },
  { char: 'ق', name: 'Qaaf', keywords: ['ق', 'qaf', 'kaf'] },
  { char: 'ك', name: 'Kaaf', keywords: ['ك', 'kaf', 'kef'] },
  { char: 'ل', name: 'Laam', keywords: ['ل', 'lam'] },
  { char: 'م', name: 'Miim', keywords: ['م', 'mim'] },
  { char: 'ن', name: 'Nuun', keywords: ['ن', 'nun', 'noun'] },
  { char: 'ه', name: 'Ha', keywords: ['ه', 'ha'] },
  { char: 'و', name: 'Waw', keywords: ['و', 'waw'] },
  { char: 'ي', name: 'Ya', keywords: ['ي', 'ya'] },
];

export default function AlphabetPage() {
  const [foundLetters, setFoundLetters] = useState<string[]>([]);
  const foundLettersRef = useRef<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [debugText, setDebugText] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'ar-SA'; // Langue arabe par défaut pour capturer l'accent

      rec.onstart = () => {
        if (isMounted) setIsListening(true);
      };

      rec.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        
        const text = transcript.toLowerCase().trim();
        setDebugText(text);
        
        let newFoundArray = [...foundLettersRef.current];
        let letterDetected = false;
        
        arabicAlphabet.forEach(letter => {
            if (newFoundArray.includes(letter.char)) return; // Déjà trouvée

            let isMatch = false;
            letter.keywords.forEach(kw => {
                if (text.includes(kw.toLowerCase())) {
                    isMatch = true;
                }
            });
            
            if (isMatch) {
                newFoundArray.push(letter.char);
                letterDetected = true;
            }
        });
        
        if (letterDetected && isMounted) {
            foundLettersRef.current = newFoundArray;
            setFoundLetters([...newFoundArray]);
        }
      };

      rec.onerror = (e: any) => {
        if (e.error !== 'aborted') {
            console.error(e.error);
            if (isMounted) setIsListening(false);
        }
      };

      rec.onend = () => {
        if (!isMounted) return;
        setIsListening(false);
        // Auto-restart silencieux
        setTimeout(() => {
            if (isMounted && recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                } catch(err) {
                    // Ignore InvalidStateError
                }
            }
        }, 300);
      };

      recognitionRef.current = rec;
      
      try {
        rec.start();
      } catch(e) {}
    }

    return () => {
      isMounted = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch(e) {}
      }
    };
  }, []);

  const resetProgress = () => {
    foundLettersRef.current = [];
    setFoundLetters([]);
  };

  return (
    <div style={{minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0a0a0a', color: 'white'}}>
      <div style={{width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: 'calc(20px + env(safe-area-inset-top))'}}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: '8px', 
          background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '100px', 
          textDecoration: 'none', color: 'white', border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour
        </Link>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <div style={{
            width: '12px', height: '12px', borderRadius: '50%',
            background: isListening ? '#34d399' : '#fc3c44',
            boxShadow: isListening ? '0 0 10px #34d399' : 'none',
            transition: '0.3s all'
          }}></div>
          <span style={{fontSize: '0.9rem', color: '#888'}}>{isListening ? 'Micro ouvert...' : 'Micro fermé'}</span>
        </div>
      </div>

      <div style={{width: '100%', maxWidth: '1000px', textAlign: 'center', marginBottom: '30px'}}>
        <h1 style={{fontSize: '2rem', fontWeight: 700, marginBottom: '10px'}}>Alphabet Arabe</h1>
        <p style={{color: '#888'}}>Prononcez n'importe quelle lettre. Elle s'allumera en vert lorsqu'elle sera reconnue.</p>
        
        <div style={{marginTop: '20px', minHeight: '40px', color: '#555', fontSize: '0.9rem', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px'}}>
          {debugText ? `Entendu: "${debugText}"` : "Le micro vous écoute en continu..."}
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
            onClick={resetProgress}
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
            Réinitialiser la grille
          </button>
      )}
    </div>
  );
}
