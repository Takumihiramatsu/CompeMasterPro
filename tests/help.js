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
const app=new Function(src+`;return {DB:()=>DB,blank,sample,go,tabList,vHelp,SCset,coursePar};`)();
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};

console.log('=== 1. タブ ===');
chk('「使い方」タブがある', app.tabList().some(t=>t[1]==='使い方'), app.tabList().map(t=>t[1]).join('/'));
/* 段階2（2026-09-17）で大会ハブ・順位・表彰・集金・結果共有・出力の4つを足した。
   段階3で追加ルールを大会設定から独立させて16 */
chk('タブは16個', app.tabList().length===16, app.tabList().length);

console.log('\n=== 2. 空の状態での案内 ===');
app.go('meta');
chk('はじめての方への案内が出る', store['pane'].innerHTML.includes('はじめてお使いですか'));

console.log('\n=== 3. 内容 ===');
app.sample(); global.flush();
app.go('help');
const H=store['pane'].innerHTML;
[['作業の流れ','作業の流れ'],['いまのルール設定','いまのルール設定'],
 ['貼り付けの書式','貼り付けで入力できるもの'],['発表の操作','発表画面の操作'],
 ['保存の説明','保存について'],['困ったとき','困ったときは']]
 .forEach(([l,k])=>chk(l+'がある', H.includes(k)));
chk('印刷ボタンがある', H.includes('window.print()'));

console.log('\n=== 4. 設定が反映される（動的）===');
chk('ダブルペリアの式が出る', H.includes('隠しホール合計 × 1.5 − 72')&&H.includes('上限 30'),
    (H.match(/ハンディ ＝[^<]*/)||[''])[0]);
chk('馬券の単価', H.includes('1口 200円'));
chk('GTOの方式', H.includes('本日の方式は<b>3連複</b>'));
chk('枠数と組合せ数', H.includes('現在 8枠・36通り'), (H.match(/現在 \d+枠・\d+通り/)||[''])[0]);
chk('会費の対象人数', H.includes('対象は 16名'));

console.log('\n=== 5. 設定を変えると説明も変わる ===');
app.SCset('system','new'); app.SCset('hidden',[3,6,9,12,15,18]);
app.DB().meta.gMode='3連単'; app.DB().meta.kPrice=300;
app.DB().meta.sc.hcUse=false;
app.go('help');
const H2=store['pane'].innerHTML;
chk('新ペリアの式に変わる', H2.includes('× 3 − 72'), (H2.match(/隠しホール合計 × [\d.]+/)||[''])[0]);
chk('上限なしと表示', H2.includes('<b>上限なし</b>'));
chk('3連単に変わる', H2.includes('本日の方式は<b>3連単</b>'));
chk('単価300円に変わる', H2.includes('1口 300円'));
app.SCset('entry','sheet'); app.go('help');
chk('集計表モードの説明に変わる', store['pane'].innerHTML.includes('ゴルフ場の集計表のグロス・HDCPをそのまま'));

console.log('\n=== 6. 使わない機能は説明も消える ===');
app.DB().meta.use={score:true,near:true,nearAny:false,drako:false,keiba:false,gto:false,
  fine:false,prize:false,budget:false,team:false,lucky:false};
app.go('help');
const H3=store['pane'].innerHTML;
chk('馬券の説明が消える', !H3.includes('馬券（枠連予想）'));
chk('GTOの説明が消える', !H3.includes('GTO（下位予想）'));
chk('ドラコンの説明が消える', !H3.includes('<b>ドラコン</b>'));
chk('ニアピンの説明は残る', H3.includes('<b>ニアピン</b>'));
chk('作業の流れも短くなる', !H3.includes('予想入力'));

console.log('\n=== 7. 描画の安全性 ===');
let e=0;
[app.blank(),null].forEach(()=>{});
app.DB().players=[]; app.DB().keiba=[]; app.DB().gto=[];
try{app.go('help')}catch(x){e++;console.log('  ★',x.message)}
chk('データが空でも描ける', e===0);
e=0; app.tabList().forEach(([k])=>{try{app.go(k)}catch(x){e++;console.log('  ★',k,x.message)}});
chk('全タブ描画', e===0);
console.log('\n合計 NG: '+ng);
