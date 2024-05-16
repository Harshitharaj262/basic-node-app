const mongoDb = require('mongodb')
const getDd = require('../utils/db').getDB

class Product{

  constructor(title ,price, description,imageUrl,id, userId){
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new mongoDb.ObjectId(id): null
    this.userId = userId
  }
  save(){
    const db = getDd()
    let dbOp
    if(this._id){
      // update product
      dbOp = db.collection('products').updateOne({_id: this._id}, {$set: {title: this.title, description: this.description,price: this.price, imageUrl:this.imageUrl}})
    }else{
      //insert
      dbOp = db.collection('products').insertOne(this)
    }
   
    return dbOp.then(result =>{
      console.log("Save Product");
    }
    ).catch(err=>{
      console.log(err);
    })
  }

static fetchAll(){
  const db = getDd()
  return db.collection('products').find().toArray().then(products =>{
    return products

  }).catch(err=>{
    console.log(err);
  })
}
static findById(id){
  const db = getDd()
  return db.collection('products').find({_id: new mongoDb.ObjectId(id)}).next().then(product=>{
    console.log("Get Product");
    return product

  }).catch(err=>{
    console.log(err);
  })
}
static deleteById(prodId){
  const db = getDd()
  return db.collection('products').deleteOne({_id: new mongoDb.ObjectId(prodId)}).then(result =>{
    console.log("Deleted Product");

  }).catch(err=>{
    console.log(err);
  })
}
}
module.exports = Product
