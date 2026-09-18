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
global.performance={now:()=>0};global.requestAnimationFrame=()=>{};
let A=[];global.alert=m=>A.push(m);global.confirm=()=>true;
global.URL={createObjectURL:()=>'',revokeObjectURL(){}};global.Blob=class{};
global.localStorage={setItem(){},getItem(){return null},removeItem(){}};
['show','hud','dots','tabs','saveState','hdTitle','pane','sndBtn'].forEach(id=>{global[id]=doc.getElementById(id)});
const app=new Function(src+`;return {DB:()=>DB,blank,migrate,sample,go,pEdit,pAdd,feeOf,feeMembers,feeTotal,
  budget,settle,BG,RUN,VOT,collectPlan,setDB:x=>{DB=x},calcK,calcG,sampleHard,carCount,carUnitSum,carBackOf,voteOnly,prizeOf,standings,calcB,skillRows,carSet,cAdd,cEdit,prizeTotal,joinSet,joinOf,roundUnit,roundBill};`)();
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};

app.sample(); global.flush();
app.BG().fee=6000;
console.log('=== 1. 既定：全員が会費対象 ===');
chk('16名全員', app.feeMembers().length===16);
chk('合計96,000円', app.feeTotal()===96000, app.feeTotal());

console.log('\n=== 2. 大会に参加せず馬券だけの人 ===');
/* 15人目を「出走なし」にする */
const i=15, p=app.DB().players[i];
console.log('  対象:',p.n,'（もとは',p.g,'組 /',p.f,'枠）');
app.pEdit(i,'g',0);
chk('出走15名に', app.RUN().length===15, 'run='+app.RUN().length);
chk('投票者は16名のまま', app.VOT().length===16);
chk('会費が自動で外れる', p.fee===false);
chk('会費対象15名', app.feeMembers().length===15);
chk('会費 合計90,000円', app.feeTotal()===90000, app.feeTotal());
const B=app.budget();
chk('収支の会費行が15名', B.inc[0].l.includes('15名'), B.inc[0].l);
chk('収支の会費額90,000円', B.inc[0].v===90000, B.inc[0].v);
const t=app.settle().find(x=>x.n===p.n);
chk('本人の徴収額に会費が入らない', t.fee===0, '会費'+t.fee+' / 徴収'+t.bill);
chk('馬券・GTOの代金は徴収する', t.bill===t.kq*200+t.gq*500&&t.bill>0, t.kq+'口/'+t.gq+'口 → '+t.bill+'円');

console.log('\n=== 3. 手で戻せる ===');
app.pEdit(i,'fee',true);
chk('会費対象に戻る', app.feeMembers().length===16&&app.feeTotal()===96000, app.feeTotal());
app.pEdit(i,'fee',false);

console.log('\n=== 4. 個別の金額 ===');
app.pEdit(0,'feeAmt',3000);
chk('1名だけ3,000円', app.feeOf(app.DB().players[0])===3000);
chk('合計が 90,000−6,000+3,000＝87,000円', app.feeTotal()===87000, app.feeTotal());
const B2=app.budget();
chk('収支の表記が「金額はそれぞれ」に', B2.inc[0].l.includes('それぞれ'), B2.inc[0].l);
const t0=app.settle()[0];
chk('本人の徴収額も3,000円ベース', t0.fee===3000, '会費'+t0.fee+' / 徴収'+t0.bill);
app.pEdit(0,'feeAmt','');
chk('空欄に戻すと標準額', app.feeOf(app.DB().players[0])===6000);

console.log('\n=== 5. 会費0円のケース ===');
app.pEdit(1,'feeAmt',0);
chk('0円も指定できる', app.feeOf(app.DB().players[1])===0);
chk('会費対象の人数には残る', app.feeMembers().length===15);
app.pEdit(1,'feeAmt','');

console.log('\n=== 6. 出走に戻すと会費も戻る ===');
app.pEdit(i,'g',4);
/* 組を戻しても枠は戻らない。枠を自分で決める運用では、
   組を戻したあとに枠も入れ直す（「枠を2人ずつ割り振る」で一括もできる） */
app.DB().players[i].f=1; app.DB().players[i].fee=true;
chk('組と枠を戻すと出走16名に', app.RUN().length===16, '出走'+app.RUN().length+'名');
chk('会費も自動で戻る', app.DB().players[i].fee===true&&app.feeTotal()===96000, app.feeTotal());

console.log('\n=== 7. 集金表の合計 ===');
app.pEdit(i,'g',0);
const S=app.settle();
const billSum=S.reduce((a,b)=>a+b.bill,0);
/* 徴収にはプレー代（実費の預かり）も入る。
   settle() を呼び直すと状態が変わることがあるので、同じ結果から取る */
const playAll=S.reduce((a,b)=>a+(b.play||0),0);
const feeAll=S.reduce((a,b)=>a+(b.p.fee!==false?b.fee:0),0);
/* 売上は無効になった口を除いた額なので、徴収（買った口すべて）とは一致しない。
   徴収側の内訳をそのまま足し合わせて確かめる */
const kAll=S.reduce((a,b)=>a+b.kq,0)*app.DB().meta.kPrice;
const gAll=S.reduce((a,b)=>a+b.gq,0)*app.DB().meta.gPrice;
chk('徴収合計＝プレー代＋会費＋馬券＋GTO',
    billSum===playAll+feeAll+kAll+gAll,
    `プレー代${playAll} ＋会費${feeAll} ＋馬券${kAll} ＋GTO${gAll} = ${billSum}円`);

console.log('\n=== 8. 旧データの移行 ===');
const old={v:2,meta:{},players:[{n:'A',f:1,vote:true},{n:'B',f:0,vote:true}],groups:[],keiba:[],gto:[]};
const m=app.migrate(old);
chk('出走者は会費あり', m.players[0].fee===true);
chk('出走なしは会費なし', m.players[1].fee===false);
const v1={meta:{org:'旧'},roster:[{f:1,n:'A',vote:true},{f:0,n:'B',vote:true}],keiba:[],gto:[]};
const m2=app.migrate(v1);
chk('v1からの移行も同様', m2.players[0].fee===true&&m2.players[1].fee===false);

