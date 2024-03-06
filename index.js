// Initialize dotenv
require('dotenv').config();

const request = require('request');

const { Client, GatewayIntentBits } = require('discord.js')
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ]
})

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const channel = client.channels.cache.get(process.env.CHANNEL_ID)

    function getTransactions() {
        request(`https://api.whale-alert.io/v1/transactions?api_key=4dWraprhZ6wONpbymUZsNcucs6KntcDY&min_value=10000000&start=${Math.floor(Date.now() / 1000 - 360)}&limit=1`, function (error, response, body) {
            if (error) {
                console.log(error)
            }
    
            body = JSON.parse(body);

            var fromAddress = null;
            var toAddress = null;
            var amount = body['transactions'][0]['amount']
            var amount_usd = body['transactions'][0]['amount_usd']
            var symbol = body['transactions'][0]['symbol']
            var fromOwner = body['transactions'][0]['from']['owner']
            var toOwner = body['transactions'][0]['to']['owner']
      
            if (fromOwner === "unknown" || fromOwner === undefined) {
                fromAddress = "unknown wallet";
            }
            else {
                fromAddress = capitalizeFirstLetter(fromOwner)
            }
      
            if (toOwner === "unknown" || toOwner === undefined) {
                toAddress = "unknown wallet";
            }
            else {
                toAddress = capitalizeFirstLetter(toOwner)
            }
        
            channel.send("🚨 " + numberWithCommas(Math.round(amount)) + " " + symbol.toUpperCase() + " (" + numberWithCommas(Math.round(amount_usd)) + " USD) transferred from " + fromAddress + " to " + toAddress)
        });
    }

    getTransactions()
    setInterval(function () {
      getTransactions()
    }, 30000)
});

// Log in our bot
client.login(process.env.CLIENT_TOKEN);