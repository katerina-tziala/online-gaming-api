export const typeOfObject = (value: any): boolean => {
  return value && typeof value === "object";
};

export const positiveInteger = (value: number): number => {
  return value ? Math.abs(value) : 0;
};

export const typeOfNumber = (value: any): boolean => {
  return value && typeof value === "number";
};

export const typeOfString = (value: any): boolean => {
  return value && typeof value === "string";
};

export const validString = (value: string): boolean => {
  return value && value.length ? true : false;
};