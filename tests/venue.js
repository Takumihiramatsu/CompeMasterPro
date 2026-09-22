/* ゴルフ場専用版（venue-config）のテスト。
   共有エンジン（docs/pc.html）は VENUE_CONFIG が無ければ従来どおり動くこと、
   VENUE_CONFIG がある場合はブランディング・自動保存キー・既定コースが
   正しく切り替わることを確かめる。ビルドスクリプト（tools/build-venue.js）が
   実際に正しい埋め込みを行うことも合わせて確認する。 */
const _P = require('path'), _F = require('fs'), _CP = require('child_process');
const _DIR = [_P.join(__dirname, 'site'), _P.join(__dirname, '..', 'docs')]
  .find(d => _F.existsSync(_P.join(d, 'pc.html'))) || _P.join(__dirname, 'site');
const ROOT = _P.join(__dirname, '..');
const PC_PATH = _P.join(_DIR, 'pc.html');
const h = _F.readFileSync(PC_PATH, 'utf8');
const src = h.slice(h.indexOf('<script>', h.indexOf('venueConfig')) + 8, h.lastIndexOf('</script>'));

const ok = (l, c, x = '') => console.log((c ? '  OK  ' : '  NG  ') + l + (x ? '  ' + x : ''));
let n = 0, okc = 0;
const T = (l, c, x) => { n++; if (c) okc++; ok(l, c, x); };

console.log('\n=== venue.js：ゴルフ場専用版（venue-config） ===\n');

