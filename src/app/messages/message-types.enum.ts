export enum MessageInType {
  Connect = "connect",
  Disconnect = "disconnect",
  Join = "join",
  UserUpdate = "user-update",
  PrivateMessage = "private-message",
  // InviteAndOpenRoom = "invite-and-open-room",
  // RejectInvitation = "reject-invitation",
  // AcceptInvitation = "accept-invitation",
  // GameUpdate = "game-update",
  // GameOver = "game-over",
  // QuitGame = "quit-game",
}

export enum MessageOutType {
  Error = "error",
  Joined = "user-joined",
  Peers = "peers-update",
  UserUpdate = "user-update",



  // MessageFailed = "message-failed",
  // PrivateMessage = "private-message",
  // InvitationReceived = "invitation-received",
  // InvitationAccepted = "invitation-accepted",
  // Invitations = "invitations-update",
  // InvitationDenied = "invitation-denied",
  // InvitationRejected = "invitation-rejected",
  // InvitationCanceled = "invitation-canceled",
  // RoomOpened = "game-room-opened",
  // RoomCreated = "game-room-created",
  // PlayerJoined = "player-joined",
  // PlayerLeft = "player-left",
  // GameStart = "game-start",
  // GameUpdate = "game-update",
  // GameOver = "game-over",
  // GameEntranceForbidden = "game-entrance-forbidden",
}

export enum MessageErrorType {
  UsernameRequired = "username-required",
  UsernameInvalid = "username-invalid",
  UsernameInUse = "username-in-use",
  // RecipientNotConnected = "recipient-not-connected",
  // GameDoesNotExist = "game-does-not-exist",
  // AlreadyInGame = "client-in-game-already",
  // NoRecipientsSpecified = "no-recipients-specified",
  // RecipientsDisconnected = "recipients-disconnected",
  // InvitationDoesNotExist = "invitation-does-not-exist",
}
