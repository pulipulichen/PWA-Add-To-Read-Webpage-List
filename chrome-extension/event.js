/* global chrome */

async function genericOnClick(info, tab, other) {  
  //根據你點選右鍵的狀況不同，可以得到一些跟內容有關的資訊  
  //例如 頁面網址，選取的文字，圖片來源，連結的位址  
  /*
  window.alert(  
      "ID是：" + info.menuItemId + "\n" +  
      "現在的網址是：" + info.pageUrl + "\n" +  
      "選取的文字是：" + (info.selectionText ? info.selectionText : "") + "\n" +  
      "現在hover元素的圖片來源：" + (info.srcUrl ? info.srcUrl : "") + "\n" +  
      "現在hover的連結：" + (info.linkUrl ? info.linkUrl : "") + "\n" +  
      "現在hover的frame是：" + (info.frameUrl ? info.frameUrl : "") + " \n" +
      JSON.stringify(info)
  );
  */
  //window.alert(JSON.stringify(tab))
  
  /*
  document.getElementById("title").innerHTML = "Title: " + parsedResponse.title;
  document.getElementById("keywords").innerHTML = "Keywords: " + parsedResponse.getElementsByName("keywords")[0].getAttribute("content");
  document.getElementById("visibleText").innerHTML = "Visible Text: " + parsedResponse.getElementsByTagName("body")[0].textContent;
  */
  //window.alert(JSON.stringify(info))
  //return
 
  var url, title, text = '', duration = 0;
  
  if (info.linkUrl) {
    url = info.linkUrl
    
    let currentURL = info.pageUrl
    if (!currentURL) {
      currentURL = currentURL.url
    }
    
    let result = await getTitleAndDuration(url, currentURL)
    //window.alert(JSON.stringify(result))
    
    title = result.title
    duration = result.duration
    
//    shareTargetURL = shareTargetURL 
//            + "?title=" + encodeURIComponent(title) + "&url=" + url + "&duration=" + duration
  }
  else {
    url = info.pageUrl;
    if (!url) {
      url = tab.url
    }
    
    let result = await getTitleAndDuration(url)
    duration = result.duration
    
    if (info.selectionText) {
      title = info.selectionText;
      text = tab.title.trim();
    }
    else {
      title = tab.title.trim();
    }
    
//    shareTargetURL = shareTargetURL 
//            + "?title=" + encodeURIComponent(title) + "&url=" + url + "&text=" + encodeURIComponent(text) + "&duration=" + duration
  }
  
  var width = 400;
  var height = 660;

  //return window.alert(shareTargetURL)
  
  window.open(buildTargetURL({
    url,
    title,
    text,
    duration
  })
        , "_blank"
        , "scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=" + width + ",height=" + height);
}

function buildTargetURL(options) {
  
  let shareTargetURL = "https://pulipulichen.github.io/PWA-Add-To-Read-Webpage-List/index.html"

  let params = []
  
  if (options.title && options.title !== '') {
    params.push('title=' + encodeURIComponent(options.title))
  }
  if (options.url && options.url !== '') {
    params.push('url=' + options.url)
  }
  if (options.text && options.text !== '') {
    params.push('text=' + encodeURIComponent(options.text))
  }
  if (options.duration && options.duration !== '' && options.duration !== '0' && options.duration !== 0) {
    params.push('duration=' + options.duration)
  }
  
  if (params.length > 0) {
    params = '?' + params.join('&')
  }
  else {
    params = ''
  }
 
  shareTargetURL = shareTargetURL + params
    
  return shareTargetURL
}

const ubList = [
  'yo' + 'ut' + 'ube',
  'www.yo' + 'ut' + 'ube.com',
  'm.yo' + 'ut' + 'ube.com',
  'yo' + 'utu.be'
]

async function getTitleAndDuration (url, currentURL) {

  
  try {
    let host = (new URL(url)).host
    // https://youtu.be/NJd3mojU6-w
    
    if (ubList.indexOf(host) > -1) {
      return {
        title: '',
        duration: ''
      }
    }
    
    //alert('pass?\n' + host + '\n' + url + '\n' + ubList.indexOf(host) + '\n' + ubList.join(','))
  } catch (e) {}
  
  let response
  try {
    response = await fetch(url)
    let responseText = await response.text()
    var parsedResponse = (new window.DOMParser()).parseFromString(responseText, "text/html")

    let title = parsedResponse.title
    let eleList = parsedResponse.getElementsByTagName("p")
    if (eleList.length === 0) {
      eleList = parsedResponse.getElementsByTagName("div")
    }
    if (eleList.length === 0) {
      eleList = parsedResponse.getElementsByTagName("body")
    }

    let duration = 0
    //window.alert(parsedResponse.body.innerText.length)
    for (let i = 0; i < eleList.length; i++) {
      duration = duration + eleList[i].innerText.replace('/ /g', '//').replace('/\n/g', '//').length
    }

    return {
      title,
      duration
    }
  }
  catch (e) {
    return await getTitleFromCurrentURL(currentURL, url)
  }
}

async function getTitleFromCurrentURL (url, targetURL) {
  let response = await fetch(url)
  let responseText = await response.text()
  var parsedResponse = (new window.DOMParser()).parseFromString(responseText, "text/html")

  let ele = parsedResponse.querySelector(`[href="${targetURL}"]`)
  if (!ele) {
    return {
      title: '',
      duration: ''
    }
  }
  let title = ''
  try {
    title = ele.innerText.trim()
  }
  catch (e) {}

  return {
    title,
    duration: ''
  }
}

function createMenus() {  
    var parent = chrome.contextMenus.create({  
        "title": "Add To Read",  
        "contexts": ['all'],      
        "onclick": genericOnClick  
    });
}  

createMenus();  
