//#region constant variables
const express = require('express');
const bodyParser = require("body-parser");
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const rootPath = path.dirname(require.main.filename);
const server = express();
const http = require('http');
const Twit = require('twitter');
const config = require('./config');
//#endregion

//#region server pluggin
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(session({ secret: "dadsfekm3knweq$@eS", cookie: { maxAge: 30 * 60 * 1000 }, resave: false, saveUninitialized: false }));
//#endregion

//#region routes
//default routing of applicationn, redirects to login screen
server.get('/', function (req, res) {
    res.status(401).redirect('/login');
});
//register page of application
server.get('/register', function (req, res) {
    res.sendFile(path.join(rootPath + '/users' + '/register.html'));
});
//login page of application
server.get('/login', function (req, res) {
    res.sendFile(path.join(rootPath + '/users' + '/login.html'));
});
//endpoint that creates new user and inserts his data to DB
server.post('/users/register', function (req, res) {
    createUserIfNotExist(req, res);
});
//authenticates user and saves data in current session
server.post('/users/login', function (req, res) {
    authenticateUser(req, res);
});
//ideas page of App returned if authentication passed
server.get('/ideas.html', function (req, res) {
    if (!req.session.user) {
        return res.status(401).redirect('/login');
    } else {
        return res.sendFile(path.join(rootPath, 'users', 'ideas.html'));
    }
});
//monitoring page of App returned if auhtentication passed
server.get('/monitoring.html', function (req, res) {
    if (!req.session.user) {
        return res.status(401).redirect('/login');
    } else {
        return res.sendFile(path.join(rootPath, 'users', 'monitoring.html'));
    }
});
//twitter page of App returned if authentication passed
server.get('/twitter.html', function (req, res) {
    if (!req.session.user) {
        return res.status(401).redirect('/login');
    } else {
        return res.sendFile(path.join(rootPath, 'users', 'twitter.html'));
    }
});
//email page of App returned if auhtentication passed
server.get('/email.html', function (req, res) {
    if (!req.session.user) {
        return res.status(401).redirect('/login');
    } else {
        return res.sendFile(path.join(rootPath, 'users', 'email.html'));
    }
});
//download txt file of users ideas list as my-ideas.txt
server.get('/download', function (req, res) {
    if (!req.session.user) {
        return res.status(401).redirect('/login');
    } else {
        return res.download(path.join(rootPath, 'database', req.session.user + '.json'), 'v');
    }
});
//endpoint that returns current user name that was registrated at the beginning
server.get('/name', function (req, res) {
    res.send(req.session.name);
    res.end();
});
//return javascript file code of ideas.html page
server.get('/static/ideas.js', function (req, res) {
    loadJS(res, 'users\\ideas.js');
});
//return javascript file code of login.html page
server.get('/static/login.js', function (req, res) {
    loadJS(res, 'users\\login.js');
});
//return javascript file code of register.html page
server.get('/static/register.js', function (req, res) {
    loadJS(res, 'users\\register.js');
});
//return javascript file code of monitoring.html page
server.get('/static/monitoring.js', function (req, res) {
    loadJS(res, 'users\\monitoring.js');
});
//return javascript file code of twitter.html page
server.get('/static/twitter.js', function (req, res) {
    loadJS(res, 'users\\twitter.js');
});
//return javascript file code of email.html page
server.get('/static/email.js', function (req, res) {
    loadJS(res, 'users\\email.js');
});
//return css file of global css
server.get('/static/styles.css', function (req, res) {
    res.sendFile(path.join(rootPath, 'users', 'styles.css'));
});
//returns css of error.html page
server.get('/static/error.css', function (req, res) {
    res.sendFile(path.join(rootPath, 'users', 'error.css'));
});
//return all ideas of current user. 
//Perfomrs POST request to persist server, when response returned, json with ideas returned to client
server.get('/ideas', function (req, res) {
    let data = {};
    data.user = req.session.user;

    let options = {
        host: 'localhost',
        port: 8080,
        path: '/data/ideas',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };

    let request = http.request(options, function (response) {
        let ideas = '';
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            ideas += chunk;
        });
        response.on('end', function () {
            res.send(ideas);
        })
    });
    request.write(JSON.stringify(data));
    request.end();
});
//adds a new idea of user to DB.
//Perform PUT request to persist server and returns to a client response if succeded/failed
server.put('/idea', function (req, res) {
    let data = {};
    data.user = req.session.user;
    data.idea = req.body.idea;

    let options = {
        host: 'localhost',
        port: 8080,
        path: '/data/persist',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
    };

    let request = http.request(options, function (response) {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            res.send(body);
        })
    });
    request.write(JSON.stringify(data));
    request.end();
});
//deletes specific user idea from DB.
//Performs DELETE request from persist.js server and then returns response to client
server.delete('/idea', function (req, res) {
    let data = {};
    data.user = req.session.user;
    data.id = req.body.id;
    data = JSON.stringify(data);

    let options = {
        host: 'localhost',
        port: 8080,
        path: '/data/clean',
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    let request = http.request(options, function (response) {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            res.send(body);
        })
    });
    request.write(data);
    request.end();
});
//update specific user idea
//Performs POST request to persist server and returns response to client
server.post('/idea', function (req, res) {
    let data = {};
    data.user = req.session.user;
    data.id = req.body.id;
    data.idea = req.body.idea;

    let options = {
        host: 'localhost',
        port: 8080,
        path: '/data/persist',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };

    let request = http.request(options, function (response) {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            res.send(body);
        })
    });
    request.write(JSON.stringify(data));
    request.end();
});
//Searches for tweet according some pattern from the user
server.post('/tweets', function (req, res) {
    getTweets(req, res);
});
//sends email with ideas that were selected by the user
server.post('/email', function (req, res) {
    sendEmail(req, res);
});
//log outs and destroys current session
server.get('/logout', function (req, res) {
    req.session.destroy();
    res.status(401).redirect('/login');
});

