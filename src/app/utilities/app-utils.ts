import { CONFIG } from '../../config/config';
import { Duration } from '../interfaces/duration.interface';
import { TYPOGRAPHY } from "./constants/typography.constants";

export function getNowTimeStamp(): string {
    return new Date().toISOString();
}

export function generateId(): string {
    let idLength = CONFIG.ID_GENERATION.LENGTH;
    const chars = Array.from(CONFIG.ID_GENERATION.CHARS);
    let id = TYPOGRAPHY.EMPTY_STRING;
    while (idLength--) {
        id += getRandomValueFromArray<string>(chars);
    }
    id += TYPOGRAPHY.HYPHEN + Date.now().toString();
    return id;
}

export function getArrayFromMap<T>(mapToConvert: Map<string, T>): T[] {
    return Array.from(mapToConvert.values());
}

export function getRandomValueFromArray<T>(arrayToChooseFrom: T[]): T {
    return arrayToChooseFrom[Math.round(Math.random() * arrayToChooseFrom.length)];
}

export const getDateDifferenceInSeconds = (endDate: Date, startDate: Date): number => {
    if (!endDate || !startDate) {
      return 0;
    }
    const durationInMilliseconds = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(durationInMilliseconds / 1000);
  };

  export const getDuration = (seconds: number): Duration => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    seconds = Math.floor(seconds % 3600 % 60);
    return { hours, minutes, seconds };
  };

  export const getDurationFromDates = (endDate: Date, startDate: Date): Duration => {
    const differenceInSeconds = getDateDifferenceInSeconds(endDate, startDate);
    if (!endDate || !startDate) {
      return undefined;
    }
    return getDuration(differenceInSeconds);
  };

  export const arrayDifference = (arrayToFilter: string[], arrayReference: string[]): string[] => {
    return arrayToFilter.filter((item) => !arrayReference.includes(item));
  };