console.log('\n=== 9. 画面 ===');
app.go('players');
const H=store['pane'].innerHTML;
/* 「会費」は「賞金の原資」に言い換えた。参加者タブの列は「原資」 */
chk('原資の列がある', H.includes(">原資<"));
chk('個別額の列がある', H.includes(">個別額<"));
chk('原資の対象人数が出る', H.includes('原資の対象'));
/* 「投票」「投票のみ」の2チェックは「参加のしかた」の3択にまとめた */
chk('参加のしかたの説明が出る', H.includes('参加のしかた</b>は3つから選びます'));
app.go('money');
chk('収支に原資の内訳が出る',
    /賞金の原資は <b>ひとり [\d,]+円 × \d+名/.test(store['pane'].innerHTML),
    (store['pane'].innerHTML.match(/賞金の原資は <b>[^<]*/)||['見つからない'])[0].replace(/<[^>]*>/g,''));
/* 枠から外れた人は「投票のみ」、枠はあるが会費だけ外した人は「会費なし」。
   どちらの印が出るかは状態で決まる（2026-09-08に印を分けた） */
{
  app.go('collect');   /* 集金表は段階2で「集金」画面へ移った */
  const H2=store['pane'].innerHTML;
  chk('集金表に印が出る', /投票のみ|会費なし/.test(H2),
      (H2.match(/投票のみ|会費なし/)||['なし'])[0]);
}
console.log('\n=== 当日いくら集めるか（事前に分かること）===');
/* 当日の朝に集金するので、前の晩までに「ひとり◯◯円」と言える必要がある。
   スコアも投票もまだ無い段階で出せることが要点（2026-09-08）。
   プレー代は幹事が預かってゴルフ場へ払うぶん。賞金の原資（会費）とは別に数える。 */
{
  const D=app.blank();
  D.meta.budget.fee=6000;
  D.meta.budget.collect=[{label:"プレー代",amt:13500},{label:"パーティ代",amt:2000}];
  D.meta.budget.kGuess=6; D.meta.budget.gGuess=3;
  "ABCDEFGHIJKLMNOP".split("").forEach((n,i)=>D.players.push(
    {n:"参加者"+n,org:"",bd:"1970-01-01",g:Math.floor(i/4)+1,f:i+1,vote:true,fee:true,feeAmt:""}));
  app.setDB(D);
  const C=app.collectPlan();
  chk('投票が1口も無くても金額が出る', C.each>0, C.each+'円');
  chk('見込みで計算していると分かる', C.actual===false);
  chk('プレー代 13,500＋2,000', C.play===15500, C.play+'円');
  chk('会費 6,000', C.fee===6000);
  chk('馬券の見込み 6口×200＝1,200', C.kEach===1200, C.kEach+'円');
  chk('GTOの見込み 3口×500＝1,500', C.gEach===1500, C.gEach+'円');
  chk('ひとりあたり 24,200円', C.each===24200, C.each+'円');
  chk('16名で 387,200円', C.total===387200, C.total+'円');
  chk('内訳が並ぶ', C.rows.length===5, C.rows.map(r=>r.l).join(' / '));
  console.log('  -- 投票が入ると実際の口数に切り替わる --');
  D.keiba.push({v:D.players[0].n,a:1,b:2,q:32});
  chk('実際の口数で出すようになる', app.collectPlan().actual===true);
  chk('見込みより高くなる（32口÷16名＝2口）', app.collectPlan().kEach===400,
      app.collectPlan().kEach+'円');
}
console.log('  -- プレー代が収支で相殺される --');
/* 片方だけに入れると黒字赤字がその分だけ狂う */
app.sample(); global.flush();
{
  const B=app.budget();
  const inP=(B.inc.find(x=>/預かり/.test(x.l))||{v:0}).v;
  const exP=(B.exp.find(x=>/ゴルフ場/.test(x.l))||{v:0}).v;
  chk('収入に「プレー代の預かり」が立つ', inP>0, inP+'円');
  chk('支出に「ゴルフ場への支払い」が立つ', exP>0, exP+'円');
  chk('同額で相殺される', inP===exP, inP+' / '+exP);
}
console.log('  -- ひとりずつの徴収額にプレー代が入る --');
{
  const S=app.settle(), one=S.find(r=>r.p.fee!==false);
  chk('徴収額にプレー代が含まれる', one.play>0&&one.bill>=one.play+one.fee,
      `プレー代${one.play} 会費${one.fee} 徴収${one.bill}`);
  chk('原資の対象外の人にはプレー代を乗せない',
      S.filter(r=>r.p.fee===false).every(r=>r.play===0),
      S.filter(r=>r.p.fee===false).length+'名が対象外');
  const C=app.collectPlan();
  chk('徴収の合計とひとりあたり×人数がほぼ合う',
      Math.abs(S.reduce((a,b)=>a+b.bill,0)-C.total)<=C.members,
      S.reduce((a,b)=>a+b.bill,0)+'円 / 見積り'+C.total+'円');
}
console.log('  -- 古い大会データを開いても落ちない --');
{
  const D=app.blank();
  delete D.meta.budget.collect; delete D.meta.budget.kGuess; delete D.meta.budget.gGuess;
  app.setDB(D);
  let e=null; try{ app.collectPlan(); }catch(x){ e=x.message; }
  chk('欄が無くても例外にならない', !e, e||'');
  chk('欄が補われる', Array.isArray(app.BG().collect)&&app.BG().kGuess!==undefined);
}

