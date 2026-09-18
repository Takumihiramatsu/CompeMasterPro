/* 1文字ずつ打っても消えないかを検証（onchange＝入力確定時のみ反映） */
/* アプリの場所。テストと同じ場所の site/ を先に見て、無ければ ../docs/ を使う。
   リポジトリでは tests/ と docs/ が並ぶ構成なので、どちらでも動く */
const _P=require('path'),_F=require('fs');
const _DIR=[_P.join(__dirname,'site'),_P.join(__dirname,'..','docs')]
  .find(d=>_F.existsSync(_P.join(d,'pc.html')))||_P.join(__dirname,'site');
const APP={dir:_DIR+'/', get pc(){return this.dir+'pc.html'}, get scan(){return this.dir+'index.html'}};
const fs=require('fs');
const h=fs.readFileSync(APP.pc,'utf8');
const src=h.slice(h.indexOf('<script>')+8,h.lastIndexOf('</script>'));
/* 描画されたHTMLから、指定入力欄のハンドラ種別を読み取る */
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
const app=new Function(src+`;return {DB:()=>DB,go,render,holes,sample,M,SCset,blank};`)();

const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));
app.sample();

app.go('meta');
const html=store['pane'].innerHTML;
/* 見出しの <label> から探す。段階3で大会設定に「ニアピン ×4」などの札が付き、
   文字だけで探すと札を拾ってしまった */
const field=(label)=>{
  const i=html.indexOf('<label>'+label);
  const seg=html.slice(i,i+400);
  const m=seg.match(/<input[^>]*>/);
  return m?m[0]:'';
};
[['ニアピン','nearHoles'],['何でもニアピン','nearAnyHoles'],['ドラコン','drakoHoles'],['隠しホール','hidden']]
  .forEach(([label,key])=>{
    const f=field(label);
    ok(label+'欄は入力確定時に反映（onchange）', f.includes('onchange=')&&!f.includes('oninput='),
       f.match(/on(input|change)/g)?.join(','));
  });

/* カンマを含む文字列がそのまま解釈されるか */
console.log('\n-- 解析の確認 --');
[['4,7,12,16',[4,7,12,16]],['4、7、12',[4,7,12]],['4 7 12',[4,7,12]],['4,',[4]],['',[]]]
  .forEach(([inp,exp])=>ok('「'+inp+'」→ ['+app.holes(inp)+']',
    JSON.stringify(app.holes(inp))===JSON.stringify(exp)));

/* 反映後に値が保持されるか */
app.M('nearHoles',app.holes('3,8,13,17'));
app.go('meta');
ok('反映後に欄へ戻る', store['pane'].innerHTML.includes('value="3,8,13,17"'),
   (store['pane'].innerHTML.match(/value="[\d,]+"/g)||[]).slice(0,3).join(' '));

/* スコア欄・口数欄も同様か */
app.go('score');
const sh=store['pane'].innerHTML;
ok('スコア欄もonchange', /class="q"[^>]*onchange="scSet/.test(sh) && !/onchange="scSet[^>]*oninput/.test(sh));
app.go('bets');
const bh=store['pane'].innerHTML;
ok('口数欄もonchange', bh.includes('onchange="kQ(')||bh.includes('onchange="gQ('));
