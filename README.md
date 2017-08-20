# NodeJS News Bot for Facebook Messenger

### [DEMO](https://www.messenger.com/t/1363604437002370)

There's not too many practical examples out there of Nodejs bots built using [Microsoft Bot Framework](https://dev.botframework.com/), so here's one. I've tried to leave comments to explain what's going on. 

I will be posting a full tutorial on how to build this from scratch for beginners along with explanations, so look out for updates (or you can follow [my Twitter](https://twitter.com/alyssaong1337)). 

**Feel free to leave feedback. I also take requests for bots! You can tweet me or email me at ongalyssa@outlook.com :)**

## Usage

### Running it locally:

Go and get a Bing Web Search API Subscription Key from [here](https://www.microsoft.com/cognitive-services/en-us/bing-web-search-api) and set BINGNEWSKEY in the code with your own subscription key. 

Install and open up [Bot Framework Emulator](https://docs.botframework.com/en-us/tools/bot-framework-emulator/). In the fields at the top, your local port should be 9000, emulator url should be http://localhost:9000/ and bot url should be http://localhost:3978/api/messages. 

Navigate to the folder with the bot in the command line. Run `npm install` to install the required node modules, then run `node app.js` to run the bot. You can now start chatting with the bot through the emulator.

### Running it using Messenger:

Go and get a Bing Web Search API Subscription Key from [here](https://www.microsoft.com/cognitive-services/en-us/bing-web-search-api) and set BINGNEWSKEY in the code with your own subscription key.

You will need to create a bot on [Microsoft Bot Framework](https://dev.botframework.com/) and replace the appId and appPassword in the code with your bot's appId and appPassword. You'll then need to add the Facebook Messenger channel and follow the instructions to configure your bot for Messenger (it includes making a Facebook page, etc). When configuring your bot for Messenger channel, you'll need to provide an endpoint for your bot when setting up the webhook in the Facebook developer portal. You can either publish the bot on a web host of your choice (e.g. Azure or Heroku), or use [ngrok](https://ngrok.com). Your webhook url in the Facebook developer portal can then be set to the /api/messages endpoint of your website or ngrok url. If you use ngrok, run `ngrok http -host-header=rewrite 9000` in the command prompt and then set up the webhook in Facebook.

I'll be posting a more detailed tutorial of this in future.

## Future Extensions

I'll be implementing the following features at some point in the future:
- Using [LUIS](https://www.luis.ai), Microsoft's NLP processing engine for advanced dialogs
- Daily notifications

## Contributing
Feel free to contribute to this project! Use the following guidelines:

1. Fork the repo on GitHub
2. Clone the project to your own machine
3. Commit changes to your own branch
4. Push your work back up to your fork
5. Submit a Pull request online so that I can review your change