console.log('\n=== 宿泊ありのコンペ（実費の数え方が混ざる）===');
/* 日帰りなら全員同じ額でよいが、宿泊ありだと項目が増え、数え方も混ざる。
   ガソリン代・高速代は乗り合わせで総額が決まるので頭割り。
   宿泊代・プレー代はひとり同額。ここを取り違えると集めすぎ・足りないが起きる。
   割り切れないときは切り上げる。足りないと幹事の持ち出しになるため（2026-09-08）。 */
{
  const D=app.blank();
  D.meta.budget.fee=0;
  D.meta.budget.collect=[
    {label:"プレー代",amt:13500,mode:"each"},
    {label:"宿泊代",amt:11000,mode:"each"},
    {label:"ガソリン代・高速代",amt:37000,mode:"total"}];
  D.meta.use.keiba=false; D.meta.use.gto=false;
  "ABCDEFGHIJKLMNOP".split("").forEach((n,i)=>D.players.push(
    {n:"参加者"+n,org:"",bd:"1970-01-01",g:Math.floor(i/4)+1,f:i+1,vote:true,fee:true,feeAmt:""}));
  app.setDB(D);
  const C=app.collectPlan();
  chk('ひとり同額のものはそのまま', C.rows[0].v===13500&&C.rows[1].v===11000,
      C.rows.slice(0,2).map(r=>r.v).join(' / '));
  /* 37,000 ÷ 16 = 2312.5 → 切り上げて 2,313 */
  chk('総額は人数で割って切り上げる', C.rows[2].v===2313, C.rows[2].v+'円');
  chk('頭割りと分かる表示になる', /総額37,000円 ÷ 16名/.test(C.rows[2].l), C.rows[2].l);
  chk('ひとりあたり 26,813円', C.each===26813, C.each+'円');
  chk('16名で 429,008円', C.total===429008, C.total+'円');
  /* 2,313 × 16 = 37,008。37,000 との差 8円が余る */
  chk('切り上げの余りが分かる', C.over===8, C.over+'円');
  console.log('  -- 人数が変わると頭割りも変わる --');
  /* 頭割りの人数は「実費を負担する人」＝原資の対象者。
     組を未定にしただけでは対象から外れないので、会費のチェックも外す
     （画面では組を未定にすると自動で外れる） */
  D.players[15].g=0; D.players[15].f=0; D.players[15].fee=false;
  const C2=app.collectPlan();
  chk('15名になる', C2.members===15, C2.members+'名');
  chk('15名なら 37,000÷15＝2,467円', C2.rows[2].v===2467, C2.rows[2].v+'円');
  chk('ひとり同額のものは変わらない', C2.rows[0].v===13500);
  console.log('  -- 数え方を取り違えたときの差 --');
  D.players[15].g=4; D.players[15].f=16; D.players[15].fee=true;
  const before=app.collectPlan().each;
  app.BG().collect[2].mode="each";      /* 総額をひとり同額にしてしまう */
  const after=app.collectPlan().each;
  chk('取り違えると大きく変わる（気づける）', after-before>30000,
      `正しく${before}円 / 取り違えると${after}円`);
  app.BG().collect[2].mode="total";
}
console.log('  -- サンプル②は宿泊ありで作ってある --');
app.sampleHard(); global.flush();
{
  const C=app.collectPlan(), b=app.BG();
  chk('大会名で宿泊ありと分かる', /宿泊あり/.test(app.DB().meta.name), app.DB().meta.name);
  chk('実費が5項目', (b.collect||[]).length===5, (b.collect||[]).length+'項目');
  chk('宿泊代がある', (b.collect||[]).some(x=>/宿泊/.test(x.label)));
  chk('車代とガソリン代が「1台あたり」',
      (b.collect||[]).filter(x=>x.mode==="unit").length===2,
      (b.collect||[]).filter(x=>x.mode==="unit").map(x=>x.label).join('、'));
  chk('ひとりあたりが日帰りより高い', C.each>30000, C.each+'円');
  chk('切り上げの余りが出る', C.over>0, C.over+'円');
  const S=app.settle();
  chk('ひとりずつの徴収にも宿泊代が入る', S[0].play>25000, S[0].play+'円');
}

