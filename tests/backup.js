/* 2026-09-21追加：3つの改修の再現テスト。
   1) 実データがあるまま読み込む・新規作成する・全部消すとき、無確認で失われていた → 確認を挟む
   2) 自動保存（LSKEY）は「直近1件」のみだった → 世代の控え（最大3件）を別に持つ
   3) CSV出力（精算一覧）が未エスケープで、カンマ等を含む値だと列がずれた → csvCell()で対処
   アプリの場所。テストと同じ場所の site/ を先に見て、無ければ ../docs/ を使う。
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
const _t=[];global.setTimeout=f=>{_t.push(f);return _t.length};global.flush=()=>_t.splice(0).forEach(f=>{try{f()}catch(e){}});
global.setInterval=()=>1;global.clearInterval=()=>{};global.clearTimeout=()=>{};
global.performance={now:()=>0};global.requestAnimationFrame=()=>{};
global.alert=()=>{};global.confirm=()=>true;
let LASTBLOB=null;
global.URL={createObjectURL:()=>'blob:',revokeObjectURL(){}};
global.Blob=class{constructor(a){this.a=a;LASTBLOB=a[0];}};
/* 実際に値が残る、機能するlocalStorageモック（世代の保存・読み出しを検証するために必須） */
const LSD={};
global.localStorage={
  _fail:false,
  setItem(k,v){ if(this._fail) throw 0; LSD[k]=String(v); },
  getItem(k){ if(this._fail) throw 0; return (k in LSD)?LSD[k]:null; },
  removeItem(k){ delete LSD[k]; }
};
global.FileReader=class{ readAsText(f){ this.result=f._text; this.onload(); } };
['show','hud','dots','tabs','saveState','hdTitle','pane','sndBtn','jsonFile']
  .forEach(id=>{global[id]=doc.getElementById(id)});
const app=new Function(src+`;return {DB:()=>DB,setDB:d=>{DB=d},blank,migrate,go,render,touch,
  hasRealData,loadGens,pushGen,maybeAutoGen,restoreGen,clearGens,
  upJson,newCompe,wipe,copyPrev,csvCell,dlCsv,
  get dirty(){return dirty}};`)();
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x!==''&&x!==undefined?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};

const named=(n,extra)=>Object.assign({n,org:'',bd:'',g:0,f:0,vote:true,fee:true,feeAmt:''},extra||{});

console.log('=== 1. hasRealData() ===');
{
  const D=app.blank(); app.setDB(D);
  chk('白紙のときは false', app.hasRealData()===false);
  D.players.push(named('甲　一郎'));
  chk('氏名入り参加者が1人でもいれば true', app.hasRealData()===true);
  const D2=app.blank(); D2.keiba.push({v:'甲',a:1,b:2,q:1}); app.setDB(D2);
  chk('馬券の口が1件あれば true（参加者ゼロでも）', app.hasRealData()===true);
  const D3=app.blank(); D3.gto.push({v:'甲',p:['甲','乙','丙'],q:1}); app.setDB(D3);
  chk('GTOの口が1件あれば true（参加者ゼロでも）', app.hasRealData()===true);
}

console.log('\n=== 2. 世代の控え（最大3件・新しい順） ===');
{
  LSD['golfCompe.autosave.gens.v1']=undefined; delete LSD['golfCompe.autosave.gens.v1'];
  const D=app.blank(); D.players.push(named('甲　一郎')); app.setDB(D);
  chk('控えが無ければ空配列', app.loadGens().length===0);
  D.meta.name='第1回'; app.pushGen();
  D.meta.name='第2回'; app.pushGen();
  D.meta.name='第3回'; app.pushGen();
  chk('3件までは全部残る', app.loadGens().length===3, app.loadGens().length);
  chk('新しい順に並ぶ', app.loadGens()[0].db.meta.name==='第3回'&&app.loadGens()[2].db.meta.name==='第1回',
      app.loadGens().map(g=>g.db.meta.name).join(','));
  D.meta.name='第4回'; app.pushGen();
  chk('4件目を積むと一番古いものが落ちる（最大3件）', app.loadGens().length===3&&app.loadGens()[0].db.meta.name==='第4回'
      &&!app.loadGens().some(g=>g.db.meta.name==='第1回'), app.loadGens().map(g=>g.db.meta.name).join(','));

  const D4=app.blank(); app.setDB(D4);
  const before=app.loadGens().length;
  app.pushGen();
  chk('実データが無いときは積まない（空の大会を誤って控えで埋めない）', app.loadGens().length===before);
}

