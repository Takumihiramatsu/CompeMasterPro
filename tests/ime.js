/* アプリの場所。テストと同じ場所の site/ を先に見て、無ければ ../docs/ を使う。
   リポジトリでは tests/ と docs/ が並ぶ構成なので、どちらでも動く */
const _P=require('path'),_F=require('fs');
const _DIR=[_P.join(__dirname,'site'),_P.join(__dirname,'..','docs')]
  .find(d=>_F.existsSync(_P.join(d,'pc.html')))||_P.join(__dirname,'site');
const APP={dir:_DIR+'/', get pc(){return this.dir+'pc.html'}, get scan(){return this.dir+'index.html'}};
const fs=require('fs');
const h=fs.readFileSync(APP.pc,'utf8');
const src=h.slice(h.indexOf('<script>')+8,h.lastIndexOf('</script>'));
const store={};let RENDERS=0;
const mk=id=>({id,value:'',textContent:'',className:'',checked:false,style:{},files:[],
  _html:'',get innerHTML(){return this._html},set innerHTML(v){this._html=v;this.rebuilt=(this.rebuilt||0)+1},
  classList:{add(){},remove(){},toggle(){},contains:()=>false},
  addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[],insertAdjacentHTML(){},click(){},focus(){this.focused=true},
  setSelectionRange(){}});
const doc={documentElement:{style:{},requestFullscreen(){}},body:{className:'',classList:{add(){},remove(){},contains:()=>false}},
  getElementById:id=>store[id]||(store[id]=mk(id)),querySelectorAll:()=>[],addEventListener(){},createElement:()=>mk('a')};
global.document=doc;global.window={AudioContext:function(){throw 0},addEventListener(){}};
global.setTimeout=()=>1;global.setInterval=()=>1;global.clearInterval=()=>{};global.clearTimeout=()=>{};
global.performance={now:()=>0};global.requestAnimationFrame=()=>{};
global.alert=()=>{};global.confirm=()=>true;
global.URL={createObjectURL:()=>'',revokeObjectURL(){}};global.Blob=class{};
global.localStorage={setItem(){},getItem(){return null},removeItem(){}};
['show','hud','dots','tabs','saveState','hdTitle','pane','sndBtn','crsQ','crsClub','crsCnt','crsBody']
 .forEach(id=>{global[id]=doc.getElementById(id)});
const app=new Function(src+`;return {DB:()=>DB,go,key,mQuery,mSet,mClubs,mClub,mPar,crsBodyHtml,clubOptions,
  get CRS(){return CRS}, MASTER};`)();
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};

console.log('=== 1. 表記ゆれの吸収 ===');
[['ひらがな→カタカナ','ひらたに','ヒラタニ'],['カタカナそのまま','ヒラタニ','ヒラタニ'],
 ['半角カナ','ﾋﾗﾀﾆ','ヒラタニ'],['全角英数','ＯＧＣ','OGC'],
 ['濁点の有無','ぎふ','キフ'],['半角カナ＋濁点','ｷﾞﾌ','岐阜'.replace('岐阜','キフ')],
 ['中黒と長音を無視','カントリー・倶楽部','カントリ倶楽部'],['空白を無視','三好 カントリー','三好カントリ']]
 .forEach(([l,a,b])=>chk(l+`（${a}）`, app.key(a)===app.key(b), app.key(a)));

console.log('\n=== 2. かなでゴルフ場を探せる ===');
app.go('meta');
const find=q=>{app.mQuery(q);return app.mClubs().map(c=>c.c);};
chk('漢字で探せる', find('信濃').some(c=>c.includes('信濃')), find('信濃').join(' / '));
chk('漢字で探せる（春日井）', find('春日井').some(c=>c.includes('春日井')), find('春日井').join(' / '));
chk('ひらがなでカタカナ部分に当たる', find('かんとりー').length>100, find('かんとりー').length+'件');
chk('ひらがな（ごるふ）', find('ごるふ').length>50, find('ごるふ').length+'件');
chk('カタカナそのまま', find('クラブ').length>20, find('クラブ').length+'件');
chk('濁点なしでも当たる', find('こるふ').length===find('ゴルフ').length, find('こるふ').length+'件 / '+find('ゴルフ').length+'件');
chk('全角英字も探せる', find('ｏｇｃ').length>0, find('ｏｇｃ').join(' / '));
chk('半角カナ', find('ｸﾗﾌﾞ').length===find('クラブ').length, find('ｸﾗﾌﾞ').length+'件');

console.log('\n=== 3. 日本語入力の途中では絞り込まない ===');
app.mQuery('');
const before=app.mClubs().length;
app.mQuery('ひ',{isComposing:true});
chk('変換中は無視する', app.mClubs().length===before&&app.CRS.q==='', 'q="'+app.CRS.q+'"');
app.mQuery('信濃',{isComposing:false});
chk('確定したら絞り込む', app.mClubs().length===1, app.mClubs().map(c=>c.c).join(''));

console.log('\n=== 4. 入力欄を作り直していないこと ===');
const q=store['crsQ'];
q.rebuilt=0; store['crsClub'].rebuilt=0; store['crsBody'].rebuilt=0; store['pane'].rebuilt=0;
app.mQuery('三好');
chk('検索欄は作り直されない', !q.rebuilt, '再生成 '+(q.rebuilt||0)+'回');
chk('画面全体も作り直されない', !store['pane'].rebuilt, '再生成 '+(store['pane'].rebuilt||0)+'回');
chk('ゴルフ場の選択欄だけ更新', store['crsClub'].rebuilt===1, store['crsClub'].rebuilt+'回');
chk('要約部分も更新', store['crsBody'].rebuilt===1, store['crsBody'].rebuilt+'回');
chk('件数も更新', store['crsCnt'].textContent===String(app.mClubs().length), store['crsCnt'].textContent+'件');

console.log('\n=== 5. 1件に絞れたら自動で選ばれる ===');
app.mQuery('信濃');
chk('自動選択', app.CRS.club==='信濃ゴルフ倶楽部', app.CRS.club);
chk('パーも出る', app.mPar()&&app.mPar().par.reduce((a,b)=>a+b,0)===72);
app.mQuery('該当しない語');
chk('0件でも落ちない', app.mClubs().length===0);
chk('0件だと知らせる', store['crsBody'].innerHTML.includes('検索に一致するゴルフ場がありません'));
app.CRS.club=''; app.mQuery('該当しない語');
chk('未選択なら案内文', store['crsBody'].innerHTML.includes('該当するゴルフ場がありません'));
app.mQuery('');
chk('空に戻すと全件', app.mClubs().length===2254, app.mClubs().length+'件');

console.log('\n=== 6. 都道府県との併用 ===');
app.mSet('pref','愛知県'); app.mQuery('カントリー');
chk('愛知県のみ', app.mClubs().every(c=>c.p==='愛知県'), app.mClubs().length+'件');
app.mQuery('信濃');
chk('県が違えば0件', app.mClubs().length===0);
app.mSet('pref',''); app.mQuery('信濃');
chk('県を外すと見つかる', app.mClubs().length===1);
console.log('\n合計 NG: '+ng);
