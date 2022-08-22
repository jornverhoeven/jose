/// <reference types="node" />
import { KeyObject } from 'crypto';
export declare const weakMap: WeakMap<KeyObject, string>;
declare const getNamedCurve: (kee: unknown, raw?: boolean) => string;
export declare function setCurve(keyObject: KeyObject, curve: string): void;
export default getNamedCurve;
