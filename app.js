const express = require('express')
const app = express()
const port = 3002
const ser = require("./service")


const util = require('util');
const exec = util.promisify(require('child_process').exec);

app.get('/', async (req, res) => {
    const { stdout, stderr } = await exec('python code/sample.py',{encoding:"buffer"});
    console.log(typeof stdout)

    if (stderr) {
        console.log(`stderr: ${stderr}`);
        res.send(stderr)
    }else{
       //  console.log(`stdout: ${stdout}`);
       console.log(typeof stdout)
        res.send(stdout)
 
//    res.send(stdout.toString().split('\n'))
    }
    
    
})

app.post('/', async (req, res) => {
    let result = await ser.runCode("", "")
    res.json(result)
})


app.listen(port, () => { console.log(`Code backend listening at http://localhost:${port}`) })