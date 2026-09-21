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
  addEventListener(){},querySelector:s=>store[s.replace('#','')]||(store[s.replace('#','')]=mk(s)),
  querySelectorAll:()=>[],insertAdjacentHTML(){},click(){},focus(){}});
const doc={documentElement:{style:{},requestFullscreen(){}},body:{className:'',classList:{add(){},remove(){},contains:()=>false}},
  getElementById:id=>store[id]||(store[id]=mk(id)),querySelectorAll:()=>[],addEventListener(){},createElement:()=>mk('a')};
global.document=doc;global.window={AudioContext:function(){throw 0},addEventListener(){}};
const _t=[];global.setTimeout=f=>{_t.push(f);return 1};global.flush=()=>_t.splice(0).forEach(f=>{try{f()}catch(e){}});
global.setInterval=()=>1;global.clearInterval=()=>{};global.clearTimeout=()=>{};
global.performance={now:()=>0};global.requestAnimationFrame=()=>{};
let A=[];global.alert=m=>A.push(m);global.confirm=()=>true;
global.URL={createObjectURL:()=>'',revokeObjectURL(){}};global.Blob=class{};
global.localStorage={setItem(){},getItem(){return null},removeItem(){}};
['show','hud','dots','tabs','saveState','hdTitle','pane','sndBtn','skipN'].forEach(id=>{global[id]=doc.getElementById(id)});
const app=new Function(src+`;return {DB:()=>DB,blank,migrate,sample,go,SCset,scoreOf,standings,applyScores,
  prizeRows,prizeTotal,prizeOf,teams,TM,LK,luckyPool,drawLucky,pzSkip,pzAdd,budget,buildSlides,PZ,RUN,
  setDB:x=>{DB=x},prizeSet,skillRows,skillKinds,holeWarn,holeFit,holeApplyFit,mApply,mSet,mQuery,
  get slides(){return slides}};`)();
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};

app.sample(); global.flush(); app.applyScores();
console.log('=== 1. 飛び賞のまとめ追加 ===');
const before=app.PZ().rank.length;
store['skipN'].value='5'; A=[]; app.pzSkip();
const ranks=app.PZ().rank.filter(r=>r.kind==='rank').map(r=>r.n).sort((a,b)=>a-b);
chk('5位ごとに追加', ranks.includes(15), '順位賞の位: '+ranks.join(','));
chk('既にある5位・10位は重複しない', new Set(ranks).size===ranks.length, ranks.join(','));
A=[]; app.pzSkip();
chk('2回目は追加なし', A[0].includes('追加するものがありませんでした'), A[0]);

console.log('\n=== 2. 年齢賞 ===');
app.PZ().rank.push({label:'最年長',kind:'oldest',n:1,amt:1000});
app.PZ().rank.push({label:'最年少',kind:'youngest',n:1,amt:1000});
const R=app.prizeRows();
const oldest=R.find(r=>r.kind==='oldest').who, youngest=R.find(r=>r.kind==='youngest').who;
const bds=app.RUN().map(p=>[p.n,p.bd]).sort((a,b)=>a[1]<b[1]?-1:1);
chk('最年長が正しい', oldest===bds[0][0], oldest+'('+bds[0][1]+')');
chk('最年少が正しい', youngest===bds[bds.length-1][0], youngest+'('+bds[bds.length-1][1]+')');

console.log('\n=== 3. ベストOUT／IN・ハンディ最大 ===');
app.SCset('entry','all');
app.PZ().rank.push({label:'ベストOUT',kind:'bestOut',n:1,amt:1000});
app.PZ().rank.push({label:'ベストIN',kind:'bestIn',n:1,amt:1000});
app.PZ().rank.push({label:'HDCP最大',kind:'maxhc',n:1,amt:1000});
const R2=app.prizeRows();
const bo=R2.find(r=>r.kind==='bestOut').who, bi=R2.find(r=>r.kind==='bestIn').who;
const outs=app.RUN().map(p=>{const s=app.scoreOf(p.n);let t=0;for(let i=1;i<=9;i++)t+=+s.h[i];return [p.n,t];}).sort((a,b)=>a[1]-b[1]);
chk('ベストOUTが最少', bo===outs[0][0], bo+' '+outs[0][1]+'打');
const ins=app.RUN().map(p=>{const s=app.scoreOf(p.n);let t=0;for(let i=10;i<=18;i++)t+=+s.h[i];return [p.n,t];}).sort((a,b)=>a[1]-b[1]);
chk('ベストINが最少', bi===ins[0][0], bi+' '+ins[0][1]+'打');
chk('HDCP最大も出る', !!R2.find(r=>r.kind==='maxhc').who, R2.find(r=>r.kind==='maxhc').who);

