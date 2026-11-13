# Credits

## Fonts
- 그리운 손글씨 (야옹이엄마·오엔·단정한·미가·송글손글): griun.co.kr 무료 배포, 원본 그대로 사용 (개작·수정·판매 금지)
- Playfair Display, Pinyon Script, Abril Fatface, DM Serif Display, Permanent Marker: Google Fonts (OFL / Apache 2.0)
- Pretendard: OFL
- Galmuri11 · Galmuri9 (quiple/galmuri), DotGothic16, Quicksand (Google Fonts), 나눔스퀘어라운드 (NAVER): 모두 SIL OFL 1.1, KS X 1001 한글 2350자와 영문만 남긴 부분집합

# 그림 출처

배포본에는 Unsplash 사진이 더 없어요. 예전 사진 스티커(가공본)는 `source/photos/old_ph/`, 원본은 `source/photos/dl/` 에만 남겨 두었어요.

## 스티커 그림 (assets/stk/)

모두 GPT 이미지 생성 (2026-11-13). 원본 시트는 `source/gen/`, 녹색 배경을 지우고 하나씩 잘라 냄(`source/gen/cut.py`). 그림 안에 글자는 없어요.

| 파일 | 원본 시트 | 내용 |
| -- | -- | -- |
| s2_a_0~8, s2_b_0~8 | s2_a.png, s2_b.png | 낙서 동물 (낙서 문구 스티커에도 씀) |
| s2_c_0~8, s2_d_0~8 | s2_c.png, s2_d.png | 먹을 것 · 책상 소품 |
| p_folder_0~9 | p_folder.png | 파스텔 폴더 · 편지 · 카세트 등 |
| p_xs_0~8 | p_xs.png | 십자수 리본 · 열쇠 · 하트 등 |
| p_tape_0~7, p_frames_0~5, p_win_0~3 | p_tape.png, p_frames.png, p_win.png | 테이프 · 라벨 · 액자 · 창 모양 카드 |

표지 후보(아직 적용 안 함): `source/gen/pc_a.png`, `pc_b.png`, `pc_c.png`.


## 표지

| 파일 | 출처 | 가공 |
| -- | -- | -- |
| assets/cover/cover.webp | GPT 이미지 생성 (2026-11-13, 원본 `source/gen/cv_c.png`). 매끈한 연분홍 가죽, 가장자리 바늘땀, 왼쪽 흰 레이스 띠를 한 장으로 뽑음 | 정사각형 그림을 쪽 비율로 잘라 오른쪽 가장자리를 이어 붙이고(`source/cover/gencover.py`) 분홍을 조금 밝힘 |

쓰지 않은 표지 후보: `source/gen/cv_a.png`, `source/gen/cv_b.png` (GPT 이미지 생성).
예전 표지에 쓰던 Unsplash 사진 가공본(가죽·바늘땀·레이스)은 배포에서 빼고 `source/cover/old_assets/` 에만 남겨 두었어요.

## 화면 무늬

| 파일 | 출처 |
| -- | -- |
| assets/ui/w1_lace.svg | 직접 그린 도트 레이스 무늬 (코드로 만듦) |

## 첫 장 · 책갈피

모두 GPT 이미지 생성 (2026-11-13). 원본은 `source/gen/`. 그림 안에 글자는 없고, 글자·입력 칸은 코드로 얹어요.

| 파일 | 원본 | 가공 |
| -- | -- | -- |
| assets/fly/idcard_pk.webp | source/gen/w2_idcard_pink.png | 카드 바깥과 사진 칸을 투명하게 따냄 |
| assets/fly/idcard_sk.webp | source/gen/w2_idcard_pink.png | 같은 그림에서 분홍과 하늘 색만 맞바꿈 |
| assets/fly/pattern.webp | source/gen/w2_pattern.png | 줄여 씀 |
| assets/fly/bm_pk.webp, bm_sk.webp, bm_dot.webp | source/gen/w2_bookmark.png | 녹색 배경을 지우고 색·무늬만 바꿈 |

| assets/fly/girl.webp | source/gen/girl_a.png | 흰 여백을 잘라 줄임. 카드 사진 칸의 기본 그림 |

쓰지 않은 그림: `source/gen/w2_idcard_sky.png`, `source/gen/girl_b.png`, `source/gen/girl_c.png`.
스티커 묶음 「파스텔」과 낙서 문구의 바탕·글자는 코드(SVG·CSS)로 만들었어요.
