/**
 * Vector Store Service
 * 
 * Pure-JS vector similarity search using TF-IDF keyword matching.
 * Stores document chunks and performs text similarity search
 * for RAG (Retrieval Augmented Generation).
 * 
 * Indices are persisted to disk per-user in data/vectors/.
 */

const fs = require('fs');
const path = require('path');

const VECTORS_DIR = path.join(__dirname, '..', 'data', 'vectors');
const CHUNK_SIZE = 500;      // chars per chunk
const CHUNK_OVERLAP = 50;    // overlap between chunks

// In-memory store: { userId: { docId: [{ text, keywords }] } }
const userIndices = {};

/**
 * Chunk text into overlapping pieces
 */
function chunkText(text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  if (!text || text.length === 0) return chunks;

  // Clean up text
  text = text.replace(/\s+/g, ' ').trim();

  for (let i = 0; i < text.length; i += size - overlap) {
    const chunk = text.substring(i, i + size).trim();
    if (chunk.length > 20) { // skip tiny chunks
      chunks.push(chunk);
    }
  }
  return chunks;
}

/**
 * Extract keywords from text (simple TF approach)
 */
function extractKeywords(text) {
  // Common stop words to exclude
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
    'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
    'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
    'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'just', 'because', 'but', 'and', 'or', 'if', 'while', 'this', 'that',
    'these', 'those', 'it', 'its', 'he', 'she', 'they', 'them', 'we', 'us',
    'what', 'which', 'who', 'whom', 'i', 'me', 'my', 'you', 'your',
  ]);

  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  // Count frequency
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  return freq;
}

/**
 * Compute similarity between two keyword frequency maps
 */
function keywordSimilarity(queryFreq, chunkFreq) {
  let score = 0;
  let queryNorm = 0;
  let chunkNorm = 0;

  const allWords = new Set([...Object.keys(queryFreq), ...Object.keys(chunkFreq)]);
  for (const word of allWords) {
    const qf = queryFreq[word] || 0;
    const cf = chunkFreq[word] || 0;
    score += qf * cf;
    queryNorm += qf * qf;
    chunkNorm += cf * cf;
  }

  const denom = Math.sqrt(queryNorm) * Math.sqrt(chunkNorm);
  return denom === 0 ? 0 : score / denom;
}

/**
 * Get path for user's vector index file
 */
function getIndexPath(userId) {
  return path.join(VECTORS_DIR, `${userId}.json`);
}

/**
 * Load user's index from disk
 */
function loadIndex(userId) {
  if (userIndices[userId]) return userIndices[userId];

  const indexPath = getIndexPath(userId);
  try {
    if (fs.existsSync(indexPath)) {
      const data = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      userIndices[userId] = data;
      return data;
    }
  } catch (err) {
    console.error('Load index error:', err.message);
  }

  userIndices[userId] = {};
  return userIndices[userId];
}

/**
 * Save user's index to disk
 */
function saveIndex(userId) {
  try {
    if (!fs.existsSync(VECTORS_DIR)) {
      fs.mkdirSync(VECTORS_DIR, { recursive: true });
    }
    const indexPath = getIndexPath(userId);
    fs.writeFileSync(indexPath, JSON.stringify(userIndices[userId] || {}));
  } catch (err) {
    console.error('Save index error:', err.message);
  }
}

/**
 * Add a document's text to the index
 * @param {string} userId
 * @param {string} docId
 * @param {string} text
 * @returns {number} Number of chunks indexed
 */
function addDocument(userId, docId, text) {
  if (!text || text.length < 30) return 0;

  const chunks = chunkText(text);
  if (chunks.length === 0) return 0;

  console.log(`📊 Indexing ${chunks.length} chunks for doc ${docId}...`);

  const index = loadIndex(userId);
  index[docId] = [];

  for (const chunk of chunks) {
    const keywords = extractKeywords(chunk);
    index[docId].push({ text: chunk, keywords });
  }

  saveIndex(userId);
  console.log(`✅ Indexed ${index[docId].length} chunks for doc ${docId}`);
  return index[docId].length;
}

/**
 * Search for similar text chunks across all user's documents
 * @param {string} userId
 * @param {string} query
 * @param {number} k - number of results
 * @returns {Array<{text: string, score: number, docId: string}>}
 */
function searchSimilar(userId, query, k = 3) {
  const index = loadIndex(userId);
  const allChunks = [];

  // Flatten all document chunks
  for (const [docId, chunks] of Object.entries(index)) {
    for (const chunk of chunks) {
      allChunks.push({ ...chunk, docId });
    }
  }

  if (allChunks.length === 0) return [];

  // Extract query keywords
  const queryKeywords = extractKeywords(query);
  if (Object.keys(queryKeywords).length === 0) return [];

  // Calculate similarities
  const scored = allChunks.map(chunk => ({
    text: chunk.text,
    docId: chunk.docId,
    score: keywordSimilarity(queryKeywords, chunk.keywords || extractKeywords(chunk.text)),
  }));

  // Sort by score descending and return top-k
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).filter(s => s.score > 0.05);
}

/**
 * Remove a document from the index
 */
function removeDocument(userId, docId) {
  const index = loadIndex(userId);
  if (index[docId]) {
    delete index[docId];
    saveIndex(userId);
    console.log(`🗑️ Removed index for doc ${docId}`);
  }
}

/**
 * Get stats about a user's index
 */
function getStats(userId) {
  const index = loadIndex(userId);
  const docCount = Object.keys(index).length;
  const chunkCount = Object.values(index).reduce((sum, chunks) => sum + chunks.length, 0);
  return { docCount, chunkCount };
}

module.exports = {
  addDocument,
  searchSimilar,
  removeDocument,
  getStats,
  chunkText,
};