console.log('\n=== 4. 団体賞 ===');
const T=app.teams();
chk('所属でチーム分け', T.rows.length===2, T.rows.map(t=>t.name+'('+t.n+'名)').join(' / '));
chk('上位3名で集計', T.rows[0].used.length===3, T.rows[0].used.length+'名');
chk('ネット合計の小さい順', T.rows[0].sum<=T.rows[1].sum, T.rows.map(t=>t.name+' '+t.sum).join(' / '));
const manual=T.rows[0].used.reduce((a,b)=>a+b.net,0);
chk('合計が手計算と一致', Math.abs(T.rows[0].sum-manual)<0.05);
app.TM().use='avg'; app.TM().size=0;
const T2=app.teams();
chk('全員・平均にも切替', T2.rows[0].used.length===8&&T2.key==='avg', T2.rows.map(t=>t.name+' 平均'+t.avg).join(' / '));
app.TM().use='sum'; app.TM().size=3;

console.log('\n=== 5. ラッキー賞 ===');
const pool1=app.luckyPool().length;
chk('受賞者を除いた対象', pool1<app.DB().players.length, pool1+'名 / 全'+app.DB().players.length+'名');
app.drawLucky();
const L=app.DB().result.lucky;
chk('2名当選', L.length===2, L.join(' / '));
chk('重複しない', new Set(L).size===L.length);
const wonNames=new Set(app.prizeRows().filter(r=>r.who).map(r=>r.who));
chk('既に受賞した人は当たらない', !L.some(n=>wonNames.has(n)));
chk('当選者に賞金が付く', app.prizeOf(L[0])>=app.PZ().lucky, L[0]+' '+app.prizeOf(L[0])+'円');
app.LK().exclude=false;
chk('除外を切ると全員が対象', app.luckyPool().length===app.DB().players.length);
app.LK().exclude=true;

console.log('\n=== 6. 賞金合計と収支 ===');
const P=app.prizeTotal();
chk('団体賞が合計に入る', P.team===app.PZ().team*app.TM().top, P.team);
chk('ラッキー賞が合計に入る', P.lucky===app.PZ().lucky*app.LK().count, P.lucky);
chk('総額＝順位＋技能＋団体＋抽選', P.all===P.rank+P.skill+P.team+P.lucky, P.all);
const B=app.budget();
chk('収支の支出に団体賞', B.exp.some(x=>x.l==='団体賞'));
chk('収支の支出にラッキー賞', B.exp.some(x=>x.l==='ラッキー賞'));

console.log('\n=== 7. 発表画面 ===');
app.buildSlides();
const ids=app.slides.map(s=>s.id);
chk('団体賞の画面がある', ids.includes('t-team'));
chk('ラッキー賞の画面がある', ids.includes('lucky'));
let e=0; app.slides.forEach(s=>{try{s.html()}catch(x){e++;console.log('  ★',s.id,x.message)}});
chk('全'+app.slides.length+'画面が描画できる', e===0);
app.DB().meta.use.team=false; app.DB().meta.use.lucky=false;
app.buildSlides();
chk('切ると画面も減る', !app.slides.map(s=>s.id).includes('t-team'), app.slides.length+'画面');
app.DB().meta.use.team=true; app.DB().meta.use.lucky=true;

console.log('\n=== 8. 移行 ===');
const old={v:2,meta:{},players:[],groups:[],keiba:[],gto:[]};
const m=app.migrate(old);
chk('団体賞の既定が入る', m.meta.team.size===3);
chk('ラッキー賞の既定が入る', m.meta.lucky.count===2);
chk('当選者は空配列', Array.isArray(m.result.lucky));

