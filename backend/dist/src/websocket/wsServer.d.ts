import { Server as HTTPServer } from 'http';
import { WebSocketServer } from 'ws';
export declare function initWebSocketServer(server: HTTPServer): WebSocketServer;
export declare function emitToClient(assignmentId: string, event: string, payload: Record<string, unknown>): void;
export declare function closeWebSocketServer(): Promise<void>;
//# sourceMappingURL=wsServer.d.ts.map