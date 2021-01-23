const ApibaseURL = 'https://limitless-plateau-08631.herokuapp.com/';
// const ApibaseURL = 'http://localhost:5000/';
const staticBaseUrl = 'https://chatbot.tiiny.site/';
// const staticBaseUrl = ''
function addCSSLink(href){
    var head  = document.getElementsByTagName('head')[0];
    var link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = staticBaseUrl + href;
    link.media = 'all';
    head.appendChild(link);
}

addCSSLink('css/botui.min.css');
addCSSLink('css/botui-theme.css');
addCSSLink('css/index.css');

async function addJsFile( url, callback ) {
    var script = document.createElement( "script" )
    script.type = "text/javascript";
    if(script.readyState) {  // only required for IE <9
        script.onreadystatechange = async function() {
        if ( script.readyState === "loaded" || script.readyState === "complete" ) {
            script.onreadystatechange = null;
            await callback();
        }
        };
    } else {  //Others
        script.onload = async function() {
        await callback();
        };
    }

    script.src = staticBaseUrl + url;
    document.getElementsByTagName( "head" )[0].appendChild( script );
}



var configs;

async function getBotReply(chatSchemId){
    return new Promise(async (resolve , reject) => {

        const response = await fetch(ApibaseURL +'v1/chatSchema/get?chatSchemaId=' + chatSchemId);
        const botReplyJson = await response.json(); //extract JSON from the http response
        if(botReplyJson && botReplyJson.content){
            resolve({id : botReplyJson.id , content : botReplyJson.content , questions : botReplyJson.response ? botReplyJson.response : []})
        }
        reject(false)
    })
}

async function storeUserResponse (chatDetail) {
   
    fetch(ApibaseURL +'v1/chat/create', {
      method: "POST",
      body: JSON.stringify(chatDetail),

      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }, 
    }).then(res => {
      console.log("Request complete! response:", res);
    });
}

function uuidv4() {
    return 'xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 12 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(12);
    });
}

function getUserId(){
    if(localStorage.getItem('botUserId')){
        return localStorage.getItem('botUserId');
    } else {
        const userId = uuidv4();
        localStorage.setItem('botUserId' , userId)
        return userId;
    }
}

var botui;
async function chatInit(chatSchemId , configs = {} , isBotUILoaded){
    botui = isBotUILoaded ? botui : new BotUI(configs.containerId ? configs.containerId : 'my-botui');

    botui.message.bot({
        content: 0,
        loading: true,
        disabled : true,
        delay: 0,
    }).then(async (index) => {
        await getBotReply(chatSchemId).then((currentChat , err) => {
            botui.message.update(index, {
                content: '.',
                cssClass : 'hide'
            });
            addBotReply(currentChat , botui , function(){
                setTimeout(() => {
                    let documentObj = document.querySelectorAll('.botui-message')
                    if(documentObj && documentObj.length){
                        documentObj[documentObj.length - 1] && documentObj[documentObj.length - 1].scrollIntoView({behavior : "smooth" , block:"start"})
                    }
                    console.log(documentObj);
                        
                }, 100);
                addUserReply(currentChat , botui)
            });
        });
    })

}

function addUserReply(currentChat , botui){

    if(currentChat && currentChat.questions && Array.isArray(currentChat.questions)){

            currentChat.questions.forEach(async (element) => {
                if(element.type == 'input'){
                    for(const item in element.items) {
                        
                        await botui.action.text({
                            action: {
                              placeholder: element.items[item].placeHolder
                            }
                          }).then(async function (res) { // will be called when it is submitted.
                            const detailToStore = {
                                bot : currentChat.id,
                                response : {...res , ...{ field : element.items[item].field}},
                                user_id : getUserId()
                            }
                            await storeUserResponse(detailToStore);
                            element.items[item].id && chatInit(element.items[item].id , configs , true); 
                          })
                    }
                } else {
                    botui.action.button({
                        addMessage : true,
                        action: element.items,
                        delay: 150,            
                    }).then(async (res) =>{
                        chatInit(res.value , configs , true);
                        const detailToStore = {
                            bot : currentChat.id,
                            response : res,
                            user_id : getUserId()                 
                        }
                        await storeUserResponse(detailToStore);
                    })
                }
                
            })        
            
    }
}

function addBotReply(currentChat , botui , cb) {

    if(currentChat && currentChat.content){
        Array.isArray(currentChat.content) && currentChat.content.forEach((element , index) => {
            
            botui.message.bot({
                content: element.type == 'image'  ? '![product image]('+element.item+')' :  element.item,
                // type : element.type,
                delay: (index + 1) * 1,
            })
            
            currentChat.content.length == (index + 1) && cb();        
        });
    } else {
        cb()
    }
}



window.initChat = async (initialChatId , configs = {}) => {

    // var element = document.getElementById(configs.containerId ? configs.containerId : 'my-botui');
    
    // var devEl = document.createElement("div");
    // var node = document.createElement('span');
    // node.append(document.createTextNode("ChatBot"))
    // devEl.appendChild(node);
    
    // element && element.appendChild(devEl);
    
    await addJsFile('js/botui.min.js' ,async function() {
        await addJsFile('js/vue.min.js' , async function() {
            this.configs = configs;
            await chatInit(typeof initialChatId != 'undefined' ? initialChatId : 1 , configs);
                        
        })
    })
    
}



// window.closeChat = 
