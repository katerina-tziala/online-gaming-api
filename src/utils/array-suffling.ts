import { arrayDifference, positionInArray, randomFromArray } from './utils';

export class ArraySuffling {
  public static suffleLeftWise(arrayToSuffle: string[], randomStart = true) {
   const startingValue = this.startingValue(arrayToSuffle, randomStart);
    const suffeledArray: string[] = [startingValue];
    const startingPosition = positionInArray(arrayToSuffle, startingValue);
    for (let index = 1; index < arrayToSuffle.length; index++) {
      const previousIndex = startingPosition - index;
      const previousPosition = previousIndex > 0 ? previousIndex : arrayToSuffle.length + previousIndex;
      const nextValue =  this.selectFromArray(arrayToSuffle, previousPosition)
      suffeledArray.push(nextValue);
    }
    return suffeledArray;
  }

  public static suffleRightWise(arrayToSuffle: string[], randomStart = true): string[] {
    const startingValue = this.startingValue(arrayToSuffle, randomStart);
    const suffeledArray: string[] = [startingValue];
    const startingPosition = positionInArray(arrayToSuffle, startingValue);
    for (let index = 1; index < arrayToSuffle.length; index++) {
        const nextPosition = startingPosition + index;
        const nextValue =  this.selectFromArray(arrayToSuffle, nextPosition);
        suffeledArray.push(nextValue);
    }
    return suffeledArray;
  }

  public static suffleRandomly(arrayToSuffle: string[]): string[] {
    const suffeledArray: string[] = [];
    let valuesToChooseFrom = [...arrayToSuffle];
    while (suffeledArray.length < arrayToSuffle.length) {
      const nextValue = this.randomFromArray(valuesToChooseFrom);
      suffeledArray.push(nextValue);
      valuesToChooseFrom = this.arrayDifference(arrayToSuffle, suffeledArray);
    }
    return suffeledArray;
  }
  private static startingValue(valuesToChooseFrom: string[], randomStart = true): string {
    return randomStart ?  this.randomFromArray(valuesToChooseFrom) : valuesToChooseFrom[0];
  }

  private static arrayDifference(arrayA: string[], arrayB: string[]): string[] {
    return arrayDifference<string>(arrayA, arrayB);
  }

  private static selectFromArray(arraytoSelectFrom: string[], randomPosition: number): string {
    const adjustedPosition = this.getAdjustedPositionInArray(randomPosition, arraytoSelectFrom.length);
    return arraytoSelectFrom[adjustedPosition];
  }

  private static randomFromArray(valuesToChooseFrom: string[]): string {
    return randomFromArray<string>(valuesToChooseFrom);
  }

  private static getAdjustedPositionInArray(randomPosition: number, arrayLength: number): number {
    const adjustedPosition = Math.abs(randomPosition);
    if (randomPosition < arrayLength) {
        return adjustedPosition;
    }
    return adjustedPosition % arrayLength;
  }
}
