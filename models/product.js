const fs = require("fs");
const path = require("path");
const RootDir = require("../utils/path");
const productfilePath = path.join(RootDir, "data", "products.json");
const Cart = require("./cart");

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
    getProductsFromFile((products) => {
      if (this.id) {
        const existingProductIndex = products.findIndex(
          (prod) => prod.id === this.id
        );
        const updtaedProducts = [...products];
        updtaedProducts[existingProductIndex] = this;
        fs.writeFile(
          productfilePath,
          JSON.stringify(updtaedProducts),
          (err) => {
            console.log(err);
          }
        );
      } else {
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(productfilePath, JSON.stringify(products), (err) => {
          console.log(err);
        });
      }
    });
  }

  static deleteById(id) {
    getProductsFromFile((products) => {
      const product = products.findIndex((prod) => prod.id === id);
      const updatedProducts = products.filter((prod) => prod.id !== id);
      fs.writeFile(productfilePath, JSON.stringify(updatedProducts), (err) => {
        if (!err) {
          Cart.deleteProduct(id, product.price);
        }
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile((products) => {
      const product = products.find((p) => p.id === id);
      cb(product);
    });
  }
};
