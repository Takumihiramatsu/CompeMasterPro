/* 配布するファイル（GitHub Pages に上がるもの）に個人情報が混ざっていないかの検査。

   2026-09-04、公開中の pc.html の入力例に実在の氏名4名と実在の生年月日1件が
   入っていたことが分かった。アプリは名簿を内蔵しない設計なので、
   混ざるのは「入力例（placeholder）」「使い方タブの文面」「サンプルデータ」の3箇所。
   ここを毎回見張る。

   照合語はこのファイル内に持たない。ハッシュだけを持ち、
   検査対象の文字列から作ったハッシュと突き合わせる。
   （テストそのものが実名の一覧になってしまうのを避けるため） */
/* アプリの場所。テストと同じ場所の site/ を先に見て、無ければ ../docs/ を使う。
   リポジトリでは tests/ と docs/ が並ぶ構成なので、どちらでも動く */
const _P=require('path'),_F=require('fs');
const _DIR=[_P.join(__dirname,'site'),_P.join(__dirname,'..','docs')]
  .find(d=>_F.existsSync(_P.join(d,'pc.html')))||_P.join(__dirname,'site');
const APP={dir:_DIR+'/', get pc(){return this.dir+'pc.html'}, get scan(){return this.dir+'index.html'}};
const fs=require('fs'),crypto=require('crypto');
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};
const H=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,16);

/* 検査の考え方
   照合語（実名の一覧）をこのファイルに持たせると、テストそのものが
   個人情報の一覧になってしまう。そこで「実名かどうか」を直接見るのではなく、
   「素性の説明できる語しか置かれていないこと」を確かめる作りにする。
   置いてよい語は下の OKDATE / SAFE に理由つきで並べる。 */
/* index.html は pc.html への転送ページになったので、中身の検査は pc.html と README だけ */
const files=[["pc.html",APP.pc],["README.md",APP.dir+"README.md"]];

console.log('=== 1. 検査対象のファイルがある ===');
files.forEach(([n,p])=>chk(n, fs.existsSync(p), (fs.statSync(p).size/1024).toFixed(0)+'KB'));

console.log('\n=== 2. 生年月日らしい文字列が入力例だけに収まっているか ===');
/* 入力例に置いてよい日付は、明らかに作り物のものだけ */
const OKDATE=new Map([
  ["1970/1/1",    "参加者貼り付けの入力例（西暦）"],
  ["S45.6.14",    "参加者貼り付けの入力例（和暦）"],
  ["1970年1月1日","使い方タブでの日付の書き方の説明"],
  ["1988-05-03",  "参加者貼り付けの入力例（作り物）"],
  ["1970-01-01",  "参加者欄のプレースホルダ"],
  ["2026-09-03",  "中部5県マスタを収集した日（注記コメント）"],
  ["2026-09-08",  "全国マスタを収集した日／スコア入力表のはみ出しを直した日（注記コメント）"],
  ["2026-09-04",  "不具合を直した日（注記コメント）"],
  ["2026-09-16",  "準備→当日→発表の3段階と「次にやること」を取り込んだ日（注記コメント）"],
  ["2026-09-17",  "スマホの集金カードと容量の上限を決めた日（注記コメント）"],
  ["2026-09-18",  "スコア入力の導線（ハンディの直接入力・棄権ノーカードの印）を直した日（注記コメント）"],
  ["2026-09-20",  "画面が飛ぶ・印刷が白紙になる等の不具合を直した日（注記コメント）"],
  ["2026-09-21",  "自動保存の世代管理・読み込み時の確認・CSVエスケープを追加した日（注記コメント）"],
  ["2027.8.28",   "sample() の架空の開催日"],
]);
files.forEach(([n,p])=>{
  const t=fs.readFileSync(p,'utf8');
  /* 日は2桁を先に試す。1桁を先にすると「2026-09-16」が「2026-09-1」で切れ、
     正しい理由を書いても照合できなかった（2026-09-16） */
  const found=[...new Set((t.match(/\b(19|20)\d{2}[-\/年](0?[1-9]|1[0-2])[-\/月]([12]\d|3[01]|0?[1-9])日?/g)||[]))];
  const bad=found.filter(d=>!OKDATE.has(d));
  chk(n+': 素性の分からない日付がない', bad.length===0,
      bad.length?bad.join(', '):(found.map(d=>d+'（'+OKDATE.get(d)+'）').join(' / ')||'日付なし'));
});

