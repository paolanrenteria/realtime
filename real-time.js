
// requires ws and slack-node
var WebSocket = require('ws');
var Slack = require('slack-node');


// Authenticates
var ws_client = new WebSocket(
    'wss://rtm.zopim.com/stream', {
        headers: {
            'Authorization': 'Bearer ' + '#####'
        }
    }
);

// Subscribes to zopim chat topic, i.e. chats.waiting_time_max
ws_client.on('open', function() {
    console.log('Successfully connected');
    ws_client.send(JSON.stringify({
        topic: "chats.waiting_time_max",
        action: "subscribe"
    }))
});

// Listens to streamed data
ws_client.addEventListener('message', function(event) {
    console.log('Received message from server: ' + event.data);
    var message = JSON.parse(event.data);
    // console.log(message);

// Checks for waiting time greater than or equal to 120 seconds = 2 min
    if(message.content) {
        if(message.content.data) {
            if(message.content.data.waiting_time_max >= 120) {
        console.log('Post to Slack')

// Posts to slack
        webhookUri = "https://hooks.slack.com/services/#####";
 
        slack = new Slack();
        slack.setWebhook(webhookUri);
 
        slack.webhook({
            channel: "#leads",
            username: "overflow",
            text: "<@here> Help please."
        }, function(err, response) {
        console.log(response); 
        });


    }}}

    if (message.status_code !== 200) {
        console.log('Invalid status code ' + message.status_code);
        return;
    }

});

