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
    
    sheetAPI: 'https://script.google.com/macros/s/AKfycbzDb9jHAK9FyoBpEPTZVHLLyeJy_uFhItwStp-kugjbeQInM1CKalX0/exec',
    sheetAppURL: 'https://www.appsheet.com/start/3e9b9b68-2fec-4e07-84b8-041d7e7d1c68 ',
    waitSeconds: 5,
    
    validateSheetAPIRules: [],
    validateSheetAppURLRules: [],
    validateURLRules: [],
    
    countdownSeconds: -1,
    installPWAEvent: null
  },
  mounted: function () {
    this.dataLoad()
    
    this.setupValidateRules()
    this.initDisplay()
    
    this.inited = true
  },
  computed: {
    searchParams() {
      let parsedUrl = new URL(window.location)
      let params = parsedUrl.searchParams

      let originalParams = {
        title: params.get('title'),
        url: params.get('url'),
        text: params.get('text'),
      }
      
      originalParams.title = this.getTitleFromParams(originalParams)
      originalParams.text = this.getTextFromParams(originalParams)
      originalParams.url = this.getURLFromParams(originalParams)

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
      return (typeof(this.searchParams.url) === 'string' && this.searchParams.url !== '')
    },
    isSheetAPIValid () {
      return this.validateSheetAPI(this.sheetAPI)
    },
    isSheetAppURLValid () {
      return this.validateSheetAppURL(this.sheetAppURL)
    },
    isMobilePWA () {
      const isStandalone = window.matchMedia('(display-mode: minimal-ui)').matches;
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
    isPWAReady () {
      console.warn('[TODO]')
      return true
    },
    bookmarkletScript () {
      let width = 400
      let height = 510
      let cmd = `javascript: window.open("${location.href}`
        + `?title=" + document.title.trim() + "&url=" + location.href + "&text=" + window.getSelection(),`
        + ` '_blank', `
        + `"scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${width},height=${height}")`
      return cmd
    },
    showBookmarkletHint () {
      window.alert('Drag this link to your bookmark')
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
      return 'No Title'
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
      if (!text) {
        return undefined
      }
      return this.extracURLfromString(text)
    },
    extracURLfromString(string) {
      if (!string) {
        return undefined
      }
      
      var urlRegex = /(http[s]?:\/\/[^ ]*)/;

      var url = string.match(urlRegex)[1];
      return url
    },
    getType(url) {
      if (!url || url === '') {
        return 'article'
      }
      
      let host = (new URL(url)).host

      let UBVideoID = this.getUBVideoID(url)
      if ((host === 'www.youtube.com'
              || host === 'youtu.be'
              || host === 'm.youtube.be') && UBVideoID) {
        return 'video'
      } else if (this.getFacebookVideoID(url)) {
        return 'video'
      }

      return 'article'
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
      console.warn('[TODO]')
      return true
    },
    validateURL (url) {
      console.warn('[TODO]')
      return true
    },
    openSheetAPIInstruction () {
      let url = 'https://pulipulichen.github.io/PWA-Add-To-Read-Webpage-List/document/sheet-api.md'
      //if (this.isMobilePWA) {
      //}
      window.open(url, '_system')
    },
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