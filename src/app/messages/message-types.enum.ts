export enum MessageInType {
  Join = "join",
  PrivateMessage = "private-message",

}

export enum MessageOutType {
  User = "user-update",
  Peers = "peers-update",
  UsernameInUse = "username-in-use",
  Error = "error"
}
