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
const app=new Function(src+`;return {DB:()=>DB,go,MASTER,mPrefs,mClubs,mClub,mSet,mPar,mApply,mRegister,mQuery,
  SC,coursePar,outSum,inSum,hcOf,scoreOf,SCset,sample,standings,clubOptions,
  get CRS(){return CRS}};`)();
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};

console.log('=== 1. 収録内容（全国版・2026-09-08）===');
chk('2,254施設', app.MASTER.length===2254, app.MASTER.length+'施設');
const total=app.MASTER.reduce((a,c)=>a+c.n.length,0);
chk('5,122コース（9H単位）', total===5122, total);
chk('47都道府県そろっている', app.mPrefs().length===47, app.mPrefs().length+'県');
chk('都道府県の並びが北から南', app.mPrefs()[0]==='北海道'&&app.mPrefs()[46]==='沖縄県',
    app.mPrefs()[0]+' … '+app.mPrefs()[46]);
let bad=[],odd=[],p67=[];
app.MASTER.forEach(c=>c.n.forEach(n=>{
  if(n[1].length!==9) bad.push(c.c+' '+n[0]+' ホール数'+n[1].length);
  if(!n[1].every(p=>p>=3&&p<=7)) bad.push(c.c+' '+n[0]+' パーが3〜7外');
  if(n[1].some(p=>p>=6)) p67.push(c.c+' '+n[0]);
  const s=n[1].reduce((a,b)=>a+b,0);
  if(s<33||s>38) odd.push(c.c+' '+n[0]+'('+s+')');
}));
chk('全5,122コースが9ホール・パー3〜7', bad.length===0, bad.slice(0,3).join(' / '));
/* パー6・パー7は出典どおり。トリプルパーカットの上限が変わるので所在を控えておく */
chk('パー6以上のホールがあるのは6コース', p67.length===6, p67.join(' / '));
console.log('  パー計が33〜38外（ショートコース等）:',odd.length+'件',odd.slice(0,3).join(' / '));
chk('施設名の重複なし', new Set(app.MASTER.map(x=>x.c)).size===2254,
    'ユニーク '+new Set(app.MASTER.map(x=>x.c)).size);
chk('検索キー（施設名｜コース名）が全件で一意',
    new Set(app.MASTER.flatMap(c=>c.n.map(n=>c.c+'|'+n[0]))).size===5122,
    new Set(app.MASTER.flatMap(c=>c.n.map(n=>c.c+'|'+n[0]))).size+'件');
chk('閉鎖の施設に印がある', app.MASTER.filter(x=>x.x).length===235,
    app.MASTER.filter(x=>x.x).length+'施設');

console.log('\n=== 1.5 圧縮して持ち、展開して使う ===');
/* パーを9桁の文字列に、都道府県を番号にして持ち、読み込み時に一度だけ展開する。
   同じ内容が 229KB → 128KB に収まり、単一ファイルのまま全国を積める */
