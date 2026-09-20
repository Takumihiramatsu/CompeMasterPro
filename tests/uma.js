/* 馬連（既存の枠連の代わりに、氏名2名の組合せで当てる券種）のテスト。2026-09-20追加。
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
const _t=[];global.setTimeout=f=>{_t.push(f);return 1};global.flush=()=>_t.splice(0).forEach(f=>{try{f()}catch(e){}});
global.setInterval=()=>1;global.clearInterval=()=>{};global.clearTimeout=()=>{};
global.performance={now:()=>0};global.requestAnimationFrame=()=>{};
let A=[];global.alert=m=>A.push(m);global.confirm=()=>true;
global.URL={createObjectURL:()=>'',revokeObjectURL(){}};global.Blob=class{};
global.localStorage={setItem(){},getItem(){return null},removeItem(){}};
['show','hud','dots','tabs','saveState','hdTitle','pane','sndBtn','kp','kpv','gp','gpv',
 'ka_v','ka_a','ka_b','ka_q','ka_msg','r_t1','r_t2','r_fa','r_fb','r_l1','r_l2','r_l3','slideCt']
  .forEach(id=>{global[id]=doc.getElementById(id)});
const app=new Function(src+`;return {DB:()=>DB,setDB:d=>{DB=d},blank,migrate,sample,go,render,M,
  kVoid,calcK,parseKeibaPair,kPaste,kPasteApply,kAdd,bPerson,bClear,RUN,FRAMES,
  vBets,vResult,vHelp,vSum,applyScores,resultStale,buildSlides,kPairVotes,
  get slides(){return typeof slides==='undefined'?null:slides},
  get KSEL(){return typeof KSEL==='undefined'?null:KSEL},
  betsTab:typeof betsTab==='function'?betsTab:()=>{},tabList};`)();
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x!==''&&x!==undefined?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};

const setup=()=>{app.sample();global.flush();app.DB().meta.betsClosed=false;return app.DB();};

console.log('=== 1. 既定は枠連。馬連へ切り替えられる ===');
let DB=setup();
chk('既定は枠連', DB.meta.kMode==='枠連', DB.meta.kMode);
app.M('kMode','馬連');
chk('M(kMode,馬連)で切り替わる', app.DB().meta.kMode==='馬連');
chk('blank()の既定も枠連', app.blank().meta.kMode==='枠連');
console.log('  -- 旧データ（kModeを持たない）を読み込んでも枠連のまま --');
const old=app.blank(); delete old.meta.kMode; old.v=2;
const migrated=app.migrate(old);
chk('移行後も既定は枠連', migrated.meta.kMode==='枠連', migrated.meta.kMode);

console.log('\n=== 2. 無効の判定（kVoid、馬連） ===');
DB=setup(); DB.meta.kMode='馬連'; DB.keiba=[];
const N=DB.players.map(p=>p.n);
chk('正しい馬連の口は有効', app.kVoid({a:N[0],b:N[1],q:1})==='');
chk('同じ人を2回指名した口は無効', app.kVoid({a:N[0],b:N[0],q:1})==='同じ人を2回指名しています');
chk('片方が空欄の口は無効', /指名が2名そろっていません/.test(app.kVoid({a:N[0],b:'',q:1})));
chk('出走しない方を指名した口は無効', /出走しない方を指名/.test(app.kVoid({a:N[0],b:'幽霊　太郎',q:1})));
DB.players.find(p=>p.n===N[2]).g=0; DB.players.find(p=>p.n===N[2]).f=0;
chk('出走を取り消した人を指名した口は無効', /出走しない方を指名/.test(app.kVoid({a:N[0],b:N[2],q:1})), app.kVoid({a:N[0],b:N[2],q:1}));

console.log('\n=== 3. 的中判定（calcK、馬連） ===');
DB=setup(); DB.meta.kMode='馬連'; DB.keiba=[];
DB.result.top2=[N[0],N[1]];
DB.keiba.push({v:N[3],a:N[0],b:N[1],q:2});      // 順どおり
DB.keiba.push({v:N[4],a:N[1],b:N[0],q:3});      // 順不同でも的中
DB.keiba.push({v:N[5],a:N[0],b:N[2],q:1});      // 外れ
let K=app.calcK();
chk('順不同でも的中する', K.win===5, K.win);
chk('外れの口は的中に数えない', !K.winners.some(w=>w.n===N[5]));
chk('売上＝全口数×単価', K.sales===6*DB.meta.kPrice, K.sales);
console.log('  -- 上位2名が2名そろっていないと的中させない（ガード） --');
DB.result.top2=[N[0],''];
K=app.calcK();
chk('上位が1名分しかないと的中ゼロ', K.win===0, K.win);

console.log('\n=== 4. 画面での2名選び（bPerson・kAdd） ===');
DB=setup(); DB.meta.kMode='馬連'; DB.keiba=[];
app.bClear();
app.bPerson(N[0]); app.bPerson(N[1]);
chk('2名選ぶとKSELに入る', JSON.stringify(app.KSEL)===JSON.stringify([N[0],N[1]]), app.KSEL);
app.bPerson(N[0]);
chk('同じ人をもう一度押すと外れる', app.KSEL.length===1&&app.KSEL[0]===N[1], app.KSEL);
app.bClear();
app.bPerson(N[0]); app.bPerson(N[1]);
global.ka_v.value=N[3]; global.ka_a.value=N[0]; global.ka_b.value=N[1]; global.ka_q.value='2';
app.kAdd();
chk('kAddで1行追加される', DB.keiba.length===1&&DB.keiba[0].q===2, JSON.stringify(DB.keiba));
chk('追加後は2名選びがクリアされる', app.KSEL.length===0);
global.ka_v.value=N[3]; global.ka_a.value=N[1]; global.ka_b.value=N[0]; global.ka_q.value='1';
app.kAdd();
chk('順が違っても同じ買い目は1行にまとめる', DB.keiba.length===1&&DB.keiba[0].q===3, JSON.stringify(DB.keiba));
global.ka_v.value=N[3]; global.ka_a.value=''; global.ka_b.value=''; global.ka_q.value='1';
app.kAdd();
chk('2名未選択では追加できない', /2名選んでください/.test(global.ka_msg.textContent));

console.log('\n=== 5. 貼り付け解析（parseKeibaPair・kPaste・kPasteApply） ===');
DB=setup(); DB.meta.kMode='馬連'; DB.keiba=[];
[['タブ区切り', `${N[0]}\t${N[1]}\t${N[2]}\t2`, {v:N[0],a:N[1],b:N[2],q:2}],
 ['順を逆にしても買い目は同じ扱い', `${N[3]}\t${N[5]}\t${N[4]}\t1`, {v:N[3],a:N[5],b:N[4],q:1}],
 ['口数を省略', `${N[6]}  ${N[7]}  ${N[8]}`, {v:N[6],a:N[7],b:N[8],q:1}],
].forEach(([label,line,e])=>{
  const r=app.parseKeibaPair(line)[0];
  chk(label, r.ok&&r.voter===e.v&&r.a===e.a&&r.b===e.b&&r.q===e.q,
      `${r.voter} → ${r.a}・${r.b} ×${r.q}${r.ok?"":" ["+r.why+"]"}`);
});
const badp1=app.parseKeibaPair(`${N[0]}\t${N[1]}\t${N[1]}\t1`)[0];
chk('同じ人を2回指名は×', !badp1.ok, badp1.why);
const badp2=app.parseKeibaPair(`${N[0]}\t${N[1]}\t幽霊　太郎\t1`)[0];
chk('名簿外の指名は×', !badp2.ok, badp2.why);
const badp3=app.parseKeibaPair(`${N[0]}\t${N[1]}\t1`)[0];
chk('買い目が2名そろわないと×', !badp3.ok, badp3.why);

store['kp'].value=[`${N[0]}\t${N[1]}\t${N[2]}\t2`,`${N[0]}\t${N[2]}\t${N[1]}\t3`,`${N[3]}\t${N[4]}\t${N[5]}\t1`].join('\n');
app.kPaste();
chk('3行を読み取る', store['kpv'].innerHTML.includes('3行・6口'), (store['kpv'].innerHTML.match(/\d+行・\d+口/)||[''])[0]);
A=[]; app.kPasteApply();
chk('取り込みメッセージ', A[0].includes('6口を取り込みました'), A[0]);
chk('順が違っても同じ買い目は1行にまとまる', DB.keiba.length===2, DB.keiba.length+'行');
chk('口数が2+3=5にまとまる', DB.keiba.find(r=>r.v===N[0]).q===5, DB.keiba.find(r=>r.v===N[0]).q);

console.log('\n=== 6. 画面（vBets）：馬連のときは氏名選びのUIになる ===');
DB=setup(); DB.meta.kMode='馬連'; DB.keiba=[];
app.betsTab('k'); app.go('bets');
let H=store['pane'].innerHTML;
chk('馬連の見出しが出る', H.includes('馬券（馬連）'));
chk('氏名ボタンが出る（枠のボタンではない）', H.includes('bPerson(') && !H.includes('bFrame('));
chk('枠が無くても警告は出ない', !/枠がありません/.test(H));
chk('組合せの人気（口数の多い順）が出る', H.includes('組合せの人気'));
console.log('  -- 枠連のときは従来どおり --');
DB.meta.kMode='枠連'; app.go('bets');
H=store['pane'].innerHTML;
chk('枠連の見出しに戻る', H.includes('馬券（枠連）'));
chk('枠のボタンが出る', H.includes('bFrame('));

console.log('\n=== 7. 画面（vResult）：馬連のときは枠の選択が無い ===');
DB=setup(); DB.meta.kMode='馬連';
app.go('result');
H=store['pane'].innerHTML;
chk('見出しが「当選ペア」になる', H.includes('馬券の当選ペア'));
chk('枠の選択欄は出ない', !H.includes('id="r_fa"')&&!H.includes('id="r_fb"'));
chk('上位1・2人目の選択は出る', H.includes('id="r_t1"')&&H.includes('id="r_t2"'));
console.log('  -- 反映（set）：馬連ではDB.result.frameに触れない --');
DB.result.frame='';
global.r_t1.value=N[0]; global.r_t2.value=N[1];
if(global.r_t1.onchange) global.r_t1.onchange();
chk('top2に反映される', app.DB().result.top2.join('|')===[N[0],N[1]].join('|'), app.DB().result.top2);
chk('frameには触れない（空のまま）', app.DB().result.frame==='', JSON.stringify(app.DB().result.frame));

console.log('\n=== 8. 使い方（vHelp）：説明が馬連用になる ===');
DB=setup(); DB.meta.kMode='馬連';
app.vHelp();
H=store['pane'].innerHTML;
chk('見出しが「馬券（馬連予想）」になる', H.includes('馬券（馬連予想）'));
chk('枠連の見出しは出ない', !H.includes('馬券（枠連予想）'));
chk('氏名の組合せを当てると説明される', H.includes('氏名の組合せ'));
chk('貼り付け書式が馬連用になる', H.includes('馬券（馬連）')&&!/氏名（タブ）1-3/.test(H));
chk('無効の理由が馬連用になる', H.includes('出走しない方を指名している'));
chk('単勝・複勝の理由は引き続き出る', H.includes('単勝・複勝を作っていない理由'));

console.log('\n=== 9. 集計（vSum）：馬連は組合せの人気一覧になる ===');
DB=setup(); DB.meta.kMode='馬連'; DB.keiba=[{v:N[0],a:N[1],b:N[2],q:3}];
app.vSum();
H=store['pane'].innerHTML;
chk('組合せの人気一覧が出る', H.includes('口数の多い組合せ順'));
chk('無効の口の表でも氏名で出る（枠の色マスではない）', !/chip/.test(H));

console.log('\n=== 10. 発表（buildSlides）：馬連でも安全に組み立てられる ===');
DB=setup(); DB.meta.kMode='馬連';
DB.result.top2=[N[0],N[1]];
let e=0;
try{app.buildSlides();}catch(x){e++;console.log('  ★',x.message);}
chk('エラーにならない', e===0);
const S=app.slides;
chk('馬連用の当選スライドがある', S.some(s=>s.id==='k-draw'&&/組合せ/.test(s.lab)), S.map(s=>s.id).join(','));
const drawSlide=S.find(s=>s.id==='k-draw');
chk('発表演出はdrawPairを使う', typeof drawSlide.enter==='function');
chk('who に上位2名の氏名が入る', drawSlide.who===N[0]+'-'+N[1], drawSlide.who);

console.log('\n=== 11. 全タブが馬連モードでも描画できる ===');
DB=setup(); DB.meta.kMode='馬連';
e=0; app.tabList().forEach(([k])=>{try{app.go(k)}catch(x){e++;console.log('  ★',k,x.message)}});
chk('全タブ描画', e===0);

console.log('\n合計 NG: '+ng);
process.exit(ng?1:0);
