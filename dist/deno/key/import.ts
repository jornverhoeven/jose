import { encodeBase64, decodeBase64 } from '../runtime/base64url.ts'
import { fromSPKI as importPublic } from '../runtime/asn1.ts'
import { fromPKCS8 as importPrivate } from '../runtime/asn1.ts'

import formatPEM from '../lib/format_pem.ts'
import { parseJwk as importJwk } from '../jwk/parse.ts'
import type { KeyLike } from '../types.d.ts'

function getElement(seq: Uint8Array) {
  let result = []
  let next = 0

  while (next < seq.length) {
    let nextPart = parseElement(seq.subarray(next))
    result.push(nextPart)
    next += nextPart.byteLength
  }
  return result
}

function parseElement(bytes: Uint8Array) {
  let position = 0

  // tag
  let tag = bytes[0] & 0x1f
  position++
  if (tag === 0x1f) {
    tag = 0
    while (bytes[position] >= 0x80) {
      tag = tag * 128 + bytes[position] - 0x80
      position++
    }
    tag = tag * 128 + bytes[position] - 0x80
    position++
  }

  // length
  let length = 0
  if (bytes[position] < 0x80) {
    length = bytes[position]
    position++
  } else {
    let numberOfDigits = bytes[position] & 0x7f
    position++
    length = 0
    for (let i = 0; i < numberOfDigits; i++) {
      length = length * 256 + bytes[position]
      position++
    }
  }

  if (length === 0x80) {
    length = 0

    while (bytes[position + length] !== 0 || bytes[position + length + 1] !== 0) {
      length++
    }

    const byteLength = position + length + 2
    return {
      byteLength,
      contents: bytes.subarray(position, position + length),
      raw: bytes.subarray(0, byteLength),
    }
  }

  const byteLength = position + length
  return {
    byteLength,
    contents: bytes.subarray(position, byteLength),
    raw: bytes.subarray(0, byteLength),
  }
}

function spkiFromX509(buf: Uint8Array) {
  return encodeBase64(getElement(getElement(parseElement(buf).contents)[0].contents)[6].raw)
}

function getSPKI(x509: string): string {
  const pem = x509.replace(/(?:-----(?:BEGIN|END) CERTIFICATE-----|\s)/g, '')
  const raw = decodeBase64(pem)
  return formatPEM(spkiFromX509(raw), 'PUBLIC KEY')
}

export interface PEMImportOptions {
  /**
   * (Web Cryptography API specific) The value to use as
   * [SubtleCrypto.importKey()](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey)
   * `extractable` argument. Default is false.
   */
  extractable?: boolean
}

/**
 * Imports an PEM-encoded SPKI string as a runtime-specific public key representation (KeyObject or CryptoKey).
 * See [Algorithm Key Requirements](https://github.com/panva/jose/issues/210) to learn about key to algorithm
 * requirements and mapping.
 *
 * @param pem PEM-encoded SPKI string
 * @param alg JSON Web Algorithm identifier to be used with the imported key.
 *
 * @example ESM import
 * ```js
 * import { importSPKI } from 'jose/key/import'
 * ```
 *
 * @example CJS import
 * ```js
 * const { importSPKI } = require('jose/key/import')
 * ```
 *
 * @example Deno import
 * ```js
 * import { importSPKI } from 'https://deno.land/x/jose@VERSION/key/import.ts'
 * ```
 *
 * @example Usage
 * ```js
 * const algorithm = 'ES256'
 * const spki = `-----BEGIN PUBLIC KEY-----
 * MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEFlHHWfLk0gLBbsLTcuCrbCqoHqmM
 * YJepMC+Q+Dd6RBmBiA41evUsNMwLeN+PNFqib+xwi9JkJ8qhZkq8Y/IzGg==
 * -----END PUBLIC KEY-----`
 * const ecPublicKey = await importSPKI(spki, algorithm)
 * ```
 */
