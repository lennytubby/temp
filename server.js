'use strict';

const express = require('express');
const db = require("./db.js")
const basicAuth = require('express-basic-auth')
var cors = require('cors')
//const spawn = require("child_process").spawn; used in html router

// Constants
const PORT = 8880;


// App
const app = express();
/*
app.use(basicAuth({
    users: { 'lenny': 'SuperDuperPassword.1' }
}))
*/
app.use(express.json())
app.use(cors())

app.post("/", function(req,res){
    db.insert_data(req.body)
        .then(str => res.end(str))
})

app.get("/gruppen", function(req,res){
    db.get_gruppen()
        .then(str => res.end(str))
})

app.get("/solos", function(req,res){
    db.get_solos()
        .then(str => res.end(str))
})

app.post("/spieler", function(req,res){
    db.get_spieler(req.body.gruppe)
        .then(str => res.end(str))
})

app.listen(PORT); //,HOST

console.log(`Running`);

/* cant figure out
*
* relative path in home erlaubt aber nicht für messages
*/