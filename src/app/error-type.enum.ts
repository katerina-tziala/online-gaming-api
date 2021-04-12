export enum ErrorType {
  JSONDataExcpected = 'data-not-json-object',
  MessageTypeExpected = 'message-type-not-defined',
  MessageTypeAllowed = 'message-type-not-allowed',
  JoinedAlready = 'joined-already',
  UsernameRequired = 'username-required',
  UsernameString = 'username-not-string',
  UsernameInvalid = 'username-invalid',
  UsernameInUse = 'username-in-use',
  NotJoined = 'not-joined',
  UsernameOrPropertiesUpdate = 'username-or-properties-update-allowed',
  ChatRecipientNotDefined = 'chat-recipient-not-defined',
  ChatDataObject = 'chat-data-not-object',
  ChatContentNotDefined = 'chat-content-not-defined',
  MessageToSelf = 'cannot-send-message-to-yourself',
  RecipientNotConnected = 'recipient-not-connected',
  GameEntranceForbidden = 'game-entrance-forbidden',
  GameNotFound = 'game-not-found',
  NotInGame = 'not-in-game',
  WaitForPlayers = 'wait-for-players-to-join',
  GameOver = 'game-is-over',
  GameNotStarted = 'game-not-started',
  DataRequired = 'data-required',
  TurnsSwitchForbidden = 'turns-switch-forbidden',
  PlayerOnTurn = 'not-player-turn',
  PlayerNotFound = 'player-not-found',
  GameActionForbidden = 'game-action-forbidden',
  GameAccessForbidden = 'game-access-forbidden',
  ExpectedPlayersNotSpecified = 'expected-players-not-specified',
  ExpectedClientsNotConnected = 'not-all-clients-to-invite-connected',
  GameIdRequired = 'game-id-required',
  GameRestartForbidden = 'game-restart-action-forbidden',
  RestartNotRequested = 'game-restart-not-requested',
  RestartNotRequestedByPlayer = 'game-restart-not-requested-by-player',
  GameRestartWaitConfrimation = 'game-restart-wait-for-confirmation',
  RestartRequested = 'restart-requested',
  MoveNotDefined = 'move-not-defined',
  MoveSubmitted = 'move-already-submitted',
  MoveSubmitionForbidden = 'move-submission-forbidden',
}
