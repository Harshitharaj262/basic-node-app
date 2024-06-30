const { check, validationResult } = require("express-validator");
const Post = require('../models/post')
const fs = require('fs')
const path = require('path')
const User = require('../models/user')

exports.getFeeds = (req,res, next)=>{
    try {
        const currentPage = req.query.page || 1
        const perPage = 2
        let totalItems
        Post.find().countDocuments()
        .then(count=>{
            totalItems=count
            return Post.find().skip((currentPage-1)*perPage)
            .limit(perPage)
        }).then(posts=>{
            res.status(200).json(
                {message:'Fetched post successfully',
                posts:posts,
                totalItems: totalItems
                })
        }).catch(err=>{
            if(!err.statusCode){
                err.statusCode = 500
            }
            
            next(err)
        })
       
    } catch (error) {
        if(!error.statusCode){
            error.statusCode = 500
        }
        
        next(error)
    }
}

exports.postFeeds = (req, res, next)=>{
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const error = new Error('Validation failed, entered data is incorrect')
            error.statusCode = 422
            throw error
        }
        if(!req.file){
            const error = new Error('No image provided')
            error.statusCode = 422
            throw error
        }
        const imageUrl = req.file.path
        const title = req.body.title
        const content = req.body.content
        let creator

        const post = new Post({
            title: title,
            content: content,
            imageUrl: imageUrl,
            creator:req.userId

        })
        post
        .save()
        .then(result=>{
            return User.findById(req.userId)})
        .then(user=>{            
            console.log(user);
            creator=user
            user.posts.push(post)
            return user.save()
        }).then(result =>{
            res.status(201).json({
                message: 'feed created successfully',
                post:post,
                creator:{_id:creator._id, name:creator.name}
        }) 
        }).catch(err=>{
            if(!err.statusCode){
                err.statusCode = 500
            }
            
            next(err)
        })
    } catch (error) {
        if(!error.statusCode){
            error.statusCode = 500
        }
        
        next(error)
    }
}

exports.getFeed = (req, res, next) => {
    const postId = req.params.postId
    Post.findById(postId)
    .then(post=>{
        if(!post){
            const error = new Error('Could not find post')
            error.statusCode=404
            throw error
        }
        res.status(200).json({
            message:"Post fetched", post:post
        })

    }).catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500
        }
        
        next(err)

    })
}

exports.putFeed = (req, res, next) => {
    const postId = req.params.postId
    console.log((postId));
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect')
        error.statusCode = 422
        throw error
    }
    const title = req.body.title
    const content = req.body.content
    let imageUrl = req.body.image
    if(req.file){
        imageUrl = req.file.path
    }
    if(!imageUrl){
        const error = new Error('no file picked.')
        error.statusCode = 422
        throw error
    }
    Post.findById(postId).then(post=>{
        console.log(post.title);
        if(!post){
            const error = new Error('Could not find post')
            error.statusCode=404
            throw error
        }
        if(post.creator.toString() !== req.userId){
            const error = new Error('Not Authorized')
            error.statusCode=403
            throw error
        }
        if(imageUrl !== post.imageUrl){
            clearImage(post.imageUrl)
        }
        post.title = title
        post.imageUrl = imageUrl
        post.content = content
        return post.save()

    }).then(result=>{
        res.status(200).json({message:'Post Updated',post:result})
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500
        }
        
        next(err)
    })
}

exports.deleteFeed = (req, res, next) =>{
    const postId = req.params.postId
    Post.findById(postId)
    .then(post =>{
        if(!post){
            const error = new Error('Could not find post')
            error.statusCode = 404
            throw error
        }
        if(post.creator.toString() !== req.userId){
            const error = new Error('Not Authorized')
            error.statusCode=403
            throw error
        }
        clearImage(post.imageUrl)
        return Post.findByIdAndDelete(postId)
    }).then(result=>{
       return User.findById(req.userId)
    }).then(user=>{
        user.posts.pull(postId)
        return user.save()
    }).then(result=>{
        console.log(result);
        res.status(200).json({message: 'Deleted Post'})
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500
        }
        
        next(err)
    })
}

const clearImage = (filepath)=>{
 filepath = path.join(__dirname,'..',filepath)
 fs.unlink(filepath, err=> console.log(err))
}