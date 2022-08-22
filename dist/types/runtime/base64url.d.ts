/// <reference types="node" />
import { Buffer } from 'buffer';
declare let encode: (input: Uint8Array | string) => string;
export declare const decodeBase64: (input: string) => Buffer;
export declare const encodeBase64: (input: Uint8Array | string) => string;
export { encode };
export declare const decode: (input: Uint8Array | string) => Buffer;
