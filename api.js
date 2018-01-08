var sqlite3 = require('sqlite3').verbose();
var path = require('path');
var dbPath = path.resolve(__dirname, 'urls.db');
var db = new sqlite3.Database(dbPath);

db.run("CREATE TABLE IF NOT EXISTS shortURLs (name TEXT, time INTEGER, targets TEXT)");

var express = require('express');
var bodyParser = require('body-parser');
var useragent = require('express-useragent');
var restapi = express();

restapi.use(bodyParser.json({ type: 'application/json' }));
restapi.use(useragent.express());

restapi.get('/list', function(req, res) {
  db.all("SELECT name, time, targets FROM shortURLs", function(err, rows) {
    var list = [];
    rows.forEach(function(row) {
      var entry = {
        shortURL: row.name,
        timeSinceCreation: Math.floor(Date.now()/1000) - row.time,
        targets: JSON.parse(row.targets)
      };
      list.push(entry);
    });
    res.send(list);
  });
});

restapi.get('/:shortURL', function(req, res){
  if(req.params.shortURL!=='list') {
    var shortURL = '/' + req.params.shortURL;
    var isMobile = req.useragent.isMobile;
    var isTablet = req.useragent.isTablet;
    var isDesktop = req.useragent.isDesktop;
    var device = isMobile ? "mobile" : (isTablet ? "tablet" : (isDesktop ? "desktop" : "other"));

    db.get("SELECT targets FROM shortURLs WHERE name = ?", shortURL, function(err, row) {
      if(row!==undefined) {
        var targArray = JSON.parse(row.targets);
        var long;
        var defaultURL;

        targArray.forEach(function(target, index, targArray) {
          if(target.device==='default') {
            defaultURL = target.longURL;
          }

          if(target.device===device) {
            long = target.longURL;
            target.redirects++;
            targArray[index] = target;
            db.run("UPDATE shortURLs SET targets = ? WHERE name = ?", JSON.stringify(targArray), shortURL);
          }
        });

        if(long!==undefined) {
          res.redirect(long);
        } else {
          targArray[0].redirects++;
          db.run("UPDATE shortURLs SET targets = ? WHERE name = ?", JSON.stringify(targArray), shortURL);
          res.redirect(defaultURL);
        }
      }
    });
  }
});

restapi.post('/', function(req, res){
    var longName = req.body.URL;
    var skip = true;
    var num = false;
    var shortName = '';
    for(var i=0; i < longName.length; i++) {
      if(skip) {
        if(num) {
          shortName += Math.floor(Math.random()*10);
        } else {
          shortName += longName[i];
        }
        num = !num;
      }
      skip = !skip;
    }
    var time = Math.floor(Date.now()/1000);
    var target = {
      longURL: longName,
      device: 'default',
      redirects: 0
    }
    var targArray = JSON.stringify([target]);
    db.run("INSERT INTO shortURLs (name, time, targets) VALUES (?, ?, ?)", shortName, time, targArray);
    res.send(shortName);
});

restapi.post('/configure', function(req, res){
    var shortURL = req.body.shortURL;
    var targetURL = req.body.target;
    var device = req.body.device;
    var newTarget = {
      longURL: targetURL,
      device: device,
      redirects: 0
    }

    db.get("SELECT targets FROM shortURLs WHERE name = ?", shortURL, function(err, row) {
      var targArray = JSON.parse(row.targets);
      targArray.push(newTarget);
      db.run("UPDATE shortURLs SET targets = ? WHERE name = ?", JSON.stringify(targArray), shortURL);
    });
    res.end();
});



restapi.listen(5667);

console.log("API hosted at http://localhost:5667/");
