import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import plaintext from 'highlight.js/lib/languages/plaintext';
// import css from 'highlight.js/lib/languages/css';
// import javascript from 'highlight.js/lib/languages/javascript';
// import markdown from 'highlight.js/lib/languages/markdown';
// import typescript from 'highlight.js/lib/languages/typescript';
// import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('json', json);
hljs.registerLanguage('plaintext', plaintext);
// hljs.registerLanguage('css', css);
// hljs.registerLanguage('xml', xml);
// hljs.registerLanguage('markdown', markdown);
// hljs.registerLanguage('javascript', javascript);
// hljs.registerLanguage('typescript', typescript);

export default hljs;
