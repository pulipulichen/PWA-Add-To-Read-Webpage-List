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



window.addEventListener('load', () => {
        const parsedUrl = new URL(window.location);
        const { searchParams } = parsedUrl;
        var parsedUrl = new URL(window.location.toString());
        document.write('Title shared: ' + parsedUrl.searchParams.get('name') 
        + '\nText shared: ' + parsedUrl.searchParams.get('description')
        + '\nURL shared: ' + parsedUrl.searchParams.get('link'));
      });