console.log('\n=== 3. 5分ごとの自動控え（maybeAutoGen） ===');
{
  LSD['golfCompe.autosave.gens.v1']=undefined; delete LSD['golfCompe.autosave.gens.v1'];
  const D=app.blank(); D.players.push(named('甲　一郎')); app.setDB(D);
  const realNow=Date.now;
  let t=1758000000000;
  Date.now=()=>t;
  app.pushGen();
  chk('直後は積まない', app.loadGens().length===1);
  app.maybeAutoGen();
  chk('5分未満ならmaybeAutoGenは積まない', app.loadGens().length===1);
  t+=299000; app.maybeAutoGen();
  chk('5分ぎりぎり手前でも積まない', app.loadGens().length===1);
  t+=2000; app.maybeAutoGen();
  chk('5分を超えたら積む', app.loadGens().length===2, app.loadGens().length);
  Date.now=realNow;
}

console.log('\n=== 4. 復元（restoreGen）・控えの削除（clearGens） ===');
{
  LSD['golfCompe.autosave.gens.v1']=undefined; delete LSD['golfCompe.autosave.gens.v1'];
  const D=app.blank(); D.players.push(named('甲　一郎')); app.setDB(D);
  D.meta.name='復元用の控え'; app.pushGen();
  const D2=app.blank(); D2.players.push(named('乙　二郎')); app.setDB(D2);

  const cf=global.confirm; global.confirm=()=>false;
  app.restoreGen(0);
  chk('確認でキャンセルすると今の内容のまま', app.DB().meta.name!=='復元用の控え'&&app.DB().players[0].n==='乙　二郎');
  global.confirm=cf;

  app.restoreGen(0);
  chk('確認を通すと控えの内容に戻る', app.DB().meta.name==='復元用の控え'&&app.DB().players[0].n==='甲　一郎',
      ()=>app.DB().meta.name);
  chk('復元後はdirtyがfalse', app.dirty===false);

  chk('存在しない番号を指定しても落ちない', (()=>{try{app.restoreGen(9);return true;}catch(e){return false;}})());

  global.confirm=()=>false; app.clearGens();
  chk('確認でキャンセルすると控えは残る', app.loadGens().length>0);
  global.confirm=()=>true; app.clearGens();
  chk('確認を通すと控えを消せる', app.loadGens().length===0);
  global.confirm=cf;
}

console.log('\n=== 5. 読み込み（upJson）時の未保存上書き確認 ===');
{
  LSD['golfCompe.autosave.gens.v1']=undefined; delete LSD['golfCompe.autosave.gens.v1'];
  const cur=app.blank(); cur.meta.name='いまの大会（未保存の変更あり）';
  cur.players.push(named('丙　三郎')); app.setDB(cur);

  const fileDB=app.blank(); fileDB.meta.name='読み込むファイル'; fileDB.players.push(named('丁　四郎'));
  const json=JSON.stringify(fileDB);

  let calledConfirm=0;
  const cf=global.confirm; global.confirm=()=>{calledConfirm++;return false;};
  app.upJson({name:'読み込み.json',_text:json});
  chk('確認でキャンセルすると読み込まれない', app.DB().meta.name==='いまの大会（未保存の変更あり）');
  chk('実データがあるときは確認を呼ぶ', calledConfirm===1);
  chk('キャンセル時は控えも積まない', app.loadGens().length===0);
  global.confirm=cf;

  global.confirm=()=>true;
  app.upJson({name:'読み込み.json',_text:json});
  chk('確認を通すと読み込まれる', app.DB().meta.name==='読み込むファイル');
  chk('読み込む前の内容が控えに残る', app.loadGens().length===1&&app.loadGens()[0].db.meta.name==='いまの大会（未保存の変更あり）',
      ()=>JSON.stringify(app.loadGens().map(g=>g.db.meta.name)));
  global.confirm=cf;

  console.log('  -- 白紙の状態から読み込むときは、これまで通り無確認 --');
  const blankStart=app.blank(); app.setDB(blankStart);
  let calledConfirm2=0;
  const cf2=global.confirm; global.confirm=()=>{calledConfirm2++;return true;};
  app.upJson({name:'読み込み.json',_text:json});
  chk('参加者がいない状態では確認を呼ばない（従来どおり）', calledConfirm2===0);
  chk('それでも中身は読み込まれる', app.DB().meta.name==='読み込むファイル');
  global.confirm=cf2;

  console.log('  -- 壊れたファイルは、確認より前に「読み込めません」で止まる --');
  const cur2=app.blank(); cur2.players.push(named('戊　五郎')); app.setDB(cur2);
  let calledConfirm3=0;
  const cf3=global.confirm; global.confirm=()=>{calledConfirm3++;return true;};
  app.upJson({name:'壊れ.json',_text:'これはJSONではない'});
  chk('壊れたファイルでは確認を呼ばない', calledConfirm3===0);
  chk('壊れたファイルでは今の内容が保たれる', app.DB().players[0].n==='戊　五郎');
  global.confirm=cf3;
}

