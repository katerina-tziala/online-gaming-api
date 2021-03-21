export enum MessageInType {
  Connect = "connect",
  Disconnect = "disconnect",
  Join = "join",
  UserUpdate = "user-update",
  PrivateMessage = "private-message",
  OpenGameRoom = "open-game-room",
  OpenPrivateGameRoom = "open-private-game-room",
  GameUpdate = "game-update",
  GameOver = "game-over",
  GameMessage = "game-message",
  GameState = "game-state",
  QuitGame = "quit-game"
}

export enum MessageOutType {
  Error = "error",
  Joined = "user-joined",
  Peers = "peers-update",
  UserUpdate = "user-update",
  PrivateMessage = "private-message",
  GameEntranceForbidden = "game-entrance-forbidden",
  GameRoomOpened = "game-room-opened",
  PlayerJoined = "player-joined",
  GameStart = "game-start",
  GameUpdate = "game-update",
  GameOver = "game-over",
  PlayerLeft = "player-left",
  GameMessage = "game-message",
  GameState = "game-state"
}

export enum MessageErrorType {
  UsernameRequired = "username-required",
  UsernameInvalid = "username-invalid",
  UsernameInUse = "username-in-use",
  NotJoined = "not-joined",
  JoinedAlready = "joined-already",
  MessageToSelf = "cannot-send-message-to-yourself",
  RecipientNotConnected = "recipient-not-connected",
  ExpectedPlayersNotSpecified = "expected-players-not-specified",
  ExpectedPlayersNotConnected = "expected-players-not-connected",
  SomeExpectedPlayersNotConnected = "some-expected-players-not-connected",
  GameNotFound = "game-not-found",
  ClientNotInGame = "not-in-game"
}
