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
let ALERTS=[];global.alert=m=>ALERTS.push(m);global.confirm=()=>true;
global.URL={createObjectURL:()=>'',revokeObjectURL(){}};global.Blob=class{};
global.localStorage={setItem(){},getItem(){return null},removeItem(){}};
['show','hud','dots','tabs','saveState','hdTitle','pane','sndBtn','paste','pv'].forEach(id=>{global[id]=doc.getElementById(id)});
const app=new Function(src+`;return {DB:()=>DB,blank,migrate,sample,go,standings,scoreOf,SCset,hcOf,grossOf,
  parseSheet,pastePreview,pasteApply,applyScores,ENT,RUN,setDB:x=>{DB=x},sheetCross,
  sheetTail,sheetHoles,coursePar,hcRaw,SC,sheetStream,sheetFromStream,
  sheetColumns,sheetFromColumns,nzv,applyScores,scSet,scoreCheck,scoreCheckSum,
  sheetAssign,go,get PVBYORDER(){return PVBYORDER},
  get PVROWS(){return PVROWS},get PVREBUILT(){return PVREBUILT}};`)();
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};

app.sample(); global.flush();
const N=app.RUN().map(p=>p.n);
app.SCset('entry','sheet');
chk('集計表モードに切替', app.ENT()==='sheet');

console.log('\n=== 1. いろいろな貼り付け形式の読み取り ===');
const cases=[
 ['順位つきタブ区切り', `1\t${N[0]}\t92\t18.0\t74.0`, {g:92,hc:18,net:74}],
 ['スペース区切り',     `2  ${N[1]}  101  25.2  75.8`, {g:101,hc:25.2,net:75.8}],
 ['カンマ区切り',       `${N[2]},88,12.0,76.0`,        {g:88,hc:12,net:76}],
 ['グロスとネットだけ', `${N[3]}\t105\t78.6`,          {g:105,hc:26.4,net:78.6}],
 ['所属つき',           `3 ${N[4]} 営業部 96 21.6 74.4`,{g:96,hc:21.6,net:74.4}],
 ['姓だけ',             `${N[5].split('　')[0]} 99 24.0 75.0`, {g:99,hc:24,net:75}],
];
cases.forEach(([label,line,exp])=>{
  const r=app.parseSheet(line)[0];
  chk(label, r.found&&r.g===exp.g&&Math.abs(r.hc-exp.hc)<0.05&&Math.abs(r.net-exp.net)<0.05,
      `${r.name} G${r.g} HC${r.hc} NET${r.net}`);
});
const bad=app.parseSheet('9 だれか知らない人 100 20 80')[0];
chk('名簿にない人は×', !bad.found, bad.name);

console.log('\n=== 2. 一括取り込み ===');
const sheet=N.map((n,i)=>`${i+1}\t${n}\t${90+i}\t${(10+i*0.8).toFixed(1)}\t${(90+i-(10+i*0.8)).toFixed(1)}`).join('\n');
store['paste'].value=sheet;
app.pastePreview();
chk('プレビューが16行', (store['pv'].innerHTML.match(/<tr class="zebra">/g)||[]).length===16);
chk('全行が○', !store['pv'].innerHTML.includes('×'));
ALERTS=[]; app.pasteApply();
chk('16名ぶん取り込み', ALERTS[0]==='16名ぶんを取り込みました。', ALERTS[0]);
const st=app.standings();
chk('全員に順位がつく', st.net.length===16);
chk('1人目 グロス90 HDCP10 ネット80', app.grossOf({n:N[0]})===90&&app.hcOf({n:N[0]})===10&&st.rows.find(r=>r.n===N[0]).net===80,
    'G'+app.grossOf({n:N[0]})+' HC'+app.hcOf({n:N[0]})+' NET'+st.rows.find(r=>r.n===N[0]).net);
chk('ネット＝グロス−HDCP（全員）', st.net.every(r=>Math.abs(r.g-r.hc-r.net)<0.05));
chk('ネット順に並ぶ', st.net.every((r,i,a)=>i===0||a[i-1].net<=r.net));
console.log('  上位3:',st.net.slice(0,3).map(r=>r.rank+'位 '+r.n+' G'+r.g+' HC'+r.hc+' NET'+r.net).join(' / '));
chk('ベスグロはグロス最少', st.best.g===Math.min(...st.rows.map(r=>r.g)), st.best.n+' '+st.best.g);

console.log('\n=== 3. 手入力でも直せる ===');
const s0=app.scoreOf(N[0]); s0.gross=85; s0.hc=5;
const st2=app.standings();
chk('修正が反映', st2.rows.find(r=>r.n===N[0]).net===80);

console.log('\n=== 4. 結果の自動反映 ===');
app.applyScores();
const R=app.DB().result;
chk('上位2名が入る', R.top2.filter(Boolean).length===2, R.top2.join(' / '));
chk('下位3名が入る', R.low.filter(Boolean).length===3, R.low.join(' / '));
chk('罰金用グロスが全員', Object.keys(R.gross).length===16);