console.log('\n=== 9. 画面描画 ===');
e=0;['meta','players','money','result'].forEach(t=>{try{app.go(t)}catch(x){e++;console.log('  ★',t,x.message)}});
chk('各タブが描ける', e===0);
app.go('money');
chk('団体賞のカードがある', store['pane'].innerHTML.includes('団体賞'));
chk('ラッキー賞のカードがある', store['pane'].innerHTML.includes('ラッキー賞'));
chk('飛び賞のボタンがある', store['pane'].innerHTML.includes('○位ごとに追加'));
console.log('\n=== 10. 技能賞（ニアピン・何でもニアピン・ドラコン）の架空データ ===');
/* （実在のコース）のパー配分に合わせた対象ホールと、架空名の受賞データ。
   印刷した「技能賞記録」と同じ内容。当日つまずきやすい形を混ぜてある。
     ・11番は受賞者なし（用意する賞金と実際に出る賞金がずれる）
     ・同姓3名を別々のホールで受賞（取り違えないこと）
     ・同一人物が2つ受賞（賞金が合算されること）
     ・記録の書き方がまちまち（1.2m／40cm／2m50／281Y／268ヤード） */
const SKILL=[
 ["near",2,"及川　豊","1.2m"],
 ["near",4,"千葉　亮","40cm"],
 ["near",11,"",""],
 ["near",15,"大隈　浩太","2m50"],
 ["nearAny",9,"川島　俊之","0.8m"],
 ["nearAny",18,"川島　文吾","1.5m"],
 ["drako",8,"川島　武夫","281Y"],
 ["drako",16,"川島　俊之","268ヤード"]
];
const SH={near:[2,4,11,15],nearAny:[9,18],drako:[8,16]};
const SPAR=[4,3,5,3,4,4,4,5,4, 4,3,4,5,4,3,5,4,4];
const FNAMES=["川島　文吾","相沢　直哉","川島　俊之","瀬川　拓真","森　良治","三村　健吾",
 "江木　和久","白石　徹","及川　豊","川島　武夫","邊見　克己","大隈　浩太",
 "甲斐　隆志","千葉　亮","木南　英明","郷司　義晴"];

const D4=app.blank();
D4.meta.frameMode="free";
Object.assign(D4.meta.use,{near:true,nearAny:true,drako:true,prize:true,budget:true,
  score:true,keiba:false,gto:false,fine:false,team:false,lucky:false});
D4.meta.nearHoles=SH.near.slice();
D4.meta.nearAnyHoles=SH.nearAny.slice();
D4.meta.drakoHoles=SH.drako.slice();
D4.meta.sc={system:"double",par:SPAR.slice(),hidden:[1,2,3,6,7,9,10,12,13,15,17,18],
            cut:"triplePar",hcUse:true,hcMax:30,tiebreak:"older",entry:"sheet"};
FNAMES.forEach((n,i)=>D4.players.push({n,org:i<8?"営業部":"技術部",bd:"19"+(60+i)+"-01-01",
  g:Math.floor(i/2)+1,f:Math.floor(i/2)+1,vote:true,fee:true,feeAmt:""}));
app.setDB(D4);

console.log('  -- 対象ホールがパー配分と合っているか --');
chk('ニアピンはすべてパー3', SH.near.every(h=>SPAR[h-1]===3),
    SH.near.map(h=>h+'番=パー'+SPAR[h-1]).join(' '));
chk('何でもニアピンはすべてパー4', SH.nearAny.every(h=>SPAR[h-1]===4),
    SH.nearAny.map(h=>h+'番=パー'+SPAR[h-1]).join(' '));
chk('ドラコンはすべてパー5', SH.drako.every(h=>SPAR[h-1]===5),
    SH.drako.map(h=>h+'番=パー'+SPAR[h-1]).join(' '));

