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
global.alert=()=>{};global.confirm=()=>true;
global.URL={createObjectURL:()=>'',revokeObjectURL(){}};global.Blob=class{};
global.localStorage={setItem(){},getItem(){return null},removeItem(){}};
['show','hud','dots','tabs','saveState','hdTitle','pane','sndBtn'].forEach(id=>{global[id]=doc.getElementById(id)});
const app=new Function(src+`;return {DB:()=>DB,sample,go,gMove,inGroup,RUN,feeMembers,fullToggle,tabList};`)();
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};
app.sample(); global.flush();
const n=app.DB().players[0].n;
console.log('=== 組の選択欄（タッチ操作の代替）===');
chk('はじめは1組', app.DB().players[0].g===1);
app.gMove(n,3);
chk('3組へ移せる', app.DB().players[0].g===3&&app.inGroup(3).some(p=>p.n===n));
/* サンプルは枠を自分で決める運用（組と枠は別物）。組を移しても枠は変わらない。
   組と枠を連動させるのは「枠の作り方＝組と同じにする」を選んだときだけ */
chk('枠は連動しない（組と枠は別物）', app.DB().players[0].f!==3,
    '組3 / 枠'+app.DB().players[0].f);
app.gMove(n,0);
/* 組を未定にすると枠も外れ、出走者から抜ける */
chk('未定に戻すと出走から抜ける', app.DB().players[0].g===0&&app.DB().players[0].f===0
    &&app.RUN().length===15, '出走'+app.RUN().length+'名');
chk('会費も自動で外れる', app.DB().players[0].fee===false, '会費'+app.DB().players[0].fee);
app.gMove(n,1);
/* 組を戻しても枠は戻らない（枠を自分で決める運用）。
   枠を入れ直すと出走者に戻り、会費も戻る */
chk('組を戻しただけでは出走に戻らない', app.RUN().length===15, '出走'+app.RUN().length+'名');
app.DB().players[0].f=1; app.DB().players[0].fee=true;
chk('枠を入れ直すと出走16名・会費も戻る',
    app.DB().players[0].fee===true&&app.RUN().length===16, '出走'+app.RUN().length+'名');
let e=0; try{app.fullToggle();}catch(x){e++;}
chk('全画面ボタンが例外を出さない', e===0);
e=0; app.tabList().forEach(([k])=>{try{app.go(k)}catch(x){e++;console.log('  ★',k,x.message)}});
chk('全タブ描画', e===0);
console.log('\n合計 NG: '+ng);
