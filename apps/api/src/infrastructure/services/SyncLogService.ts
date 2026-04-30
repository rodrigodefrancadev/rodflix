import { EventEmitter } from 'events';

export type LogType = 'info' | 'success' | 'warn' | 'error';

export interface LogMessage {
  message: string;
  type: LogType;
  timestamp: string;
}

class SyncLogService extends EventEmitter {
  private static instance: SyncLogService;

  private constructor() {
    super();
  }

  public static getInstance(): SyncLogService {
    if (!SyncLogService.instance) {
      SyncLogService.instance = new SyncLogService();
    }
    return SyncLogService.instance;
  }

  public log(message: string, type: LogType = 'info'): void {
    const logMessage: LogMessage = {
      message,
      type,
      timestamp: new Date().toISOString(),
    };
    
    console.log(`[SyncLog][${type.toUpperCase()}] ${message}`);
    this.emit('log', logMessage);
  }
}

export const syncLogService = SyncLogService.getInstance();
