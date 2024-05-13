const Cart = require("./cart");
const db = require("../utils/db")

const getProductsFromFile = (callback) => {
  fs.readFile(productfilePath, (err, fileContent) => {
    if (err) {
      return callback([]);
    } else {
      callback(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, price, description) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }
  save() {
    return db.execute('INSERT INTO products (title, price,imageUrl,description) VALUES (?, ?, ?, ?)',[this.title, this.price, this.imageUrl, this.description])
  
  }

  static deleteById() {
    
  }

  static fetchAll() {
   return db.execute('Select * from products')
  }

  static findById(id) {
    return db.execute('SELECT * FROM products WHERE id = ?',[id])
   
  }
};
