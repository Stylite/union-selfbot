const settings = require("./settings.json")
const WebSocket = require('ws');
const bash = require('child_process')
const auth = Buffer.from(settings.login).toString('base64'); // Colon needs to be present
const ws = new WebSocket('ws://union.serux.pro:2082', {
    headers: {
        'Authorization': `Basic ${auth}`
    }
});

ws.on('open', () => {
    console.log('Opened connection!');
});

ws.on('close', (code, reason) => {
    console.log(code, reason);
});

ws.on('error', (err) => {
    console.log(err);
});

const prefix = settings.prefix;

ws.on('message', (msg) => {
    const json = JSON.parse(msg);

    if (json.op !== 3) {
        return;
    }

    const content = json.d.content;

    if (!content.startsWith(prefix)) {
        return;
    }

    const sender = json.d.author;
    const user = settings.user;
    const server = json.d.server;
    const command = content.substring(1).split(' ')[0].toLowerCase();
    const args = content.split(' ').slice(1).join(' ');
    

    if (command === 'hello') {
	if (sender !== user) {
		return;
	}
        send(server, `Hello, William!`);
    }

    if (command === 'time') {
	if (sender !== user) {
		return;
	}
        send(server, `The time in United States is ${new Date().toGMTString()}`);
    }

    if (command === 'repeatafterme') {
	if (sender !== user) {
		return;
	}
        send(server, args);
    }

    if (command === 'help') {
        if (sender !== user) {
            return;
        }
            const help = "Based off of Kromatic's base bot || Commands: hello, time, eval"
            send(server, help);
        }   

    if (command === 'eval') {
        if (sender !== user) {
            return send(server, 'You can\'t use this!');
        }
        try {
            const res = eval(args);
            send(server, res);
        } catch(e) {
            send(server, `Fuck! An error\n\n${e.message}`);
        }
        
    }

});

function send(server, content) {
    const payload = {
        op: 7,
        d: {
            server,
            content
        }
    }
    
    ws.send(JSON.stringify(payload));
}

