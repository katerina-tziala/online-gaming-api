import { GameRoomSession } from "../session/game-room/game-room-session";
import { MainSession } from "../session/session-main";
import { Client } from "./client";
import { MessageIn } from "../messages/message.interface";
import {
  MessageErrorType,
  MessageInType,
  MessageOutType,
} from "../messages/message-types.enum";
import { GameConfig, ConfigUtils } from "../session/game-room/game-config/game-config";
import { HostRoomsController } from "../controllers/host-rooms-controller";
import { PrivateGameSession } from "../session/game-room/private-game-session";

export class GamingHost extends MainSession {
  public id: string;
  private GameRooms = new HostRoomsController();
  private gameMessages = [MessageInType.GameUpdate, MessageInType.GameOver,
    MessageInType.GameMessage, MessageInType.GameState, MessageInType.GameRestartRequest,
    MessageInType.GameRestartReject, MessageInType.GameRestartAccept];

  constructor(id: string) {
    super();
    this.id = id;
  }

  private checkJoinedClientForGameRoom(client: Client, gameRoomId: string): void {
    if (gameRoomId) {
      this.onJoinClientInGame(client, gameRoomId);
    } else {
      this.notifyUser(client, MessageOutType.Joined);
      this.broadcastPeersUpdate(client);
    }
  }

  private onJoinClientInGame(client: Client, gameRoomId: string): void {
    const gameRoom = this.GameRooms.getGameRoomById(gameRoomId);
    if (!gameRoom) {
      client.sendError(MessageErrorType.GameNotFound, { gameRoomId });
      this.notifyUser(client, MessageOutType.Joined);
      this.broadcastPeersUpdate(client);
      return;
    }
    gameRoom.joinClient(client);
    this.broadcastPeersUpdate(client);
  }

  private onQuitGame(client: Client, msg: MessageIn): void {
    if (!this.GameRooms.clientAllowedToSendGameMessage(client, msg)) {
      return;
    }
    this.GameRooms.removeClientFromCurrentGame(client);
    // an meinei enas monos tou na ton vgalw
    // game exited
    this.addClient(client);
  }

  public onJoinClient(client: Client, msg: MessageIn): void {
    if (this.clientExists(client)) {
      client.sendError(MessageErrorType.JoinedAlready, msg);
      return;
    }
    this.joinClient(client, msg, () => {
      client.setJoined();
      const { gameRoomId } = msg.data;
      this.checkJoinedClientForGameRoom(client, gameRoomId);
    });
  }

  public onMessage(client: Client, msg: MessageIn): void {
    if (!this.clientExists(client)) {
      client.sendError(MessageErrorType.NotJoined, msg);
      return;
    }

    if (this.gameMessages.includes(msg.type)) {
      this.GameRooms.handleMessage(client, msg);
      return;
    }

    switch (msg.type) {
      case MessageInType.UserUpdate:
        this.onClientUpdate(client, msg);
        break;
      case MessageInType.PrivateMessage:
        this.sendPrivateMessage(client, msg);
        break;
      case MessageInType.OpenPrivateGameRoom:
        this.onOpenPrivateGameRoom(client, msg);
        break;
      case MessageInType.OpenGameRoom:
        this.onOpenGameRoom(client, msg);
        break;
      case MessageInType.QuitGame:
          this.onQuitGame(client, msg);
        break;
      case MessageInType.GameInvitationAccept:
          this.onGameInvitationAccept(client, msg);
        break;
      case MessageInType.GameInvitationCancel:
        this.onGameInvitationCancel(client, msg);
        break;
      case MessageInType.GameInvitationReject:
        this.onGameInvitationReject(client, msg);
        break;
      default:
        console.log("message");
        console.log("-------------------------");
        console.log(msg);
        console.log(client.info);
        break;
    }
  }

  private onOpenGameRoom(client: Client, msg: MessageIn): void {
    this.GameRooms.removeClientFromCurrentGame(client);
    const { settings, ...configData } = msg.data;
    const gameRoom = this.GameRooms.joinOrOpenPublicRoom(configData, settings);
    gameRoom.joinClient(client);
    this.broadcastPeersUpdate(client);
  }






  private onOpenPrivateGameRoom(client: Client, msg: MessageIn): void {
    // client already in same game
    this.GameRooms.removeClientFromCurrentGame(client);
    const { playersExpected, settings, ...config} = msg.data;
    config.playersExpected = this.getExpectedOpponents(client, msg.data.playersExpected);

    // if (!config.playersExpected.length) {
    //   client.sendError(MessageErrorType.ExpectedPlayersNotSpecified, msg);
    //   return;
    // }

    // const { expectedPlayers, errorType } = this.getExpectedPlayers(config.playersExpected);
    // if (errorType) {
    //   client.sendError(errorType, msg);
    //   return;
    // }
    // this.GameRooms.openPrivateGameRoom(client, config, potentialPlayers);

    this.GameRooms.openPrivateGameRoom(client, config, this.getClientPeers(client), settings);
    // this.broadcastPeersUpdate(client);
  }

  private getExpectedOpponents(client: Client, playersExpected: string[] = []): string[] {
    let expectedOpponents = Array.from(new Set(playersExpected));
    expectedOpponents = expectedOpponents.filter(
      (clientId) => clientId !== client.id
    );
    return expectedOpponents;
  }

  private getExpectedPlayers(playersExpected: string[] = []): { expectedPlayers: Client[]; errorType: MessageErrorType } {
    const expectedPlayers: Client[] = this.getClientsByIds(playersExpected);
    let errorType;
    if (!expectedPlayers.length) {
      errorType = MessageErrorType.ExpectedPlayersNotConnected;
    } else if (expectedPlayers.length !== playersExpected.length) {
      errorType = MessageErrorType.SomeExpectedPlayersNotConnected;
    }
    return { expectedPlayers, errorType };
  }

  private onGameInvitationAccept(client: Client, msg: MessageIn): void {
    const { gameRoomId } = msg.data;
    // if not gameroomid
    this.GameRooms.getGameForMessage(client, gameRoomId, msg, (gameRoom: PrivateGameSession) => {
      if (gameRoom.invitationAcceptanceAllowed(client)) {
        this.GameRooms.removeClientFromCurrentGame(client);
        gameRoom.joinClient(client);
        this.broadcastPeersUpdate(client);
      }
    });
  }

  private onGameInvitationCancel(client: Client, msg: MessageIn): void {
    const { gameRoomId } = msg.data;
    this.GameRooms.getGameForMessage(client, gameRoomId, msg, (gameRoom: PrivateGameSession) => {
      const clientsForMainSession = gameRoom.cancelInvitation(client);
      if (clientsForMainSession.length) {
        this.addMultipleClients(clientsForMainSession, MessageOutType.GameRoomExited);
        this.GameRooms.deleteGameRoom(gameRoom);
      }
    });
  }

  private onGameInvitationReject(client: Client, msg: MessageIn): void {
    console.log("onGameInvitationReject");
    const { gameRoomId } = msg.data;
    this.GameRooms.getGameForMessage(client, gameRoomId, msg, (gameRoom: PrivateGameSession) => {
      console.log(gameRoom.info);
      const clientsForMainSession = gameRoom.rejectInvitation(client);
      if (clientsForMainSession.length) {
        this.addMultipleClients(clientsForMainSession, MessageOutType.GameRoomExited);
        this.GameRooms.deleteGameRoom(gameRoom);
      }
    });
  }

  public disconnectClient(client: Client): void {
    if (!client) {
      return;
    }
    this.GameRooms.removeClientFromCurrentGame(client);
    this.removeClient(client);
  }
}