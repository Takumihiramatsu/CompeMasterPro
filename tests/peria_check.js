/* ダブルペリアの計算を、実在ルールの数値例で検証 */
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
global.setTimeout=()=>0;global.setInterval=()=>1;global.clearInterval=()=>{};global.clearTimeout=()=>{};
global.performance={now:()=>0};global.requestAnimationFrame=()=>{};global.alert=()=>{};global.confirm=()=>true;
global.URL={createObjectURL:()=>'',revokeObjectURL(){}};global.Blob=class{};
global.localStorage={setItem(){},getItem(){return null},removeItem(){}};
['show','hud','dots','tabs','saveState','hdTitle','pane','sndBtn'].forEach(id=>{global[id]=doc.getElementById(id)});
const app=new Function(src+`;return {DB:()=>DB,blank,hcOf,grossOf,standings,scoreOf,SCset,coursePar,RUN};`)();

const D=app.DB();
D.meta.sc.par=[4,4,3,5,4,4,3,4,5,4,3,4,4,5,4,3,4,5];
D.meta.sc.hidden=[2,3,5,6,8,9,11,12,14,15,17,18];
D.players=[{n:"A",g:1,f:1,vote:true,bd:"1960-01-01"},
           {n:"B",g:1,f:1,vote:true,bd:"1980-01-01"}];
/* Aは全ホール パー＋1（＝90）。隠し12ホールの合計は各パー+1 */
const parA=D.meta.sc.par;
const sA=app.scoreOf("A"); parA.forEach((p,i)=>sA.h[i+1]=p+1); sA.gross=90;
/* Bは1番だけ大叩き（12）。1番は隠しホールではないのでHDCPに影響しないはず */
const sB=app.scoreOf("B"); parA.forEach((p,i)=>sB.h[i+1]=p+1); sB.h[1]=12; sB.gross=98;

const hid=D.meta.sc.hidden;
const sumA=hid.reduce((a,hh)=>a+Math.min(sA.h[hh],parA[hh-1]*3),0);
console.log('隠し12H合計(A)',sumA,'→ HDCP =(',sumA,'×1.5 −72)×0.8 =',
  Math.round(((sumA*1.5-72)*0.8)*10)/10);
console.log('アプリのHDCP(A)',app.hcOf({n:"A"}),' NET',90-app.hcOf({n:"A"}));
console.log('アプリのHDCP(B)',app.hcOf({n:"B"}),'（1番は隠しホール外なので同じはず）');

/* トリプルパーカットの効き目：隠しホールの2番(par4)を20打にする */
sB.h[2]=20;
console.log('---- 2番(par4)を20打に ----');
app.SCset('cut','none');
console.log('カットなし HDCP(B)',app.hcOf({n:"B"}));
app.SCset('cut','triplePar');
console.log('トリプルパー(12でカット) HDCP(B)',app.hcOf({n:"B"}),
  '差', Math.round((20-12)*1.5*0.8*10)/10,'が削られるはず');
app.SCset('cut','tripleBogey');
console.log('トリプルボギー(7でカット) HDCP(B)',app.hcOf({n:"B"}));

/* 上限 */
app.SCset('cut','none'); D.meta.sc.hcMax=30;
console.log('---- 上限30 ----');
sB.h[2]=20; console.log('上限あり',app.hcOf({n:"B"}));
D.meta.sc.hcMax=0; console.log('上限なし',app.hcOf({n:"B"}));
D.meta.sc.hcMax=30; app.SCset('cut','triplePar');

/* 同ネットの決着 */
sB.h[2]=parA[1]+1; sB.h[1]=parA[0]+1; sB.gross=90;
const st=app.standings();
console.log('---- 同ネットの決着（年長者を上位）----');
console.log(st.net.map(r=>r.rank+'位 '+r.n+' NET'+r.net+' 生年'+r.p.bd).join(' / '));
app.SCset('tiebreak','younger');
console.log('年少者を上位に切替 →',app.standings().net.map(r=>r.rank+'位 '+r.n).join(' / '));
