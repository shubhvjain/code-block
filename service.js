const { spawn } = require('child_process');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

var lang = {
    "python": {
        "avail": true,
        "run": async (code) => {
            await writeToFile("code.py", code)
            const { stdout, stderr } = await exec('python code/code.py', { encoding: "buffer" });
            let out = stdout.toString().split("\n")
            return { stdout: stdout.toString('base64'), stderr: stderr.toString('base64'), output: out }
        }
    },
    "r": {
        "avail": true,
        "run": async (code) => {
            await writeToFile("code.R", "#!/usr/bin/env Rscript \n"+code)
            const { stdout, stderr } = await exec('Rscript code/code.R', { encoding: "buffer" });
            let out = stdout.toString().split("\n")
            return { stdout: stdout.toString('base64'), stderr: stderr.toString('base64'), output: out }
        }
    },
    "c": {
        "avail": true,
        "run": async (code) => {
            await writeToFile("code.c",code)
            const { stdout, stderr } = await exec('gcc -o ccode1 code.c & ./ccode1 ', {cwd:"code", encoding: "buffer" });
            let out = stdout.toString().split("\n")
            return { stdout: stdout.toString('base64'), stderr: stderr.toString('base64'), output: out }
        }
    }
}

var writeToFile = (fileName, content) => {
    return new Promise((resolve, reject) => {
        fs.writeFile("code/" + fileName, content, function (err) {
            if (err) reject(err)
            resolve()
        });
    })
}

module.exports.runCode = async (language, code) => {
    let executing = false;
    try {
        if (!lang[language]) { throw new Error("Unsupported language. Languages supported : " + Object.keys(lang).join(" , ")) }
        if (!lang[language]['avail']) { throw new Error("Server busy. Please try after some time") }
        executing = true;
        lang[language]['avail'] = false;
        let result = await lang[language]["run"](code)
        lang[language]['avail'] = true;
        result["success"] = true
        return result
    } catch (error) {
        console.log(error)
        // if code was executed with error , still release lock 
        if (executing) { lang[language]['avail'] = true; }
        return { success: false, error: error.message }
    }
}