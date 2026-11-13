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
  window.STK_ORDER = Object.keys(window.STK);
})();
