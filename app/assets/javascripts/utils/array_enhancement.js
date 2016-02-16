export function arrayMinus(a, b) {
  const sorter = (x, y) => x > y;
  const arrayA = a.sort(sorter);
  const arrayB = b.sort(sorter);
  const result = [];
  let i = 0;
  let j = 0;
  while (i < arrayA.length && j < arrayB.length) {
    const eleA = arrayA[i];
    const eleB = arrayB[j];

    if (eleB > eleA) {
      result.push(eleA);
      i++;
    } else if (eleB === eleA) {
      i++;
      j++;
    } else {
      j++;
    }
  }

  return result.concat(arrayA.slice(i));
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