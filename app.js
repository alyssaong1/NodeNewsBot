var restify = require('restify');
var builder = require('botbuilder');
var rp = require('request-promise');
var prompts = require('./prompts');
var keywords = require('./keywords');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
// You will need to replace process env... with your own app id and password
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// Replace this with your own bing news key
var BINGNEWSKEY = process.env.BINGNEWS_KEY;

var intents = new builder.IntentDialog();

//=========================================================
// Bots Dialogs
//=========================================================
// Regexes are checked before sending to LUIS (if you used LUIS) so that you don't unnecessarily waste calls
// Detects keywords in what the user says
intents.matches(keywords.hi, '/sayHi');
intents.matches(keywords.start, '/getstarted');
intents.matches(keywords.help, '/help');
intents.matches(keywords.searchnews, '/searchnews');
intents.matches(keywords.topnews, '/topnews');
intents.matches(keywords.trending, '/trending');
intents.matches(keywords.menu, '/menu');

intents.onDefault(builder.DialogAction.send("Hmm I'm not too sure what you're trying to say. Type 'help' to see what I can do."));

bot.dialog('/', intents);

bot.dialog('/sayHi', [
    function (session){
        session.endDialog(prompts.msgHi);
    }
]);

bot.dialog('/help', [
    function (session) {
        session.endDialog(prompts.msgHelp);
    }
]);

// Send a greeting, show help, then lastly show the menu
bot.dialog('/getstarted', [
    function (session, args, next){
        session.send(prompts.msgStart);
        next();
    }, function (session, results){
        session.beginDialog('/help');
    }, function (session, results){
        session.beginDialog('/menu');
    }
]);

bot.dialog('/menu', [
    function (session, args, next) {
        //send card message menu
        msg = new builder.Message(session)
            .attachments([
                new builder.HeroCard(session)
                    .title("Main Menu")
                    .subtitle("What would you like to do next?")
                    .images([
                        //Using this image: http://imgur.com/a/vl59A
                        builder.CardImage.create(session, "http://i.imgur.com/I3fYOM2.jpg")
                    ])
                    .buttons([
                        builder.CardAction.dialogAction(session, "topnews", null, "Top News"),
                        builder.CardAction.dialogAction(session, "searchnews", null, "Search News"),
                        builder.CardAction.dialogAction(session, "trending", null, "Get Trending")
                    ])
            ]);
        session.endDialog(msg);
    }
]);

// These "link" the menu buttons to the dialogs
bot.beginDialogAction("topnews", "/topnews");
bot.beginDialogAction("searchnews", "/searchnews");
bot.beginDialogAction("trending", "/trending");

bot.dialog('/topnews', [
    function (session){
        // Ask what category they want
        builder.Prompts.choice(session, prompts.promptCategory, prompts.choiceCategories);
    }, function (session, results, next){
        if (results.response && results.response.entity !== '(quit)') {
            //Show user that we're processing their request
            session.sendTyping();
            //Build the url
            var numResults = 10;
            var market = "en-US";
            var url = "https://api.cognitive.microsoft.com/bing/v5.0/news/?" 
                + "category=" + results.response.entity + "&count=" + numResults + "&mkt=" + market + "&originalImg=true";
            //Options for the request
            var options = {
                uri: url,
                headers: {
                    'Ocp-Apim-Subscription-Key': BINGNEWSKEY
                },
                json: true
            }
            //Make the request
            rp(options).then(function (body){
                sendTopNews(session, results, body);
            }).catch(function (err){
                console.log(err.message);
                session.send(prompts.msgError);
            }).finally(function () {
                session.endDialog();
            });
        } else {
            session.endDialog(prompts.msgCancel);
        }
    }
]);

