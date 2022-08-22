import { JWEInvalid, JWSInvalid } from '../util/errors.js';
interface CritCheckHeader {
    b64?: boolean;
    crit?: string[];
    [propName: string]: unknown;
}
declare function validateCrit(Err: typeof JWEInvalid | typeof JWSInvalid, recognizedDefault: Map<string, boolean>, recognizedOption: {
    [propName: string]: boolean;
} | undefined, protectedHeader: CritCheckHeader, joseHeader: CritCheckHeader): Set<unknown>;
export default validateCrit;
