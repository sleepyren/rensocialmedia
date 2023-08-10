import mongoose, { Schema } from "mongoose";

// AS PER FINAL PROJECT DEPLOYMENT INFO
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/rbh303';
}
//END OF FDI

const userAttributesSchema = new Schema({
    biography: {type: String},
    ppicture: {type: String},
    DOB:       {type: Date},
    nickname : {type: String},
    _id : false
});

export const deetsetter = (obj) =>
{
    return {
    biography: obj.biography,
    ppicture: obj.ppicture,
    DOB:       obj.DOB,
    nickname : obj.nickname
    };
}
/*
let isURL = (input) =>{
    let url;
    try {
        url = new URL(input);
    }   catch(e)
    {

    }
}
*/

let userSchema = new Schema({
    username: { type: String, default: 'user' },
    //attributes: { type: String},
    password: {type: String, unique: true, required: true},
    email: {type: String},
    details: {type: Object, default: {}}});
    
let messageSchema = new Schema({
    username : String,
    message: String,
    time: String
})


let User = mongoose.model('User', userSchema);
let Messages = mongoose.model('Messages', messageSchema);

//finalp is the process running that contains the Message and User
//dbs 
mongoose.connect('mongodb://localhost/finalp');
//mongoose.connect('mongodb://127.0.0.1/finalp');