const express = require('express')
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const ser = require("./service")

const app = express()
app.use(logger('dev'));
app.use(bodyParser.json({ strict: true, limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,fields,user-access-token");
    if (req.method === 'OPTIONS') {
        res.header("Access-Control-Allow-Methods", "PUT,POST,PATCH,DELETE,GET")
        return res.status(200).json({});
    }
    next();
})

app.get('/', async (req, res) => { res.json({ message: "send code,langauge" }) })

app.post('/', async (req, res) => {
    try {
        let result = await ser.runCode(req.body.language, req.body.code)
        res.json(result)
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            error: error.message
        })
    }
})

const port = 3002
app.listen(port, () => { console.log(`Code backend listening at http://localhost:${port}`) })