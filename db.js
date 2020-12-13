const {Client} = require('pg')
const client = new Client({
    user: "postgres",
    password: "SbotmtWigrm.1",
    host: "127.0.0.1",
    database: "doppelkopf"
})

client.connect()
.then(() => console.log("Connected successfuly"))
.then(() => client.query("insert into Re (ID, Solo, Spieler1, Spieler2, Sieg, Punkte, Ansage, Absge, Fuchs, Doppelkopf, Karlchen\
"VALUES ("+ data.solo + ", " + data.spieler1 + ", " + data.spieler2 + ", " + data.sieg))
.then(results => console.table(results.rows))
.catch(e => console.log(e))
.finally(() => client.end())
