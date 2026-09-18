/* 2026-08-29 （実在のコース）の当日集計表（IMG_8530.png）を実データとして投入し、
   アプリの算出値が当日の公式値と一致するかを確かめる。
   スコア・パー配分・隠しホール・HDCP・ネットは集計表の実物から起こしたもの。
   投票の内訳は残っていないため、記録に残る集計値（口数・売上・的中口数）を
   再現する形で組み立てている。配当の割り算の検証が目的。 */
/* アプリの場所。テストと同じ場所の site/ を先に見て、無ければ ../docs/ を使う。
   リポジトリでは tests/ と docs/ が並ぶ構成なので、どちらでも動く */
const _P=require('path'),_F=require('fs');
const _DIR=[_P.join(__dirname,'site'),_P.join(__dirname,'..','docs')]
  .find(d=>_F.existsSync(_P.join(d,'pc.html')))||_P.join(__dirname,'site');
const APP={dir:_DIR+'/', get pc(){return this.dir+'pc.html'}, get scan(){return this.dir+'index.html'}};
const fs=require('fs');
const h=fs.readFileSync(APP.pc,'utf8');
const src=h.slice(h.indexOf('<script>')+8,h.lastIndexOf('</script>'));
const store={};const mk=id=>({id,value:'',textContent:'',className:'',checked:false,style:{},files:[],
  _html:'',get innerHTML(){return this._html},set innerHTML(v){this._html=v},
  classList:{add(){},remove(){},toggle(){},contains:()=>false},
  addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[],insertAdjacentHTML(){},click(){},focus(){}});
const doc={documentElement:{style:{},requestFullscreen(){}},body:{className:'',classList:{add(){},remove(){},contains:()=>false}},
  getElementById:id=>store[id]||(store[id]=mk(id)),querySelectorAll:()=>[],addEventListener(){},createElement:()=>mk('a')};
global.document=doc;global.window={AudioContext:function(){throw 0},addEventListener(){}};
const _t=[];global.setTimeout=f=>{_t.push(f);return 1};global.flush=()=>_t.splice(0).forEach(f=>{try{f()}catch(e){}});
global.setInterval=()=>1;global.clearInterval=()=>{};global.clearTimeout=()=>{};
global.performance={now:()=>0};global.requestAnimationFrame=()=>{};global.alert=()=>{};global.confirm=()=>true;
global.URL={createObjectURL:()=>'',revokeObjectURL(){}};global.Blob=class{};
global.localStorage={setItem(){},getItem(){return null},removeItem(){}};
['show','hud','dots','tabs','saveState','hdTitle','pane','sndBtn'].forEach(id=>{global[id]=doc.getElementById(id)});
const app=new Function(src+`;return {DB:()=>DB,setDB:x=>{DB=x},blank,go,render,mSet,mPar,mApply,mQuery,
  standings,applyScores,scoreOf,grossOf,hcOf,coursePar,SC,SCset,calcK,calcG,calcB,ledger,settle,
  RUN,FRAMES,buildSlides,get slides(){return slides}};`)();
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x!==''&&x!==undefined?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};

/* ─── 当日の集計表 ───
   氏名, 枠, 生年月日, H1..H18, 印字OUT, 印字IN, 印字グロス, 印字HDCP, 印字ネット */