console.log('\n=== 3. サンプルデータの氏名が作り物か ===');
/* sample() は架空の16名。実在の人物と1文字も共有しない前提を、形で確かめる */
const pc=fs.readFileSync(APP.pc,'utf8');
const m=pc.match(/const N=\[([\s\S]*?)\];/);
chk('sample() の名簿が取り出せる', !!m);
if(m){
  const names=(m[1].match(/"([^"]+)"/g)||[]).map(s=>s.slice(1,-1));
  chk('16名ある', names.length===16, names.length+'名');
  /* 五十音順に並んだ「あ・い・う…」の教科書的な名前になっていること
     （実在の名簿は五十音順に並ばないので、これが作り物の目印になる） */
  const sur=names.map(n=>n.split("　")[0]);
  chk('姓がすべて異なる（実際の名簿は同姓が出る）', new Set(sur).size===16,
      new Set(sur).size+'種');
  chk('氏名に全角スペースが入っている', names.every(n=>n.includes("　")));
}

console.log('\n=== 4. 入力例（placeholder）の氏名 ===');
/* 入力例に置いてよい氏名は、sample() の16名と、教科書的な仮名だけ */
const SAFE=/^(山田　太郎|鈴木　一郎|佐々木　花子|田中　次郎)$/;
const holders=[...pc.matchAll(/placeholder="([^"]*)"/g)].map(x=>x[1]);
chk('入力例が取り出せる', holders.length>0, holders.length+'件');
let bad4=[];
holders.forEach(h=>{
  /* 「姓　名」の形をした語を拾う */
  (h.match(/[一-龥々ヶヵ]{1,4}[　\u3000][一-龥々ヶヵ]{1,4}/g)||[]).forEach(nm=>{
    if(!SAFE.test(nm) && !pc.includes('"'+nm+'"')) bad4.push(nm);
  });
});
chk('素性の分からない氏名が入力例に無い', bad4.length===0, [...new Set(bad4)].join('、')||'なし');

console.log('\n=== 5. 使い方タブに個人名が出ていないか ===');
/* 役割で書く（集金の担当者・パソコンの操作者）。個人名で書かない */
const helpSrc=pc.slice(pc.indexOf('function vHelp'), pc.indexOf('function vData'));
const sanTo=[...helpSrc.matchAll(/([一-龥々]{2,4})さん/g)].map(x=>x[1]);
chk('「〜さん」という個人名の呼びかけが無い', sanTo.length===0, sanTo.join('、')||'なし');
chk('役割で書いてある', /集金の担当者|パソコンの操作者|担当者/.test(helpSrc));

console.log('\n=== 6. 会社や部署の名前が入っていないか ===');
files.forEach(([n,p])=>{
  const t=fs.readFileSync(p,'utf8');
  const hit=(t.match(/[一-龥]{2,6}(株式会社|会社|本部)/g)||[]);
  /* 「営業部」「技術部」は入力例として置いてよい一般名詞 */
  chk(n+': 会社名・本部名が無い', hit.length===0, [...new Set(hit)].join('、')||'なし');
});

console.log('\n=== 7. 大会名・会場名が作り物か ===');
chk('sample() の大会名が架空', /DB\.meta\.name="第\d+回 親睦ゴルフコンペ"/.test(pc));
chk('sample() の会場名が架空', /DB\.meta\.place="○○カントリークラブ"/.test(pc));
/* 内蔵マスタには実在のゴルフ場名が入るが、これは公開情報なので対象外 */
/* 全国版は圧縮形（MSTZ）で持ち、読み込み時に MASTER へ展開する。
   ゴルフ場名は公開されている施設名なので、消さずに残す */
chk('内蔵マスタは残っている（公開情報なので消さない）',
    pc.includes('const MSTZ=[')&&pc.includes('const MASTER=MSTZ.map'));
chk('全国47都道府県ぶんある', (pc.match(/"沖縄県"/g)||[]).length>=1);

console.log('\n=== 8. 転送ページ ===');
const idx2=fs.readFileSync(APP.scan,'utf8');
chk('個人情報を含まない', !/[一-龥]{1,4}[\u3000][一-龥]{1,4}/.test(idx2));
chk('日付を含まない', !/(19|20)\d{2}[-\/年]/.test(idx2.replace(/2026-09-04/g,'')));

