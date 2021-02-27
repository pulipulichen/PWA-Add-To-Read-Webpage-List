/* global fetch */

let app = {
  el: '#app',
  data: {
    cacheKey: 'add-to-read-webpage-list',
    cacheAttrs: ['sheetAPI', 'waitSeconds'],
    inited: false,

    
    type: 'article',
    text: '',
    display: 'loading',
    
    sheetAPI: undefined,
    waitSeconds: 5
  },
  mounted: function () {
    this.dataLoad()
    
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

      originalParams.title = this.getTitleFromParams(params)
      originalParams.text = this.getTextFromParams(params)
      originalParams.url = this.getURLFromParams(params)

      return originalParams
    },
    isHomepage () {
      return !this.isReceivedFromSharing
    },
    isReceivedFromSharing() {
      return (this.searchParams.title && this.searchParams.url)
    }
  },
  watch: {
    'searchParams.text' (text) {
      this.text = text
    },
    'searchParams.url' (url) {
      this.type = this.getType(url)
    },
    sheetAPI () {
      this.dataSave()
    },
    waitSeconds () {
      this.dataSave()
    }
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

      return params.text.trim()
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
      if (!this.sheetAPI) {
        this.display = 'setting'
      }
      else if (this.isReceivedFromSharing) {
        this.display = 'submit'
      }
      this.display = 'setting'
    },
     
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  new Vue(app)
})