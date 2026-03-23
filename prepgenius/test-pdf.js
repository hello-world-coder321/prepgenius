const fs = require('fs');
const pdfParse = require('pdf-parse');

async function test() {
  try {
    const { PDFParse } = require('pdf-parse');
    const pdfBuffer = fs.readFileSync('uploads/1774173456738-PDF53447261505915147411662102202604260656294621022026042606562946.pdf');
    const parser = new PDFParse({ data: pdfBuffer });
    const data = await parser.getText();
    console.log("Success! Extracted", data.text.length, "chars");
  } catch (err) {
    console.error("Failed to parse:");
    console.error(err);
  }
}
test();
