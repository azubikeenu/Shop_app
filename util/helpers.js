const path = require('path');

module.exports = {
  getError: (errors, property) => {
    try {
      return errors.mapped()[property].msg;
    } catch (error) {
      return '';
    }
  },
  cropText: (text, limit = 100) => {
    const newText = [];
    if (text.length > limit) {
      text.split(' ').reduce((acc, curr) => {
        if (curr.length + acc <= limit) {
          newText.push(curr);
        }
        return acc + curr.length;
      }, 0);

      return `${newText.join(' ')} ...`;
    }
    return text;
  },
  getPath: path.dirname(process.mainModule.filename),
};
