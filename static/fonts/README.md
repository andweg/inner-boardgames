# Fonts

Drop the self-hosted web fonts here so the site can serve them from its own
origin (no external font CDN at runtime).

## Pretendard (required for best Korean + Latin rendering)

1. Download **PretendardVariable.woff2** from the Pretendard release page:
   https://github.com/orioncactus/pretendard/releases
2. Save it in this folder as `PretendardVariable.woff2`.

Until you add it, the site falls back to the system Korean UI font
(Apple SD Gothic Neo / Malgun Gothic / Noto Sans KR), which still looks fine.

## Cafe Display (optional wordmark accent)

The headings use an optional display face named `Cafe Display`. If you have a
characterful Latin face that matches your logo, export it as
`CafeDisplay.woff2` and drop it here. If absent, headings fall back to
Pretendard — no visual breakage.

The `@font-face` declarations live in `src/app.css`.
