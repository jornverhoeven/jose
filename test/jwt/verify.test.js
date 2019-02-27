const test = require('ava')

const { JWT, JWK, JWKS, errors } = require('../..')
const base64url = require('../../lib/help/base64url')

const key = JWK.generateSync('oct')
const token = JWT.sign({}, key, { iat: false })

const string = (t, option) => {
  ;['', false, [], {}, Buffer, Buffer.from('foo'), 0, Infinity].forEach((val) => {
    t.throws(() => {
      JWT.verify(token, key, { [option]: val })
    }, { instanceOf: TypeError, message: `options.${option} must be a string` })
  })
}

test('options.complete true', t => {
  const token = JWT.sign({}, key)
  const completeResult = JWT.verify(token, key, { complete: true })
  t.is(completeResult.key, key)
})

test('options.complete with KeyStore', t => {
  const ks = new JWKS.KeyStore(JWK.generateSync('oct'), key)
  const token = JWT.sign({}, key, { kid: false })
  const completeResult = JWT.verify(token, ks, { complete: true })
  t.is(completeResult.key, key)
})

test('options must be an object', t => {
  ;['', false, [], Buffer, Buffer.from('foo'), 0, Infinity].forEach((val) => {
    t.throws(() => {
      JWT.verify(token, key, val)
    }, { instanceOf: TypeError, message: 'options must be an object' })
  })
})

test('options.clockTolerance must be a string', string, 'clockTolerance')
test('options.issuer must be a string', string, 'issuer')
test('options.jti must be a string', string, 'jti')
test('options.maxAuthAge must be a string', string, 'maxAuthAge')
test('options.maxTokenAge must be a string', string, 'maxTokenAge')
test('options.nonce must be a string', string, 'nonce')
test('options.subject must be a string', string, 'subject')

const boolean = (t, option) => {
  ;['', 'foo', [], {}, Buffer, Buffer.from('foo'), 0, Infinity].forEach((val) => {
    t.throws(() => {
      JWT.verify(token, key, { [option]: val })
    }, { instanceOf: TypeError, message: `options.${option} must be a boolean` })
  })
}
test('options.complete must be boolean', boolean, 'complete')
test('options.ignoreExp must be boolean', boolean, 'ignoreExp')
test('options.ignoreNbf must be boolean', boolean, 'ignoreNbf')
test('options.ignoreIat must be boolean', boolean, 'ignoreIat')

test('options.audience must be string or array of strings', t => {
  ;['', false, [], Buffer, Buffer.from('foo'), 0, Infinity].forEach((val) => {
    t.throws(() => {
      JWT.verify(token, key, { audience: val })
    }, { instanceOf: TypeError, message: 'options.audience must be a string or an array of strings' })
    t.throws(() => {
      JWT.verify(token, key, { audience: [val] })
    }, { instanceOf: TypeError, message: 'options.audience must be a string or an array of strings' })
  })
})

test('options.algorithms must be string or array of strings', t => {
  ;['', false, [], Buffer, Buffer.from('foo'), 0, Infinity].forEach((val) => {
    t.throws(() => {
      JWT.verify(token, key, { algorithms: val })
    }, { instanceOf: TypeError, message: 'options.algorithms must be an array of strings' })
    t.throws(() => {
      JWT.verify(token, key, { algorithms: [val] })
    }, { instanceOf: TypeError, message: 'options.algorithms must be an array of strings' })
  })
})

test('options.crit must be string or array of strings', t => {
  ;['', false, [], Buffer, Buffer.from('foo'), 0, Infinity].forEach((val) => {
    t.throws(() => {
      JWT.verify(token, key, { crit: val })
    }, { instanceOf: TypeError, message: 'options.crit must be an array of strings' })
    t.throws(() => {
      JWT.verify(token, key, { crit: [val] })
    }, { instanceOf: TypeError, message: 'options.crit must be an array of strings' })
  })
})

test('options.now must be a valid date', t => {
  ;['', 'foo', [], {}, Buffer, Buffer.from('foo'), 0, Infinity, new Date('foo')].forEach((val) => {
    t.throws(() => {
      JWT.verify(token, key, { now: val })
    }, { instanceOf: TypeError, message: 'options.now must be a valid Date object' })
  })
})

test('options.ignoreIat & options.maxTokenAge may not be used together', t => {
  t.throws(() => {
    JWT.verify(token, key, { ignoreIat: true, maxTokenAge: '2d' })
  }, { instanceOf: TypeError, message: 'options.ignoreIat and options.maxTokenAge cannot used together' })
})

