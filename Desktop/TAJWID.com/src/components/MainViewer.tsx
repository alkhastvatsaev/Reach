"use client";
import React from 'react';

export default function MainViewer() {
  return (
    <>
      <div className="container">
      <div id="download-btn">
        <button onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `downloadFullAudio()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>
          <span id="txt-download">Télécharger ma récitation</span>
        </button>
      </div>

      <div id="verse-container" onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `openTajweedModal(event)`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}></div>

      
      <div id="ghost-word-container"></div>
      <div className="voice-aura" id="voice-aura"></div>
      <div className="bottom-controls">
        <button id="restart-btn" className="visible" style={{"display":"none","background":"var(--success)","color":"white","border":"none","padding":"14px 35px","borderRadius":"100px","fontWeight":"600","cursor":"pointer"}} onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `restartRecitation()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>
          Recommencer
        </button>
        <button id="report-diag-btn" style={{"position":"relative","background":"rgba(255, 255, 255, 0.1)","color":"white","border":"1px solid rgba(255, 255, 255, 0.2)","padding":"10px 20px","borderRadius":"100px","fontSize":"0.8rem","cursor":"pointer","backdropFilter":"blur(10px)"}} onClick={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', `manualReport()`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}>
          <span id="report-btn-text">Rapport Technique</span>
        </button>
      </div>
    </div>
    </>
  );
}