console.log('\n=== 5. モードの切替と移行 ===');
app.SCset('entry','hidden');
chk('隠しホールモードに戻せる', app.ENT()==='hidden');
chk('計算モードではHDCPを再計算', app.hcOf({n:N[0]})!==5, app.hcOf({n:N[0]}));
app.SCset('entry','sheet');
chk('集計表モードに戻すと手入力値', app.hcOf({n:N[0]})===5);
const old={v:2,meta:{sc:{allHoles:true,par:app.DB().meta.sc.par,hidden:app.DB().meta.sc.hidden}},players:[],groups:[]};
chk('旧allHoles:true → 18ホール', app.migrate(old).meta.sc.entry==='all');
const old2={v:2,meta:{sc:{allHoles:false,par:app.DB().meta.sc.par,hidden:app.DB().meta.sc.hidden}},players:[],groups:[]};
chk('旧allHoles:false → 隠しホール', app.migrate(old2).meta.sc.entry==='hidden');

console.log('\n=== 6. 画面 ===');
app.SCset('entry','sheet'); app.go('score');
chk('集計表モードでホール欄が消える', !store['pane'].innerHTML.includes('>1H<'));
chk('HDCP欄が入力になる', store['pane'].innerHTML.includes("scSet('"+N[0]+"','hc'"));
chk('貼り付け欄がある', store['pane'].innerHTML.includes('id="paste"'));
app.SCset('entry','hidden'); app.go('score');
chk('隠しホールモードでホール欄が出る', store['pane'].innerHTML.includes('>2H<'));
chk('貼り付け欄は出ない', !store['pane'].innerHTML.includes('id="paste"'));
/* ============================================================
   （実在のコース）の23列形式（2026年の大会で使われたもの）。
   「氏名／18ホール／OUT／IN／Total／Hdcp／Net」の並び。
   以前は先頭から40〜200の数値を拾ってOUTの小計をグロスと誤認し、
   HDCPが負の値になったうえで○判定で通っていた。 */
console.log('\n=== 7. ゴルフ場の23列形式（OUTをグロスと誤認しない）===');
const PAR=[4,3,5,3,4,4,4,5,4, 4,3,4,5,4,3,5,4,4];
const HID=[1,2,3,6,7,9,10,12,13,15,17,18];
const HAIYA=[
 ["優勝 川島 俊之",  [5,4,4,4,6,5,4,6,4, 4,3,6,6,3,4,5,4,4],  42,39, 81, 7.2,73.8],
 ["準優勝 白石 徹",  [5,5,6,4,5,6,5,7,6, 5,3,4,8,5,4,5,4,5],  49,43, 92,18.0,74.0],
 ["7 千葉 亮",       [6,5,10,3,6,6,4,7,6, 6,3,5,8,5,4,9,6,6], 53,52,105,28.8,76.2],
 ["9 瀬川 拓真",     [5,4,6,3,5,5,7,7,6, 7,6,5,8,5,6,7,7,8],  48,59,107,30.0,77.0],
 ["13 相沢 直哉",    [5,5,9,4,11,5,7,6,7, 7,3,6,7,5,6,7,6,6], 59,53,112,30.0,82.0],
 ["16 大隈 浩太",    [8,6,10,4,7,6,6,6,7, 8,5,9,9,6,3,7,6,8], 60,61,121,30.0,91.0],
];
const HNAMES=["川島　俊之","白石　徹","千葉　亮","瀬川　拓真","相沢　直哉","大隈　浩太"];
const HBD   =["1970-11-11","1964-05-05","1967-08-08","1975-04-16","1965-06-06","1974-03-15"];
/* 実際の集計表の並び：氏名／前半9／OUT／後半9／IN／Total／Hdcp／Net */
const HLINE=HAIYA.map(([lab,hs,o,i,g,hc,net])=>
  [lab,...hs.slice(0,9),o,...hs.slice(9),i,g,hc,net].join(' '));

const D2=app.blank();
D2.meta.frameMode="free";
D2.meta.sc={system:"double",par:PAR.slice(),hidden:HID.slice(),
            cut:"triplePar",hcUse:true,hcMax:30,tiebreak:"older",entry:"sheet"};
HNAMES.forEach((n,i)=>D2.players.push({n,org:"",bd:HBD[i],g:i+1,f:i+1,vote:true,fee:true,feeAmt:""}));
app.setDB(D2);

const HR=app.parseSheet(HLINE.join('\n'));
HAIYA.forEach((e,i)=>{
  const r=HR[i];
  const good=r.ok&&r.name===HNAMES[i]&&r.g===e[4]&&Math.abs(r.hc-e[5])<0.05&&Math.abs(r.net-e[6])<0.05;
  chk(HNAMES[i], good, `グロス${r.g} HDCP${r.hc} ネット${r.net}`
    +(good?'':`  ← 正解 ${e[4]}/${e[5]}/${e[6]}　${r.why||''}`));
});
chk('OUTの小計(42・49・53…)をグロスにしない', HR.every((r,i)=>r.g!==HAIYA[i][2]));
chk('HDCPが負にならない', HR.every(r=>r.hc>=0));

