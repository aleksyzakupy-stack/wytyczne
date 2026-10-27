/* Indeks lokalny: tytuły, ręcznie opracowane hasła, autorzy, rok i identyfikatory. */
(function(root){
  'use strict';
  const norm=s=>String(s??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l');
  const searchText=s=>norm(s).replace(/\b(cin|ki|p)\s*[- ]?\s*(\d+)\b/g,'$1$2').replace(/\bpd\s*-?\s*l\s*-?\s*(\d+)\b/g,'pdl$1');
  const tokens=s=>searchText(s).match(/[a-z0-9]+/g)||[];
  const stem=w=>w.length>=5?w.replace(/(?:ami|ach|owi|ego|owej|owym|owych|ej|ie|ow|om|em|a|i|u|e|y|o)$/,''):w;
  const stop=new Set(['w','we','z','ze','na','do','u','o','i','oraz','dla','a','czy','jak','sie','jest','sa','przy','wg','wedlug','dotyczace','dotyczacych','wytyczne','zalecenia','rekomendacje']);
  const queryTokens=q=>{const all=tokens(q),useful=all.filter(t=>!stop.has(t));return [...new Set(useful.length?useful:all)];};
  function wordMatch(word,query){
    if(word===query)return 1;
    if(query.length>=3&&word.startsWith(query)&&/^\d+$/.test(word.slice(query.length)))return .9;
    if(query.length<4||word.length<4)return 0;
    const qs=stem(query),ws=stem(word);
    if(qs===ws)return .94;
    return qs.length>=4&&word.startsWith(qs)? .78:0;
  }
  function distance(a,b,max){
    if(Math.abs(a.length-b.length)>max)return max+1;
    let prev=Array.from({length:b.length+1},(_,i)=>i);
    for(let i=1;i<=a.length;i++){
      const row=[i];
      for(let j=1;j<=b.length;j++)row[j]=Math.min(row[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
      if(Math.min(...row)>max)return max+1;
      prev=row;
    }
    return prev[b.length];
  }
  function create(records){
    const vocabulary=new Map();
    const entries=records.map(record=>{
      const keywords=record.keywords||[];
      const fields=[
        {name:'title',weight:14,text:record.title},
        {name:'original',weight:11,text:record.original_title},
        ...keywords.map(text=>({name:'keyword',weight:12,text})),
        {name:'organization',weight:5,text:record.organization},
        {name:'category',weight:2,text:record.category},
        {name:'year',weight:4,text:record.year}
      ].filter(f=>f.text).map(f=>({...f,norm:norm(f.text),words:tokens(f.text)}));
      for(const text of [...keywords,record.title])for(const raw of String(text).match(/[\p{L}]{6,}/gu)||[]){
        const key=norm(raw);if(stop.has(key))continue;
        const old=vocabulary.get(key)||{word:raw.toLowerCase(),count:0};old.count++;vocabulary.set(key,old);
      }
      return {record,fields,ids:[record.id,...record.aliases||[]].map(s=>norm(s).replace(/[^a-z0-9]/g,''))};
    });
    function search(query){
      const terms=queryTokens(query),raw=norm(query).trim(),compact=raw.replace(/[^a-z0-9]/g,'');
      const looksId=/^(ptg|gip|onk|inn|std|uzu|uro)[\s-]?\d+$/i.test(raw);
      const results=[];
      for(const e of entries){
        if(looksId){if(e.ids.includes(compact))results.push({record:e.record,score:10000,matchedKeywords:[],terms:[]});continue;}
        let score=terms.length?0:(e.record.collection==='Polskie — wykaz główny'?4:e.record.national_origin==='polskie'&&e.record.polish_text_available?2:0),matched=true;
        for(const term of terms){
          let best=0;
          for(const f of e.fields)for(const word of f.words)best=Math.max(best,wordMatch(word,term)*f.weight);
          if(!best){matched=false;break;}score+=best;
        }
        if(!matched)continue;
        const phrase=terms.join(' ');
        if(terms.length>1)for(const f of e.fields)if(f.norm.includes(phrase))score+=f.weight*.65;
        if(terms.length){
          const current=['potwierdzony_obowiazujacy','aktualna_wg_zrodla','najnowsza_znaleziona','w_wykazie_wydawcy','czesciowo_zaktualizowana'].includes(e.record.currency_status);
          score+=current?2:0;
          if(e.record.polish_text_available)score+=.5;
          if(e.record.national_origin==='polskie')score+=.5;
        }
        const matchedKeywords=(e.record.keywords||[]).filter(k=>terms.some(t=>tokens(k).some(w=>wordMatch(w,t))));
        results.push({record:e.record,score,matchedKeywords,terms});
      }
      return results.sort((a,b)=>b.score-a.score||(b.record.year||0)-(a.record.year||0)||a.record.title.localeCompare(b.record.title,'pl'));
    }
    function suggest(query){
      if(search(query).length)return [];
      const words=queryTokens(query);if(!words.length)return [];
      const proposals=[];
      for(let i=0;i<words.length;i++){
        const word=words[i];if(word.length<6)continue;
        if(entries.some(e=>e.fields.some(f=>f.words.some(w=>wordMatch(w,word)))))continue;
        const limit=word.length>=10?2:1;
        const near=[...vocabulary].map(([k,v])=>({key:k,...v,d:distance(word,k,limit)})).filter(c=>c.d>0&&c.d<=limit).sort((a,b)=>a.d-b.d||b.count-a.count||a.key.localeCompare(b.key));
        for(const candidate of near.slice(0,8)){
          const replacement=[...words];replacement[i]=candidate.word;
          const text=replacement.join(' '),hits=search(text).length;
          if(hits&&!proposals.some(p=>p.query===text))proposals.push({query:text,count:hits,distance:candidate.d});
        }
      }
      const sorted=proposals.sort((a,b)=>a.distance-b.distance||b.count-a.count);
      return sorted.filter(p=>p.distance===sorted[0]?.distance).slice(0,3);
    }
    return {search,suggest};
  }
  const api={create,norm,tokens,queryTokens,wordMatch};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.CatalogSearch=api;
})(typeof globalThis!=='undefined'?globalThis:this);
