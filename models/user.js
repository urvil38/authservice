'use strict';
const mongoose = require('mongoose');
const config = require('../config/config.json');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	'name' : String,
	'email' : {
	   type : String,
	   unique : true
	},
	'hashed_password' : String,
	'created_at' : String,
	'temp_password' : String,
	'temp_password_time' : String
});

mongoose.Promise = global.Promise;

var handle = setInterval(connection,3000) 

function connection() {
	mongoose.connect(`mongodb://${config.dbuser}:${config.dbpassword}@${config.db}`,(err) => {
	if(!err){
		console.log("Successfully got connection!!")
		clearImmediate(handle)
	}else{
		console.log("retring to connect database")
	}
});
}

module.exports = mongoose.model('user' , userSchema);
