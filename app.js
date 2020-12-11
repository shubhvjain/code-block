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
// app.listen(port, () => { console.log(`Code backend listening at http://localhost:${port}`) })

let sktConn = {}
let conn = {
    'python': {
        cmd: "python",
        arg: ['-u', '-i']
    },
    "r":{
        cmd:"/Library/Frameworks/R.framework/Resources/bin/R",
        arg:[]
    }
}
let tempRes = {}

var http = require("http");
var server = http.createServer(app)
let htServer = server.listen(port)
console.log("Server running at " + port)

const io = require('socket.io')(htServer, { cors: { origin: '*', } });

var spawn = require("child_process").spawn;

let pyInst =  spawn(conn["python"]['cmd'], conn["python"]['arg']) ;
pyInst.stdout.on('data',(data)=>{
    console.log("in std out")
    console.log(data.toString('utf8'))
    tempRes[name] = data.toString('utf8')
});
pyInst.stderr.on('data',(data)=>{
    console.log('child process exited with code ' + data);

    console.log(data.toString('utf8'))
    tempRes["python"] = data.toString('utf8')
});
pyInst.on('exit', ()=>{
    console.log("exiting ...bye...")
});




let spawnInstance = async (name) => {
    if (sktConn[name]) {
        return sktConn[name]
    } else {
        // https://github.com/73rhodes/node-python/blob/master/lib/python.js
        sktConn[name] = spawn(conn[name]['cmd'], conn[name]['arg']);
        tempRes[name] = " ";
        sktConn[name].stdout.on('data',(data)=>{
            console.log("in std out")
            console.log(data.toString('utf8'))
            tempRes[name] = data.toString('utf8')
        });
        sktConn[name].stderr.on('data',(data)=>{

            console.log(data.toString('utf8'))
            tempRes[name] = data.toString('utf8')
        });
        sktConn[name].on('exit', ()=>{
            console.log("exiting ...bye...")
        });
    }

}
console.log("Starting socket server .... ")
io.on('connection', socket => {
    // either with send()
    socket.send('Hello from server !');

    // or with emit() and custom event names
    // socket.emit('greetings', 'Hey!', { 'ms': 'jane' }, Buffer.from([4, 3, 3, 1]));

    // handle the event sent with socket.send()
    socket.on('message', (data) => {
        console.log(data);
    });

    // handle the event sent with socket.emit()
    socket.on('salutations', (elem1, elem2, elem3) => {
        console.log(elem1, elem2, elem3);
    });

    socket.on('pythonConnect', async () => {
        console.log("will create python shell ");
        try {
            //child.stdin.write(cmdQueue[0].command, encoding='utf8');
            spawnInstance("python")
            console.log(sktConn)
            socket.send('started');
        } catch (error) {
            console.error(error)
        }
    });
    socket.on('pythonRun', async (data) => {
       console.log(data)
        try {
            pyInst.stdin.write(data.command, encoding='utf8');
            socket.send({"out":tempRes["python"]});
        } catch (error) {
            console.error(error)
        }
    });

    socket.on('salutations', (elem1, elem2, elem3) => {
        console.log(elem1, elem2, elem3);
    });



});

//io.on("connection",socket =>{
    // socket.on("join",function(data){
    //     socket.join("waiting")
    //     console.log("user just joined")
    // })  
// })