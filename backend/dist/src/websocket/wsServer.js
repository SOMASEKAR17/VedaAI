"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebSocketServer = initWebSocketServer;
exports.emitToClient = emitToClient;
exports.closeWebSocketServer = closeWebSocketServer;
const ws_1 = require("ws");
const clientRegistry = new Map();
let wss = null;
function initWebSocketServer(server) {
    wss = new ws_1.WebSocketServer({ server });
    wss.on('connection', (ws) => {
        let registeredId = null;
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.type === 'register' && message.assignmentId) {
                    registeredId = message.assignmentId;
                    clientRegistry.set(registeredId, ws);
                    ws.send(JSON.stringify({
                        event: 'registered',
                        payload: { assignmentId: registeredId },
                    }));
                }
            }
            catch {
            }
        });
        ws.on('close', () => {
            if (registeredId) {
                clientRegistry.delete(registeredId);
            }
        });
        ws.on('error', () => {
            if (registeredId) {
                clientRegistry.delete(registeredId);
            }
        });
    });
    wss.on('error', (error) => {
    });
    return wss;
}
function emitToClient(assignmentId, event, payload) {
    try {
        const client = clientRegistry.get(assignmentId);
        if (client && client.readyState === ws_1.WebSocket.OPEN) {
            client.send(JSON.stringify({ event, payload }));
        }
    }
    catch {
    }
}
function closeWebSocketServer() {
    return new Promise((resolve) => {
        if (wss) {
            clientRegistry.forEach((ws) => {
                try {
                    ws.close();
                }
                catch {
                }
            });
            clientRegistry.clear();
            wss.close(() => {
                resolve();
            });
        }
        else {
            resolve();
        }
    });
}
//# sourceMappingURL=wsServer.js.map