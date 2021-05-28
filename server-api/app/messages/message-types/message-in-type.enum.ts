export enum MessageInType {
  Join = 'join',
  UserInfo = 'user-info',
  UserUpdate = 'user-update',
  PrivateChat = 'private-chat',
  EnterGame = 'enter-game-room',
  OpenGameRoom = 'open-game-room',
  OpenPrivateGameRoom = 'open-private-game-room',
  QuitGame = 'quit-game',
  GameState = 'game-state',
  GamePlayerInfo = 'game-player-info',
  GameChat = 'game-chat',
  GameUpdate = 'game-move-update',
  GameTurnMove = 'game-move-turn',
  GameMoveSubmit = 'game-move-submit',
  GameOver = 'game-over',
  GameInvitationAccept = 'game-invitation-accept',
  GameInvitationReject = 'game-invitation-reject',
  GameRestart = 'game-restart',
  GameRestartReject = 'game-restart-reject',
  GameRestartAccept = 'game-restart-accept',
  GameRestartCancel = 'game-restart-cancel',
}