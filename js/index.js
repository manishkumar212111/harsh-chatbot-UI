
const baseURL = 'https://limitless-plateau-08631.herokuapp.com/';
// const baseURL = 'http://localhost:5000/';



async function getBotReply(chatSchemId){
    return new Promise(async (resolve , reject) => {

        const response = await fetch(baseURL +'v1/chatSchema/get?chatSchemaId=' + chatSchemId);
        const botReplyJson = await response.json(); //extract JSON from the http response
        console.log(botReplyJson);
        if(botReplyJson && botReplyJson.content){
            resolve({id : botReplyJson.id , content : botReplyJson.content , options : botReplyJson.response ? botReplyJson.response : {}})
        }
        reject(false)
    })

    // do something with myJson
}

async function storeUserResponse (chatDetail) {
   
    fetch(baseURL +'v1/chat/create', {
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

var botui = new BotUI('my-botui-app');

async function chatInit(chatSchemId){

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
                addOptions(currentChat , botui)
            });
        });
    })

}

function addOptions(currentChat , botui){
    console.log(currentChat)
    console.log(Array.isArray(currentChat.options.items))
    if(currentChat && currentChat.options){
        if(Array.isArray(currentChat.options.items)){
            botui.action.button({
                addMessage : true,
                action: currentChat.options.items,
                delay: 150,            
            }).then(async (res) =>{
                chatInit(res.value);
                const detailToStore = {
                    bot : currentChat.id,
                    response : res,
                    user_id : getUserId()                 
                }
                await storeUserResponse(detailToStore);
            })
        } 
    }
}

function addBotReply(currentChat , botui , cb) {

    let contentCompleteFlag = 0;
    if(currentChat && currentChat.content){
        Array.isArray(currentChat.content) && currentChat.content.forEach((element , index) => {
            botui.message.bot({
                content: element.item,
                type : element.type,
                delay: (index + 1) * 1,
            })
            currentChat.content.length == (index + 1) && cb();        
        });
    } else {
        cb()
    }
}


chatInit(1);
// // Start Bot
// // First Messages
// botui.message.bot({
//     content: 'Hi there! 👋',
//     loading: true,
//     delay: 3000,
// }).then(function () {
//     return botui.message.bot({
//         loading: true,
//         delay: 1500,
//         content: "I'm Tobi, a web developer from germany.",
//     });
// }).then(function () {
//     return botui.message.bot({
//         loading: true,
//         delay: 1500,
//         content: "So i wanted to share this cool jQuery plugin with you.",
//     });
// }).then(function () {
//     return botui.message.bot({
//         loading: true,
//         delay: 1500,
//         content: "[BotUI](http://docs.botui.org/)",
//     });
// }).then(function () {
//     return botui.message.bot({
//         loading: true,
//         delay: 1500,
//         content: "Pretty cool plugin or?",
//     });
// }).then(function () {
//   return botui.action.button({
//         delay: 1500,
//         loading: true,
//         addMessage: true,
//         action: [{
//             text: 'Yes!',
//             value: 'yes'
//         }, {
//             text: 'No.',
//             value: 'no'
//         }]
//     })
// }).then(function (res) {
//   if (res.value == 'yes') {
//      return botui.message.bot({
//                 loading: true,
//                 delay: 1500,
//                 content: "I quite agree!",
//             });
//   } else {
//     return botui.message.bot({
//                 loading: true,
//                 delay: 1500,
//                 content: "Okay, I'm sorry ...",
//             });
//   }
// }).then(function () {
//   return botui.message.bot({
//                 loading: true,
//                 delay: 1500,
//                 content: "Bye, I need to go know.",
//             });
// })

