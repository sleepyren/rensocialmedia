import express from 'express';
import session from 'express-session';
import path from 'path';
import * as auth from './auth.mjs';
import { fileURLToPath } from 'url';
import hbs from 'hbs';
import url from 'url';
import {deetsetter} from './db.mjs'
import './db.mjs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose, { Schema } from "mongoose";
import multer from 'multer';

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
})
var upload = multer({ storage: storage });



// monkey image https://images.newscientist.com/wp-content/uploads/2022/04/06095721/SEI_97255809.jpg?crop=4:3,smart&width=1200&height=900&upscale=true


const Messages = mongoose.model('Messages');

//await Messages.deleteMany();
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

var app = express();
var server = createServer(app);
var io = new Server(server);
//io.connect('http://127.0.0.1:3000')
hbs.registerPartials(path.join(__dirname, '/views'));
app.set('view engine', 'hbs');
//app.set('views', __dirname + '/views/');

//console.log(path.join(__dirname, '/views'));

//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

app.use(session({
  secret: 'monkey face',
  resave: false,
  saveUninitialized: true,
}));


const loginMessages = {"PASSWORDS DO NOT MATCH": 'Incorrect password', "USER NOT FOUND": 'User doesn\'t exist'};
const registrationMessages = {"USERNAME ALREADY EXISTS": "Username already exists", "USERNAME PASSWORD TOO SHORT": "Username or password is too short"};

//app.use(auth.authRequired(['/self']));

app.use(auth.authRequired(['/']));

// make {{user}} variable available 

// logging
app.use((req, res, next) => {
  console.log(req.method, req.path, req.body);
  next();
});


app.use(express.json());

app.use((req, res, next) => {
  if (Object.hasOwn(req,'session'))
  {
    if (Object.hasOwn(req.session,'user'))
    { //console.log("res.locals",res.locals);
      res.locals.user = req.session.user;}}
  next();
});


app.get('/register', (req, res) => {
  //console.log(res);
  
  res.render('partials/register');
});

  app.get('/', (req, res) => {

    res.render('partials/layout',{user: req.session.user});
  });

/*
{message: String, time: Date.now(), username: String};
*/
  
  app.post('/register', (req, res) => {
    // setup callbacks for register success and error
    function success(newUser) {
      auth.startAuthenticatedSession(req, newUser, async (err) => {
          if (!err) {
              ulist = await auth.User.find();
              res.redirect('/');
          } else {
              res.render('partials/error', {message: 'err authing???'}); 
          }
      });
    }
    
    function error(err) {
      res.render('partials/register', {message: registrationMessages[err.message] ?? 'Registration error'}); 
    }
  
    // attempt to register new user
    auth.register(req.body.username, req.body.email, req.body.password, error, success);
  });
  
  

  app.get('/login', (req, res) => {
    res.render('partials/login');
});

  
  app.post('/login', (req, res) => {
    // setup callbacks for login success and error
    function success(user) {
      auth.startAuthenticatedSession(req, user, (err) => {
        if(!err) {
          res.redirect('/');
        } else {
          res.render('partials/error', {message: 'error starting auth sess: ' + err}); 
        }
      }); 
    }
  
    function error(err) {
      res.render('partials/error', {message: loginMessages[err.message] || 'Login unsuccessful'}); 
    }
  
    // attempt to login
    auth.login(req.body.username, req.body.password, error, success);
  });

  app.get('/change_self', (req, res) => {
    res.render('partials/change_self',{user: req.session.user});
});

app.post('/change_self', (req, res) => {

  //let extras = deetsetter(req.body);
  console.log("req.body", req.body);
  let thedeets = {details: req.body};
  let u = req.session.user;
  u.details = thedeets;

  req.session.regenerate( async (err)=>
  {
    if (!err)
    {
      req.session.user =  await auth.addDetails(u.username, thedeets);
      


        res.redirect('/');
    }
    else
    {console.log("sesh regen failure",err);}
  });

});

app.get('/self', (req, res) => {
  res.render('partials/self',{user: req.session.user});
});

// USER LINK BLOCK
let ulist = await auth.User.find();
for (const ele of ulist)
{
  app.get('/user/' + ele.username,(req,res)=>{
  res.render('partials/self',{user: ele});
})
}




// referencing https://stackoverflow.com/questions/44776387/how-to-emit-a-socket-io-response-within-post-request-in-nodejs

/*
app.post('/', function(req, res) {
  //this is coming from an external resource
  req.body.username = res.locals.user.username;
  const t = new Date();
  req.body.time = t;
  io.sockets.emit('send_message', ()=>{console.log(req.body,"also print this");});
})
*/

 var laccord = [];
 var socket_username = new Map();
 
 
 const h = server.listen(process.env.PORT|| 3000,()=>{
   console.log('Example app listening on port 3000!');
   console.log(h.address());
   io.sockets.on('connection', async function (socket) {
     // socket.emit('news', { hello: 'world' });
     // socket.on('my other event', function (data) {
       
       
       socket.on('update_users', function(data){
         socket_username.set(socket.id,data);
        })
        
        
        
        let allMessages =  await Messages.find();
        allMessages = await setMessageProfilePic(allMessages);
        //console.log("ALL MESSAGES ", allMessages);
      socket.emit('message_list', allMessages);

       socket.on('send_message', function (data) {
     //console.log(laccord.toString());
      let m = new Messages(data);   
     m.save((err, newmessage) => {

          if (err)
          {console.log(err);}
          else
          {
            console.log("Success", newmessage)
          }
        })
        //console.log('laccord',data);
      });

      

});});
//io.listen(server);

var setMessageProfilePic = async function(arr)
{
  let nA = [];
for (let element of arr)
{
  let profpic;
  let username = element.username;
  //console.log(element);
  const userObj = await auth.User.findOne({username: username});
  //console.log("USER OBJECT HERE",userObj);
  const picLink = userObj.details.ppicture;
  const messageWithPic = element.toObject();
  messageWithPic.img = picLink;
  nA.push(messageWithPic);

}
return nA;
}
