const UBUtils = {
  getInfo: function (url) {
//    if (this.inited === true) {
//      //console.log('已經初始化了')
//      return false
//    }
    //console.log('開始初始化')
    
    this.videoID = this.parseVideoID(url)
    
    if (!this.cache) {
      let cache = localStorage.getItem(this.cacheKey)
      if (cache) {
        this.cache = JSON.parse(cache)
      }
      else {
        this.cache = {}
      }
    }
    if (this.cache[this.videoID]) {
      return this.cache[this.videoID]
    }
    
    if (!this.videoID) {
      return undefined
    }

    //let _this = this
    return new Promise(async (resolve) => {
      this.containerID = 'YouTubePlayer' + (new Date).getTime()
      
      while (!window.YT || typeof window.YT.Player !== 'function') {
        await this.sleep()
      }
      
      //let inited = false
      
//      while (true) {
//        id = 'YouTubePlayer' + (new Date).getTime()
//        if (!document.getElementById(id)) {
//          break
//        } else {
//          await this.sleep()
//        }
//      }

      let container = document.createElement("div");
      container.id = this.containerID
      //container.style.position = 'fixed'
      //container.style.top = '-100vh'
      container.style.top = '0vh'
      document.body.appendChild(container);
      
      setTimeout(() => {
        this.onYouTubeIframeAPIReady(resolve)
      }, 0)
      
    })  // return new Promise(async (resolve) => {
  },
  onYouTubeIframeAPIReady (resolve) {
    //console.log(122)

    this.player = new window.YT.Player(this.containerID, {
      height: '1',
      width: '1',
      //height: '150',
      //width: '300',
      playerVars: {
        'autoplay': 0,
        'controls': 1,
        showinfo: 0,
        branding: 0,
        rel: 0,
      },
      //videoId: 'M7lc1UVf-VE',
      videoId: this.videoID,
      events: {
        'onReady': (event) => {
          this.onPlayerReady(event)
        },
        'onStateChange': (event) => {
          if (this.onPlayerStateChange(event)) {
            let output = {}
            
            output.duration = this.player.getDuration()
            output.durationText = this.parseDurationText(output.duration)
            output.title = this.player.getVideoData().title
            
            this.cache[this.videoID] = output
            localStorage.setItem(this.cacheKey, JSON.stringify(this.cache))
            
            resolve(output)
            document.getElementById(this.containerID).remove()
          }
        }
      }
    })
    //console.log(222)
  },
  onPlayerStateChange (event) {
    //console.log(this.BGMPlayerState)
    this.state = event.data
    if (event.data === 1) {
      //inited = true
      //setTimeout(() => {
      event.target.pauseVideo()
      //console.log(1)

      //setTimeout(() => {
      //event.target.setVolume(this.volumeNumber)
//      if (this.isMute === false) {
//        event.target.unMute()
//      }
      //console.log(2)

      //this.BGMPlayer = event.target
      //console.log(this.BGMPlayer)
      //setTimeout(() => {
      //console.log(3)
      //event.target.setVolume(100)
      //event.target.unMute()
      this.inited = true
      //this.checkWaitAction()
      //resolve(true)
      return true
      //}, 0)
      //}, 0)
      //}, 0)
    }
  },
  onPlayerReady (event) {
    //console.log(333)
    event.target.setVolume(0)
    event.target.mute()
    event.target.setLoop(true)

    event.target.playVideo()
  },
  parseVideoID(url) {
    if (!url) {
      return undefined
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
  parseDurationText (durationSeconds) {
    durationSeconds = Math.ceil(durationSeconds)
    let hour = Math.floor(durationSeconds / 3600)
    let minute = Math.floor((durationSeconds % 3600) / 60)
    let second = ((durationSeconds % 3600) % 60)
    
    if (second < 10) {
      second = '0' + second
    }
    
    if (hour > 0) {
      if (minute < 10) {
        minute = '0' + minute
      }
      return `${hour}:${minute}:${second}`
    }
    else {
      return `${minute}:${second}`
    }
  },
  
  inited: false,
  videoID: null,
  plater: null,
  containerID: null,
  
  sleep(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  cache: null,
  cacheKey: 'UB-Util'
}