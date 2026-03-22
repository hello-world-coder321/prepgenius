const fs = require('fs');
const pdfParse = require('pdf-parse');

async function test() {
  try {
    const files = fs.readdirSync('uploads').filter(f => f.endsWith('.pdf'));
    if (!files.length) return console.log('No PDFs found to test.');
    
    console.log('Testing PDF:', files[0]);
    const pdfBuffer = fs.readFileSync('uploads/' + files[0]);
    const data = await pdfParse(pdfBuffer);
    console.log('Success! Length:', data.text.length);
  } catch (err) {
    console.error('PDF Parse Error:', err.message);
  }
}
test();
