
var WebSocket = require('ws');
var Slack = require('slack-node');



var ws_client = new WebSocket(
    'wss://rtm.zopim.com/stream', {
        headers: {
            'Authorization': 'Bearer ' + 'XXXXXXXXXXXXXX'
        }
    }
);

ws_client.on('open', function() {
    console.log('Successfully connected');
    ws_client.send(JSON.stringify({
    topic: "chats.chat_duration_max",
    action: "subscribe"
}))

});


var minutes = 0;
console.log(minutes);


ws_client.addEventListener('message', function(event) {
    console.log('Received message from server: ' + event.data);
    var message = JSON.parse(event.data);
    // console.log('These are the minutes: ' + minutes);

    // console.log(message);

    // Checks if max duration is > 55 minutes 
    if(message.content) {
        if(message.content.data) {
            if(message.content.data.chat_duration_max > 3300) {

                if (message.content.data.chat_duration_max / 3600 - minutes >= 1 && message.content.data.chat_duration_max / 3600 - minutes < 2) {
                    minutes++;
                    console.log(minutes);

                        console.log('Posting to Leads')
                        // This posts to overflow channel
                        webhookUri = "https://hooks.slack.com/services/XXXXXX";

                        slack = new Slack();
                        slack.setWebhook(webhookUri);

                        slack.webhook({
                            channel: "#chat",
                            username: "Long Chat Alert",
                            text: "<!subteam^id|name> A chat has gone over 60 minutes."
                        }, function(err, response) {
                        console.log(response);
                        });
                

                }
                else {
                    console.log(message.content.data.chat_duration_max);
                    return;
                }
            }
            else {
                minutes = 0;
                console.log('This should happen when time is null: ' + minutes);
            }    
        }
    }




    if (message.status_code !== 200) {
        console.log('Invalid status code ' + message.status_code);
        return;
    }

});


  
 
