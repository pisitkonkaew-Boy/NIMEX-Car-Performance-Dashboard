/* share.js — โหลดต่อจาก app.js
   1) หัวข้อ "ดีสุด/แย่สุด" แยกรายตัวชี้วัด ในหน้าแชร์และส่งออก (ข้อความ, Excel, PNG, PowerPoint, อินโฟกราฟิก A4)
   2) อินโฟกราฟิก 16:9 (1920×1080 → PNG 3840×2160) เลือกกราฟ 4 ช่องได้เอง
   ไม่เปลี่ยนสูตรคำนวณเดิม ใช้ฟังก์ชันของ app.js ทั้งหมด */
(()=>{
if(window.__share169)return;window.__share169=true;
const GOOD='#1f8a4c',BAD='#b8334a',NAVY='#0a2a5e',GOLD='#d4af37',INK='#0b1f3f',MUT='#55657f',LINE='#dbe3f0',PREVC='#a9bbdc';

/* ---------- ดีสุด/แย่สุด ---------- */
const BWN={pf:'กำไร',ratio:'ค่าใช้จ่ายต่อรายได้',util:'การใช้งาน',fr:'น้ำมันต่อรายได้',kl:'กม.ต่อลิตร',bk:'บาทต่อกม.',pcars:'รถทำกำไร'};
const mOf=k=>AM.find(m=>'bw-'+m.k===k);
AM.forEach(m=>{SECS.push(['bw-'+m.k,'ดีสุด/แย่สุด: '+m.t+(m.dir<0?' (ต่ำ = ดี)':'')]);SECI['bw-'+m.k]='swap'});
/* เรียงจากดีไปแย่ ตัวชี้วัดที่ต่ำ = ดี (dir −1) จะเรียงกลับด้านเอง */
const ranked=(R,m)=>R.filter(o=>Number.isFinite(m.f(o))).sort((a,b)=>(m.f(b)-m.f(a))*m.dir);
/* ดีสุด n + แย่สุด n ถ้ามีไม่ถึง 2n ใช้ครึ่งหนึ่งของที่มี จึงไม่ซ้ำกัน */
const pickBW=(R,n)=>{const k=Math.min(n,Math.floor(R.length/2));return{best:R.slice(0,k),worst:R.slice(R.length-k).reverse()}};
function bwData(m){const Z=ranked(dim('zone',range(),filt({zone:'',dc:''})),m),D=ranked(dim('dc',range(),filt({dc:''})).filter(o=>o.carsN>0),m);return{Z,D,z:pickBW(Z,3),d:pickBW(D,5)}}
function bwRows(m){const{z,d}=bwData(m),r=[];z.best.forEach((o,i)=>r.push({tag:'ดีสุด',lv:'ภาค',i,o}));z.worst.forEach((o,i)=>r.push({tag:'แย่สุด',lv:'ภาค',i,o}));d.best.forEach((o,i)=>r.push({tag:'ดีสุด',lv:'DC',i,o}));d.worst.forEach((o,i)=>r.push({tag:'แย่สุด',lv:'DC',i,o}));return r}
const bwTitle=m=>`ดีสุด/แย่สุด: ${m.t}${m.dir<0?' (ต่ำ = ดี)':''}`;
function bwPiece(m,w,h){const R=bwRows(m);if(!R.length)return{t:bwTitle(m),s:`<text x="${w/2}" y="40" text-anchor="middle" font-size="16" fill="${MUT}">ไม่มีข้อมูลในช่วงที่เลือก</text>`,h:h||60};
 const t=miniTable([{t:'ผล',w:1.3,c:1,f:r=>r.tag,col:r=>r.tag==='ดีสุด'?GOOD:BAD},{t:'ระดับ',w:1,c:1,f:r=>r.lv+' '+(r.i+1)},{t:'ชื่อ',w:4.2,f:r=>r.o.name},{t:'ภาค',w:1.9,f:r=>r.lv==='DC'?zoneOf(r.o.key):'–'},{t:'คัน',w:1,r:1,f:r=>fmtN(r.o.carsN)},{t:m.t,w:2.4,r:1,f:r=>m.x(m.f(r.o)),col:r=>r.tag==='ดีสุด'?GOOD:BAD}],R,w,h);return{t:bwTitle(m),s:t.s,h:t.h}}
const _secDraw=window.secDraw;window.secDraw=function(k,W=1200){const m=k&&k.startsWith('bw-')&&mOf(k);if(m)return bwPiece(m,W);return _secDraw.apply(this,arguments)};
const _infoPiece=window.infoPiece;window.infoPiece=function(k,w,o={}){const m=k&&k.startsWith('bw-')&&mOf(k);if(m)return bwPiece(m,w,o.h);const p=_infoPiece.apply(this,arguments);if(k==='cmp'&&p&&p.s)p.s=p.s.split('#1d57b8').join(GOOD);return p};
const _summary=window.summaryText;window.summaryText=function(){let t=_summary.apply(this,arguments);const L=[];
 AM.forEach(m=>{if(!picked.has('bw-'+m.k))return;const{z,d}=bwData(m),ln=(arr,icon)=>arr.forEach((o,i)=>L.push(`${icon} ${i+1}. ${o.name} (${fmtN(o.carsN)} คัน): ${m.x(m.f(o))}`));
  L.push('',`🏅 ${bwTitle(m)}`);if(z.best.length){L.push('🗺️ ภาคดีสุด');ln(z.best,'✅');L.push('🗺️ ภาคแย่สุด');ln(z.worst,'❌')}if(d.best.length){L.push('📍 DC ดีสุด');ln(d.best,'✅');L.push('📍 DC แย่สุด');ln(d.worst,'❌')}if(!z.best.length&&!d.best.length)L.push('ไม่มีข้อมูลพอให้จัดอันดับ')});
 return L.length?t+'\n'+L.join('\n'):t};
const r2=v=>Number.isFinite(v)?Math.round(v*100)/100:'';
const _sheets=window.sheetsData;window.sheetsData=function(){const out=_sheets.apply(this,arguments);
 AM.forEach(m=>{if(!picked.has('bw-'+m.k))return;const{Z,D,z,d}=bwData(m),tag=(o,s)=>s.best.includes(o)?'ดีสุด':s.worst.includes(o)?'แย่สุด':'';
  const rows=[['ระดับ','อันดับ (ดีไปแย่)','ชื่อ','ภาค','คัน',m.t+(m.dir<0?' (ต่ำ = ดี)':''),'ผล']];Z.forEach((o,i)=>rows.push(['ภาค',i+1,o.name,o.name,o.carsN,r2(m.f(o)),tag(o,z)]));D.forEach((o,i)=>rows.push(['DC',i+1,o.name,zoneOf(o.key),o.carsN,r2(m.f(o)),tag(o,d)]));
  out.push(['ดีแย่-'+BWN[m.k],rows])});return out};
const _open=window.openExport;window.openExport=function(){_open.apply(this,arguments);const box=$('#sheet');if(!box)return;
 const first=box.querySelector('[data-sec^="bw-"]');if(first){const p=document.createElement('p');p.style.cssText='grid-column:1/-1;margin:8px 0 0;font-weight:600';p.textContent='ดีสุด/แย่สุดรายตัวชี้วัด (ภาค 3 + 3, DC 5 + 5)';first.closest('label').before(p)}
 const btns=box.querySelector('.btns');if(btns){const d=document.createElement('div');d.className='i169';d.style.cssText='display:grid;gap:8px;border:1px solid var(--line);border-radius:12px;padding:12px';
  const sl=slots();d.innerHTML=`<b>อินโฟกราฟิก 16:9</b><p class="say" style="margin:0">ใช้ตัวกรองบนหน้าเป็นตัวกำหนด ไม่ต้องติ๊กหัวข้อ เลือกกราฟทั้ง 4 ช่องได้เอง ระบบจะจำค่าที่เลือกไว้ในเครื่องนี้</p><div style="display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))">${[0,1,2,3].map(i=>`<label style="display:grid;gap:4px"><span>กราฟช่องที่ ${i+1}</span><select data-slot="${i}" style="padding:8px;border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--ink)">${Object.entries(CH).map(([k,c])=>`<option value="${k}"${sl[i]===k?' selected':''}>${esc(c.n)}</option>`).join('')}</select></label>`).join('')}</div><button class="btn" data-act="doinfo169" style="background:linear-gradient(180deg,#f0d57a,#d4af37);color:#0a2a5e">อินโฟกราฟิก 16:9</button>`;btns.after(d)}};

/* ---------- อินโฟกราฟิก 16:9 ---------- */
const DEF=['zonePf','zoneRevCost','zoneUtilKl','carDonut'],LS='fleet-i169';
function slots(){let v=null;try{v=JSON.parse(localStorage.getItem(LS))}catch(e){}return Array.isArray(v)&&v.length===4?v.map((k,i)=>CH[k]?k:DEF[i]):DEF.slice()}
document.addEventListener('change',e=>{const i=e.target.dataset&&e.target.dataset.slot;if(i===undefined)return;const v=slots();v[+i]=e.target.value;try{localStorage.setItem(LS,JSON.stringify(v))}catch(x){}});
const nice=v=>{const p=Math.pow(10,Math.floor(Math.log10(Math.abs(v)||1)));return Math.floor(v/p)*p};
/* แท่งแนวนอน 1–2 ชุด ต่อรายการ ค่าแสดงในคอลัมน์ขวา ถ้าค่าอยู่ช่วงแคบให้แกนไม่เริ่มที่ 0 */
function hbarsX({items,series,w,h,fmt,narrow,unit=''}){const lg=26,labelW=Math.min(w*.4,Math.max(120,...items.map(i=>String(i.l).length*8.6+18))),valW=series.length>1?Math.min(220,w*.27):Math.min(130,w*.2),gw=w-labelW-valW-16,top=lg+6,rowH=Math.min(56,(h-top-4)/Math.max(1,items.length)),bh=Math.min(series.length>1?13:20,(rowH-6)/series.length);
 const all=[];items.forEach(it=>series.forEach(s=>{const v=it.v[s.k];if(Number.isFinite(v))all.push(v)}));let mn=Math.min(0,...all),mx=Math.max(0,...all),note='';
 if(narrow&&all.length&&Math.min(...all)>0){const lo=Math.min(...all),hi=Math.max(...all);if((hi-lo)/hi<.4){mn=Math.max(0,nice(lo-(hi-lo)*.35-1e-9));mx=hi;note=`แกนเริ่มที่ ${fmt(mn)}${unit}`}}
 const sc=v=>(Math.max(mn,Math.min(mx,v))-mn)/((mx-mn)||1)*gw,x0=labelW+sc(Math.max(mn,0));let s='';
 series.forEach((ser,i)=>{const x=i*150;s+=`<rect x="${x}" y="4" width="16" height="16" rx="4" fill="${ser.c}"/><text x="${x+22}" y="17" font-size="15" fill="${INK}">${esc(ser.n)}</text>`});
 if(note)s+=`<text x="${w}" y="17" text-anchor="end" font-size="14" fill="${MUT}">${esc(note)}</text>`;
 s+=`<line x1="${x0}" x2="${x0}" y1="${top}" y2="${h-2}" stroke="${LINE}" stroke-width="1.5"/>`;
 const off=Math.max(0,(h-top-4-rowH*items.length)/2);items.forEach((it,j)=>{const y=top+off+j*rowH,cy=y+rowH/2,sel=it.sel;if(j%2)s+=`<rect x="0" y="${y}" width="${w}" height="${rowH}" fill="#f6f8fc"/>`;
  s+=`<text x="${labelW-10}" y="${cy+5}" text-anchor="end" font-size="15" font-weight="${sel?600:400}" fill="${sel?'#8a6d10':INK}">${esc(it.l)}</text>`;
  const gh=bh*series.length;series.forEach((ser,i)=>{const v=it.v[ser.k],by=cy-gh/2+i*bh;if(!Number.isFinite(v))return;const a=sc(v)+labelW,xa=Math.min(a,x0),bw=Math.max(1.5,Math.abs(a-x0));s+=`<rect x="${xa}" y="${by+1}" width="${bw}" height="${bh-2}" rx="3" fill="${ser.c}"/>`});
  const tx=series.map(ser=>{const v=it.v[ser.k];return`<tspan fill="${ser.c===PREVC?MUT:INK}" font-weight="${ser.c===PREVC?400:600}">${esc(Number.isFinite(v)?fmt(v)+unit:'–')}</tspan>`}).join(`<tspan fill="${MUT}"> / </tspan>`);
  s+=`<text x="${w}" y="${cy+5}" text-anchor="end" font-size="15">${tx}</text>`});return s}
const zoneItems=(r,f)=>dim('zone',r,f||filt({zone:'',dc:''}));
const byKey=A=>{const m={};A.forEach(o=>m[o.key??o.name]=o);return m};
const CH={
 zonePf:{n:'กำไร-ขาดทุนรายภาค เทียบช่วงก่อนหน้า',d(w,h){const Z=zoneItems(range()).sort((a,b)=>pfOf(a)-pfOf(b)),p=prevRange(),P=p?byKey(zoneItems(p)):{},ser=[{k:'c',n:'ช่วงนี้',c:NAVY}];if(p)ser.push({k:'p',n:prevLabel(),c:PREVC});
  let s=hbarsX({items:Z.map(z=>{const q=P[z.key??z.name];return{l:zl(z),sel:S.zone===z.name,v:{c:pfOf(z)/1e6,p:q?pfOf(q)/1e6:NaN}}}),series:ser,w,h,fmt:v=>(v<0?'−':'')+fmtN(Math.abs(v),2)});if(!p)s+=`<text x="${w}" y="17" text-anchor="end" font-size="14" fill="${MUT}">ไม่มีช่วงก่อนหน้า</text>`;return{t:'กำไร-ขาดทุนรายภาค (ล้านบาท · จำนวนคัน)',s}}},
 zoneRevCost:{n:'รายได้เทียบค่าใช้จ่ายรายภาค',d(w,h){const Z=zoneItems(range()).sort((a,b)=>b.rev-a.rev);return{t:'รายได้เทียบค่าใช้จ่ายรายภาค (ล้านบาท · จำนวนคัน)',s:hbarsX({items:Z.map(z=>({l:zl(z),sel:S.zone===z.name,v:{r:z.rev/1e6,c:rowCost(z)/1e6}})),series:[{k:'r',n:'รายได้',c:NAVY},{k:'c',n:'ค่าใช้จ่าย',c:GOLD}],w,h,fmt:v=>fmtN(v,2)})}}},
 zoneUtilKl:{n:'การใช้งาน + กม./ลิตร รายภาค',d(w,h){const Z=zoneItems(range()),g=24,hw=(w-g)/2,A=Z.slice().sort((a,b)=>M_.util(b)-M_.util(a)),B=Z.slice().sort((a,b)=>M_.kl(b)-M_.kl(a));
  const s1=hbarsX({items:A.map(z=>({l:zl(z),sel:S.zone===z.name,v:{u:M_.util(z)}})),series:[{k:'u',n:'อัตราการใช้งาน',c:NAVY}],w:hw,h,fmt:v=>fmtN(v,1),unit:'%',narrow:true}),s2=hbarsX({items:B.map(z=>({l:zl(z),sel:S.zone===z.name,v:{k:M_.kl(z)}})),series:[{k:'k',n:'กม./ลิตร (ทุกชนิด)',c:GOLD}],w:hw,h,fmt:v=>fmtN(v,2),narrow:true});
  return{t:'อัตราการใช้งานและกม./ลิตรรายภาค',s:`<g>${s1}</g><line x1="${hw+g/2}" x2="${hw+g/2}" y1="0" y2="${h}" stroke="${LINE}"/><g transform="translate(${hw+g} 0)">${s2}</g>`}}},
 carDonut:{n:'สัดส่วนรถทำกำไร + 3 DC ขาดทุนสูงสุด',d(w,h){const o=total(range(),filt()),pp=o.carsP,nn=Math.max(0,o.carsN-o.carsP),D=Math.min(h-6,w*.36),parts=[{l:'ทำกำไร',v:pp,c:GOOD},{l:'ขาดทุน',v:nn,c:BAD}],e=embed(donut({parts,center:fmtP(M_.pcars(o),0),sub:'รถทำกำไร',P:LIGHT}),0,0,D);
  let s=`<g transform="translate(0 ${(h-D)/2})">${e.s}</g>`;const lx=D+30;parts.forEach((p,i)=>{s+=`<rect x="${lx}" y="${8+i*30}" width="16" height="16" rx="4" fill="${p.c}"/><text x="${lx+24}" y="${21+i*30}" font-size="15" fill="${INK}">${p.l} ${fmtN(p.v)} คัน</text>`});
  const W3=dim('dc',range(),filt({dc:''})).sort((a,b)=>pfOf(a)-pfOf(b)).slice(0,3),ty=80;s+=`<text x="${lx}" y="${ty}" font-size="16" font-weight="600" fill="${BAD}">3 DC ขาดทุนสูงสุด</text>`;
  const rw=w-lx,rh=Math.min(46,(h-ty-10)/3);W3.forEach((x,i)=>{const y=ty+12+i*rh;s+=`<rect x="${lx}" y="${y}" width="${rw}" height="${rh-6}" rx="8" fill="#fbeef1"/><circle cx="${lx+18}" cy="${y+(rh-6)/2}" r="11" fill="${BAD}"/><text x="${lx+18}" y="${y+(rh-6)/2+5}" text-anchor="middle" font-size="13" font-weight="600" fill="#fff">${i+1}</text><text x="${lx+38}" y="${y+(rh-6)/2+5}" font-size="15" fill="${INK}">${esc(x.name)} (${fmtN(x.carsN)} คัน)</text><text x="${w-10}" y="${y+(rh-6)/2+5}" text-anchor="end" font-size="15" font-weight="600" fill="${BAD}">${fmtB(pfOf(x))}</text>`});
  if(!W3.length)s+=`<text x="${lx}" y="${ty+30}" font-size="15" fill="${MUT}">ไม่มีข้อมูล</text>`;return{t:'สัดส่วนรถทำกำไร และ 3 DC ขาดทุนสูงสุด (บาท)',s}}},
 typePf:{n:'กำไร-ขาดทุนตามชนิดรถ (040 / 042)',d(w,h){const T=[['040','040 ปิกอัพ (AB)'],['042','042 ควบคุมอุณหภูมิ (CC)']].map(([k,l])=>{const o=total(range(),filt({type:k}));return{l:`${l} (${fmtN(o.carsN)})`,v:{p:pfOf(o)/1e6}}});return{t:'กำไร-ขาดทุนตามชนิดรถ (ล้านบาท · จำนวนคัน)',s:hbarsX({items:T,series:[{k:'p',n:'กำไร-ขาดทุน',c:NAVY}],w,h,fmt:v=>(v<0?'−':'')+fmtN(Math.abs(v),2)})}}},
 zoneRatio:{n:'ค่าใช้จ่ายต่อรายได้รายภาค (ต่ำ = ดี)',d(w,h){const Z=zoneItems(range()).sort((a,b)=>M_.ratio(a)-M_.ratio(b));return{t:'ค่าใช้จ่ายต่อรายได้รายภาค (ต่ำ = ดี · จำนวนคัน)',s:hbarsX({items:Z.map(z=>({l:zl(z),sel:S.zone===z.name,v:{r:M_.ratio(z)}})),series:[{k:'r',n:'ค่าใช้จ่ายต่อรายได้',c:NAVY}],w,h,fmt:v=>fmtN(v,1),unit:'%',narrow:true})}}},
 trend:{n:'รายได้เทียบค่าใช้จ่ายรายวัน',d(w,h){const p=_infoPiece('trend',w,{h});return{t:p.t,s:p.s}}},
 cost:{n:'สัดส่วนค่าใช้จ่าย',d(w,h){const p=_infoPiece('cost',w,{h});return{t:p.t,s:p.s}}},
 worstDc:{n:'5 DC ขาดทุนสูงสุด',d(w,h){const R=dim('dc',range(),filt({dc:''})).sort((a,b)=>pfOf(a)-pfOf(b)).slice(0,5),t=miniTable([{t:'#',w:.8,c:1,rank:1,f:()=>''},{t:'DC',w:4,f:x=>x.name},{t:'ภาค',w:2,f:x=>zoneOf(x.key)},{t:'คัน',w:1,r:1,f:x=>fmtN(x.carsN)},{t:'กำไร-ขาดทุน',w:2.4,r:1,f:x=>fmtB(pfOf(x)),col:()=>BAD}],R,w,h);return{t:'5 DC ขาดทุนสูงสุด (บาท)',s:t.s}}}};
const CHI={zonePf:'pin',zoneRevCost:'money',zoneUtilKl:'usage',carDonut:'star',typePf:'truck',zoneRatio:'pct',trend:'line',cost:'bill',worstDc:'alert'};
const plain=x=>String(x||'').replace(/<[^>]+>/g,'').trim();
function kpiRow169(x0,y0,W,kh){const K=kpiData(),L=K.list,n=L.length,gap=14,cw=(W-(n-1)*gap)/n;let s='';
 L.forEach((t,i)=>{const x=x0+i*(cw+gap),g=t.show?t.g:null,bar=GC[g]||GOLD,lbl=t.id==='pcars'?'รถที่ทำกำไร':t.l.replace('รถบริษัท','').replace('อัตรา','');
  let dl;if(!K.q)dl=`<text x="${cw/2}" y="${kh-22}" text-anchor="middle" font-size="14" fill="#cfdcf2">ไม่มีช่วงก่อนหน้า</text>`;else{const txt=plain(t.d)||'–',c=t.up===null?MUT:t.up?GOOD:BAD,pw=Math.min(cw-20,txt.length*9+30);dl=`<rect x="${(cw-pw)/2}" y="${kh-42}" width="${pw}" height="28" rx="14" fill="#fff"/><text x="${cw/2}" y="${kh-22.5}" text-anchor="middle" font-size="15" font-weight="600" fill="${c}">${esc(txt)}</text>`}
  s+=`<g transform="translate(${x} ${y0})"><rect width="${cw}" height="${kh}" rx="14" fill="${NAVY}"/><rect y="${kh-5}" width="${cw}" height="5" fill="${bar}"/><circle cx="22" cy="22" r="14" fill="${GOLD}"/>${svgI(KI[t.id],13,13,18,NAVY,2.2)}<text x="${cw/2}" y="31" text-anchor="middle" font-size="15" fill="#e6d79c">${esc(lbl)}</text>
   <text x="${cw/2}" y="84" text-anchor="middle" font-size="36" font-weight="600" font-family="Prompt,sans-serif" fill="#fff">${esc(t.txt)}</text><text x="${cw/2}" y="110" text-anchor="middle" font-size="13" fill="#cfdcf2">${esc(t.unit||'')}${K.q?(t.unit?' · ':'')+'ก่อนหน้า '+esc(t.prev):''}</text>${dl}
   ${g?`<rect x="${cw-44}" y="8" width="34" height="34" rx="9" fill="${bar}"/><text x="${cw-27}" y="32" text-anchor="middle" font-size="19" font-weight="600" fill="#fff">${g}</text>`:''}</g>`});return s}
function info169(){const W=1920,H=1080,head=120,foot=46,m=24,kh=178,K=kpiData();let b=sheetHead(W,head,'h169');
 b+=kpiRow169(m,head+m,W-2*m,kh);
 const gy=head+m+kh+m+6,cw=(W-3*m)/2,chh=(H-foot-m-gy-m)/2,S4=slots();
 S4.forEach((k,i)=>{const c=CH[k]||CH[DEF[i]],x=m+(i%2)*(cw+m),y=gy+Math.floor(i/2)*(chh+m),iw=cw-2*CARD.pad,ih=chh-CARD.top-CARD.pad,p=c.d(iw,ih),key='c169'+i;SECI[key]=CHI[k]||'star';b+=card({t:p.t,s:p.s},key,x,y,cw,chh)});
 b+=`<rect y="${H-foot}" width="${W}" height="${foot}" fill="${NAVY}"/><rect y="${H-foot}" width="${W}" height="3" fill="${GOLD}"/><text x="${W/2}" y="${H-foot/2+6}" text-anchor="middle" font-size="15" fill="#dfe8f7">ค่าใช้จ่าย = ค่าเช่า + น้ำมัน + ค่าจ้าง + Incentive + ค่าซ่อม · การใช้งาน = วันวิ่ง ÷ วันทำการ (จ.–ส. สูงสุด 26 วัน) · เกรดคิดเฉพาะภาพรวมบริษัท · ผลต่าง: <tspan fill="#7fe0a8">เขียว = ดีขึ้น</tspan> <tspan fill="#ff9fb0">แดง = แย่ลง</tspan>${K.q?' · เทียบกับ '+esc(prevLabel()):''}</text>`;
 return wrap(W,H,b)}
window.info169=info169;
const _do=window.doExport;window.doExport=async a=>{if(a!=='doinfo169')return _do(a);if(!window.ADMIN)return;
 document.querySelectorAll('.btn').forEach(b=>b.disabled=true);say('กำลังสร้างอินโฟกราฟิก 16:9…');
 try{await document.fonts.ready;const c=info169(),b=await toPng(c,2);await save(stamp()+'-Infographic-16x9.png',b)}catch(e){say('สร้างอินโฟกราฟิกไม่สำเร็จ ลองเปิดหน้าใหม่อีกครั้ง');console.error(e)}
 document.querySelectorAll('.btn').forEach(b=>b.disabled=false)};
})();
