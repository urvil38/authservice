'use strict';
const user = require('../models/user.js');

module.exports.getProfile = (email) => 

	new Promise((resolve,reject) => {
		user.find({email : email} , {name : 1 ,email :1 , created_at : 1,_id : 1})
		.then(users => resolve(users[0]))
		.catch((err) => reject({status : 500 ,message : 'Internel server error'}))
})