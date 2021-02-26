/* global fetch */

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
  //.then(response => response.json()) // 輸出成 json
}

let url = 'https://script.google.com/macros/s/AKfycbzDb9jHAK9FyoBpEPTZVHLLyeJy_uFhItwStp-kugjbeQInM1CKalX0/exec'

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
    await postData(url, {
      title: parsedUrl.searchParams.get('title'),
      text: parsedUrl.searchParams.get('text'),
      url: parsedUrl.searchParams.get('url')
    })
    console.log('data is added. close window.')
    window.close()
  }
  else {
    //document.getElementById('message').innerText = 'Please install PWA'
    showInstallInformation()
    setupBookmarklet()
  }
  
});


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
  
  link.href = `javascript: window.open("${location.href}?title=" + document.title + "&url=" + location.href, '_blank', "scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=100,height=100")`
}

let showInstallInformation = function () {
  document.getElementById('information').style.display = 'block'
  document.getElementById('loadingLayer').style.display = 'none'
}