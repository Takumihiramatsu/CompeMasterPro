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
const app=new Function(src+`;return {DB:()=>DB,blank,migrate,hcOf,hcRaw,hcCapped,standings,scoreOf,SCset,go,coursePar,RUN};`)();
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));

const D=app.DB();
D.players=[{n:"上手",g:1,f:1,vote:true},{n:"平均",g:1,f:1,vote:true},{n:"苦手",g:2,f:2,vote:true}];
const par=D.meta.sc.par, hid=D.meta.sc.hidden;
const setAll=(n,over)=>{const s=app.scoreOf(n);par.forEach((p,i)=>s.h[i+1]=p+over);s.gross=72+over*18;};
setAll("上手",1); setAll("平均",2); setAll("苦手",3);

console.log('=== 既定（上限30）===');
ok('上限あり', app.hcCapped()===true);
app.RUN().forEach(p=>console.log('  ',p.n,'本来',app.hcRaw(p),'→ 適用',app.hcOf(p)));
ok('苦手の本来値が30超', app.hcRaw({n:"苦手"})>30, app.hcRaw({n:"苦手"}));
ok('30で頭打ち', app.hcOf({n:"苦手"})===30);

console.log('\n=== 上限なしに切替 ===');
app.SCset('hcUse',false);
ok('上限なしになる', app.hcCapped()===false);
ok('本来値がそのまま出る', app.hcOf({n:"苦手"})===app.hcRaw({n:"苦手"}), app.hcOf({n:"苦手"}));
const st1=app.standings();
console.log('  順位:',st1.net.map(r=>r.rank+'位 '+r.n+' NET'+r.net+'(HDCP'+r.hc+')').join(' / '));

console.log('\n=== 上限を20に変更 ===');
app.SCset('hcUse',true); app.SCset('hcMax',20);
ok('20で頭打ち', app.hcOf({n:"苦手"})===20 && app.hcOf({n:"平均"})<=20,
   '苦手'+app.hcOf({n:"苦手"})+' 平均'+app.hcOf({n:"平均"}));
const st2=app.standings();
console.log('  順位:',st2.net.map(r=>r.rank+'位 '+r.n+' NET'+r.net+'(HDCP'+r.hc+')').join(' / '));
ok('上限の有無でネットが変わる',
   JSON.stringify(st1.net.map(r=>r.net))!==JSON.stringify(st2.net.map(r=>r.net)),
   '上限なし '+st1.net.map(r=>r.net).join('/')+' → 上限20 '+st2.net.map(r=>r.net).join('/'));

console.log('\n=== 小数の上限 ===');
app.SCset('hcMax',27.2);
ok('27.2で頭打ち', app.hcOf({n:"苦手"})===27.2, app.hcOf({n:"苦手"}));

console.log('\n=== 画面表示 ===');
app.SCset('hcUse',true); app.SCset('hcMax',30);
app.go('meta');
ok('式に「上限 30」が出る', store['pane'].innerHTML.includes('上限 30'));
app.SCset('hcUse',false); app.go('meta');
ok('式に「上限なし」が出る', store['pane'].innerHTML.includes('上限なし'));
ok('上限値の欄は隠れる', !store['pane'].innerHTML.includes('上限の値'));
app.SCset('hcUse',true); app.go('meta');
ok('上限ありなら上限値の欄が出る', store['pane'].innerHTML.includes('上限の値'));
/* 競技結果は段階2（2026-09-17）で「順位・表彰」へ移った */
app.go('rank');
ok('上限到達の警告が出る', store['pane'].innerHTML.includes('上限（30）に達した'),
   (store['pane'].innerHTML.match(/上限（30）に達した方が \d+名/)||[''])[0]);

console.log('\n=== 旧データの移行 ===');
const old={v:2,meta:{sc:{hcMax:0,par:par,hidden:hid,system:"double",cut:"triplePar"}},players:[],groups:[]};
const m1=app.migrate(old);
ok('hcMax:0 は「上限なし」に', m1.meta.sc.hcUse===false);
const old2={v:2,meta:{sc:{hcMax:30,par:par,hidden:hid,system:"double",cut:"triplePar"}},players:[],groups:[]};
ok('hcMax:30 は「上限あり」に', app.migrate(old2).meta.sc.hcUse===true);
