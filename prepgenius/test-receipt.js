const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function testPdf() {
  try {
    const pdfBuffer = fs.readFileSync('uploads/1774173456738-PDF53447261505915147411662102202604260656294621022026042606562946.pdf');
    const parser = new PDFParse({ data: pdfBuffer });
    const result = await parser.getText();
    await parser.destroy();
    
    console.log("Success! Extracted characters:", result.text.length);
    console.log(result.text.substring(0, 200));
  } catch (err) {
    console.error("PDF PARSE ERROR DETECTED:");
    console.error(err);
  }
}

testPdf();
