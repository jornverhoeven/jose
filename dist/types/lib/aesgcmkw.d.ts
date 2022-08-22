export declare function wrap(alg: string, key: unknown, cek: Uint8Array, iv?: Uint8Array): Promise<{
    encryptedKey: Uint8Array;
    iv: string;
    tag: string;
}>;
export declare function unwrap(alg: string, key: unknown, encryptedKey: Uint8Array, iv: Uint8Array, tag: Uint8Array): Promise<Uint8Array>;