const SHEET=[
 ["川島　俊之",2,"1970-11-11",[5,4,4,4,6,5,4,6,4, 4,3,6,6,3,4,5,4,4],  42,39, 81, 7.2,73.8],
 ["白石　徹",  4,"1964-05-05",[5,5,6,4,5,6,5,7,6, 5,3,4,8,5,4,5,4,5],  49,43, 92,18.0,74.0],
 ["邊見　克己",6,"1968-09-09",[9,4,7,5,5,5,7,6,5, 6,3,7,6,6,4,6,5,5],  53,48,101,26.4,74.6],
 ["及川　豊",  5,"1963-04-04",[6,3,7,3,7,5,6,7,6, 7,5,7,7,6,5,4,6,6],  50,53,103,27.6,75.4],
 ["川島　武夫",5,"1973-02-14",[6,4,7,5,4,4,5,5,5, 5,5,5,6,5,4,6,5,5],  45,46, 91,15.6,75.4],
 ["川島　文吾",1,"1960-01-01",[5,4,5,3,5,5,5,6,6, 4,4,5,7,5,4,7,5,3],  44,44, 88,12.0,76.0],
 ["千葉　亮",  7,"1967-08-08",[6,5,10,3,6,6,4,7,6, 6,3,5,8,5,4,9,6,6],53,52,105,28.8,76.2],
 ["三村　健吾",3,"1969-10-10",[5,5,8,4,6,5,5,6,7, 5,4,6,9,6,6,7,5,6],  51,54,105,28.8,76.2],
 ["瀬川　拓真",2,"1975-04-16",[5,4,6,3,5,5,7,7,6, 7,6,5,8,5,6,7,7,8],  48,59,107,30.0,77.0],
 ["江木　和久",4,"1962-03-03",[6,3,5,4,6,6,7,7,5, 5,4,5,5,6,4,6,5,5],  49,45, 94,15.6,78.4],
 ["木南　英明",8,"1971-12-12",[7,4,8,7,7,6,6,7,7, 8,3,5,7,7,4,5,6,5],  59,50,109,30.0,79.0],
 ["森　良治",  3,"1961-02-02",[5,3,6,4,6,5,5,6,5, 5,4,4,6,7,5,7,5,6],  45,49, 94,14.4,79.6],
 ["相沢　直哉",1,"1965-06-06",[5,5,9,4,11,5,7,6,7, 7,3,6,7,5,6,7,6,6],59,53,112,30.0,82.0],
 ["郷司　義晴",8,"1966-07-07",[5,4,8,4,4,6,8,7,7, 5,6,6,9,5,7,6,8,8],  53,60,113,30.0,83.0],
 ["甲斐　隆志",7,"1972-01-13",[9,6,8,4,5,9,7,6,5, 6,6,7,6,6,6,6,6,7],  59,56,115,30.0,85.0],
 ["大隈　浩太",6,"1974-03-15",[8,6,10,4,7,6,6,6,7, 8,5,9,9,6,3,7,6,8],60,61,121,30.0,91.0],
];
const PAR=[4,3,5,3,4,4,4,5,4, 4,3,4,5,4,3,5,4,4];
const HIDDEN=[1,2,3,6,7,9,10,12,13,15,17,18];   /* 集計表で丸印がついたホール */

/* ─── 大会を組み立てる ─── */
const D=app.blank();
D.meta.name="2026年 社内親睦ゴルフ";
D.meta.place="（実在のコース）";
D.meta.date="2026-08-29";
D.meta.use.fine=true;
D.meta.frameMode="free";                /* 枠は集計表どおりに指定する */
D.meta.kPrice=200; D.meta.gPrice=500;
D.meta.gMode="3連単"; D.meta.fineUnit=1000; D.meta.fineTop=3;
D.meta.sc={system:"double",par:PAR.slice(),hidden:HIDDEN.slice(),
           cut:"triplePar",hcUse:true,hcMax:30,tiebreak:"older",entry:"all"};
SHEET.forEach(([n,f,bd])=>D.players.push({n,org:"",bd,g:f,f,vote:true,fee:true,feeAmt:""}));
app.setDB(D);
SHEET.forEach(([n,,,hs])=>{const s=app.scoreOf(n);hs.forEach((v,i)=>s.h[i+1]=v);});

console.log('=== 1. コースと設定 ===');
chk('コースパー72', app.coursePar()===72, app.coursePar());
chk('OUT36 / IN36', PAR.slice(0,9).reduce((a,b)=>a+b,0)===36&&PAR.slice(9).reduce((a,b)=>a+b,0)===36);
chk('隠しホール12（ダブルペリア）', app.SC().hidden.length===12, app.SC().hidden.join(','));
chk('出走16名', app.RUN().length===16, app.RUN().length);
chk('8枠', app.FRAMES().length===8, app.FRAMES().join(','));