server.all('*', function (req, res) {
    res.status(404).sendFile(path.join(rootPath + '/users' + '/error.html'));
});
//#endregion

//#region private methods
//creates user if doesn't exist. Adds the user record to userDB.json file
//And also creates json file (user.json) that stores all user ideas
function createUserIfNotExist(req, res) {
    let name = req.body.name;
    let userName = req.body.user;
    let password = req.body.pass;

    fs.readFile(path.join(rootPath, 'database', 'userDB.json'), function (err, data) {
        if (err) {
            console.error(err);
            res.writeHead(404, { 'Content-Type': 'text/html' });
        } else {
            let userData = JSON.parse(data).userData;
            let currentUser = {};

            for (let index = 0; index < userData.length; index++) {
                currentUser.userName = userData[index].userName;
                currentUser.password = userData[index].password;
                currentUser.name = userData[index].name;

                if (currentUser.userName === userName && currentUser.password === password) {
                    res.writeHead(403, { 'Content-Type': 'text/html' });
                    res.write("0");
                    return;
                } else if (currentUser.userName === userName) {
                    res.writeHead(402, { 'Content-Type': 'text/html' });
                    res.write("1");
                    return;
                }
            }
            addUserToDB(req, res);
            createUsersIdeaDB(req, res);
        }
    })
}
//method that is used by createUserIfNotExist function
function addUserToDB(req, res) {
    fs.readFile(path.join(rootPath, 'database', 'userDB.json'), function (err, data) {
        if (err) {
            console.error(err);
            res.writeHead(404, { 'Content-Type': 'text/html' });
        } else {
            let userData = JSON.parse(data);
            userData.userData.push({ "userName": req.body.user, "password": req.body.pass, "name": req.body.name });

            fs.writeFile(path.join(rootPath, 'database', 'userDB.json'), JSON.stringify(userData), (err) => {
                if (err) {
                    console.error(err);
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write("1");
                }
                res.end();
            });
        }
    });
}
//method that is used by createUserIfNotExist function
function createUsersIdeaDB(req, res) {
    let json = { "1": [req.body.name + '\'s first idea', getCurrentTime()] };
    fs.writeFile(path.join(rootPath, 'database', req.body.user + '.json'), JSON.stringify(json), (err) => {
        if (err) {
            console.error(err);
            res.writeHead(404, { 'Content-Type': 'text/html' });
        }
    });
}
//searched in DB and auhtenticates user
function authenticateUser(req, res) {
    let userName = req.body.user;
    let password = req.body.pass;

    fs.readFile(path.join(rootPath, 'database', 'userDB.json'), function (err, data) {
        if (err) {
            console.error(err);
            res.writeHead(404, { 'Content-Type': 'text/html' });
        } else {
            let userData = JSON.parse(data).userData;
            let currentUser = {};

            for (let index = 0; index < userData.length; index++) {
                currentUser.userName = userData[index].userName;
                currentUser.password = userData[index].password;
                currentUser.name = userData[index].name;

                if (currentUser.userName === userName && currentUser.password === password) {
                    req.session.user = userName;
                    req.session.name = currentUser.name;
                    break;
                }
            }
            res.redirect(301, '/ideas.html');
        }
        res.end();
    })
}
//loads a specific javascript file with a relative path as a parameter
function loadJS(res, relativePath) {
    fs.readFile(path.join(rootPath, relativePath), function (err, jsFile) {
        if (err) {
            console.error(err);
            res.writeHead(404, { 'Content-Type': 'text/html' });
        } else {
            res.writeHead(200, { 'Content-Type': 'text/javascript' });
            res.end(jsFile, 'UTF-8');
        }
    });
}
//returns current time in specific format
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
//uses twitter web api to search to specific tweet
function getTweets(req, res) {
    let twitter = new Twit(config);
    let twitData = {};

    let params = {
        q: req.body.idea,
        count: 1,
        tweet_mode: "extended"
    };

    twitter.get('search/tweets', params, function (err, data) {
        if (data.statuses.length == 0) {
            res.send({});
            return;
        }

        let tweetsInfo = data.statuses;
        let text = tweetsInfo[0].full_text;
        let screen_name = text.match(/@(.*):/);

        if (screen_name == null) {
            res.send({});
            return;
        }
        screen_name = screen_name[0];
        screen_name = screen_name.substring(0, screen_name.length - 1);
        text = text.substring(screen_name.length + 5);

        twitData.text = text;
        twitData.screen_name = screen_name;

        twitter.get('users/show', { screen_name: screen_name }, function (err, data) {
            twitData.name = data.name;
            twitData.location = data.location;
            twitData.description = data.description;
            twitData.followers_count = data.followers_count;
            twitData.profile_image_url = data.profile_image_url;
            twitData.profile_banner_url = data.profile_banner_url;
            res.send(twitData);
        });
    });
}
//sends email to specific email address and specific boyd content
function sendEmail(req, res) {
    let nodemailer = require('nodemailer');
    let ideas = req.body.ideas;
    let text = "";

    for (let index = 0; index < ideas.length; index++) {
        text += ideas[index] + "\r\n";
    }

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'noideaidcapp@gmail.com',
            pass: 'qeradfzcv'
        }
    });

    let options = {
        from: 'noideaidcapp@gmail.com',
        to: req.body.email,
        subject: 'Email From NoIdea Application',
        text: text
    };

    transporter.sendMail(options, function (error) {
        if (error) {
            console.log(error);
            res.status(404).end();
        } else {
            res.status(200).end();
        }
    });

}
//the main server listens on port 8888 and log message about it
server.listen(8888);
console.log('Main-Server is listeningon port: 8888');