import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private connectionStateSignal = signal<signalR.HubConnectionState>(signalR.HubConnectionState.Disconnected);
  private reconnectAttemptsSignal = signal<number>(0);

  connectionState = this.connectionStateSignal.asReadonly();
  reconnectAttempts = this.reconnectAttemptsSignal.asReadonly();
  isConnected = signal<boolean>(false);

  private leaderboardUpdateCallbacks: Array<(competitionCode: string) => void> = [];
  private matchUpdateCallbacks: Array<(matchId: string) => void> = [];

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    const hubUrl = environment.apiUrl.replace('/api', '') + '/predictionhub';

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          this.reconnectAttemptsSignal.set(retryContext.previousRetryCount + 1);
          if (retryContext.previousRetryCount < 5) {
            return 2000;
          } else if (retryContext.previousRetryCount < 10) {
            return 5000;
          } else {
            return 10000;
          }
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('LeaderboardUpdated', (competitionCode: string) => {
      console.log('SignalR: Leaderboard updated for competition', competitionCode);
      this.leaderboardUpdateCallbacks.forEach(callback => callback(competitionCode));
    });

    this.hubConnection.on('MatchUpdated', (matchId: string) => {
      console.log('SignalR: Match updated', matchId);
      this.matchUpdateCallbacks.forEach(callback => callback(matchId));
    });

    this.hubConnection.onclose((error) => {
      console.log('SignalR: Connection closed', error);
      this.connectionStateSignal.set(signalR.HubConnectionState.Disconnected);
      this.isConnected.set(false);
    });

    this.hubConnection.onreconnecting((error) => {
      console.log('SignalR: Reconnecting...', error);
      this.connectionStateSignal.set(signalR.HubConnectionState.Reconnecting);
      this.isConnected.set(false);
    });

    this.hubConnection.onreconnected((connectionId) => {
      console.log('SignalR: Reconnected', connectionId);
      this.connectionStateSignal.set(signalR.HubConnectionState.Connected);
      this.isConnected.set(true);
      this.reconnectAttemptsSignal.set(0);
    });
  }

  async startConnection(): Promise<void> {
    if (!this.hubConnection) {
      this.initializeConnection();
    }

    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.hubConnection!.start();
      console.log('SignalR: Connection started successfully');
      this.connectionStateSignal.set(signalR.HubConnectionState.Connected);
      this.isConnected.set(true);
      this.reconnectAttemptsSignal.set(0);
    } catch (error) {
      console.error('SignalR: Connection failed', error);
      this.connectionStateSignal.set(signalR.HubConnectionState.Disconnected);
      this.isConnected.set(false);
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  async stopConnection(): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.stop();
        console.log('SignalR: Connection stopped');
        this.connectionStateSignal.set(signalR.HubConnectionState.Disconnected);
        this.isConnected.set(false);
      } catch (error) {
        console.error('SignalR: Error stopping connection', error);
      }
    }
  }

  onLeaderboardUpdate(callback: (competitionCode: string) => void): void {
    this.leaderboardUpdateCallbacks.push(callback);
  }

  onMatchUpdate(callback: (matchId: string) => void): void {
    this.matchUpdateCallbacks.push(callback);
  }

  removeLeaderboardUpdateCallback(callback: (competitionCode: string) => void): void {
    const index = this.leaderboardUpdateCallbacks.indexOf(callback);
    if (index > -1) {
      this.leaderboardUpdateCallbacks.splice(index, 1);
    }
  }

  removeMatchUpdateCallback(callback: (matchId: string) => void): void {
    const index = this.matchUpdateCallbacks.indexOf(callback);
    if (index > -1) {
      this.matchUpdateCallbacks.splice(index, 1);
    }
  }
}