;['iat', 'exp', 'auth_time', 'nbf'].forEach((claim) => {
  test(`"${claim} must be a timestamp when provided"`, t => {
    ;['', 'foo', true, null, [], {}].forEach((val) => {
      t.throws(() => {
        const invalid = `e30.${base64url.JSON.encode({ [claim]: val })}.`
        JWT.verify(invalid, key)
      }, { instanceOf: errors.JWTClaimInvalid, message: `"${claim}" claim must be a unix timestamp` })
    })
  })
})

;['jti', 'acr', 'iss', 'nonce', 'sub', 'azp'].forEach((claim) => {
  test(`"${claim} must be a string when provided"`, t => {
    ;['', 0, 1, true, null, [], {}].forEach((val) => {
      t.throws(() => {
        const invalid = `e30.${base64url.JSON.encode({ [claim]: val })}.`
        JWT.verify(invalid, key)
      }, { instanceOf: errors.JWTClaimInvalid, message: `"${claim}" claim must be a string` })
    })
  })
})

;['aud', 'amr'].forEach((claim) => {
  test(`"${claim} must be a string when provided"`, t => {
    ;['', 0, 1, true, null, [], {}].forEach((val) => {
      t.throws(() => {
        const invalid = `e30.${base64url.JSON.encode({ [claim]: val })}.`
        JWT.verify(invalid, key)
      }, { instanceOf: errors.JWTClaimInvalid, message: `"${claim}" claim must be a string or array of strings` })
      t.throws(() => {
        const invalid = `e30.${base64url.JSON.encode({ [claim]: [val] })}.`
        JWT.verify(invalid, key)
      }, { instanceOf: errors.JWTClaimInvalid, message: `"${claim}" claim must be a string or array of strings` })
    })
  })
})

Object.entries({
  issuer: 'iss',
  nonce: 'nonce',
  subject: 'sub',
  jti: 'jti'
}).forEach(([option, claim]) => {
  test(`option.${option} validation fails`, t => {
    t.throws(() => {
      const invalid = `e30.${base64url.JSON.encode({ [claim]: 'foo' })}.`
      JWT.verify(invalid, key, { [option]: 'bar' })
    }, { instanceOf: errors.JWTClaimInvalid, message: `${option} mismatch` })
  })

  test(`option.${option} validation success`, t => {
    const token = JWT.sign({ [claim]: 'foo' }, key)
    JWT.verify(token, key, { [option]: 'foo' })
    t.pass()
  })
})

test('option.audience validation fails', t => {
  t.throws(() => {
    const invalid = `e30.${base64url.JSON.encode({ aud: 'foo' })}.`
    JWT.verify(invalid, key, { audience: 'bar' })
  }, { instanceOf: errors.JWTClaimInvalid, message: 'audience mismatch' })
  t.throws(() => {
    const invalid = `e30.${base64url.JSON.encode({ aud: ['foo'] })}.`
    JWT.verify(invalid, key, { audience: 'bar' })
  }, { instanceOf: errors.JWTClaimInvalid, message: 'audience mismatch' })
})

test('option.audience validation success', t => {
  let token = JWT.sign({ aud: 'foo' }, key)
  JWT.verify(token, key, { audience: 'foo' })
  token = JWT.sign({ aud: 'foo' }, key)
  JWT.verify(token, key, { audience: ['foo'] })
  token = JWT.sign({ aud: 'foo' }, key)
  JWT.verify(token, key, { audience: ['foo', 'bar'] })

  token = JWT.sign({ aud: ['foo', 'bar'] }, key)
  JWT.verify(token, key, { audience: 'foo' })
  token = JWT.sign({ aud: ['foo', 'bar'] }, key)
  JWT.verify(token, key, { audience: ['foo'] })
  token = JWT.sign({ aud: ['foo', 'bar'] }, key)
  JWT.verify(token, key, { audience: ['foo', 'bar'] })
  t.pass()
})

test('option.maxAuthAge requires iat to be in the payload', t => {
  t.throws(() => {
    const invalid = `e30.${base64url.JSON.encode({})}.`
    JWT.verify(invalid, key, { maxAuthAge: '30s' })
  }, { instanceOf: errors.JWTClaimInvalid, message: 'missing auth_time' })
})

const epoch = 1265328501
const now = new Date(epoch * 1000)

test('option.maxAuthAge checks auth_time', t => {
  t.throws(() => {
    const invalid = `e30.${base64url.JSON.encode({ auth_time: epoch - 31 })}.`
    JWT.verify(invalid, key, { maxAuthAge: '30s', now })
  }, { instanceOf: errors.JWTClaimInvalid, message: 'too much time has elapsed since the last End-User authentication' })
})