export async function importSPKI(
  spki: string,
  alg: string,
  options?: PEMImportOptions,
): Promise<Exclude<KeyLike, Uint8Array>> {
  if (typeof spki !== 'string' || spki.indexOf('-----BEGIN PUBLIC KEY-----') !== 0) {
    throw new TypeError('"spki" must be SPKI formatted string')
  }
  return importPublic(spki, alg, options)
}

/**
 * Imports the SPKI from an X.509 string certificate as a runtime-specific public key representation (KeyObject or CryptoKey).
 * See [Algorithm Key Requirements](https://github.com/panva/jose/issues/210) to learn about key to algorithm
 * requirements and mapping.
 *
 * @param pem X.509 certificate string
 * @param alg JSON Web Algorithm identifier to be used with the imported key.
 *
 * @example ESM import
 * ```js
 * import { importX509 } from 'jose/key/import'
 * ```
 *
 * @example CJS import
 * ```js
 * const { importX509 } = require('jose/key/import')
 * ```
 *
 * @example Deno import
 * ```js
 * import { importX509 } from 'https://deno.land/x/jose@VERSION/key/import.ts'
 * ```
 *
 * @example Usage
 * ```js
 * const algorithm = 'ES256'
 * const x509 = `-----BEGIN CERTIFICATE-----
 * MIIBXjCCAQSgAwIBAgIGAXvykuMKMAoGCCqGSM49BAMCMDYxNDAyBgNVBAMMK3Np
 * QXBNOXpBdk1VaXhXVWVGaGtjZXg1NjJRRzFyQUhXaV96UlFQTVpQaG8wHhcNMjEw
 * OTE3MDcwNTE3WhcNMjIwNzE0MDcwNTE3WjA2MTQwMgYDVQQDDCtzaUFwTTl6QXZN
 * VWl4V1VlRmhrY2V4NTYyUUcxckFIV2lfelJRUE1aUGhvMFkwEwYHKoZIzj0CAQYI
 * KoZIzj0DAQcDQgAE8PbPvCv5D5xBFHEZlBp/q5OEUymq7RIgWIi7tkl9aGSpYE35
 * UH+kBKDnphJO3odpPZ5gvgKs2nwRWcrDnUjYLDAKBggqhkjOPQQDAgNIADBFAiEA
 * 1yyMTRe66MhEXID9+uVub7woMkNYd0LhSHwKSPMUUTkCIFQGsfm1ecXOpeGOufAh
 * v+A1QWZMuTWqYt+uh/YSRNDn
 * -----END CERTIFICATE-----`
 * const ecPublicKey = await importX509(x509, algorithm)
 * ```
 */
export async function importX509(
  x509: string,
  alg: string,
  options?: PEMImportOptions,
): Promise<Exclude<KeyLike, Uint8Array>> {
  if (typeof x509 !== 'string' || x509.indexOf('-----BEGIN CERTIFICATE-----') !== 0) {
    throw new TypeError('"x509" must be X.509 formatted string')
  }
  const spki = getSPKI(x509)
  return importPublic(spki, alg, options)
}

/**
 * Imports an PEM-encoded PKCS8 string as a runtime-specific private key representation (KeyObject or CryptoKey).
 * See [Algorithm Key Requirements](https://github.com/panva/jose/issues/210) to learn about key to algorithm
 * requirements and mapping. Encrypted keys are not supported.
 *
 * @param pem PEM-encoded PKCS8 string
 * @param alg JSON Web Algorithm identifier to be used with the imported key.
 *
 * @example ESM import
 * ```js
 * import { importPKCS8 } from 'jose/key/import'
 * ```
 *
 * @example CJS import
 * ```js
 * const { importPKCS8 } = require('jose/key/import')
 * ```
 *
 * @example Deno import
 * ```js
 * import { importPKCS8 } from 'https://deno.land/x/jose@VERSION/key/import.ts'
 * ```
 *
 * @example Usage
 * ```js
 * const algorithm = 'ES256'
 * const pkcs8 = `-----BEGIN PRIVATE KEY-----
 * MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiyvo0X+VQ0yIrOaN
 * nlrnUclopnvuuMfoc8HHly3505OhRANCAAQWUcdZ8uTSAsFuwtNy4KtsKqgeqYxg
 * l6kwL5D4N3pEGYGIDjV69Sw0zAt43480WqJv7HCL0mQnyqFmSrxj8jMa
 * -----END PRIVATE KEY-----`
 * const ecPrivateKey = await importPKCS8(pkcs8, algorithm)
 * ```
 */
