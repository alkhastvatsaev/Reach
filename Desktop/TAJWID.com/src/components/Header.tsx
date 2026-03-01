"use client";
import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <>
      <div className="verse-selector" id="verse-selector">
      <div id="v-btns-container" style={{"display":"flex"}}></div>

      <button className="heart-btn" id="header-heart" onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `toggleFavoriteCurrent()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }} title="Favoris">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      <Link href="/alphabet" className="heart-btn" id="header-alphabet" title="Apprendre l'Alphabet" style={{"marginLeft":"10px"}}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7V4h16v3M9 20h6M12 4v16" />
        </svg>
      </Link>

      <div className="mini-lang-selector">
        <button className="lang-menu-btn" onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `toggleLangMenu(event)`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </button>
        <div className="lang-options" id="lang-options">
          <button className="lang-btn" onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `setLanguage('fr', event)`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>
            FR
          </button>
          <button className="lang-btn" onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `setLanguage('en', event)`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>
            EN
          </button>
          <button className="lang-btn" onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `setLanguage('ru', event)`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>
            RU
          </button>
        </div>
      </div>

      <button className="profile-btn" onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `openStatsModal()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>
        <span id="progress-percent" style={{"display":"none"}}>0%</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>
    </div>
    </>
  );
}