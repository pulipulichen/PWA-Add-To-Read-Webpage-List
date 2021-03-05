/* global UBUtils */

const vueComputed = {
  searchParams: function () {
    let parsedUrl = new URL(window.location)
    let params = parsedUrl.searchParams

    let originalParams = {
      title: params.get('title'),
      url: params.get('url'),
      text: params.get('text'),
      share: params.get('share'),
      duration: params.get('duration'),
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
    originalParams.duration = this.getDurationFromParams(originalParams)
    
    //console.log(originalParams)
    //window.alert('調整後:' + JSON.stringify(originalParams))

    this.text = originalParams.text
    this.type = this.getType(originalParams.url)
    this.url = originalParams.url
    this.title = originalParams.title
    this.duration = originalParams.duration

    let ubVideoID = this.getUBVideoID(this.url)
    if (ubVideoID) {
      this.url = `https://www.y` + `out` + 'ube.com/watch?v=' + ubVideoID;
      (async () => {
        let info = await UBUtils.getInfo(this.url)
        //console.log('UBInfo', info)
        this.duration = info.durationText

        if (this.title === '') {
          this.title = info.title
        }
        
        if (this.url && this.url !== '') {
          this.countdownSeconds = this.waitSeconds
          //window.alert('countdown! ' + this.url)
          this.startCountdown()
        }
      })()
        
    }
    else if (this.url && this.url !== '') {
      this.countdownSeconds = this.waitSeconds
      //window.alert('countdown! ' + this.url)
      this.startCountdown()
    }

    return originalParams
  },
  isHomepage() {
    return !this.isReceivedFromSharing
  },
  isReceivedFromSharing() {
    //console.log(this.searchParams)
    //window.alert(JSON.stringify(this.searchParams))
    return ((typeof (this.searchParams.title) === 'string' && this.searchParams.title !== '' && this.searchParams.title !== this.noTitle)
            || (typeof (this.searchParams.url) === 'string' && this.searchParams.url !== ''))
  },
  isSheetAPIValid() {
    return this.validateSheetAPI(this.sheetAPI)
  },
  isSheetAppURLValid() {
    return this.validateSheetAppURL(this.sheetAppURL)
  },
  isMobilePWA() {
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
  isNeedSetup() {
    return (!this.isSheetAPIValid || !this.isSheetAppURLValid)
  },
//    isPWAReady () {
//      console.warn('[TODO]')
//      return true
//    },
  bookmarkletScript() {
    let width = 400
    let height = 630

    let baseURL = location.href
    if (baseURL.indexOf('?') > -1) {
      baseURL = baseURL.slice(0, baseURL.indexOf('?'))
    }

    let cmd = `javascript: (() => {let title, text = ''; if (window.getSelection() && window.getSelection().trim) {title = window.getSelection().trim(); text = document.title.trim()}`
            + `else {title = document.title.trim()}`
            + `window.open("${baseURL}`
            + `?title=" + encodeURIComponent(title) + "&url=" + location.href + "&text=" + encodeURIComponent(text) + "&duration=" + document.body.innerText.replace(/ /g, '').length,`
            + ` '_blank', `
            + `"scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${width},height=${height}")})()`
    return cmd
  },
  showBookmarkletHint() {
    window.alert('Drag this link to your bookmark')
  },
  isSubmitDisabled() {
    return !(this.url && this.url !== '')
  },
  isURLValid() {
    return this.validateURL(this.url)
  },
  shareToEmail() {
    let body = []
    if (this.isURLValid) {
      body.push(this.url)
    }
    if (this.text && this.text !== '') {
      body.push(this.text)
    }
    return `mailto:?subject=${this.title}&body=${body.join('\n')}`
  },
  shareToTwitter() {
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
  hasTitle() {
    return (this.title && this.title !== '' && this.title !== this.noTitle)
  },
  hasText() {
    return (this.text && this.text !== '')
  },
  shareToFacebook() {

    if (!this.isURLValid) {
      return undefined
    }

    return `https://www.facebook.com/sharer/sharer.php?u=` + encodeURIComponent(this.url)
  },
  shareToPlurk() {
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
  shareToPlurk() {
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
}