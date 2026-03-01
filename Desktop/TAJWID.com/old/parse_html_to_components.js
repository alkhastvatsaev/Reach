const fs = require('fs');
const cheerio = require('cheerio');

// Safely convert inline style strings to React style objects
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

// Recursively convert cheerio nodes to safe JSX string
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
                
                // Exclude inline event handlers for React components, we will map them via global pure JS
                if (attrName.startsWith('on')) return ''; 
                
                let jsxAttrName = attrName;
                if (attrName === 'class') jsxAttrName = 'className';
                if (attrName === 'for') jsxAttrName = 'htmlFor';
                // CamelCase SVG attributes roughly
                if (attrName === 'stroke-width') jsxAttrName = 'strokeWidth';
                if (attrName === 'stroke-linecap') jsxAttrName = 'strokeLinecap';
                if (attrName === 'stroke-linejoin') jsxAttrName = 'strokeLinejoin';
                if (attrName === 'viewbox') jsxAttrName = 'viewBox';

                if (attrName === 'style') {
                    // Convert inline CSS
                    return `style={${inlineStyleToReactState(attrValue)}}`;
                }
                
                // Escape quotes
                return `${jsxAttrName}="${attrValue.replace(/"/g, '&quot;')}"`;
            }).filter(Boolean).join(' ');

            const isSelfClosing = ['img', 'input', 'br', 'hr', 'path', 'circle', 'line', 'polygon', 'rect'].includes(tagName);

            if (isSelfClosing) {
                jsx += `<${tagName} ${attrs} />`;
            } else {
                jsx += `<${tagName} ${attrs}>`;
                jsx += cheerioToJsx($, el);
                jsx += `</${tagName}>`;
            }
        } else if (el.type === 'comment') {
            // Ignore block comments for pure JSX
        }
    });

    return jsx;
}

function extractComponent(htmlMatchString, componentName) {
     const $ = cheerio.load(htmlMatchString, null, false);
     const jsx = cheerioToJsx($, $.root());
     return `export default function ${componentName}() {
  return (
    <>
      ${jsx}
    </>
  );
}`;
}

const html = fs.readFileSync('index.html', 'utf8');
const $ = cheerio.load(html);

// 1. Remove scripts we don't want rendered
$('script').remove();
$('style').remove();
$('link').remove();
$('head').remove();

// Grab Header
const headerHtml = $.html('.verse-selector');
const headerSrc = extractComponent(headerHtml, 'Header');

// Grab ProgressBar
const progressHtml = $.html('.smart-progress-bar');
const progressSrc = extractComponent(progressHtml, 'ProgressBar');

// Grab Main Viewer Container (which includes ghost words, voice aura, bottom controls)
const containerHtml = $.html('.container');
const containerSrc = extractComponent(containerHtml, 'MainViewer');

// Grab the bottom floating elements
const bottomBarHtml = $.html('#bottom-bar-wrapper');
const micHtml = $.html('#mic-wrapper');
const duoHtml = $.html('.duo-panel');
const authHtml = $.html('#auth-modal'); // Wait, auth modal is a modal
const audioHtml = $.html('audio');

const floatingControlsHtml = micHtml + '\\n' + bottomBarHtml + '\\n' + duoHtml + '\\n' + audioHtml;
const floatingControlsSrc = extractComponent(floatingControlsHtml, 'FloatingControls');

// Grab ALL modals
const quranModalHtml = $.html('#quran-modal');
const alphabetModalHtml = $.html('#alphabet-modal');
const tajwidModalHtml = $.html('#modal-overlay');
const statsModalHtml = $.html('#stats-modal');
const pwaModalHtml = $.html('#pwa-modal');

const allModalsHtml = quranModalHtml + '\\n' + alphabetModalHtml + '\\n' + tajwidModalHtml + '\\n' + statsModalHtml + '\\n' + pwaModalHtml;
const allModalsSrc = extractComponent(allModalsHtml, 'AllModals');

// Write out to src/components
fs.mkdirSync('src/components', { recursive: true });
fs.writeFileSync('src/components/Header.tsx', headerSrc);
fs.writeFileSync('src/components/ProgressBar.tsx', progressSrc);
fs.writeFileSync('src/components/MainViewer.tsx', containerSrc);
fs.writeFileSync('src/components/FloatingControls.tsx', floatingControlsSrc);
fs.writeFileSync('src/components/AllModals.tsx', allModalsSrc);

console.log('Successfully created components!');
