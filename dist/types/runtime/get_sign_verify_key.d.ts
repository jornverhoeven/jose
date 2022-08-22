/// <reference types="node" />
import { KeyObject } from 'crypto';
export default function getSignVerifyKey(alg: string, key: unknown, usage: KeyUsage): KeyObject;
