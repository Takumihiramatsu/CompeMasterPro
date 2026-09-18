/* アプリの場所。テストと同じ場所の site/ を先に見て、無ければ ../docs/ を使う。
   リポジトリでは tests/ と docs/ が並ぶ構成なので、どちらでも動く */
const _P=require('path'),_F=require('fs');
const _DIR=[_P.join(__dirname,'site'),_P.join(__dirname,'..','docs')]
  .find(d=>_F.existsSync(_P.join(d,'pc.html')))||_P.join(__dirname,'site');
const APP={dir:_DIR+'/', get pc(){return this.dir+'pc.html'}, get scan(){return this.dir+'index.html'}};
const fs=require('fs');
const h=fs.readFileSync(APP.pc,'utf8');
const src=h.slice(h.indexOf('<script>')+8,h.lastIndexOf('</script>'));
const store={};
const mk=id=>({id,value:'',textContent:'',className:'',checked:false,style:{},files:[],
  _html:'',get innerHTML(){return this._html},set innerHTML(v){this._html=v},
  classList:{add(){},remove(){},toggle(){},contains:()=>false},
  addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[],insertAdjacentHTML(){},click(){},focus(){},setSelectionRange(){}});
const doc={documentElement:{style:{},requestFullscreen(){}},body:{className:'',classList:{add(){},remove(){},contains:()=>false}},
  getElementById:id=>store[id]||(store[id]=mk(id)),querySelectorAll:()=>[],addEventListener(){},createElement:()=>mk('a')};
global.document=doc;global.window={AudioContext:function(){throw 0},addEventListener(){}};
const _t=[];global.setTimeout=f=>{_t.push(f);return 1};global.flush=()=>_t.splice(0).forEach(f=>{try{f()}catch(e){}});
global.setInterval=()=>1;global.clearInterval=()=>{};global.clearTimeout=()=>{};
global.performance={now:()=>0};global.requestAnimationFrame=()=>{};
let A=[];global.alert=m=>A.push(m);global.confirm=()=>true;
let REVOKED=0;
global.URL={createObjectURL:()=>'blob:shot'+Math.random().toString(36).slice(2,6),revokeObjectURL(){REVOKED++}};
global.Blob=class{};global.localStorage={setItem(){},getItem(){return null},removeItem(){}};
['show','hud','dots','tabs','saveState','hdTitle','pane','sndBtn','paste','pv','shotImg','shotFile','shotDrop']
 .forEach(id=>{global[id]=doc.getElementById(id)});
const app=new Function(src+`;return {DB:()=>DB,sample,go,SCset,tidy,parseSheet,parsePar,parseKeiba,parseGto,parsePlayers,pastePreview,pasteApply,standings,scoreOf,RUN,
  get DBX(){return DB}};`)();
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};

app.sample(); global.flush(); app.SCset('entry','sheet');

console.log('\n=== 2. 写真から読み取った文字の取り込み ===');
const N=app.RUN().map(p=>p.n);
/* スマホのOCRが出しがちな形：全角数字・罫線・余分な空白 */
const ocr=[
  `１　${N[0]}　９２　１８．０　７４．０`,
  `2 | ${N[1]} | 101 | 25.2 | 75.8`,
  `３ ${N[2]}   ８８  １２．０  ７６．０`,
].join('\n');
console.log('  入力例:',JSON.stringify(ocr.split('\n')[0]));
const rows=app.parseSheet(ocr);
chk('全角数字を読める', rows[0].g===92&&rows[0].hc===18&&rows[0].net===74,
    `${rows[0].name} G${rows[0].g} HC${rows[0].hc} NET${rows[0].net}`);
chk('罫線が混じっても読める', rows[1].g===101&&rows[1].hc===25.2, `G${rows[1].g} HC${rows[1].hc}`);
chk('全角の小数点も読める', rows[2].hc===12&&rows[2].net===76, `HC${rows[2].hc} NET${rows[2].net}`);
chk('3行とも氏名が一致', rows.every(r=>r.found), rows.map(r=>r.name).join(' / '));
store['paste'].value=ocr; app.pastePreview(); A=[]; app.pasteApply();
chk('取り込める', A[0].includes('3名'), A[0]);
const st=app.standings();
chk('ネットが計算される', st.rows.find(r=>r.n===N[0]).net===74);

console.log('\n=== 3. ほかの貼り付けも全角に強い ===');
chk('パー配分（全角）', app.parsePar('４ ４ ３ ５ ４ ４ ３ ４ ５ ４ ３ ４ ４ ５ ４ ３ ４ ５').par.length===18);
const k=app.parseKeiba(`${N[0]}　１－３　２`)[0];
chk('馬券（全角の数字とハイフン）', k.ok&&k.a===1&&k.b===3&&k.q===2, `${k.a}-${k.b}×${k.q}`);
const g=app.parseGto(`${N[0]}｜${N[3]}｜${N[5]}｜${N[7]}｜２`)[0];
chk('GTO（罫線区切り）', g.ok&&g.q===2, g.picks.join('→')+' ×'+g.q);
const p=app.parsePlayers('山田　太郎,営業部,１９７０／１／１')[0];
chk('参加者（全角の日付）', p.bd==='1970-01-01', p.name+' '+p.bd);
const p2=app.parsePlayers('青木　健一\t営業部\t1970/1/1')[0];
chk('氏名の全角スペースが保たれる', p2.name==='青木　健一', '「'+p2.name+'」');

console.log('\n=== 4. 整形の中身 ===');
[['全角数字','１２３','123'],['罫線を空白に','a|b','a b'],
 ['全角の小数点','１２．５','12.5'],['連続空白を1つに','a   b','a b'],
 ['氏名の全角スペースは残す','青木　健一','青木　健一'],
 ['半角カナは全角に','ｱｵｷ','アオキ']]
 .forEach(([l,a,b])=>chk(l, app.tidy(a)===b, `「${a}」→「${app.tidy(a)}」`));

console.log('\n=== 5. 画面 ===');
let e=0;['meta','players','score','bets','money','result','help'].forEach(t=>{try{app.go(t)}catch(x){e++;console.log('  ★',t,x.message)}});
chk('各タブが描ける', e===0);
console.log('\n合計 NG: '+ng);