console.log('\n=== 8. 18ホールぶんも取り込める ===');
HAIYA.forEach((e,i)=>{
  const r=HR[i];
  chk(HNAMES[i]+' のホール別', !!r.holes&&r.holes.join()===e[1].join(),
      r.holes?r.holes.join(' '):'取れていない');
});
chk('OUT・INも取れる', HR.every((r,i)=>r.out===HAIYA[i][2]&&r.inn===HAIYA[i][3]));
store['paste'].value=HLINE.join('\n');
app.pastePreview();
chk('プレビューに「18H」が出る', (store['pv'].innerHTML.match(/18H/g)||[]).length>=6);
chk('ホール別が読めた案内が出る', store['pv'].innerHTML.includes('18ホールぶんのスコア'));
ALERTS=[]; app.pasteApply();
chk('ホール別も入った旨の知らせ', /ホール別のスコアも入りました/.test(ALERTS[0]||''), ALERTS[0]);
chk('スコア欄に18ホール入っている',
  HNAMES.every((n,i)=>PAR.every((_,k)=>+app.scoreOf(n).h[k+1]===HAIYA[i][1][k])));

console.log('\n=== 9. 印字HDCPとアプリの計算を突き合わせる ===');
const XC=app.sheetCross();
chk('6名ぶん突合できる', XC.length===6, XC.length+'名');
XC.forEach(x=>chk(x.n+'　印字'+x.printed+' / 計算'+x.mine, x.diff===0, '差 '+x.diff));
chk('全員一致（差ゼロ）', XC.every(x=>x.diff===0));
/* 印字値をわざとずらして、突合が本当に効いているかを確かめる
   （以前は集計表モードだと印字値どうしを比べていて、常に差ゼロだった） */
app.scoreOf(HNAMES[0]).hc=9.9;
chk('印字値をずらすと差が出る',
  (app.sheetCross().find(x=>x.n===HNAMES[0])||{}).diff===-2.7,
  (app.sheetCross().find(x=>x.n===HNAMES[0])||{}).diff);
app.scoreOf(HNAMES[0]).hc=7.2;
chk('戻すと差ゼロ', (app.sheetCross().find(x=>x.n===HNAMES[0])||{}).diff===0);
/* 隠しホールを間違えると差が出ることも確かめる（突合が機能している証拠） */
app.SCset('hidden',[2,3,5,6,8,9,11,12,14,15,17,18]);
chk('隠しホールを変えると差が出る', app.sheetCross().some(x=>x.diff!==0),
    app.sheetCross().map(x=>x.diff).join(','));
app.SCset('hidden',HID.slice());
chk('戻すと差ゼロ', app.sheetCross().every(x=>x.diff===0));

console.log('\n=== 10. 成り立たない行は取り込ませない ===');
const NGCASE=[
 ['ネットが計算と合わない',   '1 川島　俊之 81 7.2 99.9'],
 ['ハンディだけで残りが変',   '9 瀬川　拓真 42 39'],
 ['数字がない',               '5 白石　徹 出場せず'],
 ['グロスが小さすぎる',       '3 千葉　亮 12 3 9'],
 ['グロスの桁が落ちた',       '2 白石　徹 9 18.0 74.0'],
];
NGCASE.forEach(([label,line])=>{
  const r=app.parseSheet(line)[0];
  chk(label+' → ×', !r.ok, r.why||`グロス${r.g} HDCP${r.hc} ネット${r.net}`);
});
store['paste'].value=NGCASE.map(x=>x[1]).join('\n');
app.pastePreview();
chk('プレビューで全行×になる', (store['pv'].innerHTML.match(/×/g)||[]).length>=5);
chk('理由が画面に出る', /グロスが読めません|ネットが|ハンディが/.test(store['pv'].innerHTML));
ALERTS=[]; app.pasteApply();
chk('1件も取り込まれない', ALERTS[0]==='0名ぶんを取り込みました。', ALERTS[0]);

console.log('\n=== 11. 従来の4列形式も壊れていない ===');
[['氏名＋グロス＋HDCP＋ネット','1\t川島　俊之\t81\t7.2\t73.8',[81,7.2,73.8]],
 ['グロスとネットだけ',        '川島　俊之\t105\t78.6',       [105,26.4,78.6]],
 ['所属つき',                  '3 白石　徹 営業部 96 21.6 74.4',[96,21.6,74.4]],
].forEach(([label,line,e])=>{
  const r=app.parseSheet(line)[0];
  chk(label, r.ok&&r.g===e[0]&&Math.abs(r.hc-e[1])<0.05&&Math.abs(r.net-e[2])<0.05,
      `${r.g}/${r.hc}/${r.net}`);
  chk(label+'：ホール別は無し', !r.holes);
});

