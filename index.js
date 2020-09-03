require('dotenv').config();
const express = require('express');
var mongo = require('./mongodbconnection');
bodyParser = require('body-parser');
const bookmarks = require('./model/bookmarks')
const tags = require('./model/topic');
const e = require('express');
cors = require('cors');
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors()); //corss origin 
mongo.connectDatabase() //database connection
//new bookmark 
app.post('/bookmark/new', (req, res) => {
    var Link = req.body.Link
    var Title = req.body.Title
    var Publisher = req.body.Publisher
    var Tags = req.body.Tags
    if(Tags!=undefined) Tags=Tags.split(',')
    var Creation_Time = Date()
    var Updation_Time = Date()
    var doc = { Link, Title, Publisher, Tags, Creation_Time, Updation_Time }
    var bookm = new bookmarks(doc) // craeting mongo document
    bookm.save((err, result) => {
        if (err != null) {
            return res.send('Bookmark is alraedy present')
        }
        else {
            if (Tags != undefined) {
                Tags.forEach(i => { //as its array so for every entry it will check the following rules
                    var tag = new tags({
                        'Title': i,
                        'Creation_Time': Creation_Time,
                        'Updation_Time': Updation_Time
                    })//creation of new tag
                    tag.save((err, result) => {
                        if (err != null) {
                            //tag with title is already present so updating the updatetime field
                            tags.updateOne({ Title: i }, { $set: { 'Updation_Time': Updation_Time } }, { upsert: true }, (err, result) => {
                                if (err != null) {
                                    return res.send('please try again some time')
                                }
                                else {
                                    //updation is sucessful
                                     console.log(result)
                                }
                            })
                        }
                        else {
                            //if new tag craeted
                            console.log(result)
                        }
                    });
                });
            }
            return res.json(result)  
        }
    });
});

//delete bookmark
app.delete('/bookmark/:Link',(req,res)=>{
    var Link=req.params.Link //getting link of bookmark which we want to delete
    if(Link!=undefined){
        bookmarks.deleteOne({'Link':Link},(err,result)=>{ //delete bookmark from collection
            if(err!=null){
                console.log(err)
                res.send('Please try again later') // server error link mongo connection
            }
            else{
                console.log(result)
                if(result.deletedCount==0)
                    res.send('bookmark not found') //bookmark not present
                else
                    res.send('bookmark deleted sucessfully') //bookmark deleted sucessfully
            }
        })
    }
})

//Dispaly the all bookmarks present in database
app.get('/bookmarks/all',(req,res)=>{
    bookmarks.find({},(err,result)=>{
        if(err!=null) return res.send('please try again sometime') //mongo server error
        res.send(result) //list of all bookmarks
    })
})

//adding new tag to database
app.post('/tag/new',(req,res)=>{
    var Title=req.body.Title
    var Creation_Time = Date()
    var Updation_Time = Date()
    var doc={Title,Creation_Time,Updation_Time}//creating doc as per the schema
    var tag=new tags(doc)
    tag.save((err,result)=>{
        if(err!=null){
            console.log(err)
            return res.send('tag already present')
        }
        else{
            //tag is sucessfully stored in database
            console.log(result)
            return res.send(result)
        }
    })
})

//deleting the specific tag from database
app.delete('/tag/:Title',(req,res)=>{
    var Title=req.params.Title
    tags.deleteOne({Title:Title},(err,result)=>{
        if(err!=null) return res.send('please try again sometime') //server error
        if(result.deletedCount==0) return res.send('Tag not present in database') //tag not present
        else return res.send('tag deleted sucesfully') //deletion sucessful.
    })
})

//adding the tag on bookmark
app.put('/tag/:Link/:Title',(req,res)=>{
    var Link=req.params.Link
    var Title=req.params.Title
    bookmarks.updateOne({Link:Link},{$addToSet:{Tags:Title}},{upsert:true},(err,result)=>{//upadting the document if new tag is present
        console.log(err,result)
        if(err!=null) return res.send('please try again some time')
        else{
            if(result.nModified>0){ 
                bookmarks.updateOne({Link:Link},{$set:{Updation_Time:Date()}},{upsert:true},(err,result)=>{
                    if(err!=null) return res.send('plaese try again some time') //server error
                    if(result.nModified>0){
                
                var tag=new tags({
                    Title:Title,
                    Updation_Time:Date(),
                    Creation_Time:Date()
                }) //created the new tag if not present in database
                tag.save((err,resu)=>{
                    if(err!=null){
                        tags.updateOne({ Title: Title }, { $set: { 'Updation_Time': Date() } }, { upsert: true }, (err, result) => {//if tag is present then updating
                            if (err != null) {
                                return res.send('please try again some time')
                            }
                            else {
                                //updation is sucessful
                                 console.log(result)
                            }
                        }) 
                    }
                    return res.send('document updated sucessfully')
                })
            }})
            }
            else{
                return res.send('document tag already present to bookmark')
            }
    }
    })
})

//remove tag from bookmark
app.delete('/tag/remove/:Link/:Title',(req,res)=>{
    var Link=req.params.Link
    var Title=req.params.Title
    bookmarks.updateOne({Link:Link},{$pull:{Tags:Title}},{upsert:true},(err,result)=>{//removing tag from bookmark
        console.log(result)
        if(err!=null) return res.send('plaese try again some time') //server error
        if(result.nModified>0) {
            bookmarks.updateOne({Link:Link},{$set:{Updation_Time:Date()}},{upsert:true},(err,result)=>{
                if(err!=null) return res.send('plaese try again some time') //server error
                if(result.nModified>0) return res.send('Tag sucessfully removed from bookmark') //tag removal sucessful
            })
            
        }
        else return res.send('Tag is not present on bookmark') //tag not prsent in bookmark
    })
})

//Display the all tags from database
app.get('/tag/all',(req,res)=>{
    tags.find({},(err,result)=>{
        if(err!=null) return res.send('please try again sometime') //mongo server error
        res.send(result) //list of all bookmarks
    })
})


//server loaction configuration
const port = process.env.PORT || 4000;
const server = app.listen(port, function () {
    console.log('Listening on port ' + port);
});