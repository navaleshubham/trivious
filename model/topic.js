const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Tagschema= new Schema({
    Title:{
        type:String,
        unique:true,
        required: true
    },
    Creation_Time:{
        type:Date,
    },
    Updation_Time:{
        type:Date,
    },
    
})
module.exports = Tags = mongoose.model('Tags',Tagschema);