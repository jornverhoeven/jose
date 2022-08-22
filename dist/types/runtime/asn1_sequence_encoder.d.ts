/// <reference types="node" />
import { Buffer } from 'buffer';
/** The end justifies the means. */
export default class DumbAsn1Encoder {
    length: number;
    elements: Buffer[];
    constructor();
    oidFor(oid: string): void;
    zero(): void;
    one(): void;
    unsignedInteger(integer: Buffer): void;
    octStr(octStr: Buffer): void;
    bitStr(bitS: Buffer): void;
    add(seq: Buffer): void;
    end(tag?: Buffer): Buffer;
}
