'use strict';

const jwt = require('jsonwebtoken');

const login = require('./functions/login');
const password = require('./functions/password');
const profile = require('./functions/profile');
const register = require('./functions/register');
const config = require('./config/config.json');

//RESTful routes using express router object
module.exports = (router) => {

	//handle login
	router.post('/login', (req, res) => {
		const password = req.body.password;
		const email = req.body.email;

		login.loginUser(email, password)
			.then(result => {
				const token = jwt.sign(result, config.secret, { expiresIn: 144000 });
				res.status(result.status).json({ message: result.status, token: token });
			})
			.catch(err => {
				res.status(err.status).json({ message: err.message })
			});
	});

	//handle register new user to database
	router.post('/user', (req, res) => {
		const name = req.body.name;
		const userPassword = req.body.password;
		const email = req.body.email;
		const random_string = req.body.random_string;
		
			if (!random_string || !random_string.trim()) {
				password.authenticateSignupInit(email)
					.then(result => {
						res.status(result.status).json({ message: result.message });
					})
					.catch(err => {res.status(err.status).json({ message: err.message })});
			}else{
				password.authenticateSignupFinish(email,random_string)
				.then(result => {
					register.registerUser(name, email, userPassword)
						.then(result => {
							res.setHeader('Location', '/user/' + email);
							res.status(result.status).json({ message: result.message });
						})
						.catch(err => res.status(err.status).json({ message: err.message }));
				})
				.catch(err => res.status(err.status).json({ message: err.message }));
		}
	})

	//handle getting user profile
	router.get('/user/:id', (req, res) => {
		if (checkToken(req)) {
			profile.getProfile(req.params.id)
				.then(result => res.json(result))
				.catch(err => res.status(err.status).json({ message: err.message }));
		} else {
			res.status(401).json({ message: 'Unauthorized Access' })
		}
	});

	router.put('/user/:id/password', (req, res) => {
		if (checkToken(req)) {
			const oldPassword = req.body.password;
			const newPassword = req.body.newPassword;

			if (!oldPassword || !newPassword || !oldPassword.trim() || !newPassword.trim()) {
				res.status(400).json({ message: 'Invalid Request !' });
			} else {
				password.changePassword(req.params.id, oldPassword, newPassword)
					.then(result => res.status(result.status).json({ message: result.message }))
					.catch(err => res.status(err.status).json({ message: err.message }));
			}
		} else {
			res.status(401).json({ message: 'Unauthorized Access' });
		}
	});

	router.post('/user/:id/password', (req, res) => {

		const email = req.params.id;
		const token = req.body.token;
		const newPassword = req.body.password;

		if (!token || !newPassword || !token.trim() || !newPassword.trim()) {
			password.restPasswordInit(email)
				.then(result => {
					res.status(result.status).json({ message: result.message })
				})
				.catch(err => res.status(err.status).json({ message: err.message }));
		} else {
			password.restPasswordFinish(email, token, newPassword)
				.then(result => {
					res.status(result.status).json({ message: result.message })
				})
				.catch(err => res.status(err.status).json({ message: err.message }));
		}

	});

	router.post('/user/:id/authenticate', (req, res) => {
		if (checkToken(req)) {
			return res.sendStatus(200)
		}
		return res.status(401).json({ message: "Unauthorized Access" })
	})

	function checkToken(req) {
		const token = req.headers['x-access-token'];
		if (token) {
			try {
				var decoded = jwt.verify(token, config.secret);
				return decoded.message === req.params.id;
			} catch (err) {
				return false;
			}
		} else {
			return false;
		}
	}
}