import { CONFIG } from '../../config/config';
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
    id += TYPOGRAPHY.DOUBLE_UNDERSCORE + getNowTimeStamp();
    return id;
}

export function getArrayFromMap<T>(mapToConvert: Map<string, T>): T[] {
    return Array.from(mapToConvert.values());
}

export function getRandomValueFromArray<T>(arrayToChooseFrom: T[]): T {
    return arrayToChooseFrom[Math.floor(Math.random() * arrayToChooseFrom.length)];
}

