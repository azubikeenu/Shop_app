const nodemailer = require('nodemailer');
const { htmlToText } = require('html-to-text');
const ejs = require('ejs');

module.exports = class Email {
  constructor(user) {
    this.to = user.email;
    this.from = `Shop Admin`;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: `smtp.mailtrap.io`,
      port: 2525,
      auth: {
        user: `b6ab7ffb4ff93f`,
        pass: `1bbd513c19b3d2`,
      },
    });
  }

  async send(template, subject) {
    let html = '';
    ejs.renderFile(
      `${__dirname}/../views/email/${template}.ejs`,
      {
        email: this.email,
        from: this.from,
      },
      function (err, str) {
        if (err) {
          throw new Error('File cannot be rendered' + err);
        }
        html = str;
      }
    );
    // define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };
    //create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(
      'welcome',
      'Welcome to Shop App we are glad to have you here '
    );
  }
};
