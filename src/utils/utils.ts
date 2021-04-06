import { Duration } from '../app/duration.interface';

export function randomInteger(max = 100): number {
  return Math.floor(Math.random() * Math.round(max));
}

export function randomFromArray<T>(arrayToChooseFrom: T[]): T {
  const randomIntex = randomInteger(arrayToChooseFrom.length);
  return arrayToChooseFrom[randomIntex];
}

export function stringToJSON<T>(stringToParse: string): T {
  try {
    return JSON.parse(stringToParse);
  } catch (e) {
      return undefined;
  }
}

export function getDateDifferenceInSeconds(endDate: Date, startDate: Date): number {
  if (!endDate || !startDate) {
    return 0;
  }
  const durationInMilliseconds = Math.abs(
    endDate.getTime() - startDate.getTime()
  );
  return Math.ceil(durationInMilliseconds / 1000);
};

export function getDuration(seconds: number): Duration {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  seconds = Math.floor((seconds % 3600) % 60);
  return { hours, minutes, seconds };
};

export function getDurationFromDates(endDate: Date, startDate: Date): Duration {
  const differenceInSeconds = getDateDifferenceInSeconds(endDate, startDate);
  if (!endDate || !startDate) {
    return undefined;
  }
  return getDuration(differenceInSeconds);
};

export function arrayDifference<T>(arrayA: T[], arrayB: T[]): T[] {
  const setB = new Set(arrayB);
  return arrayA.filter(value => !setB.has(value));
}

export function isOdd(numberToCheck: number): boolean {
  return numberToCheck % 2 === 0;
}

export function positionInArray(arrayToCheck: string[], value: string): number {
  return arrayToCheck.indexOf(value);
}