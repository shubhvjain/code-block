const { spawn } = require('child_process');

let lang = {
    "python": async (code)=>{
        const child = spawn('pwd');
        child.on('exit', function (code, signal) {
            console.log('child process exited with ' +
                        `code ${code} and signal ${signal}`);
          });
        
          child.stdout.on('data', (data) => {
            console.log(`child stdout:\n${data}`);
            return data
          });
          
          child.stderr.on('data', (data) => {
            console.error(`child stderr:\n${data}`);
          });
    }
}

module.exports.runCode =  async (language,code)=>{
 return {"a":1}   
}
  