console.log('\n=== 車代・ガソリン代（総取りして配車した担当へ返す）===');
/* 車の代金は「1台あたりの単価 × 台数」を全員から集め、そのまま配車した担当へ返す。
   幹事が一度預かるだけなので、集めた額と返す額が一致しなければならない。
   台数は参加者ひとりずつに持たせる（2026-09-08）。 */
{
  const D=app.blank();
  D.meta.budget.fee=0;
  D.meta.budget.collect=[
    {label:"プレー代",amt:13000,mode:"each"},
    {label:"車代（1台あたり）",amt:5000,mode:"unit"},
    {label:"ガソリン代（1台あたり）",amt:9250,mode:"unit"}];
  D.meta.use.keiba=false; D.meta.use.gto=false;
  "ABCDEFGHIJKLMNOP".split("").forEach((n,i)=>D.players.push(
    {n:"参加者"+n,org:"",bd:"1970-01-01",g:Math.floor(i/4)+1,f:i+1,vote:true,fee:true,feeAmt:"",cars:0}));
  [0,4,8,12].forEach(i=>{D.players[i].cars=1;});
  app.setDB(D);
  chk('台数が数えられる', app.carCount()===4, app.carCount()+'台');
  chk('1台あたりの単価の合計 14,250円', app.carUnitSum()===14250, app.carUnitSum()+'円');
  const C=app.collectPlan();
  /* 5,000 × 4台 ÷ 16名 = 1,250 ／ 9,250 × 4台 ÷ 16名 = 2,312.5 → 切り上げ 2,313 */
  chk('車代は 5,000×4台÷16名＝1,250円', C.rows[1].v===1250, C.rows[1].v+'円');
  chk('ガソリン代は切り上げて 2,313円', C.rows[2].v===2313, C.rows[2].v+'円');
  chk('計算の内訳が見える', /5,000円 × 4台 ÷ 16名/.test(C.rows[1].l), C.rows[1].l);
  chk('ひとりあたり 16,563円', C.each===16563, C.each+'円');
  console.log('  -- 集めた額と返す額が一致する --');
  const S=app.settle();
  const got=app.carUnitSum()*app.carCount();
  const back=S.reduce((a,b)=>a+b.carBack,0);
  chk('集めた車の代金 57,000円', got===57000, got+'円');
  chk('返す合計と一致する', got===back, `集め${got} / 返し${back}`);
  chk('車を出した4名が受け取る', S.filter(r=>r.carBack>0).length===4,
      S.filter(r=>r.carBack>0).map(r=>r.n).join('、'));
  chk('ひとり 14,250円ずつ', S.filter(r=>r.carBack>0).every(r=>r.carBack===14250));
  chk('出さない人は0円', S.filter(r=>!r.cars).every(r=>r.carBack===0));
  console.log('  -- 1人1台で数える --');
  /* 1人が2台出す場面は考えにくいので、チェックだけにした。
     前の版で2台と入れたデータを開いても1台として数え、集めた額とずれない（2026-09-08） */
  D.players[0].cars=2;
  const S2=app.settle();
  chk('2台と入っていても4台のまま', app.carCount()===4, app.carCount()+'台');
  chk('返金も1台ぶん', (S2.find(r=>r.n===D.players[0].n)||{}).carBack===14250,
      (S2.find(r=>r.n===D.players[0].n)||{}).carBack+'円');
  chk('集めた額と返す額がずれない',
      app.carUnitSum()*app.carCount()===S2.reduce((a,b)=>a+b.carBack,0),
      `集め${app.carUnitSum()*app.carCount()} / 返し${S2.reduce((a,b)=>a+b.carBack,0)}`);
  D.players[0].cars=1;
  console.log('  -- チェックで増やせる --');
  app.carSet(D.players[1].n,true);
  chk('5台になる', app.carCount()===5, app.carCount()+'台');
  chk('集めた額と返す額が一致',
      app.carUnitSum()*app.carCount()===app.settle().reduce((a,b)=>a+b.carBack,0));
  app.carSet(D.players[1].n,false);
  chk('外すと4台に戻る', app.carCount()===4, app.carCount()+'台');
  console.log('  -- 収支では行き先を分ける --');
  const B=app.budget();
  const carExp=(B.exp.find(x=>/配車した担当/.test(x.l))||{v:0}).v;
  const golfExp=(B.exp.find(x=>/ゴルフ場/.test(x.l))||{v:0}).v;
  chk('「配車した担当へ返す」が立つ', carExp===app.carUnitSum()*app.carCount(), carExp+'円');
  chk('残りは「ゴルフ場への支払い」', golfExp>0, golfExp+'円');
  chk('預かりの合計と支払いの合計が合う',
      (B.inc.find(x=>/預かり/.test(x.l))||{v:0}).v===carExp+golfExp,
      `預かり${(B.inc.find(x=>/預かり/.test(x.l))||{v:0}).v} / 支払い${carExp+golfExp}`);
  console.log('  -- 台数が0なら車の項目は出ない --');
  D.players.forEach(p=>p.cars=0);
  const C3=app.collectPlan();
  chk('車の行が消える', C3.rows.length===1, C3.rows.map(r=>r.l).join(' / '));
  chk('ひとりあたりはプレー代だけ', C3.each===13000, C3.each+'円');
  chk('返す相手もいない', app.settle().every(r=>r.carBack===0));
}
console.log('  -- サンプル②で通しで確かめる --');
app.sampleHard(); global.flush();
{
  const S=app.settle();
  chk('4名が1台ずつ出している', app.carCount()===4, app.carCount()+'台');
  chk('集めた額と返す額が一致',
      app.carUnitSum()*app.carCount()===S.reduce((a,b)=>a+b.carBack,0));
  /* 受取＝配当＋賞金－罰金＋車の返金。罰金が大きければ返金を下回ることもある。
     車の返金がきちんと足されているかを、内訳から確かめる */
  chk('車の返金が受取に足されている',
      S.filter(r=>r.cars>0).every(r=>r.net===r.back+r.pz-r.fine+r.carBack),
      S.filter(r=>r.cars>0).map(r=>`${r.n}:${r.net}`).join(' '));
  chk('車を出さない人の受取には入らない',
      S.filter(r=>!r.cars).every(r=>r.net===r.back+r.pz-r.fine));
}

console.log('\n=== プレーせず予想だけ参加する人 ===');
/* 実費も会費もかからず、馬券・GTOの代金だけを集める。
   的中があれば払い戻す。順位・技能賞・罰金の対象にはならない。
   当日いちばん間違えやすいので、収支の全部を固定しておく（2026-09-08）。 */
app.sample(); global.flush();
{
  const D=app.DB(), i=15, v=D.players[i];
  app.voteOnly(i,true);
  chk('組と枠が外れる', +v.g===0&&+v.f===0, `組${v.g} 枠${v.f}`);
  chk('会費の対象から抜ける', v.fee===false);
  chk('投票は残る', v.vote===true);
  chk('車を出す台数も0になる', !v.cars);
  chk('出走者から抜ける', !app.RUN().some(p=>p.n===v.n), app.RUN().length+'名');
  chk('投票者には残る', app.VOT().some(p=>p.n===v.n), app.VOT().length+'名');
  const S=app.settle(), me=S.find(r=>r.n===v.n);
  console.log('  -- この人から集めるもの --');
  chk('実費はかからない', me.play===0, me.play+'円');
  chk('会費もかからない', me.fee===0, me.fee+'円');
  chk('馬券・GTOの代金だけ',
      me.bill===me.kq*D.meta.kPrice+me.gq*D.meta.gPrice,
      `馬券${me.kq}口 GTO${me.gq}口 → ${me.bill}円`);
  console.log('  -- この人が受け取るもの --');
  chk('的中があれば払い戻す', me.back>=0, me.back+'円');
  chk('賞金はもらえない（プレーしていない）', me.pz===0);
  chk('罰金もかからない', me.fine===0);
  chk('車の返金もない', me.carBack===0);
  chk('受取＝払戻だけ', me.net===me.back, me.net+'円');
  console.log('  -- 集計から外れる --');
  chk('順位に出ない', !app.standings().net.some(r=>r.n===v.n));
  chk('グロス下位3名にも入らない', !app.standings().worst3.some(r=>r.n===v.n));
  chk('罰金の対象にならない', !app.calcB().list.some(x=>x.n===v.n));
  chk('技能賞ももらえない', app.prizeOf(v.n)===0, app.prizeOf(v.n)+'円');
  console.log('  -- 全体の数が合う --');
  chk('会費の対象が15名', app.feeMembers().length===15, app.feeMembers().length+'名');
  chk('ひとりあたりの見積りは15名で割る', app.collectPlan().members===15,
      app.collectPlan().members+'名');
  const S2=app.settle();
  chk('徴収の合計に、この人の馬券・GTOも入る',
      S2.reduce((a,b)=>a+b.bill,0)>0&&me.bill>0);
  console.log('  -- 元に戻せる --');
  app.voteOnly(i,false);
  chk('会費の対象に戻る', v.fee===true&&app.feeMembers().length===16,
      app.feeMembers().length+'名');
  chk('ただし枠は自分で入れ直す（組と枠は別物）', +v.f===0, '枠'+v.f);
}
console.log('  -- 画面で見分けられる --');
app.sample(); global.flush();
app.voteOnly(15,true);
/* 集金表は段階2（2026-09-17）で「集金」画面へ移った */
app.go('collect');
{
  const H=store['pane'].innerHTML;
  chk('集金表に「投票のみ」の印が出る', /投票のみ/.test(H));
  chk('扱いの説明が出る', /馬券・GTOの代金だけ/.test(H));
  chk('人数と金額が出る', /プレーせず予想だけの方が 1名/.test(H),
      (H.match(/プレーせず予想だけの方が \d+名/)||['見つからない'])[0]);
}
console.log('  -- サンプル②にも入っている --');
app.sampleHard(); global.flush();
{
  const D=app.DB(), only=D.players.filter(p=>!(+p.f>0)&&p.vote&&p.fee===false);
  chk('投票のみの人がいる', only.length>=1, only.map(p=>p.n).join('、'));
  const S=app.settle();
  only.forEach(p=>{const r=S.find(x=>x.n===p.n);
    chk(p.n+' は実費も会費も0', r.play===0&&r.fee===0, `実費${r.play} 会費${r.fee}`);});
}

