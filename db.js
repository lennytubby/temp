var querys = require('./sql_querys.js')

const { Pool } = require('pg')
const pool = new Pool({
    user: "postgres",
    password: "SbotmtWigrm.1",
    host: "127.0.0.1",
    database: "doppelkopf"
})


/*
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

*/
async function insert_data(data) {
    // Connect
    try {
        var client = await pool.connect()
    } catch (e) {
        return 'connection error : ' + e.detail + " , " + e.hint
    }

    // validate input

    if (data.fehlspiel) {
        var spiel_query = "INSERT INTO Spiel (Gruppe, Punkte, Fehlspiel) VALUES (" + data.gruppe + ", " +
            12 + ", " + data.Spielfehler + ") RETURNING id;"
        try {
            var results = await client.query(spiel_query)
        } catch (e) {
            return "Spiel INSERT error : " + e.detail + " , " + e.hint + "\nSpiel Query :\n" + spiel_query
        }
        return results.rows[0].id
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
        try {
            var results = await client.query(re_query)
        } catch (e) {
            return "Spiel INSERT error : " + e.detail + " , " + e.hint + "\nRe Query :\n" + re_query
        }
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
        try {
            var results = await client.query(kontra_query)
        } catch (e) {
            return "Kontra INSERT error : " + e.detail + " , " + e.hint + "\nKontra Query :\n" + kontra_querysp
        }
        var kontra_id = results.rows[0].id

        // Spiel
        if (!(data.sieger == "Re" || data.sieger == "Kontra")) {
            return "Sieger nicht eindeutig"
        }
        var spiel_query = "INSERT INTO Spiel (Gruppe, Re, Kontra, Punkte, Sieger) VALUES (" + data.gruppe + ", " +
            re_id + ", " + kontra_id + ", " + data.punkte + ", \'" + data.sieger + "\') RETURNING id;"
        try {
            var results = await client.query(spiel_query)
        } catch (e) {
            return "Spiel INSERT error : " + e.detail + " , " + e.hint + "\nSpiel Query :\n" + spiel_query
        }
        // High Level Stats
        try {
            var results = await client.query(querys.highlevelstats(data.gruppe))
        } catch (e) {
            return "get stats error : " + e.detail + " , " + e.hint
        }
        //End
        finally {
            client.release()
        }
        return JSON.stringify(results.rows)
    }
}
module.exports.insert_data = insert_data

async function get_gruppen() {
    try {
        var client = await pool.connect()
    } catch (e) {
        return 'connection error : ' + e.detail + " , " + e.hint + ", " + JSON.stringify(e)
    }
    var query = "select name, id, spiele from gruppe;"
    try {
        var results = await client.query(query)
    } catch (e) {
        return JSON.stringify(e)
            //return "Get Gruppen error : " + e.detail + " , " + e.hint
    } finally {
        client.release()
    }
    return JSON.stringify(results.rows)
}
module.exports.get_gruppen = get_gruppen

async function get_spieler(gruppe) {
    if (!(typeof gruppe === "number" || typeof gruppe === "number")) return "bitte eine gruppe angeben"
    try {
        var client = await pool.connect()
    } catch (e) {
        return 'connection error : ' + e.detail + " , " + e.hint
    }
    //var query = "select name, punkte, bild as bild, solo_countdown from spieler s, gruppenmitglieder gm where gruppe = " + gruppe + " and s.name = gm.spieler;"
    try {
        var results = await client.query(querys.getSpieler(gruppe))
    } catch (e) {
        return "Get Gruppen error : " + e.detail + " , " + e.hint
    } finally {
        client.release()
    }
    return JSON.stringify(results.rows)
}
module.exports.get_spieler = get_spieler

async function get_solos() {
    try {
        var client = await pool.connect()
    } catch (e) {
        return 'connection error : ' + e.detail + " , " + e.hint
    }
    var query = "select name from solo;"
    try {
        var results = await client.query(query)
    } catch (e) {
        return "Get Gruppen error : " + e.detail + " , " + e.hint
    } finally {
        client.release()
    }
    return JSON.stringify(results.rows)
}
module.exports.get_solos = get_solos

async function delete_spiel(ID) {
    if (!(typeof ID === "number" )) return "bitte eine spiel id angeben"
    try {
        var client = await pool.connect()
    } catch (e) {
        return 'connection error : ' + e.detail + " , " + e.hint
    }
    try {
        var results = await client.query(querys.delete_spiel(ID))
    } catch (e) {
        return "Delete error : " + e.detail + " , " + e.hint
    } finally {
        client.release()
    }
    return "success"
}
module.exports.delete_spiel = delete_spiel

async function delete_last() {
    try {
        var client = await pool.connect()
    } catch (e) {
        return 'connection error : ' + e.detail + " , " + e.hint
    }
    try {
        var results = await client.query(querys.delete_last)
    } catch (e) {
        return "Delete error : " + e.detail + " , " + e.hint
    } finally {
        client.release()
    }
    return "success"
}
module.exports.delete_last = delete_last

async function highlevelstats(gruppe) {
    if (!(typeof gruppe === "number" || typeof gruppe === "number")) return "bitte eine gruppe angeben"
    try {
        var client = await pool.connect()
    } catch (e) {
        return 'connection error : ' + e.detail + " , " + e.hint
    }
    try {
        var results = await client.query(querys.highlevelstats(gruppe))
    } catch (e) {
        return "High level stats error : " + e.detail + " , " + e.hint
    } finally {
        client.release()
    }
    return JSON.stringify(results.rows)
}
module.exports.highlevelstats = highlevelstats

async function history(gruppe, names) {
    if (!(typeof gruppe === "number" || typeof gruppe === "number")) return "bitte eine gruppe angeben"
    try {
        var client = await pool.connect()
    } catch (e) {
        return 'connection error : ' + e.detail + " , " + e.hint
    }
    try {
        var results = await client.query(querys.history(gruppe, names))
    } catch (e) {
        return "history error : " + e.detail + " , " + e.hint
    } finally {
        client.release()
    }
    return JSON.stringify(results.rows)
}
module.exports.history = history