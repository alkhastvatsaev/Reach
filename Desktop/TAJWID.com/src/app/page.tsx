"use client";

import React, { useEffect } from 'react';
import Header from '@/components/Header';
import ProgressBar from '@/components/ProgressBar';
import MainViewer from '@/components/MainViewer';
import FloatingControls from '@/components/FloatingControls';
import AllModals from '@/components/AllModals';

export default function TajwidPage() {
  useEffect(() => {
    // We add the logic to make sure the global UI scripts get bootstrapped
    // if not already loaded
    if (!document.getElementById('tajwid-logic-script')) {
      const script = document.createElement('script');
      script.id = 'tajwid-logic-script';
      script.src = '/tajwid-logic.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (    <>
      <div id="start-overlay" style={{ cursor: 'pointer', zIndex: 9999, display: 'flex' }} onClick={(e) => {
          // This allows users to start the app by clicking on the overlay
          try {
              const fn = new Function('event', `startRecognition()`);
              fn.call(e.currentTarget, e.nativeEvent || e);
          } catch(err) { console.error('Inline event error', err); }
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div className="start-icon" id="main-start-btn">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </div>
          <p id="txt-start" style={{ fontWeight: 500 }}>Touchez pour commencer</p>

          <button id="duo-mode-btn" className="btn-duo" onClick={(e) => {
              e.stopPropagation();
              try {
                  const fn = new Function('event', `openDuoSelector()`);
                  fn.call(e.currentTarget, e.nativeEvent || e);
              } catch(err) { console.error('Inline event error', err); }
          }}>
            MODE DUO
          </button>

          <div className="daily-card" id="daily-verse-card" style={{ marginTop: '20px' }} onClick={(e) => {
              e.stopPropagation();
              try {
                  const fn = new Function('event', `loadDailyVerse()`);
                  fn.call(e.currentTarget, e.nativeEvent || e);
              } catch(err) { console.error('Inline event error', err); }
          }}>
            <div className="daily-label" id="txt-daily-label">Verset du Jour</div>
            <div className="daily-ref" id="daily-ref-text">Sourate ...</div>
            <div className="daily-sub" id="txt-daily-sub">Appuyez pour découvrir</div>
          </div>
        </div>
      </div>

      <div id="app-layout" style={{ display: 'none' }}>
        <Header />
        <ProgressBar />
        <MainViewer />
        <FloatingControls />
      </div>

      <AllModals />
    </>
  );
}
