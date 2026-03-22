const fs = require('fs');
const pdfParse = require('pdf-parse');
async function test() {
  const pdfBuffer = fs.readFileSync('uploads/1774161866738-9cb7603b-28e7-4ca0-8ace-0f0e46f39988.pdf');
  const data = await pdfParse(pdfBuffer);
  console.log("TEXT START\n" + data.text + "\nTEXT END");
}
test();