chk('圧縮形（MSTZ）で持っている', /const MSTZ=\[/.test(src));
chk('展開して MASTER を作っている', /const MASTER=MSTZ\.map/.test(src));
chk('都道府県は番号で持つ', /const MPREF=\["北海道"/.test(src));
{
  /* 大きさは「文字数」ではなく「バイト数」で見る。日本語は1文字3バイトなので、
     文字数で測ると実物の1/3に見えてしまう（2026-09-08、いったんそう測って
     294KBと誤って報告した）。USBに入れる・読み込む速さに効くのはバイト数のほう */
  const z=(src.match(/const MSTZ=(\[[\s\S]*?\]);\n/)||[])[1];
  const B=t=>Buffer.byteLength(t,'utf8');
  chk('圧縮形（MSTZ）が 210KB 未満', !!z&&B(z)<215040, z?(B(z)/1024).toFixed(0)+'KB':'—');
  const all=fs.readFileSync(APP.pc);
  /* 上限は「単一ファイルで持ち運べるか」の目安。機能が増えれば少しずつ育つ。
     マスタ部（200KB）が全体の半分近くを占めるので、そこが膨らまない限り問題ない */
  /* 460KB → 480KB（2026-09-16）。3段階のタブと「次にやること」で約12KB増えた。
     480KB → 600KB（2026-09-17）。デザイン案の段階2〜8で約80〜100KB増える見込みのため、
     着手前に上限を決めた（HANDOVER 4.9）。USBでの持ち運びや読み込みに影響しない大きさ
     600KB → 700KB（2026-09-17、v48）。段階2〜4で約80KB増え、v48で556KB。段階5〜8で超える見込みのため
     上限を上げると決めた（HANDOVER 4.12）。単一ファイル・オフライン・USBで持ち運ぶ設計には影響しない。
     軽くする整理（重複したCSSなど）は、見た目の照合に1回ぶんの作業がかかるので見送った */
  chk('pc.html 全体が 700KB 未満', all.length<700*1024, (all.length/1024).toFixed(0)+'KB');
  chk('圧縮しない場合より小さい（37%削減）', B(z)<317*1024,
      (B(z)/1024).toFixed(0)+'KB（非圧縮なら317KB）');
}
chk('展開後のパーがすべて数値', app.MASTER.every(c=>c.n.every(n=>n[1].every(p=>typeof p==='number'))));

console.log('\n=== 2. 信濃ゴルフ倶楽部（長野県・9H×2）===');
app.mSet('pref','長野県'); app.mSet('club','信濃ゴルフ倶楽部');
const r=app.mPar();
chk('OUT→INで18ホール', r.par.length===18);
chk('パー72', r.par.reduce((a,b)=>a+b,0)===72, r.par.reduce((a,b)=>a+b,0));
chk('OUT36 IN36', r.par.slice(0,9).reduce((a,b)=>a+b,0)===36&&r.par.slice(9).reduce((a,b)=>a+b,0)===36);
chk('OUT/IN 2コース', app.mClub().n.length===2, app.mClub().n.map(x=>x[0]).join('/'));
console.log('  パー配分:', r.par.join(' '));
app.mApply();
chk('アプリに反映', app.coursePar()===72&&JSON.stringify(app.SC().par)===JSON.stringify(r.par));
chk('会場名も入る', app.DB().meta.place==='信濃ゴルフ倶楽部', app.DB().meta.place);

console.log('\n=== 2.5 名前で探す ===');
app.mSet('pref',''); app.mQuery('信濃');
chk('「信濃」で絞れる', app.mClubs().length>=1&&app.mClubs().every(c=>c.c.includes('信濃')),
    app.mClubs().map(c=>c.c).join(' / '));
app.mQuery('カントリー');
chk('部分一致で複数ヒット', app.mClubs().length>20, app.mClubs().length+'件');
app.mSet('pref','三重県');
chk('都道府県と併用できる', app.mClubs().every(c=>c.p==='三重県'&&c.c.includes('カントリー')),
    app.mClubs().length+'件');
app.mQuery('存在しないゴルフ場');
chk('該当なしでも落ちない', app.mClubs().length===0);
app.mQuery(''); app.mSet('pref','');

console.log('\n=== 3. パー74の変則コース ===');
app.mSet('pref','愛知県'); app.mSet('club','愛知カンツリー倶楽部');
const r2=app.mPar();
chk('OUT37+IN37=74', r2.par.reduce((a,b)=>a+b,0)===74, r2.par.reduce((a,b)=>a+b,0));
const p6=app.MASTER.filter(c=>c.n.some(n=>n[1].some(p=>p>=6)));
console.log('  パー6を含む施設:',p6.map(c=>c.c).join(' / ')||'なし');

console.log('\n=== 4. 27H・36H・54Hの組合せ ===');
app.mSet('club','三好カントリー倶楽部');
chk('4つの9Hから選べる', app.mClub().n.length===4, app.mClub().n.map(x=>x[0]).join('/'));
app.mSet('a',2); app.mSet('b',1);   // 東OUT → 西IN
const r3=app.mPar();
chk('東OUT→西IN の組合せ', r3.a[0].includes('東')&&r3.a[0].includes('OUT')&&r3.b[0].includes('西')&&r3.b[0].includes('IN'), r3.a[0]+' → '+r3.b[0]);
chk('合計72', r3.par.reduce((a,b)=>a+b,0)===72);
app.mSet('pref','岐阜県'); app.mSet('club','富士カントリー可児クラブ 可児ゴルフ場');
chk('可児GCは6つの9H', app.mClub().n.length===6, app.mClub().n.map(x=>x[0]).join('/'));
app.mSet('club','恵那峡カントリークラブ');
chk('恵那峡は3つの9H', app.mClub().n.length===3, app.mClub().n.map(x=>x[0]).join('/'));
app.mSet('a',0); app.mSet('b',2);
chk('松→梅も選べる', app.mPar().a[0]==='松'&&app.mPar().b[0]==='梅');

console.log('\n=== 5. 登録もできる ===');
app.mSet('pref','長野県'); app.mSet('club','信濃ゴルフ倶楽部'); app.mSet('a',0); app.mSet('b',1);
A=[]; app.mRegister();
chk('登録名に9Hの組合せが入る', app.DB().courses[0].name==='信濃ゴルフ倶楽部（OUT→IN）', app.DB().courses[0].name);
chk('パーも保存', app.DB().courses[0].par.reduce((a,b)=>a+b,0)===72);

console.log('\n=== 6. 実際の集計に効く ===');
app.sample(); global.flush();
app.SCset('entry','hidden');
app.mSet('pref','長野県'); app.mSet('club','信濃ゴルフ倶楽部'); app.mApply();
const p0=app.DB().players[0], st=app.standings();
chk('信濃のパーでHDCPが出る', app.hcOf(p0)!==null, 'HDCP '+app.hcOf(p0)+'（コースパー'+app.coursePar()+'）');
chk('順位も出る', st.net.length===16);

console.log('\n=== 7. 画面 ===');
app.go('meta');
const H=store['pane'].innerHTML;
chk('都道府県の選択がある', H.includes("mSet('pref'"));
chk('前半・後半の選択がある', H.includes("mSet('a'")&&H.includes("mSet('b'"));
chk('選択結果の要約が出る', H.includes('信濃ゴルフ倶楽部')&&H.includes('パー72'));
chk('検索欄がある', H.includes('id="crsQ"'));
chk('件数の表示欄がある', H.includes('id="crsCnt"'));
chk('「このコースにする」がある', H.includes('mApply()'));
chk('一致していれば印が出る', H.includes('今この配分になっています'));
console.log('\n=== 8. 全国に広げても実用に耐えるか ===');
/* 379施設 → 2,254施設。6倍のデータで検索と絞り込みが実用的な速さかを見る。
   当日はパソコンでも古い端末が来ることがあるので、余裕を持って測る */
/* 実際の操作の経路で測る。検索欄への1文字は mQuery が受ける */
app.go('meta');
const per=(f,n)=>{const t=Date.now();for(let i=0;i<n;i++)f();return (Date.now()-t)/n;};
const t1=per(()=>app.mQuery('カ'),20);
chk('検索欄に1文字打つのが5ms未満', t1<5, t1.toFixed(1)+'ms/回');
const t2=per(()=>app.mQuery('カントリー'),20);
chk('絞り込みが進んでも速い', t2<5, t2.toFixed(1)+'ms/回');
const t3=per(()=>app.mSet('pref','北海道'),20);
chk('都道府県を選ぶのも速い', t3<5, t3.toFixed(1)+'ms/回');
app.mQuery(''); app.mSet('pref','');
/* 1文字打つたびに2,254件を正規化し直すと8ms以上かかっていた。
   展開時に一度だけ作っておくことで12倍速くなった（2026-09-08） */
chk('検索用の名前を展開時に作っている', /o\.k=key\(r\[1\]\)/.test(src));
chk('絞り込みでそれを使っている', /x\.k\.includes\(q\)/.test(src));
chk('選択肢は上限を掛けてある（2,254件を一度に描かない）',
    /list=\(list\|\|mClubs\(\)\)\.slice\(0,500\)/.test(src));
chk('絞り込まなくても選択肢は500件まで',
    (app.clubOptions().match(/<option/g)||[]).length<=501,
    (app.clubOptions().match(/<option/g)||[]).length+'件');

console.log('  -- 各県が1件以上ある --');
const empty=app.mPrefs().filter(p=>{app.mSet('pref',p);return app.mClubs().length===0;});
app.mSet('pref','');
chk('47県すべてに施設がある', empty.length===0, empty.join('、')||'');
console.log('  -- 収録の多い県 --');
const cnt=app.mPrefs().map(p=>[p,app.MASTER.filter(x=>x.p===p).reduce((a,c)=>a+c.n.length,0)])
  .sort((a,b)=>b[1]-a[1]);
console.log('   ',cnt.slice(0,5).map(x=>x[0]+' '+x[1]).join(' / '));
chk('北海道が最多', cnt[0][0]==='北海道'&&cnt[0][1]===392, cnt[0].join(' '));

console.log('\n=== 9. パー6・パー7のコースでも計算が成り立つ ===');
/* トリプルパーカットの上限は パー×3。パー6なら18、パー7なら21。
   出典どおりの変則コースでも、計算が破綻しないことを確かめる */
const P6C=app.MASTER.find(c=>c.n.some(n=>n[1].includes(6)));
app.mSet('pref',P6C.p); app.mSet('club',P6C.c);
const I6=P6C.n.findIndex(n=>n[1].includes(6));
app.mSet('a',I6); app.mSet('b',I6===0?1:0);
app.mApply();
chk('パー6を含むコースを選べる', app.SC().par.includes(6), P6C.c);
chk('コースパーが計算できる', app.coursePar()>0, 'パー'+app.coursePar());
{
  const D=app.DB();
  D.players.length=0;
  D.players.push({n:'甲',org:'',bd:'1970-01-01',g:1,f:1,vote:true,fee:true,feeAmt:''});
  app.SCset('system','double'); app.SCset('hcUse',true); app.SCset('hcMax',30);
  app.SCset('cut','triplePar'); app.SCset('entry','all');
  const sc=app.scoreOf('甲');
  app.SC().par.forEach((_,k)=>sc.h[k+1]=20);          /* 全ホール20打 */
  const hc=app.hcOf(app.DB().players[0]);
  chk('全ホール20打でもHDCPが出る', typeof hc==='number'&&hc>=0, 'HDCP '+hc);
  chk('上限30で頭打ちになる', hc===30, hc);
}
app.mSet('pref',''); app.mSet('q','');

console.log('\n合計 NG: '+ng);
