import type { JWEHeaderParameters, KeyLike } from '../types.d';
declare function decryptKeyManagement(alg: string, key: KeyLike | Uint8Array, encryptedKey: Uint8Array | undefined, joseHeader: JWEHeaderParameters): Promise<KeyLike | Uint8Array>;
export default decryptKeyManagement;
