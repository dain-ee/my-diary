/* 다이어리 스티커 (11/13 다시 만듦)
   · 사진: Unsplash 무료 사진을 폴라로이드·찢은 종이·아치·둥근 오림·테이프로 가공 (출처 source/photos/CREDITS.md)
   · 문구 종이: 실제 인쇄물처럼 보이는 포스터·레터 카드·형광펜 메모·도장 글자
   · 그린 그림(하트·별·리본 같은 것)은 쓰지 않아요.  w = 종이 너비에 대한 기본 너비 비율 */
(() => {
  const ph = (f, sh, extra) => `<div class="pc sh-${sh}"><div class="pc-i"><img src="assets/ph/${f}.webp" alt="" draggable="false"></div>${extra || ''}</div>`;
  const CLIP = `<svg class="bclip" viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9bc8c"/><stop offset=".5" stop-color="#b58f58"/><stop offset="1" stop-color="#8a6a3c"/></linearGradient><linearGradient id="bcw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6a6a6a"/><stop offset=".5" stop-color="#d8d8d8"/><stop offset="1" stop-color="#5a5a5a"/></linearGradient></defs><path d="M52 22C20 6 6 12 6 34s14 30 46 14" fill="none" stroke="url(#bcw)" stroke-width="4" stroke-linecap="round"/><path d="M52 30C28 20 16 24 16 34s12 14 36 6" fill="none" stroke="url(#bcw)" stroke-width="3" stroke-linecap="round" opacity=".8"/><path d="M50 6h58a6 6 0 0 1 6 6v46a6 6 0 0 1-6 6H50z" fill="url(#bcg)"/><path d="M50 6h58a6 6 0 0 1 6 6v8H50z" fill="#fff" opacity=".28"/><path d="M50 6v58" stroke="#5e4522" stroke-width="2.5"/><path d="M60 44h46" stroke="#5e4522" stroke-width="1.5" opacity=".35"/></svg>`;
  const tiles = (rows) => rows.map((r) => `<span class="rl-r">${r.map(([c, s]) => `<b class="rl s${s}">${c}</b>`).join('')}</span>`).join('');
  const L = (w, st) => w.split('').map((c, i) => [c, st[i % st.length]]);
  // ▼ W4 도우미
  // ── 낙서 문구 스티커 (11/13): 동물 얼굴은 손으로 그린 듯한 가는 선 SVG, 글자는 손글씨 글꼴로 얹어요 ──
  const INK = '#2b2a2e';
  const EYE = (e, x1, x2, y) => (e === 'sleep' || e === 'happy' ? `<path d="${[x1, x2].map((x) => (e === 'sleep' ? `M${x - 2.9} ${y - 0.4}c1.600 1.600 4.200 1.600 5.800 0` : `M${x - 2.9} ${y + 1}c1.400-2.600 4.400-2.600 5.800 0`)).join('')}" fill="none" stroke="${INK}" stroke-width="1.900" stroke-linecap="round"/>` : `<circle cx="${x1}" cy="${y}" r="2"/><circle cx="${x2}" cy="${y}" r="2"/>`);
  const HEAD = 'M10 41c-.6-10.5 8.6-18.6 21.6-18.8 13.4-.2 22.6 7.6 22.4 18.2-.2 10.8-9 17.4-22.6 17.6C18.6 58.2 10.6 51.6 10 41z';
  const CHEEK = `<ellipse cx="16.8" cy="44" rx="3.3" ry="2.1" fill="#ffadc0" opacity=".85"/><ellipse cx="47.2" cy="44" rx="3.3" ry="2.1" fill="#ffadc0" opacity=".85"/>`;
  const MOUTH = `<path d="M27.6 43.4c.9 2.3 3.5 2.3 4.4 0 .9 2.3 3.5 2.3 4.4 0"/>`;
  const FACE = {
    frog: (e) => `<path fill="#c4ecd2" d="M9.5 42c-.4-6 2.2-10.6 5.6-13.6-1.6-5 1.6-9.6 6.4-9.8 4-.2 7 2.4 7.6 5.8 1.9-.3 3.9-.3 5.8 0 .8-3.6 3.8-6 7.8-5.8 4.8.3 7.8 5 6.2 9.8 3.6 3.2 6 7.8 5.6 13.4-.8 10.6-9.6 16.4-22.8 16.4C19 58.2 10.2 52.6 9.500 42z"/>${CHEEK}<g fill="${INK}" stroke="none">${EYE(e, 21.5, 42.5, 26.5)}</g><path d="M26.600 39.400c1 2.700 4.400 2.700 5.400 0 1 2.700 4.400 2.700 5.400 0"/>`,
    bear: (e) => `<path fill="#f3dfc6" d="M9.400 26.500c-.3-4.300 2.800-7.600 6.800-7.500 3.900.1 6.900 3.300 6.600 7.300M54.600 26.500c.3-4.300-2.800-7.600-6.800-7.500-3.900.1-6.900 3.300-6.600 7.300"/><path fill="#f3dfc6" d="${HEAD}"/><ellipse cx="32" cy="45.600" rx="7.600" ry="5.600" fill="#fffaf2" stroke="none"/>${CHEEK}<g fill="${INK}" stroke="none">${EYE(e, 22.5, 41.5, 38)}<ellipse cx="32" cy="42.600" rx="2.300" ry="1.600"/></g><path d="M32 44.200v2M29.400 47.400c1.300 1.300 3.900 1.300 5.200 0"/>`,
    mouse: (e) => `<path fill="#e6e3ea" d="M4.600 23.600c-.2-5.600 4-9.800 9.400-9.700 5.300.1 9.300 4.300 9.200 9.700-.1 5.300-4.200 9.300-9.500 9.300-5.100 0-8.900-4-9.100-9.300zM59.400 23.600c.2-5.600-4-9.800-9.400-9.700-5.300.1-9.300 4.300-9.200 9.700.1 5.300 4.200 9.300 9.500 9.300 5.100 0 8.900-4 9.100-9.300z"/><circle cx="14" cy="23.600" r="4.800" fill="#ffd0dc" stroke="none"/><circle cx="50" cy="23.600" r="4.800" fill="#ffd0dc" stroke="none"/><path fill="#e6e3ea" d="${HEAD}"/>${CHEEK}<g fill="${INK}" stroke="none">${EYE(e, 22.5, 41.5, 38)}<ellipse cx="32" cy="42.800" rx="1.700" ry="1.300"/></g><path d="M29.800 46c1 1.500 3.400 1.500 4.400 0M9 45.500l-6-1M9.400 48.800l-5.600 1.600M55 45.500l6-1M54.600 48.800l5.600 1.600"/>`,
    cat: (e) => `<path fill="#fff" d="M10 42c-.3-4.600 1-8.800 3.400-12l-.8-13.500c-.1-1.400 1.300-2.200 2.500-1.400l10 7.200c2.200-.6 4.500-.9 7-.9 2.600 0 5 .3 7.200 1l9.800-7.400c1.200-.9 2.700 0 2.600 1.400l-.9 13.400c2.400 3.200 3.600 7.400 3.400 12-.6 10.400-9.400 16.400-22.400 16.400S10.700 52.600 10 42z"/>${CHEEK}<g fill="${INK}" stroke="none">${EYE(e, 22.5, 41.5, 38)}</g><path d="M30.700 41.600h2.600L32 43z" fill="#ff9db4" stroke-width="1.300"/>${MOUTH.replace('43.4', '44.4')}<path d="M9.600 46l-6-.6M10 49.400l-5.600 1.800M54.400 46l6-.6M54 49.400l5.600 1.800"/>`,
    bunny: (e) => `<path fill="#ffe3ec" d="M23.400 27c-4.600-8.400-5.800-19.600-2-22.400 3.800-2.700 8.800 6.200 9.400 19.400M40.600 27c4.600-8.400 5.800-19.600 2-22.400-3.800-2.700-8.800 6.200-9.400 19.400"/><path d="M24.400 20c-1.400-4.400-1.600-8.400-.8-10.400M39.600 20c1.400-4.400 1.600-8.400.8-10.400" stroke="#ffadc0" stroke-width="2.600"/><path fill="#ffe3ec" d="${HEAD}"/>${CHEEK}<g fill="${INK}" stroke="none">${EYE(e, 22.5, 41.5, 38)}</g><path d="M30.800 42.200h2.400L32 43.500z" fill="#ff9db4" stroke-width="1.300"/><path d="M32 43.600v1.600M29 46.600c1.200 1.500 2.400 1.300 3-.4.600 1.700 1.800 1.900 3 .4"/>`,
    chick: (e) => `<path d="M31.400 22.400c-2.400-3.800-1.800-7.200.6-8.800M32.800 22.200c.6-3.600 3-5.800 5.600-5.600"/><path fill="#fff3ae" d="${HEAD}"/>${CHEEK}<g fill="${INK}" stroke="none">${EYE(e, 22.5, 41.5, 38)}</g><path d="M28.400 43.600l3.600-2.600 3.600 2.600-3.600 2.400z" fill="#ffb96e" stroke-width="1.500"/>`,
  };
  const A = (k, e) => `<svg class="ds-a" viewBox="0 0 64 62" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="${INK}" stroke-width="2.100" stroke-linecap="round" stroke-linejoin="round">${FACE[k](e || 'dot')}</g></svg>`;
  const SPK = `<svg class="ds-i" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2c.7 4.600 2.600 6.900 8 8-5.400 1.100-7.300 3.400-8 8-.7-4.600-2.600-6.900-8-8 5.400-1.100 7.300-3.400 8-8z" fill="#fff" stroke="${INK}" stroke-width="1.500" stroke-linejoin="round"/></svg>`;
  const STAR = (x, y, s) => `<svg class="ds-st" style="left:${x}%;top:${y}%;width:${s}%" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 1.500l2.500 5.600 6 .7-4.500 4 1.300 6-5.300-3.100-5.300 3.100 1.300-6-4.500-4 6-.7z" fill="#fff3a6"/></svg>`;
  const CLD = (c) => `<svg class="ds-cs" viewBox="0 0 100 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><g fill="${c}"><rect x="16" y="14" width="68" height="34"/><circle cx="22" cy="23" r="16"/><circle cx="41" cy="16" r="15"/><circle cx="61" cy="16" r="15"/><circle cx="79" cy="23" r="16"/><circle cx="85" cy="37" r="14"/><circle cx="69" cy="45" r="14"/><circle cx="50" cy="46" r="13.500"/><circle cx="31" cy="45" r="14"/><circle cx="15" cy="37" r="14"/></g></svg>`;
  const ds = (c, h) => `<div class="ds ${c}">${h}</div>`;
  const T = (t, c) => `<span class="ds-t ${c || ''}">${t}</span>`;
  const B = (t) => `<span class="ds-b">${t}</span>`;
  const CL = (t) => `<span class="ds-cl">${CLD('#fff')}<b>${t}</b></span>`;
  const WIN = (ttl, body, foot) => `<div class="ds ds-win"><div class="ds-wt"><b>${ttl}</b><i></i><i></i><i></i></div><div class="ds-wb">${body}</div><div class="ds-wf">${foot}</div></div>`;
  // ── 파스텔 블록 · 도트 글씨 · 픽셀 아이콘 (전체 디자인 기준과 같은 결) ──
  const pix = (rows, c) => `<svg class="px-ic ${c || ''}" viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg" style="--pa:${rows[0].length / rows.length}">${rows.map((r, y) => r.split('').map((ch, x) => (ch === 'X' ? `<rect x="${x}" y="${y}" width="1" height="1"/>` : '')).join('')).join('')}</svg>`;
  const P_HEART = pix(['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...']);
  const P_CHERRY = pix(['....XXX..', '...X..X..', '..X...X..', '.X....X..', '.XX...XX.', 'XXXX.XXXX', 'XXXX.XXXX', '.XX...XX.']);
  const P_KEY = pix(['.XX.........', 'X..X........', 'X..XXXXXXXXX', 'X..X....X.X.', '.XX.........']);
  const P_STAR = pix(['...X...', '..XXX..', 'XXXXXXX', '.XXXXX.', '.XXXXX.', '.XX.XX.', 'X.....X']);
  const P_SET = `<span class="px-is">${P_CHERRY}${P_HEART}${P_KEY}</span>`;
  const drops = (c, pts) => pts.map(([x, y]) => `<i class="px-dr ${c}" style="left:${x}%;top:${y}%"></i>`).join('');
  const PH = (c, w) => `<div class="px-h ${c}"><svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg"><path d="M50 88C20 66 3 48 3 28 3 13 14 3 27 3c9 0 17 5 23 14C56 8 64 3 73 3c13 0 24 10 24 25 0 20-17 38-47 60z"/></svg><b>${w}</b></div>`;
  // ▲ W4 도우미
  window.STK = {
    // ── 문구 종이 ──
    poster: { w: 0.2, g: 'print', n: '크림 포스터', h: `<div class="pr pr-poster"><i class="pr-tab">reminder</i><b>one<br>page<br>at a<br>time</b></div>` },
    posterk: { w: 0.2, g: 'print', n: '크림 포스터(한글)', h: `<div class="pr pr-poster ko"><i class="pr-tab">remember</i><b>다시,<br>또 다시<br>해 보는<br>거야</b></div>` },
    ransom: { w: 0.22, g: 'print', n: '레터 카드', h: `<div class="pr pr-ransom">${CLIP}${tiles([L('you', [1, 2, 3]).concat([[' ', 0]], L('are', [4, 5, 1])), L('doing', [2, 6, 3, 1, 5]), L('just', [4, 2, 6, 3]), L('fine', [5, 1, 4, 2])])}</div>` },
    ransomk: { w: 0.22, g: 'print', n: '레터 카드(한글)', h: `<div class="pr pr-ransom ko">${CLIP}${tiles([L('오늘도', [1, 4, 2]), L('충분히', [3, 5, 6]), L('잘했어', [2, 1, 4])])}</div>` },
    blob: { w: 0.2, g: 'print', n: '마커 문구', h: `<div class="pr pr-blob"><i>what if it all</i><b>GOES<br>RIGHT?</b></div>` },
    hl: { w: 0.3, g: 'print', n: '형광펜 메모', h: `<div class="pr pr-hl"><u></u><span>a reminder that every</span><span>little step still counts.</span><span>keep going, even slowly,</span><span>and be kind to you.</span><u class="b"></u></div>` },
    hlk: { w: 0.3, g: 'print', n: '형광펜 메모(한글)', h: `<div class="pr pr-hl ko"><u></u><span>지금 힘든 건 지나가는 중이라는 뜻.</span><span>오늘의 나는 어제보다</span><span>한 뼘 더 자랐다.</span><u class="b"></u></div>` },
    slow: { w: 0.15, g: 'print', n: 'slow down', h: `<div class="pr pr-slow">slow<br><span>down</span></div>` },
    beads: { w: 0.3, g: 'print', n: '구슬 글자', h: `<div class="pr pr-beads">${'THOUGHTS'.split('').map((c) => `<b>${c}</b>`).join('')}</div>` },
    beads2: { w: 0.2, g: 'print', n: '구슬 글자 TODAY', h: `<div class="pr pr-beads">${'TODAY'.split('').map((c) => `<b>${c}</b>`).join('')}</div>` },
    word: { w: 0.13, g: 'print', n: '큰 낱말', h: `<div class="pr pr-word">ST<br>UD<br>Y!</div>` },
    stamp: { w: 0.12, g: 'print', n: '도장 글자', h: `<div class="pr pr-stamp">BR<br>EAT<br>HE</div>` },
    brush: { w: 0.26, g: 'print', n: '붓글씨 쪽지', h: `<div class="pr pr-brush">Let it be<br>slow<br>and<br>messy<br>and mine.</div>` },
    tag1: { w: 0.14, g: 'print', n: '라벨 reading', h: `<div class="pr pr-tag">reading</div>` },
    tag2: { w: 0.17, g: 'print', n: '라벨 this week', h: `<div class="pr pr-tag">this week's</div>` },
    tag3: { w: 0.17, g: 'print', n: '라벨 오늘의 한 장', h: `<div class="pr pr-tag ko">오늘의 한 장</div>` },
    skyq: { w: 0.24, g: 'print', n: '사진 포스터', h: `<div class="pr pr-photoq"><img src="assets/ph/sky0.webp" alt="" draggable="false"><b>don't forget<br>good things<br>take time.</b></div>` },
    tape: { w: 0.22, g: 'print', n: '마스킹테이프', h: `<div class="pr pr-tape"></div>` },
    // ── 실제 사진 ──
    f_peony: { w: 0.24, g: 'photo', n: '작약 (오림)', h: `<div class="pc sh-cut"><img src="assets/ph/peony0.webp" alt="" draggable="false"></div>` },
    f_latte: { w: 0.24, g: 'photo', n: '라테 (폴라로이드)', h: ph('latte1', 'pol') },
    f_cake: { w: 0.22, g: 'photo', n: '딸기 케이크 (둥글게)', h: ph('cake1', 'round') },
    f_matcha: { w: 0.19, g: 'photo', n: '말차 (아치)', h: ph('matcha0', 'arch') },
    f_book: { w: 0.22, g: 'photo', n: '책과 커피 (테이프)', h: ph('book0', 'tape') },
    f_sky: { w: 0.28, g: 'photo', n: '노을 (찢은 종이)', h: ph('sky0', 'torn') },
    f_sea: { w: 0.26, g: 'photo', n: '바다 (폴라로이드)', h: ph('sea1', 'pol') },
    f_tulip: { w: 0.22, g: 'photo', n: '튤립 (폴라로이드)', h: ph('tulip2', 'pol') },
    f_croissant: { w: 0.27, g: 'photo', n: '크루아상 (찢은 종이)', h: ph('croissant1', 'torn') },
    f_window: { w: 0.19, g: 'photo', n: '커튼 창 (아치)', h: ph('window0', 'arch') },
    f_desk: { w: 0.26, g: 'photo', n: '공책 (테이프)', h: ph('desk2', 'tape') },
    f_books: { w: 0.26, g: 'photo', n: '책 더미 (네모)', h: ph('books0', 'sq') },
    f_sky2: { w: 0.19, g: 'photo', n: '분홍 하늘 (아치)', h: ph('sky2', 'arch') },
    f_book1: { w: 0.2, g: 'photo', n: '펼친 책 (네모)', h: ph('book1', 'sq', '<i class="pc-tag">reading</i>') },
    f_latte2: { w: 0.2, g: 'photo', n: '라테 (둥글게)', h: ph('latte2', 'round') },
    f_cake0: { w: 0.26, g: 'photo', n: '케이크 한 조각 (찢은 종이)', h: ph('cake0', 'torn') },
    // ▼ W4 스티커
    // ── 낙서 문구 (동물 낙서 + 손글씨 한 줄) ──
    d_frog1: { w: 0.4, g: 'doodle', n: '개구리 말풍선', h: ds('c-y', A('frog') + B('오늘도 어찌저찌 해냄')) },
    d_bear1: { w: 0.24, g: 'doodle', n: '곰 체크무늬', h: ds('c-p chk', A('bear') + SPK + T('할 일<br>짱 많음')) },
    d_night1: { w: 0.33, g: 'doodle', n: '밤하늘 쥐', h: ds('night', STAR(3, 8, 7) + STAR(33, 66, 6) + STAR(91, 62, 6) + A('mouse', 'sleep') + CL('내일의 나에게<br>맡긴다')) },
    d_win1: { w: 0.32, g: 'doodle', n: '알림창 일기 끝', h: WIN('알림', A('cat') + T('오늘 일기 끝.<br>종료하시겠습니까?'), '<em>예</em>') },
    d_memo1: { w: 0.26, g: 'doodle', n: '줄 메모 토끼', h: ds('memo c-m', T('일단 앉았다<br>그게 어디야') + A('bunny')) },
    d_cloud1: { w: 0.25, g: 'doodle', n: '구름 병아리', h: ds('cloud', CLD('#d9edfc') + A('chick') + T('그래도<br>해야지')) },
    d_tape1: { w: 0.32, g: 'doodle', n: '테이프 수학', h: ds('tape c-l', T('수학이 나를 좋아하나 봐')) },
    d_frog2: { w: 0.335, g: 'doodle', n: '개구리 충전', h: ds('c-m box', `<span class="ds-f">${A('frog', 'happy')}${T('집중력 5분 충전 중')}</span>`) },
    d_cat1: { w: 0.29, g: 'doodle', n: '졸린 고양이', h: ds('c-s', A('cat', 'sleep') + T('졸린 게 아니라<br>눈을 쉬는 중')) },
    d_mouse1: { w: 0.155, g: 'doodle', n: '쥐 간식', h: ds('c-y col', A('mouse') + T('간식은<br>공부의 연료')) },
    d_bunny1: { w: 0.42, g: 'doodle', n: '토끼 칭찬', h: ds('c-p', A('bunny', 'happy') + B('여기까지 한 나 칭찬해')) },
    d_bear2: { w: 0.31, g: 'doodle', n: '곰 계획', h: ds('c-l', T('계획은 완벽했다<br>실천은 내일부터') + A('bear', 'sleep')) },
    d_win2: { w: 0.27, g: 'doodle', n: '저장 중 창', h: WIN('저장', T('오늘의 기억 저장 중') + '<u class="ds-pg"><s></s></u>', T('99%', 'pxf')) },
    d_night2: { w: 0.28, g: 'doodle', n: '밤하늘 고양이', h: ds('night', STAR(4, 62, 6) + STAR(36, 6, 7) + STAR(90, 10, 6) + A('cat', 'happy') + CL('밤 11시의<br>나는 천재')) },
    d_tape2: { w: 0.28, g: 'doodle', n: '테이프 시험 범위', h: ds('tape c-m', T('시험 범위 실화인가요')) },
    d_chick1: { w: 0.35, g: 'doodle', n: '병아리 말풍선', h: ds('c-s dots', A('chick', 'happy') + B('엄청 열심히 한 날')) },
    d_memo2: { w: 0.305, g: 'doodle', n: '줄 메모 할 일', h: ds('memo c-y', T('오늘의 할 일<br>1. 버티기 2. 간식') + A('bear')) },
    d_cloud2: { w: 0.275, g: 'doodle', n: '구름 개구리', h: ds('cloud', CLD('#ffe0ea') + A('frog', 'sleep') + T('멍 때리기<br>10분 허락')) },
    d_seal1: { w: 0.18, g: 'doodle', n: '둥근 도장 병아리', h: ds('seal c-y', A('chick') + T('대충<br>잘했어요')) },
    d_mouse2: { w: 0.265, g: 'doodle', n: '쥐 체크무늬', h: ds('c-s chk', A('mouse', 'happy') + T('숙제가 나를<br>부른다')) },
    d_frog3: { w: 0.155, g: 'doodle', n: '개구리 일찍 자기', h: ds('c-m col', A('frog') + T('일찍 자기<br>도전 3일째')) },
    d_bunny2: { w: 0.31, g: 'doodle', n: '토끼 단어', h: ds('c-p box', `<span class="ds-f">${T('단어는 외웠는데<br>뜻이 도망감')}${A('bunny', 'sleep')}</span>`) },
    d_tape3: { w: 0.26, g: 'doodle', n: '테이프 맑음', h: ds('tape c-y', SPK + T('오늘 기분 맑음') + SPK) },
    d_win3: { w: 0.22, g: 'doodle', n: '질문 창', h: WIN('질문', A('bear', 'happy') + T('5분만 더<br>쉴까요?'), '<em>예</em><em>예</em>') },
    d_seal2: { w: 0.18, g: 'doodle', n: '둥근 도장 고양이', h: ds('seal c-p', A('cat', 'happy') + T('참 잘<br>버텼어요')) },
    // ── 파스텔 블록 ──
    p_card1: { w: 0.34, g: 'pastel', n: '흰 블록 small steps', h: `<div class="px"><p class="px-t">small steps,<br>soft days ${P_SET}</p><p class="px-c">ONE PAGE AT A TIME<br>IS MORE THAN ENOUGH</p></div>` },
    p_card2: { w: 0.36, g: 'pastel', n: '분홍 블록 good try', h: `<div class="px pk"><p class="px-t">today was<br>a good try ${P_SET}</p><p class="px-k">오늘도 한 쪽 채웠다</p></div>` },
    p_dot1: { w: 0.25, g: 'pastel', n: '하늘 블록 도트 글씨', h: `<div class="px sk"><p class="px-d">STUDY NOW<br>NAP LATER<br>SNACKS ${P_CHERRY}<br>ALWAYS</p><span class="px-cn">${P_HEART}</span></div>` },
    p_dot2: { w: 0.27, g: 'pastel', n: '분홍 블록 도트 글씨', h: `<div class="px pk ce"><p class="px-d">EVERY PAGE<br>I FILL MAKES<br>ME A LITTLE<br>BRAVER.</p></div>` },
    p_big: { w: 0.4, g: 'pastel', n: '하늘 블록 My Day', h: `<div class="px sk"><p class="px-big"><span>My Day</span> ${P_STAR}</p><p class="px-c">THE DESK LAMP IS ON ${P_CHERRY}<br>MY PENCIL IS MOVING<br>THAT IS ALREADY A WIN</p></div>` },
    p_drops: { w: 0.3, g: 'pastel', n: '물방울과 형광펜 낱말', h: `<div class="px dr">${drops('pk', [[12, 30], [64, 8], [46, 44], [84, 52], [22, 78], [58, 90]])}${drops('sk', [[34, 14], [88, 24], [8, 56], [70, 70], [40, 68]])}<b class="px-hl" style="left:10%;top:12%">cozy</b><b class="px-hl pk" style="left:58%;top:28%">sleepy</b><b class="px-hl pk" style="left:14%;top:52%">snack</b><b class="px-hl" style="left:54%;top:74%">again</b></div>` },
    p_heart1: { w: 0.2, g: 'pastel', n: '분홍 하트 Dream', h: PH('pk', 'Dream') },
    p_heart2: { w: 0.2, g: 'pastel', n: '하늘 하트 Lucky', h: PH('sk', 'Lucky') },
    p_lab1: { w: 0.12, g: 'pastel', n: '형광펜 라벨 today', h: `<div class="px-lab">today</div>` },
    p_lab2: { w: 0.155, g: 'pastel', n: '형광펜 라벨 오늘의 기분', h: `<div class="px-lab pk ko">오늘의 기분</div>` },
    p_ko: { w: 0.32, g: 'pastel', n: '흰 블록 천천히', h: `<div class="px"><p class="px-k big">천천히 가도<br>도착은 한다</p><p class="px-c">SLOW IS STILL MOVING ${P_STAR}${P_KEY}</p></div>` },
    p_mine: { w: 0.46, g: 'pastel', n: '흰 블록과 하트 Mine', h: `<div class="px rw"><div><p class="px-t sm">this page<br>is all mine ${P_SET}</p><p class="px-c">NO ONE GRADES<br>WHAT I WRITE HERE</p></div>${PH('pk', 'Mine')}</div>` },
    p_icons: { w: 0.24, g: 'pastel', n: '픽셀 아이콘 줄', h: `<div class="px-row">${P_HEART}${P_CHERRY}${P_STAR}${P_KEY}</div>` },
    // ▲ W4 스티커
  };
  window.STK_ORDER = Object.keys(window.STK);
})();
