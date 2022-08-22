/// <reference types="node" />
export declare function deriveKey(publicKee: unknown, privateKee: unknown, algorithm: string, keyLength: number, apu?: Uint8Array, apv?: Uint8Array): Promise<Uint8Array>;
export declare function generateEpk(kee: unknown): Promise<import("crypto").KeyPairKeyObjectResult>;
export declare const ecdhAllowed: (key: unknown) => boolean;