console.log('\n=== 改行が崩れていても数字の並びから組み直す ===');
/* 写真からの文字認識は、表の改行を正しく返さないことがある。
   行が1つに繋がる／数語ごとに切れる／行の途中で切れる、いずれも実際に起きた。
   集計表の数字には4つの決まりが同時に成り立つので、改行を当てにせず復元できる。
     前半9の合計＝OUT ／ 後半9の合計＝IN ／ OUT＋IN＝Total ／ Total−HDCP＝Net
   とくに「数語ごとに切れた」場合、行ごとの読み取りは16行取れたつもりで
   誤った値を返す。同数でも組み直しを採る作りにしてある。 */
const R16=[
 ["優勝","川島　俊之",[5, 4, 4, 4, 6, 5, 4, 6, 4],42,[4, 3, 6, 6, 3, 4, 5, 4, 4],39,81,7.2,73.8],
 ["準優勝","白石　徹",[5, 5, 6, 4, 5, 6, 5, 7, 6],49,[5, 3, 4, 8, 5, 4, 5, 4, 5],43,92,18.0,74.0],
 ["3","邊見　克己",[9, 4, 7, 5, 5, 5, 7, 6, 5],53,[6, 3, 7, 6, 6, 4, 6, 5, 5],48,101,26.4,74.6],
 ["4","及川　豊",[6, 3, 7, 3, 7, 5, 6, 7, 6],50,[7, 5, 7, 7, 6, 5, 4, 6, 6],53,103,27.6,75.4],
 ["5","川島　武夫",[6, 4, 7, 5, 4, 4, 5, 5, 5],45,[5, 5, 5, 6, 5, 4, 6, 5, 5],46,91,15.6,75.4],
 ["6","川島　文吾",[5, 4, 5, 3, 5, 5, 5, 6, 6],44,[4, 4, 5, 7, 5, 4, 7, 5, 3],44,88,12.0,76.0],
 ["7","千葉　亮",[6, 5, 10, 3, 6, 6, 4, 7, 6],53,[6, 3, 5, 8, 5, 4, 9, 6, 6],52,105,28.8,76.2],
 ["8","三村　健吾",[5, 5, 8, 4, 6, 5, 5, 6, 7],51,[5, 4, 6, 9, 6, 6, 7, 5, 6],54,105,28.8,76.2],
 ["9","瀬川　拓真",[5, 4, 6, 3, 5, 5, 7, 7, 6],48,[7, 6, 5, 8, 5, 6, 7, 7, 8],59,107,30.0,77.0],
 ["10","江木　和久",[6, 3, 5, 4, 6, 6, 7, 7, 5],49,[5, 4, 5, 5, 6, 4, 6, 5, 5],45,94,15.6,78.4],
 ["11","木南　英明",[7, 4, 8, 7, 7, 6, 6, 7, 7],59,[8, 3, 5, 7, 7, 4, 5, 6, 5],50,109,30.0,79.0],
 ["12","森　良治",[5, 3, 6, 4, 6, 5, 5, 6, 5],45,[5, 4, 4, 6, 7, 5, 7, 5, 6],49,94,14.4,79.6],
 ["13","相沢　直哉",[5, 5, 9, 4, 11, 5, 7, 6, 7],59,[7, 3, 6, 7, 5, 6, 7, 6, 6],53,112,30.0,82.0],
 ["14","郷司　義晴",[5, 4, 8, 4, 4, 6, 8, 7, 7],53,[5, 6, 6, 9, 5, 7, 6, 8, 8],60,113,30.0,83.0],
 ["15","甲斐　隆志",[9, 6, 8, 4, 5, 9, 7, 6, 5],59,[6, 6, 7, 6, 6, 6, 6, 6, 7],56,115,30.0,85.0],
 ["16","大隈　浩太",[8, 6, 10, 4, 7, 6, 6, 6, 7],60,[8, 5, 9, 9, 6, 3, 7, 6, 8],61,121,30.0,91.0]
];

const BPAR=[4,3,5,3,4,4,4,5,4, 4,3,4,5,4,3,5,4,4];
const bline=r=>[r[0],r[1],...r[2],r[3],...r[4],r[5],r[6],r[7].toFixed(1),r[8].toFixed(1)].join(' ');
const BGOOD="HOLE 1 2 3 4 5 6 7 8 9 OUT 10 11 12 13 14 15 16 17 18 IN Total Hdcp Net\n"
  +"PAR "+BPAR.slice(0,9).join(' ')+" 36 "+BPAR.slice(9).join(' ')+" 36 72\n"
  +R16.map(bline).join("\n");
