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
global.performance={now:()=>0};global.requestAnimationFrame=()=>{};global.alert=m=>console.log('[alert]',m);
global.confirm=()=>true;global.URL={createObjectURL:()=>'',revokeObjectURL(){}};global.Blob=class{};
global.localStorage={setItem(){},getItem(){return null},removeItem(){}};
['show','hud','dots','tabs','saveState','hdTitle','pane','sndBtn'].forEach(id=>{global[id]=doc.getElementById(id)});
const app=new Function(src+`;return {DB:()=>DB,blank,migrate,sample,go,tabList,standings,applyScores,
  prizeRows,skillRows,prizeTotal,prizeOf,budget,settle,buildSlides,pzEdit,payToggle,
  get slides(){return slides},PZ,BG,calcK,calcG,feeTotal};`)();
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};

app.sample(); global.flush();
console.log('=== 1. 画像の賞金表を再現 ===');
const R=app.prizeRows(),S=app.skillRows(),P=app.prizeTotal();
console.log('  順位賞:',R.map(r=>r.label+' '+r.amt).join(' / '));
chk('順位賞 小計 24,000円', P.rank===24000, P.rank);
console.log('  技能賞:',S.map(r=>r.label+' '+r.unit+'×'+r.n+'='+r.total).join(' / '));
chk('ニアピン 1,000×4=4,000', S.find(r=>r.key==='near').total===4000);
chk('ドラコン 1,000×2=2,000', S.find(r=>r.key==='drako').total===2000);
chk('何でも 1,000×2=2,000', S.find(r=>r.key==='nearAny').total===2000);
chk('技能賞 小計 8,000円', P.skill===8000, P.skill);
chk('順位賞＋技能賞 32,000円', P.rank+P.skill===32000, P.rank+P.skill);
chk('団体賞・ラッキー賞を含めた総額', P.all===P.rank+P.skill+P.team+P.lucky, P.all);

console.log('\n=== 2. 受賞者が順位から自動で入る ===');
app.applyScores();
const st=app.standings(),R2=app.prizeRows();
console.log('  ',R2.map(r=>r.label+'→'+(r.who||'—')).join(' / '));
chk('優勝＝ネット1位', R2[0].who===st.net[0].n, R2[0].who);
chk('2位・3位も一致', R2[1].who===st.net[1].n&&R2[2].who===st.net[2].n);
chk('5位・10位も入る', R2[3].who===st.net[4].n&&R2[4].who===st.net[9].n, R2[3].who+' / '+R2[4].who);
chk('BB＝下から2番目', R2[5].who===st.net[st.net.length-2].n, R2[5].who);
chk('ベスグロ＝グロス最少', R2[6].who===st.best.n, R2[6].who+'('+st.best.g+')');

console.log('\n=== 3. 1人ずつの賞金 ===');
const win=st.net[0].n;
chk('優勝者に10,000円以上', app.prizeOf(win)>=10000, win+' '+app.prizeOf(win)+'円');
const near1=app.DB().near[0];
chk('ニアピン受賞者に1,000円', app.prizeOf(near1.who)>=1000, near1.who+' '+app.prizeOf(near1.who)+'円');

console.log('\n=== 4. 収支 ===');
const B=app.budget();
console.log('  収入:',B.inc.map(x=>x.l+' '+x.v).join(' / '));
console.log('  支出:',B.exp.map(x=>x.l+' '+x.v).join(' / '));
chk('会費 6,000×16＝96,000円', B.inc[0].v===96000, B.inc[0].v);
chk('収入＝各項目の合計', B.income===B.inc.reduce((a,b)=>a+b.v,0));
chk('支出に賞金32,000円', B.expense>=32000, B.expense);
chk('差引＝収入−支出', B.diff===B.income-B.expense, B.diff);
app.BG().fee=0; const B2=app.budget();
chk('赤字も出せる', B2.diff<0, B2.diff);
app.BG().fee=6000;

