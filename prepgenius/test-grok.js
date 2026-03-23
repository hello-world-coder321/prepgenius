const grokAI = require('./services/grokAI');
require('dotenv').config();

async function test() {
  console.log('Testing Grok API...');
  console.log('Key:', process.env.GROK_API_KEY ? process.env.GROK_API_KEY.substring(0, 10) + '...' : 'MISSING');
  try {
    const res = await grokAI.chatCompletion([{ role: 'user', content: 'Say hello world' }]);
    console.log('✅ Success:', res);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}
test();