console.log('  -- 受賞者を入れる --');
SKILL.forEach(([k,h,who,rec])=>{if(who){app.prizeSet(k,h,'who',who);app.prizeSet(k,h,'rec',rec);}});
const SR=app.skillRows();
chk('3種そろっている', SR.length===3, SR.map(r=>r.label).join('・'));
chk('対象ホールは合計8', SR.reduce((a,b)=>a+b.n,0)===8, SR.map(r=>r.label+r.n).join(' '));
chk('受賞者が出たのは7ホール', SR.reduce((a,b)=>a+b.wonN,0)===7,
    SR.map(r=>r.label+r.wonN+'/'+r.n).join(' '));

console.log('  -- 受賞者なしのホール --');
const nr=SR.find(r=>r.key==='near');
chk('ニアピン11番は空欄のまま', (nr.list.find(x=>x.h===11)||{}).who==='');
chk('ニアピンは4ホール中3ホールで受賞', nr.n===4&&nr.wonN===3, nr.wonN+'/'+nr.n);
chk('用意する賞金 4,000円', nr.total===4000, nr.total);
chk('実際に出る賞金 3,000円', nr.wonTotal===3000, nr.wonTotal);

console.log('  -- 記録の書き方がまちまちでもそのまま残る --');
[[2,'1.2m'],[4,'40cm'],[15,'2m50']].forEach(([h,rec])=>
  chk(h+'番の記録「'+rec+'」', (nr.list.find(x=>x.h===h)||{}).rec===rec,
      '「'+(nr.list.find(x=>x.h===h)||{}).rec+'」'));
const dk=SR.find(r=>r.key==='drako');
chk('8番の記録「281Y」', (dk.list.find(x=>x.h===8)||{}).rec==='281Y');
chk('16番の記録「268ヤード」（全角の単位）',
    (dk.list.find(x=>x.h===16)||{}).rec==='268ヤード',
    '「'+(dk.list.find(x=>x.h===16)||{}).rec+'」');

console.log('  -- 同姓3名を取り違えない --');
const na=SR.find(r=>r.key==='nearAny');
chk('何でも9番は川島　俊之', (na.list.find(x=>x.h===9)||{}).who==='川島　俊之',
    (na.list.find(x=>x.h===9)||{}).who);
chk('何でも18番は川島　文吾', (na.list.find(x=>x.h===18)||{}).who==='川島　文吾',
    (na.list.find(x=>x.h===18)||{}).who);
chk('ドラコン8番は川島　武夫', (dk.list.find(x=>x.h===8)||{}).who==='川島　武夫',
    (dk.list.find(x=>x.h===8)||{}).who);

console.log('  -- 同一人物が2つ受賞したら合算される --');
chk('川島　俊之 の技能賞は2,000円', app.prizeOf('川島　俊之')===2000, app.prizeOf('川島　俊之')+'円');
chk('川島　文吾 は1,000円', app.prizeOf('川島　文吾')===1000, app.prizeOf('川島　文吾')+'円');
chk('川島　武夫 は1,000円', app.prizeOf('川島　武夫')===1000, app.prizeOf('川島　武夫')+'円');
chk('受賞なしの人は0円', app.prizeOf('邊見　克己')===0, app.prizeOf('邊見　克己')+'円');

console.log('  -- 順位賞と合算される --');
[['川島　俊之',81,7.2],['白石　徹',92,18],['邊見　克己',101,26.4]].forEach(([n,g,hc])=>{
  const s=app.scoreOf(n); s.gross=g; s.hc=hc;
});
/* 川島　俊之 はネット1位かつグロス81で最少。順位賞と技能賞が4つ重なる。
   賞金がどう積み上がるかを内訳で確かめる（合算漏れ・二重計上の検知） */
const mine=app.prizeRows().filter(r=>r.who==='川島　俊之');
chk('優勝を受賞', mine.some(r=>r.kind==='rank'&&r.n===1),
    mine.map(r=>r.label+' '+r.amt+'円').join(' ＋ '));