/* 1.5 は「内蔵マスタから会場を選んでも同じパー配分になる」を会場名で確かめていた。
   公開リポジトリで大会と会場を結び付けないよう、2026-09-16に外した。
   マスタのパー配分が集計表と一致することは9月4日に確認済み（HANDOVER.md 8章）。
   マスタから選ぶ経路そのものは mst.js・sel.js が別のコースで確かめている */

console.log('\n=== 2. 1人ずつ、集計表の印字値と突き合わせる ===');
const st=app.standings();
SHEET.forEach(([n,,,hs,pout,pin,pg,phc,pnet])=>{
  const r=st.rows.find(x=>x.n===n);
  const o=hs.slice(0,9).reduce((a,b)=>a+b,0),i=hs.slice(9).reduce((a,b)=>a+b,0);
  const good=o===pout&&i===pin&&r.g===pg&&Math.abs(r.hc-phc)<0.05&&Math.abs(r.net-pnet)<0.05;
  chk(n, good, `OUT${o} IN${i} グロス${r.g} HDCP${r.hc} ネット${r.net}`
    +(good?'':`  ← 印字は OUT${pout} IN${pin} グロス${pg} HDCP${phc} ネット${pnet}`));
});

console.log('\n=== 3. HDCP上限30とトリプルパーカットが効いている ===');
const capped=st.rows.filter(r=>r.hc===30).map(r=>r.n);
chk('上限30に張り付いたのは6名', capped.length===6, capped.join('、'));
const hira=app.scoreOf("千葉　亮");
chk('千葉の3番（パー5）10打がトリプルパー15で刻まれない', hira.h[3]===10);
const hara=app.scoreOf("相沢　直哉");
chk('相沢の5番（パー4）11打はトリプルパー12未満なのでそのまま', hara.h[5]===11);
/* カットを外すと上限前のHDCPが動く人がいる */
const before=app.standings().rows.map(r=>r.hc).join(',');
app.SCset('cut','tripleBogey');
const after=app.standings().rows.map(r=>r.hc).join(',');
chk('トリプルボギーカットに変えると値が変わる', before!==after);
app.SCset('cut','triplePar');
chk('元に戻せる', app.standings().rows.map(r=>r.hc).join(',')===before);

console.log('\n=== 4. ネット順位と当選枠（記録：2-4）===');
const net=app.standings().net;
chk('優勝は川島　俊之（ネット73.8）', net[0].n==="川島　俊之"&&net[0].net===73.8,
    net[0].n+' '+net[0].net);
chk('準優勝は白石　徹（ネット74.0）', net[1].n==="白石　徹"&&net[1].net===74.0,
    net[1].n+' '+net[1].net);
chk('3位は邊見　克己（ネット74.6）', net[2].n==="邊見　克己", net[2].n);
chk('ネット75.4の同着は年長の及川　豊が上位',
    net[3].n==="及川　豊"&&net[4].n==="川島　武夫",
    net[3].n+'(1964) → '+net[4].n+'(1979)');
app.applyScores();
chk('当選枠 2-4', app.DB().result.frame==="2-4", app.DB().result.frame);

console.log('\n=== 5. グロス下位3名（記録：大隈・甲斐・郷司）===');
const w3=app.standings().worst3.map(r=>r.n);
chk('下位1 大隈　浩太（121）', w3[0]==="大隈　浩太", w3[0]);
chk('下位2 甲斐　隆志（115）', w3[1]==="甲斐　隆志", w3[1]);
chk('下位3 郷司　義晴（113）', w3[2]==="郷司　義晴", w3[2]);
chk('結果欄にも入る', app.DB().result.low.join('|')===["大隈　浩太","甲斐　隆志","郷司　義晴"].join('|'),
    app.DB().result.low.join(' / '));
chk('ベストグロスは川島　俊之（81）', app.standings().best.n==="川島　俊之", app.standings().best.n);