console.log('\n=== 6. 新規作成・全消去でも同じ確認と控え ===');
{
  LSD['golfCompe.autosave.gens.v1']=undefined; delete LSD['golfCompe.autosave.gens.v1'];
  const D=app.blank(); D.meta.name='消される大会'; D.players.push(named('己　六郎')); app.setDB(D);
  const cf=global.confirm; global.confirm=()=>false;
  app.newCompe();
  chk('新規作成：確認でキャンセルすると今のまま', app.DB().meta.name==='消される大会');
  global.confirm=()=>true;
  app.newCompe();
  chk('新規作成：確認を通すと白紙になる', app.DB().players.length===0);
  chk('新規作成：白紙にする前の内容が控えに残る', app.loadGens().length===1&&app.loadGens()[0].db.meta.name==='消される大会');
  global.confirm=cf;

  LSD['golfCompe.autosave.gens.v1']=undefined; delete LSD['golfCompe.autosave.gens.v1'];
  const D2=app.blank(); D2.meta.name='全消去される大会'; D2.players.push(named('庚　七郎')); app.setDB(D2);
  global.confirm=()=>true;
  app.wipe();
  chk('全消去：白紙になる', app.DB().players.length===0);
  chk('全消去：消す前の内容が控えに残る', app.loadGens().length===1&&app.loadGens()[0].db.meta.name==='全消去される大会');
  global.confirm=cf;
}

console.log('\n=== 7. CSV出力のエスケープ（csvCell / dlCsv） ===');
{
  chk('通常の値はそのまま', app.csvCell('山田太郎')==='山田太郎');
  chk('カンマを含む値は引用符で囲む', app.csvCell('山田,太郎')==='"山田,太郎"');
  chk('引用符を含む値は二重にして囲む', app.csvCell('山田"太郎')==='"山田""太郎"');
  chk('改行を含む値は引用符で囲む', app.csvCell('山田\n太郎')==='"山田\n太郎"');
  chk('nullは空文字', app.csvCell(null)==='');
  chk('undefinedは空文字', app.csvCell(undefined)==='');
  chk('数値はそのまま文字列化', app.csvCell(12500)==='12500');

  const D=app.blank();
  D.meta.use.keiba=false; D.meta.use.gto=false; D.meta.use.fine=false;
  D.players.push(named('山田,太郎',{g:1,f:1}));
  app.setDB(D); app.dlCsv();
  const lines=String(LASTBLOB).split('\r\n');
  chk('カンマ入りの氏名が引用符で囲まれて出力される', lines.some(l=>l.includes('"山田,太郎"')), lines[1]);
  chk('データ行はカンマで壊れず、引用符の中に1列としてそのまま入る',
      lines[1]==='"山田,太郎",1,1,0,0,0,0,0,0', lines[1]);
}

console.log('\n=== 結果 ===');
console.log(ng===0?'ALL OK':(ng+' NG'));
process.exitCode=ng?1:0;
