import type { KeyLike, JWEKeyManagementHeaderParameters, JWEHeaderParameters } from '../types.d';
declare function encryptKeyManagement(alg: string, enc: string, key: KeyLike | Uint8Array, providedCek?: Uint8Array, providedParameters?: JWEKeyManagementHeaderParameters): Promise<{
    cek: KeyLike | Uint8Array;
    encryptedKey?: Uint8Array;
    parameters?: JWEHeaderParameters;
}>;
export default encryptKeyManagement;
