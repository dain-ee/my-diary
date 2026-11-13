/* 다이어리 스티커 (11/13 다시 만듦)
   글자가 주인공인 납작한 라벨 블록이에요. 블록 색은 연분홍 · 연하늘 · 흰색 셋, 글씨와 그림은 먹회색 한 색.
   그림 파일은 쓰지 않고 전부 HTML · CSS · 픽셀 SVG 로 그려요.  w = 종이 너비에 대한 기본 너비 비율
   예전 스티커 키(d_*, g_*, 사진 · 문구 종이)는 여기 없어서, 이미 붙여 둔 것은 화면에 그려지지 않아요(데이터는 그대로). */
(() => {
  // 픽셀 그림: X = 찍힌 점, o = 성기게 찍힌 점(한 칸 건너). 점은 칸보다 조금 작게 찍어서 도트 프린터 결을 내요
  const D = 0.9;
  const pix = (rows, c) => `<svg class="px-ic ${c || ''}" viewBox="0 0 ${rows[0].length} ${rows.length}" xmlns="http://www.w3.org/2000/svg" style="--pa:${rows[0].length / rows.length}">${rows.map((r, y) => r.split('').map((ch, x) => (ch === 'X' || (ch === 'o' && (x + y) % 2 === 0) ? `<rect x="${x}" y="${y}" width="${D}" height="${D}"/>` : '')).join('')).join('')}</svg>`;
  const R = {
    heart: ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'],
    heart2: ['..XX...XX..', '.XXXX.XXXX.', 'XXXXXXXXXXX', 'XXXXXXXXXXX', 'ooooooooooo', '.ooooooooo.', '..ooooooo..', '...ooooo...', '....ooo....', '.....o.....'],
    cherry: ['....XXX..', '...X..X..', '..X...X..', '.X....X..', '.XX...XX.', 'XXXX.XXXX', 'XXXX.XXXX', '.XX...XX.'],
    key: ['.XX.........', 'X..X........', 'X..XXXXXXXXX', 'X..X....X.X.', '.XX.........'],
    star: ['...X...', '..XXX..', 'XXXXXXX', '.XXXXX.', '.XXXXX.', '.XX.XX.', 'X.....X'],
    bow: ['.XX.......XX.', 'XXXX.....XXXX', 'XooXX.X.XXooX', 'XoooXXXXXoooX', 'XooXX.X.XXooX', 'XXXX.X.X.XXXX', '.XX.X...X.XX.'],
    tulip: ['.X..X..X.', '.XXXXXXX.', '.XoooooX.', '.XoooooX.', '..XXXXX..', '...XXX...', '....X....', 'X...X...X', 'XX..X..XX', '.XX.X.XX.', '..XXXXX..', '....X....'],
    batt: ['XXXXXXXXXX..', 'X........XX.', 'X.XX.XX..XX.', 'X.XX.XX..XX.', 'X........XX.', 'XXXXXXXXXX..'],
    arrow: ['....X..', 'XXXXXX.', 'XXXXXXX', 'XXXXXX.', '....X..'],
    cursor: ['X......', 'XX.....', 'XXX....', 'XXXX...', 'XXXXX..', 'XXXXXX.', 'XXXX...', 'X..XX..', '...XX..', '....X..'],
    mail: ['XXXXXXXXXXX', 'XX.......XX', 'X.X.....X.X', 'X..X...X..X', 'X...X.X...X', 'X....X....X', 'X.........X', 'XXXXXXXXXXX'],
    note: ['..XXXXX', '..X...X', '..X...X', '..X...X', '..X...X', '.XX..XX', 'XXX.XXX', 'XX..XX.'],
    moon: ['..XXX...', '.XXo....', 'XXo.....', 'XXo.....', 'XXo....X', 'XXXo..XX', '.XXXXXX.', '..XXXX..'],
    cup: ['.X.X.X...', '..X.X....', 'XXXXXXX..', 'XoooooXXX', 'XoooooX.X', 'XoooooXXX', '.XoooX...', '.XXXXX...'],
    bar: Array(8).fill('XX.X..X.XX.X.XXX.X..XX.X.X..XXX.XX.X'),
  };
  const I = (k, c) => pix(R[k], c);
  const SET = `<span class="px-is">${I('cherry')}${I('heart')}${I('key')}</span>`;
  // 레이스 띠: 점선 두 줄 아래로 점으로 찍은 물결(스캘럽)과 작은 구멍 무늬
  const lace = (n, both) => {
    const T = 16, H = both ? 22 : 14, o = [];
    const dot = (x, y) => o.push(`<rect x="${x}" y="${y}" width="${D}" height="${D}"/>`);
    for (let i = 0; i < n; i++) {
      const b = i * T;
      for (let x = 0; x < T; x++) {
        if (x % 2 === 0) { dot(b + x, both ? 8 : 0); dot(b + x, both ? 12 : 2); }
        const d = Math.round(7 * Math.sqrt(Math.max(0, 1 - ((x - 7.5) / 8) ** 2)));
        dot(b + x, (both ? 14 : 4) + d); if (both) dot(b + x, 6 - d);
      }
      [[7, 0], [8, 0], [6, 1], [9, 1], [7, 2], [8, 2]].forEach(([x, y]) => { dot(b + x, (both ? 15 : 5) + y); if (both) dot(b + x, 5 - y); });
      dot(b, both ? 16 : 6); if (both) dot(b, 4);
    }
    return `<svg class="px-lc" viewBox="0 -1 ${n * T} ${H}" xmlns="http://www.w3.org/2000/svg">${o.join('')}</svg>`;
  };
  const drops = (c, pts) => pts.map(([x, y]) => `<i class="px-dr ${c}" style="left:${x}%;top:${y}%"></i>`).join('');
  const PH = (c, w) => `<div class="px-h ${c}"><svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg"><path d="M50 88C20 66 3 48 3 28 3 13 14 3 27 3c9 0 17 5 23 14C56 8 64 3 73 3c13 0 24 10 24 25 0 20-17 38-47 60z"/></svg><b>${w}</b></div>`;
  const chip = (t, c, st) => `<b class="px-hl ${c || ''}" style="${st}">${t}</b>`;
  const lab = (t, c) => `<div class="px-lab ${c || ''}">${t}</div>`;
  const one = (k) => `<div class="px-one">${I(k)}</div>`;
  const rc = (rows) => rows.map(([a, b]) => `<span class="px-rr"><em>${a}</em><i></i><em>${b}</em></span>`).join('');
  const S = (g, w, n, h) => ({ g, w, n, h });

  window.STK = {
    // ── 문구: 가는 둥근 글씨 큰 제목 + 작은 픽셀 대문자 ──
    p_card1: S('phrase', 0.34, '흰 블록 small steps', `<div class="px"><p class="px-t">small steps,<br>soft days ${SET}</p><p class="px-c">ONE PAGE AT A TIME<br>IS MORE THAN ENOUGH</p></div>`),
    p_card2: S('phrase', 0.34, '분홍 블록 good try', `<div class="px pk"><p class="px-t">today was<br>a good try ${SET}</p><p class="px-c">I SHOWED UP AND<br>THAT ALREADY COUNTS</p></div>`),
    p_big: S('phrase', 0.4, '하늘 블록 My Day', `<div class="px sk"><p class="px-big">My Day ${I('tulip')}</p><p class="px-c">THE DESK LAMP IS ON ${I('heart')}<br>MY PENCIL IS MOVING<br>THAT IS ALREADY A WIN</p></div>`),
    p_big2: S('phrase', 0.4, '분홍 블록 Dear Me', `<div class="px pk"><p class="px-big">Dear Me ${I('heart2')}</p><p class="px-c">BE KIND TO THE GIRL ${I('key')}<br>WHO IS STILL LEARNING<br>SHE IS DOING JUST FINE</p></div>`),
    p_dot1: S('phrase', 0.25, '하늘 블록 도트 글씨', `<div class="px sk"><p class="px-d">STUDY NOW<br>NAP LATER<br>SNACKS ${I('cherry')}<br>ALWAYS</p><span class="px-cn">${I('heart')}</span></div>`),
    p_dot2: S('phrase', 0.27, '분홍 블록 도트 글씨', `<div class="px pk ce"><p class="px-d">EVERY PAGE<br>I FILL MAKES<br>ME A LITTLE<br>BRAVER.</p></div>`),
    p_note: S('phrase', 0.3, '흰 블록 note to self', `<div class="px"><p class="px-t sm">note to self ${I('cursor')}</p><p class="px-c">DRINK WATER<br>CLOSE THE TAB<br>OPEN THE BOOK ${I('arrow')}</p></div>`),
    p_after: S('phrase', 0.34, '하늘 블록 after school', `<div class="px sk"><p class="px-t">after school ${I('note')}</p><p class="px-c">HOMEWORK FIRST, SNACK SECOND<br>PLAYLIST ALWAYS ON</p></div>`),
    p_load: S('phrase', 0.27, '분홍 블록 충전 중', `<div class="px pk"><p class="px-d">LOADING...<br>MY BEST SELF<br>87% ${I('batt')}</p></div>`),
    p_rcpt: S('phrase', 0.25, '흰 블록 오늘 영수증', `<div class="px rc"><p class="px-c hd">TODAY'S RECEIPT</p>${rc([['FOCUS', '2H'], ['SNACK', 'X3'], ['NAP', '0'], ['PAGES', '12']])}<p class="px-c">TOTAL : GOOD DAY</p><span class="px-bc">${I('bar')}</span></div>`),
    p_ko: S('phrase', 0.32, '흰 블록 천천히', `<div class="px"><p class="px-k big">천천히 가도<br>도착은 한다</p><p class="px-c">SLOW IS STILL MOVING ${I('star')}${I('key')}</p></div>`),
    p_ko2: S('phrase', 0.3, '분홍 블록 오늘 할 일', `<div class="px pk"><p class="px-k big">오늘 할 일</p><p class="px-k">1. 일단 앉기<br>2. 책 펴기<br>3. 한 쪽만 하기 ${I('heart')}</p></div>`),
    p_ko3: S('phrase', 0.3, '하늘 블록 한 쪽만 더', `<div class="px sk"><p class="px-k big">졸려도<br>한 쪽만 더</p><p class="px-c">ONE MORE PAGE, THEN BED ${I('moon')}</p></div>`),
    p_ko4: S('phrase', 0.31, '흰 블록 시험 끝나면', `<div class="px"><p class="px-k big">시험 끝나면<br>실컷 잘 거야</p><p class="px-c">D-DAY IS JUST A DAY ${I('cup')}</p></div>`),
    p_mine: S('phrase', 0.46, '흰 블록과 하트 Mine', `<div class="px rw"><div><p class="px-t sm">this page<br>is all mine ${SET}</p><p class="px-c">NO ONE GRADES<br>WHAT I WRITE HERE</p></div>${PH('pk', 'Mine')}</div>`),
    // ── 낱말 칩: 형광펜 깔린 작은 낱말, 점 흩어진 흰 블록, 파스텔 하트 위 필기체 ──
    p_drops: S('chip', 0.3, '점 흩어진 블록 cozy', `<div class="px dr">${drops('pk', [[12, 30], [64, 8], [46, 44], [84, 52], [22, 78], [58, 90]])}${drops('sk', [[34, 14], [88, 24], [8, 56], [70, 70], [40, 68]])}${chip('cozy', '', 'left:10%;top:12%')}${chip('sleepy', 'pk', 'left:58%;top:28%')}${chip('snack', 'pk', 'left:14%;top:52%')}${chip('again', '', 'left:54%;top:74%')}</div>`),
    p_drops2: S('chip', 0.3, '점 흩어진 블록 하트', `<div class="px dr">${drops('sk', [[14, 22], [60, 12], [44, 40], [86, 46], [26, 84]])}${drops('pk', [[36, 10], [84, 18], [10, 50], [66, 62], [44, 74]])}${chip('soft', 'pk', 'left:12%;top:10%')}${chip('quiet', '', 'left:60%;top:26%')}${chip('slow', '', 'left:10%;top:62%')}<span class="px-hc">${PH('sk', 'Lucky')}</span></div>`),
    p_drops3: S('chip', 0.3, '점 흩어진 블록 한글', `<div class="px dr">${drops('pk', [[10, 24], [62, 10], [48, 46], [86, 56], [24, 80], [60, 88]])}${drops('sk', [[32, 12], [90, 26], [8, 58], [72, 72]])}${chip('오늘', 'ko', 'left:10%;top:10%')}${chip('간식', 'pk ko', 'left:60%;top:26%')}${chip('숙제 끝', 'pk ko', 'left:12%;top:52%')}${chip('졸림', 'ko', 'left:58%;top:74%')}</div>`),
    p_lab1: S('chip', 0.12, '칩 today', lab('today')),
    p_lab3: S('chip', 0.11, '칩 done', lab('done', 'pk')),
    p_lab4: S('chip', 0.12, '칩 memo', lab('memo')),
    p_lab5: S('chip', 0.13, '칩 d-day', lab('d-day', 'pk')),
    p_lab6: S('chip', 0.15, '칩 to do', lab('to do')),
    p_lab7: S('chip', 0.17, '칩 weekend', lab('weekend', 'pk')),
    p_lab8: S('chip', 0.17, '칩 good job', lab('good job')),
    p_lab2: S('chip', 0.155, '칩 오늘의 기분', lab('오늘의 기분', 'pk ko')),
    p_lab9: S('chip', 0.1, '칩 숙제', lab('숙제', 'ko')),
    p_lab10: S('chip', 0.13, '칩 시험 범위', lab('시험 범위', 'pk ko')),
    p_lab11: S('chip', 0.13, '칩 잘한 일', lab('잘한 일', 'ko')),
    p_heart1: S('chip', 0.2, '분홍 하트 Dream', PH('pk', 'Dream')),
    p_heart2: S('chip', 0.2, '하늘 하트 Lucky', PH('sk', 'Lucky')),
    p_heart3: S('chip', 0.2, '분홍 하트 Today', PH('pk', 'Today')),
    // ── 픽셀: 먹회색 점으로 찍은 작은 기호 ──
    p_icons: S('pixel', 0.24, '픽셀 기호 줄', `<div class="px-row">${I('heart')}${I('cherry')}${I('star')}${I('key')}</div>`),
    x_heart: S('pixel', 0.07, '픽셀 하트', one('heart')),
    x_heart2: S('pixel', 0.1, '성긴 점 하트', one('heart2')),
    x_bow: S('pixel', 0.12, '픽셀 리본', one('bow')),
    x_tulip: S('pixel', 0.08, '픽셀 튤립', one('tulip')),
    x_cherry: S('pixel', 0.08, '픽셀 체리', one('cherry')),
    x_star: S('pixel', 0.07, '픽셀 별', one('star')),
    x_key: S('pixel', 0.12, '픽셀 열쇠', one('key')),
    x_moon: S('pixel', 0.07, '픽셀 달', one('moon')),
    x_cup: S('pixel', 0.08, '픽셀 컵', one('cup')),
    x_note: S('pixel', 0.06, '픽셀 음표', one('note')),
    x_mail: S('pixel', 0.1, '픽셀 편지', one('mail')),
    x_batt: S('pixel', 0.11, '픽셀 건전지', one('batt')),
    x_arrow: S('pixel', 0.07, '픽셀 화살표', one('arrow')),
    x_cursor: S('pixel', 0.05, '픽셀 커서', one('cursor')),
    x_bar: S('pixel', 0.2, '픽셀 바코드', one('bar')),
    // ── 레이스: 먹회색 점으로 찍은 레이스 띠 ──
    l_pk: S('lace', 0.46, '분홍 레이스 띠', `<div class="px-lace pk">${lace(6)}</div>`),
    l_sk: S('lace', 0.46, '하늘 레이스 띠', `<div class="px-lace sk">${lace(6)}</div>`),
    l_wh: S('lace', 0.46, '흰 레이스 띠', `<div class="px-lace">${lace(6)}</div>`),
    l_pk2: S('lace', 0.46, '분홍 양쪽 레이스', `<div class="px-lace pk">${lace(6, true)}</div>`),
    l_sk2: S('lace', 0.46, '하늘 양쪽 레이스', `<div class="px-lace sk">${lace(6, true)}</div>`),
    l_bare: S('lace', 0.4, '바탕 없는 레이스', `<div class="px-lace bare">${lace(5)}</div>`),
    l_hearts: S('lace', 0.36, '하트 점선 띠', `<div class="px-lace pk hr">${Array(7).fill(I('heart')).join('')}</div>`),
    l_short: S('lace', 0.24, '짧은 분홍 레이스', `<div class="px-lace pk">${lace(3)}</div>`),
  };

  // ── 더 많은 스티커 (같은 결): 디더링 비트맵 그림 · 다른 모양 블록 · 요일/과목 칩 · 레이스 무늬 ──
  Object.assign(R, {
    spark: ['..X..', '..X..', 'XX.XX', '..X..', '..X..'], box: ['XXXXX', 'X...X', 'X...X', 'X...X', 'XXXXX'], boxon: ['XXXXX', 'XX.XX', 'X.X.X', 'XX.XX', 'XXXXX'],
    check: ['......X', '.....X.', 'X...X..', '.X.X...', '..X....'], play: ['X....', 'XXX..', 'XXXXX', 'XXX..', 'X....'], plus: ['.X.', 'XXX', '.X.'],
    flag: ['XXXXX.', 'XoooXX', 'XoooX.', 'XXXXX.', 'X.....', 'X.....', 'X.....'], glass: ['XXXXX', 'X...X', '.X.X.', '..X..', '.X.X.', 'XoooX', 'XXXXX'],
    talk: ['.XXXXXXX.', 'X.......X', 'X.X.X.X.X', 'X.......X', '.XXXXXXX.', '..XX.....', '..X......'], zzz: ['XXXX....', '..X.....', '.X...XXX', 'XXXX..X.', '.....XXX'],
    clip: ['.XXX.', 'X...X', 'X.X.X', 'X.X.X', 'X.X.X', '..X.X', '..XXX'], wave: ['.XX...XX...XX..', 'X..X.X..X.X..X.', '....X....X....X'],
  });
  // 거칠게 깨진 흑백 비트맵: 모양 안쪽을 어둡기에 따라 점을 성기게 찍어요 (4x4 디더링), 가장자리는 진하게
  const BAY = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  const bmp = (w, h, fn) => {
    const g = []; for (let y = 0; y < h; y++) { g.push([]); for (let x = 0; x < w; x++) g[y].push(fn(x, y)); }
    const ins = (x, y) => x >= 0 && y >= 0 && x < w && y < h && g[y][x] >= 0, o = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const d = g[y][x]; if (d < 0) continue; const edge = !ins(x - 1, y) || !ins(x + 1, y) || !ins(x, y - 1) || !ins(x, y + 1); if (edge || d > (BAY[y % 4][x % 4] + 0.5) / 16) o.push(`<rect x="${x}" y="${y}" width="${D}" height="${D}"/>`); }
    return `<div class="px-one"><svg class="px-ic" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${o.join('')}</svg></div>`;
  };
  const C = (x, y, cx, cy, r) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r, E = (x, y, cx, cy, a, b) => ((x - cx) / a) ** 2 + ((y - cy) / b) ** 2 <= 1;
  const B_CLOUD = bmp(26, 16, (x, y) => (C(x, y, 8, 10, 5) || C(x, y, 13, 7, 6) || C(x, y, 19, 10, 5) || (x >= 6 && x <= 20 && y >= 10 && y <= 14) ? 0.1 + (y / 16) * 0.55 : -1));
  const B_MOON = bmp(18, 18, (x, y) => (C(x, y, 8.5, 8.5, 8) && !C(x, y, 12, 6.5, 7) ? 0.25 + (y / 18) * 0.5 : -1));
  const B_FLOWER = bmp(19, 25, (x, y) => { if (C(x, y, 9, 8, 2.3)) return 1; for (let k = 0; k < 5; k++) { const a = (k * 72 - 90) * Math.PI / 180; if (C(x, y, 9 + Math.cos(a) * 4.6, 8 + Math.sin(a) * 4.6, 3.1)) return 0.18; } if (Math.abs(x - 9) < 1 && y > 12 && y < 25) return 1; if (E(x, y, 12.5, 19.5, 3, 1.7)) return 0.6; return -1; });
  const B_CUP = bmp(20, 19, (x, y) => { if ((x === 6 || x === 10) && y <= 4) return y % 2 ? -1 : 1; if ((x === 7 || x === 11) && y <= 4 && y % 2) return 1; if (x >= 3 && x <= 13 && y >= 7 && y <= 17 && !((x === 3 || x === 13) && y === 17)) return 0.15 + ((x - 3) / 10) * 0.6; if (C(x, y, 14.5, 11.5, 4) && !C(x, y, 14.5, 11.5, 2.2) && x > 13) return 1; return -1; });
  const B_BOOK = bmp(23, 16, (x, y) => { if (y === 14 && x >= 0 && x <= 22) return 1; if (!(x >= 1 && x <= 21 && y >= 2 && y <= 13)) return -1; if (x === 11) return 1; if (y % 2 && y >= 5 && y <= 11 && ((x >= 3 && x <= 9) || (x >= 13 && x <= 19))) return 1; return 0.1; });
  const B_PENCIL = bmp(20, 20, (x, y) => { const a = x, b = 19 - y, al = (a + b) / 2, ac = (a - b) / 2; if (al >= 5 && al <= 15 && Math.abs(ac) <= 2) return Math.abs(ac) < 0.5 ? 1 : 0.22; if (al >= 1.5 && al < 5 && Math.abs(ac) <= (al - 1.5) * 0.62) return al < 3 ? 1 : 0.05; if (al > 15 && al <= 17.5 && Math.abs(ac) <= 2) return 0.85; return -1; });
  const B_CAT = bmp(21, 23, (x, y) => { const ear = (cx) => y <= 5 && y >= 0 && Math.abs(x - cx) <= y * 0.55; if (E(x, y, 9, 16, 6.2, 6.4) || C(x, y, 9, 7.5, 4.4) || ear(6) || ear(12) || (C(x, y, 15, 18, 4.2) && !C(x, y, 15, 18, 2.6) && x >= 14)) return 0.5 + (x / 21) * 0.5; return -1; });
  const B_SUN = bmp(19, 19, (x, y) => { const dx = x - 9, dy = y - 9, r = Math.hypot(dx, dy); if (r <= 4.6) return 0.28; if (r >= 6.4 && r <= 8.8 && (Math.abs(dx) < 0.6 || Math.abs(dy) < 0.6 || Math.abs(Math.abs(dx) - Math.abs(dy)) < 0.8)) return 1; return -1; });
  const B_HEART = bmp(21, 19, (x, y) => { const X = (x - 10) / 8.2, Y = (8.5 - y) / 8.2 + 0.12; return (X * X + Y * Y - 1) ** 3 - X * X * Y * Y * Y <= 0 ? 0.2 + (y / 19) * 0.65 : -1; });
  const B_BULB = bmp(15, 21, (x, y) => { if (C(x, y, 7, 7, 6.2)) return 0.1 + (x / 15) * 0.4; if (x >= 4 && x <= 10 && y > 12 && y <= 15) return 0.3; if (x >= 5 && x <= 9 && y > 15 && y <= 19) return y % 2 ? 1 : 0.2; return -1; });
  // 레이스 무늬: 점 좌표를 만든 다음 가로 · 세로 · 모서리로 놓아요
  const pat = (kind, n) => {
    const d = []; let T = 12, H = 10;
    for (let i = 0; i < n; i++) {
      if (kind === 'zig') { T = 12; H = 11; const b = i * T; for (let x = 0; x < T; x++) { if (x % 2 === 0) d.push([b + x, 0]); d.push([b + x, 2 + (6 - Math.abs(x - 6))]); } [[6, 9], [5, 10], [7, 10], [6, 11]].forEach(([x, y]) => d.push([b + x, y - 1])); }
      else if (kind === 'xs') { T = 6; H = 7; const b = i * T; [[0, 2], [2, 2], [1, 3], [0, 4], [2, 4]].forEach(([x, y]) => d.push([b + x + 1, y])); for (let x = 0; x < T; x += 2) { d.push([b + x, 0]); d.push([b + x, 6]); } }
      else if (kind === 'eye') { T = 8; H = 9; const b = i * T; [[3, 2], [4, 2], [2, 3], [5, 3], [2, 4], [5, 4], [3, 5], [4, 5]].forEach(([x, y]) => d.push([b + x, y])); d.push([b, 4]); for (let x = 0; x < T; x++) { d.push([b + x, 0]); d.push([b + x, 8]); } }
      else if (kind === 'hl') { T = 14; H = 8; const b = i * T; R.heart.forEach((r, y) => r.split('').forEach((c, x) => c === 'X' && d.push([b + x + 3, y + 1]))); [0, 12].forEach((x) => { d.push([b + x, 3]); d.push([b + x, 4]); }); }
      else { T = 16; H = 13; const b = i * T; for (let x = 0; x < T; x++) { if (x % 2 === 0) { d.push([b + x, 0]); d.push([b + x, 2]); } d.push([b + x, 4 + Math.round(7 * Math.sqrt(Math.max(0, 1 - ((x - 7.5) / 8) ** 2)))]); } [[7, 5], [8, 5], [6, 6], [9, 6], [7, 7], [8, 7]].forEach(([x, y]) => d.push([b + x, y])); d.push([b, 6]); }
    }
    return { d, W: n * T, H };
  };
  const dots = (d) => d.map(([x, y]) => `<rect x="${x}" y="${y}" width="${D}" height="${D}"/>`).join('');
  const band = (kind, n, c) => { const p = pat(kind, n); return `<div class="px-lace ${c || ''}"><svg class="px-lc" viewBox="0 -1 ${p.W} ${p.H + 2}" xmlns="http://www.w3.org/2000/svg">${dots(p.d)}</svg></div>`; };
  const vband = (kind, n, c) => { const p = pat(kind, n); return `<div class="px-lace v ${c || ''}"><svg class="px-lc" viewBox="-1 0 ${p.H + 2} ${p.W}" xmlns="http://www.w3.org/2000/svg">${dots(p.d.map(([x, y]) => [y, x]))}</svg></div>`; };
  const corner = (kind, n, c) => { const p = pat(kind, n); return `<div class="px-lace bare ${c || ''}"><svg class="px-lc" viewBox="-1 -1 ${p.W + 1} ${p.W + 1}" xmlns="http://www.w3.org/2000/svg">${dots(p.d.concat(p.d.filter(([x]) => x > p.H).map(([x, y]) => [y, x])))}</svg></div>`; };
  const chk = (rows) => rows.map(([on, t]) => `${I(on ? 'boxon' : 'box')}${t}`).join('<br>');
  const lines = (n) => Array(n).fill('<i class="px-l"></i>').join('');
  const add = {
    // 문구
    p_band1: S('phrase', 0.46, '분홍 긴 띠', `<div class="px pk bd"><p class="px-c">TODAY I DID MY BEST ${I('heart')} TODAY I DID MY BEST</p></div>`),
    p_band2: S('phrase', 0.4, '하늘 긴 띠 수고했어', `<div class="px sk bd"><p class="px-k">오늘도 수고했어 ${I('spark')} 오늘도 수고했어</p></div>`),
    p_band3: S('phrase', 0.42, '흰 긴 띠 바코드', `<div class="px bd rwc"><p class="px-c">NO. 0001 ${I('arrow')} KEEP GOING</p><span class="px-bc s">${I('bar')}</span></div>`),
    p_sq1: S('phrase', 0.19, '흰 정사각 ok', `<div class="px sq"><p class="px-big">ok.</p><p class="px-c">IT IS FINE<br>REALLY</p></div>`),
    p_sq2: S('phrase', 0.19, '분홍 정사각 괜찮아', `<div class="px pk sq"><p class="px-k big">괜찮아</p><p class="px-c">BREATHE IN<br>BREATHE OUT ${I('heart')}</p></div>`),
    p_sq3: S('phrase', 0.19, '하늘 정사각 D-7', `<div class="px sk sq"><p class="px-big">D-7</p><p class="px-k">시험까지</p></div>`),
    p_rcpt2: S('phrase', 0.24, '흰 블록 공부 기록', `<div class="px rc"><p class="px-c hd">STUDY LOG</p>${rc([['국어', '40M'], ['수학', '90M'], ['영어', '30M'], ['과학', '50M'], ['간식', 'X2']])}<p class="px-c">TOTAL : 잘 버팀</p><span class="px-bc">${I('bar')}</span></div>`),
    p_rcpt3: S('phrase', 0.22, '분홍 블록 오늘 기분 영수증', `<div class="px pk rc"><p class="px-c hd">MOOD CHECK</p>${rc([['SLEEP', '6H'], ['ENERGY', '70%'], ['SMILE', 'X5']])}<p class="px-c">THANK YOU, ME ${I('heart')}</p></div>`),
    p_split1: S('phrase', 0.38, '두 칸 라벨', `<div class="px sp"><div class="pk"><p class="px-c">NO.</p><p class="px-d">001</p></div><div><p class="px-t sm">keep going</p><p class="px-k">계속 가는 중 ${I('arrow')}</p></div></div>`),
    p_split2: S('phrase', 0.38, '두 칸 라벨 과목', `<div class="px sp"><div class="sk"><p class="px-c">SUBJECT</p><p class="px-k big">수학</p></div><div><p class="px-c">PAGE ........ TO ........<br>DONE ${I('box')} &nbsp; AGAIN ${I('box')}</p></div></div>`),
    p_chk1: S('phrase', 0.27, '흰 블록 체크리스트', `<div class="px"><p class="px-t sm">to do</p><p class="px-c ck">${chk([[1, 'WAKE UP ON TIME'], [1, 'PACK MY BAG'], [0, 'REVIEW MY NOTES'], [0, 'SLEEP BEFORE 12']])}</p></div>`),
    p_chk2: S('phrase', 0.25, '분홍 블록 오늘의 체크', `<div class="px pk"><p class="px-k big">오늘의 체크</p><p class="px-k ck">${chk([[1, '물 마시기'], [1, '단어 외우기'], [0, '오답 정리'], [0, '일찍 자기']])}</p></div>`),
    p_stamp: S('phrase', 0.22, '분홍 날짜 도장', `<div class="px pk ce st"><p class="px-c">CHECKED ${I('check')}</p><p class="px-d">DONE</p><p class="px-c">20__ . __ . __</p></div>`),
    p_play: S('phrase', 0.33, '하늘 블록 플레이리스트', `<div class="px sk"><p class="px-c hd">NOW PLAYING ${I('note')}</p><p class="px-t sm">study mix no.3</p><span class="px-pg"><i></i></span><p class="px-c">${I('play')} 2:14 / 3:40</p></div>`),
    p_tt: S('phrase', 0.26, '흰 블록 시간표 쪽지', `<div class="px"><p class="px-c hd">TIME TABLE</p><p class="px-k tt"><b>1</b>국어<b>2</b>수학<b>3</b>영어<b>4</b>체육<b>5</b>과학<b>6</b>자습</p></div>`),
    p_memo: S('phrase', 0.28, '분홍 블록 메모 줄', `<div class="px pk"><p class="px-c hd">MEMO ${I('clip')}</p>${lines(4)}</div>`),
    p_memo2: S('phrase', 0.28, '흰 블록 메모 줄', `<div class="px"><p class="px-c hd">NOTE ${I('heart')}</p>${lines(4)}</div>`),
    p_ko5: S('phrase', 0.34, '흰 블록 할 수 있다', `<div class="px"><p class="px-k big">할 수 있다<br>아니 이미 하고 있다</p><p class="px-c">YOU ARE ALREADY DOING IT ${I('flag')}</p></div>`),
    p_ko6: S('phrase', 0.3, '하늘 블록 오늘의 기분', `<div class="px sk"><p class="px-k big">오늘의 기분<br>대체로 맑음</p><p class="px-c">MOSTLY SUNNY ${I('spark')}</p></div>`),
    p_ko7: S('phrase', 0.3, '분홍 블록 쉬는 시간', `<div class="px pk"><p class="px-k big">쉬는 것도<br>계획에 있었다</p><p class="px-c">REST IS ON THE LIST ${I('zzz')}</p></div>`),
    p_ko8: S('phrase', 0.31, '흰 블록 오답', `<div class="px"><p class="px-k big">틀린 문제는<br>내일의 정답</p><p class="px-c">WRONG TODAY, RIGHT TOMORROW ${I('check')}</p></div>`),
    p_night: S('phrase', 0.32, '분홍 블록 good night', `<div class="px pk"><p class="px-t">good night, ${I('moon')}</p><p class="px-c">TOMORROW IS A NEW PAGE</p></div>`),
    p_exam: S('phrase', 0.3, '흰 블록 exam week', `<div class="px"><p class="px-t">exam week ${I('glass')}</p><p class="px-c">EAT WELL, SLEEP WELL<br>THEN STUDY</p></div>`),
    p_pause: S('phrase', 0.22, '하늘 블록 PAUSE', `<div class="px sk"><p class="px-d">PAUSE.<br>BREATHE.<br>CONTINUE.</p></div>`),
    // 낱말 칩
    ...Object.fromEntries(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((t, i) => [`c_${t.toLowerCase()}`, S('chip', 0.085, `요일 칩 ${t}`, lab(t, `cp${i % 2 ? ' pk' : ''}`))])),
    ...Object.fromEntries(['D-1', 'D-7', 'D-30', 'D-100'].map((t, i) => [`c_d${i}`, S('chip', 0.09 + i * 0.01, `디데이 칩 ${t}`, lab(t, `cp${i % 2 ? '' : ' pk'}`))])),
    ...Object.fromEntries(['국어', '수학', '영어', '과학', '사회', '역사'].map((t, i) => [`c_s${i}`, S('chip', 0.1, `과목 칩 ${t}`, lab(t, `ko${i % 2 ? ' pk' : ''}`))])),
    ...Object.fromEntries(['맑음', '흐림', '설렘', '피곤', '뿌듯', '멍함'].map((t, i) => [`c_m${i}`, S('chip', 0.1, `기분 칩 ${t}`, lab(t, `ko${i % 2 ? '' : ' pk'}`))])),
    ...Object.fromEntries(['수행평가', '시험 기간', '쉬는 날', '오답 노트'].map((t, i) => [`c_k${i}`, S('chip', 0.14, `칩 ${t}`, lab(t, `ko${i % 2 ? ' pk' : ''}`))])),
    p_drops4: S('chip', 0.3, '점 흩어진 블록 요일', `<div class="px dr">${drops('pk', [[14, 28], [62, 12], [44, 46], [86, 50], [26, 82]])}${drops('sk', [[36, 12], [88, 22], [8, 60], [68, 68], [46, 88]])}${chip('MON', 'cp', 'left:10%;top:10%')}${chip('WED', 'cp pk', 'left:58%;top:28%')}${chip('FRI', 'cp pk', 'left:14%;top:54%')}${chip('SUN', 'cp', 'left:58%;top:74%')}</div>`),
    p_heart4: S('chip', 0.2, '하늘 하트 Hello', PH('sk', 'Hello')),
    // 픽셀
    b_flower: S('pixel', 0.11, '비트맵 꽃', B_FLOWER), b_cup: S('pixel', 0.12, '비트맵 컵', B_CUP), b_book: S('pixel', 0.14, '비트맵 책', B_BOOK), b_pencil: S('pixel', 0.12, '비트맵 연필', B_PENCIL),
    b_cloud: S('pixel', 0.15, '비트맵 구름', B_CLOUD), b_moon: S('pixel', 0.11, '비트맵 달', B_MOON), b_cat: S('pixel', 0.12, '비트맵 고양이 뒷모습', B_CAT), b_sun: S('pixel', 0.11, '비트맵 해', B_SUN),
    b_heart: S('pixel', 0.12, '비트맵 하트', B_HEART), b_bulb: S('pixel', 0.09, '비트맵 전구', B_BULB),
    ...Object.fromEntries([['spark', 0.05, '반짝'], ['check', 0.07, '체크'], ['box', 0.05, '빈 네모'], ['boxon', 0.05, '찬 네모'], ['play', 0.05, '재생'], ['flag', 0.06, '깃발'], ['glass', 0.05, '모래시계'], ['talk', 0.09, '말풍선'], ['zzz', 0.08, '졸음'], ['clip', 0.05, '클립'], ['wave', 0.15, '물결']].map(([k, w, n]) => [`x_${k}`, S('pixel', w, `픽셀 ${n}`, one(k))])),
    // 레이스
    l_zig: S('lace', 0.46, '분홍 세모 레이스', band('zig', 8, 'pk')), l_zig2: S('lace', 0.46, '흰 세모 레이스', band('zig', 8)),
    l_xs: S('lace', 0.46, '하늘 십자수 띠', band('xs', 16, 'sk')), l_xs2: S('lace', 0.4, '바탕 없는 십자수 띠', band('xs', 14, 'bare')),
    l_eye: S('lace', 0.46, '분홍 구멍 레이스', band('eye', 12, 'pk')), l_eye2: S('lace', 0.46, '흰 구멍 레이스', band('eye', 12)),
    l_hl: S('lace', 0.42, '하늘 하트 띠', band('hl', 7, 'sk')), l_hl2: S('lace', 0.36, '바탕 없는 하트 띠', band('hl', 6, 'bare')),
    l_v1: S('lace', 0.075, '분홍 세로 레이스', vband('sc', 5, 'pk')), l_v2: S('lace', 0.075, '하늘 세로 레이스', vband('sc', 5, 'sk')), l_v3: S('lace', 0.05, '바탕 없는 세로 십자수', vband('xs', 12, 'bare')),
    l_c1: S('lace', 0.2, '모서리 레이스', corner('sc', 3)), l_c2: S('lace', 0.2, '모서리 세모 레이스', corner('zig', 4)),
  };
  Object.assign(window.STK, add);
  window.STK_ORDER = Object.keys(window.STK);
})();
