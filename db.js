const { Client } = require('pg')
const client = new Client({
    user: "postgres",
    password: "SbotmtWigrm.1",
    host: "127.0.0.1",
    database: "doppelkopf"
})
var data = { "re": {} }
data.re.solo = "Bubensolo"
data.re.punkte = 122
data.re.spieler1 = "Lenny"
data.re.spieler2 = "Tassi"
data.re.ansage = true
data.re.absage = 120
data.re.fuchs = 0
data.re.doppelkopf = 0
data.re.karlchen = false

var re_query = "INSERT INTO Re(Solo, Spieler1, Spieler2, Punkte, Ansage, Absage, Fuchs, Doppelkopf, Karlchen) " +
    "VALUES (" + null + ", \'" + data.re.spieler1 + "\', \'" + data.re.spieler2 + "\', " + data.re.punkte + ", " + data.re.ansage + ", " + data.re.absage + ", " + data.re.fuchs + ", " + data.re.doppelkopf + ", " + data.re.karlchen + ") RETURNING id;"

console.log(re_query)
client.connect()
    .then(() => console.log("Connected successfuly"))
    .then(() => client.query(re_query))
    .then(results => { var re_id = results.rows[0].id; return re_id })
    .catch(e => console.log(e))
    .finally(() => client.end())

/*
async function insert_data(data) {
    await client.connect()

}
*/