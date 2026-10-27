const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
let html=fs.readFileSync(path.join(root,'src/index.template.html'),'utf8');
const safe=x=>JSON.stringify(x).replace(/<\//g,'<\\/');
html=html.replace('__SEARCH_ENGINE__',fs.readFileSync(path.join(root,'src/search_engine.js'),'utf8'))
 .replace('__DATA__',safe(JSON.parse(fs.readFileSync(path.join(root,'katalog.json')))))
 .replace('__COUNTS__',safe(JSON.parse(fs.readFileSync(path.join(root,'statystyki.json')))))
 .replace('__LABELS__','{}');
fs.writeFileSync(path.join(root,'index.html'),html);
console.log('index.html');
