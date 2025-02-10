//Client
const express = require("express");
const app = express();
const port = 3005;
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("WS3005_DB.db");   //new 빼먹음

db.serialize(() => {    //relized -> serialize
    const sql = `
        CREATE TABLE IF NOT EXISTS WS3005DB(   
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER
        )
    `;
    //sql 설정 시 따옴표 말고 벡틱사용, CREATE TABLE IF NOT EXISTS
    db.run(sql, (error) => {
        if (error) {
            console.log(error);
        } else {
            console.log("sqlite created db");
        }
    });
});

app.set("view engine", "pug");
app.set("views", "./src/pug");
app.use(express.json());
app.use(express.static("public"));    //locals -> static
app.use(express.urlencoded({ extended: false }));
app.locals.pretty = true;

app.listen(port, () => {
    console.log(`${port} START!`);
});

app.get('/', (req, res) => {
    res.render("WS3005");
});