function sendTopNews(session, results, body){
    session.send(prompts.msgTopNews, {category:results.response.entity});
    session.sendTyping();
    var allArticles = body.value;
    var cards = [];
    for (var i = 0; i < 10; i++){
        var article = allArticles[i];
        // Create a card for the article
        cards.push(new builder.HeroCard(session)
            .title(article.name)
            .subtitle(article.datePublished)
            .images([
                //handle if thumbnail is empty
                builder.CardImage.create(session, article.image.contentUrl)
            ])
            .buttons([
                builder.CardAction.dialogAction(session, "moredetails", article.description, "Short snippet"),
                builder.CardAction.openUrl(session, article.url, "Full article")
            ]));
    }
    var msg = new builder.Message(session)
        .textFormat(builder.TextFormat.xml)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(cards);
    session.send(msg);
}

bot.beginDialogAction("moredetails", "/moreDetails");

bot.dialog('/moreDetails', [
    function (session, args) {
        session.endDialog(args.data);
    }
]);

bot.dialog('/searchnews', [
    function (session){
        // Ask them to enter a topic they want news about
        builder.Prompts.text(session, prompts.promptSearchTopic);
    }, function (session, results, next){
        if (results.response && results.response !== 'quit') {
            session.sendTyping();
            var numResults = 10;
            var market = "en-US";
            var url = "https://api.cognitive.microsoft.com/bing/v5.0/news/search?q="
            + results.response + "&count=" + numResults + "&mkt=" + market + "&originalImg=true";
            //Options for the request
            var options = {
                uri: url,
                headers: {
                    'Ocp-Apim-Subscription-Key': BINGNEWSKEY
                },
                json: true
            }
            //Make the request
            rp(options).then(function (body){
                sendSearchNewsResults(session, results, body);
            }).catch(function (err){
                console.log(err.message);  
                session.send(prompts.msgError);
            }).finally(function () {
                session.endDialog();
            });
        } else {
            session.endDialog(prompts.msgCancel);
        }
    }
]);

function sendSearchNewsResults(session, results, body){
    session.send(prompts.msgSearchNews, { topic: results.response});
    session.sendTyping();
    var allArticles = body.value;
    var cards = [];
    // Some searches don't return 10, so make the upper limit the number of returned articles
    for (var i = 0; i < allArticles.length; i++){
        var article = allArticles[i];
        var cardImg;
        if (article.image) {
            cardImg = article.image.contentUrl;
        } else {
            // If there's no image provided with the article
            //http://imgur.com/a/vl59A
            cardImg = "http://i.imgur.com/7kYV6y5.jpg";
        }
        // Create a card for the article
        cards.push(new builder.HeroCard(session)
            .title(article.name)
            .subtitle(article.datePublished)
            .images([
                builder.CardImage.create(session, cardImg)
            ])
            .buttons([
                builder.CardAction.dialogAction(session, "moredetails", article.description, "Short snippet"),
                builder.CardAction.openUrl(session, article.url, "Full article")
            ]));
    }
    var msg = new builder.Message(session)
        .textFormat(builder.TextFormat.xml)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(cards);
    session.send(msg);
}

bot.dialog('/trending', [
    function (session, next){
        session.sendTyping();
        var numResults = 10;
        var market = "en-US";
        var url = "https://api.cognitive.microsoft.com/bing/v5.0/news/trendingtopics?mkt="
        + market + "&count=" + numResults;
        //Options for the request
        var options = {
            uri: url,
            headers: {
                'Ocp-Apim-Subscription-Key': BINGNEWSKEY
            },
            json: true
        }
        //Make the request
        rp(options).then(function (body){
            sendTrending(session, body);
        }).catch(function (err){
            console.log(err.message);  
            session.send(prompts.msgError);
        }).finally(function (){
            session.endDialog();
        });       
    }
]);

function sendTrending(session, body){
    session.send(prompts.msgTrending);
    session.sendTyping();
    var allArticles = body.value;
    var cards = [];
    for (var i = 0; i < 10; i++){
        var article = allArticles[i];
        // Create a card for the article
        cards.push(new builder.HeroCard(session)
            .title(article.name)
            .subtitle(article.query.text)
            .buttons([
                builder.CardAction.openUrl(session, article.webSearchUrl, "Search on web")
            ])
        );
    }
    var msg = new builder.Message(session)
        .textFormat(builder.TextFormat.xml)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(cards);
    session.send(msg);
}