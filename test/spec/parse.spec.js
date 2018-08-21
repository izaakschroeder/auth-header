import parse from '../../src/parse';

describe('parse', () => {
  it('should fail on invalid schemes', () => {
    expect(() => {
      parse('@foo');
    }).toThrow(TypeError);
  });

  it('should fail if a boolean', () => {
    expect(() => {
      parse(true);
    }).toThrow(TypeError);
  });

  it('should fail if an object', () => {
    expect(() => {
      parse({});
    }).toThrow(TypeError);
  });

  it('should fail if null', () => {
    expect(() => {
      parse(null);
    }).toThrow(TypeError);
  });

  it('should coalesce many values', () => {
    const result = parse('foo a=1 a=2 a=3');
    expect(result).toEqual({
      scheme: 'foo',
      token: null,
      params: {
        a: ['1', '2', '3'],
      },
    });
  });

  it('should handle Basic', () => {
    const result = parse('Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==');
    expect(result).toEqual({
      scheme: 'Basic',
      token: 'QWxhZGRpbjpvcGVuIHNlc2FtZQ==',
      params: {},
    });
  });

  it('should handle Basic with post-parameters', () => {
    const result = parse('Basic 2932ff== realm="with\\"quote"');
    expect(result).toEqual({
      scheme: 'Basic',
      token: '2932ff==',
      params: {
        realm: 'with"quote',
      },
    });
  });

  it('should handle Basic with pre-parameters', () => {
    const result = parse('Basic realm="foo" QWxhZGRpbjpvcGVuIHNlc2FtZQ==');
    expect(result).toEqual({
      scheme: 'Basic',
      token: 'QWxhZGRpbjpvcGVuIHNlc2FtZQ==',
      params: {
        realm: 'foo',
      },
    });
  });

  it('should handle AWS4-HMAC-SHA256', () => {
    const result = parse(
      // eslint-disable-next-line max-len
      'AWS4-HMAC-SHA256 Credential=EXAMPLE/20130524/us-east-1/s3/aws4_request, SignedHeaders=host;range;x-amz-date, Signature=fe5f80f77d5fa3beca038a248ff02',
    );
    expect(result).toEqual({
      scheme: 'AWS4-HMAC-SHA256',
      token: null,
      params: {
        Credential: 'EXAMPLE/20130524/us-east-1/s3/aws4_request',
        SignedHeaders: 'host;range;x-amz-date',
        Signature: 'fe5f80f77d5fa3beca038a248ff02',
      },
    });
  });

  it('should handle Bearer', () => {
    const result = parse('Bearer mF_9.B5f-4.1JqM');
    expect(result).toEqual({
      scheme: 'Bearer',
      token: 'mF_9.B5f-4.1JqM',
      params: {},
    });
  });

  it('should handle Digest', () => {
    const result = parse(
      // eslint-disable-next-line max-len
      'Digest realm="testrealm@host.com", qop="auth,auth-int", nonce="dcd98b7102dd2f0e8b11d0f600bfb0c093", opaque="5ccc069c403ebaf9f0171e9517f40e41"',
    );
    expect(result).toEqual({
      scheme: 'Digest',
      token: null,
      params: {
        realm: 'testrealm@host.com',
        qop: 'auth,auth-int',
        nonce: 'dcd98b7102dd2f0e8b11d0f600bfb0c093',
        opaque: '5ccc069c403ebaf9f0171e9517f40e41',
      },
    });
  });

  it('should handle custom schemes', () => {
    const result = parse('MyAuth api=42146432 api=934054 foo=bar baz="ding"');
    expect(result).toEqual({
      scheme: 'MyAuth',
      token: null,
      params: {
        api: ['42146432', '934054'],
        foo: 'bar',
        baz: 'ding',
      },
    });
  });
});
