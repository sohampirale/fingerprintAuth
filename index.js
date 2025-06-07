const express = require("express");
const mongoose = require("mongoose")
const cors=require("cors")
const app=express();
const crypto =  require("crypto")
const {
  generateAuthenticationOptions
} = require('@simplewebauthn/server');

const {User}= require("./models/user.models")

async function connectDb(){
  await mongoose.connect("mongodb+srv://sohampirale20504:NevilleMongoDB@demo.3du8dza.mongodb.net/fingerAuthApp")
  console.log('Connected to database successfully');
}

connectDb();
app.use(cors());

app.use(express.json());

app.post("/api/storeFingerprint",async(req,res)=>{
  console.log('inside /api/storeFingerprint');

  const {username,credential}=req.body;
  // console.log("credential = "+JSON.stringify(req.body.credential));
  const user=await User.findOne({
    username
  })
  if(user){
    return res.status(404).json("User with username "+username+' already exists in the DB')
  }
  const newUser =await User.create({
    username: username,
    credentialId: credential.id,
    rawId: credential.rawId,
    attestationObject: credential.response.attestationObject,
    authenticatorData: credential.response.authenticatorData,
    clientDataJSON: credential.response.clientDataJSON,
    publicKey: credential.response.publicKey
  });
  
  res.status(200).json({
    msg:"FIngerprint stored successfully"
  })
})


app.post("/api/giveChallenge",async(req,res)=>{
  console.log('inside /api/giveChallenge');
  console.log('body = '+JSON.stringify(req.body));

  const {username}=req.body
  
  const user=await User.findOne({
    username:username
  })
  if(!user){
    return res.status(404).json({
      msg:"User not found"
    })
  }

  const challenge = crypto.randomBytes(32).toString('base64url');

  user.currentChallenge = JSON.stringify(challenge);
  console.log('currentChallenger added to db');
  
  await user.save();
   
  res.status(200).json({
    challenge,
    userVerification: 'preferred',
  });
})

app.post("/api/verifyFingerprint",async(req,res)=>{
    console.log('inside /api/verifyFingerprint');
    const {username,assertion,challenge} = req.body

    const user=await User.findOne({
      username
    })

    if(!user){
      return res.status(404).json({
        msg:"User does not exists"
      })
    }
    console.log('challenge = '+JSON.stringify(challenge));
    
    if(user.currentChallenge!=JSON.stringify(challenge)){
      console.log('user.currentChallenge = '+user.currentChallenge);
      console.log('challenge = '+JSON.stringify(challenge));
      
      return res.status(404).json({
        msg:"Invalid challenge"
      })
    } else if(user.credentialId!=assertion.id){
      return res.status(404).json({
        msg:"Credential Id does not match"
      })
    } 
    res.status(200).json({
      msg:"Login successfull"
    })

})

app.listen(3000,()=>{
  console.log("Server listenign on port 3000");
})