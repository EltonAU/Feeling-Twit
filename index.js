var http = require('http');
var express = require('express');
var globalRequest = require('request');
var path = require('path');
var app = express();
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;

const pd = require('paralleldots');

// Be sure to set your API key
pd.apiKey = "";

app.use(express.static(path.join(__dirname + '/public')));

var server = http.createServer(app);
server.listen(3000);

app.set('port', 3000);

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/html/home.html'));
    // connectAndQuery();
});

var Twit = require('twit');

var semanticResult;
var semanticArray = [];

var config =
{
    userName: '', // update me
    password: '', // update me
    server: '', // update me
    options:
    {
        database: '' //update me
        , encrypt: true
    }
}

var T = new Twit({
    consumer_key: '',
    consumer_secret: '',
    access_token: '',
    access_token_secret: ''
});
//

var options = {
    method: 'POST',
    url: 'https://api.meaningcloud.com/sentiment-2.1',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form:
    {
        key: '',
        lang: 'en',
        txt: '..',
        txtf: 'plain'
    }
};

var params = {
    q: 'Halooo',
    count: 100
}
var isStreaming = false;
var counter = 0;
var stream;
app.get('/q', function (req, res) {
    if (stream == null) {
       
            connectAndResetSemantic(function () {
                startStream(req.query.keyword);
            });

        
    } else {
        stream.stop();
      
            connectAndResetSemantic(function () {
                startStream(req.query.keyword);
            });

       
    }
    res.send("ok");
});

function RemoveAt(a, str) {
    return str.slice(0, a) + str.slice(a + 1);
}

function startStream(query) {
    stream = T.stream('statuses/filter', { track: query, language: 'en' });
    var tempArray = [];
    stream.on('tweet', function (tweet) {
        var tweetText = tweet.text;
        if (tweetText.charAt(0) == '@') {
            tweetText = RemoveAt(0, tweetText);
        }
        tweetText = tweetText.replace(/["']/g, "")

        tempArray.push(tweetText);
        
        if (tempArray.length >= 10) {

            
            var removedItem = tempArray.splice(0, 10);
            var data = createQuery(removedItem);
            meaningcloudSemantic(data, function (positive, neutral, negative) {
                connectAndUpdateSemantic(positive, neutral, negative, function(){
                    //console.log("updated");
                });
               
            });
        }
    });
}

app.get('/u', function (req, res) {
    //res.send(String(counter));
    //console.log("REQUEST COME");
    try {
        connectAndGetSemantic(function (a, b, c) {
            console.log("SENT: + " + a + "," + b + "," + c)
            res.send(a + "," + b + "," + c);
        });
    }
    catch (exepction) {

    }


});

app.get('/stop', function (req, res) {
    
        stream.stop();
        connectAndResetSemantic(function () {
           
                res.send("ok");
        });
    
});

function meaningcloudSemantic(query, callback) {
    options.form.txt = query;

    globalRequest(options, function (error, response, body) {
        try {
            semanticResult = JSON.parse(body);
            if (semanticResult.status.code == 104) {
                return;
            }
            try {
                for (var i = 0; i < semanticResult.sentence_list.length; i++) {
                    semanticArray.push(semanticResult.sentence_list[i].score_tag);
                }
            } catch (exeption) {
              //  console.log( exeption);
                //console.log(body);
            }

            var positive = 1;
            var negative = 1;
            var neutral = 1;
            for (var i = 0; i < semanticArray.length; i++) {
                if (semanticArray[i] == "P+" || semanticArray[i] == "P") {
                    positive++;
                }
                else if (semanticArray[i] == "N+" || semanticArray[i] == "N") {
                    negative++;
                } else if(semanticArray[i] == "NEU"){
                    neutral++;
                }
            }
            callback(positive, neutral, negative);
        }
        catch (exeption) { }
    });
}
function createQuery(data) {
    var result = "";
    for (var i = 0; i < data.length; i++) {
        result += data[i] + ". ";
    }
    return result;
}

function connectAndGetSemantic(callback) {
    var connection = new Connection(config);
    connection.on('connect', function (err) {
        if (err) {
            console.log(err)
        }
        else {
            GetSemantic(connection, function (a, b, c) {
                callback(a, b, c);
                connection.close();
            });
        }
    }
    );
}

function GetSemantic(connection, callback) {
    var positive = 0;
    var neutral = 0;
    var negative = 0;
    var request = new Request(
        "SELECT * FROM semantic",
        function (err, rowCount, rows) {
            callback(positive, neutral, negative);
        }
    );

    request.on('row', function (columns) {
        columns.forEach(function (column) {
            if (column.metadata.colName == "positive") {
                positive = column.value;
            } else if (column.metadata.colName == "neutral") {
                neutral = column.value;
            } else {
                negative = column.value;
            }
        });
    });

    connection.execSql(request);

}

function connectAndResetSemantic(callback) {
    var connection = new Connection(config);
    connection.on('connect', function (err) {
        if (err) {
            console.log(err)
        }
        else {
            ResetSemantic(connection, function () {
                callback();
                connection.close();
            });
        }
    }
    );
}

function ResetSemantic(connection, callback) {
    var request = new Request(
        "UPDATE semantic SET positive=1, neutral=1, negative=1",
        function (err, rowCount, rows) {
            if (err) {
                console.log(err);
            } else {
               // console.log('semantic row reset');
                callback();
            }
        });

    connection.execSql(request);
}

function connectAndUpdateSemantic(positive, neutral, negative, callback) {
    var connection = new Connection(config);
    connection.on('connect', function (err) {
        if (err) {
            console.log(err)
        }
        else {
            UpdateSemantic(connection, positive, neutral, negative, function () {
                callback();
                connection.close();
            });
        }
    }
    );
}

function UpdateSemantic(connection, positive, neutral, negative, callback) {
    try {
        var request = new Request(
            "UPDATE semantic SET positive=positive+" + positive + ", neutral=neutral+" + neutral + ", negative=negative+" + negative,
            function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                } else {
                   // console.log(rowCount + ' semantic row(s) updated ');
                    callback();
                }
            });

        connection.execSql(request);
    } catch (exeption) {

    }

}



