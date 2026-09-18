/* PWAとして成立しているかの検証（静的チェック） */
/* アプリの場所。テストと同じ場所の site/ を先に見て、無ければ ../docs/ を使う。
   リポジトリでは tests/ と docs/ が並ぶ構成なので、どちらでも動く */
const _P=require('path'),_F=require('fs');
const _DIR=[_P.join(__dirname,'site'),_P.join(__dirname,'..','docs')]
  .find(d=>_F.existsSync(_P.join(d,'pc.html')))||_P.join(__dirname,'site');
const APP={dir:_DIR+'/', get pc(){return this.dir+'pc.html'}, get scan(){return this.dir+'index.html'}};
const fs=require('fs');
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};
const R=f=>fs.readFileSync(APP.dir+f,'utf8');

console.log('=== 1. 必要なファイル ===');
['index.html','pc.html','sw.js','pc.webmanifest',
 'icon-192.png','icon-512.png','icon-512-maskable.png','apple-touch-icon.png','README.md']
 .forEach(f=>chk(f, fs.existsSync(APP.dir+f),
   fs.existsSync(APP.dir+f)?(fs.statSync(APP.dir+f).size/1024).toFixed(0)+'KB':'—'));
chk('配布物は10ファイル', fs.readdirSync(APP.dir).length===10, fs.readdirSync(APP.dir).length+'個');

console.log('\n=== 2. マニフェスト ===');
const pm=JSON.parse(R('pc.webmanifest'));
chk('name/short_name', !!pm.name&&!!pm.short_name, pm.short_name);
chk('HTMLとマニフェストの色が一致', pm.theme_color==='#081810', pm.theme_color);
chk('通信を伴う読み込みがない', !R('index.html').includes('fonts.googleapis')&&!R('pc.html').includes('fonts.googleapis'));
chk('start_url と scope', pm.start_url==='./pc.html'&&pm.scope==='./');
chk('standalone', pm.display==='standalone');
chk('192と512のアイコン', pm.icons.some(i=>i.sizes==='192x192')&&pm.icons.some(i=>i.sizes==='512x512'));
chk('maskableアイコン', pm.icons.some(i=>i.purpose==='maskable'));
chk('日本語指定', pm.lang==='ja');

console.log('\n=== 3. HTMLの宣言 ===');
{
  const h=R('pc.html');
  chk('pc.html: マニフェスト参照', h.includes('href="pc.webmanifest"'));
  chk('pc.html: theme-color', h.includes('name="theme-color" content="#081810"'));
  chk('pc.html: apple-touch-icon', h.includes('rel="apple-touch-icon"'));
  chk('pc.html: iOSのフルスクリーン', h.includes('apple-mobile-web-app-capable'));
  chk('pc.html: ホーム画面の名前', h.includes('content="CompeMasterPro"'));
  chk('pc.html: viewport-fit=cover（ノッチ対応）', h.includes('viewport-fit=cover'));
}

console.log('\n=== 4. サービスワーカー ===');
const sw=R('sw.js');
chk('install/activate/fetch がある', ['install','activate','fetch'].every(e=>sw.includes('"'+e+'"')));
chk('バージョン管理の定数', /const VER\s*=\s*"compe-v\d+"/.test(sw), (sw.match(/compe-v\d+/)||[''])[0]);
chk('全ファイルをキャッシュ', ['./index.html','./pc.html','./icon-192.png'].every(f=>sw.includes(f)));
chk('古いキャッシュを消す', sw.includes('caches.delete'));
chk('キャッシュ優先＋裏で更新', sw.includes('caches.match')&&sw.includes('c.put'));
chk('GET以外は素通し', sw.includes('req.method !== "GET"'));

