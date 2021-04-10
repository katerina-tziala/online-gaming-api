import { RequestStatus } from "./request-status.enum";

export interface GameRequestInterface {
  requestedAt: string;
  requestedBy: string;
  status: RequestStatus;
  pendingResponse: string[];
  confirmedBy: string[];
  rejectedBy: string[];
}