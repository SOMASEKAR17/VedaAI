import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { WSMessage } from '../types';

const clientRegistry = new Map<string, WebSocket>();

let wss: WebSocketServer | null = null;

export function initWebSocketServer(server: HTTPServer): WebSocketServer {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    let registeredId: string | null = null;

    ws.on('message', (data: Buffer | string) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());

        if (message.type === 'register' && message.assignmentId) {
          registeredId = message.assignmentId;
          clientRegistry.set(registeredId, ws);


          ws.send(
            JSON.stringify({
              event: 'registered',
              payload: { assignmentId: registeredId },
            })
          );
        }
      } catch {
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

  wss.on('error', (error: Error) => {

  });


  return wss;
}

export function emitToClient(
  assignmentId: string,
  event: string,
  payload: Record<string, unknown>
): void {
  try {
    const client = clientRegistry.get(assignmentId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event, payload }));
    }
  } catch {
  }
}

export function closeWebSocketServer(): Promise<void> {
  return new Promise((resolve) => {
    if (wss) {
      clientRegistry.forEach((ws) => {
        try {
          ws.close();
        } catch {
        }
      });
      clientRegistry.clear();

      wss.close(() => {

        resolve();
      });
    } else {
      resolve();
    }
  });
}
