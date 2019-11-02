'use strict';

const user = require('../models/user');
const bcrypt = require('bcryptjs');
const config = require('../config/config.json');
const randomstring = require('randomstring');
const nodemailer = require('nodemailer');
const signupUser = require('../models/signupUser.js')

const transporter = nodemailer.createTransport({
	service : 'gmail',
	auth : {
		user : `${config.email}`,
		pass : `${config.password}`
	}
});

module.exports.changePassword = (email , password , newPassword) =>
	new Promise((resolve,reject) => {
		user.find({email : email})
		.then(users => {
			let user = users[0];
			const hashed_password = user.hashed_password;

			if(bcrypt.compareSync(password , hashed_password)){
				const salt = bcrypt.genSaltSync(10);
				const hash = bcrypt.hashSync(newPassword,salt);

				user.hashed_password = hash;

				return user.save();
			}else{
				reject({status:401 , message : "Invalid old password!"});
			}
		})
		.then(user => resolve({status : 200 , message : 'Password changed successfully!'}))
		.catch(err => reject({status : 500 , message : 'Internal Server Error'}));
	});
	
module.exports.restPasswordInit = (email) =>
	new Promise((resolve,reject) => {
		const random = randomstring.generate(8);

		user.find({email : email})
		.then(users => {
			if(users.length === 0){
				reject({status : 404 , message : 'User not found!!'});
			}else{
				let user = users[0];

				const salt = bcrypt.genSaltSync(10);
				const hash = bcrypt.hashSync(random , salt);

				user.temp_password = hash;
				user.temp_password_time = new Date();

				return user.save();
			}
		})
		.then(user => {

			let mailOptions = {
				from :`"${config.name}" <${config.email}>`,
				to : email,
				subject : 'Reset password link',
				html : `Hello ${user.name},
 
                Your reset password token is <b>${random}</b>.
                The token is valid for only <b>2 minutes</b>.
 
                Thanks,
                ${config.name}`
			};

			return transporter.sendMail(mailOptions);
		})
		.then(info => {
			resolve({status : 200 , message : 'check mail for Instruction'});
		})
		.catch(err => {
			reject({status : 500 , message : 'Internal server error!'});
		});
	});
	
module.exports.restPasswordFinish = (email , token , password) =>
	new Promise((resolve,reject) => {
		user.find({email : email})
		.then(users => {
			let user = users[0];
			let diff = new Date() - new Date(user.temp_password_time);
			let seconds = Math.floor(diff/1000);

			if(seconds < 120){
				return user;
			}else{
				reject({status:401,message : 'times out!!'});
			}

		})
		.then(user => {
			if(bcrypt.compareSync(token , user.temp_password)){
				
				let salt = bcrypt.genSaltSync(10);
				let hash = bcrypt.hashSync(password , salt);
				user.hashed_password = hash;
				user.temp_password = undefined;
				user.temp_password_time = undefined;

				return user.save();
			}
		})
		.then(user => resolve({status : 200 , message : 'Password changed successfully!'}))
		.catch(err => reject({status : 500 , message : 'Internal server error!'}));
	});

module.exports.authenticateSignupInit = (email) =>
	new Promise((resolve,reject) => {

		user.find({email:email})
		.then(users => {
			if(users.length > 0){
				return reject({ status : 409 , message : 'User is already registered!'})
			}

			const random = randomstring.generate(5);
			const user = new signupUser({
				email : email,
				created_at : new Date(),
				random_string : random
			});

			user.save()
				.catch(err => {
					if (err.code == 11000) {
						removeUser(email)
						reject({ status: 409, message: 'email is already registered!' });
					} else {
						reject({ status: 500, message: 'Internal server error' });
					}
				});
			
			let mailOptions = {
				from :`"${config.name}" <${config.email}>`,
				to : email,
				subject : 'Authenticate Signup',
				html : `

				Your token is <b>${random}</b>.

				Thanks,
				${config.name}`
			};

			return transporter.sendMail(mailOptions)
		}).then(info => {
			resolve({status:200,message:'check your email'})
		}).catch(err => {
			reject({status:200 , message : 'check your email'})
		})
	});

	module.exports.authenticateSignupFinish = (email,userRandom) => 
		new Promise((resolve,reject) => {
			signupUser.find({email:email})
			.then(users => {
				if (users.length == 0) {
					reject({ status: 404, message: 'User Not Found !' });
				} else {
					return users[0];
				}
			}).then(user => {
				const random = user.random_string;
				removeUser(user.email)
				if(random !== userRandom) {
					reject({ status: 401, message: 'Invalid Random string !' });
				}else{
					resolve({ status: 200,message: 'ok'});
				}
			})
	});

function removeUser(email) {
	signupUser.deleteOne({email:email},(err) => {
		if(err) {
			console.log("Unable to remove user")
		}
	});
}