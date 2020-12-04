const express = require('express')
const app = express()
const port = 3002
const ser = require("./service")


const { exec } = require("child_process");

app.get('/', async (req, res) => {
    exec("ls", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            res.send(stderr)
        }
        console.log(`stdout: ${stdout}`);
    });
})

app.post('/', async (req, res) => {
    let result = await ser.runCode("", "")
    res.json(result)
})


app.listen(port, () => { console.log(`Code backend listening at http://localhost:${port}`) })