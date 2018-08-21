import format from '../../src/format';

describe('format', () => {
  it('should produce correct token property', () => {
    const res = format({
      scheme: 'Basic',
      token: 'QWxhZGRpbjpvcGVuIHNlc2FtZQ==',
    });
    expect(res).toEqual('Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==');
  });

  it('should quote non-token values', () => {
    const res = format({
      scheme: 'Basic',
      token: '2932ff==',
      params: {
        realm: 'with"quote',
      },
    });
    expect(res).toEqual('Basic 2932ff== realm="with\\"quote"');
  });

  it('should handle array values', () => {
    const res = format({
      scheme: 'MyAuth',
      params: {
        api: ['42146432', '934054'],
        foo: 'bar',
        baz: 'ding',
      },
    });
    expect(res).toEqual('MyAuth api=42146432 api=934054 foo=bar baz=ding');
  });

  it('should handle simple strings', () => {
    expect(format('Basic')).toEqual('Basic');
  });

  it('should fail on invalid schemes', () => {
    expect(() => {
      format(':');
    }).toThrow(TypeError);
  });

  it('should fail if input is not an object', () => {
    expect(() => {
      format(false);
    }).toThrow(TypeError);
  });

  it('fail if params are not an object', () => {
    expect(() => {
      format({
        scheme: 'hello',
        params: false,
      });
    }).toThrow(TypeError);
  });

  it('should fail if param keys are not tokens', () => {
    expect(() => {
      format({
        scheme: 'hello',
        params: {
          ':bar': 'hi',
        },
      });
    }).toThrow(TypeError);
  });

  it('should fail if params array', () => {
    expect(() => {
      format({
        scheme: 'hello',
        params: [false],
      });
    }).toThrow(TypeError);
  });
});
