'use strict';

const express = require('express');
const db = require("./db.js")
const basicAuth = require('express-basic-auth')
var cors = require('cors')
const basicAuth = require('express-basic-auth')

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

app.use(basicAuth({
    users: { 'lenny': 'Kv48d0b&At!FiJs' }
}))

app.post("/", function(req, res) {
    res.set('Content-Type', 'application/json')
    db.insert_data(req.body)
        .then(str => res.end(str))
})

app.get("/gruppen", function(req, res) {
    res.set('Content-Type', 'application/json')
    db.get_gruppen()
        .then(str => res.end(str))
})

app.get("/solos", function(req, res) {
    res.set('Content-Type', 'application/json')
    db.get_solos()
        .then(str => res.end(str))
})

app.post("/spieler", function(req, res) {
    res.set('Content-Type', 'application/json')
    db.get_spieler(req.body.gruppe)
        .then(str => res.end(str))
})

app.post("/delete", function(req, res) {
    res.set('Content-Type', 'application/json')
    db.delete_spiel(req.body.id)
        .then(str => res.end(str))
})

app.post("/deletelast", function(req, res) {
    res.set('Content-Type', 'application/json')
    db.delete_last()
        .then(str => res.end(str))
})

app.post("/highlevelstats", function(req, res) {
    res.set('Content-Type', 'application/json')
    db.highlevelstats(req.body.gruppe)
        .then(str => res.end(str))
})

app.post("/history", function(req, res) {
    res.set('Content-Type', 'application/json')
    db.history(req.body.gruppe, req.body.names)
        .then(str => res.end(str))
})

app.listen(PORT); //,HOST

console.log(`Running`);

/* cant figure out
 *
 * relative path in home erlaubt aber nicht für messages
 */