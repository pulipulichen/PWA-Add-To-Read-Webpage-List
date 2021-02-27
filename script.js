/* global fetch, CONFIG */

function postData(url, data) {
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
}

let url = CONFIG.sheetAPI

/*
postData(url, {
  title: 'test',
  url: 'https://blog.pulipuli.info'
})
 */



//window.addEventListener('load', () => {
//        var parsedUrl = new URL(window.location.toString());
//        window.alert('Title shared: ' + parsedUrl.searchParams.get('name') 
//        + '\nText shared: ' + parsedUrl.searchParams.get('description')
//        + '\nURL shared: ' + parsedUrl.searchParams.get('link'));
//      });


window.addEventListener('DOMContentLoaded', async () => {
//  document.getElementById('href').textContent = window.location.href;
    const parsedUrl = new URL(window.location);
//  document.getElementById('title').textContent = parsedUrl.searchParams.get('title');
//  document.getElementById('text').textContent = parsedUrl.searchParams.get('text');
//  document.getElementById('url').textContent = parsedUrl.searchParams.get('url');
  
  if (parsedUrl.searchParams.get('title')) {
    setupAddConfirmForm(parsedUrl)
  }
  else {
    //document.getElementById('message').innerText = 'Please install PWA'
    showInstallInformation()
    setupBookmarklet()
  }
});

let addTitleInput = document.getElementById('addTitle')
let addTypeInput = document.getElementById('addType')
let addTextInput = document.getElementById('addText')
let addOKButton = document.getElementById('addOK')

let addTitleValue
let addURLValue

async function setupAddConfirmForm (parsedUrl) {
  let text = parsedUrl.searchParams.get('text')
  if (text && typeof text.trim === 'function') {
    text = text.trim()
  }
  
  addTitleValue = parsedUrl.searchParams.get('title').trim()
  addTitleInput.innerText = addTitleValue
  
  addURLValue = parsedUrl.searchParams.get('url')
  addTypeInput.value = getType(addURLValue)
  addTextInput.value = text
  
  startCountdown()
    
}

addOKButton.addEventListener('click', async function () {
  addOKButton.innerHTML = `<img src="./assets/loading.svg" />`
  
  addOKButton.disabled = 'disabled'
  addTypeInput.disabled = 'disabled'
  addTextInput.disabled = 'disabled'
  
  await postData(url, {
    title: addTitleValue,
    text: addTextInput.value,
    type: addTypeInput.value,
    url: addURLValue
  })
  console.log('data is added. close window.')
  window.close()
})

addTypeInput.addEventListener('focus', () => {
  addOKButton.innerText = `OK`
  preventCountdown = true
})

addTextInput.addEventListener('focus', () => {
  addOKButton.innerText = `OK`
  preventCountdown = true
})

let countdownCounter = CONFIG.countdownCounter
let preventCountdown = false

addOKButton.innerText = `OK (${countdownCounter})`

function startCountdown() {
  setTimeout(() => {
    if (preventCountdown === true) {
      addOKButton.innerText = `OK`
      return false
    }
    
    countdownCounter--
    
    if (countdownCounter > 0) {
      addOKButton.innerText = `OK (${countdownCounter})`
      startCountdown()
    }
    else {
      addOKButton.click()
    }
  }, 1000)
}

function getType(url) {
  let host = (new URL(url)).host

  let UBVideoID = getUBVideoID(url)
  if ((host === 'www.youtube.com' 
      || host === 'youtu.be'
      || host === 'm.youtube.be') && UBVideoID) {
    return 'video'
  }
  else if (getFacebookVideoID(url)) {
    return 'video'
  }

  return 'article'
}

// Initialize deferredPrompt for use later to show browser install prompt.
let deferredPrompt;
let buttonInstall = document.getElementById('buttonInstall')

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can install the PWA
  //showInstallPromotion();
  buttonInstall.style.display = 'inline'
  // Optionally, send analytics event that PWA install promo was shown.
  console.log(`'beforeinstallprompt' event was fired.`);
});


buttonInstall.addEventListener('click', async () => {
  // Hide the app provided install promotion
  //hideInstallPromotion();
  // Show the install prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  const {outcome} = await deferredPrompt.userChoice;
  // Optionally, send analytics event with outcome of user choice
  console.log(`User response to the install prompt: ${outcome}`);
  // We've used the prompt, and can't use it again, throw it away
  deferredPrompt = null;
});


let setupBookmarklet = function () {
  let link = document.getElementById('bookmarklet')
  
  link.addEventListener('click', e => {
    e.preventDefault()
    e.stopPropagation()
    
    window.alert('Drag this link to your bookmark')
  })
  
  let width = 200
  let height = 186
  link.href = `javascript: window.open("${location.href}?title=" + document.title.trim() + "&url=" + location.href + "&text=" + window.getSelection(), '_blank', "scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${width},height=${height}")`
}

let showInstallInformation = function () {
  document.getElementById('information').style.display = 'block'
  document.getElementById('loadingLayer').style.display = 'none'
}


function getUBVideoID (url) {

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
}

function getFacebookVideoID (url) {
  //var url   = "https://www.facebook.com/photo.php?v=7489378947389&set=t.674367&type=3&theater";
  //var regex = /^http(?:s?):\/\/www\.facebook\.com\/photo.php\?v=(\d+)/;

  var myRegexp = /^http(?:s?):\/\/(?:www\.|web\.|m\.)?facebook\.com\/([A-z0-9\.]+)\/videos(?:\/[0-9A-z].+)?\/(\d+)(?:.+)?$/gm;
  var match = myRegexp.exec(url)
  if (match) {
    return match[2]
  }
}
