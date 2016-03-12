export default function (classSet) {
  const classNames = [];
  Object.keys(classSet).forEach(className => {
    const value = classSet[className];
    if (value) {
      classNames.push(typeof value === 'boolean' ? className : value);
    }
  });

  return classNames.join(' ');
}