console.log('--- 1. 共有エンジンの構造（静的チェック） ---');
T('venueConfig の差し込み位置が既定でnull（汎用動作）', h.includes('<script id="venueConfig">window.VENUE_CONFIG = null;</script>'));
T('LSKEY はVENUE_CONFIG.slugがあれば末尾に付く', /const LSKEY="golfCompe\.autosave\.v2"\+\(window\.VENUE_CONFIG&&window\.VENUE_CONFIG\.slug\?/.test(h));
T('CRSの既定コースはVENUE_CONFIG.courseIdから決まる', /if\(window\.VENUE_CONFIG&&window\.VENUE_CONFIG\.courseId\)\{/.test(h));
T('applyVenueBrandingがboot()の先頭で呼ばれる', /\(function boot\(\)\{\s*applyVenueBranding\(\);/.test(h));
T('ヘッダーのブランド表示にid="brandMark"がある', h.includes('<span class="cmark" id="brandMark">'));

function buildApp(venueConfig) {
  const store = {};
  const mk = id => ({
    id, value: '', textContent: '', className: '', checked: false, style: {}, files: [],
    _html: '', get innerHTML() { return this._html }, set innerHTML(v) { this._html = v },
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], insertAdjacentHTML() {}, click() {}, focus() {}
  });
  const setProps = {};
  const doc = {
    title: '',
    documentElement: { style: { setProperty(k, v) { setProps[k] = v; } }, requestFullscreen() {} },
    body: { className: '', classList: { add() {}, remove() {}, contains: () => false } },
    getElementById: id => store[id] || (store[id] = mk(id)),
    querySelectorAll: () => [], addEventListener() {}, createElement: () => mk('a')
  };
  global.document = doc;
  global.window = { AudioContext: function () { throw 0 }, addEventListener() {}, VENUE_CONFIG: venueConfig || null };
  const _t = []; global.setTimeout = f => { _t.push(f); return 1 }; global.flush = () => _t.splice(0).forEach(f => { try { f() } catch (e) {} });
  global.setInterval = () => 1; global.clearInterval = () => {}; global.clearTimeout = () => {};
  global.performance = { now: () => 0 }; global.requestAnimationFrame = () => {}; global.alert = () => {}; global.confirm = () => true;
  global.URL = { createObjectURL: () => '', revokeObjectURL() {} }; global.Blob = class {};
  global.localStorage = { setItem() {}, getItem() { return null }, removeItem() {} };
  ['show', 'hud', 'dots', 'tabs', 'saveState', 'hdTitle', 'pane', 'sndBtn'].forEach(id => { global[id] = doc.getElementById(id) });
  const app = new Function(src + `;return {LSKEY,get CRS(){return CRS},applyVenueBranding};`)();
  return { app, doc, store, setProps };
}

console.log('\n--- 2. VENUE_CONFIGが無い場合（従来どおり） ---');
{
  const { app, doc, store } = buildApp(null);
  T('自動保存キーは従来どおり', app.LSKEY === 'golfCompe.autosave.v2', app.LSKEY);
  T('既定コースは未選択のまま', app.CRS.club === '');
  app.applyVenueBranding();
  T('タイトルを書き換えない', doc.title === '');
  T('ブランド表示を書き換えない', store.brandMark === undefined || store.brandMark._html === '');
}

console.log('\n--- 3. VENUE_CONFIGがある場合（ゴルフ場専用版） ---');
{
  const cfg = { slug: 'test-cc', name: 'テストカントリークラブ', courseId: 'ダミーコース', courseFrontIdx: 2, courseBackIdx: 3, themeColor: '#112233' };
  const { app, doc, store, setProps } = buildApp(cfg);
  T('自動保存キーがslugで分離される', app.LSKEY === 'golfCompe.autosave.v2.test-cc', app.LSKEY);
  T('前半9Hの既定インデックスが反映される', app.CRS.a === 2);
  T('後半9Hの既定インデックスが反映される', app.CRS.b === 3);
  app.applyVenueBranding();
  T('タイトルにゴルフ場名が入る', doc.title === 'テストカントリークラブ｜CompeMaster Pro', doc.title);
  T('ヘッダーのブランド表示がゴルフ場名になる', store.brandMark.innerHTML.includes('テストカントリークラブ'), store.brandMark.innerHTML);
  T('テーマカラーがCSS変数に反映される', setProps['--brass'] === '#112233');
}

console.log('\n--- 4. ロゴURLがある場合はimgタグになる ---');
{
  const cfg = { slug: 'logo-cc', name: 'ロゴのあるゴルフ場', logoUrl: 'https://example.com/logo.png' };
  const { app, store } = buildApp(cfg);
  app.applyVenueBranding();
  T('ロゴのimgタグが入る', store.brandMark.innerHTML.includes('<img src="https://example.com/logo.png"'), store.brandMark.innerHTML);
}

console.log('\n--- 5. ビルドスクリプト（tools/build-venue.js）の実結果 ---');
{
  const tmpCfgDir = _P.join(__dirname, '_tmp_venue_test');
  _F.mkdirSync(tmpCfgDir, { recursive: true });
  const cfgFile = _P.join(tmpCfgDir, 'build-test-cc.json');
  const distDir = _P.join(ROOT, 'dist', 'build-test-cc');
  _F.writeFileSync(cfgFile, JSON.stringify({ slug: 'build-test-cc', name: 'ビルド確認ゴルフ倶楽部' }), 'utf8');
  try {
    _CP.execFileSync('node', [_P.join(ROOT, 'tools', 'build-venue.js'), cfgFile], { cwd: ROOT, stdio: 'pipe' });
    const built = _F.existsSync(_P.join(distDir, 'pc.html')) ? _F.readFileSync(_P.join(distDir, 'pc.html'), 'utf8') : '';
    T('dist/にpc.htmlが生成される', built.length > 0);
    T('生成物にプレースホルダが残っていない', !built.includes('window.VENUE_CONFIG = null;'));
    T('生成物にゴルフ場名が埋め込まれる', built.includes('"name":"ビルド確認ゴルフ倶楽部"'));
    T('index.html（転送ページ）が生成される', _F.existsSync(_P.join(distDir, 'index.html')));
    T('sw.jsがコピーされる', _F.existsSync(_P.join(distDir, 'sw.js')));
    T('pc.webmanifestにゴルフ場名が反映される', (() => {
      const mf = JSON.parse(_F.readFileSync(_P.join(distDir, 'pc.webmanifest'), 'utf8'));
      return mf.name.includes('ビルド確認ゴルフ倶楽部');
    })());
  } finally {
    _F.rmSync(tmpCfgDir, { recursive: true, force: true });
    _F.rmSync(distDir, { recursive: true, force: true });
  }
}

console.log(`\n合計 ${n}件中 ${okc}件OK`);
if (okc !== n) { console.log(`NG ${n - okc}件`); process.exitCode = 1; }
