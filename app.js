const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser')

const app = express();

const port = 1337;

app.use(bodyParser.json())

app.use(express.static(__dirname + '/client'))

app.listen(port, () => {
    console.log("App running on port 1337.")
    initFunc();
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
})

app.get('/getAllModules', async (req, res) => {
    let modules = []

    fs.readdirSync(__dirname + '/modules/').forEach((module) => {
        fs.readdirSync(__dirname + '/modules/' + module).forEach((file) => {
            if(file === "meta.json"){
                modules.push(JSON.parse(fs.readFileSync(__dirname + '/modules/' + module + '/' + file, "utf-8")))
            }
        })
    })

    res.status(200).json({modules: modules})
})

const initFunc = () => {
    fs.readdirSync(__dirname + '/modules/').forEach((module) => {
        fs.readdirSync(__dirname + '/modules/' + module).forEach((file) => {
            if (file == "init.js") {
                require('./modules/' + module + '/init.js')(app, express)
                console.log("\x1b[33mLoaded module " + module + ".\x1b[0m")
            };
        })
    });
}