console.log('\n=== 5. 集金・精算 ===');
const T=app.settle();
const t0=T[0];
console.log('  例:',t0.n,'会費6000 + 馬券'+t0.kq+'口 + GTO'+t0.gq+'口 = 徴収'+t0.bill);
/* 徴収にはプレー代（実費の預かり）も入る */
chk('徴収額＝プレー代＋会費＋馬券＋GTO',
    t0.bill===(t0.play||0)+6000+t0.kq*200+t0.gq*500,
    `プレー代${t0.play} 会費6000 馬券${t0.kq}口 GTO${t0.gq}口 → ${t0.bill}円`);
chk('16名ぶん出る', T.length===16);
chk('未集金が全員', T.every(x=>!x.got));
app.payToggle(t0.n,true);
chk('チェックで集金済みに', app.settle()[0].got===true);
const tot=app.settle().reduce((a,b)=>a+b.bill,0);
/* 2026-09-08 から徴収額にプレー代（実費の預かり）と切り上げが入る。
   calcK/calcG を器から返していなかったため、ここで例外になり以降の検査が
   一度も走っていなかった（2026-09-16に発見） */
const SL=app.settle();
const expect=SL.reduce((a,x)=>a+x.play+x.roundUp,0)+app.feeTotal()+app.calcK().sales+app.calcG().sales;
chk('徴収合計＝プレー代+原資+馬券+GTO売上(+切り上げ)', tot===expect, tot+' / '+expect);

console.log('\n=== 6. 表彰演出に賞金が出る ===');
app.buildSlides();
const ids=app.slides.map(s=>s.id);
/* 2026-09-08 から「その他の賞」を1枚にまとめず、賞の名前で1枚ずつ出す */
chk('賞を名前で1枚ずつ出す', !ids.includes('s-other')&&ids.filter(x=>/^s-pz\d+$/.test(x)).length>=3,
    ids.filter(x=>x.startsWith('s-')).join(','));
const s1=app.slides.find(s=>s.id==='s-1').html();
/* 段階7で賞金は「優勝賞 10,000円」の札にした（デザイン案P11） */
chk('優勝画面に賞金', /<div class="ws-prize">優勝賞<b>[\d,]+円<\/b><\/div>/.test(s1), (s1.match(/ws-prize">[^/]*/)||[''])[0]);
const awarded=app.DB().near[0].hole;
const sn=app.slides.find(s=>s.id==='near'+awarded).html();
chk('ニアピン画面に賞金', /<div class="ws-prize">ニアピン賞<b>[\d,]+円<\/b><\/div>/.test(sn), (sn.match(/ws-prize">[^/]*/)||[''])[0]);
let e=0;app.slides.forEach(s=>{try{s.html()}catch(x){e++;console.log('  ★',s.id,x.message)}});
chk('全'+app.slides.length+'画面が描画できる', e===0);

console.log('\n=== 7. タブと描画 ===');
/* 段階2（2026-09-17）で4つ足した。賞金・収支を切ると「賞金・収支」と「集金」が消える */
/* 段階3で追加ルールを独立させて16 */
chk('タブは16個', app.tabList().length===16, app.tabList().map(t=>t[1]).join('/'));
app.DB().meta.use.prize=false; app.DB().meta.use.budget=false;
chk('賞金・収支を切ると14個', app.tabList().length===14);
app.DB().meta.use.prize=true; app.DB().meta.use.budget=true;
e=0;app.tabList().forEach(([k])=>{try{app.go(k)}catch(x){e++;console.log('  ★',k,x.message)}});
chk('全タブ描画', e===0);

console.log('\n=== 8. 旧データの移行 ===');
const old={v:2,meta:{name:'旧',use:{keiba:true}},players:[],groups:[],keiba:[],gto:[]};
const m=app.migrate(old);
chk('賞金の既定が入る', m.meta.prizes.rank.length===7);
chk('収支の既定が入る', m.meta.budget.fee===0);
console.log('\n合計 NG: '+ng);
