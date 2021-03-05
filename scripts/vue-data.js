const vueData = {
  cacheKey: 'add-to-read-webpage-list',
  cacheAttrs: ['sheetAPI', 'waitSeconds', 'sheetAppURL', 'tags'],
  inited: false,

  types: ['article', 'video'],
  type: 'article',
  text: '',
  title: '',
  url: '',
  tags: [],
  duration: '',
  display: 'setting',
  isSubmiting: false,

  noTitle: '',

  sheetAPI: 'https://script.google.com/macros/s/AKfycbzDb9jHAK9FyoBpEPTZVHLLyeJy_uFhItwStp-kugjbeQInM1CKalX0/exec',
  sheetAppURL: 'https://www.appsheet.com/start/3e9b9b68-2fec-4e07-84b8-041d7e7d1c68',
  waitSeconds: 5,

  validateSheetAPIRules: [],
  validateSheetAppURLRules: [],
  validateURLRules: [],

  countdownSeconds: -1,
  installPWAEvent: null,
  preventAutoCountdown: false,

  isDoShare: false,
  
  titleExclusiveList: [
    'Google 新聞 -'
  ]
}