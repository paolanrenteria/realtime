
var WebSocket = require('ws');
var Slack = require('slack-node');
var WebHooks = require('node-webhooks')


var webHooks = new WebHooks({
    db: './webHooksDB.json', // json file that store webhook URLs 
    httpSuccessCodes: [200, 201, 202, 203, 204], //optional success http status codes 
})

// Webhook for chat overflow that writes to Google Sheets
webHooks.add('overflowdata', 'https://hooks.zapier.com/hooks/catch/XXXXXXXXX').then(function(){
    // done 
    }).catch(function(err){
    console.log(err)
})

webHooks.add('overflowtier1', 'https://hooks.zapier.com/hooks/catch/XXXXXXXXX').then(function(){
    // done 
    }).catch(function(err){
    console.log(err)
})

// Get token here:
// https://www.zopim.com/oauth2/authorizations/new?response_type=token&client_id=XXXXXXXX&scope=read&redirect_uri=https%3A%2F%2Flocalhost

var ws_client = new WebSocket(
    'wss://rtm.zopim.com/stream', {
        headers: {
            'Authorization': 'Bearer ' + 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
        }
    }
);

var waitingtime = 0;
var incoming = 0;
var minutes = 0;


ws_client.on('open', function() {
    console.log('Successfully connected');
    ws_client.send(JSON.stringify(
    {
    topic: "chats.waiting_time_max",
    action: "subscribe"
    }))
    ws_client.send(JSON.stringify(
    {
    topic: "chats.incoming_chats",
    action: "subscribe"
    }))
});

ws_client.addEventListener('message', function(event) {
    console.log('Received message from server: ' + event.data);
    var message = JSON.parse(event.data);



//  ---------- THIS STORES THE VALUES IN A VARIABLE UNTIL RESET TO 0 AT THE ELSE ----------
    if(message.content) {
        if(message.content.data) {

            if( message.content.data.waiting_time_max == undefined || message.content.data.waiting_time_max == null) {
                console.log('Waiting time: ' + waitingtime + ' leave as is');
            }
            else {
                waitingtime = message.content.data.waiting_time_max
                console.log('Waiting time: ' + waitingtime + ' seconds');
            }

            if( message.content.data.incoming_chats == undefined) {
                console.log('Incoming chats: ' + incoming + ' leave as is');
            }
            else {
                incoming = message.content.data.incoming_chats
                console.log('Incoming chats: ' + incoming);
            }
            
        }
    }


//  ---------- THIS CHECKS CONDITIONS FOR SLACK TRIGGERS ----------

    if (waitingtime > 0) {

        if( waitingtime / 60 - minutes >= 1 ) {
            minutes++;
            console.log(minutes);

            if( minutes >= 1 && incoming == 2) {
                console.log('This would post because 2 incoming unassigned chats waiting for ' + minutes + ' minutes');

                webhookUri = "https://hooks.slack.com/services/XXXXXXXXX";

                slack = new Slack();
                slack.setWebhook(webhookUri);

                slack.webhook({
                    channel: "#chat",
                    username: "Overflow",
                    text: "<!here> Help! 2+ chats in queue."
                }, function(err, response) {
                console.log(response);
                });

                // Trigger Zapier webhook to write to google spreadsheet
                var d = new Date();
                webHooks.trigger('overflowdata', {data: {reason: '2+ unassigned in queue', timestamp: d}})

            }

            else if ( minutes == 5 ) {
                console.log('This would post to overflow channel because of 5 minute wait');
                console.log('Posting to Chat Overflow')
                // This posts to overflow channel
                webhookUri = "https://hooks.slack.com/services/XXXXXXXXX";

                slack = new Slack();
                slack.setWebhook(webhookUri);

                slack.webhook({
                    channel: "#chat_overflow",
                    username: "Overflow",
                    text: "<!here> Help! DCL overflow is maxed out."
                }, function(err, response) {
                console.log(response);
                });

                // Trigger Zapier webhook to write to google spreadsheet
                var d = new Date();
                webHooks.trigger('overflowdata', {data: {reason: '5 min wait time', timestamp: d}})

            }

            else if ( minutes <= 2 || (minutes == 1 && incoming < 2)) {
                // Today's date + day of week + hour
                var d = new Date();
                var n = d.getDay();
                var t = d.getHours();
                // Checking conditions for Vince T/W/F 8am-10:59am Pacific time    
                if ((n == 2 || n == 3 || n == 5) && (t >= 16 && t <= 18)) {
                    webHooks.trigger('overflowtier1', {data: {reason: 'vincent@looker.com', timestamp: d}})
                    console.log('This will ping Vince');
                }

                // Checking conditions for Sam T/R/F 11am-1:59pm Pacific time
                else if ((n == 2 || n == 4 || n == 5) && (t >= 19 && t <= 21)) {

                webHooks.trigger('overflowtier1', {data: {reason: 'sam@looker.com', timestamp: d}})
                console.log('This will ping Sam');
                }
                else {
                    console.log('do nothing')
                }
            }

            else {
                console.log('Post to chat channel because of 3 minutes wait or 4, or 6');
                webhookUri = "https://hooks.slack.com/services/XXXXXXXXXXXXXXXXXX";

                slack = new Slack();
                slack.setWebhook(webhookUri);

                slack.webhook({
                    channel: "#chat",
                    username: "Overflow",
                    text: "<!here> Help! 3+ min wait time."
                }, function(err, response) {
                console.log(response);
                });

                // Trigger Zapier webhook to write to google spreadsheet
                var d = new Date();
                webHooks.trigger('overflowdata', {data: {reason: '2+ unassigned in queue', timestamp: d}})
            }
        }


    }

    else {
        minutes = 0;
        waitingtime = 0;
        incoming = 0;
        console.log('This should happen when time is null: ' + minutes);
    }


    if (message.status_code !== 200) {
        console.log('Invalid status code ' + message.status_code);
        return;
    }



});

