const path = require('path');

module.exports = {
  getError: (errors, property) => {
    try {
      //Returns: an object where the keys are the field names, and the values are the validation errors
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

  getFlashMessage(req, type) {
    let message = req.flash(type);
    if (message.length > 0) {
      message = message[0];
    } else {
      message = undefined;
    }
    return message;
  },

  setFlashMessage(req, type, message) {
    req.flash(type, message);
  },
};
