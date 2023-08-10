/*
NOTE: this is a modified version of the auth.mjs file from 
Homework 05 of AIT
*/

import bcrypt from 'bcryptjs';
import hash from 'bcryptjs';
import mongoose from 'mongoose';
import './db.mjs';

const User = mongoose.model('User');
//let a = await User.find();
//a.forEach((ele)=> console.log(ele));
//User.find({ username:'sleepyren' }).remove().exec();
const startAuthenticatedSession = (req, user, cb) => {
    // TODO: implement startAuthenticatedSession
    req.session.regenerate((err)=>
    {
      if (!err)
      {
        req.session.user = user;
      }
  
      cb(err);
    })
  };

  /*
  const startAuthenticatedSession = (req, user, cb) => {
      // TODO: implement startAuthenticatedSession
      console.log("printing user here \n ", user);
      req.session.regenerate((err)=>
      {
          if (!err)
          {
              req.session.user = user;
              console.log("req sesh here", req.session.user);
            }
            else{
                
                cb(err);
            }
        })
    };
    */
    
const endAuthenticatedSession = (req, cb) => {
  // TODO: implement endAuthenticatedSession
  req.session.destroy((err) => { cb(err); });
};


// helper function for register from edstem
function hashPassword(password, cb) {
  bcrypt.genSalt(function(err, salt) {
    if (!err) {  
      // create hash with salt
      bcrypt.hash(password, salt, function(err, hash) {
        if (!err) {  
          cb(err, hash);
        } else {
          // hash error 
          cb(err);
        }
      });
    } else {
      // gen salt error 
      cb(err);
    }
  });
}


const register = (username, email, password, errorCallback, successCallback) => 
{
  // NOTE: does not look for duplicate emails, tho
  
  if (username.length >= 8 && password.length >= 8) {
    User.find({username: username}, (err, users, count) => {

      if (!err && count === undefined && users.length === 0)
      {
        hashPassword(password, (err, hash) => {
          if(!err) {
            // TODO: create and save a user
            // call errorCallback or successCallback as necessary
            // make sure the error message match!
            const user = new User(
              {username: username,
              password: hash, 
              email: email});
            user.save((err, newuser) =>
            {
              if (err)
              {
                console.log(err); 
                errorCallback({message : "DOCUMENT SAVE ERROR"});
              }
              else
                {
                  console.log("New user Here: \n", newuser);
                successCallback(newuser);
                }
            });
          } else 
          {
            errorCallback({message: 'HASH ERROR ' + err});
          }
        });
      }
       else {
        console.log("Username exists");
        errorCallback({message: 'USERNAME ALREADY EXISTS'});
      }
    });
  } else {
    errorCallback({message: 'USERNAME PASSWORD TOO SHORT'});
  }
}

const login = (username, password, errorCallback, successCallback) => {
  // TODO: implement login // with help from 
  User.findOne({username: username}, (err, user) => {
    if (!err && user)
    {
      bcrypt.compare(password, user.password,(err,result) =>
      {
        if (result)
        {successCallback(user);}
        else
        {errorCallback({message : "PASSWORDS DO NOT MATCH"} );}});
    }
    else
    {
      errorCallback({message : "USER NOT FOUND"});
    }
  }
  )

};

const addDetails = async (username, deetsobj) =>
{
  let updateUser = await User.findOneAndUpdate({username: username}, deetsobj, {upsert: true, new: true});
  return updateUser;
    /*
    let result = User.findOne({username: username},(err, user)=>{
        if (err)
        { console.log(err);}
        
        user.details = deetsobj
        console.log("user here\n", user.details);
        
    });
    */
   //referencing https://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
   /*
   User.findOneAndUpdate({username: username}, deetsobj, {upsert: true, new: true}, (err, user) =>{

       if (err)  console.log({error: err});
       console.log("updated!",user);
       return user;
    }

   );*/

}

const authRequired = authRequiredPaths => {
  return (req, res, next) => {
    if(authRequiredPaths.includes(req.path)) {
      if(!req.session.user) {
        res.redirect('/login'); 
      } else {
        next(); 
      }
    } else {
      next(); 
    }
  };
};

export {
  User,
  startAuthenticatedSession,
  endAuthenticatedSession,
  register,
  login,
  authRequired,
  addDetails
};
