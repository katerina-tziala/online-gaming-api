import { GameRoom } from '../session/game-room/game-room';
import { GameRoomPrivate } from '../session/game-room/game-room-private';

export class GameRoomsController<T extends GameRoom> {
  private _gameRooms: Map<string, T> = new Map();

  public set addGameRoom(session: T) {
    this._gameRooms.set(session.id, session);
  }

  public get hasGameRooms(): boolean {
    return !!this._gameRooms.size;
  }

  public get gameRooms(): T[]{
    return Array.from(this._gameRooms.values());
  }

  public getGameRoomById(roomId: string): T {
    return this._gameRooms.get(roomId);
  }

  public getAvailableGameRoomByKey(gameKey: string): T {
    return this.gameRooms.find(room => room.key === gameKey && room.entranceAllowed);
  }

  public deleteGameRoom(session: GameRoom | GameRoomPrivate): void {
    this._gameRooms.delete(session.id);
  }

  public gameRoomExists(id: string): boolean {
    return this._gameRooms.has(id);
  }
}