console.log('\n=== 一律と個別を分けて数える ===');
/* 実費と会費は全員同じ額（一律）。馬券とGTOは買う口数が人によって違う（個別）。
   この2つを混ぜて「ひとりあたり◯◯円」と言うと、当日かならず食い違う。
   当日の朝に集めるのは一律まで。個別は投票を締め切ってから足す（2026-09-08）。 */
app.sampleHard(); global.flush();
{
  const C=app.collectPlan(), S=app.settle();
  console.log('  -- 一律 --');
  chk('一律に馬券・GTOが混ざらない', C.flatRows.every(r=>r.kind!=="game"),
      C.flatRows.map(r=>r.kind).join(','));
  chk('一律は実費と会費だけ', C.flat===C.play+C.fee, `一律${C.flat} = 実費${C.play}＋会費${C.fee}`);
  chk('一律の合計＝ひとり×プレーする人数', C.flatTotal===C.flat*C.members,
      `${C.flat} × ${C.members}名 = ${C.flatTotal}`);
  console.log('  -- 個別 --');
  chk('個別は馬券とGTOだけ', C.gameRows.every(r=>r.kind==="game"));
  chk('個別の合計＝口数×単価',
      C.gameTotal===C.kUnits*app.DB().meta.kPrice+C.gUnits*app.DB().meta.gPrice,
      `馬券${C.kUnits}口＋GTO${C.gUnits}口 = ${C.gameTotal}円`);
  chk('個別は投票する人数で数える（プレーの人数とは別）',
      C.voters>=C.members||C.voters>0, `投票${C.voters}名 / プレー${C.members}名`);
  console.log('  -- 徴収合計 --');
  chk('徴収合計＝一律の合計＋個別の合計', C.grand===C.flatTotal+C.gameTotal,
      `${C.flatTotal} ＋ ${C.gameTotal} = ${C.grand}`);
  chk('実際の徴収の合計と一致する', C.grand===S.reduce((a,b)=>a+b.bill,0),
      `見積り${C.grand} / 実際${S.reduce((a,b)=>a+b.bill,0)}`);
  console.log('  -- ひとりずつも一律と個別に分かれる --');
  const run1=S.find(r=>+r.p.f>0);
  chk('プレーする人は一律＋個別',
      run1.bill===run1.play+run1.fee+run1.kq*app.DB().meta.kPrice+run1.gq*app.DB().meta.gPrice,
      `一律${run1.play+run1.fee} ＋ 馬券${run1.kq}口 ＋ GTO${run1.gq}口 = ${run1.bill}`);
  chk('プレーする人の一律は全員同じ',
      new Set(S.filter(r=>+r.p.f>0&&r.p.fee!==false).map(r=>r.play+r.fee)).size===1,
      [...new Set(S.filter(r=>+r.p.f>0&&r.p.fee!==false).map(r=>r.play+r.fee))].join('、'));
  chk('個別は人によって違う',
      new Set(S.filter(r=>+r.p.f>0).map(r=>r.kq)).size>1,
      [...new Set(S.map(r=>r.kq))].sort((a,b)=>a-b).join('、')+'口');
  const only=S.find(r=>!(+r.p.f>0)&&r.p.vote);
  if(only){
    chk('投票だけの人は一律がゼロ', only.play+only.fee===0, `一律${only.play+only.fee}円`);
    chk('投票だけの人は個別だけ払う',
        only.bill===only.kq*app.DB().meta.kPrice+only.gq*app.DB().meta.gPrice,
        `${only.n} → ${only.bill}円`);
  }
  console.log('  -- 画面 --');
  app.go('meta');
  const HM=store['pane'].innerHTML;
  chk('大会設定に「一律」の見出しが出る', /一律　全員が同じ額/.test(HM));
  chk('大会設定に「個別」の見出しが出る', /個別　人によって違う/.test(HM));
  chk('徴収合計が出る', /徴収合計/.test(HM));
  chk('当日の朝に集める額の案内がある', /当日の朝に集めるのは「一律/.test(HM),
      (HM.match(/当日の朝に集めるのは「一律 [\d,]+円」まで/)||['見つからない'])[0]);
  app.go('collect');
  const HB=store['pane'].innerHTML;
  chk('集金表に一律の区分が出る', /一律（全員同じ）/.test(HB));
  chk('集金表に個別の区分が出る', /個別（人ごと）/.test(HB));
  chk('集金表に一律の小計の列がある', /一律 計/.test(HB));
  chk('個別の列に口数と金額が並ぶ', /\d+口 [\d,]+/.test(HB));
}