console.log('\n=== 5. 登録の条件（file:// では動かさない）===');
const reg=R('pc.html');
chk('serviceWorkerの有無を確認', reg.includes('"serviceWorker" in navigator'));
chk('httpsまたはlocalhostのみ', reg.includes('location.protocol!=="https:"')&&reg.includes('localhost'));
chk('失敗しても無視', reg.includes('.catch(function(){})'));
chk('USBから file:// で開いても壊れない（登録を試みない）',
    /location\.protocol!=="https:"[\s\S]{0,120}return/.test(reg));

console.log('\n=== 6. 単体でも動くこと ===');
[['pc.html',['standings','calcK','buildSlides','MASTER','parseSheet','sheetColumns','scoreCheck']]]
 .forEach(([f,keys])=>{
  const h=R(f);
  const src=h.slice(h.indexOf('<script>')+8,h.lastIndexOf('</script>'));
  let e=null; try{ new Function(src); }catch(x){ e=x.message; }
  chk(f+': 構文', !e, e||'');
  keys.forEach(k=>chk(f+': '+k+' がある', src.includes(k)));
 });
chk('外部への通信がない', !R('index.html').match(/https?:\/\//)&&!R('pc.html').match(/https?:\/\//));

console.log('\n=== 7. 読み取りアプリを外した後の構成 ===');
/* 2026-09-04、写真からの読み取りは実用にならないと判断して開発を中止し、
   スマホ用アプリ（index.html）と専用アイコンを配布物から外した。
   Pages のトップが 404 にならないよう、index.html は pc.html への転送ページに置き換えてある。 */
const idx=R('index.html');
chk('index.html は転送ページ', /url=\.\/pc\.html/.test(idx)&&idx.length<3000,
    idx.length+'文字');
chk('開くと pc.html に移る', /location\.replace\("\.\/pc\.html"\)/.test(idx));
/* トップのURLから「ホーム画面に追加」しても、ただのブックマークではなく
   運営システムのアプリになること。マニフェストが無いと web clip になり、
   追加した時点のURLがそのまま焼き付く（2026-09-08、ホーム画面のアプリが
   404を出す原因の候補になった） */
chk('転送ページにマニフェストの指定がある', /rel="manifest" href="pc\.webmanifest"/.test(idx));
/* ---- 404ページ ----
   ホーム画面のアイコンは追加した瞬間のURLを覚える。404だった時期に追加すると
   以後ずっとそのURLを開きに行き、404のままになる（2026-09-08に実際に起きた）。
   GitHub Pages は存在しないパスに 404.html を返すので、そこから本体へ送れば
   どのURLで固定されていても復帰できる。 */
chk('404ページがある', fs.existsSync(APP.dir+'404.html'));
if(fs.existsSync(APP.dir+'404.html')){
  const e4=R('404.html');
  chk('404ページから本体へ送る', /location\.replace\("\/CompeMasterPro\/pc\.html"\)/.test(e4));
  chk('404ページのリンクは絶対パス（どの階層から開かれても効く）',
      !/(?:href|src)="\.\//.test(e4)&&/href="\/CompeMasterPro\//.test(e4),
      (e4.match(/(?:href|src)="\.\/[^"]*/g)||[]).join(',')||'相対パスなし');
  chk('404ページにもマニフェストの指定がある', /rel="manifest"/.test(e4));
  chk('アイコンを入れ直す案内が書いてある', /削除し/.test(e4)&&/追加し直す/.test(e4));
  chk('404ページは軽い', e4.length<3000, e4.length+'文字');
}
chk('転送ページにホーム画面用の宣言がある',
    /apple-mobile-web-app-capable/.test(idx)&&/apple-mobile-web-app-title/.test(idx));
chk('マニフェストの start_url は本体', JSON.parse(R('pc.webmanifest')).start_url==='./pc.html');
/* 通信できないときに何も返せないと、iOSでは404のような画面になる。
   本体→転送ページの順に逃げ道を用意しておく */
chk('オフラインの逃げ道が本体まで用意されている', /caches\.match\("\.\/pc\.html"\)/.test(sw));
chk('マニフェストは1つだけ', !fs.existsSync(APP.dir+'manifest.webmanifest'));
chk('読み取りアプリ専用のアイコンが残っていない',
    ['scan-192.png','scan-512.png','scan-512-maskable.png','scan-apple-touch.png']
      .every(f=>!fs.existsSync(APP.dir+f)));
const srcs=pm.icons.map(i=>i.src);
srcs.forEach(f=>chk('アイコンの実体がある: '+f, fs.existsSync(APP.dir+f),
    fs.existsSync(APP.dir+f)?(fs.statSync(APP.dir+f).size/1024).toFixed(0)+'KB':'—'));
chk('サービスワーカーが読み取りアプリを掴んでいない',
    !/scan-|manifest\.webmanifest/.test(sw), (sw.match(/scan-[a-z0-9.-]+/g)||[]).join(',')||'もれなし');
chk('キャッシュ対象が実在する',
    (sw.match(/"\.\/([^"]+)"/g)||[]).map(x=>x.slice(3,-1)).filter(Boolean)
      .every(f=>fs.existsSync(APP.dir+f)),
    (sw.match(/"\.\/([^"]+)"/g)||[]).map(x=>x.slice(3,-1)).filter(f=>f&&!fs.existsSync(APP.dir+f)).join(',')||'すべて実在');
chk('PC側に読み取りアプリの受け渡しが残っていない',
    !/scanLoad|scanFill|SCANPEND|golfCompeScan/.test(R('pc.html')));
/* 2026-09-08、ボタンだけ消してカードの枠と説明文が残っていた。
   画面に「スマホ・タブレットで読み取ったデータ」の見出しが出たままで、
   中身が空という状態だった。文言まで含めて消えているかを見張る。 */
{
  const pcs=R('pc.html');
  const leftover=['読み取り専用アプリ','スマホ・タブレットで読み取った','スマホ版で「コピー」',
                  '読み取りファイル','コンペ読み取り','スマホ・タブレット用']
    .filter(k=>pcs.includes(k));
  chk('読み取りアプリの文言が残っていない', leftover.length===0, leftover.join('、')||'なし');
  /* 中身の無いカードが残っていないか。ボタンを消したあとの抜け殻を拾う */
  const empty=(pcs.match(/<div class="row">\s*<\/div>/g)||[]).length;
  chk('中身の無い操作欄が残っていない', empty===0, empty+'件');
  /* サンプルの説明が実際の中身と合っているか */
  /* サンプルは①ふつうの大会・②つまずきやすい大会の2種。
     説明が実物と食い違うと、どちらを押せばよいか分からなくなる */
  chk('サンプルが2種ある', /onclick="sample\(\)"/.test(pcs)&&/onclick="sampleHard\(\)"/.test(pcs));
  chk('①の説明が実際の規模と合っている',
      /16名・8組8枠/.test(pcs)&&/馬券100口・GTO50口/.test(pcs),
      (pcs.match(/<b>サンプル①<\/b>[^<]{0,40}/)||['見つからない'])[0]);
  chk('②の説明につまずきやすい形が並んでいる',
      ['同ネット','同グロス','得票が並ぶ','欠席者','無効になる口','該当者のいない','ノーカード']
        .every(k=>pcs.includes(k)),
      ['同ネット','同グロス','得票が並ぶ','欠席者','無効になる口','該当者のいない','ノーカード']
        .filter(k=>!pcs.includes(k)).join('、')||'すべてあり');
}

console.log('\n=== 8. 配布手順書 ===');
const rd=R('README.md');
/* 来年これを読むのは本人。書いてあることが実物と食い違っていると害になる */
[['置き場所の案内','GitHub Pages'],
 ['SharePointが使えないこと','SharePointやOneDriveでは使えません'],
 ['USBで直接配る方法','USB'],
 ['アプリストアは不要','アプリストアに出すことは考えなくてよい'],
 ['更新時にVERを上げること','const VER'],
 ['読み取りアプリを廃止したこと','読み取りアプリは 2026-09-04 に廃止'],
 ['打ち込んで検算する正規手順','グロス − HDCP ＝ ネット'],
 ['PDFを頼む必要はないこと（打ち込みの検算で足りる。9/18に決定）','ゴルフ場にPDFなど別の形式を頼む必要はありません'],
 ['氏名を省略できること','氏名は省略できます'],
 ['公開前にprivacy.jsを通すこと','privacy.js'],
 ['非公開にするとPagesが止まること','無料プランでは Pages が止まります'],
 ['アイコンを入れ直す必要があること','削除して、追加し直して'],
].forEach(([l,k])=>chk('README: '+l, rd.includes(k), rd.includes(k)?'':'「'+k+'」が無い'));
/* README に書いた版番号が sw.js と食い違っていないか。ここは必ず古くなる */
const swVer=(sw.match(/compe-v\d+/)||[])[0];
chk('READMEの版番号が sw.js と一致', rd.includes(swVer),
    'sw.js は '+swVer+(rd.match(/compe-v\d+/)?'／READMEは '+rd.match(/compe-v\d+/)[0]:'／READMEに記載なし'));
chk('READMEの配布物の数が実物と一致',
    rd.includes('全部で'+fs.readdirSync(APP.dir).length+'ファイル'),
    fs.readdirSync(APP.dir).length+'ファイル');
console.log('\n=== 9. リポジトリの入口（README.md・HANDOVER.md）===');
/* 2026-09-04、別の環境で作業を再開できるようにリポジトリを整えた。
   ナレッジが空のClaudeでも、ここから必要なものを全部たどれることが要件。 */
const _ROOT=[_P.join(APP.dir,'..'),_P.join(__dirname,'..'),__dirname]
  .find(d=>_F.existsSync(_P.join(d,'CONTRIBUTING.md')));
if(!_ROOT){
  console.log('  --  リポジトリの文書が無いので飛ばします（配布物だけの構成）');
}else{
  const RD=f=>_F.readFileSync(_P.join(_ROOT,f),'utf8');
  chk('トップに README.md がある', _F.existsSync(_P.join(_ROOT,'README.md')));
  chk('HANDOVER.md がある', _F.existsSync(_P.join(_ROOT,'HANDOVER.md')));
  const rt=RD('README.md');
  chk('新しいチャットへ送る一文がある', rt.includes('開発の続きです'));
  chk('raw のURLが載っている', rt.includes('raw.githubusercontent.com'));
  chk('3つの文書の読み分けが書いてある',
      ['HANDOVER.md','CONTRIBUTING.md','docs/README.md'].every(k=>rt.includes(k)));
  chk('公開前に privacy.js を通す旨', rt.includes('node privacy.js'));
  chk('氏名が架空である旨', rt.includes('架空のものに置き換えて'));
  /* テストの本数と項目数が実物と合っているか。ここは必ず古くなる */
  const files=_F.readdirSync(_P.join(_ROOT,'tests')).filter(f=>f.endsWith('.js'));
  chk('READMEのテスト本数が実物と一致', rt.includes(files.length+'本'), files.length+'本');
  const hv=RD('HANDOVER.md');
  /* 実名の一覧をここに書いてはいけない。テスト自体が実名の一覧になってしまう
     （2026-09-04、いったんそう書いてしまい公開リポジトリに載せた）。
     privacy.js と同じ考え方で、「架空の名簿に載っている姓しか出てこないこと」を
     positive に確かめる。架空名はリポジトリの各所にあるので書いてよい */
  const FAKESUR=["川島","相沢","瀬川","森","三村","江木","白石","及川",
                 "邊見","大隈","甲斐","千葉","木南","郷司","内海"];
  /* 「大隈3,000・相沢1,000」のように、氏名のすぐ後ろに金額が続く形を拾う。
     2文字以上に限れば「95口・19,000円」の「口」は入らない */
  /* 「大隈3,000・相沢1,000」の形だけを拾う。表の見出しなどに現れる
     「罰金 5,000円」を氏名と取り違えないよう、間に空白が無いものに限る */
  const money=[...new Set((hv.match(/[一-龥]{2,4}(?=[0-9]{1,3},[0-9]{3})/g)||[]))]
    /* 賞の名前や費目は氏名ではない。増えたら足す */
    .filter(w=>!['罰金','賞金','会費','合計','売上','配当','経費','小計','原資',
                 '優勝','順位賞','技能賞','団体賞','抽選賞','徴収','預かり',
                 'プレー代','宿泊代','車代','総額'].includes(w));
  /* 何も拾えないと素通ししてしまうので、拾えていること自体も確かめる */
  chk('罰金の内訳から氏名を拾えている', money.length>=3, money.join('、')||'拾えていない');
  chk('金額のそばに出る氏名が架空の名簿の範囲内',
      money.length>0&&money.every(n=>FAKESUR.some(f=>n.includes(f))),
      money.filter(n=>!FAKESUR.some(f=>n.includes(f))).join('、')||'すべて架空');
  chk('会場名を伏せてある', !hv.includes('カントリー倶楽部')||hv.includes('（実在のコース）'),
      hv.includes('（実在のコース）')?'伏せ字あり':'');
  chk('HANDOVERに架空である断りがある', hv.includes('架空のものに置き換えて'));
  chk('検証スイートMDを重ねて置いていない',
      !_F.existsSync(_P.join(_ROOT,'CompeMasterPro_検証スイート_1ファイル版.md')),
      'tests/ と重複するため');
}

console.log('\n=== 10. 開発の手引き（CONTRIBUTING.md）===');
/* 2026-09-04、リポジトリを公開して他のアカウントでも開発できる状態にした。
   手引きの記述が実物と食い違うと、引き継いだ人が迷う。ここで見張る。
   リポジトリでは tests/ と docs/ が並び、CONTRIBUTING.md はその親にある。 */
const _CTB=[_P.join(APP.dir,'..','CONTRIBUTING.md'),_P.join(__dirname,'..','CONTRIBUTING.md'),
            _P.join(__dirname,'CONTRIBUTING.md')].find(f=>_F.existsSync(f));
if(!_CTB){
  console.log('  --  CONTRIBUTING.md が見つからないので飛ばします（配布物だけの構成）');
}else{
  const cb=_F.readFileSync(_CTB,'utf8');
  const swVer2=(sw.match(/compe-v\d+/)||[])[0];
  chk('版番号が sw.js と一致', cb.includes(swVer2),
      'sw.js は '+swVer2+(cb.match(/compe-v\d+/)?'／手引きは '+cb.match(/compe-v\d+/)[0]:'／記載なし'));
  chk('配布物の説明が実物と合う',
      ['pc.html','index.html','sw.js','pc.webmanifest','README.md']
        .every(k=>cb.includes(k)));
  [['変えてはいけない決めごと','変えてはいけない決めごと'],
   ['過去の落とし穴','過去に踏んだ落とし穴'],
   ['公開前の検査','node privacy.js'],
   ['VERを上げる手順','VER` を変えないと'],
   ['単一ファイルの原則','外部ライブラリもCDNもゼロ'],
   ['非公開にするとPagesが止まること','無料プランでは Pages が止まります'],
   ['テストの書き方の約束','再現テストを足す'],
   ['落ちないテストは無意味','落ちないテストは無意味'],
   ['氏名が架空である旨','氏名は架空のものに置き換えて'],
   ['用語の説明','ダブルペリア'],
  ].forEach(([l,k])=>chk('手引き: '+l, cb.includes(k), cb.includes(k)?'':'「'+k+'」が無い'));
  /* 実名が混ざっていないか。手引きは公開リポジトリに載る */
  chk('実在の生年月日らしい記述が無い',
      !/19[3-8]\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])/.test(cb),
      (cb.match(/19[3-8]\d-\d\d?-\d\d?/g)||[]).join(',')||'なし');
}

console.log('\n合計 NG: '+ng);