export async function importPKCS8(
  pkcs8: string,
  alg: string,
  options?: PEMImportOptions,
): Promise<Exclude<KeyLike, Uint8Array>> {
  if (typeof pkcs8 !== 'string' || pkcs8.indexOf('-----BEGIN PRIVATE KEY-----') !== 0) {
    throw new TypeError('"pkcs8" must be PCKS8 formatted string')
  }
  return importPrivate(pkcs8, alg, options)
}

/**
 * Imports a JWK to a runtime-specific key representation (KeyLike). Either
 * JWK "alg" (Algorithm) Parameter must be present or the optional "alg" argument. When
 * running on a platform using [Web Cryptography API](https://www.w3.org/TR/WebCryptoAPI/)
 * the jwk parameters "use", "key_ops", and "ext" are also used in the resulting `CryptoKey`.
 * See [Algorithm Key Requirements](https://github.com/panva/jose/issues/210) to learn about key to algorithm
 * requirements and mapping.
 *
 * @param jwk JSON Web Key.
 * @param alg JSON Web Algorithm identifier to be used with the imported key.
 * Default is the "alg" property on the JWK.
 * @param octAsKeyObject Forces a symmetric key to be imported to a KeyObject or
 * CryptoKey. Default is true unless JWK "ext" (Extractable) is true.
 *
 * @example ESM import
 * ```js
 * import { importJWK } from 'jose/key/import'
 * ```
 *
 * @example CJS import
 * ```js
 * const { importJWK } = require('jose/key/import')
 * ```
 *
 * @example Deno import
 * ```js
 * import { importJWK } from 'https://deno.land/x/jose@VERSION/key/import.ts'
 * ```
 *
 * @example Usage
 * ```js
 * const ecPublicKey = await importJWK({
 *   crv: 'P-256',
 *   kty: 'EC',
 *   x: 'ySK38C1jBdLwDsNWKzzBHqKYEE5Cgv-qjWvorUXk9fw',
 *   y: '_LeQBw07cf5t57Iavn4j-BqJsAD1dpoz8gokd3sBsOo'
 * }, 'ES256')
 *
 * const rsaPublicKey = await importJWK({
 *   kty: 'RSA',
 *   e: 'AQAB',
 *   n: '12oBZRhCiZFJLcPg59LkZZ9mdhSMTKAQZYq32k_ti5SBB6jerkh-WzOMAO664r_qyLkqHUSp3u5SbXtseZEpN3XPWGKSxjsy-1JyEFTdLSYe6f9gfrmxkUF_7DTpq0gn6rntP05g2-wFW50YO7mosfdslfrTJYWHFhJALabAeYirYD7-9kqq9ebfFMF4sRRELbv9oi36As6Q9B3Qb5_C1rAzqfao_PCsf9EPsTZsVVVkA5qoIAr47lo1ipfiBPxUCCNSdvkmDTYgvvRm6ZoMjFbvOtgyts55fXKdMWv7I9HMD5HwE9uW839PWA514qhbcIsXEYSFMPMV6fnlsiZvQQ'
 * }, 'PS256')
 * ```
 */
export const importJWK: typeof importJwk = (...args) => importJwk(...args)

export type { KeyLike }
