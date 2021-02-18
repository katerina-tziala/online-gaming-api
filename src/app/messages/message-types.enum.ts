export enum MessageInType {
  Join = "join",
  UserUpdate = "user-update",
  PrivateMessage = "private-message",

}

export enum MessageOutType {
  User = "user-update",
  Peers = "peers-update",
  Error = "error",
  MessageFailed = "message-failed",
  PrivateMessage = "private-message",
}

export enum MessageErrorType {
  UsernameInUse = "username-in-use",
  UsernameRequired = "username-required-to-join",
  RecipientNotConnected = "recipient-not-connected",
}
