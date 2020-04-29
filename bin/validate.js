let createParseNumber = ({ min, name, required = true }) => {
  return (value) => {
    if (!value && !required) {
      return undefined;
    }

    try {
      let number = parseInt(value);

      if (isNaN(number)) {
        console.error(`${name} must be a number`);
      }

      if (number < min) {
        console.error(`${name} must be >= ${min}`);
      }

      return number;
    } catch (error) {
      console.error(`Unable to parse ${name}`);
    }
  };
};

module.exports = {
  createParseNumber,
};
