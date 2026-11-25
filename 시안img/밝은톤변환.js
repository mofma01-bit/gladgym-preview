/* 밝은 톤 미리보기 — 실제 앱 파일은 그대로 두고, 화면에 그려진 색을 규칙서(디자인_규칙서_밝은톤.md) 값으로 바꿔 찍는다.
   ⚠ 미리보기용 근사치다. 실제로 넣을 때는 토큰(CSS 변수)으로 다시 짠다. 2026-11-18 디자인 전용 창 */
window.밝은톤 = function(root){
  root = root || document.body;
  const T = { bg:'#f6f3ee', card:'#ffffff', sunk:'#f1ede6', line:'#e6dfd5', ink:'#1e1915', sub:'#6f665d',
              brown:'#412921', cream:'#fff7ea', gold:'#e6c487', goldSoft:'#f8eed9', goldInk:'#7a5413',
              teal:'#2b7584', tealLine:'#8fbcc5', blue:'#2f6fb5', blueLine:'#a9c8ec' };
  const P = s => { const m = (s||'').match(/rgba?\(([^)]+)\)/); if(!m) return null; const a = m[1].split(',').map(x=>parseFloat(x)); return {r:a[0],g:a[1],b:a[2],a:a.length>3?a[3]:1}; };
  const HSL = c => { let r=c.r/255,g=c.g/255,b=c.b/255; const mx=Math.max(r,g,b),mn=Math.min(r,g,b); let h=0,s=0; const l=(mx+mn)/2;
    if(mx!==mn){ const d=mx-mn; s=l>.5?d/(2-mx-mn):d/(mx+mn); h = mx===r?(g-b)/d+(g<b?6:0): mx===g?(b-r)/d+2:(r-g)/d+4; h*=60; } return {h,s,l}; };
  const hsl = (h,s,l) => `hsl(${Math.round(h)},${Math.round(s*100)}%,${Math.round(l*100)}%)`;
  const 뜻글자 = (c) => { const {h,s,l} = HSL(c);
    if(s < .18) return l > .72 ? T.ink : l > .45 ? T.sub : null;           // 무채 — 밝은 글자는 진하게
    if(h >= 25 && h < 58) return '#5a3a2e';                                  // 골드 글자 → 진한 브라운 (흰 바탕 골드 글자 금지 · 규칙서 5)
    if(h >= 170 && h < 208) return T.teal;                                   // 티얼
    if(h >= 208 && h < 240) return T.blue;                                   // 파랑
    if(h >= 85 && h < 170) return '#2f7a45';                                 // 초록
    if(h >= 240 && h < 320) return '#5a3f98';                                // 라일락
    if(h < 25 || h >= 320) return '#9a4a1c';                                 // 붉은 끼(경고) → 갈색 — 빨강 안 씀
    return hsl(h, Math.min(s,.6), .32); };
  const 사진안 = new WeakSet();
  const all = [root, ...root.querySelectorAll('*')];
  // 사진 판 안쪽은 글자를 그대로 둔다(사진 위 흰 글)
  all.forEach(e => { const bi = getComputedStyle(e).backgroundImage; if(bi && bi.includes('url(') && !/svg/.test(bi)) { 사진안.add(e); e.querySelectorAll('*').forEach(x=>사진안.add(x)); } });
  const 고칠 = [];
  all.forEach(e => {
    if(e.tagName === 'IMG' || e.tagName === 'CANVAS') return;
    const cs = getComputedStyle(e), st = {};
    const 단추 = !!e.closest('button,[data-act],.btn,a');
    const 단추몸 = e.matches('button,[data-act],.btn,a') || (단추 && e.offsetHeight >= 30 && e.offsetWidth >= 60);
    // 덮개(화면 전체 어둡게) — 옅은 덮개로
    if((cs.position === 'fixed' || cs.position === 'absolute') && e.offsetWidth >= innerWidth - 2 && e.offsetHeight >= innerHeight * .6){
      const c = P(cs.backgroundColor); if(c && c.a > 0 && c.a < 1 && HSL(c).l < .3){ 고칠.push([e, {'background-color':'rgba(30,25,21,.32)'}]); return; } }
    // 그림 안 채움(달력 점 등) — 어두운 채움은 옅게, 밝은 글자는 진하게
    if(e.closest('svg') && e.tagName !== 'svg'){
      const f = P(cs.fill); const st2 = {};
      if(f && f.a > .3){ const q = HSL(f); if(q.l < .3) st2.fill = q.s < .2 ? '#e6dfd5' : hsl(q.h, .45, .85); else if(q.l > .68 && (e.tagName === 'text' || e.tagName === 'tspan' || q.s < .25)) st2.fill = (q.s > .3 && q.h >= 25 && q.h < 58) ? '#5a3a2e' : T.ink; }
      if(Object.keys(st2).length) 고칠.push([e, st2]); return; }
    // ── 바탕 ──
    let bgc = P(cs.backgroundColor), bi = cs.backgroundImage, 새바탕 = null;
    if(bi && /gradient\(/.test(bi) && !bi.includes('url(') && !사진안.has(e)){
      // 그러데이션 — 색 마디마다 밝게 바꿔 다시 그린다(어두운 마디 → 미색 · 흰색 / 색 있는 어두운 마디 → 옅은 같은 색)
      const 밝게 = c => { if(c.a <= .3) return null; const q = HSL(c); if(q.l >= .36) return null;
        return q.s < .2 ? (q.l < .1 ? T.bg : q.l < .17 ? T.card : T.sunk) : hsl(q.h, Math.min(.55, q.s + .1), .93); };
      let 바뀜 = false; const nb = bi.replace(/rgba?\([^)]+\)/g, m => { const n = 밝게(P(m)); if(n){ 바뀜 = true; return n; } return m; });
      if(바뀜){ st['background-image'] = nb; bgc = null; }
      else {   // 금색 그러데이션 단추 — 첫 금색 마디를 바탕색으로 보고 아래 단추 규칙에 넘긴다
        const 금 = [...bi.matchAll(/rgba?\([^)]+\)/g)].map(m => P(m[0])).find(c => { if(!c || c.a < .6) return false; const q = HSL(c); return q.h >= 28 && q.h < 50 && q.s > .4 && q.l > .6; });
        if(금 && 단추몸){ bgc = 금; st['background-image'] = 'none'; }
      }
    }
    if(bgc && bgc.a > .5 && (!사진안.has(e) || 단추)){
      const {h,s,l} = HSL(bgc);
      if(l < .36 && !사진안.has(e)){                                           // 어두운 판
        if(s < .2) 새바탕 = l < .1 ? T.bg : l < .17 ? T.card : T.sunk;
        else 새바탕 = hsl(h, Math.min(.55,s+.1), .94);                           // 색 있는 어두운 판 → 옅은 같은 색
      } else if(h >= 28 && h < 50 && s > .4 && l > .6 && 단추몸){
        const 형제 = e.matches('button,[data-act]') && e.parentElement ? [...e.parentElement.children].filter(x => x !== e && x.matches('button,[data-act]') && x.offsetParent).length : 0;
        const 알약 = parseFloat(cs.borderTopLeftRadius) >= e.offsetHeight / 2 - 1;
        const 판 = e.parentElement ? getComputedStyle(e.parentElement) : null, 트랙 = 판 && ((P(판.backgroundColor)||{a:0}).a > 0 || parseFloat(판.borderTopWidth) > 0 || 판.backgroundImage !== 'none');
        if(형제 >= 1 && 트랙){ 새바탕 = '#ffffff'; st.color = T.blue; st['border-color'] = T.blueLine; st['border-width'] = '1.5px'; st['border-style'] = 'solid'; }   // 고른 보기 전환(판 안)
        else if(형제 >= 1 && 알약 && e.offsetHeight < 44){ 새바탕 = T.goldSoft; st.color = T.goldInk; st['border-color'] = T.gold; st['border-width'] = '1.5px'; st['border-style'] = 'solid'; }      // 켠 칩
        else if(형제 >= 1 && 트랙){ 새바탕 = '#ffffff'; st.color = T.blue; st['border-color'] = T.blueLine; st['border-width'] = '1.5px'; st['border-style'] = 'solid'; }   // 고른 보기 전환
        else { 새바탕 = T.brown; st.color = T.cream; st['border-color'] = T.brown; }                                       // 주 단추 (사진 위 단추도)
      } else if(s > .35 && l > .45 && l < .82 && !사진안.has(e)){                                // 채도 높은 판(딱지 · 색 칸) → 옅게
        새바탕 = hsl(h, Math.min(.7,s), .9); st.color = 뜻글자(bgc) || T.ink;
      }
      if(새바탕) st['background-color'] = 새바탕;
    } else if(bgc && bgc.a > 0 && bgc.a <= .5 && !사진안.has(e)){
      const {s,l} = HSL(bgc);
      if(s < .2 && l > .8) st['background-color'] = 'rgba(65,41,33,.05)';     // 흰 비침 → 옅은 갈색 비침
      if(s < .2 && l < .2) st['background-color'] = 'rgba(65,41,33,.04)';
    }
    // ── 글자 ──
    if(!st.color && !사진안.has(e)){
      const c = P(cs.color); if(c){ const n = 뜻글자(c); if(n) st.color = n; }
    }
    // ── 테 ──
    ['top','right','bottom','left'].forEach(sd => {
      if(parseFloat(cs['border-'+sd+'-width']) > 0){
        const c = P(cs['border-'+sd+'-color']); if(!c || c.a === 0 || st['border-color']) return;
        const {h,s,l} = HSL(c); let n = null;
        if(s < .2) n = l < .5 ? T.line : '#d6cbb9';
        else if(h >= 25 && h < 58) n = T.gold;
        else if(h >= 170 && h < 208) n = T.tealLine;
        else if(h >= 208 && h < 240) n = T.blueLine;
        else n = hsl(h, Math.min(.5,s), .72);
        st['border-'+sd+'-color'] = n;
      }
    });
    if(cs.boxShadow && cs.boxShadow !== 'none' && !e.matches('#sheet,#sheetbox,.sheet,.modal,dialog')) st['box-shadow'] = 'none';
    if(Object.keys(st).length) 고칠.push([e, st]);
  });
  고칠.forEach(([e, st]) => Object.entries(st).forEach(([k,v]) => e.style.setProperty(k, v, 'important')));
  // 브라운 주 단추 안의 글자 · 아이콘은 미색으로
  고칠.filter(([e, st]) => st['background-color'] === T.brown).forEach(([e]) => e.querySelectorAll('*').forEach(x => { if(!x.closest('svg') || x.tagName === 'svg') x.style.setProperty('color', T.cream, 'important'); }));
  document.documentElement.style.setProperty('color-scheme','light');
  return 고칠.length;
};