chk('ベスグロも受賞（グロス81で最少）', mine.some(r=>r.kind==='best'));
const rankSum=mine.reduce((a,b)=>a+(+b.amt||0),0);
chk('順位賞のぶんは 12,000円（優勝10,000＋ベスグロ2,000）', rankSum===12000, rankSum+'円');
chk('技能賞のぶんは 2,000円（何でも9番＋ドラコン16番）',
    app.prizeOf('川島　俊之')-rankSum===2000, (app.prizeOf('川島　俊之')-rankSum)+'円');
chk('合計 14,000円が合算される', app.prizeOf('川島　俊之')===14000,
    app.prizeOf('川島　俊之')+'円');
chk('二重に数えていない', app.prizeOf('川島　俊之')===rankSum+2000);

console.log('  -- 賞金の総額 --');
chk('技能賞の小計 8,000円（用意するぶん）', app.prizeTotal().skill===8000, app.prizeTotal().skill);
chk('受賞者なしの1,000円は経費に残る',
    SR.reduce((a,b)=>a+b.total-b.wonTotal,0)===1000,
    SR.reduce((a,b)=>a+b.total-b.wonTotal,0)+'円');

console.log('  -- 発表画面 --');
app.buildSlides();
const sid=app.slides.map(s=>s.id);
chk('受賞したニアピンの画面がある', [2,4,15].every(h=>sid.includes('near'+h)),
    sid.filter(x=>x.startsWith('near')).join(','));
chk('ドラコンの画面がある', [8,16].every(h=>sid.includes('drako'+h)),
    sid.filter(x=>x.startsWith('drako')).join(','));
let se=0;
app.slides.forEach(s=>{try{
  if(/undefined|NaN|\[object Object\]/.test(s.html())){se++;console.log('  NG  '+s.id);}
}catch(x){se++;console.log('  NG  '+s.id+' 例外: '+x.message);}});
chk('全'+app.slides.length+'画面が描画できる', se===0);
const s2=app.slides.find(s=>s.id==='near2');
chk('ニアピン2番の画面に受賞者と記録が出る',
  !!s2&&s2.html().includes('及川')&&s2.html().includes('1.2m'));

console.log('  -- 入力画面 --');
app.go('prize');
const pv=store['pane'].innerHTML;
chk('3種のカードが出る', ['ニアピン','何でもニアピン','ドラコン'].every(k=>pv.includes(k)));
chk('対象ホールの行が8つ', (pv.match(/<tr class="zebra">/g)||[]).length===8,
    (pv.match(/<tr class="zebra">/g)||[]).length+'行');
chk('受賞者が選択済みで表示される', pv.includes('及川')&&pv.includes('川島'));
chk('記録が入力欄に入っている', pv.includes('1.2m')&&pv.includes('268ヤード'));

console.log('\n=== 11. 対象ホールとパーの噛み合わせを知らせる ===');
/* ニアピンはパー3、ドラコンはパー5。初期値（ニアピン 4・7・12・16／ドラコン 5・14）は
   （実在のコース）では 7・12・5・14 がすべてパー4で、当日その場では気づきにくい間違いだった。 */
const D5=app.blank();
Object.assign(D5.meta.use,{near:true,nearAny:true,drako:true,prize:true,score:true,
  keiba:false,gto:false,fine:false,team:false,lucky:false});
D5.meta.sc.par=SPAR.slice();
app.setDB(D5);

console.log('  -- 初期値のずれを検知する --');
chk('初期値は ニアピン 4,7,12,16', app.DB().meta.nearHoles.join(',')==='4,7,12,16',
    app.DB().meta.nearHoles.join(','));
chk('初期値は ドラコン 5,14', app.DB().meta.drakoHoles.join(',')==='5,14',
    app.DB().meta.drakoHoles.join(','));
let W=app.holeWarn();
chk('2件の警告が出る', W.length===2, W.map(w=>w.label).join('・'));
const wn=W.find(w=>w.key==='near'), wd=W.find(w=>w.key==='drako');
/* 初期値 4,7,12,16 のうち、（実在のコース）でパー3なのは4番だけ。
   7番・12番はパー4、16番はパー5なので3つとも指摘されるのが正しい */