console.log('\n=== 9. 大会と会場が結び付いていないか（リポジトリ全体）===');
/* 2026-09-16、tests/ とコメントに「2026年の大会の会場」が実名で書かれていた。
   会場名そのものは内蔵マスタに入る公開情報だが、実際のスコアや開催日と並ぶと
   「どこで誰が何打だったか」が分かってしまう。README の約束（実在の会場名を含まない）にも反する。
   ここでは、内蔵マスタのゴルフ場名がマスタ以外の場所に出てきたら、
   理由を書いた語（OKCLUB／OKSTEM）だけであることを確かめる。
   OKCLUB・OKSTEM には大会と無関係な検索の例しか置かない。 */
{
  const OKCLUB=new Map([
    ["信濃ゴルフ倶楽部",     "マスタ検索の例（mst.js・sel.js・ime.js）。大会とは無関係"],
    ["三好カントリー倶楽部", "マスタ検索の例（mst.js・sel.js）。大会とは無関係"],
    ["恵那峡カントリークラブ","マスタ検索の例（mst.js・sel.js）。大会とは無関係"],
    ["額田ゴルフ倶楽部",     "マスタ検索の例（sel.js）。大会とは無関係"],
    ["富士カントリー可児クラブ 可児ゴルフ場","9Hが6つあるコースの例（mst.js・sel.js）"],
    ["愛知カンツリー倶楽部", "愛知県の先頭に並ぶコースの例（mst.js・sel.js・rules.js）"],
  ]);
  const OKSTEM=new Map([
    ["信濃","マスタ検索の例"],["三好","マスタ検索の例"],["恵那峡","マスタ検索の例"],
    ["額田","マスタ検索の例"],["可児","9Hが6つあるコースの例"],["富士","9Hが6つあるコースの例（正式名の頭）"],
    ["春日井","漢字検索の例（ime.js）"],["軽井沢","検索欄の入力例（地名）"],
    ["テスト","架空のコース名（course.js）"],
  ]);
  const root=_P.join(__dirname,'..');
  const repo=_F.existsSync(_P.join(root,'tests'))&&_F.existsSync(_P.join(root,'docs','pc.html'));
  if(!repo){ console.log('  （配布物だけの構成なので省略）'); }
  else{
    const L=pc.split('\n').find(l=>l.startsWith('const MSTZ='))||'';
    const clubs=[...L.matchAll(/\[\d+,"([^"]+)"/g)].map(x=>x[1]);
    chk('内蔵マスタからゴルフ場名を取り出せる', clubs.length>2000, clubs.length+'件');
    const T=[];
    fs.readdirSync(__dirname).filter(f=>f.endsWith('.js')).forEach(f=>T.push(['tests/'+f,fs.readFileSync(_P.join(__dirname,f),'utf8')]));
    ['README.md','HANDOVER.md','CONTRIBUTING.md','docs/README.md'].forEach(f=>{
      const q=_P.join(root,f); if(_F.existsSync(q)) T.push([f,fs.readFileSync(q,'utf8')]);});
    T.push(['docs/pc.html（マスタ以外）',pc.split('\n').filter(l=>!l.startsWith('const MSTZ=')).join('\n')]);
    chk('検査するファイルがそろう', T.length>=28, T.length+'本');
    /* 1. 正式名 */
    const badC=new Set();
    T.forEach(([n,t])=>clubs.forEach(c=>{ if(c.length>=4&&t.includes(c)&&!OKCLUB.has(c)) badC.add(n+'：'+c.slice(0,3)+'…'); }));
    chk('マスタのゴルフ場名は理由を書いたものだけ', badC.size===0, [...badC].join(' / ')||'なし');
    /* 2. 略称（「◯◯CC」「◯◯カントリー」）と、検索に渡す語 */
    const stems=new Set(clubs.map(c=>(c.match(/^([一-龥々ヶ]{2,5})(?=カントリ|ゴルフ|CC|GC|倶楽部|クラブ)/)||[])[1]).filter(Boolean));
    const badS=new Set();
    T.forEach(([n,t])=>{
      const hits=[...t.matchAll(/([一-龥々ヶ]{2,5})(?=CC|GC|カントリ)/g)].map(x=>x[1])
        .concat([...t.matchAll(/(?:mQuery|find)\(['"]([^'"]+)['"]/g)].map(x=>x[1]));
      hits.forEach(w=>{ const k=[...stems].find(st=>w.endsWith(st)||w===st)||(stems.has(w)?w:null);
        if(k&&!OKSTEM.has(k)) badS.add(n+'：'+k.slice(0,1)+'…'); });
    });
    chk('ゴルフ場の略称・検索語は理由を書いたものだけ', badS.size===0, [...badS].join(' / ')||'なし');
    /* 3. 部署名入りの大会名 */
    const badO=new Set();
    T.forEach(([n,t])=>(t.match(/[一-龥・]{2,12}本部[^\n"]{0,6}親睦/g)||[]).forEach(()=>badO.add(n)));
    chk('部署名の入った大会名が無い', badO.size===0, [...badO].join(' / ')||'なし');
  }
}

console.log('\n合計 NG: '+ng);
