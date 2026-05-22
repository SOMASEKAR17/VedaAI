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
          console.log(`WebSocket client registered for assignment: ${registeredId}`);

          // Send acknowledgment
          ws.send(
            JSON.stringify({
              event: 'registered',
              payload: { assignmentId: registeredId },
            })
          );
        }
      } catch {
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

  wss.on('error', (error: Error) => {
    console.error('WebSocket server error:', error.message);
  });

  console.log('✅ WebSocket server initialized');
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
    // Fire-and-forget: never crash on WebSocket emission
  }
}

export function closeWebSocketServer(): Promise<void> {
  return new Promise((resolve) => {
    if (wss) {
      // Close all client connections
      clientRegistry.forEach((ws) => {
        try {
          ws.close();
        } catch {
          // Ignore close errors
        }
      });
      clientRegistry.clear();

      wss.close(() => {
        console.log('WebSocket server closed');
        resolve();
      });
    } else {
      resolve();
    }
  });
}