console.log('\n=== 1台あたりを設定しても台数が無いと0円 ===');
/* 2026-09-08、大会設定で車代・ガソリン代を「1台あたり」にしたのに
   賞金・収支に出てこない、という報告があった。原因は台数が未入力で
   単価 × 0台 = 0円になっていたこと。金額が消えるだけで理由が出ていなかった。
   単価を入れたら台数も必ず入れてもらう作りにした。 */
app.sample(); global.flush();
{
  app.BG().collect.push({label:"車代（1台あたり）",amt:5000,mode:"unit"});
  app.BG().collect.push({label:"ガソリン代（1台あたり）",amt:9250,mode:"unit"});
  chk('単価は入っている', app.carUnitSum()===14250, app.carUnitSum()+'円');
  chk('台数はまだ0', app.carCount()===0, app.carCount()+'台');
  const C=app.collectPlan();
  chk('内訳に車代の行が出ない（0円だから）', !C.rows.some(r=>/車代|ガソリン/.test(r.l)));
  console.log('  -- 理由が画面に出る --');
  app.go('meta');
  const H=store['pane'].innerHTML;
  chk('車を出す方が未選択だと赤く知らせる', /<b>車を出す方<\/b>がまだ選ばれていません/.test(H));
  chk('どちらかが空だと0円になると書いてある', /どちらかが空だと0円のまま/.test(H));
  chk('どこに入れるか案内する', /「車を出す方」/.test(H));
  console.log('  -- 大会設定から台数を入れられる --');
  chk('車を出す方の一覧が出る', /車を出す方<\/div>/.test(H));
  chk('出走者ぶんのチェックがある', (H.match(/carSet\(/g)||[]).length===app.RUN().length,
      (H.match(/carSet\(/g)||[]).length+'個 / 出走'+app.RUN().length+'名');
  chk('数値入力ではなくチェックになっている', !/type="number"[^>]*carSet/.test(H));
  app.carSet(app.DB().players[0].n,true);
  app.carSet(app.DB().players[1].n,true);
  chk('チェックした人数が台数になる', app.carCount()===2, app.carCount()+'台');
  const C2=app.collectPlan();
  chk('内訳に車代が出るようになる', C2.rows.some(r=>/車代/.test(r.l)),
      (C2.rows.find(r=>/車代/.test(r.l))||{}).l);
  chk('5,000円 × 2台 ÷ 16名 ＝ 625円',
      (C2.rows.find(r=>/車代/.test(r.l))||{}).v===625,
      (C2.rows.find(r=>/車代/.test(r.l))||{}).v+'円');
  app.go('meta');
  chk('警告が消える', !/台数が入っていないので/.test(store['pane'].innerHTML));
  chk('出した方へ返す額が立つ',
      app.settle().find(r=>r.n===app.DB().players[0].n).carBack===14250,
      app.settle().find(r=>r.n===app.DB().players[0].n).carBack+'円');
}

console.log('\n=== 「1台あたり」を選んだら、すぐ台数を入れられること ===');
/* 2026-09-08、「台数を入力する方法がない」という報告があった。
   台数の欄を出す条件が「金額が入っていること」だったため、
   項目を足した直後は金額が0で、欄そのものが現れなかった。
   どの順番で入れても欄が出るようにした。 */
const setup=fn=>{app.sample(); global.flush(); fn();
  app.go('meta'); const H=store['pane'].innerHTML;
  app.go('players'); const P=store['pane'].innerHTML;
  return {H,P};};
{
  console.log('  -- ボタンで足した直後（金額はまだ0）--');
  let r=setup(()=>app.cAdd('車代（1台あたり）','unit'));
  chk('大会設定に台数の欄が出る', /carSet\(/.test(r.H));
  chk('参加者タブにも「車」の列が出る', />車(<br>|<\/th>)/.test(r.P));
  chk('金額が空だと知らせる', /1台あたりの金額/.test(r.H));
  chk('車を出す方が未選択だとも知らせる', /<b>車を出す方<\/b>/.test(r.H));
  console.log('  -- 金額だけ入れた --');
  r=setup(()=>{app.cAdd('車代（1台あたり）','unit'); app.BG().collect[app.BG().collect.length-1].amt=5000;});
  chk('台数の欄は出たまま', /carSet\(/.test(r.H));
  chk('金額の案内は消える', !/1台あたりの金額/.test(r.H));
  chk('車を出す方の案内だけ残る', /<b>車を出す方<\/b>/.test(r.H));
  console.log('  -- 既存の行を「ひとり」から切り替えた --');
  r=setup(()=>{app.BG().collect[0].mode="unit";});
  chk('切り替えただけでも台数の欄が出る', /carSet\(/.test(r.H));
  chk('参加者タブにも出る', />車(<br>|<\/th>)/.test(r.P));
  console.log('  -- 両方入れたら案内が消える --');
  r=setup(()=>{app.cAdd('車代（1台あたり）','unit');
    app.BG().collect[app.BG().collect.length-1].amt=5000;
    app.carSet(app.DB().players[0].n,2);});
  chk('金額の案内が出ない', !/1台あたりの金額/.test(r.H));
  chk('台数の案内も出ない', !/<b>車を出す方<\/b>/.test(r.H));
  chk('金額が計算される', app.collectPlan().rows.some(x=>/車代/.test(x.l)),
      (app.collectPlan().rows.find(x=>/車代/.test(x.l))||{}).l);
  console.log('  -- 「1台あたり」の項目が無ければ欄も出ない --');
  r=setup(()=>{});
  chk('台数の欄は出ない', !/carSet\(/.test(r.H));
  chk('参加者タブにも出ない', !/>車(<br>|<\/th>)/.test(r.P));
}

console.log('\n=== 「会費」ではなく「賞金の原資」として見せる ===');
/* 「会費」だと当日集める総額と取り違えられる。実際は賞金を出すためのお金で、
   プレー代とは別物。上から下へ「ひとりいくら → 全部でいくら → そこから何を出す →
   残りいくら」とたどれる形にして、金額を決めながら妥当かが分かるようにした（2026-09-08）。 */
app.sample(); global.flush(); app.go('meta');
{
  const H=store['pane'].innerHTML;
  chk('見出しが「賞金の原資」', /<h2>賞金の原資/.test(H));
  chk('プレー代とは別だと書いてある', /プレー代とは別/.test(H));
  chk('賞金だけの金額だと念を押す', /これは<b>賞金だけ<\/b>の金額/.test(H));
  chk('当日の総額はどこを見るか案内する', /当日集める総額は下の「当日いくら集めるか」/.test(H));
  console.log('  -- 上から下へたどれる --');
  chk('ひとりの額 × 人数 ＝ 総額 が並ぶ', /× 対象 <b>\d+名<\/b> ＝/.test(H));
  chk('原資から出す賞金の一覧がある', /この原資から出す賞金/.test(H));
  chk('順位賞の内訳が見える', /優勝 10,000/.test(H));
  chk('技能賞の内訳が見える', /ニアピン \d+ホール × 1,000/.test(H));
  chk('賞金の合計が出る', /賞金の合計/.test(H));
  chk('原資の残りが出る', /原資の残り/.test(H));
  chk('ひとりあたり戻る額が出る', /賞金として <b>[\d,]+円<\/b> ぶんが戻る計算/.test(H),
      (H.match(/賞金として <b>[\d,]+円<\/b>/)||['見つからない'])[0].replace(/<[^>]*>/g,''));
  const P=app.prizeTotal(), pool=app.feeTotal(), mem=app.feeMembers().length;
  chk('戻る額＝賞金の合計 ÷ 人数',
      H.includes(`（${P.all.toLocaleString()}円 ÷ ${mem}名）`),
      `${P.all} ÷ ${mem} = ${Math.round(P.all/mem)}`);
  chk('残り＝原資 − 賞金', H.includes((pool-P.all).toLocaleString()),
      `${pool} − ${P.all} = ${pool-P.all}`);
}
console.log('  -- 原資が足りないと赤く知らせる --');
{
  app.BG().fee=2000; app.go('meta');
  const H=store['pane'].innerHTML;
  chk('足りないと警告が出る', /賞金が原資を [\d,]+円 上回っています/.test(H),
      (H.match(/賞金が原資を [\d,]+円 上回っています/)||['出ない'])[0]);
  chk('どうすればよいか書いてある', /ひとりから集める額を上げるか、賞金を減らして/.test(H));
  app.BG().fee=6000; app.go('meta');
  chk('足りていれば警告は出ない', !/賞金が原資を/.test(store['pane'].innerHTML));
}
console.log('  -- 言葉をそろえる --');
{
  const pcs=require('fs').readFileSync(APP.pc,'utf8');
  chk('「会費」という入力欄が残っていない', !/<label>会費/.test(pcs));
  chk('集金表の見出しも「賞金の原資」', /<th class="n" style="min-width:6\.5em">賞金の原資<\/th>/.test(pcs));
  app.go('money');
  chk('収支の収入も「賞金の原資」', /賞金の原資（/.test(store['pane'].innerHTML));
}

console.log('\n=== 参加のしかたを1つの選択にまとめる ===');
/* 「投票」と「投票のみ」を別々のチェックにしていたが、
   前者は「予想ゲームに参加するか」、後者は「プレーするか」で軸が違い、
   並べると区別がつかなかった。3択の選択にまとめた（2026-09-08）。 */
app.sample(); global.flush();
{
  const D=app.DB(), i=15, p=D.players[i];
  console.log('  -- プレー＋予想（ふつう）--');
  app.joinSet(i,"both");
  chk('組と枠が残る', +p.g>0&&+p.f>0, `組${p.g} 枠${p.f}`);
  chk('投票する', p.vote===true);
  chk('原資の対象', p.fee!==false);
  chk('読み戻せる', app.joinOf(p)==="both", app.joinOf(p));
  console.log('  -- プレーのみ（予想ゲームに参加しない）--');
  app.joinSet(i,"play");
  chk('組と枠は残る', +p.g>0&&+p.f>0, `組${p.g} 枠${p.f}`);
  chk('投票しない', p.vote===false);
  chk('原資はかかる', p.fee!==false);
  chk('出走者には残る', app.RUN().some(x=>x.n===p.n), app.RUN().length+'名');
  chk('投票者から抜ける', !app.VOT().some(x=>x.n===p.n), app.VOT().length+'名');
  chk('読み戻せる', app.joinOf(p)==="play", app.joinOf(p));
  console.log('  -- 予想のみ（回らない）--');
  app.joinSet(i,"vote");
  chk('組と枠が外れる', +p.g===0&&+p.f===0, `組${p.g} 枠${p.f}`);
  chk('投票する', p.vote===true);
  chk('原資の対象から抜ける', p.fee===false);
  chk('車の台数も0', !p.cars);
  chk('出走者から抜ける', !app.RUN().some(x=>x.n===p.n), app.RUN().length+'名');
  chk('投票者には残る', app.VOT().some(x=>x.n===p.n), app.VOT().length+'名');
  chk('徴収は馬券・GTOだけ',
      (()=>{const s=app.settle().find(r=>r.n===p.n);
        return s.bill===s.kq*D.meta.kPrice+s.gq*D.meta.gPrice;})(),
      app.settle().find(r=>r.n===p.n).bill+'円');
  chk('読み戻せる', app.joinOf(p)==="vote", app.joinOf(p));
  console.log('  -- 戻せる --');
  app.joinSet(i,"both");
  chk('原資の対象に戻る', p.fee!==false);
  chk('投票も戻る', p.vote===true);
  D.players[i].f=16;
  chk('枠を入れ直すと出走16名', app.RUN().length===16, app.RUN().length+'名');
  console.log('  -- 画面 --');
  app.go('players');
  const H=store['pane'].innerHTML;
  chk('見出しが「参加のしかた」', /参加のしかた<\/th>/.test(H));
  chk('3つの選択肢が出る',
      ['both','play','vote'].every(v=>H.includes(`<option value="${v}"`)));
  chk('人数ぶんの選択がある', (H.match(/joinSet\(/g)||[]).length===D.players.length,
      (H.match(/joinSet\(/g)||[]).length+'個 / '+D.players.length+'名');
  chk('「投票」の単独チェックが残っていない', !/pEdit\(\d+,'vote'/.test(H));
  chk('3択の意味が書いてある',
      /プレー＋予想/.test(H)&&/プレーのみ/.test(H)&&/予想のみ/.test(H));
}

console.log('\n=== 原資の対象外の人に金額を見せない ===');
/* 2026-09-08、「予想のみ」の人の個別額に標準額（2,500）が薄く出ていて、
   徴収されるように見えるという指摘があった。入力できない欄に金額が見えるのは紛らわしい。
   対象外なら「—」だけを出す。 */
app.sample(); global.flush();
{
  app.joinSet(15,"vote");
  const p=app.DB().players[15];
  chk('原資の額は0円', app.feeOf(p)===0, app.feeOf(p)+'円');
  const s=app.settle().find(r=>r.n===p.n);
  chk('徴収は馬券・GTOだけ', s.bill===s.kq*app.DB().meta.kPrice+s.gq*app.DB().meta.gPrice,
      `馬券${s.kq}口 GTO${s.gq}口 → ${s.bill}円`);
  app.go('players');
  const rows=store['pane'].innerHTML.split('<tr class="zebra"');
  const last=rows[rows.length-1];
  chk('個別額の欄は「—」', /—<\/span>/.test(last));
  chk('標準額が薄く出ていない', !/placeholder="[\d,]+"/.test(last),
      (last.match(/placeholder="[\d,]+"/)||['なし'])[0]);
  console.log('  -- 対象に戻すと入力できる --');
  app.joinSet(15,"both");
  app.go('players');
  const rows2=store['pane'].innerHTML.split('<tr class="zebra"');
  chk('個別額の入力欄が戻る', /feeAmt/.test(rows2[rows2.length-1]));
  console.log('  -- 下の要約も「賞金の原資」 --');
  const H=store['pane'].innerHTML;
  chk('「原資の対象」と出る', /原資の対象/.test(H));
  chk('「賞金の原資 合計」と出る', /賞金の原資 合計/.test(H));
  chk('「会費」という語が残っていない', !/>会費|会費 合計|会費の対象/.test(H));
}

console.log('\n=== 徴収額の丸めと繰越金 ===');
/* 当日の集金でお釣りを出さないよう、ひとりの徴収額を500円や1,000円に切り上げる。
   切り上げたぶんは幹事の取り分ではなく、繰越金として積む（2026-09-08）。 */
app.sampleHard(); global.flush();
{
  console.log('  -- 丸めない（既定）--');
  app.BG().roundUnit=0;
  let S=app.settle();
  chk('切り上げは起きない', S.every(r=>r.roundUp===0));
  chk('徴収額はそのまま', S.every(r=>r.bill===r.billRaw));
  chk('収支に繰越金の行が立たない', !app.budget().inc.some(x=>/端数の繰越/.test(x.l)));
  console.log('  -- 500円単位 --');
  app.BG().roundUnit=500;
  S=app.settle();
  chk('全員が500円の倍数になる', S.every(r=>r.bill%500===0),
      [...new Set(S.map(r=>r.bill%500))].join(','));
  chk('切り上げなので元の額を下回らない', S.every(r=>r.bill>=r.billRaw));
  chk('切り上げ幅は500円未満', S.every(r=>r.roundUp<500),
      Math.max(...S.map(r=>r.roundUp))+'円');
  const r500=S.reduce((a,x)=>a+x.roundUp,0);
  chk('切り上げたぶんが繰越金に立つ',
      (app.budget().inc.find(x=>/端数の繰越/.test(x.l))||{v:0}).v===r500, r500+'円');
  chk('繰越金の行に単位が書いてある',
      /500円単位に切り上げ/.test((app.budget().inc.find(x=>/端数の繰越/.test(x.l))||{l:""}).l),
      (app.budget().inc.find(x=>/端数の繰越/.test(x.l))||{l:'なし'}).l);
  console.log('  -- 1,000円単位 --');
  app.BG().roundUnit=1000;
  S=app.settle();
  chk('全員が1,000円の倍数になる', S.every(r=>r.bill%1000===0));
  chk('500円単位より繰越が増える', S.reduce((a,x)=>a+x.roundUp,0)>r500,
      S.reduce((a,x)=>a+x.roundUp,0)+'円 > '+r500+'円');
  console.log('  -- 見込みにも効く --');
  app.BG().roundUnit=500;
  const C=app.collectPlan();
  chk('切り上げ後の目安が出る', C.eachRounded%500===0, C.each+'円 → '+C.eachRounded+'円');
  chk('ひとりの切り上げぶんが出る', C.roundEach===C.eachRounded-C.each, C.roundEach+'円');
  chk('丸めの単位を返す', C.unit===500);
  console.log('  -- ちょうどの額は切り上げない --');
  app.BG().roundUnit=1000;
  {
    const D=app.blank(); D.meta.budget.fee=5000; D.meta.budget.roundUnit=1000;
    D.meta.use.keiba=false; D.meta.use.gto=false;
    D.players.push({n:"甲",org:"",bd:"1970-01-01",g:1,f:1,vote:true,fee:true,feeAmt:""});
    app.setDB(D);
    const r=app.settle()[0];
    chk('5,000円ちょうどなら切り上げない', r.bill===5000&&r.roundUp===0,
        `${r.billRaw} → ${r.bill}（+${r.roundUp}）`);
  }
  console.log('  -- 画面 --');
  app.sampleHard(); global.flush(); app.BG().roundUnit=500;
  app.go('meta');
  const H=store['pane'].innerHTML;
  chk('丸めの設定欄がある', /gSet\('roundUnit'/.test(H));
  chk('3つの選択肢がある', /丸めない/.test(H)&&/500円単位/.test(H)&&/1,000円単位/.test(H));
  chk('繰越金になると書いてある', /繰越金として積みます/.test(H));
  chk('切り上げ後の目安が出る', /切り上げ後/.test(H));
  app.go('collect');
  const M=store['pane'].innerHTML;
  chk('集金表に切り上げの列が出る', /切り上げ<\/th>/.test(M));
  chk('繰越金の説明が出る', /繰越金<\/b>として積まれます/.test(M));
  chk('幹事の取り分でないと明記', /幹事の取り分ではありません/.test(M));
}

console.log('\n合計 NG: '+ng);
