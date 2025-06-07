const mongoose = require("mongoose")
const Schema= mongoose.Schema;

const userSchema=new Schema({
    username: { type: String, required: true },  // The username (or user ID)
    credentialId: { type: String, required: true }, // The credentialId (unique)
    rawId: { type: String, required: true }, // The rawId (optional, for advanced use)
    attestationObject: { type: String, required: true }, // Attestation object
    authenticatorData: { type: String, required: true }, // Authenticator data
    clientDataJSON: { type: String, required: true }, // Client data JSON
    publicKey: { type: String }, // Public key (optional)
    currentChallenge:{type:String,default:"no_challenege_assigned"}
})

const User = mongoose.model("User",userSchema);

module.exports = {User}