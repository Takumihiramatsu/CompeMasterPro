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
  _html:'',get innerHTML(){return this._html},set innerHTML(v){this._html=v;this.rebuilt=(this.rebuilt||0)+1},
  classList:{add(){},remove(){},toggle(){},contains:()=>false},
  addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[],insertAdjacentHTML(){},click(){},focus(){},setSelectionRange(){}});
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
const app=new Function(src+`;return {DB:()=>DB,go,mQuery,mSet,mComp,mClubs,mClub,mPar,mApply,mFix,
  clubOptions,crsBodyHtml,SC,coursePar, get CRS(){return CRS}};`)();
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};
app.go('meta');

console.log('=== 1. 施設をまたいでも9Hの選択が壊れない ===');
app.mQuery('可児');
app.mSet('club','富士カントリー可児クラブ 可児ゴルフ場');
chk('54Hの施設を選択', app.mClub().n.length===6, app.mClub().n.length+'コース');
app.mSet('a',4); app.mSet('b',5);
chk('5本目・6本目を選べる', app.CRS.a===4&&app.CRS.b===5, app.mPar().a[0]+' → '+app.mPar().b[0]);
app.mQuery('信濃');
chk('2コースの施設に切替', app.mClub().n.length===2, app.mClub().c);
chk('9Hの番号が0・1に戻る', app.CRS.a===0&&app.CRS.b===1, 'a='+app.CRS.a+' b='+app.CRS.b);
chk('要約が正しく出る', app.mPar()&&app.mPar().par.reduce((a,b)=>a+b,0)===72,
    app.mPar()?app.mPar().a[0]+'→'+app.mPar().b[0]+' パー'+app.mPar().par.reduce((a,b)=>a+b,0):'なし');

console.log('\n=== 2. 絞り込みから外れても選択が消えない ===');
app.mQuery('信濃');
chk('信濃を選択中', app.CRS.club==='信濃ゴルフ倶楽部');
app.mQuery('三好');
chk('検索を変えても選択は保持', app.CRS.club==='信濃ゴルフ倶楽部'||app.CRS.club==='三好カントリー倶楽部',
    app.CRS.club);
app.mQuery('該当しない語句');
chk('0件でも選択は残る', !!app.mClub(), app.CRS.club);
chk('候補に選択中のものが出る', store['crsClub'].innerHTML.includes(app.CRS.club)
    &&store['crsClub'].innerHTML.includes('ここから検索結果'));
chk('要約も出たまま', !!app.mPar());

console.log('\n=== 3. 1件に絞れたら自動選択 ===');
app.mQuery(''); app.CRS.club=''; app.mQuery('恵那峡');
chk('恵那峡を自動選択', app.CRS.club==='恵那峡カントリークラブ', app.CRS.club);
chk('3コースを認識', app.mClub().n.length===3);
chk('9Hは松→竹', app.mPar().a[0]==='松'&&app.mPar().b[0]==='竹', app.mPar().a[0]+'→'+app.mPar().b[0]);

console.log('\n=== 4. 日本語変換の再現（額田の不具合）===');
app.mSet('pref','愛知県'); app.CRS.club=''; app.mQuery('');
chk('愛知県は53件', app.mClubs().length===53, app.mClubs().length+'件');
/* かな入力→変換→Enterで確定 の一連 */
app.mComp(true);                                  // compositionstart
['か','く','た','かくた','額田'].forEach(t=>app.mQuery(t,{isComposing:true}));
chk('変換中は絞り込まない', app.mClubs().length===53&&app.CRS.club==='',
    app.mClubs().length+'件 / 選択「'+app.CRS.club+'」');
app.mQuery('額田',{keyCode:229});                  // IME確定キーのkeydown由来
chk('確定キーでも動かさない', app.mClubs().length===53);
app.mComp(false,'額田');                           // compositionend
chk('確定したら1件に絞れる', app.mClubs().length===1, app.mClubs().map(c=>c.c).join(''));
chk('額田ゴルフ倶楽部が選ばれる', app.CRS.club==='額田ゴルフ倶楽部', app.CRS.club);
chk('先頭の愛知カンツリーにならない', app.CRS.club!=='愛知カンツリー倶楽部');
chk('検索語も保持される', app.CRS.q==='額田', '「'+app.CRS.q+'」');
chk('パーが出る', !!app.mPar(), app.mPar()?'パー'+app.mPar().par.reduce((a,b)=>a+b,0):'なし');
/* 直接入力（変換なし）でも効く */
app.CRS.club=''; app.mQuery('');
app.mQuery('OGC',{isComposing:false});
chk('変換を使わない入力はその場で効く', app.mClubs().length>=0&&app.CRS.q==='OGC');

console.log('\n=== 5. 都道府県を変えたとき ===');
app.mQuery(''); app.mSet('pref','長野県'); app.mQuery('信濃');
chk('長野県で信濃', app.CRS.club==='信濃ゴルフ倶楽部'&&app.mClub().p==='長野県');
app.mSet('pref','愛知県');
chk('県外になったら選択を外す', app.CRS.club===''||app.mClub().p==='愛知県', app.CRS.club||'（未選択）');
chk('9Hも初期化', app.CRS.a===0&&app.CRS.b===1);

console.log('\n=== 6. 反映と表示 ===');
app.mSet('pref',''); app.mQuery('信濃');
app.mApply();
chk('パーが入る', app.coursePar()===72, 'パー'+app.coursePar());
chk('一致の印が出る', app.crsBodyHtml().includes('今この配分になっています'));
app.mSet('a',1); app.mSet('b',0);
chk('IN→OUTにも変えられる', app.mPar().a[0]==='IN'&&app.mPar().b[0]==='OUT', app.mPar().a[0]+'→'+app.mPar().b[0]);
chk('入替で印が消える', !app.crsBodyHtml().includes('今この配分になっています'));

console.log('\n=== 7. 選び直す ===');
app.CRS.club=''; app.CRS.a=0; app.CRS.b=1;
chk('未選択に戻せる', !app.mClub()&&!app.mPar());
/* 2026-09-08に全国へ広げたのに、案内文が中部5県（379施設）のままだった。段階3で直した */
chk('案内文が出る（全国の収録数）', app.crsBodyHtml().includes('2,254施設・5,122コース')&&!app.crsBodyHtml().includes('379施設'));

console.log('\n=== 8. 壊れた状態からの復帰 ===');
app.CRS.club='信濃ゴルフ倶楽部'; app.CRS.a=99; app.CRS.b=-3;
app.mFix();
chk('範囲外の番号を直す', app.CRS.a===0&&app.CRS.b===1, 'a='+app.CRS.a+' b='+app.CRS.b);
chk('要約も出る', !!app.mPar());
app.CRS.club='存在しない';
chk('存在しない施設でも落ちない', app.mPar()===null&&app.crsBodyHtml().length>0);
console.log('\n合計 NG: '+ng);
