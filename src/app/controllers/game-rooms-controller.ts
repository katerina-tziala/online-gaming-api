import { GameRoom } from "../session/game-room/game-room";

export class GameRoomsController {
  private _gameRooms: Map<string, GameRoom> = new Map();

  public set addGameRoom(session: GameRoom) {
    this._gameRooms.set(session.id, session);
  }

  public get hasGameRooms(): boolean {
    return !!this._gameRooms.size;
  }

  public get gameRooms(): GameRoom[] {
    return Array.from(this._gameRooms.values());
  }

  public getGameRoomById(roomId: string): GameRoom {
    return this._gameRooms.get(roomId);
  }

  public getAvailableGameRoomByKey(gameKey: string): GameRoom {
    return this.gameRooms.find(room => room.key === gameKey && room.entranceAllowed);
  }

  public deleteGameRoom(session: GameRoom): void {
    this._gameRooms.delete(session.id);
  }

  public gameRoomExists(id: string): boolean {
    return this._gameRooms.has(id);
  }
}
