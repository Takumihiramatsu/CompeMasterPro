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
['show','hud','dots','tabs','saveState','hdTitle','pane','sndBtn','crsSel','crsName','crsPaste','crsPv']
  .forEach(id=>{global[id]=doc.getElementById(id)});
const app=new Function(src+`;return {DB:()=>DB,blank,migrate,go,parsePar,crsParse,parApply,crsSave,crsDel,crsPick,
  crsList,coursePar,outSum,inSum,SC,hcOf,scoreOf,SCset,sample,standings,TPL};`)();
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};
const P72=[4,4,3,5,4,4,3,4,5,4,3,4,4,5,4,3,4,5];

console.log('=== 1. スコアカードの読み取り ===');
const cases=[
 ['スペース区切り', '4 4 3 5 4 4 3 4 5  4 3 4 4 5 4 3 4 5', P72],
 ['タブ区切り', P72.join('\t'), P72],
 ['カンマ区切り', P72.join(','), P72],
 ['ホール番号つき', P72.map((p,i)=>(i+1)+' '+p).join('  '), P72],
 ['OUT/IN合計つき', P72.slice(0,9).join(' ')+' OUT 36 '+P72.slice(9).join(' ')+' IN 36 TOTAL 72', P72],
];
cases.forEach(([label,txt,exp])=>{
  const r=app.parsePar(txt);
  chk(label, JSON.stringify(r.par)===JSON.stringify(exp), r.par.join(' ')+(r.note?' ['+r.note+']':''));
});
const short=app.parsePar('4 4 3 5 4');
chk('数が足りなければ不足と分かる', short.par.length===5, short.par.length+'個');

console.log('\n=== 2. 貼り付けからの反映 ===');
const P71=[4,4,3,5,4,4,3,4,5,4,3,4,4,4,4,3,4,5];
store['crsPaste'].value=P71.join(' ');
app.crsParse();
chk('プレビューに合計71', store['crsPv'].innerHTML.includes('<b>71</b>'),
    (store['crsPv'].innerHTML.match(/合計 <b>\d+<\/b>/)||[''])[0]);
chk('OUT/IN も出る', store['crsPv'].innerHTML.includes('OUT 36'));
app.parApply();
chk('パー配分が入る', JSON.stringify(app.SC().par)===JSON.stringify(P71));
chk('合計71', app.coursePar()===71, app.coursePar());
chk('OUT36 IN35', app.outSum()===36&&app.inSum()===35, app.outSum()+' / '+app.inSum());

console.log('\n=== 3. 変な合計は警告 ===');
store['crsPaste'].value='3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3';
app.crsParse();
chk('合計54は警告扱い', store['crsPv'].innerHTML.includes('一般的な範囲から外れ'));

console.log('\n=== 4. コース登録 ===');
app.SCset('par',P72.slice());
store['crsName'].value='○○カントリークラブ 東';
A=[]; app.crsSave();
chk('登録できる', app.DB().courses.length===1, A[0]);
chk('パーが保存される', JSON.stringify(app.DB().courses[0].par)===JSON.stringify(P72));
app.SCset('par',P71.slice());
chk('別配分に変更', app.coursePar()===71);
const idx=app.crsList().findIndex(c=>c.name==='○○カントリークラブ 東');
app.crsPick(String(idx));
chk('選ぶと元の配分に戻る', app.coursePar()===72&&JSON.stringify(app.SC().par)===JSON.stringify(P72));
chk('会場名も入る', app.DB().meta.place==='○○カントリークラブ 東', app.DB().meta.place);

console.log('\n=== 5. ひな形 ===');
chk('ひな形は3つ', app.TPL.length===3, app.TPL.map(t=>t.name).join(' / '));
const t70=app.crsList().findIndex(c=>c.tpl&&c.par.reduce((a,b)=>a+b,0)===70);
app.crsPick(String(t70));
chk('パー70のひな形が入る', app.coursePar()===70);
chk('ひな形選択で会場名は上書きされない', app.DB().meta.place==='○○カントリークラブ 東');
A=[]; store['crsSel'].value=String(t70); app.crsDel();
chk('ひな形は削除できない', app.DB().courses.length===1, A[0]);

console.log('\n=== 6. 削除と上書き ===');
store['crsName'].value='○○カントリークラブ 東';
app.SCset('par',P71.slice()); A=[]; app.crsSave();
chk('同名は上書き', app.DB().courses.length===1&&app.DB().courses[0].par.reduce((a,b)=>a+b,0)===71);
const i2=app.crsList().findIndex(c=>!c.tpl);
store['crsSel'].value=String(i2); A=[]; app.crsDel();
chk('登録コースを削除できる', app.DB().courses.length===0);

console.log('\n=== 7. パー変更がハンディに効く ===');
app.sample(); global.flush();
app.SCset('entry','hidden');
/* 上位の選手はHDCPが0で頭打ちになり、パーを変えても0のまま。
   変化が見える中位の選手で確かめる */
const before=app.hcOf(app.DB().players[8]);
app.SCset('par',[5,5,4,6,5,5,4,5,6,5,4,5,5,6,5,4,5,6]);  // パー81
const after=app.hcOf(app.DB().players[8]);
chk('コースパーが変わるとHDCPも変わる', before!==after, before+' → '+after+'（パー72→'+app.coursePar()+'）');

console.log('\n=== 8. 保存と移行 ===');
app.DB().courses=[{name:'テストCC',par:P72}];
const saved=JSON.parse(JSON.stringify(app.DB()));
const m=app.migrate(saved);
chk('登録コースが保存・復元される', m.courses.length===1&&m.courses[0].name==='テストCC');
const old={v:2,meta:{},players:[],groups:[]};
chk('旧データでも空配列で開ける', Array.isArray(app.migrate(old).courses));

console.log('\n=== 9. 画面 ===');
app.go('meta');
chk('コースのカードがある', store['pane'].innerHTML.includes('コース（各ホールのパー）'));
chk('OUT/IN/合計の欄がある', store['pane'].innerHTML.includes('>OUT<')&&store['pane'].innerHTML.includes('>IN<'));
chk('貼り付け欄がある', store['pane'].innerHTML.includes('id="crsPaste"'));
console.log('\n合計 NG: '+ng);