const BCASES=[
 ['正しい改行', BGOOD],
 ['改行が全部消えた（1行に繋がった）', BGOOD.replace(/\n/g,' ')],
 ['5語ごとに改行が入った', BGOOD.replace(/\n/g,' ').split(' ').reduce((a,w,i)=>a+w+((i+1)%5?' ':'\n'),'')],
 ['行の途中で切れた', BGOOD.split('\n').map(l=>{const p=l.split(' ');
    return p.slice(0,7).join(' ')+'\n'+p.slice(7).join(' ');}).join('\n')],
 ['空行が大量に入った', BGOOD.replace(/\n/g,'\n\n\n')],
 ['全角数字・全角空白', BGOOD.replace(/[0-9]/g,c=>String.fromCharCode(c.charCodeAt(0)+0xFEE0))
    .replace(/ /g,'\u3000').replace(/\./g,'．')],
 ['罫線が混ざった', BGOOD.split('\n').map(l=>'|'+l.split(' ').join('|')+'|').join('\n')],
];

app.setDB((()=>{const D=app.blank();D.meta.frameMode="free";
  D.meta.sc={system:"double",par:BPAR.slice(),hidden:[1,2,3,6,7,9,10,12,13,15,17,18],
    cut:"triplePar",hcUse:true,hcMax:30,tiebreak:"older",entry:"sheet"};
  R16.forEach((r,i)=>D.players.push({n:r[1],org:"",bd:"19"+(60+i)+"-01-01",
    g:Math.floor(i/2)+1,f:Math.floor(i/2)+1,vote:true,fee:true,feeAmt:""}));
  return D;})());
BCASES.forEach(([lab,txt])=>{
  store['paste'].value=txt; app.pastePreview();
  const got=app.PVROWS.filter(r=>r.ok);
  const right=got.length===16 && R16.every(e=>{
    const r=got.find(x=>x.name===e[1]);
    return r && r.g===e[6] && Math.abs(r.hc-e[7])<0.05
      && r.holes && r.holes.join()===e[2].concat(e[4]).join();});
  chk(lab, right, got.length+'名'+(app.PVREBUILT?'（組み直し）':''));
});
console.log('  -- 組み直しの中身 --');
store['paste'].value=BGOOD.replace(/\n/g,' '); app.pastePreview();
chk('1行に繋がった入力を組み直した', app.PVREBUILT===true);
chk('画面に知らせが出る', /組み直しました/.test(store['pv'].innerHTML));
ALERTS=[]; app.pasteApply();
chk('16名ぶん取り込める', (ALERTS[0]||'').includes('16名ぶん'), ALERTS[0]);
chk('18ホールが入っている',
  R16.every(e=>e[2].concat(e[4]).every((v,k)=>+app.scoreOf(e[1]).h[k+1]===v)));
const bst=app.standings();
chk('グロス・HDCP・ネットが集計表どおり',
  R16.every(e=>{const x=bst.rows.find(y=>y.n===e[1]);
    return x&&x.g===e[6]&&Math.abs(x.hc-e[7])<0.05&&Math.abs(x.net-e[8])<0.05;}));
chk('印字値とアプリの計算が全員一致', app.sheetCross().every(x=>x.diff===0),
    app.sheetCross().map(x=>x.diff).filter(d=>d!==0).join(',')||'差ゼロ');
console.log('  -- 誤って拾わないこと --');
store['paste'].value="HOLE 1 2 3 4 5 6 7 8 9 OUT 10 11 12 13 14 15 16 17 18 IN\n"
  +"PAR 4 3 5 3 4 4 4 5 4 36 4 3 4 5 4 3 5 4 4 36 72"; app.pastePreview();
chk('見出しとPAR行だけなら1名も拾わない', app.PVROWS.filter(r=>r.ok).length===0);
store['paste'].value=R16.slice(0,2).map(e=>e[1]+"\t"+e[6]+"\t"+e[7].toFixed(1)+"\t"+e[8].toFixed(1)).join("\n");
app.pastePreview();
chk('従来の4列形式では組み直しに切り替わらない',
    app.PVREBUILT===false&&app.PVROWS.filter(r=>r.ok).length===2,
    app.PVROWS.filter(r=>r.ok).length+'名');

console.log('\n=== 写真からコピーした実データ（表が縦向きに読まれた場合）===');
/* 2026-09-04、印刷した集計表をiPhoneの文字認識にかけて実際に得られた文字列。
   A4横の表を撮ると、認識が表を90度回った向きに読むことがある。
   1行＝表の1列（Net・Hdcp・Total・OUT・IN・各ホール）となり、
   1行の中に16名ぶんの値がタブ区切りで並ぶ。
   ホール別の数字は取りこぼしが多く（∞ などの誤読も混じる）復元できないが、
   Net と Hdcp は16名ぶん綺麗に並び、Total が1つ欠けても Hdcp＋Net で埋まる。
   「ゴルフ場の集計表から入力する」運用ではホール別を使わないので、これで足りる。
   氏名には「優勝」「準優勝」「順位番号」「9→g の誤読」「郷→鄉 の異体字」が混じる。 */
