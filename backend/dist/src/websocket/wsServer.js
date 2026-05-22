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
                    console.log(`WebSocket client registered for assignment: ${registeredId}`);
                    // Send acknowledgment
                    ws.send(JSON.stringify({
                        event: 'registered',
                        payload: { assignmentId: registeredId },
                    }));
                }
            }
            catch {
                // Silently ignore malformed messages
            }
        });
        ws.on('close', () => {
            if (registeredId) {
                clientRegistry.delete(registeredId);
                console.log(`WebSocket client disconnected for assignment: ${registeredId}`);
            }
        });
        ws.on('error', () => {
            // Silently handle errors
            if (registeredId) {
                clientRegistry.delete(registeredId);
            }
        });
    });
    wss.on('error', (error) => {
        console.error('WebSocket server error:', error.message);
    });
    console.log('✅ WebSocket server initialized');
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
        // Fire-and-forget: never crash on WebSocket emission
    }
}
function closeWebSocketServer() {
    return new Promise((resolve) => {
        if (wss) {
            // Close all client connections
            clientRegistry.forEach((ws) => {
                try {
                    ws.close();
                }
                catch {
                    // Ignore close errors
                }
            });
            clientRegistry.clear();
            wss.close(() => {
                console.log('WebSocket server closed');
                resolve();
            });
        }
        else {
            resolve();
        }
    });
}
//# sourceMappingURL=wsServer.js.map