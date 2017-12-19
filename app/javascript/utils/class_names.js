export default function (...args) {
  const classNames = [];
  args.forEach(arg => {
    if (typeof arg === 'string') {
      classNames.push(arg);
    } else if (typeof arg === 'object') {
      Object.keys(arg).forEach(className => {
        const value = arg[className];
        if (value) {
          classNames.push(typeof value === 'boolean' ? className : value);
        }
      });
    } else {
      // Invalid args
    }
  });

  return classNames.join(' ');
}