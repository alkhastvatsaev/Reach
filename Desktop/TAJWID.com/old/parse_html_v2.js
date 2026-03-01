const fs = require('fs');
const cheerio = require('cheerio');

function inlineStyleToReactState(styleStr) {
    if (!styleStr) return "{}";
    const rules = styleStr.split(';').filter(rule => rule.trim());
    const obj = {};
    for (let rule of rules) {
        let parts = rule.split(':');
        if (parts.length >= 2) {
            let key = parts.shift().trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
            let value = parts.join(':').trim();
            obj[key] = value;
        }
    }
    return JSON.stringify(obj);
}

function cheerioToJsx($, element) {
    let jsx = '';
    
    $(element).contents().each(function (i, el) {
        if (el.type === 'text') {
            let text = $(el).text();
            jsx += text;
        } else if (el.type === 'tag') {
            let tagName = el.name;
            let attrs = Object.keys(el.attribs || {}).map(attrName => {
                let attrValue = el.attribs[attrName];
                
                let jsxAttrName = attrName;
                if (attrName === 'class') jsxAttrName = 'className';
                if (attrName === 'for') jsxAttrName = 'htmlFor';
                
                // Keep inline handlers by proxying to window
                if (attrName.startsWith('on')) {
                    // onclick -> onClick
                    jsxAttrName = attrName.replace(/^on/, 'on').replace(/^on(.)/, (m, c) => 'on' + c.toUpperCase());
                    // Special case for oninput -> onInput, onmouseenter -> onMouseEnter
                    if (attrName === 'oninput') jsxAttrName = 'onInput';
                    if (attrName === 'onmouseenter') jsxAttrName = 'onMouseEnter';
                    if (attrName === 'onmouseleave') jsxAttrName = 'onMouseLeave';
                    
                    // The attrValue is like "toggleFavoriteCurrent()" or "this.style.background='rgba...'"
                    // We need to wrap it into a function string that gets evaluated.
                    const safeScript = attrValue.replace(/"/g, '\\"');
                    // We can just use an anonymous function wrapping an eval or directly executing.
                    // But an elegant fallback is to just make a React handler
                    return `${jsxAttrName}={(e) => {
                        // Evaluate the vanilla string script in the context of the element
                        // or just rely on global scope if it's a function call
                        try {
                            const fn = new Function('event', \`${safeScript}\`);
                            fn.call(e.currentTarget, e.nativeEvent || e);
                        } catch(err) { console.error('Inline event error', err); }
                    }}`;
                }
                
                // SVG properties
                if (attrName === 'stroke-width') jsxAttrName = 'strokeWidth';
                if (attrName === 'stroke-linecap') jsxAttrName = 'strokeLinecap';
                if (attrName === 'stroke-linejoin') jsxAttrName = 'strokeLinejoin';
                if (attrName === 'viewbox') jsxAttrName = 'viewBox';

                if (attrName === 'style') {
                    return `style={${inlineStyleToReactState(attrValue)}}`;
                }
                
                if (attrName.startsWith('on')) return ''; // Handled above, but just in case
                
                return `${jsxAttrName}="${attrValue.replace(/"/g, '&quot;')}"`;
            }).filter(Boolean).join(' ');

            const isSelfClosing = ['img', 'input', 'br', 'hr', 'path', 'circle', 'line', 'polygon', 'rect'].includes(tagName);

            // Need to close tags correctly, including <script> inside JSX
            if (isSelfClosing) {
                jsx += `<${tagName} ${attrs} />`;
            } else {
                jsx += `<${tagName} ${attrs}>`;
                jsx += cheerioToJsx($, el);
                jsx += `</${tagName}>`;
            }
        }
    });

    return jsx;
}

function extractComponent(htmlMatchString, componentName) {
     const $ = cheerio.load(htmlMatchString, null, false);
     const jsx = cheerioToJsx($, $.root());
     return `"use client";
import React from 'react';

export default function ${componentName}() {
  return (
    <>
      ${jsx}
    </>
  );
}`;
}

const html = fs.readFileSync('index.html', 'utf8');
const $ = cheerio.load(html);

// Remove scripts and link/style that are global
$('script').remove();
$('style').remove();
$('link').remove();
$('head').remove();

const headerHtml = $.html('.verse-selector');
const progressHtml = $.html('.smart-progress-bar');
const containerHtml = $.html('.container');
const bottomBarHtml = $.html('#bottom-bar-wrapper');
const micHtml = $.html('#mic-wrapper');
const duoHtml = $.html('.duo-panel');
const audioHtml = $.html('audio');
const floatingControlsHtml = micHtml + '\\n' + bottomBarHtml + '\\n' + duoHtml + '\\n' + audioHtml;

const quranModalHtml = $.html('#quran-modal');
const alphabetModalHtml = $.html('#alphabet-modal');
// Modals overlap logic, modal-overlay includes rule-tag, import-modal, stats
const allOverlays = $('.modal-overlay, #modal-overlay').map((i, el) => $.html(el)).get().join('\\n');

fs.mkdirSync('src/components', { recursive: true });
fs.writeFileSync('src/components/Header.tsx', extractComponent(headerHtml, 'Header'));
fs.writeFileSync('src/components/ProgressBar.tsx', extractComponent(progressHtml, 'ProgressBar'));
fs.writeFileSync('src/components/MainViewer.tsx', extractComponent(containerHtml, 'MainViewer'));
fs.writeFileSync('src/components/FloatingControls.tsx', extractComponent(floatingControlsHtml, 'FloatingControls'));
fs.writeFileSync('src/components/AllModals.tsx', extractComponent(allOverlays, 'AllModals'));

console.log('Successfully created improved components with events!');
