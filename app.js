//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require('mongoose')
const _=require('lodash')

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://tamil_2002:test123@cluster0.tmityq9.mongodb.net/todolistDB")

const itemSchema=new mongoose.Schema({
  name:String
})


const Item=mongoose.model("Item",itemSchema)

const item1=new Item({
  name:"Welcome to your to do list"
})

const item2=new Item({
  name:"Hit the + button to add a new item."
})

const item3=new Item({
  name:"<--- Hit this to delete an item."
})

const defaultItems=[item1,item2,item3]


const listSchema=new mongoose.Schema({
  name:String,
  items:[itemSchema]
})


const List=mongoose.model("List",listSchema)




app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
 
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        
        // console.log(err)
        
        // console.log("successfully inserted!")
      })
res.redirect("/")
    }
   
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  })

  

});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName)
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:customListName,
          items:defaultItems
        })
        list.save()
        res.redirect("/"+customListName)
      }
      else{
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
      }
      
    }
  })
})


 
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list
  const item=new Item({
    name:itemName
  })

  if(listName==="Today"){
    item.save()
    res.redirect("/")
  }
  else{
    List.findOne({name:listName},function(err,foundList){
     foundList.items.push(item)
      foundList.save()
      res.redirect("/"+listName)
    })
  }

  
  

 
});
app.post("/delete",function(req,res){
const checkedItem=req.body.checkbox;
const listName=req.body.listName
if(listName==="Today"){
  Item.deleteOne({_id:checkedItem},function(err){
    if(!err){
    // console.log("deleted successfully")
    res.redirect("/")

  }})
}else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,foundOne){
    if(!err){
      res.redirect("/"+listName)
    }
  })
}
  
})

app.get('/favicon.ico', (req, res) => res.status(204).end());

let port=process.env.PORT
if(port==null||port==""){
port=3000
}

app.listen(port, function() {
  console.log("Server started");
});
