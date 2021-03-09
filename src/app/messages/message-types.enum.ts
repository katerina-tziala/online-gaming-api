export enum MessageInType {
  Join = "join",
  Disconnect = "disconnect",
  UserUpdate = "user-update",
  PrivateMessage = "private-message",
  InviteAndOpenRoom = "invite-and-open-room",
  RejectInvitation = "reject-invitation",
}

export enum MessageOutType {
  Error = "error",
  User = "user-update",
  Peers = "peers-update",
  Joined = "user-joined",
  MessageFailed = "message-failed",
  PrivateMessage = "private-message",
  RoomOpened = "game-room-opened",
  GameInvitation = "game-invitation",
  Invitations = "invitations-update",
  InvitationDenied = "invitation-denied",
  InvitationRejected = "invitation-rejected",

}

export enum MessageErrorType {
  UsernameInUse = "username-in-use",
  UsernameRequired = "username-required-to-join",
  RecipientNotConnected = "recipient-not-connected",
}
