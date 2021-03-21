import { Client } from "../../utilities/client";
import { Session } from "../session";
import { MessageOutType } from "../../messages/message-types.enum";
import { GameConfig, ConfigUtils } from "./game-config/game-config";
import { GameInfo } from "./game-info.interface";
import {
  getDurationFromDates,
  getRandomValueFromArray,
} from "../../utilities/app-utils";
import { Duration } from "../../interfaces/duration.interface";
import { GameRoomSession } from "./game-room-session";

export class PrivateGameRoomSession extends GameRoomSession {

  constructor(config: GameConfig, settings?: {}) {
    super(config, settings);

  }

}
