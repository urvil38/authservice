'use strict';

const user = require('../models/user.js');
const bcrypt = require('bcryptjs');

module.exports.registerUser = (name, email, password) =>
	new Promise((resolve, reject) => {

		const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(password, salt);

		const newUser = new user({
			name: name,
			email: email,
			hashed_password: hash,
			created_at: new Date()
		});

		newUser.save()

			.then(() => resolve({ status: 201, message: 'User registered successfully..!' }))

			.catch(err => {
				if (err.code == 11000) {
					reject({ status: 409, message: 'User is already registered!' });
				} else {
					reject({ status: 500, message: 'Internal server error' });
				}
			});
	});
