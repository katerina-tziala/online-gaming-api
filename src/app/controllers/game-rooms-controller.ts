import { GameRoomSession } from "../session/game-room/game-room-session";
import { PrivateGameRoomSession } from "../session/game-room/private-game-room-session";

export class GameRoomsController {
  private _gameRooms: Map<string, GameRoomSession | PrivateGameRoomSession> = new Map();

  public set addGameRoom(session: GameRoomSession) {
    this._gameRooms.set(session.id, session);
  }

  public get hasGameRooms(): boolean {
    return !!this._gameRooms.size;
  }

  public get gameRooms(): GameRoomSession[] | PrivateGameRoomSession[] {
    return Array.from(this._gameRooms.values());
  }

  public getGameRoomById(roomId: string): GameRoomSession | PrivateGameRoomSession {
    return this._gameRooms.get(roomId);
  }

  public getAvailableGameRoomByKey(gameKey: string): GameRoomSession | PrivateGameRoomSession {
    return this.gameRooms.find(
      (room) => room.entranceAllowed && room.key === gameKey
    );
  }

  public deleteGameRoom(session: GameRoomSession | PrivateGameRoomSession): void {
    this._gameRooms.delete(session.id);
  }

  public gameRoomExists(id: string): boolean {
    return this._gameRooms.has(id);
  }
}
