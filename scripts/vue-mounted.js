const vueMounted = async function () {
  this.dataLoad()

  this.setupValidateRules()
  this.initDisplay()

  //console.log(await UBUtils.getDuration('https://www.youtube.com/watch?v=WtD8zAtpmv8'))

  this.inited = true

//    window.alert(JSON.stringify({
//      doShare: this.isDoShare,
//      nav: (typeof navigator.share)
//    }))
//    if (this.isDoShare && navigator.share) {
//      this.shareToSystem()
//    }
}