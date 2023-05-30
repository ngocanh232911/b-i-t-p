const bodyParser = require('body-parser');
const express=require('express')
const mongoose=require('mongoose')
const secretkey = "88888888888"
const jwt = require('jsonwebtoken')
mongoose.connect('mongodb+srv://ngocanhle:ngocanhle@cluster0.ijnukwf.mongodb.net/Project')
const userSchema=new mongoose.Schema({
    username:String,
    password:String,
});
const orderSchema= new mongoose.Schema({
    item: String,
    price:Number,
    quantity:Number
});
const inventorySchema = {
    sku:  String,
    description: String,
    instock: Number
}
const userModel=mongoose.model('users', userSchema)
const orderModel = mongoose.model('orders', orderSchema)
const inventoryModel = mongoose.model('inventories', inventorySchema)
const app=express()
app.use(bodyParser.json())
app.post("/users", async (req, res) => {
    const {username, password} = req.body;
    try {
      const foundUser = await userModel.findOne({username: username, password: password})
      if (foundUser) {
        const payload = {username}
        const token = jwt.sign(payload, secretkey);
        res.status(200).send(token)
      } else {
        res.status(404).send('Lỗi')
      }
    } catch(err) {
      console.log(err)
    }
  })
  
  const authentication = (req, res, next) => {
    const token = req.headers.authorization.split(", ")
    
    if(!token) {
      res.status(401).send('No token')
    }
    try {
      const decoded = jwt.verify(token, secretkey)
      console.log(decoded)
      next();
    } catch (err) {
      res.status(401).send("Invalid token");
    }
  
  }
  app.use(authentication)
  
  app.get('/inventories', async (req, res) => {
    const data = await inventoryModel.find({})
    const allProducts = data.map(el => el.sku)
    res.status(200).json(allProducts)
  })
  
  app.get('/found' , async(req, res) => {
    const data = await inventoryModel.find({instock: {$lt: 100}})
    res.status(200).send(data)
  })
  
  app.get('/orders', async (req, res) => {
    const allOrders = await orderModel.find().lean();
    await Promise.all(
        allOrders.map( async (order) => {
          const item = order.item
          const product = await inventoryModel.find({sku:item}).lean()
          order.description = product[0].description
        })
    )
    res.status(200).json(allOrders)
  })
  
  app.listen(3001, () => {
    console.log("App is running at 3001");
  })