const LIVERAW=[
  "R.09年08月28日",
  "2027年○○CC",
  "第10回 親睦ゴルフコンペ",
  "※読み取りテスト用の架空データです。氏名は実在しません。",
  "Net\t\t73.8\t74.0\t74.6\t75.4\t75.4\t76.0\t76.2\t76.2\t77.0\t78.4\t79.0\t79.6\t82.0\t83.0\t85.0\t91.0",
  "Hdcp\t\t7.2\t18.0\t26.4\t27.6\t15.6\t12.0\t28.8\t28.8\t30.0\t15.6\t30.0\t14.4\t30.0\t30.0\t30.0\t30.0",
  "Total\t72\t\t92\t101\t103\t91\t88\t105\t105\t107\t94\t109\t94\t112\t113\t115\t121",
  "IN\t36\t39\t43\t48\t53\t46\t44\t52\t54\t59\t45\t50\t49\t53\t60\t56\t61",
  "\t\t\t\t\t\t\t3\t\t6\t\t5\t5\t\t\t\t\t",
  "\t\t4\t4\t5\t6\t5\t5\t6\t\t\t5\t6\t\t\t\t\t",
  "16\t\t\t5\t6\t\t\t7\t9\t7\t7\t6\t5\t7\t7\t6\t6\t7",
  "\t\t\t\t\t5\t\t\t\t6\t6\t4\t\t\t\t\t6\t3",
  "14\t\t\t\t\t\t5\t5\t5\t6\t5\t6\t7\t7\t\t5\t6\t",
  "\t\t\t\t\t\t\t7\t8\t\t8\t5\t7\t6\t7\t9\t6\t9",
  "\t\t\t\t\t\t\t5\t5\t6\t5\t5\t5\t\t6\t6\t7\t9",
  "\t\t3\t3\t3\t\t\t4\t3\t\t\t4\t\t\t\t6\t6\t5",
  "\t\t\t5\t6\t\t\t4\t6\t5\t\t5\t\t\t\t\t6\t∞",
  "OUT\t36\t42\t49\t53\t50\t45\t44\t53\t\t48\t49\t\t45\t59\t\t59\t60",
  "\t\t4\t\t5\t\t\t6\t6\t7\t\t5\t7\t5\t\t7\t5\t",
  "\t\t6\t\t\t\t\t9\t7\t6\t7\t7\t7\t6\t6\t\t6\t",
  "\t\t\t5\t\t\t\t5\t4\t5\t7\t7\t6\t5\t7\t∞\t7\t6",
  "\t\t\t\t5\t5\t\t5\t6\t\t5\t\t6\t5\t\t6\t\t",
  "\t\t\t\t\t\t\t\t6\t\t5\t\t7\t6\t11\t\t\t",
  "\t3\t\t\t5\t\t\t3\t3\t\t3\t4\t7\t4\t4\t4\t4\t4",
  "③\t\t\t\t\t\t\t\t0\t\t\t\t∞\t\t9\t∞\t\t10",
  "\t\t\t\t\t\t\t\t5\t5\t\t\t\t\t5\t5\t9\t",
  "HOLE\tPAR\t優勝 川島 俊之\t準優勝 白石徹\t3邊見克己\t4及川豊\t5 川島武夫\t6 川島 文吾\t7千葉亮\t8 三村 健吾\tg瀬川拓真\t10江木和久\t11 木南英明\t12 森 良治\t13 相沢直哉\t14 鄉司 義晴\t15 甲斐 隆志\t16 大隈 浩太",
  "Page",
  "1/1",
  "○○カントリ"
].join("\n");
const LNAMES=["川島　俊之","白石　徹","邊見　克己","及川　豊","川島　武夫","川島　文吾","千葉　亮",
 "三村　健吾","瀬川　拓真","江木　和久","木南　英明","森　良治","相沢　直哉","郷司　義晴",
 "甲斐　隆志","大隈　浩太"];
const LEXP=[[81,7.2,73.8],[92,18,74],[101,26.4,74.6],[103,27.6,75.4],[91,15.6,75.4],[88,12,76],
 [105,28.8,76.2],[105,28.8,76.2],[107,30,77],[94,15.6,78.4],[109,30,79],[94,14.4,79.6],
 [112,30,82],[113,30,83],[115,30,85],[121,30,91]];
const LPAR=[4,3,5,3,4,4,4,5,4, 4,3,4,5,4,3,5,4,4];

app.setDB((()=>{const D=app.blank();D.meta.frameMode="free";
  D.meta.sc={system:"double",par:LPAR.slice(),hidden:[1,2,3,6,7,9,10,12,13,15,17,18],
    cut:"triplePar",hcUse:true,hcMax:30,tiebreak:"older",entry:"sheet"};
  LNAMES.forEach((n,i)=>D.players.push({n,org:"",bd:"19"+(60+i)+"-01-01",
    g:Math.floor(i/2)+1,f:Math.floor(i/2)+1,vote:true,fee:true,feeAmt:""}));
  return D;})());
