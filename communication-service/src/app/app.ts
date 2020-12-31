import * as express from "express";
import * as http from "http";
import * as WebSocket from "ws";
import WSController from "../ws/ws.controller";

export default class Application {
    private wss: WebSocket.Server;
    private server: http.Server;
    private port: number;
    constructor(port: number, wsController: WSController) {
        this.port = port;
        const app = express();
        //initialize a simple http server
        this.server = http.createServer(app);

        //initialize the WebSocket server instance
        this.wss = new WebSocket.Server({ server: this.server });

        this.handleMessage(wsController);
    }

    private handleMessage = (wsController: WSController) => {
        this.wss.on("connection", wsController.handleMessage);
    }

    public start = () => {
        this.server.listen(this.port, () => console.log(`Server started on port ${this.port}`));
}
}