/* 정윤 다이어리 (2026-11-12 시작, 11-13 아이패드 펼침으로 다시 만듦, 11-13 날짜 페이지 중심으로 고침)
   · 책: 표지 → 면지 · 목차(한 해 달력) → 주마다 [한 주 보기 1쪽 + 날짜 페이지 7쪽] → 지난 일기 · 고민 한눈에 보기 → 사진 · 설정
   · 날짜 페이지가 중심이에요: 그날 스터디 플래너(한 것 목록 + 시간표 + 합계) + 내 일기 + 고민 + 사진 · 스티커
   · 가로(아이패드)는 두 쪽 펼침, 세로는 한 쪽. 옆 인덱스 탭이나 목차로 멀리 뛸 때만 여러 장이 촤라락 넘어가요.
   · 「한 것」은 말랑대학 기록을 읽기만 해요 (univ_get). 말랑대학 기록에는 아무것도 쓰지 않아요. 읽은 날짜 기록은 이 기기(jd:days)에 쌓아 둬요.
   · 손글씨는 정윤이 직접 쓴 글과 기록에만. 틀 · 라벨은 인쇄체.
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

  // ── 말랑대학 기록 → 날마다 한 것 (읽기만) ──
  // 말랑대학 「시간표」(이번 주 모두) 화면과 같은 기록을 같은 규칙으로 읽어요 (univ app.js srBlocks · srTime):
  //   slog[id] = { s 시작, e 끝, subj 과목, ti 제목, del 지움 }  → 시작 · 끝으로 잰 시간
  //   fin.ans · eng.days.*.uans/uans2/wans · eng.g3ans · sci.days.*.ans · nx.a 의 답 시각(at) → 20분 안쪽끼리 묶은 「앱 문제」 칸
  //   pomo.days[날짜].man → 시각 없이 적은 하루 공부 시간. 잰 시간보다 많을 때만 그 차이를 더해요
  //   하루는 새벽 5시에 바뀌어요
  const SUBJ_C = { 국어: '#ffd8a0', 수학: '#a9d3ff', 영어: '#d4c4ff', 과학: '#b3ebd0', 사회: '#ffc3aa', 숙제: '#a9e4e8', '학원 숙제': '#a9e4e8', 책: '#ecc2f6', 오답: '#ffb9c7', 단어: '#ffc4e3', 내신: '#bdc9ff', 자유: '#d6d8dc', 앱: '#e4e6ea' };
  const FREE_C = ['#a9d3ff', '#b3ebd0', '#ffd8a0', '#d4c4ff', '#a9e4e8', '#ffc3aa', '#ffc4e3', '#bdc9ff', '#ecc2f6'];
  const colorOf = (k) => SUBJ_C[k] || FREE_C[seed(String(k)) % FREE_C.length];
  const ld = (t) => ymd(new Date(t - 5 * 3600000));
  // 과목을 고르지 않고 잰 것(자유)은 제목 앞머리(책 이름)로 색을 나눠요
  const subjKey = (v) => { const s = String(v.subj || '자유'), t = String(v.ti || '').split(':')[0].trim(); return s !== '자유' ? s : t || '자유'; };
  const APPK = { olymp: '올림포스 지문', g3: '고3 영어', cheonil: '천일문', 'fin-q': '기말 문제', 'fin-b': '기말 빈칸', sci: '과학', word: '단어', nx: '수업·따로 공부' }, SR_MINE = 1793511014696;
  function appEvents(d) {
    const A = [], put = (v, k) => { if (v && typeof v === 'object' && v.at && v.at !== SR_MINE) A.push({ at: v.at, k }); };
    for (const qs of Object.values((d.fin || {}).ans || {})) for (const [k, v] of Object.entries(qs || {})) put(v, k === 'q' ? 'olymp' : k.startsWith('b') ? 'fin-b' : 'fin-q');
    for (const x of Object.values((d.eng || {}).days || {})) { if (!x) continue; for (const v of Object.values(x.uans || {})) put(v, 'cheonil'); for (const v of Object.values(x.uans2 || {})) put(v, 'cheonil'); for (const v of Object.values(x.wans || {})) put(v, 'word'); }
    for (const v of Object.values((d.eng || {}).g3ans || {})) put(v, 'g3');
    for (const x of Object.values((d.sci || {}).days || {})) for (const v of Object.values((x && x.ans) || {})) put(v, 'sci');
    for (const v of Object.values((d.nx || {}).a || {})) put(v, 'nx');
    return A.sort((a, b) => a.at - b.at);
  }
  // 날짜마다 한 것: { date, min 합계, bl [[새벽 5시부터 시작 분, 끝 분, 색 열쇠]], it [[이름, 색 열쇠, 분, 문항 수]], mx 시각 없이 적은 분, solved, dn, won, hw, log }
  let DAYS = LS.get('jd:days', null) || { v: 1, first: null, d: {} };
  if (!DAYS.d) DAYS.d = {};
  const blankDay = (k) => ({ date: k, min: 0, bl: [], it: [], mx: 0, solved: 0, dn: 0, won: 0, hw: [], log: [] });
  const hasRec = (r) => !!r && (r.min > 0 || r.dn > 0 || r.solved > 0 || (r.log || []).length > 0);
  const recOf = (k) => DAYS.d[k] || blankDay(k);
  const isDate = (k) => /^\d{4}-\d\d-\d\d$/.test(k || '');
  function computeDays(d) {
    d = d || {}; const by = {}, day = (k) => by[k] || (by[k] = { bl: [], ses: {}, g: 0, man: 0, done: {}, solved: 0, won: 0, hw: [], log: [] });
    const put = (s, e, key, name, n) => { const k = ld(s), o = day(k), b0 = dt(k).getTime() + 5 * 3600000, m = (e - s) / 60000; o.bl.push([Math.round((s - b0) / 60000), Math.round((e - b0) / 60000), key]); const x = o.ses[name] || (o.ses[name] = { m: 0, k: key, s, n: 0 }); x.m += m; x.n += n || 0; if (s < x.s) x.s = s; o.g += m; };
    for (const v of Object.values(d.slog || {})) { if (!v || v.del || !(v.e > v.s) || v.e - v.s > 864e5) continue; put(v.s, v.e, subjKey(v), String(v.ti || v.subj || '공부').trim()); }
    let cur = null; const flush = () => { if (!cur) return; const top = Object.entries(cur.n).sort((a, b) => b[1] - a[1])[0][0]; put(cur.s, Math.max(cur.e, cur.s + 60000), '앱', `앱 문제 · ${APPK[top]}`, cur.c); cur = null; };
    for (const e of appEvents(d)) { if (cur && ld(e.at) === ld(cur.s) && e.at - cur.e <= 20 * 60000) { cur.e = e.at; cur.c++; cur.n[e.k] = (cur.n[e.k] || 0) + 1; } else { flush(); cur = { s: e.at, e: e.at, c: 1, n: { [e.k]: 1 } }; } }
    flush();
    for (const [k, p] of Object.entries((d.pomo && d.pomo.days) || {})) { const m = +(p && p.man) || 0; if (m > 0) day(k).man = m; }
    for (const x of (d.wallet && d.wallet.log) || []) { if (!x || !x.date) continue; const o = day(x.date), y = String(x.why || ''); if (x.amt > 0) o.won += x.amt; if (y === '문제 맞힘') o.solved++; else if (y && !/배지|보너스|최고 기록/.test(y)) o.done[y] = (o.done[y] || 0) + 1; }
    for (const h of d.hw || []) if (h && h.done && h.doneAt) day(ymd(new Date(h.doneAt))).hw.push(String(h.title || '숙제'));
    for (const l of d.logs || []) if (l && l.date && l.text) day(l.date).log.push([l.subj, l.text].filter(Boolean).join(' '));
    const today = TODAY(), out = {}; let first = null;
    for (const k of Object.keys(by).sort()) {
      if (!isDate(k) || k > today) continue; if (!first) first = k;
      const o = by[k], mx = Math.max(0, o.man - o.g);
      const r = { date: k, min: Math.round(o.g + mx), bl: o.bl.sort((a, b) => a[0] - b[0]), it: Object.entries(o.ses).sort((a, b) => a[1].s - b[1].s).map(([t, x]) => [t, x.k, Math.max(1, Math.round(x.m)), x.n]), mx: Math.round(mx), solved: o.solved, dn: Object.values(o.done).reduce((a, b) => a + b, 0) + o.hw.length, won: o.won, hw: o.hw.slice(0, 5), log: o.log.slice(0, 2) };
      if (hasRec(r)) out[k] = r;
    }
    return { first, d: out };
  }
  // 책에 들어갈 주: 기록이나 내 글이 있는 첫 주부터 이번 주까지. 지난 날짜 기록은 jd:days 에 쌓여 있어서 넘겨 봐도 남아 있어요
  function weeks() {
    const cur = monday(TODAY()), lim = addD(cur, -7 * 80); let from = cur;
    for (const k of Object.keys(DAYS.d)) if (isDate(k) && hasRec(DAYS.d[k])) { const m = monday(k); if (m < from) from = m; }
    for (const e of Object.values(DOC.entries)) if (e && isDate(e.date)) { const m = monday(e.date); if (m < from) from = m; }
    if (from < lim) from = lim; const out = [];
    for (let m = from; m <= cur; m = addD(m, 7)) out.push({ mon: m, days: [0, 1, 2, 3, 4, 5, 6].map((i) => recOf(addD(m, i))) });
    return out;
  }
  function wsum(w) {
    const o = { min: 0, on: 0, dn: 0, solved: 0, won: 0, top: [] }, t = {};
    for (const r of w.days) { o.min += r.min; o.dn += r.dn; o.solved += r.solved; o.won += r.won; if (r.min > 0 || r.dn || r.solved) o.on++; for (const x of r.it) t[x[1]] = (t[x[1]] || 0) + x[2]; if (r.mx) t['시각 없이 적은 시간'] = (t['시각 없이 적은 시간'] || 0) + r.mx; }
    o.top = Object.entries(t).sort((a, b) => b[1] - a[1]).slice(0, 4); return o;
  }
  // 시험 화면(?mock, 내 컴퓨터에서만)에서 오늘 칸이 비어 보이지 않게 예시 기록을 얹어요. 배포된 화면에서는 돌지 않아요
  function mockFill(d) {
    const t0 = dt(TODAY()).getTime(); d.slog = d.slog || {};
    [[7, 10, 45, '수학', '마더텅 함수: 75~102번'], [8, 5, 30, '영어', '영어 단어 수행 DAY38~50'], [9, 0, 50, '국어', '국어 문학 기출 3지문'], [13, 20, 40, '과학', '통합과학 오답 정리'], [16, 30, 55, '수학', '마더텅 함수: 103~120번'], [19, 40, 35, '영어', '올림포스 지문 2개'], [21, 0, 40, '사회', '한국사 근현대 정리']].forEach(([h, m, n, subj, ti]) => { const s = t0 + (h * 60 + m) * 60000, e = s + n * 60000; d.slog['w' + s] = { s, e, subj, ti, k: 'w', at: e }; });
    return d;
  }
  async function loadUniv() {
    try {
      let d;
      if (MOCK) d = mockFill(await (await fetch('_mock.json')).json());
      else if (AUTH && AUTH.code) d = await rpc('univ_get', { p_student: AUTH.who, p_code: AUTH.code });
      if (!d) return;
      const C = computeDays(d);
      // 말랑대학에 아직 남아 있는 기간은 말랑대학 기록 그대로(지운 것은 여기서도 빠져요). 그보다 옛날 날짜는 쌓아 둔 것을 그대로 둬요
      if (C.first) for (const k of Object.keys(DAYS.d)) if (k >= C.first && !C.d[k]) delete DAYS.d[k];
      Object.assign(DAYS.d, C.d); DAYS.first = C.first; DAYS.at = Date.now(); LS.set('jd:days', DAYS);
      buildPages(); refresh();
    } catch (e) {}
  }

  // ── 쪽 ──
  let P = [], pos = 0, busy = false, EDIT = null, TWO = false, PHONE = false;
  const book = $('#book'), slotL = $('#slotL'), slotR = $('#slotR'), bar = $('#bar'), tray = $('#tray'), tool = $('#tool'), tabs = $('#tabs');
  const pkey = (p) => (p.t === 'day' ? 'd:' + p.d : p.w ? `${p.w.mon}:${p.t}` : p.ym ? `${p.t}:${p.ym}` : p.t);
  function buildPages() {
    const key = P[pos] && pkey(P[pos]);
    P = [{ t: 'cover' }, { t: 'ins' }, { t: 'fly' }, { t: 'toc' }, { t: 'mi' }];   // 표지 · 표지 안쪽 면 · 첫 장(ID 카드) · 목차 · 달 찾기. 가로에서는 [안쪽 면+첫 장] [목차+달 찾기] 가 한 펼침
    let pm = '';
    for (const w of weeks()) { const ym = ymOf(w.mon); if (ym !== pm) { pm = ym; P.push({ t: 'mo', ym }, { t: 'mo2', ym }); }   // 달이 바뀌면 간지 두 쪽 (왼쪽 색 띠 · 오른쪽 달력). 두 쪽이라 펼침 짝이 그대로예요
      P.push({ t: 'wl', w }); for (const r of w.days) P.push({ t: 'day', w, d: r.date }); }   // 주마다 8쪽이라 「한 주 보기」는 늘 왼쪽 쪽
    P.push({ t: 'dall' }, { t: 'wall' }, { t: 'photos' }, { t: 'about' });
    if (key) { const i = P.findIndex((p) => pkey(p) === key); if (i >= 0) pos = i; }
  }
  const idxD = (date) => P.findIndex((p) => p.t === 'day' && p.d === date);
  const KWD = ['일', '월', '화', '수', '목', '금', '토'];
  const dLabel = (k) => { const D = dt(k); return `${D.getMonth() + 1}월 ${D.getDate()}일 ${KWD[D.getDay()]}요일`; };
  const idxOf = (mon, t) => P.findIndex((p) => p.w && p.w.mon === mon && p.t === t);
  const idxT = (t) => P.findIndex((p) => p.t === t);
  const idxM = (ym) => P.findIndex((p) => p.t === 'mo' && p.ym === ym);
  const ymOf = (mon) => { const th = dt(addD(mon, 3)); return `${th.getFullYear()}-${pad(th.getMonth() + 1)}`; };
  const thu = (m) => dt(addD(m, 3));
  const wkLabel = (m) => { const th = thu(m); return `${th.getMonth() + 1}월 ${['첫', '둘', '셋', '넷', '다섯'][Math.ceil(th.getDate() / 7) - 1]}째 주`; };
  const wkRange = (m) => { const a = dt(m), b = dt(addD(m, 6)); return `${a.getMonth() + 1}.${a.getDate()} ~ ${b.getMonth() + 1}.${b.getDate()}`; };
  const curMon = () => monday(TODAY());
  const plabel = (p) => ({ cover: '', ins: '', fly: '내 다이어리', mi: '달 찾기', toc: '목차', dall: '지난 일기 한눈에 보기', wall: '적어 둔 고민 한눈에 보기', photos: '붙인 사진 한눈에 보기', about: '설정' }[p.t] ?? (p.ym ? (p.t === 'mo' ? `${+p.ym.slice(5)}월` : `${+p.ym.slice(5)}월 달력`) : p.t === 'day' ? dLabel(p.d) : `${wkLabel(p.w.mon)} · 한 주 보기`));
  const sp = (i) => Math.ceil(i / 2);
  const view = (i) => (TWO ? { L: sp(i) * 2 - 1 >= 1 ? sp(i) * 2 - 1 : -1, R: sp(i) * 2 < P.length ? sp(i) * 2 : -1 } : { L: -1, R: P[i] && P[i].t === 'ins' ? i + 1 : i });   // 세로 한 쪽에서는 표지 안쪽 면을 건너뛰어요
  // 같은 날짜에 같은 내용으로 두 번 들어간 글은 한 번만 보여요 (가장 나중에 고친 것). 고치거나 지울 때 숨어 있던 쌍둥이도 함께 정리해요
  const entKey = (e) => [e.date, e.kind === 'worry' ? 'w' : 'd', String(e.text || '').trim(), entPh(e).map((x) => x.id).join(',')].join('\u0001');
  function entries() { const m = new Map(); for (const e of Object.values(DOC.entries)) { const k = entKey(e), o = m.get(k); if (!o || (EDIT && EDIT.id === e.id) || (!(EDIT && EDIT.id === o.id) && (e.at || 0) > (o.at || 0))) m.set(k, e); } return [...m.values()]; }
  function dropTwins(e) { const k = entKey(e); let n = 0; for (const x of Object.values(DOC.entries)) if (x.id !== e.id && entKey(x) === k) { delete DOC.entries[x.id]; DOC.gone[x.id] = Date.now(); n++; } return n; }
  const isW = (e) => e.kind === 'worry';
  function dayEntries(date) { const L = entries().filter((e) => e.date === date); if (EDIT && EDIT.draft && EDIT.draft.date === date && !L.includes(EDIT.draft)) L.push(EDIT.draft); return L.sort((a, b) => (a.c || 0) - (b.c || 0)); }
  const entPh = (e) => (e.ph || []).map((x) => (typeof x === 'string' ? { id: x, sh: 'pol' } : x));

  const LOCK = '<svg viewBox="0 0 10 12"><path d="M2.5 5V3.5a2.5 2.5 0 0 1 5 0V5" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="1" y="5" width="8" height="6.5" rx="1.5" fill="currentColor"/></svg>';
  const CLIP = "";
  setTimeout(() => document.body.classList.remove('cv-in'), 3200);   // 표지가 처음 나타날 때만 움직여요
  function coverHtml() {
    return `<div class="cv"><div class="cv-ttl">MY DIARY<small>${new Date().getFullYear()}</small></div>
      ${!AUTH ? `<form class="cv-code" id="code-f"><p>주인만 열 수 있어요. 내 코드를 적어 주세요</p><input id="code-in" inputmode="text" autocomplete="off" autocapitalize="off" maxlength="24" aria-label="내 코드"><button type="submit">열기</button><p class="err" id="code-err"></p></form>` : '<div class="cv-open">TAP TO OPEN</div>'}</div>`;
  }
  // ── 첫 장: 가로 ID 카드를 글씨가 똑바로 읽히는 방향 그대로 놓아요. 카드 바탕은 그림(assets/fly/idcard_*.webp), 글자·입력 칸·사진은 그 위에 % 자리로 얹어요 ──
  const idTone = () => (DOC.fly.tone === 'sk' ? 'sk' : 'pk');
  function flyHtml() {
    const f = DOC.fly;
    const row = (lab, key, max, al, cls) => `<label class="idr ${cls || ''}">${lab ? `<span>${lab}</span>` : ''}<input class="idi" data-fly="${key}" value="${esc(f[key] || '')}" maxlength="${max}" aria-label="${al || lab}" autocomplete="off" autocapitalize="off" spellcheck="false"></label>`;
    return `<div class="fly"><div class="idc">
      <img class="idc-bg" src="assets/fly/idcard.webp" alt="" draggable="false">
      <button type="button" class="idc-pi" data-idph aria-label="사진 넣기">${f.photo ? `<img data-ph="${esc(f.photo)}" alt="내 사진" draggable="false">` : '<img class="idc-girl" src="assets/fly/girl.webp" alt="" draggable="false">'}</button>
      <div class="idc-f"><div class="idc-t"><span>ID CARD</span></div>
        ${row('Name', 'name', 20)}${row('Birth Day', 'birth', 20)}${row('Group', 'group', 24)}${row('Info', 'vow', 40)}${row('', 'info', 40, 'Info 둘째 줄', 'in2')}
        ${row('since', 'since', 20, '시작한 날', 'ids')}</div>
      ${f.photo ? '<div class="idc-opt"><button type="button" class="idc-phx" data-phx>사진 빼기</button></div>' : ''}
</div></div>`;
  }
  function bindId(card) {
    card.classList.add('seen-later'); setTimeout(() => card.classList.add('seen'), 1200);
    card.onclick = (e) => e.stopPropagation();   // 카드 위를 눌러도 쪽이 넘어가지 않게
    const pi = $('[data-idph]', card); if (pi) pi.onclick = () => { if (busy || dragging) return; pickPhoto((id) => { DOC.fly.photo = id; DOC.fly.at = Date.now(); save(); refresh(); }); };
    $$('[data-tone]', card).forEach((b) => (b.onclick = () => { DOC.fly.tone = b.dataset.tone; DOC.fly.at = Date.now(); save(); refresh(); }));
    const px = $('[data-phx]', card); if (px) px.onclick = () => { delete DOC.fly.photo; DOC.fly.at = Date.now(); save(); refresh(); };
  }

  // 달 찾기 (목차 옆 쪽) · 달 간지 (왼쪽 색 띠 + 달 이름, 오른쪽 달력)
  function miHtml() {
    const y = new Date().getFullYear(), last = LS.get('jd:last', null), li = last ? P.findIndex((p) => pkey(p) === last) : -1, ti = idxD(TODAY()), wi = idxOf(curMon(), 'wl'), cont = li > 4 && sp(li) !== sp(ti) && sp(li) !== sp(wi);
    return `<div class="mi"><div class="mi-h w"><b>${y}</b><span>monthly index</span></div><p class="mi-p w" style="--i:1">달을 누르면 그 달 첫 쪽이 펴져요</p>
      <div class="mi-g">${MON.map((m, i) => { const t = idxM(`${y}-${pad(i + 1)}`); return `<button type="button" class="mi-t ${i % 2 ? 'b' : 'a'} w" style="--i:${i + 2}" ${t < 0 ? 'disabled' : `data-jump="${t}"`} aria-label="${i + 1}월"><b>${i + 1}</b><small>${m.slice(0, 3).toLowerCase()}</small></button>`; }).join('')}</div>
      <div class="fly-go w" style="--i:15">${cont ? `<button type="button" class="lbtn dark" data-jump="${li}">이어서 보기 · ${esc(plabel(P[li]))}</button>` : ''}<button type="button" class="lbtn ${cont ? '' : 'dark'}" data-jump="${ti}">오늘 페이지 펴기</button><button type="button" class="lbtn" data-jump="${wi}">이번 주 보기</button></div></div>`;
  }
  function moHtml(p) {
    const y = +p.ym.slice(0, 4), m = +p.ym.slice(5) - 1;
    return `<div class="mo ${m % 2 ? 'b' : 'a'}"><div class="mo-band"><i></i></div><div class="mo-n w">${m + 1}</div><div class="mo-e w" style="--i:2"><span>${MON[m].toLowerCase()}</span></div><div class="mo-y w" style="--i:4">${y} · monthly</div></div>`;
  }
  function mo2Html(p) {
    const y = +p.ym.slice(0, 4), m = +p.ym.slice(5) - 1, n = new Date(y, m + 1, 0).getDate(), off = (new Date(y, m, 1).getDay() + 6) % 7, today = TODAY();
    let h = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((c) => `<b>${c}</b>`).join(''); for (let i = 0; i < off; i++) h += '<i></i>';
    for (let d = 1; d <= n; d++) { const k = `${p.ym}-${pad(d)}`, i = idxD(k), cls = `${hasRec(DAYS.d[k]) || dayEntries(k).length ? ' s' : ''}${k === today ? ' t' : ''}`; h += i >= 0 ? `<button type="button" class="mc-d${cls}" data-jump="${i}" aria-label="${esc(dLabel(k))}">${d}</button>` : `<i class="mc-d off">${d}</i>`; }
    const W = weeks().filter((w) => ymOf(w.mon) === p.ym);
    return `<div class="mo2 ${m % 2 ? 'b' : 'a'}"><div class="mo2-h w"><b>${m + 1}</b><span>${MON[m].toLowerCase()} ${y}</span></div><div class="mc w" style="--i:2">${h}</div><p class="mi-p w" style="--i:4">날짜를 누르면 그날 쪽이 펴져요</p>
      <div class="mo2-w">${W.map((w, i) => `<button type="button" class="w${w.mon === curMon() ? ' cur' : ''}" style="--i:${i + 5}" data-wk="${w.mon}"><span>${esc(wkLabel(w.mon))}</span><small>${wkRange(w.mon)}</small></button>`).join('')}</div></div>`;
  }

  // 책갈피 (W2): 오늘 쪽 자리에 꽂혀 있어요. 누르면 오늘 쪽으로. 무늬는 설정에서 골라요
  const BMS = [['pk', '분홍 줄무늬'], ['sk', '하늘 줄무늬'], ['dot', '물방울']];
  let BM = LS.get('jd:bm', null) || DOC.bm || 'pk'; if (!BMS.some((b) => b[0] === BM)) BM = 'pk';
  const bm = document.createElement('button'); bm.type = 'button'; bm.id = 'bm'; bm.className = 'hide'; bm.setAttribute('aria-label', '책갈피. 오늘 페이지 펴기');
  bm.innerHTML = `<i><img src="assets/fly/bm_${BM}.webp" alt="" draggable="false"></i>`;
  book.appendChild(bm);
  bm.onclick = (e) => { e.stopPropagation(); const t = idxD(TODAY()); bm.classList.remove('tok'); bm.offsetWidth; bm.classList.add('tok'); if (t >= 0 && !busy) go(t, true); };
  function bmSync() {
    const ti = idxD(TODAY()), v = view(pos), on = ti >= 0 && (v.L === ti || v.R === ti), left = TWO && (on ? v.L === ti : ti < Math.max(v.L, v.R));
    bm.className = `${pos === 0 || ti < 0 ? 'hide' : ''}${on ? ' on' : ''}${left ? ' l' : ''}${bm.classList.contains('tok') ? ' tok' : ''}`;
  }
  function setBm(k) { if (!BMS.some((b) => b[0] === k)) return; BM = k; LS.set('jd:bm', k); DOC.bm = k; save(); $('img', bm).src = `assets/fly/bm_${k}.webp`; $$('[data-bm]').forEach((b) => b.classList.toggle('on', b.dataset.bm === k)); bm.classList.remove('tok'); bm.offsetWidth; bm.classList.add('tok'); }

  function tocHtml() {
    const W = weeks(), have = new Set(W.map((w) => w.mon)), mins = {}; for (const w of W) for (const d of w.days) if (hasRec(d)) mins[d.date] = 1;
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
    const E = entries(), nd = E.filter((e) => !isW(e)).length, nw = E.filter(isW).length, np = allPhotos().length;
    return `<div class="toc-h"><span class="ttl">Contents</span><span class="lab">${y}년 목차 · 주를 누르면 그 주가 펴져요</span></div><div class="yg">${h}</div>
      <div class="toc-l"><button type="button" data-jump="${idxD(today)}"><span>오늘 페이지</span><small>${today.slice(5).replace('-', '.')}</small></button><button type="button" data-jump="${idxOf(cm, 'wl')}"><span>이번 주 보기</span><small>${wkRange(cm)}</small></button><button type="button" data-jump="${idxT('dall')}"><span>지난 일기 한눈에 보기</span><small>${nd}편</small></button><button type="button" data-jump="${idxT('wall')}"><span>적어 둔 고민 한눈에 보기</span><small>${nw}개</small></button><button type="button" data-jump="${idxT('photos')}"><span>붙인 사진</span><small>${np}장</small></button><button type="button" data-jump="${idxT('about')}"><span>설정</span><small>글씨체 · 알림</small></button></div>`;
  }
  function calHtml(w) {
    const th = thu(w.mon), y = th.getFullYear(), m = th.getMonth(), first = new Date(y, m, 1), n = new Date(y, m + 1, 0).getDate(), off = (first.getDay() + 6) % 7, today = TODAY();
    let h = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((c) => `<b>${c}</b>`).join('');
    for (let i = 0; i < off; i++) h += '<span></span>';
    for (let d = 1; d <= n; d++) { const k = `${y}-${pad(m + 1)}-${pad(d)}`, inw = k >= w.mon && k <= addD(w.mon, 6); h += `<span class="${inw ? 'wkd' : ''}${k === today ? ' td' : ''}">${d}</span>`; }
    return `<div class="side-h"><span class="num">${m + 1}</span></div><div class="cap" style="margin-top:calc(var(--u)*1.6)">${MON[m]}<br>${y}</div><div class="cal">${h}</div>`;
  }
  const hm = (m) => `${Math.floor(m / 60)}:${pad(Math.round(m) % 60)}`;
  const dotLi = (i, key, name, m, short) => `<li class="w" style="--i:${i};--c:${colorOf(key)}"><i class="dot"></i><span class="nm did">${esc(name)}</span><small class="did">${short ? hm(m) : fmtMin(m)}</small></li>`;   // short: 좁은 칸에서는 4:12 처럼 (요일 칸과 같은 표기)
  function cellLines(r) {
    const L = [], S = [...r.it].sort((a, b) => b[2] - a[2]); S.slice(0, 2).forEach((x) => L.push(`${esc(x[0])} <small>${fmtMin(x[2])}</small>`));
    if (S.length > 2) L.push(`<small>그리고 ${S.length - 2}가지 더</small>`); else { const tail = []; if (r.solved) tail.push(`문제 ${r.solved}개 맞힘`); if (r.dn) tail.push(`끝낸 것 ${r.dn}개`); if (tail.length) L.push(tail.join(' · ')); }
    if (!L.length && r.mx) L.push(`공부 <small>${fmtMin(r.mx)}</small>`);
    return L.slice(0, 3);
  }
  function wsumHtml(w) {
    const s = wsum(w); let i = 8; const row = (a, b) => `<div class="ws-r w" style="--i:${i++}"><span class="lab">${a}</span><b class="did">${b}</b></div>`;
    return `<div class="wsum"><span class="h-ul w" style="--i:7">이 주에 한 것</span>${row('공부한 시간', s.min ? fmtMin(s.min) : '아직 없음')}${row('책상에 앉은 날', `${s.on}일`)}${row('끝낸 것', `${s.dn}개`)}${s.solved ? row('맞힌 문제', `${s.solved}개`) : ''}${s.won ? row('모은 용돈', `${s.won.toLocaleString('ko-KR')}원`) : ''}
      ${s.top.length ? `<span class="lab ws-t w" style="--i:${i++}">오래 붙잡은 것</span><ul class="dl sm">${s.top.map(([t, m]) => dotLi(i++, t, t === '앱' ? '앱 문제 풀이' : t, m, true)).join('')}</ul>` : ''}</div>`;
  }
  // 한 주 보기 (왼쪽 쪽): 달력 + 이 주 합계 + 요일 칸. 칸을 누르면 그날 페이지로 가요
  function wlHtml(w) {
    const today = TODAY(), E = entries(); let i = 0;
    return `<div class="wk"><aside class="side">${calHtml(w)}${wsumHtml(w)}</aside><div class="cells"><div class="cells-h"><span class="cap">WEEK ${isoWeek(w.mon)} · ${wkRange(w.mon)}</span><span class="lab">날짜 칸을 누르면 그날 페이지로</span></div>${w.days.map((r) => {
      const D = dt(r.date), fut = r.date > today, ls = cellLines(r), nd = E.some((e) => e.date === r.date && !isW(e)), nw = E.some((e) => e.date === r.date && isW(e));
      const L = ls.length ? ls.map((t) => `<span class="w" style="--i:${i++}">${t}</span>`).join('') : fut ? '' : `<span class="w dim" style="--i:${i++}">${r.date === today ? '오늘은 아직 빈 칸' : '쉬어 간 날'}</span>`;
      const mk = (nd ? '<span class="tag">일기</span>' : '') + (nw ? `<span class="tag">${LOCK}고민</span>` : '');
      return `<div class="cell ${r.date === today ? 'today' : ''}" data-jump="${idxD(r.date)}" role="button" tabindex="0" aria-label="${esc(dLabel(r.date))} 페이지 펴기"><div class="cell-d"><b>${D.getDate()}</b><i>${WD[D.getDay()]}</i>${r.min ? `<em class="did">${hm(r.min)}</em>` : ''}</div><div class="cell-t did">${L}${mk ? `<span class="cell-m">${mk}</span>` : ''}</div></div>`;
    }).join('')}</div></div>`;
  }
  const phHtml = (x, cls) => `<div class="pc sh-${esc(x.sh || 'pol')} ${cls || ''}"><div class="pc-i"><img data-ph="${esc(x.id)}" alt="" draggable="false"></div></div>`;
  const entHtml = (e) => {
    const ed = EDIT && EDIT.id === e.id, wr = isW(e);
    const ph = entPh(e).map((x, n) => `<div class="pc sh-${esc(x.sh || 'pol')}" style="--r:${[-3, 2, -1.5][n % 3]}deg"><div class="pc-i"><img data-ph="${esc(x.id)}" alt="" draggable="false"></div>${ed ? `<button type="button" class="x" data-phx="${esc(x.id)}" aria-label="사진 떼기">×</button>` : ''}</div>`).join('');
    return `<div class="ent ${ed ? 'editing' : ''}" data-ent="${esc(e.id)}">
      ${ed ? `<textarea id="ent-ta" placeholder="${wr ? '마음에 걸리는 걸 그대로 적어도 돼요. 여긴 나만 보는 곳이에요' : '있었던 일, 기분, 아무 말이나'}">${esc(e.text || '')}</textarea>` : `<div class="ent-t hand">${esc(e.text || '')}</div>`}
      ${ph ? `<div class="ent-ph">${ph}</div>` : ''}
      ${ed ? '<div class="ent-b"><button type="button" class="lbtn" data-addph>사진 붙이기</button><button type="button" class="lbtn" data-del>지우기</button><span class="saved" id="ent-saved">저장됐어요</span><button type="button" class="lbtn dark ok" data-ok>다 썼어요</button></div>' : '<div class="ent-b v"><button type="button" class="lbtn sm" data-edit>고치기</button><button type="button" class="lbtn sm" data-del>지우기</button></div>'}<div class="ent-c"></div></div>`;
  };
  // 시간표: 한 줄이 한 시간, 한 칸이 10분. 잰 시간만큼 과목 색으로 칠해요
  function ttHtml(r) {
    let h0 = 6, h1 = 24; for (const b of r.bl) { h0 = Math.min(h0, 5 + Math.floor(b[0] / 60)); h1 = Math.max(h1, 5 + Math.ceil(b[1] / 60)); } h0 = Math.max(5, h0); h1 = Math.min(29, h1);
    let rows = '', n = 0;
    for (let h = h0; h < h1; h++) {
      const a = (h - 5) * 60; let seg = '';
      for (const b of r.bl) { const s = Math.max(b[0], a), e = Math.min(b[1], a + 60); if (e <= s) continue; const wd = Math.max(2, (e - s) / 0.6), lf = Math.min((s - a) / 0.6, 100 - wd); seg += `<span class="sg" style="left:${lf.toFixed(1)}%;width:${wd.toFixed(1)}%;--c:${colorOf(b[2])};--i:${Math.min(n++, 40)}"></span>`; }
      rows += `<div class="tr"><i>${h % 24}</i><div class="tc">${seg}</div></div>`;
    }
    return `<div class="tt">${rows}</div>`;
  }
  // 날짜 페이지: 그날 스터디 플래너(한 것 · 시간표 · 합계) + 내 일기 + 고민
  function dayHtml(p) {
    const k = p.d, r = recOf(k), D = dt(k), today = TODAY(), fut = k > today, isT = k === today; let i = 0;
    const li = r.it.map(([t, key, m, n]) => dotLi(i++, key, n ? `${t} ${n}문항` : t, m)).join('') + (r.mx ? dotLi(i++, '자유', '시각 없이 적은 시간', r.mx) : '');
    const ex = []; if (r.solved) ex.push(`문제 ${r.solved}개 맞힘`); if (r.dn) ex.push(`끝낸 것 ${r.dn}개`); for (const t of (r.hw || []).slice(0, 3)) ex.push(`숙제 끝 · ${t}`); for (const t of (r.log || []).slice(0, 1)) ex.push(`학교 · ${t}`);
    const none = fut ? '아직 오지 않은 날이에요.' : isT ? '오늘은 아직 기록이 없어요. 말랑대학에서 공부 시간을 재면 여기에 남아요.' : '기록 없이 쉬어 간 날이에요.';
    const E = fut ? [] : dayEntries(k), dd = E.filter((e) => !isW(e)), ww = E.filter(isW), can = !fut && !EDIT;
    return `<div class="dp"><div class="dp-h"><span class="num">${D.getDate()}</span><div class="dp-hd"><b>${KWD[D.getDay()]}요일${isT ? '<span class="tag">오늘</span>' : ''}</b><span class="cap">${MON[D.getMonth()]} ${D.getFullYear()}</span></div><div class="dp-tot w"><span class="lab">이날 공부한 시간</span><b class="did">${r.min ? fmtMin(r.min) : fut ? '' : '0분'}</b></div></div>
      <div class="dp-plan"><div class="dp-list"><span class="h-ul">한 것</span>${li ? `<ul class="dl">${li}</ul>` : ex.length ? '' : `<p class="empty sm">${none}</p>`}${ex.length ? `<ul class="dx did">${ex.map((t) => `<li class="w" style="--i:${i++}">${esc(t)}</li>`).join('')}</ul>` : ''}</div>
        <div class="dp-tt"><span class="h-ul">시간표</span><span class="lab tt-cap">한 칸 10분</span>${ttHtml(r)}</div></div>
      ${fut ? '' : `<div class="mine"><div class="mine-h"><span class="kh">${isT ? '오늘의 일기' : '이날의 일기'}</span>${can && !dd.length ? `<button type="button" class="lbtn" data-new="day" data-date="${k}">일기 쓰기</button>` : ''}</div>
        ${dd.map(entHtml).join('') || `<p class="empty sm">${isT ? '아직 안 썼어요. 한 줄이면 충분해요.' : '이날은 쓴 일기가 없어요.'}</p>`}
        <div class="mine-h sub"><span class="kh">${LOCK}고민 <small>나만 보기</small></span>${can && !ww.length ? `<button type="button" class="lbtn" data-new="worry" data-date="${k}">고민 적기</button>` : ''}</div>
        ${ww.map(entHtml).join('')}</div>`}</div>`;
  }
  const lstHead = (t, cnt, sub) => `<div class="lst-h"><div class="lst-t"><span class="kttl">${t}</span>${cnt ? `<span class="lab">${cnt}</span>` : ''}</div><p class="ksub">${sub}</p></div>`;
  // 한눈에 보기: 날짜 페이지에 쓴 글을 한 줄씩 모아 보여 주기만 해요. 줄을 누르면 그 날짜 페이지로 넘어가요
  function listHtml(kind) {
    const wr = kind === 'worry', L = entries().filter((e) => wr === isW(e)).sort((a, b) => (a.date === b.date ? (b.c || 0) - (a.c || 0) : a.date < b.date ? 1 : -1));
    return lstHead(wr ? '적어 둔 고민 한눈에 보기' : '지난 일기 한눈에 보기', `${L.length}${wr ? '개' : '편'}`, wr ? '날짜 페이지에 적은 고민만 따로 모았어요. 나만 볼 수 있고, 줄을 누르면 그날 페이지로 넘어가요.' : '날짜 페이지에 쓴 일기가 최근 것부터 한 줄씩 모여요. 줄을 누르면 그날 페이지로 넘어가요.')
      + (L.map((e, i) => { const D = dt(e.date); return `<button type="button" class="row" style="--i:${i}" data-jump="${idxD(e.date)}"><span class="rd"><b>${D.getMonth() + 1}.${D.getDate()}</b><span class="lab">${KWD[D.getDay()]}요일</span></span><span class="hand">${esc(e.text || '(사진)')}</span></button>`; }).join('') || `<p class="empty">${wr ? '아직 적어 둔 고민이 없어요. 날짜 페이지에서 「고민 적기」로 적으면 여기에 모여요.' : '아직 쓴 일기가 없어요. 날짜 페이지에서 「일기 쓰기」로 쓰면 여기에 모여요.'}</p>`);
  }
  const oldKey = (k) => { const m = /^(\d{4}-\d\d-\d\d):wr$/.exec(k); return m ? 'd:' + m[1] : k; };   // 예전 「주 오른쪽 쪽」에 붙인 것은 그 주 월요일 페이지로
  function allPhotos() {
    const out = []; for (const e of entries()) for (const x of entPh(e)) out.push({ ...x, go: idxD(e.date) });
    for (const [k, v] of Object.entries(DOC.stk)) { if (oldKey(k) !== k && DOC.stk[oldKey(k)]) continue; for (const s of v.list || []) if (s.k === 'img') out.push({ id: s.ph, sh: s.sh, go: P.findIndex((p) => pkey(p) === oldKey(k)) }); }
    return out;
  }
  function photosHtml() { const L = allPhotos(); return lstHead('붙인 사진 한눈에 보기', `${L.length}장`, '일기와 페이지에 붙인 내 사진이 모여요. 사진을 누르면 붙인 페이지로 넘어가요.') + (L.length ? `<div class="phg">${L.map((x, n) => `<div data-jump="${x.go}" style="--r:${[-3, 2, -1, 3][n % 4]}deg" class="pc sh-${esc(x.sh || 'pol')}"><div class="pc-i"><img data-ph="${esc(x.id)}" alt="" draggable="false"></div></div>`).join('')}</div>` : '<p class="empty">아직 붙인 사진이 없어요. 아래 「붙이기」에서 내 사진을 올리면 여기에 모여요.</p>'); }
  function aboutHtml() {
    const ios = /iPhone|iPad/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1), alone = matchMedia('(display-mode: standalone)').matches || navigator.standalone, perm = 'Notification' in window ? Notification.permission : 'no';
    const HT = '<svg class="set-ht" viewBox="0 0 7 6" aria-hidden="true"><path d="M1 0h2v1h1V0h2v1h1v2H6v1H5v1H4v1H3V5H2V4H1V3H0V1h1z"/></svg>';
    const note = perm === 'granted' && PUSH ? '켜져 있어요. 밤에 한 줄 쓰자고 알려 줘요.' : perm === 'no' ? (ios && !alone ? '홈 화면에 추가한 앱에서 켤 수 있어요.' : '이 브라우저는 알림을 받을 수 없어요.') : perm === 'denied' ? '꺼져 있어요. 설정 앱에서 켤 수 있어요.' : '밤에 한 줄 쓰자고 알려 줘요.';
    return `${lstHead('설정', '', '글은 내 코드로 잠가서 저장해요. 고민은 나만 볼 수 있어요.')}
      <div class="set"><h3>내 글씨체</h3><div class="fonts">${FONTS.map((f) => `<button type="button" data-font="${f.id}" class="${f.id === FONT ? 'on' : ''}">${HT}<small>${f.n}</small><span class="pv" style="font-family:'${f.fam}',cursive">오늘도 한 장, 천천히 123</span></button>`).join('')}</div></div>
      <div class="set"><h3>책갈피</h3><div class="bmset">${BMS.map(([k, n]) => `<button type="button" data-bm="${k}" class="${k === BM ? 'on' : ''}" aria-label="${n}"><img src="assets/fly/bm_${k}.webp" alt="" draggable="false"><small>${HT}${n}</small></button>`).join('')}</div></div>
      <div class="set rw"><div><h3>저장</h3><p id="srv-state">${srvText()}</p></div></div>
      <div class="set rw"><div><h3>알림</h3><p>${note}</p></div>${perm === 'default' || (perm === 'granted' && !PUSH) ? '<button type="button" class="lbtn sm" id="push-on">알림 켜기</button>' : ''}</div>
      ${alone ? '' : `<div class="set rw"><div><h3>앱으로 쓰기</h3><p>${ios ? '사파리 공유 단추에서 「홈 화면에 추가」를 골라요.' : '브라우저 메뉴에서 「앱 설치」를 골라요.'}</p></div></div>`}
      <div class="set rw"><div><h3>잠그기</h3><p>다시 열 때 코드가 필요해요. 쓴 글은 그대로예요.</p></div><button type="button" class="lbtn sm" id="lock-ask">잠그기</button><div id="lock-c"></div></div>`;
  }

  // 스티커 (사진 · 문구 종이만)
  const seed = (s) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  function defStk(p) {
    const h = seed(pkey(p)), pick = (a, n) => a[(h >>> n) % a.length];
    // 미리 붙어 나오는 것은 사진과 영문 인쇄 문구만, 적게. 우리가 지은 한글 쪽지는 붙이지 않아요 (쪽지는 서랍에서 정윤이 직접 써요)
    // 한 주 보기 · 날짜 페이지에는 미리 붙여 두는 것이 없어요 (기록 글씨를 가리지 않게). 스티커는 정윤이 직접 붙여요
    return [];
  }
  const stkOld = (p) => { const o = p.t === 'day' && p.d === p.w.mon && DOC.stk[`${p.w.mon}:wr`]; const L = o ? (o.list || []).filter((s) => !/^d\d$/.test(s.id)) : []; return L.length ? L : null; };
  const stkList = (p) => (DOC.stk[pkey(p)] ? DOC.stk[pkey(p)].list : stkOld(p) || defStk(p));
  const stkW = (s) => (s.k === 'img' ? 0.26 : s.k === 'note' ? 0.3 : (STK[s.k] || {}).w || 0.2);
  const stkInner = (s) => (s.k === 'img' ? `<div class="pc sh-${esc(s.sh || 'pol')}"><div class="pc-i"><img data-ph="${esc(s.ph)}" alt="" draggable="false"></div></div>` : s.k === 'note' ? `<div class="pr pr-note"><div class="hand">${esc(s.t || '')}</div></div>` : STK[s.k] ? STK[s.k].h : '');
  const stkHtml = (s, cls) => { const inner = stkInner(s); return inner ? `<div class="stk ${cls || ''}" data-sid="${esc(s.id)}" style="--x:${s.x};--y:${s.y};--w:${stkW(s)};--r:${s.r || 0}deg;--s:${s.s || 1}">${inner}</div>` : ''; };
  function stkMut(pi, f) { const p = P[pi], k = pkey(p); if (!DOC.stk[k]) DOC.stk[k] = { at: 0, list: JSON.parse(JSON.stringify(stkList(p))) }; const r = f(DOC.stk[k].list); DOC.stk[k].at = Date.now(); save(); return r; }

  const BODY = { ins: () => '<div class="ins-in"></div>', mi: miHtml, mo: moHtml, mo2: mo2Html, fly: flyHtml, toc: tocHtml, dall: () => listHtml('day'), wall: () => listHtml('worry'), photos: photosHtml, about: aboutHtml };
  function pageBody(p) { return p.t === 'cover' ? coverHtml() : `<div class="in"><div class="sheet">${p.w ? (p.t === 'wl' ? wlHtml(p.w) : dayHtml(p)) : BODY[p.t](p)}${stkList(p).map((s) => stkHtml(s)).join('')}</div></div><div class="pglab">${esc(plabel(p))}</div>`; }
  function mk(i, side) { const p = P[i], el = document.createElement('div'); el.className = `page ${p.t === 'cover' ? 'cover' : p.t} ${side === 'L' ? 'sl' : 'sr'}`; el.dataset.pi = i; el.innerHTML = pageBody(p); fillPhotos(el); bindPage(el, i); return el; }
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
    let ci = 0; tabs.innerHTML = [['cover', '표지'], ['toc', '목차'], ['today', '오늘'], ['now', '주간'], ['day', '일기'], ['worry', '고민'], ['photo', '사진'], ['set', '설정']].map(([k, n]) => `<button type="button" class="cat c${ci++ % 3}" data-tab="${k}" aria-label="${{ cover: '표지로 돌아가 덮기', toc: '목차', today: '오늘 페이지', now: '이번 주 보기', day: '지난 일기 한눈에 보기', worry: '적어 둔 고민 한눈에 보기', photo: '붙인 사진', set: '설정' }[k]}">${n}</button>`).join('') + `<span class="gap"></span><button type="button" class="yr" tabindex="-1">${y}</button>` + MON.map((m, i) => `<button type="button" class="mt ${i % 2 ? 'b' : 'a'}${ms.has(i) ? '' : ' off'}" data-tab="m${i}" aria-label="${i + 1}월" ${ms.has(i) ? '' : 'disabled'}><b>${i + 1}</b><small>${m.slice(0, 3).toLowerCase()}</small></button>`).join('');
    $$('[data-tab]', tabs).forEach((b) => (b.onclick = () => { const k = b.dataset.tab; let t = -1; if (k === 'cover') return go(0); if (k === 'toc') t = idxT('toc'); else if (k === 'today') t = idxD(TODAY()); else if (k === 'now') t = idxOf(curMon(), 'wl'); else if (k === 'day') t = idxT('dall'); else if (k === 'worry') t = idxT('wall'); else if (k === 'photo') t = idxT('photos'); else if (k === 'set') t = idxT('about'); else t = idxM(`${new Date().getFullYear()}-${pad(+k.slice(1) + 1)}`); /* 달 탭은 그 달 간지로 */ if (t >= 0) go(t, true); }));
  }
  function sync() {
    const closed = pos === 0; document.body.classList.toggle('closed', closed); bar.classList.toggle('hide', closed);
    const v = view(pos), shown = [v.L, v.R].filter((i) => i >= 0).map((i) => P[i]), on = new Set();
    for (const p of shown) { if (p.t === 'mi' || p.t === 'toc') on.add('toc'); if (p.ym) on.add('m' + (+p.ym.slice(5) - 1)); if (p.t === 'dall') on.add('day'); if (p.t === 'wall') on.add('worry'); if (p.t === 'photos') on.add('photo'); if (p.t === 'about') on.add('set'); if (p.w) { on.add('m' + thu(p.w.mon).getMonth()); if (p.t === 'wl' && p.w.mon === curMon()) on.add('now'); if (p.t === 'day' && p.d === TODAY()) on.add('today'); } }
    $$('[data-tab]', tabs).forEach((b) => b.classList.toggle('on', on.has(b.dataset.tab)));
    const pr = P.length > 1 ? pos / (P.length - 1) : 0; const tl = closed ? 0 : 2 + pr * 13, tr = 2 + (1 - pr) * 13, td = (closed || !TWO ? tr : Math.max(tl, tr)) * 0.5, stack = (t, dir) => { const a = [], n = Math.max(1, Math.round(t / 1.5)), put = (o, c) => { const y = (td * o / t).toFixed(2); a.push(`${(dir * o).toFixed(2)}px ${y}px 0 ${c}`, `0 ${y}px 0 ${c}`); }; for (let k = 1; k <= n; k++) { const o = t * k / n; put(o - 0.5, '#fdfcfa'); put(o, k === n ? '#d9d5cf' : '#e6e3de'); } return t ? a.join(', ') : 'none'; }; /* 얇은 종이가 많이 쌓인 옆면: 1px 종이 + 0.5px 가는 선을 여러 겹 */
    book.style.setProperty('--shl', stack(tl, -1)); book.style.setProperty('--shr', stack(tr, 1)); book.style.setProperty('--tr', tr.toFixed(1) + 'px');
    $('#here').textContent = closed ? '' : shown.map((p) => plabel(p) + (p.t === 'day' && p.d === TODAY() ? ' (오늘)' : p.t === 'wl' && p.w.mon === curMon() ? ' (이번 주)' : '')).filter(Boolean).join('   ·   ');
    $('#b-prev').disabled = pos <= 0; $('#b-next').disabled = TWO ? sp(pos) >= sp(P.length - 1) : pos >= P.length - 1;
    const p = P[pos]; if (p && pos > 4) LS.set('jd:last', pkey(p)); bmSync();
  }

  // 넘기기. far = 인덱스 · 목차로 멀리 뛸 때만 여러 장이 촤라락
  function go(t, far) {
    if (busy || t < 0 || t >= P.length) return;
    const v0 = view(pos), v1 = view(t); if (v0.L === v1.L && v0.R === v1.R) { pos = t; sync(); return; }
    if (EDIT) finishEdit(true);
    busy = true; desel(); closeTray();
    const fwd = t > pos, dist = TWO ? Math.abs(sp(t) - sp(pos)) : Math.abs(t - pos), n = far ? Math.min(dist, 10) : 1, thin = pos !== 0 && t !== 0, dur = thin ? (n > 1 ? 460 : 540) : n > 1 ? 540 : 700, ST = thin ? (n > 5 ? 45 : 65) : n > 5 ? 55 : 80, leaves = [];
    const face = (leaf, cls, pg) => { const f = document.createElement('div'); f.className = 'face ' + cls; f.appendChild(pg); leaf.appendChild(f); };
    // 얇은 종이 한 장(표지가 아닌 속지): ft = 넘어가는 앞면, bk = 뒷면. zf/zb = 앞면 조각과 뒷면 조각의 쌓임 순서
    const paper = (cls, i, zf, zb, ft, bk) => { const l = document.createElement('div'); l.className = 'leaf pp ' + cls; l.style.setProperty('--d', i * ST + 'ms'); l.style.setProperty('--dur', dur + 'ms'); l.innerHTML = `<div class="pp-m" style="z-index:${zf}"><div class="pp-k"><div class="pp-o"></div></div><i class="pp-s"></i></div><div class="pp-m" style="z-index:${zb}"><div class="pp-k"><div class="pp-b"><i class="pp-e"></i></div><i class="pp-g"></i></div></div>`; $('.pp-o', l).appendChild(ft); $('.pp-b', l).appendChild(bk); $('.pp-b', l).insertAdjacentHTML('beforeend', '<i class="pp-w"></i>'); leaves.push(l); book.appendChild(l); };
    const leaf = (cls, i, za, zb) => { const l = document.createElement('div'); l.className = 'leaf ' + cls; l.style.setProperty('--d', i * ST + 'ms'); l.style.setProperty('--dur', dur + 'ms'); l.style.setProperty('--za', za); l.style.setProperty('--zb', zb); leaves.push(l); return l; };
    const oldL = slotL.firstElementChild, oldR = slotR.lastElementChild; let newL = null, newR = null, fin;
    if (TWO && fwd) {
      if (v1.R >= 0) { newR = mk(v1.R, 'R'); slotR.insertBefore(newR, slotR.firstChild); }
      newL = mk(v1.L, 'L');
      for (let i = 0; i < n; i++) { const ft = i === 0 && oldR ? oldR : blank('R'), bk = i === n - 1 ? newL : blank('L'); if (thin) { paper('pf', i, 40 - i, 60 + i, ft, bk); continue; } const l = leaf('f', i, 60 - i, 60 + i); face(l, 'ft', ft); face(l, 'bk', bk); book.appendChild(l); }
      fin = () => { slotL.innerHTML = ''; slotL.appendChild(newL); slotR.innerHTML = ''; if (newR) slotR.appendChild(newR); };
    } else if (TWO) {
      if (v1.L >= 0) { newL = mk(v1.L, 'L'); slotL.insertBefore(newL, slotL.firstChild); }
      newR = mk(v1.R, 'R');
      for (let i = 0; i < n; i++) { const ft = i === 0 && oldL ? oldL : blank('L'), bk = i === n - 1 ? newR : blank('R'); if (thin) { paper('pb', i, 40 - i, 60 + i, ft, bk); continue; } const l = leaf('b', i, 60 - i, 60 + i); face(l, 'ft', ft); face(l, 'bk', bk); book.appendChild(l); }
      fin = () => { slotR.innerHTML = ''; slotR.appendChild(newR); slotL.innerHTML = ''; if (newL) slotL.appendChild(newL); };
    } else if (fwd) {
      newR = mk(v1.R, 'R'); slotR.insertBefore(newR, slotR.firstChild);
      for (let i = 0; i < n; i++) { const ft = i === 0 && oldR ? oldR : blank('R'); if (thin) { paper('pf', i, 80 - 2 * i, 81 - 2 * i, ft, blank('L')); continue; } const l = leaf('f', i, 60 - i, 60 - i); face(l, 'ft', ft); face(l, 'bk', blank('R')); book.appendChild(l); }
      fin = () => { slotR.innerHTML = ''; slotR.appendChild(newR); };
    } else {
      newR = mk(v1.R, 'R');
      for (let i = 0; i < n; i++) { const ft = i === n - 1 ? newR : blank('R'); if (thin) { paper('pf prv', i, 40 + 2 * i, 41 + 2 * i, ft, blank('L')); continue; } const l = leaf('r', i, 60 + i, 60 + i); face(l, 'ft', ft); face(l, 'bk', blank('R')); book.appendChild(l); }
      fin = () => { slotR.innerHTML = ''; slotR.appendChild(newR); };
    }
    pos = t; sync();
    setTimeout(() => { fin(); leaves.forEach((l) => l.remove()); busy = false; sync(); }, dur + (n - 1) * ST + 40);
  }
  const step = (d) => { if (TWO) { const s = sp(pos) + d; if (s < 0 || s > sp(P.length - 1)) return; go(s === 0 ? 0 : s * 2 - 1); } else { let t = pos + d; if (d > 0 && P[pos] && P[pos].t === 'ins') t++; if (P[t] && P[t].t === 'ins') t += d; go(t); } };

  // ── 묶기 ──
  function bindPage(el, pi) {
    const p = P[pi];
    if (p.t === 'cover') {
      const f = $('#code-f', el);
      if (f) { f.onsubmit = (e) => { e.preventDefault(); login($('#code-in', el).value); }; }
      else el.onclick = () => go(TWO ? 1 : 2);
      return;
    }
    $$('[data-jump]', el).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); const t = +b.dataset.jump; if (t >= 0) go(t, true); }));
    $$('[data-wk]', el).forEach((b) => (b.onclick = () => go(idxOf(b.dataset.wk, 'wl'), true)));
    $$('[data-fly]', el).forEach((inp) => (inp.oninput = () => { DOC.fly[inp.dataset.fly] = inp.value; DOC.fly.at = Date.now(); save(); }));
    $$('[data-new]', el).forEach((b) => (b.onclick = () => newEntry(b.dataset.new, b.dataset.date)));
    $$('[data-edit]', el).forEach((b) => (b.onclick = () => startEdit(b.closest('[data-ent]').dataset.ent)));
    $$('[data-del]', el).forEach((b) => (b.onclick = () => askDel(b.closest('[data-ent]'))));
    $$('.cell[data-jump]', el).forEach((c) => (c.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.click(); } }));
    $$('[data-font]', el).forEach((b) => (b.onclick = () => setFont(b.dataset.font)));
    $$('[data-bm]', el).forEach((b) => (b.onclick = () => setBm(b.dataset.bm)));
    const ic = $('.idc', el); if (ic) bindId(ic);
    const ta = $('#ent-ta', el);
    if (ta) {
      const fit = () => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }; requestAnimationFrame(fit);
      let t; ta.oninput = () => { fit(); const e = editing(); if (!e) return; e.text = ta.value; e.at = Date.now(); clearTimeout(t); t = setTimeout(() => { commit(); const s = $('#ent-saved'); if (s) { s.classList.add('on'); setTimeout(() => s.classList.remove('on'), 1400); } }, 400); };
      $('[data-ok]', el).onclick = () => finishEdit();
      const keep = (f) => { const tv = ta.value; f(); refresh(); const t2 = $('#ent-ta'); if (t2) t2.value = tv; };
      $('[data-addph]', el).onclick = () => pickPhoto((id, sh) => { const e = editing(); if (!e) return; keep(() => { e.text = ta.value; (e.ph = e.ph || []).push({ id, sh }); e.at = Date.now(); commit(true); }); });
      $$('[data-phx]', el).forEach((b) => (b.onclick = () => { const e = editing(); if (!e) return; keep(() => { e.ph = entPh(e).filter((x) => x.id !== b.dataset.phx); e.at = Date.now(); commit(true); }); }));
    }
    const po = $('#push-on', el); if (po) po.onclick = pushOn;
    const la = $('#lock-ask', el); if (la) la.onclick = () => { $('#lock-c').innerHTML = '<div class="ask"><span>이 기기에서 잠글까요?</span><button type="button" class="lbtn" id="lk-n">아니요</button><button type="button" class="lbtn dark" id="lk-y">잠글게요</button></div>'; $('#lk-n').onclick = () => ($('#lock-c').innerHTML = ''); $('#lk-y').onclick = () => { LS.del('jd:auth'); LS.del('jd:days'); LS.del('jd:last'); AUTH = null; DAYS = { v: 1, first: null, d: {} }; KEYP = null; buildPages(); go(0, true); setTimeout(() => mount(), 1400); }; };
    $$('.stk', el).forEach((s) => bindStk(s, pi));
  }
  const editing = () => (EDIT ? EDIT.draft || DOC.entries[EDIT.id] : null);
  function commit(force) { const e = editing(); if (!e) return; if (EDIT.draft) { if (!force && !String(e.text || '').trim() && !(e.ph || []).length) return; DOC.entries[e.id] = e; delete EDIT.draft; } save(); }
  function finishEdit(silent) { const e = editing(); if (e) { const ta = $('#ent-ta'); if (ta) e.text = ta.value; const emp = !String(e.text || '').trim() && !(e.ph || []).length; if (emp) { if (DOC.entries[e.id]) { delete DOC.entries[e.id]; DOC.gone[e.id] = Date.now(); save(); } } else { e.at = Date.now(); commit(true); } } EDIT = null; if (!silent) { refresh(); if (e && String(e.text || '').trim()) toast('오늘의 한 장, 잘 넣어 뒀어요'); } }
  function focusTa() { const ta = $('#ent-ta'); if (ta) { ta.focus({ preventScroll: true }); ta.setSelectionRange(ta.value.length, ta.value.length); ta.closest('.ent').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } }
  // 고치기: 그 글을 그대로 열어요 (새 글을 만들지 않아요). 다른 글을 쓰던 중이면 먼저 넣어 두고, 같은 내용으로 숨어 있던 쌍둥이는 정리해요
  function startEdit(id) { if (EDIT && EDIT.id === id) return focusTa(); if (EDIT) finishEdit(true); const e = DOC.entries[id]; if (!e) return refresh(); if (dropTwins(e)) save(); EDIT = { id }; refresh(); focusTa(); }
  // 지우기: 글 바로 아래에서 한 번 물어본 뒤에만 지워요. 같은 내용 쌍둥이까지 함께 지워서 모아 보기에서도 사라져요
  function askDel(box) {
    const id = box.dataset.ent, c = $('.ent-c', box); if (!c) return;
    c.innerHTML = '<div class="ask"><span>이 글을 지울까요? 지우면 되돌릴 수 없어요.</span><button type="button" class="lbtn" data-no>아니요</button><button type="button" class="lbtn dark" data-yes>지울게요</button></div>';
    c.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    $('[data-no]', c).onclick = () => { const a = $('.ask', c); if (a) { a.classList.add('out'); setTimeout(() => (c.innerHTML = ''), 200); } };
    $('[data-yes]', c).onclick = () => {
      const e = DOC.entries[id]; if (e) { dropTwins(e); delete DOC.entries[id]; DOC.gone[id] = Date.now(); save(); }
      if (EDIT && EDIT.id === id) EDIT = null;
      box.style.height = box.offsetHeight + 'px'; box.offsetHeight; box.classList.add('out');
      setTimeout(() => { refresh(); toast('지웠어요'); }, 380);
    };
  }
  // 쓰기: 그 날짜 페이지에 그 종류 글이 이미 있으면 새로 만들지 않고 그 글을 열어요 (같은 글이 두 개 생기지 않게)
  let NEWT = 0;
  function newEntry(kind, date) {
    date = isDate(date) && date <= TODAY() ? date : TODAY(); if (busy || NEWT || idxD(date) < 0) return;
    const start = () => {
      NEWT = 0; const i = idxD(date), v = view(pos); if (i < 0 || (v.L !== i && v.R !== i)) return;
      if (EDIT) finishEdit(true);
      const old = dayEntries(date).filter((e) => (kind === 'worry') === isW(e)).pop(); if (old) return startEdit(old.id);
      const e = { id: 'e' + uid(), date, kind, text: '', c: Date.now(), at: Date.now() }; EDIT = { id: e.id, draft: e }; refresh(); focusTa();
    };
    const i = idxD(date), v = view(pos); if (v.L === i || v.R === i) return start();
    go(i, true); NEWT = 1; (function wait() { if (busy) setTimeout(wait, 60); else setTimeout(start, 80); })();
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
    if (e.target.closest('.stk, button, textarea, input, a, label, .cell, .ent, .did-box, .fld, .set, .ym, .toc-l, .row, .pc, .mine, .cal, .fonts, .dp-h, .dp-plan, .wsum, .lst-h, .ask')) return;
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
  let TG = 'phrase';
  function stkTray() {
    const items = ORDER.filter((k) => STK[k].g === TG);
    openTray(`<div class="tray-h"><b>붙이기</b>${[['phrase', '문구'], ['chip', '낱말 칩'], ['pixel', '픽셀'], ['lace', '레이스']].map(([g, n]) => `<button type="button" data-g="${g}" class="${TG === g ? 'on' : ''}">${n}</button>`).join('')}<button type="button" data-x>닫기</button></div><div class="tray-g g-${TG}">${TG === 'phrase' ? '<button type="button" class="mine" data-mine style="--i:0">내 사진 올려서<br>오려 붙이기</button>' : TG === 'chip' ? '<button type="button" class="mine" data-note style="--i:0">빈 쪽지 붙이기<br>(내 글씨로 써요)</button>' : ''}${items.map((k, i) => `<button type="button" data-k="${k}" style="--i:${i + 1};--tw:${STK[k].w}" aria-label="${esc(STK[k].n)}"><div>${STK[k].h}</div></button>`).join('')}</div>`, (el) => {
      $('[data-x]', el).onclick = closeTray; $$('[data-g]', el).forEach((b) => (b.onclick = () => { TG = b.dataset.g; stkTray(); }));
      const m = $('[data-mine]', el); if (m) m.onclick = () => pickPhoto((id, sh) => addStk('img', { ph: id, sh }));
      const nt = $('[data-note]', el); if (nt) nt.onclick = () => addStk('note', { t: '' });
      $$('[data-k]', el).forEach((b) => (b.onclick = () => { if (b.classList.contains('pick')) return; b.classList.add('pick'); setTimeout(() => addStk(b.dataset.k), 150); }));
    });
  }
  $('#b-stk').onclick = () => { if (!tray.classList.contains('hide') && $('.tray-g', tray)) return closeTray(); stkTray(); };
  $('#b-toc').onclick = () => go(idxT('toc'), true);
  $('#b-write').onclick = () => { if (EDIT && $('#ent-ta')) return focusTa(); const T = dayEntries(TODAY()), hd = T.some((e) => !isW(e)), hw = T.some(isW); openTray(`<div class="tray-h"><b>오늘 페이지에 쓰기</b><button type="button" data-x>닫기</button></div><div class="tray-w"><button type="button" data-n="day" style="--i:0"><span>${hd ? '오늘 일기 이어 쓰기' : '오늘 일기 쓰기'}</span><small>있었던 일 · 기분</small></button><button type="button" data-n="worry" style="--i:1"><span>${hw ? '오늘 적은 고민 이어 쓰기' : '고민 적어 두기'}</span><small>나만 보기</small></button></div>`, (el) => { $('[data-x]', el).onclick = closeTray; $$('[data-n]', el).forEach((b) => (b.onclick = () => { closeTray(); newEntry(b.dataset.n); })); }); };
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
    try { const o = await resolve(w); if (!mine(o)) { if (err) err.textContent = o ? '이 다이어리는 주인만 열 수 있어요' : '코드를 다시 확인해 주세요'; return false; } AUTH = { who: o.who, code: o.code }; LS.set('jd:auth', AUTH); KEYP = null; afterAuth(); mount(); setTimeout(() => go(TWO ? 1 : 2), 500); return true; }
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
    applyFont(); LS.del('jd:weeks');   // 예전 주 단위 저장 칸은 더 쓰지 않아요 (날짜 단위 jd:days 로 바뀜)
    if (MOCK) AUTH = { who: CFG.owner, code: '' };
    if (!AUTH) { const u = LS.get('mallang-univ:v1', null); if (u && u.who === CFG.owner && (u.role || 'student') === 'student' && u.syncKey) { AUTH = { who: u.who, code: u.syncKey }; LS.set('jd:auth', AUTH); } }   // 같은 브라우저에서 말랑대학을 쓰고 있으면 그대로 열려요
    if (!DOC.fly.since) { let s0 = LS.get('jd:since', ''); if (!s0) { const d = new Date(); s0 = `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`; LS.set('jd:since', s0); } DOC.fly.since = s0; }   // 처음 연 날을 한 번만 적어 두고 그대로 써요 (카드에서 눌러 고칠 수 있어요)
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
