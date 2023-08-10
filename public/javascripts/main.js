//var socket = io();

//var socket = io.connect('http://100.33.93.216:3000',{reconnection: true});
var socket = io.connect(null,{reconnection: true});
const sm = document.createElement("div");
sm.classList.add("send_message");
const form = document.createElement("form");
form.innerHTML = '<br> Type a message here! <br>';
form.method = 'post';
//form.action = '/'
const textbox = document.createElement('input');
textbox.type = 'text';
textbox.name = 'message';
textbox.classList.add("textbox");
var submit = document.createElement('input');
submit.type = 'submit';
submit.value = 'send it!';

//MESSAGE IMAGE ADDITION
const image_upload_label = document.createElement("LABEL");
image_upload_label.setAttribute("for", "image");
const image_select = document.createElement("input");
image_select.setAttribute("type","file");
image_select.setAttribute("accept","image/*");
image_upload_label.appendChild(image_select);

submit.onclick = (arg)=>{
    arg.preventDefault();
    
    const messageObject = {username : String,
        message : textbox.value};
        let time = new Date();
        //time = time.toDateString();
        time = time.toLocaleString('en-US', {
            timeZone: 'America/New_York',
          });

        messageObject.time = time;
        const x = document.getElementById("user_bar");
        const tC = x.textContent;
        //console.log("Text Content", tC);
        //console.log("message Object",messageObject);
        
        let username = tC;
        username = username.replaceAll("\t","");
        username = username.replaceAll("\n","");
        username = username.replaceAll(" ","");
        //console.log("USERNAME HERE ->>>", username);
        //username = username.toString();
        //console.log("toStringged it ", username);
        
        
        
        //console.log("splitted", username);
         messageObject.username = username;

    socket.emit('send_message',messageObject);

//addEventListener('click', (arg) =>{
   //console.log("ARG", arg);
    //arg.preventDefault();
}

form.appendChild(textbox);
form.appendChild(image_select);
form.appendChild(submit);
sm.appendChild(form);

document.body.appendChild(sm);

//= "User : " + messageObj.username + "<br>" 
const messageDiv = (messageObj) => {
    let OUTERdiv = document.createElement("div");
    let img = document.createElement("img");
    img.src = messageObj.img;
    const a = document.createElement("a");
    a.href = "/user/" + messageObj.username;
    OUTERdiv.classList.add("message");
    console.log(messageObj);
   let div = document.createElement("div");
    //div.classList.add("message");
    let u = document.createElement("STRONG");
    //u.innerHTML = "User : " + messageObj.username;
    u.innerHTML = messageObj.username;
    u.classList.add("message_username");
    let message = "<br>" + messageObj.message;
    let timeFooter = document.createElement("footer");
    timeFooter.classList.add("message_time_footer");
    timeFooter.innerHTML =  "<br>" + messageObj.time;
    div.innerHTML = message;

    u.appendChild(img);
    a.appendChild(u);
    //OUTERdiv.appendChild(u);
    OUTERdiv.appendChild(a);
    OUTERdiv.appendChild(div);
    OUTERdiv.appendChild(timeFooter);

    return OUTERdiv;
}

//with help from https://stackoverflow.com/questions/33481056/socket-io-cant-emit-custom-event-from-client
socket.on('connect', function () {
    //socket.setEncoding('utf8');
    console.log("CONNECTED");

        //socket.emit('update_users',document.body.user.username);
        //console.log('Client connected',document.body.user.username);
    socket.on('message_list', (data) =>{
        const mL = document.getElementById("messageList");
        console.log("CHILD ELEMENT COUNT ", mL.childElementCount, "data.length",data.length);
        if (mL.childElementCount < data.length)
        {
            while (mL.firstChild)
            {
                mL.removeChild(mL.firstChild);
            }
        //mL.classList.add("message");
        //This is appending the messages in reverse order 
        //so that the newer messages show sooner
        for (const element of data.slice().reverse())
        {
            console.log("element", element);
            
                mL.appendChild(messageDiv(element));
        }
        //document.body.appendChild(mL);
        }
    })
        
    
});
//console.log(socket);