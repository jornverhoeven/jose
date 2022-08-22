/// <reference types="node" />
/** The end justifies the means. */
export default class Asn1SequenceDecoder {
    buffer: Buffer;
    offset: number;
    constructor(buffer: Buffer);
    decodeLength(): number;
    unsignedInteger(): Buffer;
    end(): void;
}
