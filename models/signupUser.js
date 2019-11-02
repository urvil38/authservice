'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const signupSchema = new Schema({
	'email' : {
	   type : String,
	   unique : true
	},
	'created_at' : String,
	'random_string' : String
});

module.exports = mongoose.model('signupUser',signupSchema);