test('option.maxAuthAge checks auth_time (with tolerance)', t => {
  const token = JWT.sign({ auth_time: epoch - 31 }, key, { now })
  JWT.verify(token, key, { maxAuthAge: '30s', now, clockTolerance: '1s' })
  t.pass()
})

test('option.maxTokenAge requires iat to be in the payload', t => {
  t.throws(() => {
    const invalid = `e30.${base64url.JSON.encode({})}.`
    JWT.verify(invalid, key, { maxTokenAge: '30s' })
  }, { instanceOf: errors.JWTClaimInvalid, message: 'missing iat claim' })
})

test('option.maxTokenAge checks iat elapsed time', t => {
  t.throws(() => {
    const invalid = `e30.${base64url.JSON.encode({ iat: epoch - 31 })}.`
    JWT.verify(invalid, key, { maxTokenAge: '30s', now })
  }, { instanceOf: errors.JWTClaimInvalid, message: 'maxTokenAge exceeded' })
})

test('option.maxTokenAge checks iat (with tolerance)', t => {
  const token = JWT.sign({ iat: epoch - 31 }, key, { now })
  JWT.verify(token, key, { maxTokenAge: '30s', now, clockTolerance: '1s' })
  t.pass()
})

test('iat check (pass)', t => {
  const token = JWT.sign({ iat: epoch - 30 }, key, { iat: false })
  JWT.verify(token, key, { now })
  t.pass()
})

test('iat check (pass equal)', t => {
  const token = JWT.sign({}, key, { now })
  JWT.verify(token, key, { now })
  t.pass()
})

test('iat check (pass with tolerance)', t => {
  const token = JWT.sign({}, key, { now: new Date((epoch + 1) * 1000) })
  JWT.verify(token, key, { now, clockTolerance: '1s' })
  t.pass()
})

test('iat check (failed)', t => {
  const token = JWT.sign({}, key, { now: new Date((epoch + 1) * 1000) })
  t.throws(() => {
    JWT.verify(token, key, { now })
  }, { instanceOf: errors.JWTClaimInvalid, message: 'token issued in the future' })
})

test('iat check (passed because of ignoreIat)', t => {
  const token = JWT.sign({}, key, { now: new Date((epoch + 1) * 1000) })
  JWT.verify(token, key, { now, ignoreIat: true })
  t.pass()
})

test('exp check (pass)', t => {
  const token = JWT.sign({ exp: epoch + 30 }, key, { iat: false })
  JWT.verify(token, key, { now })
  t.pass()
})

test('exp check (pass equal - 1)', t => {
  const token = JWT.sign({ exp: epoch + 1 }, key, { iat: false })
  JWT.verify(token, key, { now })
  t.pass()
})

test('exp check (pass with tolerance)', t => {
  const token = JWT.sign({ exp: epoch }, key, { iat: false })
  JWT.verify(token, key, { now, clockTolerance: '1s' })
  t.pass()
})

test('exp check (failed equal)', t => {
  const token = JWT.sign({ exp: epoch }, key, { iat: false })
  t.throws(() => {
    JWT.verify(token, key, { now })
  }, { instanceOf: errors.JWTClaimInvalid, message: 'token is expired' })
})

test('exp check (failed normal)', t => {
  const token = JWT.sign({ exp: epoch - 1 }, key, { iat: false })
  t.throws(() => {
    JWT.verify(token, key, { now })
  }, { instanceOf: errors.JWTClaimInvalid, message: 'token is expired' })
})

test('exp check (passed because of ignoreExp)', t => {
  const token = JWT.sign({ exp: epoch - 10 }, key, { iat: false })
  JWT.verify(token, key, { now, ignoreExp: true })
  t.pass()
})

test('nbf check (pass)', t => {
  const token = JWT.sign({ nbf: epoch - 30 }, key, { iat: false })
  JWT.verify(token, key, { now })
  t.pass()
})

test('nbf check (pass equal)', t => {
  const token = JWT.sign({ nbf: epoch }, key, { iat: false })
  JWT.verify(token, key, { now })
  t.pass()
})

test('nbf check (pass with tolerance)', t => {
  const token = JWT.sign({ nbf: epoch + 1 }, key, { iat: false })
  JWT.verify(token, key, { now, clockTolerance: '1s' })
  t.pass()
})

test('nbf check (failed)', t => {
  const token = JWT.sign({ nbf: epoch + 10 }, key, { iat: false })
  t.throws(() => {
    JWT.verify(token, key, { now })
  }, { instanceOf: errors.JWTClaimInvalid, message: 'token is not active yet' })
})

test('nbf check (passed because of ignoreIat)', t => {
  const token = JWT.sign({ nbf: epoch + 10 }, key, { iat: false })
  JWT.verify(token, key, { now, ignoreNbf: true })
  t.pass()
})
