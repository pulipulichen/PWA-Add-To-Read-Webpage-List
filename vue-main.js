/* global fetch */

let app = {
  el: '#app',
  vuetify: new Vuetify(),
  data: {
    cacheKey: 'add-to-read-webpage-list',
    cacheAttrs: ['sheetAPI', 'waitSeconds', 'sheetAppURL'],
    inited: false,

    types: ['article', 'video'],
    type: 'article',
    text: '',
    title: '',
    url: '',
    display: 'setting',
    isSubmiting: false,
    
    noTitle: '(No Title)',
    
    sheetAPI: 'https://script.google.com/macros/s/AKfycbzDb9jHAK9FyoBpEPTZVHLLyeJy_uFhItwStp-kugjbeQInM1CKalX0/exec',
    sheetAppURL: 'https://www.appsheet.com/start/3e9b9b68-2fec-4e07-84b8-041d7e7d1c68',
    waitSeconds: 5,
    
    validateSheetAPIRules: [],
    validateSheetAppURLRules: [],
    validateURLRules: [],
    
    countdownSeconds: -1,
    installPWAEvent: null,
    preventAutoCountdown: false,
    
    isDoShare: false
  },
  mounted: function () {
    this.dataLoad()
    
    this.setupValidateRules()
    this.initDisplay()
    
    this.inited = true
    
    if (this.isDoShare && navigator.share) {
      this.shareToSystem()
    }
    
  },
  computed: {
    searchParams() {
      let parsedUrl = new URL(window.location)
      let params = parsedUrl.searchParams

      let originalParams = {
        title: params.get('title'),
        url: params.get('url'),
        text: params.get('text'),
        share: params.get('share'),
      }
      
      if (originalParams.share && originalParams.share.toLowerCase() !== 'false') {
        this.isDoShare = true
        this.preventAutoCountdown = true
      }
      
      //window.alert('調整前:' + JSON.stringify(originalParams))
      
      originalParams.title = this.getTitleFromParams(originalParams)
      originalParams.title = this.filterTitle(originalParams.title)
      originalParams.url = this.getURLFromParams(originalParams)
      originalParams.text = this.getTextFromParams(originalParams)
      originalParams.text = this.filterText(originalParams.text)
      
      //console.log(originalParams)
      //window.alert('調整後:' + JSON.stringify(originalParams))
      
      this.text = originalParams.text
      this.type = this.getType(originalParams.url)
      this.url = originalParams.url
      this.title = originalParams.title

      if (this.url && this.url !== '') {
        this.countdownSeconds = this.waitSeconds
        //window.alert('countdown! ' + this.url)
        this.startCountdown()
      }

      return originalParams
    },
    isHomepage () {
      return !this.isReceivedFromSharing
    },
    isReceivedFromSharing() {
      //console.log(this.searchParams)
      //window.alert(JSON.stringify(this.searchParams))
      return ((typeof(this.searchParams.title) === 'string' && this.searchParams.title !== '' && this.searchParams.title !== this.noTitle) 
              || (typeof(this.searchParams.url) === 'string' && this.searchParams.url !== ''))
    },
    isSheetAPIValid () {
      return this.validateSheetAPI(this.sheetAPI)
    },
    isSheetAppURLValid () {
      return this.validateSheetAppURL(this.sheetAppURL)
    },
    isMobilePWA () {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (document.referrer.startsWith('android-app://')) {
        //return 'twa';
        return true
      } else if (navigator.standalone || isStandalone) {
        //return 'minimal-ui';
        return true
      }
      //return 'browser';
      return false
    },
    isNeedSetup () {
      return (!this.isSheetAPIValid || !this.isSheetAppURLValid)
    },
//    isPWAReady () {
//      console.warn('[TODO]')
//      return true
//    },
    bookmarkletScript () {
      let width = 400
      let height = 580
      let cmd = `javascript: (() => {let title, text = ''; if (window.getSelection() && window.getSelection().trim) {title = window.getSelection().trim(); text = document.title.trim()}`
        + `else {title = document.title.trim()}`
        + `window.open("${location.href}`
        + `?title=" + title + "&url=" + location.href + "&text=" + text,`
        + ` '_blank', `
        + `"scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${width},height=${height}")})()`
      return cmd
    },
    showBookmarkletHint () {
      window.alert('Drag this link to your bookmark')
    },
    isSubmitDisabled () {
      return !(this.title && this.title !== '' && this.title !== this.noTitle
              && this.url && this.url !== '')
    },
    isURLValid () {
      return this.validateURL(this.url)
    },
    shareToEmail () {
      let body = []
      if (this.isURLValid) {
        body.push(this.url)
      }
      if (this.text && this.text !== '') {
        body.push(this.text)
      }
      return `mailto:?subject=${this.title}&body=${body.join('\n')}`
    },
    shareToTwitter () {
      let twitterBody = []
      if (this.title && this.title !== '' && this.title !== this.noTitle) {
        twitterBody.push(this.title)
      }
      if (this.text && this.text !== '') {
        twitterBody.push(this.text)
      }

      twitterBody = encodeURIComponent(twitterBody.join(' '))

      return `https://twitter.com/intent/tweet?text=${twitterBody}&url=${this.url}&related=`
    },
    hasTitle () {
      return (this.title && this.title !== '' && this.title !== this.noTitle)
    }, 
    hasText () {
      return (this.text && this.text !== '')
    }, 
    shareToFacebook () {
      
      if (!this.isURLValid) {
        return undefined
      }
      
      return `https://www.facebook.com/sharer/sharer.php?u=` + encodeURIComponent(this.url)
    },
    shareToPlurk () {
      let body = []
      if (this.hasTitle) {
        body.push(this.title)
      }
      if (this.hasText) {
        body.push(this.text)
      }
      if (this.isURLValid) {
        body.push(this.url)
      }

      body = encodeURIComponent(body.join(' '))

      return `http://www.plurk.com/?qualifier=shares&status=` + body
    },
    shareToPlurk () {
      let body = []
      if (this.hasTitle) {
        body.push(this.title)
      }
      if (this.hasText) {
        body.push(this.text)
      }
      if (this.isURLValid) {
        body.push(this.url)
      }

      body = encodeURIComponent(body.join(' '))

      return `http://www.plurk.com/?qualifier=shares&status=` + body
    }
  }, 
  watch: {
    sheetAPI () {
      this.dataSave()
    },
    waitSeconds () {
      this.dataSave()
    },
    sheetAppURL () {
      this.dataSave()
    },
  },
  methods: {
    dataLoad () {
      let projectFileListData = localStorage.getItem(this.cacheKey)
      if (!projectFileListData) {
        return false
      }
      
      projectFileListData = JSON.parse(projectFileListData)
      for (let key in projectFileListData) {
        this[key] = projectFileListData[key]
      }
    },
    dataSave () {
      if (this.inited === false) {
        return false
      }
      
      let keys = this.cacheAttrs
      
      let data = {}
      keys.forEach(key => {
        data[key] = this[key]
      })
      
      data = JSON.stringify(data)
      localStorage.setItem(this.cacheKey, data)
    },
    
    postData(url, data) {
      // Default options are marked with *
      return fetch(url, {
        body: JSON.stringify(data), // must match 'Content-Type' header
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: 'same-origin', // include, same-origin, *omit
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        //mode: 'cors', // no-cors, cors, *same-origin
        //redirect: 'follow', // manual, *follow, error
        //referrer: 'no-referrer', // *client, no-referrer
      })
              //.error(message => console.log(message))
              .then(async response => console.log(await response.json())) // 輸出成 json
    },
    getTitleFromParams(params) {
      if (params.title) {
        return params.title
      } else if (params.text) {
        return params.text
      } else if (params.url) {
        return params.url
      }
      return this.noTitle
    },
    filterTitle (title) {
      // '在 YouTube 上觀看「'
      if (title.startsWith('在 YouTube 上觀看「')
              && title.endsWith('」')) {
        return title.slice(14, title.length - 1)
      }
      else if (title.startsWith('立即體驗「')
              && title.endsWith('」')) {
        return title.slice(5, title.length - 1)
      }
      else {
        return title
      }
    },
    filterText (text) {
      if (text.endsWith('透過Hermit發送 • https://hermit.news')) {
        text = text.slice(0, text.lastIndexOf('\n'))
      }
      return text.trim()
    },
    getTextFromParams(params) {
      if (params.text === params.url) {
        return ''
      }

      let url = this.getURLFromParams(params)
      if (url === params.text) {
        return ''
      }

      let title = this.getTitleFromParams(params)
      if (title === params.text) {
        return ''
      }
      
      if (title + '\n' + url === params.text
              || title + '.\n' + url === params.text) {
        return ''
      }

      if (params.text) {
        return params.text.trim()
      }

      return ''
    },
    getURLFromParams(params) {
      if (params.url) {
        return params.url
      }
      let text = params.text
//      window.alert('text: ' + text)
      if (!text) {
        return undefined
      }
      text = text.trim()
      
      if (this.validateURL(text)) {
//        window.alert('is text: ' + text)
        return text
      }
      return this.extracURLfromString(text)
    },
    extracURLfromString(string) {
      if (!string) {
        return undefined
      }
      
      string = string.split('\n').join(' ').trim()
      
      var urlRegex = /(http[s]?:\/\/[^ ]*)/;

      let matches = string.match(urlRegex)
      if (!matches) {
        return undefined
      }
      
      var url = matches[1];
      url = url.trim()
      console.log(url)
      return url
    },
    getType(url) {
      if (!url || url === '') {
        return 'article'
      }
      if (!this.validateURL(url)) {
        return 'article'
      }
      
      let host
      
      try {
        host = (new URL(url)).host
      }
      catch (e) {
        console.error(e)
        return 'article'
      }

      let UBVideoID = this.getUBVideoID(url)
      if ((host === 'www.youtube.com'
              || host === 'youtu.be'
              || host === 'm.youtube.be') && UBVideoID) {
        return 'video'
      } 
      else if (this.getFacebookVideoID(url)) {
        return 'video'
      }
      else if (url.endsWith('.mp3') || url.endsWith('.ogg') || url.endsWith('.mp4') || url.endsWith('.wav')) {
        return 'video'
      }

      return 'article'
    },
    openSheetAppURL () {
      if (!this.isSheetAppURLValid) {
        return false
      }
      
      window.open(this.sheetAppURL, '_blank')
    },
    getUBVideoID(url) {

      if (!url) {
        return false
      }

      if (url.indexOf('user/', 5) === 0) { // 1.
        return false
      }

      //if ( preg_match('/^[a-zA-Z0-9\-\_]{11}$/', $url)) { // 2.
      //return $url;
      if (/^[a-zA-Z0-9\-\_]{11}$/.test(url)) {
        return url
      }

      let matchResult
      matchResult = url.match(/(?:watch\?v=|v\/|embed\/|ytscreeningroom\?v=|\?v=|\?vi=|e\/|watch\?.*vi?=|\?feature=[a-z_]*&v=|vi\/)([a-zA-Z0-9\-\_]{11})/)
      if (matchResult) {
        return matchResult[1]
      }

      matchResult = url.match(/([a-zA-Z0-9\-\_]{11})(?:\?[a-z]|\&[a-z])/)
      if (matchResult) {
        return matchResult[1]
      }

      matchResult = url.match(/u\/1\/([a-zA-Z0-9\-\_]{11})(?:\?rel=0)?$/)
      if (matchResult) {
        return false
      }

      matchResult = url.match(/(?:watch%3Fv%3D|watch\?v%3D)([a-zA-Z0-9\-\_]{11})[%&]/)
      if (matchResult) {
        return matchResult[1]
      }

      // 7. Rules for special cases
      matchResult = url.match(/watchv=([a-zA-Z0-9\-\_]{11})&list=/)
      if (matchResult) {
        return matchResult[1]
      }

      return false
    },
    getFacebookVideoID(url) {
      //var url   = "https://www.facebook.com/photo.php?v=7489378947389&set=t.674367&type=3&theater";
      //var regex = /^http(?:s?):\/\/www\.facebook\.com\/photo.php\?v=(\d+)/;

      var myRegexp = /^http(?:s?):\/\/(?:www\.|web\.|m\.)?facebook\.com\/([A-z0-9\.]+)\/videos(?:\/[0-9A-z].+)?\/(\d+)(?:.+)?$/gm;
      var match = myRegexp.exec(url)
      if (match) {
        return match[2]
      }
    },
    getTypefromParams(params) {
      if (params.type) {
        return params.type
      }
      return 'article'
    },
    initDisplay () {
      //console.log(this.isReceivedFromSharing)
      //window.alert(this.isReceivedFromSharing)
      if (this.isNeedSetup) { 
        this.display = 'setting'
      }
      else if (this.isReceivedFromSharing) {
        this.display = 'submit'
      }
      else {
        this.display = 'setting'
      }
    },
    backToSubmit () {
      if (this.isNeedSetup || !this.isReceivedFromSharing) {
        return false
      }
      
      this.display = 'submit'
    },
    validateSheetAPI (url) {
      // 'https://script.google.com/macros/s/<ID>/exec'
      return (url
        && url.startsWith('https://script.google.com/macros/s/')
        && url.endsWith('/exec'))
    },
    validateSheetAppURL (url) {
      //console.warn('[TODO]')
      //https://www.appsheet.com/start/3e9b9b68-2fec-4e07-84b8-041d7e7d1c68 
      
      return url.startsWith('https://www.appsheet.com/start/')
    },
    /**
     * https://stackoverflow.com/a/5717133/6645399
     * @param {type} str
     * @returns {Boolean}
     */
    validateURL (str) {
      //return true
      
      var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      return !!pattern.test(str);
    },
//    openSheetAPIInstruction () {
//      let url = 'https://pulipulichen.github.io/PWA-Add-To-Read-Webpage-List/document/sheet-api.md'
//      //if (this.isMobilePWA) {
//      //}
//      window.open(url, '_system')
//    },
    setupValidateRules () {
      
      this.validateSheetAPIRules = [
        (value) => {
          if (!this.validateSheetAPI(value)) {
            return `Incorrect Sheet API. Example: 'https://script.google.com/macros/s/<ID>/exec'`
          }
          return true
        }
      ]

      this.validateSheetAppURLRules = [
        (value) => {
          if (!this.validateSheetAppURL(value)) {
            console.warn('[TODO]')
            return `Incorrect Sheet APP URL. Example: '!!!!!!'`
          }
          return true
        }
      ]
      
      this.validateURLRules = [
        (value) => {
          if (!this.validateURL(value)) {
            return `Incorrect URL.`
          }
          return true
        }
      ]
    },
    startCountdown () {
      if (this.preventAutoCountdown) {
        return false
      }
      
      if (this.isNeedSetup) {
        this.countdownSeconds = -1
        return false
      }
      
      setTimeout(() => {
        this.countdownSeconds--
        
        if (this.countdownSeconds > 0) {
          this.startCountdown()
        }
        else if (this.countdownSeconds === 0) {
          this.submitToSheetAPI()
        }
      }, 1000)
    },
    submitToSheetAPI: async function () {
      if (this.isSubmitDisabled) {
        return false
      }
      
      this.isSubmiting = true
      let data = {
        title: this.title,
        url: this.url,
        text: this.text,
        type: this.type
      }
      await fetch(this.sheetAPI, {
        body: JSON.stringify(data), // must match 'Content-Type' header
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: 'same-origin', // include, same-origin, *omit
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        //mode: 'cors', // no-cors, cors, *same-origin
        //redirect: 'follow', // manual, *follow, error
        //referrer: 'no-referrer', // *client, no-referrer
      })
      //.error(message => console.log(message))
      .then(async response => console.log(await response.json())) // 輸出成 json
      
      window.close()
    },
    installPWA: async function () {
      if (!this.installPWAEvent) {
        return false
      }
      
      this.installPWAEvent.prompt();
      // Wait for the user to respond to the prompt
      const {outcome} = await this.installPWAEvent.userChoice;
      // Optionally, send analytics event with outcome of user choice
      console.log(`User response to the install prompt: ${outcome}`);
      // We've used the prompt, and can't use it again, throw it away
      this.installPWAEvent = null;
    },
    setupPWAEvent (e) {
      this.installPWAEvent = e
    },
//    shareToAddThis (service) {
//      // http://www.addthis.com/bookmark.php?v=300&winname=addthis&pub=pulipuli&s=facebook&source=msd-1.0&url=http://blog.pulipuli.info/2020/04/google-chrome-how-to-make-google-chrome.html&title=%E5%A6%82%E4%BD%95%E8%AE%93Google%20Chrome%E9%96%8B%E5%95%9F%E6%99%82%E5%B0%B1%E4%BD%94%E6%BB%BF%E6%95%B4%E5%80%8B%E8%9E%A2%E5%B9%95%E4%B8%A6%E9%9A%B1%E8%97%8F%E6%8E%A7%E5%88%B6%E4%BB%8B%E9%9D%A2%EF%BC%9F%20/%C2%A0How%20to%20make%20Google%20Chrome%20open%20to%20fill%20the%20entire%20screen%20and%20hide%20the%20control%20interface?&ate=AT-pulipuli/-/per-13/-/4&frommenu=1&ips=1&uud=1&ct=1&pre=http%3A%2F%2Fblog.pulipuli.info%2F&tt=0&captcha_provider=nucaptcha&pro=1
//      
//      if (service === 'twitter') {
//        
//      }
//      
//      
//      return `http://www.addthis.com/bookmark.php?v=300&winname=addthis&s=${service}&source=msd-1.0&url=${this.url}&title=${this.title}&ate=AT-pulipuli/-/per-13/-/4&frommenu=1&ips=1&uud=1&ct=1&tt=0&captcha_provider=nucaptcha&pro=1`
//    },
    shareToSystem: async function () {
      // 判斷瀏覽器是否支援 Web Share API
      if (navigator.share) {
        // navigator.share 會回傳 Promise
        
        await navigator.share({
          title: this.title,
          text: this.text,
          url: this.url,
        })
        window.close()
      }
      else {
        window.alert('Cannot share')
      }
    },
    exit () {
      window.close()
    }
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  app = new Vue(app)
})

//let deferredPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault()
  // Stash the event so it can be triggered later.
  //deferredPrompt = e
  console.log('ok')
  app.setupPWAEvent(e)
})