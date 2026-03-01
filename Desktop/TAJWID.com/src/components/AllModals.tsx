"use client";
import React from 'react';

export default function AllModals() {
  return (
    <>
      <div id="modal-overlay" onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `closeModal()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>
      <div className="tajwid-modal" onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `event.stopPropagation()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>
        <div id="rule-tag" className="modal-tag">MODE</div>
        <div id="rule-title" className="modal-title">Nom de la règle</div>
        <p id="rule-desc" className="modal-desc">
          Explication détaillée de la règle de tajwid.
        </p>
        <button className="close-modal" onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `closeModal()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>Compris</button>
      </div>
    </div>\n<div id="quran-modal" className="modal-overlay" onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `closeQuranBrowser()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }} style={{"position":"fixed","top":"0","left":"0","right":"0","bottom":"0","background":"rgba(0, 0, 0, 0.8)","backdropFilter":"blur(15px)","zIndex":"4500","display":"none","alignItems":"center","justifyContent":"center"}}>
      <div className="tajwid-modal" style={{"maxWidth":"600px","width":"90%"}} onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `event.stopPropagation()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>
        <div className="modal-tag" style={{"background":"#fff","color":"#000"}}>
          Al-Quran
        </div>
        <div className="modal-title" id="txt-browser-title">
          Choisir une Sourate
        </div>

        <input type="text" id="surah-search" className="search-box" placeholder="Chercher une sourate..." onInput={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `filterSurahs()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }} />

        <div id="surah-grid" className="surah-grid">
          
        </div>

        <button className="close-modal" id="txt-browser-close" style={{"marginTop":"20px","background":"transparent","border":"1px solid rgba(255, 255, 255, 0.2)"}} onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `closeQuranBrowser()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>
          Fermer
        </button>
      </div>
    </div>\n<div id="alphabet-modal" className="modal-overlay" onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `closeAlphabetModal()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }} style={{"position":"fixed","top":"0","left":"0","right":"0","bottom":"0","background":"rgba(0, 0, 0, 0.9)","backdropFilter":"blur(15px)","zIndex":"4500","display":"none","alignItems":"center","justifyContent":"center","overflowY":"auto"}}>
      <div className="tajwid-modal" style={{"maxWidth":"800px","width":"90%","maxHeight":"90vh","overflowY":"auto"}} onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `event.stopPropagation()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>
        <div className="modal-tag" style={{"background":"var(--success)","color":"#fff"}}>
          Alphabet Arabe
        </div>

        <div id="alphabet-grid" style={{"display":"grid","gridTemplateColumns":"repeat(auto-fill, minmax(80px, 1fr))","gap":"15px","marginTop":"20px"}} dir="rtl">
          
        </div>

        <button className="close-modal" style={{"marginTop":"20px","background":"transparent","border":"1px solid rgba(255, 255, 255, 0.2)"}} onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `closeAlphabetModal()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>
          Fermer
        </button>
      </div>
    </div>\n<div id="stats-modal" className="modal-overlay" onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `closeStatsModal()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }} style={{"position":"fixed","top":"0","left":"0","right":"0","bottom":"0","background":"rgba(0, 0, 0, 0.85)","backdropFilter":"blur(20px)","zIndex":"5000","display":"none","alignItems":"center","justifyContent":"center"}}>
      <div className="tajwid-modal" style={{"maxWidth":"400px","width":"90%"}} onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `event.stopPropagation()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>
        <div className="modal-tag" style={{"background":"linear-gradient(135deg, var(--accent), #5e5ce6)"}}>
          Progression
        </div>
        <div className="modal-title" id="txt-stats-title">Tableau de Bord</div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-val" id="stat-completed">0</div>
            <div className="stat-label" id="txt-stats-verses">Versets</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" id="stat-favorites">0</div>
            <div className="stat-label" id="txt-stats-favs">Favoris</div>
          </div>
        </div>

        <div style={{"textAlign":"left","marginBottom":"20px"}}>
          <div style={{"display":"flex","justifyContent":"space-between","fontSize":"0.8rem","marginBottom":"8px"}}>
            <span style={{"color":"white"}} id="txt-stats-goal">Objectif Coran</span>
            <span style={{"color":"var(--accent)"}} id="progress-label">0%</span>
          </div>
          <div className="progress-container">
            <div className="progress-bar" id="profile-progress-bar"></div>
          </div>
        </div>

        <button className="close-modal" id="txt-stats-continue" style={{"width":"100%"}} onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `closeStatsModal()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>
          Continuer l'apprentissage
        </button>
      </div>
    </div>\n<div id="import-modal" className="modal-overlay" onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `closeImportModal()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }} style={{"position":"fixed","top":"0","left":"0","right":"0","bottom":"0","background":"rgba(0, 0, 0, 0.7)","backdropFilter":"blur(10px)","zIndex":"4000","display":"none","alignItems":"center","justifyContent":"center"}}>
      <div className="tajwid-modal" onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `event.stopPropagation()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>
        <div className="modal-tag" style={{"background":"var(--accent)"}}>IA Import</div>
        <div className="modal-title" id="txt-import-title">Nouveau Verset</div>
        <p className="modal-desc" id="txt-import-desc">
          Tapez la référence (ex: 2:255 pour Al-Kursi)
        </p>

        <input type="text" id="import-ref" className="search-box" placeholder="Surah:Ayah (ex: 18:10)" />
        <div id="import-loader" className="loading-spinner"></div>

        <div style={{"display":"flex","gap":"10px"}}>
          <button className="close-modal" id="txt-import-cancel" style={{"background":"transparent","border":"1px solid rgba(255, 255, 255, 0.2)"}} onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `closeImportModal()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>
            Annuler
          </button>
          <button className="close-modal" id="btn-import-exec" onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `fetchVerseFromAPI()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>
            Importer
          </button>
        </div>
      </div>
    </div>
    </>
  );
}