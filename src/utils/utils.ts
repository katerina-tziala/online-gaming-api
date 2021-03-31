export function randomInteger(max = 100): number {
  return Math.floor(Math.random() * Math.round(max));
}

export function randomFromArray<T>(arrayToChooseFrom: T[]): T {
  const randomIntex = randomInteger(arrayToChooseFrom.length);
  return arrayToChooseFrom[randomIntex];
}
