const express = require('express');
const mongoose = require('mongoose')
const app= express();
const route= require('./routes/route')
const cors = require('cors')

app.use(cors())
app.use(express.json());

mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://user:ISjwDttcDksEnCcv@cluster0.hja9z.mongodb.net/Dataviss-Analytics?authSource=admin&replicaSet=atlas-3xefdb-shard-0&readPreference=primary&ssl=true",{ useNewUrlParser: true })
    .then(() => {
        console.log("Mongo db is connected")
    }).catch((err) => {
        console.log(err.message)
    });
app.use('/', route)
app.listen(process.env.PORT || 3000, () => {
    console.log("app is listen on port" + (process.env.PORT || 3000))
})