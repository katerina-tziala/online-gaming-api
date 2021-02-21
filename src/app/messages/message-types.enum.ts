export enum MessageInType {
  Join = "join",
  UserUpdate = "user-update",
  PrivateMessage = "private-message",
  InviteAndOpenRoom = "invite-and-open-room",
  RejectInvitation = "reject-invitation",
}

export enum MessageOutType {
  User = "user-update",
  Peers = "peers-update",
  Error = "error",
  MessageFailed = "message-failed",
  PrivateMessage = "private-message",
  RoomOpened = "game-room-opened",
  GameInvitation = "game-invitation",
  Invitations = "invitations-update",
  InvitationRejected = "invitation-rejected",
}

export enum MessageErrorType {
  UsernameInUse = "username-in-use",
  UsernameRequired = "username-required-to-join",
  RecipientNotConnected = "recipient-not-connected",
}
