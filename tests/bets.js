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
['show','hud','dots','tabs','saveState','hdTitle','pane','sndBtn','kp','kpv','gp','gpv']
 .forEach(id=>{global[id]=doc.getElementById(id)});
const app=new Function(src+`;return {DB:()=>DB,blank,sample,go,parseKeiba,parseGto,kPaste,kPasteApply,
  gPaste,gPasteApply,calcK,calcG,RUN,VOT,FRAMES,fPair2,go,sample,betsTab:typeof betsTab==='function'?betsTab:()=>{}};`)();
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};

app.sample(); global.flush();
/* サンプル①は予想を締め切った状態（段階6）。取り込みを確かめるので解除しておく */
app.DB().meta.betsClosed=false;
app.DB().keiba=[]; app.DB().gto=[];
const N=app.DB().players.map(p=>p.n);

console.log('=== 1. 馬券：いろいろな書き方 ===');
[['タブ＋ハイフン', `${N[0]}\t1-3\t2`, {v:N[0],a:1,b:3,q:2}],
 ['カンマで枠を分ける', `${N[1]},2,4,1`, {v:N[1],a:2,b:4,q:1}],
 ['口数を省略', `${N[2]}  4-4`, {v:N[2],a:4,b:4,q:1}],
 ['逆順は並べ替え', `${N[3]}\t4-1\t3`, {v:N[3],a:1,b:4,q:3}],
 ['行番号つき', `5\t${N[4]}\t2-3\t2`, {v:N[4],a:2,b:3,q:2}],
 ['全角ハイフン', `${N[5]}　1−2　4`, {v:N[5],a:1,b:2,q:4}],
].forEach(([label,line,e])=>{
  const r=app.parseKeiba(line)[0];
  chk(label, r.ok&&r.voter===e.v&&r.a===e.a&&r.b===e.b&&r.q===e.q,
      `${r.voter} ${r.a}-${r.b} ×${r.q}${r.ok?"":" ["+r.why+"]"}`);
});
const bad1=app.parseKeiba('だれか 1-2 1')[0];
chk('名簿外は×', !bad1.ok, bad1.why);
const bad2=app.parseKeiba(`${N[0]} 9-9 1`)[0];
chk('枠番が範囲外は×', !bad2.ok, bad2.why);

console.log('\n=== 2. 馬券：一括取り込みと口数のまとめ ===');
store['kp'].value=[`${N[0]}\t1-3\t2`,`${N[0]}\t3-1\t3`,`${N[1]}\t2-4\t1`].join('\n');
app.kPaste();
chk('3行を読み取る', store['kpv'].innerHTML.includes('3行・6口'), (store['kpv'].innerHTML.match(/\d+行・\d+口/)||[''])[0]);
A=[]; app.kPasteApply();
chk('取り込みメッセージ', A[0].includes('6口を取り込みました'), A[0]);
chk('同じ買い目が1行にまとまる', app.DB().keiba.length===2, app.DB().keiba.length+'行');
chk('口数が2+3=5', app.DB().keiba.find(r=>r.v===N[0]).q===5);
chk('合計6口', app.calcK().units===6, app.calcK().units);
store['kp'].value=`${N[0]}\t1-3\t1`;
app.kPaste(); A=[]; app.kPasteApply();
chk('既存にも足せる', app.DB().keiba.find(r=>r.v===N[0]).q===6, A[0]);

console.log('\n=== 3. GTO：読み取り ===');
app.DB().gto=[];
[['タブ区切り', `${N[0]}\t${N[8]}\t${N[3]}\t${N[12]}\t2`, {v:N[0],p:[N[8],N[3],N[12]],q:2}],
 ['カンマ区切り', `${N[1]},${N[3]},${N[12]},${N[15]},1`, {v:N[1],p:[N[3],N[12],N[15]],q:1}],
 ['口数を省略', `${N[2]}  ${N[5]}  ${N[6]}  ${N[7]}`, {v:N[2],p:[N[5],N[6],N[7]],q:1}],
 ['行番号つき', `3\t${N[4]}\t${N[9]}\t${N[10]}\t${N[11]}\t2`, {v:N[4],p:[N[9],N[10],N[11]],q:2}],
].forEach(([label,line,e])=>{
  const r=app.parseGto(line)[0];
  chk(label, r.ok&&r.voter===e.v&&r.picks.join()===e.p.join()&&r.q===e.q,
      `${r.voter} → ${r.picks.join(' / ')} ×${r.q}${r.ok?"":" ["+r.why+"]"}`);
});
const g1=app.parseGto(`${N[0]}\t${N[3]}\t${N[3]}\t${N[5]}\t1`)[0];
chk('重複指名は×', !g1.ok, g1.why);
const g2=app.parseGto(`${N[0]}\t${N[3]}\t${N[5]}\t1`)[0];
chk('3名そろわないと×', !g2.ok, g2.why);

