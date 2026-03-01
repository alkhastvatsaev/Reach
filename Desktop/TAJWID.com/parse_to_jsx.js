const fs = require('fs');

let bodyHtml = fs.readFileSync('raw_body.html', 'utf8');

// The most basic JSX transformer
bodyHtml = bodyHtml.replace(/class=/g, 'className=');
bodyHtml = bodyHtml.replace(/onclick="([^"]*)"/g, 'onClick={() => { /* converted */ }}');
bodyHtml = bodyHtml.replace(/oninput="([^"]*)"/g, 'onInput={() => { /* converted */ }}');
bodyHtml = bodyHtml.replace(/style="([^"]*)"/g, (match, p1) => {
    // Basic inline style to object converter - very naive but usually ok for simple styles
    const styles = p1.split(';').filter(s => s.trim() !== '');
    const styleObj = {};
    styles.forEach(s => {
        const [key, value] = s.split(':');
        if (key && value) {
            const camelKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
            styleObj[camelKey] = value.trim();
        }
    });
    return 'style={' + JSON.stringify(styleObj) + '}';
});

// Self-closing tags that JSX demands
bodyHtml = bodyHtml.replace(/<img(.*?)>/g, (match, p1) => {
    if(!p1.endsWith('/')) return `<img${p1} />`;
    return match;
});
bodyHtml = bodyHtml.replace(/<input(.*?)>/g, (match, p1) => {
    if(!p1.endsWith('/')) return `<input${p1} />`;
    return match;
});
// Remove comments?
bodyHtml = bodyHtml.replace(/<!--[\s\S]*?-->/g, '');

fs.writeFileSync('src/app/page.tsx', `
'use client';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Load external monolithic script
    const script = document.createElement('script');
    script.src = '/tajwid-logic.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      ${bodyHtml}
    </>
  );
}
`);
