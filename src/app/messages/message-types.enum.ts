export enum MessageInType {
  Join = "join",
  Disconnect = "disconnect",
  UserUpdate = "user-update",
  PrivateMessage = "private-message",
  InviteAndOpenRoom = "invite-and-open-room",
  RejectInvitation = "reject-invitation",
  AcceptInvitation = "accept-invitation",
  GameUpdate = "game-update",
  GameOver = "game-over",
}

export enum MessageOutType {
  Error = "error",
  User = "user-update",
  Peers = "peers-update",
  Joined = "user-joined",
  MessageFailed = "message-failed",
  PrivateMessage = "private-message",
  Invitation = "invitation",
  Invitations = "invitations-update",
  InvitationDenied = "invitation-denied",
  InvitationRejected = "invitation-rejected",
  RoomOpened = "game-room-opened",
  GameStart = "game-start",
  PlayerJoined = "player-joined",
  GameUpdate = "game-update",
  GameOver = "game-over",
}

export enum MessageErrorType {
  UsernameInUse = "username-in-use",
  UsernameRequired = "username-required-to-join",
  RecipientNotConnected = "recipient-not-connected",
}
