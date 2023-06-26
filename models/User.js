const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please provide name'],
		minlength: 3,
		maxlength: 50,
	},
	email: {
		type: String,
		required: [true, 'Please provide email'],
		match: [
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			'Please provide email',
		],
		unique: true,
	},
	password: {
		type: String,
		required: [true, 'Please provide password'],
		minlength: 3,
	},
});

//hashing password middleware before mongoose save the user document in mongodb
userSchema.pre('save', async function () {
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

//instance method for creating token for authentication
userSchema.methods.createJWT = function () {
	return jwt.sign({ userId: this._id, name: this.name }, 'jwtSecret', {
		expiresIn: '30d',
	});
};

//instance method for compare user password
userSchema.methods.comparePassword = async function (loginPassword) {
	const isMatch = await bcrypt.compare(loginPassword, this.password);
	return isMatch;
};
module.exports = mongoose.model('user', userSchema);
