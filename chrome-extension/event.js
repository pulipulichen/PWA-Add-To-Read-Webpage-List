/* global chrome */

function genericOnClick(info, tab) {  
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
 
  var url, title, text = '';
  
  url = info.pageUrl;
  if (info.selectionText) {
    title = info.selectionText;
    text = tab.title.trim();
  }
  else {
    title = tab.title.trim();
  }
  var width = 400;
  var height = 510;
      
  var shareTargetURL = "https://pulipulichen.github.io/PWA-Add-To-Read-Webpage-List/index.html" + "?title=" + title + "&url=" + url + "&text=" + text

  window.open(shareTargetURL
        , "_blank"
        , "scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=" + width + ",height=" + height);
}  

function createMenus() {  
    var parent = chrome.contextMenus.create({  
        "title": "Add To Read",  
        "contexts": ['all'],      
        "onclick": genericOnClick  
    });
}  

createMenus();  
