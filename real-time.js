
var WebSocket = require('ws');
var Slack = require('slack-node');


// Connects and authenticates to websocket
var ws_client = new WebSocket(
    'wss://rtm.zopim.com/stream', {
        headers: {
            'Authorization': 'Bearer ' + '#########'
        }
    }
);

// Subscribes to chat waiting time max
ws_client.on('open', function() {
    console.log('Successfully connected');
    ws_client.send(JSON.stringify({
    topic: "chats.waiting_time_max",
    action: "subscribe"
}))

});


// Sets minutes variable to 0 and prints to console
var minutes = 0;
console.log(minutes);


// Listens to data
ws_client.addEventListener('message', function(event) {
    console.log('Received message from server: ' + event.data);
    var message = JSON.parse(event.data);
    console.log('These are the minutes: ' + minutes);


// Checks if waiting time max exceeds 0
    if(message.content) {
        if(message.content.data) {
            if(message.content.data.waiting_time_max > 0) {

                // Triggers when a customer has been waiting for 1.5 minutes, 3 minutes and so on
                if (message.content.data.waiting_time_max / 90 - minutes >= 1) {
                    minutes++;
                    console.log(minutes);

                    // This posts to the overflow channel in slack when we ping a second time and a fourth time (specifically, at 3 min and 6 min)
                    if (minutes == 2 || minutes == 4) {
                        console.log('Posting to Chat Overflow')
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

                    // For all other pings, post to chat channel. (i.e. 1.5 min, 4.5 min, etc)
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

                // If customer hasn't been waiting for 1.5 min, 3 min, but is greater than 0, return and check again
                else {
                    console.log(message.content.data.waiting_time_max);
                    return;
                }
            }

            // If waiting time is null, set minutes variable to 0
            else {
                minutes = 0;
                console.log('This should happen when time is null: ' + minutes);
            }    
        }
    }

    // If we can't connect successfully, return invalid status code
    if (message.status_code !== 200) {
        console.log('Invalid status code ' + message.status_code);
        return;
    }

});


  
 
