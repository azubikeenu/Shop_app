const fs = require('fs');
const pdf = require('pdf-creator-node');
const path = require('path');

module.exports.generatePdf = (template, data, options, filePath) => {
  const html = fs.readFileSync(path.join(__dirname, template), 'utf-8');

  const document = {
    html,
    data,
    path: filePath,
  };
  return pdf.create(document, options);

};

module.exports.options = {
  formate: 'A3',
  orientation: 'portrait',
  border: '2mm',
  header: {
    height: '15mm',
    contents:
      '<h4 style=" color: red;font-size:20;font-weight:800;text-align:center;">CUSTOMER INVOICE</h4>',
  },
  footer: {
    height: '20mm',
    contents: {
      first: 'Cover page',
      2: 'Second page',
      default:
        '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
      last: 'Last Page',
    },
  },
};
