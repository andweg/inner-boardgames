/**
 * Typed UI dictionary. Korean copy is written to read like Korean, not
 * translated English. Game titles themselves stay as BGG primary names.
 */

export type Locale = 'ko' | 'en';

type Entry = Record<Locale, string>;

export const dict = {
  // Header / nav
  'nav.library': { ko: '서가', en: 'Library' },
  'nav.recommend': { ko: '뭐 할까요?', en: 'What to play' },
  'nav.langToggle': { ko: 'EN', en: '한국어' },

  // Library page
  'lib.title': { ko: '오늘의 서가', en: "Today's shelf" },
  'lib.subtitle': {
    ko: '선반 위 모든 게임을 골라보세요.',
    en: 'Browse every game on the shelf.'
  },
  'lib.search': { ko: '게임 이름으로 검색', en: 'Search by title' },
  'lib.filters': { ko: '필터', en: 'Filters' },
  'lib.reset': { ko: '초기화', en: 'Reset' },
  'lib.results': { ko: '개 게임', en: 'games' },
  'lib.empty.title': { ko: '조건에 맞는 게임이 없어요', en: 'No games match' },
  'lib.empty.hint': {
    ko: '인원수나 언어 필터를 조금 풀어보세요.',
    en: 'Try relaxing the player count or language filter.'
  },

  // Filters
  'filter.players': { ko: '우리는 몇 명', en: 'We are' },
  'filter.players.unit': { ko: '명', en: '' },
  'filter.players.any': { ko: '상관없음', en: 'Any' },
  'filter.players.best': { ko: '베스트 인원만', en: 'Best at this count only' },
  'filter.weight': { ko: '무게', en: 'Weight' },
  'filter.weight.any': { ko: '전체', en: 'Any' },
  'filter.weight.light': { ko: '가벼움', en: 'Light' },
  'filter.weight.medium': { ko: '보통', en: 'Medium' },
  'filter.weight.heavy': { ko: '무거움', en: 'Heavy' },
  'filter.lang': { ko: '플레이 가능 언어', en: 'Playable in' },
  'filter.lang.any': { ko: '상관없음', en: 'Any' },
  'filter.lang.ko': { ko: '한국어로', en: 'Korean' },
  'filter.lang.en': { ko: '영어로', en: 'English' },
  'filter.lang.help': {
    ko: '한국어판이 있거나, 언어 의존도가 낮아(2 이하) 번역 없이도 즐길 수 있는 게임입니다.',
    en: 'Has a Korean edition, or is light enough on text (language dependence ≤ 2) to play without it.'
  },
  'filter.expansions': { ko: '확장판 숨기기', en: 'Hide expansions' },

  // Table columns
  'col.cover': { ko: '표지', en: 'Cover' },
  'col.title': { ko: '이름', en: 'Title' },
  'col.players': { ko: '인원', en: 'Players' },
  'col.time': { ko: '시간', en: 'Time' },
  'col.weight': { ko: '무게', en: 'Weight' },
  'col.langDep': { ko: '언어 의존도', en: 'Language' },
  'col.editions': { ko: '보유 언어', en: 'Editions' },

  // Value formatting
  'val.minutes': { ko: '분', en: 'min' },
  'val.players': { ko: '명', en: '' },
  'val.best': { ko: '베스트', en: 'best' },
  'val.expansion': { ko: '확장', en: 'expansion' },

  // Weight labels (also used as tooltip)
  'weight.light': { ko: '가벼움', en: 'Light' },
  'weight.medium': { ko: '보통', en: 'Medium' },
  'weight.heavy': { ko: '무거움', en: 'Heavy' },
  'weight.unknown': { ko: '정보 없음', en: 'No data' },

  // BGG language-dependence levels 1–5
  'langdep.1': { ko: '게임 내 텍스트 없음', en: 'No in-game text' },
  'langdep.2': {
    ko: '약간의 텍스트 — 쉽게 외우거나 간단한 대조표로 해결',
    en: 'Some text — easily memorized or a small crib sheet'
  },
  'langdep.3': {
    ko: '중간 정도의 텍스트 — 대조표나 스티커가 필요',
    en: 'Moderate text — needs a crib sheet or paste-ups'
  },
  'langdep.4': {
    ko: '텍스트 많음 — 플레이하려면 대량 번역이 필요',
    en: 'Extensive text — heavy translation needed to play'
  },
  'langdep.5': {
    ko: '다른 언어로는 플레이 불가',
    en: 'Unplayable in another language'
  },
  'langdep.unknown': { ko: '투표 없음', en: 'No votes' },

  // Recommend page
  'rec.title': { ko: '뭐 할까요?', en: 'What should we play?' },
  'rec.subtitle': {
    ko: '인원을 고르고, 원하는 분위기를 골라보세요.',
    en: 'Pick your player count, then a vibe or two.'
  },
  'rec.players': { ko: '몇 명인가요?', en: 'How many of you?' },
  'rec.keywords': { ko: '어떤 분위기?', en: 'What kind of night?' },
  'rec.empty.title': { ko: '딱 맞는 추천이 없네요', en: 'Nothing hand-picked yet' },
  'rec.empty.hint': {
    ko: '서가에서 직접 골라보시는 건 어때요?',
    en: 'Try the full library instead.'
  },
  'rec.empty.link': { ko: '서가 보기', en: 'Open the library' },

  // Misc
  'a11y.sortBy': { ko: '정렬', en: 'Sort by' },
  'a11y.coverAlt': { ko: '표지', en: 'cover' }
} as const satisfies Record<string, Entry>;

export type MessageKey = keyof typeof dict;
