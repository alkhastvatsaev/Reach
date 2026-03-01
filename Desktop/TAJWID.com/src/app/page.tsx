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

  return (
    <>
      <div id="startup-overlay">
        <div className="startup-logo">TAJWID</div>
        <p className="startup-sub">Préparation de l'expérience...</p>
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
