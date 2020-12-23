'use strict';

const express = require('express');
const db = require("./db.js")
const basicAuth = require('express-basic-auth')
//const spawn = require("child_process").spawn; used in html router

// Constants
const PORT = 8880;


// App
const app = express();
app.use(basicAuth({
    users: { 'lenny': 'SuperDuperPassword.1' }
}))
app.use(express.json())

app.post("/", function(req,res){
    res.end(db.insert_data(req.body))
})


app.listen(PORT); //,HOST

console.log(`Running`);

/* cant figure out
*
* relative path in home erlaubt aber nicht für messages
*/