chk('ニアピンの当たり外れは 7・12・16', wn.bad.join(',')==='7,12,16', wn.bad.join(','));
chk('パー3の4番は指摘しない', !wn.bad.includes(4), wn.bad.join(','));
chk('パー5の16番はニアピンには不適として指摘する', wn.bad.includes(16));
chk('ドラコンの当たり外れが正しい', wd.bad.join(',')==='5,14', wd.bad.join(','));
chk('このコースのパー3を示す', wn.fit.join(',')==='2,4,11,15', wn.fit.join(','));
chk('このコースのパー5を示す', wd.fit.join(',')==='3,8,13,16', wd.fit.join(','));
chk('何でもニアピンは対象外（打数を問わないので）', !W.some(w=>w.key==='nearAny'));

console.log('  -- ボタンで合わせられる --');
app.holeApplyFit('near');
chk('ニアピンがパー3のホールになる', app.DB().meta.nearHoles.join(',')==='2,4,11,15',
    app.DB().meta.nearHoles.join(','));
chk('ニアピンの警告が消える', !app.holeWarn().some(w=>w.key==='near'));
app.holeApplyFit('drako');
chk('ドラコンがパー5のホールになる', app.DB().meta.drakoHoles.join(',')==='3,8,13,16',
    app.DB().meta.drakoHoles.join(','));
chk('警告がすべて消える', app.holeWarn().length===0);

console.log('  -- 手で正しく設定した場合 --');
app.DB().meta.drakoHoles=[8,16];       /* 4つのうち2つだけ使う運用 */
chk('パー5の一部だけでも警告しない', app.holeWarn().length===0,
    app.holeWarn().map(w=>w.label).join('・')||'警告なし');
app.DB().meta.nearHoles=[2,4,11,15,20];
chk('範囲外のホールも指摘する', (app.holeWarn()[0]||{}).over?.join(',')==='20',
    JSON.stringify((app.holeWarn()[0]||{}).over));
app.DB().meta.nearHoles=[2,4,11,15];

console.log('  -- コースが決まっていないときは黙る --');
app.DB().meta.sc.par=[];
app.DB().meta.nearHoles=[4,7,12,16];
chk('パーが未設定なら警告しない', app.holeWarn().length===0);
app.DB().meta.sc.par=SPAR.slice();
chk('パーを入れると警告が復活', app.holeWarn().length>=1, app.holeWarn().length+'件');

console.log('  -- パー74の変則コースでも動く --');
app.mQuery(''); app.mSet('pref','愛知県'); app.mSet('club','愛知カンツリー倶楽部'); app.mApply();
chk('コースパー74', app.DB().meta.sc.par.reduce((a,b)=>a+b,0)===74,
    app.DB().meta.sc.par.reduce((a,b)=>a+b,0));
const w74=app.holeFit('near');
chk('パー3のホールを正しく拾う', w74.length>0&&w74.every(h=>app.DB().meta.sc.par[h-1]===3),
    w74.join(','));

console.log('  -- 画面に出る --');
app.mQuery(''); app.mSet('pref',''); app.DB().meta.sc.par=SPAR.slice();
app.DB().meta.nearHoles=[4,7,12,16]; app.DB().meta.drakoHoles=[5,14];
app.go('meta');
const mv=store['pane'].innerHTML;
chk('大会設定に警告が出る', /でないホール/.test(mv));
chk('該当ホールとパーが書かれる', mv.includes('7番（パー4）'));
chk('正しいホールが示される', mv.includes('2・4・11・15'));
chk('合わせるボタンがある', mv.includes("holeApplyFit('near')"));
app.go('prize');
const pv2=store['pane'].innerHTML;
chk('入力画面にも警告が出る', /でないホール/.test(pv2));
chk('入力前に見直す案内がある', pv2.includes('入力を始める前に'));
chk('印刷には出さない', pv2.includes('msg warn no-print'));
app.holeApplyFit('near'); app.holeApplyFit('drako');
app.go('prize');
chk('直せば警告は出ない', !/でないホール/.test(store['pane'].innerHTML));
app.go('help');
chk('使い方にパー3のホールが併記される',
  store['pane'].innerHTML.includes('このコースのパー3は'));

console.log('\n合計 NG: '+ng);