console.log('\n=== 4. GTO：順番が保たれる ===');
store['gp'].value=`${N[0]}\t${N[8]}\t${N[3]}\t${N[12]}\t2`;
app.gPaste(); A=[]; app.gPasteApply();
const row=app.DB().gto[0];
chk('指名の順番どおり', row.p[0]===N[8]&&row.p[1]===N[3]&&row.p[2]===N[12], row.p.join(' → '));
chk('2口', row.q===2);
store['gp'].value=`${N[0]}\t${N[3]}\t${N[8]}\t${N[12]}\t1`;
app.gPaste(); app.gPasteApply();
chk('順番が違えば別の行', app.DB().gto.length===2, app.DB().gto.length+'行');
store['gp'].value=`${N[0]}\t${N[8]}\t${N[3]}\t${N[12]}\t3`;
app.gPaste(); A=[]; app.gPasteApply();
chk('同じ順番はまとめる', app.DB().gto.length===2&&app.DB().gto[0].q===5, A[0]);
chk('合計6口', app.calcG().units===6, app.calcG().units);

console.log('\n=== 5. 16名分の一括投入 ===');
app.DB().keiba=[]; app.DB().gto=[];
store['kp'].value=N.map((n,i)=>`${i+1}\t${n}\t${1+i%4}-${1+(i*3)%4}\t5`).join('\n');
app.kPaste(); A=[]; app.kPasteApply();
chk('馬券80口', app.calcK().units===80, app.calcK().units+'口 / '+app.DB().keiba.length+'行');
store['gp'].value=N.map((n,i)=>`${n}\t${N[(i+1)%16]}\t${N[(i+5)%16]}\t${N[(i+9)%16]}\t2`).join('\n');
app.gPaste(); A=[]; app.gPasteApply();
chk('GTO32口', app.calcG().units===32, app.calcG().units+'口 / '+app.DB().gto.length+'行');
chk('回収額 16,000+16,000', app.calcK().sales+app.calcG().sales===32000, app.calcK().sales+app.calcG().sales);

console.log('\n=== 6. 画面 ===');
/* 段階6で馬券とGTOを画面の中で切り替えるようにした。それぞれの画面で確かめる */
app.betsTab('k'); app.go('bets');
const H=store['pane'].innerHTML;
chk('馬券の貼り付け欄', H.includes('id="kp"'));
app.betsTab('g');
const H2=store['pane'].innerHTML;
chk('GTOの貼り付け欄', H2.includes('id="gp"'));
chk('読み取るボタン', H.includes('kPaste()')&&H2.includes('gPaste()'));
console.log('\n=== 7. 枠：2人ずつ自動で割り振る ===');
app.sample(); global.flush();
app.DB().meta.frameMode='manual';
app.fPair2();
const byFrame={};
app.DB().players.forEach(p=>{if(+p.f>0)(byFrame[p.f]=byFrame[p.f]||[]).push(p.n);});
chk('16名が8枠・各2人にまとまる', Object.values(byFrame).every(a=>a.length===2)&&Object.keys(byFrame).length===8,
    Object.entries(byFrame).map(([f,a])=>f+'枠:'+a.length+'人').join(' '));
chk('FRAMESが1〜8の8枠', app.FRAMES().join(',')==='1,2,3,4,5,6,7,8', app.FRAMES().join(','));

console.log('  -- 組が未定の人は枠に入れない --');
/* 組と枠は別物。組がなければプレーしないので枠にも入らない。
   枠だけ0にしても、組が決まっていれば割り振りの対象になる（2026-09-08に変更） */
app.sample(); global.flush();
app.DB().meta.frameMode='manual';
const skip=[app.DB().players[2].n,app.DB().players[9].n];
app.DB().players[2].g=0; app.DB().players[2].f=0;
app.DB().players[9].g=0; app.DB().players[9].f=0;
app.fPair2();
chk('組が未定の2名は枠0のまま', app.DB().players.filter(p=>skip.includes(p.n)).every(p=>+p.f===0));
chk('残り14名は7枠・各2人にまとまる', app.FRAMES().length===7&&
    app.FRAMES().every(f=>app.DB().players.filter(p=>+p.f===f).length===2), app.FRAMES().join(','));

console.log('  -- 奇数人数なら最後の1枠だけ1人になる --');
app.sample(); global.flush();
app.DB().meta.frameMode='manual';
app.DB().players[15].g=0; app.DB().players[15].f=0;
app.fPair2();
const last=app.FRAMES().at(-1);
chk('最後の枠だけ1人', app.DB().players.filter(p=>+p.f===last).length===1,
    last+'枠='+app.DB().players.filter(p=>+p.f===last).length+'人');

console.log('  -- 「組と同じ」モードでは呼んでも何も壊れない（ボタン自体は出ない） --');
app.sample(); global.flush();
app.DB().meta.frameMode='group';
app.go('players');
chk('groupモードではボタンが出ない', !store['pane'].innerHTML.includes('fPair2()'));
app.DB().meta.frameMode='manual';
app.go('players');
chk('manualモードではボタンが出る', store['pane'].innerHTML.includes('fPair2()'));

console.log('\n合計 NG: '+ng);
