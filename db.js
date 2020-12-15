const { Client } = require('pg')
const client = new Client({
    user: "postgres",
    password: "SbotmtWigrm.1",
    host: "127.0.0.1",
    database: "doppelkopf"
})

var data = {
    "re": {},
    "kontra": {}
}
data.re.solo = "Bubensolo"
data.re.spieler1 = "Lenny"
data.re.spieler2 = "Tassi"
data.re.punkte = 122
data.re.ansage = true
data.re.absage = null
data.re.fuchs = 0
data.re.doppelkopf = 0
data.re.karlchen = false

data.kontra.spieler1 = "Neli"
data.kontra.spieler2 = "Frank"
data.kontra.spieler3 = null
data.kontra.punkte = 118
data.kontra.ansage = false
data.kontra.absage = null
data.kontra.fuchs = 0
data.kontra.doppelkopf = 0
data.kontra.karlchen = false

data.sieger = "re"
data.punkte = 3
data.gruppe = 1
    /*
        var re_query = "INSERT INTO Re(Solo, Spieler1, Spieler2, Punkte, Ansage, Absage, Fuchs, Doppelkopf, Karlchen) " +
            "VALUES (" + null + ", \'" + data.re.spieler1 + "\', \'" + data.re.spieler2 + "\', " + data.re.punkte + ", " + data.re.ansage + ", " + data.re.absage + ", " + data.re.fuchs + ", " + data.re.doppelkopf + ", " + data.re.karlchen + ") RETURNING id;"

        console.log(re_query)
        client.connect()
            .then(() => console.log("Connected successfuly"))
            .then(() => client.query(re_query))
            .then(results => { var re_id = results.rows[0].id; return re_id })
            .catch(e => console.log(e))
            .finally(() => client.end())

        */
async function insert_data(data) {
    await client.connect()

    if (data.fehlspiel) {

    } else {
        //RE
        if (data.re.solo) {
            var re_solo = "\'" + data.re.solo + "\'"
        } else {
            var re_solo = data.re.solo
        }
        if (data.re.spieler1) {
            var re_spieler1 = "\'" + data.re.spieler1 + "\'"
        } else {
            var re_spieler1 = data.re.spieler1
        }
        if (data.re.spieler2) {
            var re_spieler2 = "\'" + data.re.spieler2 + "\'"
        } else {
            var re_spieler2 = data.re.spieler2
        }
        var re_query = "INSERT INTO Re(Solo, Spieler1, Spieler2, Punkte, Ansage, Absage, Fuchs, Doppelkopf, Karlchen) " +
            "VALUES (" + re_solo + ", " + re_spieler1 + ", " + re_spieler2 + ", " + data.re.punkte + ", " + data.re.ansage + ", " + data.re.absage + ", " + data.re.fuchs + ", " + data.re.doppelkopf + ", " + data.re.karlchen + ") RETURNING id;"
        var results = await client.query(re_query)
        console.log(results)
        var re_id = results.rows[0].id

        // Kontra
        if (data.kontra.spieler1) {
            var kontra_spieler1 = "\'" + data.kontra.spieler1 + "\'"
        } else {
            var kontra_spieler1 = data.kontra.spieler1
        }
        if (data.kontra.spieler2) {
            var kontra_spieler2 = "\'" + data.kontra.spieler2 + "\'"
        } else {
            var kontra_spieler2 = data.kontra.spieler2
        }
        if (data.kontra.spieler3) {
            var kontra_spieler3 = "\'" + data.kontra.spieler3 + "\'"
        } else {
            var kontra_spieler3 = data.kontra.spieler3
        }
        var kontra_query = "INSERT INTO Kontra(Spieler1, Spieler2, Spieler3, Punkte, Ansage, Absage, Fuchs, Doppelkopf, Karlchen) " +
            "VALUES (" + kontra_spieler1 + ", " + kontra_spieler2 + ", " + kontra_spieler3 + ", " + data.kontra.punkte + ", " + data.kontra.ansage + ", " + data.kontra.absage + ", " + data.kontra.fuchs + ", " + data.kontra.doppelkopf + ", " + data.kontra.karlchen + ") RETURNING id;"
        var results = await client.query(kontra_query)
        console.log(results)
        var kontra_id = results.rows[0].id

        // Spiel
        if (data.sieger == "re") {
            var sieger = re_id
            var verlierer = kontra_id
        } else if (data.sieger == "kontra") {
            var sieger = kontra_id
            var verlierer = re_id
        } else {
            console.log("Sieger nicht eindeutig")
        }
        var spiel_query = "INSERT INTO Spiel (Gruppe, Sieger, Verlierer, Punkte) VALUES (" + data.gruppe + ", " +
        sieger + ", " + verlierer + ", " + data.punkte + ") RETURNING id;"
        console.log(spiel_query)
        var results = await client.query(spiel_query)
        console.log(results)
        var spiel_id = results.rows[0].id
        console.log(spiel_id)
    }
}
insert_data(data)

//module.exports.insert_data = insert_data