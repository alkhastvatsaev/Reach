"use client";
import React from 'react';

export default function FloatingControls() {
  return (
    <>
      \n\n<div id="panel-user1" className="duo-panel" style={{"pointerEvents":"auto"}}>
        <div className="duo-name" style={{"fontSize":"1rem"}}>User 1</div>
        <div style={{"display":"flex","alignItems":"center","gap":"8px"}}>
          <div id="status-user1" className="duo-status"></div>
          <div id="mic-user1" className="duo-mic-indicator"></div>
        </div>
      </div><div id="panel-user2" className="duo-panel" style={{"pointerEvents":"auto"}}>
        <div className="duo-name" style={{"fontSize":"1rem"}}>User 2</div>
        <div style={{"display":"flex","alignItems":"center","gap":"8px"}}>
          <div id="status-user2" className="duo-status" style={{"width":"8px","height":"8px","borderRadius":"50%","background":"#555"}}></div>
          <div id="mic-user2" className="duo-mic-indicator"></div>
        </div>
      </div>\n
    </>
  );
}