store['paste'].value=LIVERAW; app.pastePreview();
const LP=app.PVROWS.filter(r=>r.ok);
chk('16名すべて読み取れる', LP.length===16, LP.length+'名');
chk('縦向きとして組み直した', app.PVREBUILT===true);
let pbad=[];
LNAMES.forEach((n,i)=>{
  const r=LP.find(x=>x.name===n);
  if(!r){pbad.push(n+' 見つからず');return;}
  const [g,h,nt]=LEXP[i];
  if(r.g!==g||Math.abs(r.hc-h)>0.05||Math.abs(r.net-nt)>0.05) pbad.push(`${n} ${r.g}/${r.hc}/${r.net}`);
});
chk('16名のグロス・HDCP・ネットが集計表どおり', pbad.length===0, pbad.join(' / '));
chk('異体字も名簿と照合できる', LP.some(r=>r.name==='郷司　義晴'));
chk('Totalが欠けていた1名も復元', (LP.find(r=>r.name==='川島　俊之')||{}).g===81);
chk('画面に縦向きだった旨が出る', /縦向き/.test(store['pv'].innerHTML));
chk('ホール別が取れない旨も書いてある', /ホール別のスコアは取れていません/.test(store['pv'].innerHTML));
ALERTS=[]; app.pasteApply();
chk('16名ぶん取り込める', (ALERTS[0]||'').includes('16名ぶん'), ALERTS[0]);
app.applyScores();
const lst=app.standings();
chk('優勝は 川島　俊之（ネット73.8）', lst.net[0].n==='川島　俊之'&&lst.net[0].net===73.8,
    lst.net[0].n+' '+lst.net[0].net);
chk('準優勝は 白石　徹（ネット74.0）', lst.net[1].n==='白石　徹'&&lst.net[1].net===74);
chk('グロス下位3名', lst.worst3.map(r=>r.n).join('/')==='大隈　浩太/甲斐　隆志/郷司　義晴',
    lst.worst3.map(r=>r.n+'('+r.g+')').join(' '));

console.log('\n=== 打ち込みの検算（グロス − HDCP ＝ ネット）===');
/* 2026-09-04、写真からの読み取りを当日の正規手順にはしないと決めた。
   代わりに、集計表の3つの数字を打ち込んで1行ずつ検算する形を主にした。
   3つのうち1つでも打ち間違えると照合が崩れるので、
   全行が○になればそのデータは正しいと言い切れる。 */
function freshSheet(){
  const D=app.blank(); D.meta.frameMode="free";
  D.meta.sc={system:"double",par:LPAR.slice(),hidden:[1,2,3,6,7,9,10,12,13,15,17,18],
    cut:"triplePar",hcUse:true,hcMax:30,tiebreak:"older",entry:"sheet"};
  LNAMES.forEach((n,i)=>D.players.push({n,org:"",bd:"19"+(60+i)+"-01-01",
    g:Math.floor(i/2)+1,f:Math.floor(i/2)+1,vote:true,fee:true,feeAmt:""}));
  app.setDB(D);
}
freshSheet();
let CS=app.scoreCheckSum();
chk('未入力なら16行すべて未入力', CS.all===16&&CS.empty===16, CS.empty+'行');
LNAMES.forEach((n,i)=>{app.scSet(n,'gross',LEXP[i][0]);app.scSet(n,'hc',LEXP[i][1]);});
CS=app.scoreCheckSum();
chk('ネットを入れないと照合できない', CS.noref===16&&CS.ok===0, '照合不可'+CS.noref+'行');
LNAMES.forEach((n,i)=>app.scSet(n,'netRef',LEXP[i][2]));
CS=app.scoreCheckSum();
chk('3つとも正しく入れると16行すべて○', CS.ok===16&&CS.ng===0, '○'+CS.ok+' ×'+CS.ng);
console.log('  -- 打ち間違いを捕まえる --');
app.scSet(LNAMES[4],'hc',15.9);
CS=app.scoreCheckSum();
const cng=CS.rows.find(r=>r.st==='ng');
chk('HDCPを1つ間違えると×になる', CS.ng===1&&cng.n===LNAMES[4], cng?cng.n:'—');
chk('どれだけずれたかが分かる', Math.abs(cng.diff+0.3)<0.001, '差 '+cng.diff);
app.scSet(LNAMES[4],'hc',15.6);
app.scSet(LNAMES[7],'gross',150);
CS=app.scoreCheckSum();
chk('グロスを間違えても×になる', CS.ng===1&&CS.rows.find(r=>r.st==='ng').n===LNAMES[7]);
app.scSet(LNAMES[7],'gross',LEXP[7][0]);
app.scSet(LNAMES[2],'netRef',74.5);
CS=app.scoreCheckSum();
chk('ネットを間違えても×になる', CS.ng===1&&CS.rows.find(r=>r.st==='ng').n===LNAMES[2]);
app.scSet(LNAMES[2],'netRef',LEXP[2][2]);
chk('直せば16行すべて○に戻る', app.scoreCheckSum().ok===16);
console.log('  -- 順位の計算には使わない --');
chk('ネットはグロス−HDCPで出る（打った値は使わない）',
  app.standings().rows.find(r=>r.n===LNAMES[0]).net===73.8);
