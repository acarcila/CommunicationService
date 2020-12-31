import * as express from "express";
import * as http from "http";
import * as WebSocket from "ws";

const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

var connections: { [unit: string]: any } = {};

const topics: { [unit: string]: any } = {
    HANDSHAKE: (ws: WebSocket, body: any) => handshake(ws, body),
    MESSAGE_TO_ALL: (ws: WebSocket, body: any) => messageToAll(ws, body),
};

wss.on("connection", (ws: WebSocket) => {
    ws.send("Hi there, I am a WebSocket server");

    ws.on("message", (message: string) => {
        var response = {
            status: 200,
            body: {},
        };
        try {
            const data = JSON.parse(message);
            const topic: string = data.topic;
            if(check){

            }
            const response = topics[topic](ws, data.body);
            ws.send(JSON.stringify(response));
        } catch (error: any) {
            console.log(error.message);
            ws.send(JSON.stringify(error.message));
        }
    });
});

const handshake = (ws: WebSocket, body: any): any | never => {
    const connectionID = body.connectionID;
    if (!connectionID) {
        const error = {
            status: 400,
            code: 'INCOMPLETE_DATA',
            message: 'incomplete data'
        };
        throw new Error(JSON.stringify(error));
    }

    var response = {
        message: '',
    }

    if (body.type === "admin") {
        connections[connectionID] = {
            ...connections[connectionID],
            admin: ws,
        };
        response = {
            message: `Connected as admin in room: ${connectionID}`,
        };

        return response;
    }

    if (!connections[connectionID].clients) {
        connections[connectionID] = {
            ...connections[connectionID],
            clients: []
        };
    }
    connections[connectionID].clients.push(ws);

    response = {
        message: `Connected as client in room: ${connectionID}`,
    };

    console.log(response);
    return response;
};

const messageToAll = (ws: WebSocket, body: any): any | never => {
    const connectionID = body.connectionID;
    const payload = body.payload;
    
    if (!connectionID || !payload) {
        const error = {
            status: 400,
            code: 'INCOMPLETE_DATA',
            message: 'incomplete data'
        };
        throw new Error(JSON.stringify(error));
    }

    var response = {
        status: 200,
        body: {},
    };

    if()
    {
        connections[connectionID].clients.forEach((client: WebSocket) => {
            console.log("client", client);
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(payload));
            }
        });
    }

    console.log("connections", connections[connectionID]);
    if (connections[connectionID].admin !== ws && connections[connectionID].admin.readyState === WebSocket.OPEN) {
        console.log("admin", connections[connectionID].admin);
        connections[connectionID].admin.send(JSON.stringify(payload));
    }

    response = {
        ...response,
        body: {
            message: 'Message sent to everyone',
        },
    };

    return response;
};

//start our server
server.listen(5001, () => {
    console.log(`Server started on port 5001`);
});
