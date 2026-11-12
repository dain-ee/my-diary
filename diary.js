/* 정윤 다이어리 (2026-11-12 시작, 11-13 아이패드 펼침으로 다시 만듦)
   · 책: 표지 → 면지 · 목차(한 해 달력) → 주마다 두 쪽(왼쪽: 달력 칸 + 요일마다 한 것 / 오른쪽: 한 것 정리 + 내 일기 · 고민) → 일기 모음 · 고민 모음 → 사진 · 설정
   · 가로(아이패드)는 두 쪽 펼침, 세로는 한 쪽. 옆 인덱스 탭이나 목차로 멀리 뛸 때만 여러 장이 촤라락 넘어가요.
   · 「한 것」은 말랑대학 기록을 읽기만 해요 (univ_get). 말랑대학 기록에는 아무것도 쓰지 않아요.
   · 손글씨는 정윤이 직접 쓴 글에만. 나머지는 인쇄체.
   · 일기 · 고민 · 스티커는 이 기기에 먼저 저장하고, 서버(diary_get/diary_put)가 있으면 암호로 잠가 올려요. */
(() => {
  'use strict';
  const CFG = window.DIARY_CFG || {}, STK = window.STK, ORDER = window.STK_ORDER;
  const $ = (s, el) => (el || document).querySelector(s), $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const dt = (s) => new Date(s + 'T00:00:00');
  const addD = (s, n) => { const d = dt(s); d.setDate(d.getDate() + n); return ymd(d); };
  const monday = (s) => { const d = dt(s); return addD(s, -((d.getDay() + 6) % 7)); };
  const TODAY = () => ymd(new Date());
  const WD = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'], MON = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  const isoWeek = (s) => { const d = dt(s); d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7)); const w1 = new Date(d.getFullYear(), 0, 4); return 1 + Math.round(((d - w1) / 864e5 - 3 + ((w1.getDay() + 6) % 7)) / 7); };
  const fmtMin = (m) => { m = Math.round(m); if (m < 60) return `${m}분`; const h = Math.floor(m / 60), r = m % 60; return r ? `${h}시간 ${r}분` : `${h}시간`; };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const MOCK = LOCAL && /[?&]mock/.test(location.search);

  // ── 기록 ──
  let AUTH = LS.get('jd:auth', null);
  let DOC = LS.get('jd:doc', null) || { v: 2, entries: {}, stk: {}, gone: {}, fly: {}, at: 0 };
  if (!DOC.fly) DOC.fly = {};
  let WEEKS = LS.get('jd:weeks', null);
  let SRV = MOCK ? 'mock' : 'wait';   // on | none(서버 칸이 아직 없음) | err | wait | mock
  let PUSH = LS.get('jd:push', null);

  // 글씨체 (내가 쓴 글에만)
  const FONTS = [
    { id: 'yaong', fam: 'H-yaong', n: '야옹이엄마 손글씨', hs: 1 },
    { id: 'on', fam: 'H-on', n: '오엔손글씨체', hs: 0.98 },
    { id: 'neat', fam: 'H-neat', n: '단정한 손글씨', hs: 0.96 },
    { id: 'miga', fam: 'H-miga', n: '미가 손글씨', hs: 1 },
    { id: 'songle', fam: 'H-songle', n: '송글손글 감성 흘림체', hs: 1.04 },
  ];
  let FONT = LS.get('jd:font', null) || DOC.font || 'yaong';
  const fontOf = (id) => FONTS.find((f) => f.id === id) || FONTS[0];
  function applyFont() { const f = fontOf(FONT), r = document.documentElement.style; r.setProperty('--f-hand', `"${f.fam}", cursive`); r.setProperty('--hs', f.hs); }
  async function setFont(id) {
    if (id === FONT) return; FONT = id; LS.set('jd:font', id); DOC.font = id; save();
    document.body.classList.add('fontswap'); const f = fontOf(id);
    await Promise.all([new Promise((r) => setTimeout(r, 230)), document.fonts && document.fonts.load ? document.fonts.load(`20px "${f.fam}"`, '가나다').catch(() => {}) : 0]);
    applyFont(); $$('.fonts button').forEach((b) => b.classList.toggle('on', b.dataset.font === id));
    requestAnimationFrame(() => document.body.classList.remove('fontswap'));
  }

  // 사진은 IndexedDB 에
  const idb = (() => {
    let p; const open = () => p || (p = new Promise((res, rej) => { const r = indexedDB.open('jd', 1); r.onupgradeneeded = () => r.result.createObjectStore('ph'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
    const tx = async (m, f) => { const db = await open(); return new Promise((res, rej) => { const t = db.transaction('ph', m), q = f(t.objectStore('ph')); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }); };
    return { get: (k) => tx('readonly', (s) => s.get(k)).catch(() => null), put: (k, v) => tx('readwrite', (s) => s.put(v, k)).catch(() => null), del: (k) => tx('readwrite', (s) => s.delete(k)).catch(() => null) };
  })();
  const PH = {};
  async function photo(id) { if (PH[id]) return PH[id]; let v = await idb.get(id); if (!v && SRV === 'on') { try { const r = await rpc('diary_photo_get', { p_student: AUTH.who, p_code: AUTH.code, p_id: id }); if (r) { v = await dec(r); await idb.put(id, v); } } catch (e) {} } if (v) PH[id] = v; return v; }
  function fillPhotos(el) { for (const im of $$('img[data-ph]', el)) if (!im.getAttribute('src')) photo(im.dataset.ph).then((v) => { if (v) im.src = v; }); }

  // ── 서버 ──
  async function rpc(fn, body) {
    const r = await fetch(`${CFG.url}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: CFG.key, Authorization: 'Bearer ' + CFG.key, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) { const e = new Error('rpc ' + r.status); e.status = r.status; throw e; }
    const t = await r.text(); return t ? JSON.parse(t) : null;
  }
  const te = new TextEncoder(), td = new TextDecoder();
  const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  const ub64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  let KEYP;
  const ckey = () => KEYP || (KEYP = (async () => { const base = await crypto.subtle.importKey('raw', te.encode(AUTH.code), 'PBKDF2', false, ['deriveKey']); return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: te.encode('mallang-diary:' + AUTH.who), iterations: 120000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']); })());
  async function enc(str) { const iv = crypto.getRandomValues(new Uint8Array(12)), ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await ckey(), te.encode(str))); const o = new Uint8Array(12 + ct.length); o.set(iv); o.set(ct, 12); return b64(o); }
  async function dec(s) { const u = ub64(s); return td.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.slice(0, 12) }, await ckey(), u.slice(12))); }

  function merge(R) {
    if (!R || typeof R !== 'object') return false; let ch = false;
    for (const [id, at] of Object.entries(R.gone || {})) if (!(DOC.gone[id] >= at)) { DOC.gone[id] = at; ch = true; }
    for (const [id, e] of Object.entries(R.entries || {})) { const m = DOC.entries[id]; if (!m || (e.at || 0) > (m.at || 0)) { DOC.entries[id] = e; ch = true; } }
    for (const id of Object.keys(DOC.entries)) if (DOC.gone[id] >= (DOC.entries[id].at || 0)) { delete DOC.entries[id]; ch = true; }
    for (const [k, v] of Object.entries(R.stk || {})) { const m = DOC.stk[k]; if (!m || (v.at || 0) > (m.at || 0)) { DOC.stk[k] = v; ch = true; } }
    if (R.fly && (R.fly.at || 0) > (DOC.fly.at || 0)) { DOC.fly = R.fly; ch = true; }
    return ch;
  }
  async function pull() {
    if (MOCK || !AUTH || !AUTH.code) return;
    try { const r = await rpc('diary_get', { p_student: AUTH.who, p_code: AUTH.code }); SRV = 'on'; if (r && r.doc) { const ch = merge(JSON.parse(await dec(r.doc))); if (ch) { LS.set('jd:doc', DOC); buildPages(); refresh(); } } if (DOC.at && (!r || !r.at || r.at < DOC.at)) pushSoon(); }
    catch (e) { SRV = e.status === 404 ? 'none' : 'err'; }
    const s = $('#srv-state'); if (s) s.textContent = srvText();
  }
  let pushT;
  function pushSoon() { clearTimeout(pushT); pushT = setTimeout(pushNow, 1500); }
  async function pushNow() {
    if (SRV !== 'on' || !AUTH || !AUTH.code) return;
    try { await rpc('diary_put', { p_student: AUTH.who, p_code: AUTH.code, p_doc: await enc(JSON.stringify(DOC)), p_at: DOC.at, p_push: PUSH || {} }); } catch (e) { SRV = 'err'; }
  }
  function save() { DOC.at = Date.now(); if (!LS.set('jd:doc', DOC)) toast('저장 칸이 꽉 찼어요. 사진을 조금 지워 주세요'); pushSoon(); }
  const srvText = () => ({ on: '이 기기와 서버 두 곳에 잠가서 저장하고 있어요', none: '지금은 이 기기에만 저장돼요', err: '서버에 닿지 않아서 이 기기에만 저장했어요. 다음에 열 때 다시 올려요', wait: '저장 칸을 확인하고 있어요', mock: '시험 화면이라 이 기기에만 저장돼요' }[SRV]);

  // ── 말랑대학 기록 → 주마다 한 것 (읽기만) ──
  function computeWeeks(d) {
    const by = {}, day = (k) => by[k] || (by[k] = { ses: {}, min: 0, done: {}, solved: 0, won: 0, hw: [], log: [] });
    for (const v of Object.values((d && d.slog) || {})) { if (!v || !v.s || !v.e) continue; const m = (v.e - v.s) / 60000; if (m <= 0 || m > 600) continue; const o = day(ymd(new Date(v.s))), t = String(v.ti || v.subj || '공부').trim(); o.ses[t] = (o.ses[t] || 0) + m; o.min += m; }
    for (const [k, p] of Object.entries((d && d.pomo && d.pomo.days) || {})) { const m = Math.max((p && p.man) || 0, (p && p.min) || 0); if (m > 0 && m > day(k).min) day(k).min = m; }
    for (const x of (d && d.wallet && d.wallet.log) || []) { if (!x || !x.date) continue; const o = day(x.date), y = String(x.why || ''); if (x.amt > 0) o.won += x.amt; if (y === '문제 맞힘') o.solved++; else if (y && !/배지|보너스|최고 기록/.test(y)) o.done[y] = (o.done[y] || 0) + 1; }
    for (const h of (d && d.hw) || []) if (h && h.done && h.doneAt) day(ymd(new Date(h.doneAt))).hw.push(String(h.title || '숙제'));
    for (const l of (d && d.logs) || []) if (l && l.date && l.text) day(l.date).log.push([l.subj, l.text].filter(Boolean).join(' '));
    const today = TODAY(), keys = Object.keys(by).filter((k) => /^\d{4}-\d\d-\d\d$/.test(k) && k <= today).sort();
    let from = monday(keys[0] || today); const lim = addD(monday(today), -7 * 30); if (from < lim) from = lim;
    const out = [];
    for (let m = from; m <= monday(today); m = addD(m, 7)) {
      const W = { mon: m, days: [], min: 0, on: 0, done: 0, solved: 0, won: 0, top: [] }, tops = {};
      for (let i = 0; i < 7; i++) {
        const k = addD(m, i), o = by[k], L = [];
        if (o) {
          const S = Object.entries(o.ses).sort((a, b) => b[1] - a[1]);
          S.slice(0, 2).forEach(([t, mm]) => L.push(`${t} <small>${fmtMin(Math.max(1, mm))}</small>`));
          if (S.length > 2) L.push(`<small>그리고 ${S.length - 2}가지 더</small>`);
          for (const [t, mm] of S) { const key = t.split(':')[0].trim(); tops[key] = (tops[key] || 0) + mm; }
          const D = Object.entries(o.done).sort((a, b) => b[1] - a[1]), dn = D.reduce((a, b) => a + b[1], 0) + o.hw.length;
          const tail = []; if (o.solved) tail.push(`문제 ${o.solved}개 맞힘`); if (dn) tail.push(`끝낸 것 ${dn}개`);
          if (tail.length) L.push(tail.join(' · '));
          if (!S.length && D.length) L.push(D.slice(0, 2).map(([t, n]) => `${t.replace(/ 끝$/, '')} ${n}개`).join(' · '));
          o.log.slice(0, 1).forEach((t) => L.push(`학교 · ${t.slice(0, 22)}`));
          W.min += o.min; W.done += dn; W.solved += o.solved; W.won += o.won; if (o.min > 0 || dn || o.solved) W.on++;
        }
        W.days.push({ date: k, min: o ? Math.round(o.min) : 0, lines: L.slice(0, 4) });
      }
      W.min = Math.round(W.min); W.top = Object.entries(tops).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t, mm]) => [t, Math.round(mm)]);
      out.push(W);
    }
    return out;
  }
  const blankWeek = (m) => ({ mon: m, days: [0, 1, 2, 3, 4, 5, 6].map((i) => ({ date: addD(m, i), min: 0, lines: [] })), min: 0, on: 0, done: 0, solved: 0, won: 0, top: [] });
  function weeks() {
    const cur = monday(TODAY()); let L = (WEEKS && WEEKS.list) || [];
    L = L.filter((w) => w.mon <= cur); if (!L.length || L[L.length - 1].mon !== cur) L = L.concat([blankWeek(cur)]);
    const have = new Set(L.map((w) => w.mon));
    for (const e of Object.values(DOC.entries)) { const m = monday(e.date); if (!have.has(m) && m <= cur) { L.push(blankWeek(m)); have.add(m); } }
    return L.sort((a, b) => (a.mon < b.mon ? -1 : 1));
  }
  async function loadUniv() {
    try {
      let d;
      if (MOCK) d = await (await fetch('_mock.json')).json();
      else if (AUTH && AUTH.code) d = await rpc('univ_get', { p_student: AUTH.who, p_code: AUTH.code });
      if (!d) return;
      WEEKS = { at: Date.now(), list: computeWeeks(d) }; LS.set('jd:weeks', WEEKS);
      buildPages(); refresh();
    } catch (e) {}
  }

  // ── 쪽 ──
  let P = [], pos = 0, busy = false, EDIT = null, TWO = false, PHONE = false;
  const book = $('#book'), slotL = $('#slotL'), slotR = $('#slotR'), bar = $('#bar'), tray = $('#tray'), tool = $('#tool'), tabs = $('#tabs');
  const pkey = (p) => (p.w ? `${p.w.mon}:${p.t}` : p.t);
  function buildPages() {
    const key = P[pos] && pkey(P[pos]);
    P = [{ t: 'cover' }, { t: 'fly' }, { t: 'toc' }]; for (const w of weeks()) P.push({ t: 'wl', w }, { t: 'wr', w }); P.push({ t: 'dall' }, { t: 'wall' }, { t: 'photos' }, { t: 'about' });
    if (key) { const i = P.findIndex((p) => pkey(p) === key); if (i >= 0) pos = i; }
  }
  const idxOf = (mon, t) => P.findIndex((p) => p.w && p.w.mon === mon && p.t === t);
  const idxT = (t) => P.findIndex((p) => p.t === t);
  const thu = (m) => dt(addD(m, 3));
  const wkLabel = (m) => { const th = thu(m); return `${th.getMonth() + 1}월 ${['첫', '둘', '셋', '넷', '다섯'][Math.ceil(th.getDate() / 7) - 1]}째 주`; };
  const wkRange = (m) => { const a = dt(m), b = dt(addD(m, 6)); return `${a.getMonth() + 1}.${a.getDate()} ~ ${b.getMonth() + 1}.${b.getDate()}`; };
  const curMon = () => monday(TODAY());
  const plabel = (p) => ({ cover: '', fly: '면지', toc: '목차', dall: '일기 모음', wall: '고민 모음', photos: '사진', about: '설정' }[p.t] ?? `${wkLabel(p.w.mon)} · ${p.t === 'wl' ? '한 것' : '일기'}`);
  const sp = (i) => Math.ceil(i / 2);
  const view = (i) => (TWO ? { L: sp(i) * 2 - 1 >= 1 ? sp(i) * 2 - 1 : -1, R: sp(i) * 2 < P.length ? sp(i) * 2 : -1 } : { L: -1, R: i });
  const entries = () => Object.values(DOC.entries);
  const entPh = (e) => (e.ph || []).map((x) => (typeof x === 'string' ? { id: x, sh: 'pol' } : x));

  const LOCK = '<svg viewBox="0 0 10 12"><path d="M2.5 5V3.5a2.5 2.5 0 0 1 5 0V5" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="1" y="5" width="8" height="6.5" rx="1.5" fill="currentColor"/></svg>';
  const CLIP = (STK.ransom.h.match(/<svg class="bclip"[\s\S]*?<\/svg>/) || [''])[0];
  function coverHtml() {
    return `<div class="cv"><div class="cv-stitch"></div><div class="cv-lace"></div>
      <div class="cv-card"><div class="sc"></div><div class="dots"></div><div class="cv-clip">${CLIP}</div>
        <div class="cv-ttl">Diary</div><div class="cv-sub">my little archive · ${new Date().getFullYear()}</div>
        <div class="cv-note"><i>slow down</i><b>ONE PAGE<br>AT A<br>TIME</b></div></div>
      <div class="cv-mono">J</div>
      ${!AUTH ? `<form class="cv-code" id="code-f"><p>주인만 열 수 있어요. 내 코드를 적어 주세요</p><input id="code-in" inputmode="text" autocomplete="off" autocapitalize="off" maxlength="24" aria-label="내 코드"><button type="submit">열기</button><p class="err" id="code-err"></p></form>` : '<div class="cv-open">TAP TO OPEN</div>'}</div>`;
  }
  function flyHtml() {
    const f = DOC.fly, last = LS.get('jd:last', null), li = last ? P.findIndex((p) => pkey(p) === last) : -1, ci = idxOf(curMon(), 'wl');
    return `<div class="fly"><div class="ttl w">This diary<br>belongs to</div>
      <label class="fld w" style="--i:2"><span class="cap">name</span><input class="hin" data-fly="name" value="${esc(f.name || '')}" placeholder="이름" maxlength="20"></label>
      <label class="fld w" style="--i:3"><span class="cap">since</span><input class="hin" data-fly="since" value="${esc(f.since || '')}" placeholder="시작한 날" maxlength="20"></label>
      <label class="fld w" style="--i:4"><span class="cap">a promise to myself</span><input class="hin" data-fly="vow" value="${esc(f.vow || '')}" placeholder="한 줄 다짐" maxlength="40"></label>
      <div class="fly-go w" style="--i:6">${li > 2 && li !== ci && sp(li) !== sp(ci) ? `<button type="button" class="lbtn dark" data-jump="${li}">이어서 보기 · ${esc(plabel(P[li]))}</button>` : ''}<button type="button" class="lbtn ${li > 2 && li !== ci && sp(li) !== sp(ci) ? '' : 'dark'}" data-jump="${ci}">이번 주 펴기</button></div></div>`;
  }
  function tocHtml() {
    const W = weeks(), have = new Set(W.map((w) => w.mon)), mins = {}; for (const w of W) for (const d of w.days) if (d.min > 0 || d.lines.length) mins[d.date] = 1;
    const y = new Date().getFullYear(), today = TODAY(), cm = curMon(); let h = '';
    for (let m = 0; m < 12; m++) {
      const n = new Date(y, m + 1, 0).getDate(), off = (new Date(y, m, 1).getDay() + 6) % 7; let rows = '', cells = [];
      for (let i = 0; i < off; i++) cells.push(null); for (let d = 1; d <= n; d++) cells.push(d); while (cells.length % 7) cells.push(null);
      for (let r = 0; r < cells.length; r += 7) {
        const first = cells.slice(r, r + 7).find((x) => x), mon = monday(`${y}-${pad(m + 1)}-${pad(first)}`), ok = have.has(mon);
        const inner = cells.slice(r, r + 7).map((d) => { if (!d) return '<i></i>'; const k = `${y}-${pad(m + 1)}-${pad(d)}`; return `<i class="${mins[k] ? 's' : ''}${k === today ? ' t' : ''}">${d}</i>`; }).join('');
        rows += ok ? `<button type="button" class="ym-w${mon === cm ? ' cur' : ''}" data-wk="${mon}" aria-label="${esc(wkLabel(mon))}">${inner}</button>` : `<div class="ym-w">${inner}</div>`;
      }
      h += `<div class="ym w" style="--i:${m}"><div class="ym-h"><b>${m + 1}</b><span class="cap">${MON[m].slice(0, 3)}</span></div>${rows}</div>`;
    }
    const E = entries(), nd = E.filter((e) => e.kind !== 'worry').length, nw = E.filter((e) => e.kind === 'worry').length, np = allPhotos().length;
    return `<div class="toc-h"><span class="ttl">Contents</span><span class="cap">${y}</span></div><div class="yg">${h}</div>
      <div class="toc-l"><button type="button" data-jump="${idxOf(cm, 'wl')}"><span>이번 주</span><small>${wkRange(cm)}</small></button><button type="button" data-jump="${idxT('dall')}"><span>일기</span><small>${nd}편</small></button><button type="button" data-jump="${idxT('wall')}"><span>고민</span><small>${nw}개</small></button><button type="button" data-jump="${idxT('photos')}"><span>사진</span><small>${np}장</small></button></div>`;
  }
  function calHtml(w) {
    const th = thu(w.mon), y = th.getFullYear(), m = th.getMonth(), first = new Date(y, m, 1), n = new Date(y, m + 1, 0).getDate(), off = (first.getDay() + 6) % 7, today = TODAY();
    let h = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((c) => `<b>${c}</b>`).join('');
    for (let i = 0; i < off; i++) h += '<span></span>';
    for (let d = 1; d <= n; d++) { const k = `${y}-${pad(m + 1)}-${pad(d)}`, inw = k >= w.mon && k <= addD(w.mon, 6); h += `<span class="${inw ? 'wkd' : ''}${k === today ? ' td' : ''}">${d}</span>`; }
    return `<div class="side-h"><span class="num">${m + 1}</span></div><div class="cap" style="margin-top:calc(var(--u)*1.6)">${MON[m]}<br>${y}</div><div class="cal">${h}</div>`;
  }
  const safeLine = (t) => t.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])).replace(/&lt;(\/?)small&gt;/g, '<$1small>');
  function wlHtml(w) {
    const today = TODAY(); let i = 0;
    return `<div class="wk"><aside class="side">${calHtml(w)}</aside><div class="cells"><div class="cap">WEEK ${isoWeek(w.mon)} · ${wkRange(w.mon)}</div>${w.days.map((d) => {
      const D = dt(d.date), fut = d.date > today, has = entries().some((e) => e.date === d.date);
      let ls = d.lines; if (ls.length > 3) ls = ls.filter((t) => !/^<small>그리고/.test(t)).slice(0, 3);
      const L = ls.length ? ls.map((t) => `<span class="w" style="--i:${i++}">${safeLine(t)}</span>`).join('') : fut ? '' : `<span class="w dim" style="--i:${i++}">${d.date === today ? '오늘은 아직 빈 칸' : '쉬어 간 날'}</span>`;
      return `<div class="cell ${d.date === today ? 'today' : ''}"><div class="cell-d"><b>${D.getDate()}</b><i>${WD[D.getDay()]}</i></div><div class="cell-t did">${L}${has ? `<button type="button" class="cell-go" data-jump="${idxOf(w.mon, 'wr')}">이날 쓴 글</button>` : ''}</div></div>`;
    }).join('')}</div></div>`;
  }
  const phHtml = (x, cls) => `<div class="pc sh-${esc(x.sh || 'pol')} ${cls || ''}"><div class="pc-i"><img data-ph="${esc(x.id)}" alt="" draggable="false"></div></div>`;
  const entHtml = (e) => {
    const D = dt(e.date), ed = EDIT && EDIT.id === e.id, wr = e.kind === 'worry';
    const ph = entPh(e).map((x, n) => `<div class="pc sh-${esc(x.sh || 'pol')}" style="--r:${[-3, 2, -1.5][n % 3]}deg"><div class="pc-i"><img data-ph="${esc(x.id)}" alt="" draggable="false"></div>${ed ? `<button type="button" class="x" data-phx="${esc(x.id)}" aria-label="사진 떼기">×</button>` : ''}</div>`).join('');
    return `<div class="ent" data-ent="${esc(e.id)}"><div class="ent-h"><b>${D.getDate()}</b><span class="cap">${WD[D.getDay()]}</span><span class="tag">${wr ? LOCK + '고민 · 나만 보기' : '일기'}</span>${ed ? '' : '<button type="button" class="ed" data-edit>고치기</button>'}</div>
      ${ed ? `<textarea id="ent-ta" placeholder="${wr ? '마음에 걸리는 걸 그대로 적어도 돼요. 여긴 나만 보는 곳이에요' : '오늘 있었던 일, 기분, 아무 말이나'}">${esc(e.text || '')}</textarea>` : `<div class="ent-t hand">${esc(e.text || '')}</div>`}
      ${ph ? `<div class="ent-ph">${ph}</div>` : ''}
      ${ed ? `<div class="ent-b"><button type="button" class="lbtn" data-addph>사진 붙이기</button><button type="button" class="lbtn" data-del>지우기</button><span class="saved" id="ent-saved">저장됐어요</span><button type="button" class="lbtn dark ok" data-ok>다 썼어요</button></div><div id="ent-c"></div>` : ''}</div>`;
  };
  function wrHtml(w) {
    const isCur = w.mon === curMon(), L = entries().filter((e) => e.date >= w.mon && e.date <= addD(w.mon, 6)).sort((a, b) => (a.date === b.date ? (a.c || 0) - (b.c || 0) : a.date < b.date ? -1 : 1)); let i = 0;
    if (EDIT && EDIT.draft && !L.includes(EDIT.draft) && EDIT.draft.date >= w.mon && EDIT.draft.date <= addD(w.mon, 6)) L.push(EDIT.draft);
    const rows = [['공부한 시간', w.min ? fmtMin(w.min) : '아직 없음'], ['책상에 앉은 날', `${w.on}일`], ['끝낸 것', `${w.done}개`]]; if (w.solved) rows.push(['맞힌 문제', `${w.solved}개`]); if (w.won) rows.push(['모은 용돈', `${w.won.toLocaleString('ko-KR')}원`]);
    return `<div class="did-box did"><span class="h-ul w">이번 주에 내가 한 것</span><ul>${rows.map(([a, b]) => `<li class="w" style="--i:${i++}">${a} <b>${b}</b></li>`).join('')}</ul>
      ${w.top.length ? `<span class="h-hl w" style="--i:${i++}">제일 오래 붙잡은 것</span><ul>${w.top.map(([t, m]) => `<li class="w" style="--i:${i++}">${esc(t)} <small>${fmtMin(m)}</small></li>`).join('')}</ul>` : ''}</div>
      <div class="mine"><div class="mine-h"><span class="ttl">dear me,</span>${isCur && !EDIT ? '<span class="mine-new"><button type="button" class="lbtn" data-new="day">일기 쓰기</button><button type="button" class="lbtn" data-new="worry">고민 적기</button></span>' : ''}</div>
      ${L.map(entHtml).join('') || `<p class="empty">${isCur ? '아직 아무것도 안 썼어요. 한 줄이면 충분해요.' : '이 주에는 쓴 글이 없어요.'}</p>`}</div>`;
  }
  function listHtml(kind) {
    const L = entries().filter((e) => (kind === 'worry') === (e.kind === 'worry')).sort((a, b) => (a.date < b.date ? 1 : -1));
    return `<div class="lst-h"><span class="ttl">${kind === 'worry' ? 'worries' : 'diary'}</span><span class="cap">${kind === 'worry' ? '고민 · 나만 보기' : '일기'} ${L.length}</span></div>` + (L.map((e, i) => { const D = dt(e.date); return `<button type="button" class="row" style="--i:${i}" data-jump="${idxOf(monday(e.date), 'wr')}"><span class="rd"><b>${D.getMonth() + 1}.${D.getDate()}</b><span class="cap">${WD[D.getDay()]}</span></span><span class="hand">${esc(e.text || '(사진)')}</span></button>`; }).join('') || `<p class="empty">${kind === 'worry' ? '적어 둔 고민이 없어요. 마음에 걸리는 게 생기면 여기 모여요.' : '아직 쓴 일기가 없어요. 쓰면 여기 차례로 모여요.'}</p>`);
  }
  function allPhotos() {
    const out = []; for (const e of entries()) for (const x of entPh(e)) out.push({ ...x, go: idxOf(monday(e.date), 'wr') });
    for (const [k, v] of Object.entries(DOC.stk)) for (const s of v.list || []) if (s.k === 'img') out.push({ id: s.ph, sh: s.sh, go: P.findIndex((p) => pkey(p) === k) });
    return out;
  }
  function photosHtml() { const L = allPhotos(); return `<div class="lst-h"><span class="ttl">photos</span><span class="cap">사진 ${L.length}</span></div>` + (L.length ? `<div class="phg">${L.map((x, n) => `<div data-jump="${x.go}" style="--r:${[-3, 2, -1, 3][n % 4]}deg" class="pc sh-${esc(x.sh || 'pol')}"><div class="pc-i"><img data-ph="${esc(x.id)}" alt="" draggable="false"></div></div>`).join('')}</div>` : '<p class="empty">붙인 사진이 여기 모여요. 아래 「붙이기」에서 내 사진을 올려 보세요.</p>'); }
  function aboutHtml() {
    const ios = /iPhone|iPad/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1), alone = matchMedia('(display-mode: standalone)').matches || navigator.standalone, perm = 'Notification' in window ? Notification.permission : 'no';
    return `<div class="lst-h"><span class="ttl">settings</span></div>
      <div class="set"><h3>내 글씨체</h3><p>내가 쓴 글에만 쓰여요.</p><div class="fonts">${FONTS.map((f) => `<button type="button" data-font="${f.id}" class="${f.id === FONT ? 'on' : ''}"><span class="rb"></span><small>${f.n}</small><span class="pv" style="font-family:'${f.fam}',cursive">오늘도 한 장, 천천히 써 내려간다 123</span></button>`).join('')}</div></div>
      <div class="set"><h3>저장</h3><p id="srv-state">${srvText()}</p><p>글은 내 코드로 잠가서 저장해요. 고민은 나만 볼 수 있어요.</p></div>
      <div class="set"><h3>알림</h3><p>${perm === 'granted' && PUSH ? '알림이 켜져 있어요. 밤에 한 줄 쓰자고 조용히 알려 줘요.' : perm === 'no' ? (ios && !alone ? '홈 화면에 추가한 앱에서 알림을 켤 수 있어요.' : '이 브라우저는 알림을 받을 수 없어요.') : perm === 'denied' ? '알림이 꺼져 있어요. 설정 앱에서 켤 수 있어요.' : '밤에 한 줄 쓰자고, 일요일엔 한 주가 다 채워졌다고 알려 줘요.'}</p>${perm === 'default' || (perm === 'granted' && !PUSH) ? '<button type="button" class="lbtn dark" id="push-on">알림 켜기</button>' : ''}</div>
      ${alone ? '' : `<div class="set"><h3>앱으로 쓰기</h3><p>${ios ? '사파리 공유 단추를 누르고 「홈 화면에 추가」를 고르면 앱이 돼요.' : '브라우저 메뉴에서 「홈 화면에 추가」 또는 「앱 설치」를 고르면 앱이 돼요.'}</p></div>`}
      <div class="set"><h3>잠그기</h3><p>이 기기에서 다이어리를 닫아 둬요. 다시 열 때 코드가 필요해요. 쓴 글은 지워지지 않아요.</p><button type="button" class="lbtn" id="lock-ask">이 기기에서 잠그기</button><div id="lock-c"></div></div>`;
  }

  // 스티커 (사진 · 문구 종이만)
  const seed = (s) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  function defStk(p) {
    const h = seed(pkey(p)), pick = (a, n) => a[(h >>> n) % a.length];
    // 미리 붙어 나오는 것은 사진과 영문 인쇄 문구만, 적게. 우리가 지은 한글 쪽지는 붙이지 않아요 (쪽지는 서랍에서 정윤이 직접 써요)
    if (p.t === 'wl') { const o = PHONE ? 0.34 : 0; return [{ id: 'd0', k: pick(['slow', 'word', 'stamp', 'tag2'], 0), x: 0.165, y: 0.62 + o, r: -3 }, { id: 'd2', k: pick(['f_book', 'f_matcha', 'f_window', 'f_sky2', 'f_book1', 'f_tulip'], 6), x: 0.165, y: 1.08 + o, r: -2 }]; }
    if (p.t === 'wr') return [{ id: 'd0', k: pick(['f_peony', 'f_latte', 'f_cake', 'f_sea', 'f_croissant', 'f_sky'], 2), x: 0.8, y: 0.19, r: 4 }];
    if (p.t === 'fly') return [{ id: 'd0', k: 'f_peony', x: 0.76, y: 0.2, r: 8 }];
    return [];
  }
  const stkList = (p) => (DOC.stk[pkey(p)] ? DOC.stk[pkey(p)].list : defStk(p));
  const stkW = (s) => (s.k === 'img' ? 0.26 : s.k === 'note' ? 0.3 : (STK[s.k] || {}).w || 0.2);
  const stkInner = (s) => (s.k === 'img' ? `<div class="pc sh-${esc(s.sh || 'pol')}"><div class="pc-i"><img data-ph="${esc(s.ph)}" alt="" draggable="false"></div></div>` : s.k === 'note' ? `<div class="pr pr-note"><div class="hand">${esc(s.t || '')}</div></div>` : STK[s.k] ? STK[s.k].h : '');
  const stkHtml = (s, cls) => { const inner = stkInner(s); return inner ? `<div class="stk ${cls || ''}" data-sid="${esc(s.id)}" style="--x:${s.x};--y:${s.y};--w:${stkW(s)};--r:${s.r || 0}deg;--s:${s.s || 1}">${inner}</div>` : ''; };
  function stkMut(pi, f) { const p = P[pi], k = pkey(p); if (!DOC.stk[k]) DOC.stk[k] = { at: 0, list: JSON.parse(JSON.stringify(defStk(p))) }; const r = f(DOC.stk[k].list); DOC.stk[k].at = Date.now(); save(); return r; }

  const BODY = { fly: flyHtml, toc: tocHtml, dall: () => listHtml('day'), wall: () => listHtml('worry'), photos: photosHtml, about: aboutHtml };
  function pageBody(p) { return p.t === 'cover' ? coverHtml() : `<div class="in"><div class="sheet">${p.w ? (p.t === 'wl' ? wlHtml(p.w) : wrHtml(p.w)) : BODY[p.t]()}${stkList(p).map((s) => stkHtml(s)).join('')}</div></div><div class="pglab">${esc(plabel(p))}</div>`; }
  // 종이 뒷면이 아주 희미하게 비쳐요 (뒤집힌 채로)
  function ghost(i) { const g = i % 2 ? i - 1 : i + 1, q = P[g]; if (!q || q.t === 'cover' || P[i].t === 'cover') return ''; const h = `<div class="gin"><div class="sheet">${q.w ? (q.t === 'wl' ? wlHtml(q.w) : wrHtml(q.w)) : BODY[q.t]()}${stkList(q).map((s) => stkHtml(s)).join('')}</div></div>`; return `<div class="ghost" aria-hidden="true" inert>${h.replace(/ (id|for|data-(?!ph\b)[a-z]+)="[^"]*"/g, '').replace(/ data-(edit|ok|addph|del|x|mine|note)(?=[ >])/g, '').replace(/<textarea[^>]*>/g, '<div class="hand" style="white-space:pre-wrap">').replace(/<\/textarea>/g, '</div>')}</div>`; }
  function mk(i, side) { const p = P[i], el = document.createElement('div'); el.className = `page ${p.t === 'cover' ? 'cover' : p.t} ${side === 'L' ? 'sl' : 'sr'}`; el.dataset.pi = i; el.innerHTML = pageBody(p) + ghost(i); fillPhotos(el); bindPage(el, i); return el; }
  const blank = (side) => { const el = document.createElement('div'); el.className = `page blank ${side === 'L' ? 'sl' : 'sr'}`; return el; };
  function mount(keep) {
    const sc = keep ? $$('.slot > .page .in').map((x) => [x.parentElement.dataset.pi, x.scrollTop]) : [];
    const v = view(pos); slotL.innerHTML = ''; slotR.innerHTML = ''; $$('.leaf', book).forEach((x) => x.remove());
    if (v.L >= 0) slotL.appendChild(mk(v.L, 'L')); if (v.R >= 0) slotR.appendChild(mk(v.R, 'R'));
    for (const [pi, y] of sc) { const el = $(`.slot > .page[data-pi="${pi}"] .in`); if (el) el.scrollTop = y; }
    sync();
  }
  function refresh() { if (busy) return; desel(); mount(true); }
  function layout() {
    const W = innerWidth, H = innerHeight, two = W > H && W >= 900, tabw = W < 500 ? 24 : W < 900 ? 32 : 36, padX = W < 500 ? 6 : 18, availH = H - (W < 500 ? 22 : 40) - 66, availW = W - padX * 2 - tabw - 16;
    let pw, ph; if (two) { pw = Math.min(availW / 2, availH / 1.3); ph = Math.min(availH, pw * 1.42); } else { pw = Math.min(availW, availH / 1.25); ph = Math.min(availH, pw * (pw < 500 ? 2.3 : 1.46)); }
    pw = Math.floor(pw); ph = Math.floor(ph); const r = document.documentElement.style;
    r.setProperty('--pw', pw + 'px'); PHONE = pw < 500; r.setProperty('--u', (PHONE ? pw / 62 : pw / 100) + 'px'); r.setProperty('--ph', ph + 'px'); r.setProperty('--bw', (two ? pw * 2 : pw) + 'px'); r.setProperty('--tabw', tabw + 'px'); book.style.marginRight = tabw + 'px';
    document.body.classList.toggle('two', two); document.body.classList.toggle('one', !two);
    if (two !== TWO) { TWO = two; if (P.length) mount(); }
  }

  // 지금 어디인지: 탭 · 두께 · 위쪽 글
  function buildTabs() {
    const W = weeks(), y = new Date().getFullYear(), ms = new Set(W.filter((w) => thu(w.mon).getFullYear() === y).map((w) => thu(w.mon).getMonth()));
    tabs.innerHTML = [['toc', '목차'], ['now', '이번 주'], ['day', '일기'], ['worry', '고민'], ['photo', '사진'], ['set', '설정']].map(([k, n]) => `<button type="button" class="cat" data-tab="${k}">${n}</button>`).join('') + `<span class="gap"></span><button type="button" class="yr" tabindex="-1">${y}</button>` + MON.map((m, i) => `<button type="button" class="${ms.has(i) ? '' : 'off'}" data-tab="m${i}" ${ms.has(i) ? '' : 'disabled'}>${m.slice(0, 3)}</button>`).join('');
    $$('[data-tab]', tabs).forEach((b) => (b.onclick = () => { const k = b.dataset.tab; let t = -1; if (k === 'toc') t = idxT(TWO ? 'fly' : 'toc'); else if (k === 'now') t = idxOf(curMon(), 'wl'); else if (k === 'day') t = idxT('dall'); else if (k === 'worry') t = idxT('wall'); else if (k === 'photo') t = idxT('photos'); else if (k === 'set') t = idxT('about'); else { const m = +k.slice(1), w = weeks().find((x) => thu(x.mon).getMonth() === m && thu(x.mon).getFullYear() === new Date().getFullYear()); if (w) t = idxOf(w.mon, 'wl'); } if (t >= 0) go(t, true); }));
  }
  function sync() {
    const closed = pos === 0; document.body.classList.toggle('closed', closed); bar.classList.toggle('hide', closed);
    const v = view(pos), shown = [v.L, v.R].filter((i) => i >= 0).map((i) => P[i]), on = new Set();
    for (const p of shown) { if (p.t === 'fly' || p.t === 'toc') on.add('toc'); if (p.t === 'dall') on.add('day'); if (p.t === 'wall') on.add('worry'); if (p.t === 'photos') on.add('photo'); if (p.t === 'about') on.add('set'); if (p.w) { on.add('m' + thu(p.w.mon).getMonth()); if (p.w.mon === curMon()) on.add('now'); } }
    $$('[data-tab]', tabs).forEach((b) => b.classList.toggle('on', on.has(b.dataset.tab)));
    const pr = P.length > 1 ? pos / (P.length - 1) : 0; const tl = closed ? 0 : 2 + pr * 13, tr = 2 + (1 - pr) * 13, td = (closed || !TWO ? tr : Math.max(tl, tr)) * 0.5, stack = (t, dir) => { const a = [], n = 8; for (let k = 1; k <= n; k++) { const o = t * k / n, y = (td * k / n).toFixed(2); const c = k % 2 ? '#fcfafc' : '#c8bfcb'; a.push(`${(dir * o).toFixed(2)}px ${y}px 0 ${c}`, `0 ${y}px 0 ${c}`); } return a.join(', '); };
    book.style.setProperty('--shl', stack(tl, -1)); book.style.setProperty('--shr', stack(tr, 1)); book.style.setProperty('--tr', tr.toFixed(1) + 'px');
    const a = shown.find((p) => p.w) || shown[0]; $('#here').textContent = closed || !a ? '' : a.w ? `${wkLabel(a.w.mon)}${a.w.mon === curMon() ? ' · 이번 주' : ''} · ${wkRange(a.w.mon)}` : shown.map(plabel).filter(Boolean).join(' · ');
    $('#b-prev').disabled = pos <= 0; $('#b-next').disabled = TWO ? sp(pos) >= sp(P.length - 1) : pos >= P.length - 1;
    const p = P[pos]; if (p && pos > 2) LS.set('jd:last', pkey(p));
  }

  // 넘기기. far = 인덱스 · 목차로 멀리 뛸 때만 여러 장이 촤라락
  function go(t, far) {
    if (busy || t < 0 || t >= P.length) return; if (EDIT) finishEdit(true);
    const v0 = view(pos), v1 = view(t); if (v0.L === v1.L && v0.R === v1.R) { pos = t; sync(); return; }
    busy = true; desel(); closeTray();
    const fwd = t > pos, dist = TWO ? Math.abs(sp(t) - sp(pos)) : Math.abs(t - pos), n = far ? Math.min(dist, 10) : 1, dur = n > 1 ? 540 : 700, ST = n > 5 ? 55 : 80, leaves = [];
    const face = (leaf, cls, pg) => { const f = document.createElement('div'); f.className = 'face ' + cls; f.appendChild(pg); leaf.appendChild(f); };
    const leaf = (cls, i, za, zb) => { const l = document.createElement('div'); l.className = 'leaf ' + cls; l.style.setProperty('--d', i * ST + 'ms'); l.style.setProperty('--dur', dur + 'ms'); l.style.setProperty('--za', za); l.style.setProperty('--zb', zb); leaves.push(l); return l; };
    const oldL = slotL.firstElementChild, oldR = slotR.lastElementChild; let newL = null, newR = null, fin;
    if (TWO && fwd) {
      if (v1.R >= 0) { newR = mk(v1.R, 'R'); slotR.insertBefore(newR, slotR.firstChild); }
      newL = mk(v1.L, 'L');
      for (let i = 0; i < n; i++) { const l = leaf('f', i, 60 - i, 60 + i); face(l, 'ft', i === 0 && oldR ? oldR : blank('R')); face(l, 'bk', i === n - 1 ? newL : blank('L')); book.appendChild(l); }
      fin = () => { slotL.innerHTML = ''; slotL.appendChild(newL); slotR.innerHTML = ''; if (newR) slotR.appendChild(newR); };
    } else if (TWO) {
      if (v1.L >= 0) { newL = mk(v1.L, 'L'); slotL.insertBefore(newL, slotL.firstChild); }
      newR = mk(v1.R, 'R');
      for (let i = 0; i < n; i++) { const l = leaf('b', i, 60 - i, 60 + i); face(l, 'ft', i === 0 && oldL ? oldL : blank('L')); face(l, 'bk', i === n - 1 ? newR : blank('R')); book.appendChild(l); }
      fin = () => { slotR.innerHTML = ''; slotR.appendChild(newR); slotL.innerHTML = ''; if (newL) slotL.appendChild(newL); };
    } else if (fwd) {
      newR = mk(v1.R, 'R'); slotR.insertBefore(newR, slotR.firstChild);
      for (let i = 0; i < n; i++) { const l = leaf('f', i, 60 - i, 60 - i); face(l, 'ft', i === 0 && oldR ? oldR : blank('R')); face(l, 'bk', blank('R')); book.appendChild(l); }
      fin = () => { slotR.innerHTML = ''; slotR.appendChild(newR); };
    } else {
      newR = mk(v1.R, 'R');
      for (let i = 0; i < n; i++) { const l = leaf('r', i, 60 + i, 60 + i); face(l, 'ft', i === n - 1 ? newR : blank('R')); face(l, 'bk', blank('R')); book.appendChild(l); }
      fin = () => { slotR.innerHTML = ''; slotR.appendChild(newR); };
    }
    pos = t; sync();
    setTimeout(() => { fin(); leaves.forEach((l) => l.remove()); busy = false; sync(); }, dur + (n - 1) * ST + 40);
  }
  const step = (d) => { if (TWO) { const s = sp(pos) + d; if (s < 0 || s > sp(P.length - 1)) return; go(s === 0 ? 0 : s * 2 - 1); } else go(pos + d); };

  // ── 묶기 ──
  function bindPage(el, pi) {
    const p = P[pi];
    if (p.t === 'cover') {
      const f = $('#code-f', el);
      if (f) { f.onsubmit = (e) => { e.preventDefault(); login($('#code-in', el).value); }; }
      else el.onclick = () => go(1);
      return;
    }
    $$('[data-jump]', el).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); const t = +b.dataset.jump; if (t >= 0) go(t, true); }));
    $$('[data-wk]', el).forEach((b) => (b.onclick = () => go(idxOf(b.dataset.wk, 'wl'), true)));
    $$('[data-fly]', el).forEach((inp) => (inp.oninput = () => { DOC.fly[inp.dataset.fly] = inp.value; DOC.fly.at = Date.now(); save(); }));
    $$('[data-new]', el).forEach((b) => (b.onclick = () => newEntry(b.dataset.new)));
    $$('[data-edit]', el).forEach((b) => (b.onclick = () => { EDIT = { id: b.closest('[data-ent]').dataset.ent }; refresh(); focusTa(); }));
    $$('[data-font]', el).forEach((b) => (b.onclick = () => setFont(b.dataset.font)));
    const ta = $('#ent-ta', el);
    if (ta) {
      const fit = () => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }; requestAnimationFrame(fit);
      let t; ta.oninput = () => { fit(); const e = editing(); if (!e) return; e.text = ta.value; e.at = Date.now(); clearTimeout(t); t = setTimeout(() => { commit(); const s = $('#ent-saved'); if (s) { s.classList.add('on'); setTimeout(() => s.classList.remove('on'), 1400); } }, 400); };
      $('[data-ok]', el).onclick = () => finishEdit();
      const keep = (f) => { const tv = ta.value; f(); refresh(); const t2 = $('#ent-ta'); if (t2) t2.value = tv; };
      $('[data-addph]', el).onclick = () => pickPhoto((id, sh) => { const e = editing(); if (!e) return; keep(() => { e.text = ta.value; (e.ph = e.ph || []).push({ id, sh }); e.at = Date.now(); commit(true); }); });
      $('[data-del]', el).onclick = () => { $('#ent-c').innerHTML = '<div class="ask"><span>이 글을 정말 지울까요?</span><button type="button" class="lbtn" id="del-n">아니요</button><button type="button" class="lbtn dark" id="del-y">지울게요</button></div>'; $('#del-n').onclick = () => ($('#ent-c').innerHTML = ''); $('#del-y').onclick = () => { const e = editing(); if (e && DOC.entries[e.id]) { delete DOC.entries[e.id]; DOC.gone[e.id] = Date.now(); save(); } EDIT = null; refresh(); toast('지웠어요'); }; };
      $$('[data-phx]', el).forEach((b) => (b.onclick = () => { const e = editing(); if (!e) return; keep(() => { e.ph = entPh(e).filter((x) => x.id !== b.dataset.phx); e.at = Date.now(); commit(true); }); }));
    }
    const po = $('#push-on', el); if (po) po.onclick = pushOn;
    const la = $('#lock-ask', el); if (la) la.onclick = () => { $('#lock-c').innerHTML = '<div class="ask"><span>이 기기에서 잠글까요?</span><button type="button" class="lbtn" id="lk-n">아니요</button><button type="button" class="lbtn dark" id="lk-y">잠글게요</button></div>'; $('#lk-n').onclick = () => ($('#lock-c').innerHTML = ''); $('#lk-y').onclick = () => { LS.del('jd:auth'); LS.del('jd:weeks'); LS.del('jd:last'); AUTH = null; WEEKS = null; KEYP = null; buildPages(); go(0, true); setTimeout(() => mount(), 1400); }; };
    $$('.stk', el).forEach((s) => bindStk(s, pi));
  }
  const editing = () => (EDIT ? EDIT.draft || DOC.entries[EDIT.id] : null);
  function commit(force) { const e = editing(); if (!e) return; if (EDIT.draft) { if (!force && !String(e.text || '').trim() && !(e.ph || []).length) return; DOC.entries[e.id] = e; delete EDIT.draft; } save(); }
  function finishEdit(silent) { const e = editing(); if (e) { const ta = $('#ent-ta'); if (ta) e.text = ta.value; const emp = !String(e.text || '').trim() && !(e.ph || []).length; if (emp) { if (DOC.entries[e.id]) { delete DOC.entries[e.id]; DOC.gone[e.id] = Date.now(); save(); } } else { e.at = Date.now(); commit(true); } } EDIT = null; if (!silent) { refresh(); if (e && String(e.text || '').trim()) toast('오늘의 한 장, 잘 넣어 뒀어요'); } }
  function focusTa() { const ta = $('#ent-ta'); if (ta) { ta.focus({ preventScroll: true }); ta.setSelectionRange(ta.value.length, ta.value.length); ta.closest('.ent').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } }
  function newEntry(kind) {
    const i = idxOf(curMon(), 'wr'), start = () => { const e = { id: 'e' + uid(), date: TODAY(), kind, text: '', c: Date.now(), at: Date.now() }; EDIT = { id: e.id, draft: e }; refresh(); focusTa(); };
    const v = view(pos); if (v.L !== i && v.R !== i) { go(i, true); setTimeout(start, 1400); } else start();
  }

  // ── 사진 올리기 → 자르기 ──
  const SHAPES = [['pol', '폴라로이드', 1], ['sq', '네모', 1], ['round', '둥글게', 1], ['arch', '아치', 3 / 4], ['torn', '찢은 종이', 4 / 3]];
  function pickPhoto(done) { const f = $('#file'); f.value = ''; f.onchange = () => { const file = f.files && f.files[0]; if (file) cropOpen(file, done); }; f.click(); }
  function cropOpen(file, done) {
    const el = $('#crop'), im = new Image(), url = URL.createObjectURL(file); let sh = 'pol', z = 1, x = 0, y = 0, cw = 300, ch = 300, min = 1;
    const close = () => { el.classList.add('hide'); setTimeout(() => (el.innerHTML = ''), 300); URL.revokeObjectURL(url); };
    im.onerror = () => { close(); toast('사진을 읽지 못했어요'); };
    im.onload = () => {
      el.innerHTML = `<h3>사진 자르기</h3><div class="cr-stage" id="cr-st"><img id="cr-im" src="${url}" alt=""></div><small>끌어서 자리를 잡고, 아래 막대로 키워요</small><input type="range" id="cr-z" min="1" max="4" step="0.01" value="1" aria-label="크기"><div class="cr-row" id="cr-sh">${SHAPES.map(([k, n]) => `<button type="button" data-sh="${k}" class="${k === sh ? 'on' : ''}">${n}</button>`).join('')}</div><div class="cr-row"><button type="button" id="cr-x">그만두기</button><button type="button" class="go" id="cr-ok">이 모양으로 붙이기</button></div>`;
      const st = $('#cr-st'), ie = $('#cr-im'), S = Math.max(180, Math.min(innerWidth - 48, innerHeight - 330, 460));
      const clamp = () => { const s = min * z; x = Math.min(0, Math.max(cw - im.width * s, x)); y = Math.min(0, Math.max(ch - im.height * s, y)); ie.style.transform = `translate(${x}px,${y}px) scale(${s})`; };
      const shape = (k, first) => { const cx = first ? 0.5 : (cw / 2 - x) / (im.width * min * z), cy = first ? 0.5 : (ch / 2 - y) / (im.height * min * z); sh = k; const ar = SHAPES.find((q) => q[0] === k)[2]; cw = ar >= 1 ? S : Math.round(S * ar); ch = ar >= 1 ? Math.round(S / ar) : S; st.style.setProperty('--cw', cw + 'px'); st.style.setProperty('--ch', ch + 'px'); st.className = 'cr-stage ' + k; min = Math.max(cw / im.width, ch / im.height); x = cw / 2 - cx * im.width * min * z; y = ch / 2 - cy * im.height * min * z; clamp(); $$('[data-sh]', el).forEach((b) => b.classList.toggle('on', b.dataset.sh === k)); };
      shape('pol', true); el.classList.remove('hide');
      $$('[data-sh]', el).forEach((b) => (b.onclick = () => shape(b.dataset.sh)));
      $('#cr-z').oninput = (e) => { const nz = +e.target.value, cx = (cw / 2 - x) / (min * z), cy = (ch / 2 - y) / (min * z); z = nz; x = cw / 2 - cx * min * z; y = ch / 2 - cy * min * z; clamp(); };
      const pts = new Map(); let pd = 0, pz = 1;
      st.onpointerdown = (e) => { st.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); if (pts.size === 2) { const [a, b] = [...pts.values()]; pd = Math.hypot(a[0] - b[0], a[1] - b[1]); pz = z; } };
      st.onpointermove = (e) => { const p = pts.get(e.pointerId); if (!p) return; if (pts.size === 1) { x += e.clientX - p[0]; y += e.clientY - p[1]; clamp(); } pts.set(e.pointerId, [e.clientX, e.clientY]); if (pts.size === 2 && pd) { const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), nz = Math.min(4, Math.max(1, pz * d / pd)), cx = (cw / 2 - x) / (min * z), cy = (ch / 2 - y) / (min * z); z = nz; x = cw / 2 - cx * min * z; y = ch / 2 - cy * min * z; $('#cr-z').value = z; clamp(); } };
      st.onpointerup = st.onpointercancel = (e) => { pts.delete(e.pointerId); pd = 0; };
      $('#cr-x').onclick = close;
      $('#cr-ok').onclick = async () => { const s = min * z, k = 640 / Math.max(cw, ch), c = document.createElement('canvas'); c.width = Math.round(cw * k); c.height = Math.round(ch * k); c.getContext('2d').drawImage(im, -x / s, -y / s, cw / s, ch / s, 0, 0, c.width, c.height); const data = c.toDataURL('image/jpeg', 0.85), id = 'p' + uid(); PH[id] = data; await idb.put(id, data); if (SRV === 'on') enc(data).then((v) => rpc('diary_photo_put', { p_student: AUTH.who, p_code: AUTH.code, p_id: id, p_data: v })).catch(() => {}); close(); done(id, sh); };
    };
    im.src = url;
  }

  // 스티커 옮기기 · 고르기
  let SEL = null, dragging = false;
  function bindStk(el, pi) {
    el.onpointerdown = (e) => {
      if (busy) return; e.stopPropagation(); const pw = el.parentElement.getBoundingClientRect().width, sx = e.clientX, sy = e.clientY, x0 = parseFloat(el.style.getPropertyValue('--x')), y0 = parseFloat(el.style.getPropertyValue('--y')); let moved = false;
      try { el.setPointerCapture(e.pointerId); } catch (x) {}
      el.onpointermove = (m) => { const dx = m.clientX - sx, dy = m.clientY - sy; if (!moved && Math.hypot(dx, dy) < 5) return; moved = true; dragging = true; el.classList.add('drag'); el.style.setProperty('--x', Math.min(0.98, Math.max(0.02, x0 + dx / pw)).toFixed(4)); el.style.setProperty('--y', Math.max(0.02, y0 + dy / pw).toFixed(4)); };
      el.onpointerup = el.onpointercancel = () => { el.onpointermove = el.onpointerup = el.onpointercancel = null; el.classList.remove('drag'); setTimeout(() => (dragging = false), 50);
        if (moved) { const id = el.dataset.sid, x = parseFloat(el.style.getPropertyValue('--x')), y = parseFloat(el.style.getPropertyValue('--y')); stkMut(pi, (L) => { const s = L.find((q) => q.id === id); if (s) { s.x = x; s.y = y; } }); }
        else select(el, pi); };
    };
  }
  function select(el, pi) { if (SEL && SEL.el === el) return desel(); desel(); SEL = { el, pi }; el.classList.add('sel'); const s = stkList(P[pi]).find((q) => q.id === el.dataset.sid); tool.innerHTML = `${s && s.k === 'note' ? '<button type="button" data-t="tx">글 고치기</button>' : ''}<button type="button" data-t="rl">왼쪽</button><button type="button" data-t="rr">오른쪽</button><button type="button" data-t="sm">작게</button><button type="button" data-t="lg">크게</button><button type="button" data-t="rm">떼기</button>`; tool.classList.remove('hide'); }
  function desel() { if (SEL) SEL.el.classList.remove('sel'); SEL = null; tool.classList.add('hide'); }
  tool.onclick = (e) => {
    const b = e.target.closest('[data-t]'); if (!b || !SEL) return; const { el, pi } = SEL, id = el.dataset.sid, t = b.dataset.t;
    if (t === 'rm') { let old; stkMut(pi, (L) => { const i = L.findIndex((q) => q.id === id); if (i >= 0) old = L.splice(i, 1)[0]; }); desel(); el.style.transition = 'opacity .25s, scale .25s'; el.style.opacity = 0; el.style.scale = 0.5; setTimeout(() => el.remove(), 260); toast('뗐어요', () => { if (!old) return; stkMut(pi, (L) => L.push(old)); refresh(); }); return; }
    if (t === 'tx') { const s = stkList(P[pi]).find((q) => q.id === id); tool.innerHTML = `<input id="note-in" maxlength="60" value="${esc((s && s.t) || '')}" placeholder="쪽지에 적을 말"><button type="button" data-t="txok">됐어요</button>`; const inp = $('#note-in'); inp.focus(); inp.oninput = () => { stkMut(pi, (L) => { const q = L.find((z) => z.id === id); if (q) q.t = inp.value; }); const h = $('.hand', el); if (h) h.textContent = inp.value; }; return; }
    if (t === 'txok') { desel(); return; }
    stkMut(pi, (L) => { const s = L.find((q) => q.id === id); if (!s) return; if (t === 'rl') s.r = (s.r || 0) - 10; if (t === 'rr') s.r = (s.r || 0) + 10; if (t === 'sm') s.s = Math.max(0.45, (s.s || 1) / 1.15); if (t === 'lg') s.s = Math.min(3, (s.s || 1) * 1.15); el.style.transition = 'transform .25s'; el.style.setProperty('--r', s.r + 'deg'); el.style.setProperty('--s', s.s || 1); });
  };
  let STKPAGE = -1;   // 붙일 쪽: 펼침에서는 마지막으로 만진 쪽, 없으면 오른쪽
  let justDesel = false;
  book.addEventListener('pointerdown', (e) => { justDesel = false; const pg = e.target.closest && e.target.closest('.slot > .page'); if (pg) STKPAGE = +pg.dataset.pi; if (SEL && !(e.target.closest && e.target.closest('.stk'))) { desel(); justDesel = true; } }, true);
  // 쪽 바깥 가장자리(빈 종이)를 누르면 한 장 넘어가요. 누른 쪽 귀퉁이가 살짝 들려요
  book.addEventListener('click', (e) => {
    if (busy || dragging || EDIT || SEL || justDesel || pos === 0) return;
    const pg = e.target.closest('.slot > .page'); if (!pg || pg.classList.contains('cover')) return;
    if (e.target.closest('.stk, button, textarea, input, a, label, .cell, .ent, .did-box, .fld, .set, .ym, .toc-l, .row, .pc, .mine-h, .cal, .fonts')) return;
    const r = pg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, left = pg.classList.contains('sl');
    const d = !left && x > 5 / 6 ? 1 : (left || !TWO) && x < 1 / 6 ? -1 : 0; if (!d || (d > 0 && $('#b-next').disabled)) return;
    const c = document.createElement('div'); c.className = 'curl ' + (d > 0 ? 'r' : 'l'); pg.appendChild(c); busy = true;
    setTimeout(() => { busy = false; c.remove(); step(d); }, 260);
  });
  function addStk(k, extra) {
    const v = view(pos); let pi = [v.L, v.R].includes(STKPAGE) ? STKPAGE : v.R >= 0 ? v.R : v.L; if (P[pi].t === 'cover') return;
    const pg = $(`.slot > .page[data-pi="${pi}"]`), sc = $('.in', pg); if (!sc) return; const pw = pg.clientWidth, y = (sc.scrollTop + sc.clientHeight * 0.45) / pw, s = { id: 's' + uid(), k, x: +(0.5 + (Math.random() - 0.5) * 0.2).toFixed(3), y: +y.toFixed(4), r: Math.round((Math.random() - 0.5) * 12), s: 1, ...(extra || {}) };
    stkMut(pi, (L) => L.push(s)); const tmp = document.createElement('div'); tmp.innerHTML = stkHtml(s, 'new'); const el = tmp.firstElementChild; $('.sheet', pg).appendChild(el); fillPhotos(el); bindStk(el, pi); closeTray();
    if (k === 'note') setTimeout(() => { select(el, pi); const b = $('[data-t="tx"]', tool); if (b) b.click(); }, 350);
  }

  // 서랍
  function openTray(html, bind) { desel(); tray.innerHTML = `<div class="tray-in">${html}</div>`; tray.classList.remove('hide'); bind && bind(tray); }
  function closeTray() { tray.classList.add('hide'); }
  tray.onclick = (e) => { if (e.target === tray) closeTray(); };
  let TG = 'photo';
  function stkTray() {
    const items = ORDER.filter((k) => STK[k].g === TG);
    openTray(`<div class="tray-h"><b>붙이기</b><button type="button" data-g="photo" class="${TG === 'photo' ? 'on' : ''}">사진</button><button type="button" data-g="print" class="${TG === 'print' ? 'on' : ''}">문구 종이</button><button type="button" data-x>닫기</button></div><div class="tray-g">${TG === 'photo' ? '<button type="button" class="mine" data-mine style="--i:0">내 사진 올려서<br>오려 붙이기</button>' : '<button type="button" class="mine" data-note style="--i:0">빈 쪽지 붙이기<br>(내 글씨로 써요)</button>'}${items.map((k, i) => `<button type="button" data-k="${k}" style="--i:${i + 1};--tw:${STK[k].w}" aria-label="${esc(STK[k].n)}"><div>${STK[k].h}</div></button>`).join('')}</div>`, (el) => {
      $('[data-x]', el).onclick = closeTray; $$('[data-g]', el).forEach((b) => (b.onclick = () => { TG = b.dataset.g; stkTray(); }));
      const m = $('[data-mine]', el); if (m) m.onclick = () => pickPhoto((id, sh) => addStk('img', { ph: id, sh }));
      const nt = $('[data-note]', el); if (nt) nt.onclick = () => addStk('note', { t: '' });
      $$('[data-k]', el).forEach((b) => (b.onclick = () => addStk(b.dataset.k)));
    });
  }
  $('#b-stk').onclick = () => { if (!tray.classList.contains('hide') && $('.tray-g', tray)) return closeTray(); stkTray(); };
  $('#b-toc').onclick = () => go(idxT(TWO ? 'fly' : 'toc'), true);
  $('#b-write').onclick = () => { if (EDIT) return focusTa(); openTray('<div class="tray-h"><b>무엇을 쓸까요</b><button type="button" data-x>닫기</button></div><div class="tray-w"><button type="button" data-n="day" style="--i:0"><span>오늘 일기</span><small>있었던 일 · 기분</small></button><button type="button" data-n="worry" style="--i:1"><span>고민 적어 두기</span><small>나만 보기</small></button></div>', (el) => { $('[data-x]', el).onclick = closeTray; $$('[data-n]', el).forEach((b) => (b.onclick = () => { closeTray(); newEntry(b.dataset.n); })); }); };
  $('#b-prev').onclick = () => step(-1);
  $('#b-next').onclick = () => step(1);

  // 밀어서 한 장씩
  let tx = 0, ty = 0, tOK = false;
  book.addEventListener('touchstart', (e) => { const t = e.target; tOK = e.touches.length === 1 && !(t.closest && t.closest('.stk, textarea, input, button, #tabs')); tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  book.addEventListener('touchend', (e) => { if (!tOK || dragging || busy) return; const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.6) return; if (dx < 0) { if (pos === 0 && !AUTH) return; step(1); } else step(-1); }, { passive: true });
  addEventListener('keydown', (e) => { if (e.target.closest && e.target.closest('textarea, input')) return; if (e.key === 'ArrowRight' && (pos > 0 || AUTH)) step(1); if (e.key === 'ArrowLeft') step(-1); });
  let rzT; addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(layout, 80); });

  let toastT;
  function toast(msg, undo) { const el = $('#toast'); el.innerHTML = esc(msg) + (undo ? '<button type="button">되돌리기</button>' : ''); if (undo) $('button', el).onclick = () => { el.classList.remove('on'); undo(); }; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), undo ? 4200 : 2200); }

  // ── 열기 (코드) ──
  const hex = async (t) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', te.encode(t)))].map((b) => b.toString(16).padStart(2, '0')).join('');
  const bytes = (h) => new Uint8Array(h.match(/../g).map((x) => parseInt(x, 16)));
  async function resolve(w) {   // 말랑대학과 같은 별칭 풀기
    w = String(w || '').normalize('NFKC').toLowerCase().replace(/[^a-z0-9]/g, ''); if (!w) return null;
    const r = await fetch(CFG.univ + 'a/' + (await hex('alias:' + w)).slice(0, 20) + '.bin?v=' + Date.now()); if (!r.ok) return null;
    const buf = new Uint8Array(await r.arrayBuffer()), key = await crypto.subtle.importKey('raw', bytes(await hex('univ-alias:' + w)), 'AES-CTR', false, ['decrypt']);
    return JSON.parse(td.decode(new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-CTR', counter: buf.slice(0, 16), length: 64 }, key, buf.slice(16)))));
  }
  const mine = (o) => o && o.who === CFG.owner && (o.role || 'student') === 'student' && o.code;
  async function login(w) {
    const err = $('#code-err'); if (err) err.textContent = '';
    try { const o = await resolve(w); if (!mine(o)) { if (err) err.textContent = o ? '이 다이어리는 주인만 열 수 있어요' : '코드를 다시 확인해 주세요'; return false; } AUTH = { who: o.who, code: o.code }; LS.set('jd:auth', AUTH); KEYP = null; afterAuth(); mount(); setTimeout(() => go(1), 500); return true; }
    catch (e) { if (err) err.textContent = '지금은 확인할 수 없어요. 조금 뒤에 다시 해 주세요'; return false; }
  }
  function afterAuth() { loadUniv(); pull(); }

  // ── 알림 ──
  const b64u = (s) => { const p = '='.repeat((4 - (s.length % 4)) % 4), r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(r, (c) => c.charCodeAt(0)); };
  async function pushOn() {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return toast('홈 화면에 추가한 앱에서 켤 수 있어요');
      const p = await Notification.requestPermission(); if (p !== 'granted') { toast('알림이 꺼져 있어요. 설정 앱에서 켤 수 있어요'); return refresh(); }
      const reg = await navigator.serviceWorker.ready; let sub = await reg.pushManager.getSubscription(); if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(CFG.vapid) });
      const j = sub.toJSON(); let dev = LS.get('jd:dev', null); if (!dev) { dev = uid(); LS.set('jd:dev', dev); }
      PUSH = { [dev]: { e: j.endpoint, k: j.keys, at: Date.now() } }; LS.set('jd:push', PUSH); DOC.at = Date.now(); LS.set('jd:doc', DOC); await pushNow();
      toast(SRV === 'on' ? '알림을 켰어요' : '이 기기는 준비됐어요'); refresh();
    } catch (e) { toast('알림을 켜지 못했어요'); }
  }

  // ── 시작 ──
  async function boot() {
    applyFont();
    if (MOCK) AUTH = { who: CFG.owner, code: '' };
    if (!AUTH) { const u = LS.get('mallang-univ:v1', null); if (u && u.who === CFG.owner && (u.role || 'student') === 'student' && u.syncKey) { AUTH = { who: u.who, code: u.syncKey }; LS.set('jd:auth', AUTH); } }   // 같은 브라우저에서 말랑대학을 쓰고 있으면 그대로 열려요
    if (!DOC.fly.since) { const d = new Date(); DOC.fly.since = `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`; }
    buildPages(); pos = 0; TWO = null; layout(); buildTabs(); sync();
    const q = location.search.replace(/^\?/, '').split('&')[0];
    if (!AUTH && q && !/^(mock|go)(=|$)/.test(q)) { history.replaceState(null, '', location.pathname); await login(q); }
    else if (q && !MOCK) history.replaceState(null, '', location.pathname);
    if (AUTH) afterAuth();
    if ('serviceWorker' in navigator && !LOCAL) navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  const _lu = loadUniv; loadUniv = async function () { await _lu(); buildTabs(); sync(); };
  window.__jd = { go, P: () => P, pos: () => pos, doc: () => DOC, srv: () => SRV, two: () => TWO, setFont, addStk };
  boot();
})();
