import { CONFIG } from "../../config/config";
import { Duration } from "../interfaces/duration.interface";
import { TYPOGRAPHY } from "./constants/typography.constants";

export function generateId(): string {
  // let idLength = CONFIG.ID_GENERATION.LENGTH;
  // const chars = Array.from(CONFIG.ID_GENERATION.CHARS);
  const id = Date.now().toString() + TYPOGRAPHY.HYPHEN;
  // while (idLength--) {
  //   id += getRandomValueFromArray<string>(chars);
  // }
  return id;
}

export function getArrayFromMap<T>(mapToConvert: Map<string, T>): T[] {
  return Array.from(mapToConvert.values());
}

export function getRandomInt(max = 100): number {
  return Math.floor(Math.random() * Math.round(max));
}

export function getRandomValueFromArray<T>(arrayToChooseFrom: T[]): T {
  const randomIntex = getRandomInt(arrayToChooseFrom.length);
  return arrayToChooseFrom[randomIntex];
}

export const getDateDifferenceInSeconds = (
  endDate: Date,
  startDate: Date
): number => {
  if (!endDate || !startDate) {
    return 0;
  }
  const durationInMilliseconds = Math.abs(
    endDate.getTime() - startDate.getTime()
  );
  return Math.ceil(durationInMilliseconds / 1000);
};

export const getDuration = (seconds: number): Duration => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  seconds = Math.floor((seconds % 3600) % 60);
  return { hours, minutes, seconds };
};

export const getDurationFromDates = (endDate: Date, startDate: Date): Duration => {
  const differenceInSeconds = getDateDifferenceInSeconds(endDate, startDate);
  if (!endDate || !startDate) {
    return null;
  }
  return getDuration(differenceInSeconds);
};

export const arrayDifference = (
  arrayToFilter: string[],
  arrayReference: string[]
): string[] => {
  return arrayToFilter.filter((item) => !arrayReference.includes(item));
};