app.scSet(LNAMES[0],'netRef',99.9);
chk('照合用の値を変えても順位は動かない',
  app.standings().net[0].n===LNAMES[0]&&app.standings().net[0].net===73.8);
chk('ただし×になって気づける', app.scoreCheckSum().ng===1);
app.scSet(LNAMES[0],'netRef',73.8);
console.log('  -- 画面 --');
app.go('score');
chk('16行すべて一致と出る', /16行すべて一致しました/.test(store['pane'].innerHTML));
/* 段階5で列の名前をデザイン案に合わせて「検算」にした */
chk('検算の列がある', /<th class="c" style="width:64px">検算<\/th>/.test(store['pane'].innerHTML));
chk('○が16個並ぶ', (store['pane'].innerHTML.match(/>○</g)||[]).length===16,
    (store['pane'].innerHTML.match(/>○</g)||[]).length+'個');
app.scSet(LNAMES[3],'hc',1);
app.go('score');
chk('合わない行があると赤く知らせる', /1行が合いません/.test(store['pane'].innerHTML));
chk('×が出る', /&gt;×|>×</.test(store['pane'].innerHTML)||/×/.test(store['pane'].innerHTML));
app.scSet(LNAMES[3],'hc',LEXP[3][1]);
app.scSet(LNAMES[5],'gross','');
app.go('score');
chk('未入力が残っていると件数を知らせる', /あと <b>1行<\/b> が未入力/.test(store['pane'].innerHTML));

console.log('\n=== 氏名なしの貼り付け（数字だけ上から順に）===');
/* 集計表から数字だけを写す場合や、認識で氏名が落ちた場合。
   行数が出走者の数とそろっているときだけ、上から順に名簿へ当てる。
   並びを間違えると全員のスコアが入れ替わるので、当てた旨を強く知らせる。 */
freshSheet();
store['paste'].value=LEXP.map(e=>`${e[0]}\t${e[1].toFixed(1)}\t${e[2].toFixed(1)}`).join('\n');
app.pastePreview();
chk('16行すべて読み取れる', app.PVROWS.filter(r=>r.ok).length===16,
    app.PVROWS.filter(r=>r.ok).length+'行');
chk('16行を順番で名簿に当てた', app.PVBYORDER===16, app.PVBYORDER+'行');
let abad=[];
LNAMES.forEach((n,i)=>{const r=app.PVROWS[i];
  if(!r||r.name!==n||r.g!==LEXP[i][0]) abad.push(n);});
chk('上から順に正しく当たった', abad.length===0, abad.join(',')||'');
chk('並びを確かめる旨を強く出す', /必ず見比べてください/.test(store['pv'].innerHTML));
ALERTS=[]; app.pasteApply();
chk('16名ぶん取り込める', (ALERTS[0]||'').includes('16名ぶん'), ALERTS[0]);
chk('取り込み後に16行すべて○', app.scoreCheckSum().ok===16, '○'+app.scoreCheckSum().ok);
console.log('  -- 行数が合わないときは当てない --');
freshSheet();
store['paste'].value=LEXP.slice(0,10).map(e=>`${e[0]}\t${e[1].toFixed(1)}\t${e[2].toFixed(1)}`).join('\n');
app.pastePreview();
chk('10行だけなら順番で当てない', app.PVBYORDER===0, app.PVBYORDER+'行');
chk('1行も取り込ませない', app.PVROWS.filter(r=>r.ok).length===0);
console.log('  -- 氏名があるときは従来どおり --');
freshSheet();
store['paste'].value=LNAMES.map((n,i)=>
  `${i+1}\t${n}\t${LEXP[i][0]}\t${LEXP[i][1].toFixed(1)}\t${LEXP[i][2].toFixed(1)}`).join('\n');
app.pastePreview();
chk('16行○', app.PVROWS.filter(r=>r.ok).length===16);
chk('順番では当てていない', app.PVBYORDER===0);
app.pasteApply();
chk('16行すべて○', app.scoreCheckSum().ok===16);
chk('優勝は 川島　俊之', app.standings().net[0].n==='川島　俊之');
console.log('  -- 2つしか無い行は照合に使わない --');
freshSheet();
store['paste'].value=LNAMES.map((n,i)=>`${n}\t${LEXP[i][0]}\t${LEXP[i][2].toFixed(1)}`).join('\n');
app.pastePreview(); app.pasteApply();
chk('グロスとネットだけならHDCPは計算で出る',
  Math.abs(+app.scoreOf(LNAMES[0]).hc-7.2)<0.05, app.scoreOf(LNAMES[0]).hc);
chk('計算で補った行は照合の対象にしない（必ず一致してしまうため）',
  app.scoreCheckSum().noref===16, '照合不可'+app.scoreCheckSum().noref+'行');

console.log('\n合計 NG: '+ng);
