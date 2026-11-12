/* 다이어리 스티커 (11/13 다시 만듦)
   · 사진: Unsplash 무료 사진을 폴라로이드·찢은 종이·아치·둥근 오림·테이프로 가공 (출처 source/photos/CREDITS.md)
   · 문구 종이: 실제 인쇄물처럼 보이는 포스터·레터 카드·형광펜 메모·도장 글자
   · 그린 그림(하트·별·리본 같은 것)은 쓰지 않아요.  w = 종이 너비에 대한 기본 너비 비율 */
(() => {
  const ph = (f, sh, extra) => `<div class="pc sh-${sh}"><div class="pc-i"><img src="assets/ph/${f}.webp" alt="" draggable="false"></div>${extra || ''}</div>`;
  const CLIP = `<svg class="bclip" viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9bc8c"/><stop offset=".5" stop-color="#b58f58"/><stop offset="1" stop-color="#8a6a3c"/></linearGradient><linearGradient id="bcw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6a6a6a"/><stop offset=".5" stop-color="#d8d8d8"/><stop offset="1" stop-color="#5a5a5a"/></linearGradient></defs><path d="M52 22C20 6 6 12 6 34s14 30 46 14" fill="none" stroke="url(#bcw)" stroke-width="4" stroke-linecap="round"/><path d="M52 30C28 20 16 24 16 34s12 14 36 6" fill="none" stroke="url(#bcw)" stroke-width="3" stroke-linecap="round" opacity=".8"/><path d="M50 6h58a6 6 0 0 1 6 6v46a6 6 0 0 1-6 6H50z" fill="url(#bcg)"/><path d="M50 6h58a6 6 0 0 1 6 6v8H50z" fill="#fff" opacity=".28"/><path d="M50 6v58" stroke="#5e4522" stroke-width="2.5"/><path d="M60 44h46" stroke="#5e4522" stroke-width="1.5" opacity=".35"/></svg>`;
  const tiles = (rows) => rows.map((r) => `<span class="rl-r">${r.map(([c, s]) => `<b class="rl s${s}">${c}</b>`).join('')}</span>`).join('');
  const L = (w, st) => w.split('').map((c, i) => [c, st[i % st.length]]);
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
  };
  window.STK_ORDER = Object.keys(window.STK);
})();