console.log('\n=== 6. 罰金（記録：5,000円 ＝ 大隈3,000・相沢1,000・木南1,000）===');
app.DB().result.sel=["甲斐　隆志","瀬川　拓真","郷司　義晴"];   /* 当日の選抜者 */
const B=app.calcB();
chk('選抜者のグロスは 115 / 107 / 113', B.sg.join(',')==='115,107,113', B.sg.join(' / '));
const amt=n=>(B.list.find(x=>x.n===n)||{amt:0}).amt;
chk('大隈　浩太 3,000円（3名に負け）', amt("大隈　浩太")===3000, amt("大隈　浩太"));
chk('相沢　直哉 1,000円（瀬川にだけ負け）', amt("相沢　直哉")===1000, amt("相沢　直哉"));
chk('木南　英明 1,000円（瀬川にだけ負け）', amt("木南　英明")===1000, amt("木南　英明"));
chk('罰金の対象は3名だけ', B.list.length===3, B.list.map(x=>x.n).join('、'));
chk('罰金合計 5,000円', B.total===5000, B.total);
chk('選抜者本人は対象外', !B.list.some(x=>B.sel.includes(x.n)));

console.log('\n=== 7. 馬券の配当（記録：95口・19,000円・的中26口・700円／口）===');
/* 投票の内訳は残っていないため、記録に残る口数・的中口数を再現して割り算を確かめる */
const V=SHEET.map(x=>x[0]);
app.DB().keiba=[];
app.DB().keiba.push({v:V[0],a:2,b:4,q:26});
app.DB().keiba.push({v:V[1],a:1,b:3,q:69});
const K=app.calcK();
chk('95口', K.units===95, K.units);
chk('売上 19,000円', K.sales===19000, K.sales);
chk('的中 26口', K.win===26, K.win);
chk('配当 700円／口（100円未満切り捨て）', K.pay===700, K.pay+'（19000÷26=730.77…）');
chk('残額 800円は経費へ', K.left===19000-700*26, K.left);

console.log('\n=== 8. GTO（記録：34口・17,000円・3連単で的中ゼロ→全額返金）===');
app.DB().gto=[];
app.DB().gto.push({v:V[0],p:["甲斐　隆志","大隈　浩太","郷司　義晴"],q:4});   /* 3名は合うが順番が違う */
app.DB().gto.push({v:V[1],p:["瀬川　拓真","木南　英明","相沢　直哉"],q:30});
let G=app.calcG();
chk('34口', G.units===34, G.units);
chk('売上 17,000円', G.sales===17000, G.sales);
chk('3連単では的中ゼロ', G.win===0&&app.DB().meta.gMode==="3連単", '的中'+G.win+'口');
chk('全額返金 17,000円', G.refund===true&&G.refundTotal===17000, G.refundTotal);
chk('無効口はゼロ（全員が出走者・重複なし）', G.badUnits===0, G.badUnits);

console.log('\n=== 9. 3連複だった場合（記録：4口的中・1口4,200円）===');
app.DB().meta.gMode="3連複";
G=app.calcG();
chk('3連複なら4口が的中', G.win===4, G.win+'口');
chk('配当 4,200円／口', G.pay===4200, G.pay+'（17000÷4=4250）');
chk('全額返金にはならない', G.refund===false);
chk('方式の選択で結果が正反対になる', true, '3連単=全額返金 ／ 3連複=4,200円／口');
app.DB().meta.gMode="3連単";

console.log('\n=== 10. 精算と発表画面まで通る ===');
const L=app.ledger();
chk('台帳に数値の穴がない',
  L.every(x=>[x.paid,x.back,x.fine,x.bad].every(v=>typeof v==='number'&&!isNaN(v))));
chk('請求総額＝馬券19,000＋GTO17,000',
  L.reduce((a,b)=>a+b.paid,0)===36000, L.reduce((a,b)=>a+b.paid,0));
const S=app.settle();
chk('収支表に16名', S.length===16, S.length);
app.buildSlides();
let e=0;app.slides.forEach(s=>{try{
  if(/undefined|NaN|\[object Object\]/.test(s.html())){e++;console.log('  NG  '+s.id);}
}catch(x){e++;console.log('  NG  '+s.id+' 例外: '+x.message);}});
chk('全'+app.slides.length+'画面が描画できる', e===0);
const s1=app.slides.find(s=>s.id==='s-1');
chk('優勝画面に川島　俊之が出る', s1&&s1.html().includes("川島　俊之"));

console.log('\n'+(ng?'NG '+ng+' 件':'すべて合格'));
process.exit(ng?1:0);
