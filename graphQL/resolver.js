const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const User = require ('../models/user');
const Post = require('../models/post');

module.exports = {
    createUser: async function ({ userInput }, req) {
        const errors = [];

        if(!validator.isEmail(userInput.email))
            errors.push({message: 'invalid email'});

        if(validator.isEmpty(userInput.password) || 
           !validator.isLength(userInput.password, {min: 5}))
           errors.push({message: 'invalid password'});

        if (errors.length > 0) {
            const error = new Error('enter valid input');
            error.data = errors;
            error.code = 422;
            throw error;
        }
        const existingUser = await User.findOne({ email: userInput.email});
        if (existingUser) {
            const error = new Error ('User already exists');
            throw error;
        }
        const hashpwd = await bcrypt.hash(userInput.password, 12);
        const user = new User({
            email: userInput.email,
            name: userInput.name,
            password: hashpwd
        });
    const createdUser = await user.save();
    return {...createdUser._doc, _id: createdUser._id.toString()};
    },
    login: async function ({email, password}) {
        const user = await User.findOne({email: email});
        if(!user){
            const error = new Error('user does not exists!');
            error.code = 401;
            throw error;
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            const error = new Error('eneter correct password');
            error.code = 401;
            throw error;
        }      
        const token = jwt.sign(
            {
                userId: user._id,
                email:user.email
            },
            'somesupersecreate',
            {expiresIn: '1h'}
        );
        return {token: token, userId: user._id.toString()};
    },
    createPost: async function({ postInput }, req) {
        console.log('createPost');
        if(!req.isAuth) {
            const error = new Error('not Authenticated!');
            error.code = 401;
            throw error;
        }
        const errors = [];

        if(validator.isEmpty(postInput.title) || 
        !validator.isLength(postInput.title,{min: 5}))
            errors.push({message: 'invalid title'});

        if(validator.isEmpty(userInput.content))
           errors.push({message: 'enter content'});

        if (errors.length > 0) {
            const error = new Error('enter valid input');
            error.data = errors;
            error.code = 422;
            throw error;
        }
        const user = await User.findById(req.userId);
        if(!user) {
            const error = new Error('invalid user');
            //error.data = errors;
            error.code = 401;
            throw error; 
        } 
        const post = new Post({
            title: postInput.title,
            content: postInput.content,
            imageUrl: postInput.imageUrl,
            creator: user
        });
        const createdPost = await post.save();
        user.posts.push(createdPost);
        await user.save();
        return {...createdPost._doc, 
                    _id: createdPost._id.toString(),
                    createdAt: createdPost.createdAt.toISOString(),
                    updatedAt: createdPost.updatedAt.toISOString()
                };
    }
};