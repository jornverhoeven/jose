/// <reference types="node" />
import type { KeyObject } from 'crypto';
export declare const weakMap: WeakMap<KeyObject, number>;
export declare const setModulusLength: (keyObject: KeyObject, modulusLength: number) => void;
declare const _default: (key: KeyObject, alg: string) => void;
export default _default;
