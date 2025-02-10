//Server
const express = require("express"); //REST API 대표적인 미들웨어
const app = express();
const cors = require("cors");
const port = 3006;
const httpServer = app.listen(port, () => {
    console.log(`${port} START!`);
});
const WebSocket = require("ws");    //ws -> WebSocket
const ws = new WebSocket.Server({ server: httpServer });    //wss -> ws

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("ClientData.db");   //ClientData -> ClientData.db

/*
데이터 베이스 추가 및 수정관련
1. 클라이언트에서 데이터 추가 및 수정 > 잘못 입력 가정
2. DB Browser내에서 수정 후 클라이언트에서 데이터 추가 > 에러발생(DB 사용중)
3. DB Browser에서 수정 후 "저장"을 안하면 DB 사용중으로 클라이언트에서 추가가 안됨
* SQLITE3는 동시다발적으로 DB 수정안됨(아마 다른것도), DB Browser 수정 후 저장해야 완료처리로 클라이언트 추가 가능!!
*/
db.serialize(() => {
    //IF NOT EXISTED -> IF NOT EXISTS
    let sql = `CREATE TABLE IF NOT EXISTS ClientTB(
        orderNo INTEGER NOT NULL,
        items VARCHAR(30) NOt NULL,
        itemNo VARCHAR(30) NOT NULL,
        lotNo INTEGER NOT NULL,
        productDate DATE NOT NULL,
        containerNo NOT NULL
    )`
    db.run(sql, (error) => {
        if (error) {
            console.error(error);
        } else {
            console.log("Create Client Table");
        }
    });
});

app.get("/load_DB",(req, res)=>{
    let sql = "select * from ClientTB";
    db.all(sql,(error, rows)=>{
        if(error){
            console.error(error);
        }else{
            console.log("load_DB START!");
            res.send(rows);
        }
    });
});

ws.on("connection", (websocket) => {
    websocket.on("message", (message) => {
        websocket.send(`Hello ${message}`); //서버에게 연결시도하는 클라이언트 개별로 답변을 준다. 검토 완료
    });
});

app.set("view engine", "pug");
app.set("views", "./src/pug");
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cors());    //app.use(cors())
app.locals.pretty = true;

app.get('/', (req, res) => {   //app.get('/',(req, res)=>{})
    res.render('WS3006');
});

app.post('/ClientData', (req, res) => {
    let ClientData_OJ = req.body;
    let OJ_orderNo = ClientData_OJ.orderNo;
    let OJ_items = ClientData_OJ.items;
    let OJ_itemNo = ClientData_OJ.itemNo;
    let OJ_lotNo = ClientData_OJ.lotNo;
    let OJ_productDate = ClientData_OJ.productDate;
    let OJ_containerNo = ClientData_OJ.containerNo;
    let sql = `INSERT INTO ClientTB (orderNo, items, itemNo, lotNo, productDate, containerNo) VALUES (?,?,?,?,?,?)`
    db.run(sql, [OJ_orderNo, OJ_items, OJ_itemNo, OJ_lotNo, OJ_productDate, OJ_containerNo],(error)=>{
        if(error){
            console.error(error);
            res.status(500).send("SQL ERROR: " + error);
        }else{
            console.log("Added to ClientData.db");
            res.status(200).send("Added to ClientData.db");
        }
    });
});