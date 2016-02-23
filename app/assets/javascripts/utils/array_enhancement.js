export function arrayMinus(a, b) {
  const result = [];
  a.forEach(x => {
    if (b.indexOf(x) < 0) {
      result.push(x);
    }
  });

  return result;
}

export function arrayPlus(a, b) {
  const result = a.slice();

  b.forEach(x => {
    if (a.indexOf(x) < 0) {
      result.push(x);
    }
  });

  return result;
}