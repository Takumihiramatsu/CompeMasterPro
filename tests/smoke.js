/* 全タブと発表スライドを実際に描かせ、undefined・NaN・[object Object] が
   画面に出ていないかを見る。計算の正しさは各テストが見るので、ここは
   「壊れていないこと」だけを広く浅く確かめる。
   欠席者を1名つくり、無効口がある状態で回すのが要点。 */
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
/* buildSlides() は値を返さず slides に入れる。money.js と同じ受け取り方をする */
const app=new Function(src+`;return {DB:()=>DB,sample,go,tabList,render,applyScores,
  buildSlides,get slides(){return slides},calcK,calcG,gVoid,ledger,settle};`)();
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};
const dirty=s=>/undefined|NaN|\[object Object\]/.test(s);

app.sample();global.flush();
const DB=app.DB();
/* 欠席者をつくる。組を未定にすると出走者から外れ、その人を指名した口が無効になる */
/* GTOで実際に指名されている人でないと、無効口が発生しない */
const absent=DB.players[13].n;
DB.players[13].g=0;DB.players[13].f=0;
DB.result.frame='1-2';
const live=DB.gto.filter(r=>!app.gVoid(r));
DB.result.low=live[0].p.slice();

console.log('=== 1. 無効口が発生している前提を確かめる ===');
chk('欠席にした人を指名した口が無効になった', app.calcG().badUnits>0, app.calcG().badUnits+'口');
chk('無効の返金額が立っている', app.calcG().badTotal>0, app.calcG().badTotal+'円');

console.log('\n=== 2. 全タブが描ける ===');
app.tabList().forEach(([k,label])=>{
  try{
    app.go(k);global.flush();
    const html=global.pane.innerHTML||'';
    chk(label, html.length>0&&!dirty(html), html.length+'文字');
  }catch(e){chk(label, false, '例外: '+e.message);}
});

console.log('\n=== 3. 発表スライドが描ける ===');
app.applyScores();
app.buildSlides();
chk('スライドが組み立てられた', app.slides.length>0, app.slides.length+'枚');
let e=0;
app.slides.forEach(s=>{
  try{ if(dirty(s.html())){e++;console.log('  NG  '+s.id+' に undefined/NaN');} }
  catch(x){e++;console.log('  NG  '+s.id+' 例外: '+x.message);}
});
chk('全'+app.slides.length+'画面が描画できる', e===0, e?e+'件で失敗':'');

console.log('\n=== 4. 精算表に穴がない ===');
const L=app.ledger(),S=app.settle();
chk('台帳の全員に数値が入っている',
  L.every(x=>[x.paid,x.back,x.fine,x.bad].every(v=>typeof v==='number'&&!isNaN(v))));
chk('収支表の全員に数値が入っている',
  S.every(x=>[x.bill,x.back,x.fine,x.net].every(v=>typeof v==='number'&&!isNaN(v))));
chk('欠席者も収支表に残っている（会費・投票の精算があるため）',
  S.some(x=>x.n===absent), absent);

console.log('\n'+(ng?'NG '+ng+' 件':'すべて合格'));
process.exit(ng?1:0);
