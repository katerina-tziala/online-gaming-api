import { randomFromArray } from './utils';

export class IdGenerator {
    private static _LENGTH = 32;
    private static _CHARS = Array.from('abcdefghjkmnopqrstvwxyz01234567890ABCDEFGHJKMNOPQRSTVWXYZ');

    public static generate(): string {
        let id = Date.now().toString();
        while (id.length < this._LENGTH) {
          id += randomFromArray<string>(this._CHARS);
        }
        return id;
    }

}
