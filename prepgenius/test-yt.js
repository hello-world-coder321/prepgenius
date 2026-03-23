const { YoutubeTranscript } = require('./services/youtubeTranscript');

async function test() {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript('dQw4w9WgXcQ');
    console.log(transcript.map(t => t.text).join(' ').substring(0, 50));
  } catch (err) {
    console.error('Error fetching:', err.message);
  }
}
test();
