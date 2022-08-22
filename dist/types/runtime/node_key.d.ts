/// <reference types="node" />
import type { KeyObject, SignKeyObjectInput } from 'crypto';
export default function keyForCrypto(alg: string, key: KeyObject): KeyObject | SignKeyObjectInput;
