
var WebSocket = require('ws');
var Slack = require('slack-node');


var ws_client = new WebSocket(
    'wss://rtm.zopim.com/stream', {
        headers: {
            'Authorization': 'Bearer ' + '#########'
        }
    }
);

ws_client.on('open', function() {
    console.log('Successfully connected');
    ws_client.send(JSON.stringify({
    topic: "chats.waiting_time_max",
    action: "subscribe"
}))

});


var minutes = 0;
console.log(minutes);


ws_client.addEventListener('message', function(event) {
    console.log('Received message from server: ' + event.data);
    var message = JSON.parse(event.data);
    console.log('These are the minutes: ' + minutes);

    // console.log(message);

    // Checks for data returned for agents invisible
    if(message.content) {
        if(message.content.data) {
            if(message.content.data.waiting_time_max > 0) {

                if (message.content.data.waiting_time_max / 90 - minutes >= 1) {
                    minutes++;
                    console.log(minutes);


                    if (minutes == 2 || minutes == 4) {
                        console.log('Posting to Chat Overflow')
                        // This posts to overflow channel
                        webhookUri = "https://hooks.slack.com/services/#####";

                        slack = new Slack();
                        slack.setWebhook(webhookUri);

                        slack.webhook({
                            channel: "#chat_overflow",
                            username: "Overflow",
                            text: "<!here> Help, please!"
                        }, function(err, response) {
                        console.log(response);
                        });
                    }

                    // Else, post to chat channel 
                    else {
                        console.log('Posting to Chat')

                        webhookUri = "https://hooks.slack.com/services/#####";

                        slack = new Slack();
                        slack.setWebhook(webhookUri);

                        slack.webhook({
                            channel: "#chat",
                            username: "Overflow",
                            text: "<!here> Help, please!"
                        }, function(err, response) {
                        console.log(response);
                        });
                    }

                }
                else {
                    console.log(message.content.data.waiting_time_max);
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


  
 
