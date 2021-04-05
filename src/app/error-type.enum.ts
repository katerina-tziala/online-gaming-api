export enum ErrorType {
  JSONDataExcpected = "data-not-json-object",
  MessageTypeExpected = "message-type-not-defined",
  MessageTypeAllowed = "message-type-not-allowed",
  JoinedAlready = "joined-already",
  UsernameRequired = "username-required",
  UsernameString = "username-not-string",
  UsernameInvalid = "username-invalid",
  UsernameInUse = "username-in-use",
  NotJoined = "not-joined",
  UsernameOrPropertiesUpdate = "username-or-properties-update-allowed",
  ChatRecipientNotDefined = "chat-recipient-not-defined",
  ChatDataObject = "chat-data-not-object",
  ChatContentNotDefined = "chat-content-not-defined",
  MessageToSelf = "cannot-send-message-to-yourself",
  RecipientNotConnected = "recipient-not-connected",
  GameEntranceForbidden = "game-entrance-forbidden",
  GameNotFound = "game-not-found",
  NotInGame = "not-in-game",
  WaitForPlayers = "wait-for-players-to-join",
  GameOver = "game-is-over",
  GameStart = "game-not-started",
  UpdateData = "update-data-not-defined",



  // ExpectedPlayersNotSpecified = "expected-players-not-specified",
  // ExpectedPlayersNotConnected = "expected-players-not-connected",
  // SomeExpectedPlayersNotConnected = "some-expected-players-not-connected",
  // RestarErrorRoomNotFilled = "not-all-players-in-game-to-request-restart",
  // GameNotStarted = "game-not-started-to-request-restart",
  // RestartNotRequested = "restart-not-requested",
  // CannotUpdateWhenRestartRequested = "cannot-update-game-when-restart-requested",
  // CannotEndWhenRestartRequested = "cannot-end-game-when-restart-requested",
  //
  // GameActionForbidden = "game-action-forbidden",
  //
}
