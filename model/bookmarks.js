const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Bookmarkschema= new Schema({
    Link:{
        type:String,
        unique:true,
        required:true
    },
    Title:{
        type:String,
        required: true
    },
    Creation_Time:{
        type:Date,
    },
    Updation_Time:{
        type:Date,
    },
    Publisher:{
        type:String,
        required:true
    },
    Tags:{
        type:Array
    }
})
module.exports = Bookmark = mongoose.model('Bookmark',Bookmarkschema);