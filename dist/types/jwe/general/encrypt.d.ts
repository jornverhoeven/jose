import type { KeyLike, GeneralJWE, JWEHeaderParameters, CritOption, DeflateOption } from '../../types.d';
export interface Recipient {
    /**
     * Sets the JWE Per-Recipient Unprotected Header on the Recipient object.
     *
     * @param unprotectedHeader JWE Per-Recipient Unprotected Header.
     */
    setUnprotectedHeader(unprotectedHeader: JWEHeaderParameters): Recipient;
    /** A shorthand for calling addRecipient() on the enclosing GeneralEncrypt instance */
    addRecipient(...args: Parameters<GeneralEncrypt['addRecipient']>): Recipient;
    /** A shorthand for calling encrypt() on the enclosing GeneralEncrypt instance */
    encrypt(...args: Parameters<GeneralEncrypt['encrypt']>): Promise<GeneralJWE>;
    /** Returns the enclosing GeneralEncrypt */
    done(): GeneralEncrypt;
}
/**
 * The GeneralEncrypt class is a utility for creating General JWE objects.
 *
 * @example Usage
 *
 * ```js
 * const jwe = await new jose.GeneralEncrypt(
 *   new TextEncoder().encode('It’s a dangerous business, Frodo, going out your door.'),
 * )
 *   .setProtectedHeader({ enc: 'A256GCM' })
 *   .addRecipient(ecPublicKey)
 *   .setUnprotectedHeader({ alg: 'ECDH-ES+A256KW' })
 *   .addRecipient(rsaPublicKey)
 *   .setUnprotectedHeader({ alg: 'RSA-OAEP-384' })
 *   .encrypt()
 *
 * console.log(jwe)
 * ```
 */
export declare class GeneralEncrypt {
    private _plaintext;
    private _recipients;
    private _protectedHeader;
    private _unprotectedHeader;
    private _aad;
    /** @param plaintext Binary representation of the plaintext to encrypt. */
    constructor(plaintext: Uint8Array);
    /**
     * Adds an additional recipient for the General JWE object.
     *
     * @param key Public Key or Secret to encrypt the Content Encryption Key for the recipient with.
     * @param options JWE Encryption options.
     */
    addRecipient(key: KeyLike | Uint8Array, options?: CritOption): Recipient;
    /**
     * Sets the JWE Protected Header on the GeneralEncrypt object.
     *
     * @param protectedHeader JWE Protected Header object.
     */
    setProtectedHeader(protectedHeader: JWEHeaderParameters): this;
    /**
     * Sets the JWE Shared Unprotected Header on the GeneralEncrypt object.
     *
     * @param sharedUnprotectedHeader JWE Shared Unprotected Header object.
     */
    setSharedUnprotectedHeader(sharedUnprotectedHeader: JWEHeaderParameters): this;
    /**
     * Sets the Additional Authenticated Data on the GeneralEncrypt object.
     *
     * @param aad Additional Authenticated Data.
     */
    setAdditionalAuthenticatedData(aad: Uint8Array): this;
    /**
     * Encrypts and resolves the value of the General JWE object.
     *
     * @param options JWE Encryption options.
     */
    encrypt(options?: DeflateOption): Promise<GeneralJWE>;
}
