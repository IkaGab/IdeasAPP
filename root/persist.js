//#region variables
const http = require('http');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');
const rootPath = path.dirname(require.main.filename);
let persistServer = http.createServer();
//#endregion

//#region routing
persistServer.on('request', function (req, res) {
    let body = '';
    req.on('data', function (data) {
        body += data;
    });

    if (req.url == '/data/persist' && req.method == 'PUT') {//adding new idea to DB
        req.on('end', function () {
            body = JSON.parse(body);
            addIdeaToDB(res, body);
        });
    } else if (req.url == '/data/persist' && req.method == 'POST') {//updating idea from DB
        req.on('end', function () {
            body = JSON.parse(body);
            updateIdeaInDB(res, body);
        });
    } else if (req.url == '/data/ideas' && req.method == 'POST') {//get all ideas from DB
        req.on('end', function () {
            body = JSON.parse(body);
            getIdeasFromDB(res, body);
        });
    } else if (req.url == '/data/clean' && req.method == 'DELETE') {//delete idea from DB
        req.on('end', function () {
            body = JSON.parse(body);
            deleteIdeaFromDB(res, body);
        });
    }
});
//#endregion
//persist server listens on port 8080 and log message about it
persistServer.listen(8080);
console.log('Persist-Server is listeningon port: 8080');

//#region private functions
//returns the file <user>.json to the main server
function getIdeasFromDB(res, body) {
    fs.readFile(path.join(rootPath, 'database', body.user + '.json'), function (err, data) {
        if (err) {
            console.error(err);
            res.writeHead(404, { 'Content-Type': 'text/html' });
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
        }
        res.end();
    });
}
//adds user specific idea to <user>.json file
function addIdeaToDB(res, body) {
    fs.readFile(path.join(rootPath, 'database', body.user + '.json'), function (err, data) {
        if (err) {
            console.error(err);
            res.writeHead(404, { 'Content-Type': 'text/html' });
        } else {
            let ideas = JSON.parse(data);
            let keys = Object.keys(ideas);
            let temp;
            let ideasIds = -1;

            if (keys.length > 0) {
                ideasIds = keys.reduce(function (a, b) {
                    return Math.max(a, b);
                });
                ideasIds++;
            } else {
                ideasIds = 1;
            }
            ideas[ideasIds] = new Array();
            ideas[ideasIds][0] = body.idea;
            ideas[ideasIds][1] = getCurrentTime();
            fs.writeFile(path.join(rootPath, 'database', body.user + '.json'), JSON.stringify(ideas), (err) => {
                if (err) {
                    console.error(err);
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    return;
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(ideasIds.toString());
                }
                res.end();
            });
        }
    });
}
//updates user specific idea to <user>.json file
function updateIdeaInDB(res, body) {
    fs.readFile(path.join(rootPath, 'database', body.user + '.json'), function (err, data) {
        if (err) {
            console.error(err);
            res.writeHead(404, { 'Content-Type': 'text/html' });
        } else {
            let ideas = JSON.parse(data);
            let keys = Object.keys(ideas);
            let indexFound = false;

            for (var i = 0; i < keys.length; i++) {
                if (keys[i] === body.id) {
                    indexFound = true;
                }
            }

            if (indexFound === false) {
                res.write("ID not exist");
                return;
            }

            ideas[body.id][0] = body.idea;
            ideas[body.id][1] = getCurrentTime();
            fs.writeFile(path.join(rootPath, 'database', body.user + '.json'), JSON.stringify(ideas), (err) => {
                if (err) {
                    console.error(err);
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    return;
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write("ID was updated");
                }
                res.end();
            });
        }
    });
}
//deletes user specific idea to <user>.json file
function deleteIdeaFromDB(res, body) {
    fs.readFile(path.join(rootPath, 'database', body.user + '.json'), function (err, data) {
        if (err) {
            console.error(err);
            res.writeHead(404, { 'Content-Type': 'text/html' });
        } else {
            let ideas = JSON.parse(data);
            let ID = body.id;
            delete ideas["" + ID];

            fs.writeFile(path.join(rootPath, 'database', body.user + '.json'), JSON.stringify(ideas), (err) => {
                if (err) {
                    console.error(err);
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.write("1");
                    return;
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write("0");
                }
                res.end();
            });
        }
    });
}
//get current time in specific format
function getCurrentTime() {
    let today = new Date();
    let hours = today.getHours() >= 10 ? today.getHours() : '0' + today.getHours();
    let minutes = today.getMinutes() >= 10 ? today.getMinutes() : '0' + today.getMinutes();
    let day = today.getDate() >= 10 ? today.getDate() : '0' + today.getDate();
    let month = today.getMonth() + 1;
    month = month >= 10 ? month : '0' + month;

    let hoursAndMin = hours + ':' + minutes + ' ';
    let dayMonthAndYear = day + '/' + month + '/' + today.getFullYear();
    return hoursAndMin + dayMonthAndYear;
}
//#endregion







