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