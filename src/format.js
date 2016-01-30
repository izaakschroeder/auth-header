import {quote, isToken, isScheme} from './util';

const xxx = (key) => (value) =>
  `${key}=${value && !isToken(value) ? quote(value) : value}`;

const build = (params) => {
  return params.reduce((prev, [key, values]) => {
    const transform = xxx(key);
    if (!isToken(key)) {
      throw new TypeError();
    }
    if (Array.isArray(values)) {
      return [...prev, ...values.map(transform)];
    }
    return [...prev, transform(values)];
  }, []);
};

const challenge = (params, options) => {
  if (Array.isArray(params)) {
    return build(params);
  } else if (typeof params === 'object') {
    return challenge(
      Object.keys(params).map((key) => [key, params[key]]),
      options
    );
  }
  throw new TypeError();
};

export default (scheme, token, params) => {
  const obj = typeof scheme === 'string' ? {scheme, token, params} : scheme;

  if (typeof obj !== 'object') {
    throw new TypeError();
  } else if (!isScheme(obj.scheme)) {
    throw new TypeError('Invalid scheme.');
  }

  return [
    obj.scheme,
    ...(typeof obj.token !== 'undefined' ? [obj.token] : []),
    ...(typeof obj.params !== 'undefined' ? challenge(obj.params) : []),
  ].join(' ');
};
