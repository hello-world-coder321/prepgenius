// Study Suite Client-Side Logic
const socket = io();
let hintMode = false;
let extractedText = '';

function formatPdfText(text) {
  if (!text) return '';
  let cleaned = text.replace(/ {2,}/g, ' '); // remove excessive spaces
  cleaned = cleaned.replace(/([a-zA-Z,])\n([a-z])/g, '$1 $2'); // connect obvious mid-sentence breaks
  cleaned = cleaned.replace(/([.!?])\s*\n+([A-Z0-9])/g, '$1\n\n$2'); // double newline after sentence ends
  cleaned = cleaned.replace(/\n([•\-\*]|\d+\.)/g, '\n\n$1'); // double newline before list items
  return cleaned;
}

function toggleHintMode() {
  hintMode = !hintMode;
  const btn = document.getElementById('hint-toggle');
  if (hintMode) {
    btn.classList.add('bg-amber-500/20', 'border-amber-500/30', 'text-amber-400');
    btn.classList.remove('bg-white/5', 'border-white/10', 'text-gray-400');
    btn.textContent = '💡 Hint ON';
  } else {
    btn.classList.remove('bg-amber-500/20', 'border-amber-500/30', 'text-amber-400');
    btn.classList.add('bg-white/5', 'border-white/10', 'text-gray-400');
    btn.textContent = '💡 Get Hint';
  }
}

let currentDoubtImage = null;

function sendDoubt() {
  const input = document.getElementById('doubt-input');
  const question = input.value.trim();
  if (!question && !currentDoubtImage) return; // Allow sending just an image or just text
  addMessage(question || '📷 Sent an image', 'user');
  input.value = '';
  const typingId = addTypingIndicator();

  socket.emit('ask-doubt', {
    question,
    exam: document.querySelector('[data-exam]')?.dataset.exam || '',
    userId: document.querySelector('[data-user-id]')?.dataset.userId || '',
    getHint: hintMode,
    image: currentDoubtImage
  });
  
  currentDoubtImage = null; // reset after sending

  socket.once('doubt-response', (data) => {
    removeTypingIndicator(typingId);
    addMessage(data.message, data.type === 'error' ? 'error' : 'ai');
  });
}

function addMessage(text, type) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'flex items-start gap-3 animate-fade-in ' + (type === 'user' ? 'flex-row-reverse' : '');

  const aiAvatar = '<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg></div>';
  const userAvatar = '<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">Y</div>';

  const bgClass = type === 'user' ? 'bg-brand-600/20 border-brand-500/20' : type === 'error' ? 'bg-red-500/10 border-red-500/20' : 'glass-card';
  let content = text;
  if (type === 'ai' && typeof marked !== 'undefined') {
    try { content = marked.parse(text); } catch(e) {}
  }

  div.innerHTML = `${type === 'user' ? userAvatar : aiAvatar}<div class="${bgClass} p-4 max-w-[85%] rounded-2xl border border-white/5"><div class="text-sm text-gray-300">${content}</div></div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function addTypingIndicator() {
  const container = document.getElementById('chat-messages');
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'flex items-start gap-3 animate-fade-in';
  div.id = id;
  div.innerHTML = '<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1"/></svg></div><div class="glass-card p-4"><div class="flex gap-1"><div class="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div><div class="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style="animation-delay:150ms"></div><div class="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style="animation-delay:300ms"></div></div></div>';
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function switchPanel(panel) {
  ['upload', 'library', 'summary', 'youtube', 'viewer'].forEach(p => {
    document.getElementById('panel-' + p).classList.toggle('hidden', p !== panel);
    const tab = document.getElementById('tab-' + p);
    if (p === panel) {
      tab.classList.add('bg-brand-600', 'text-white');
      tab.classList.remove('bg-white/5', 'text-gray-400');
    } else {
      tab.classList.remove('bg-brand-600', 'text-white');
      tab.classList.add('bg-white/5', 'text-gray-400');
    }
  });
  // Auto-load library when switching to it
  if (panel === 'library') loadLibrary();
}

// ── Library Functions ──

async function loadLibrary() {
  const container = document.getElementById('library-list');
  container.innerHTML = '<div class="text-center py-8 text-gray-500"><div class="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>Loading...</div>';

  try {
    const res = await fetch('/study/documents');
    const docs = await res.json();

    if (!docs.length) {
      container.innerHTML = '<div class="text-center py-8"><svg class="w-10 h-10 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg><p class="text-sm text-gray-500">No documents yet.</p><p class="text-xs text-gray-600 mt-1">Upload a PDF or image to get started!</p></div>';
      return;
    }

    container.innerHTML = docs.map(doc => {
      const date = new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const sizeKB = (doc.size / 1024).toFixed(1);
      const icon = doc.mimetype === 'application/pdf' ? '📄' : '🖼️';
      return `
        <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-brand-500/30 transition-all group">
          <span class="text-2xl">${icon}</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-white font-medium truncate">${doc.originalName}</p>
            <p class="text-xs text-gray-500">${sizeKB} KB · ${date}</p>
          </div>
          <div class="flex items-center gap-1 opacity-100 transition-opacity">
            <button onclick="openDocument('${doc._id}')" class="p-2 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 transition-colors" title="Open">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
            <button onclick="deleteDocument('${doc._id}')" class="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>`;
    }).join('');
  } catch (e) {
    container.innerHTML = '<p class="text-center text-red-400 py-8">Failed to load library.</p>';
  }
}

async function openDocument(id) {
  try {
    const res = await fetch('/study/documents/' + id);
    const doc = await res.json();
    if (doc.error) throw new Error(doc.error);

    if (doc.extractedText) {
      extractedText = doc.extractedText;
      let cleanText = formatPdfText(doc.extractedText);
      let htmlContent = typeof marked !== 'undefined' ? marked.parse(cleanText) : cleanText;
      document.getElementById('viewer-content').innerHTML =
        '<div class="text-left text-white"><p class="text-xs text-brand-400 font-semibold mb-6 pb-2 border-b border-white/10">📄 ' + doc.originalName + '</p><div class="prose prose-invert prose-base lg:prose-lg max-w-none text-gray-200 leading-loose">' + htmlContent + '</div></div>';
      document.getElementById('summary-text').value = doc.extractedText;
      switchPanel('viewer');
    } else {
      document.getElementById('viewer-content').innerHTML =
        '<div class="text-center py-8"><p class="text-sm text-gray-300 mb-2">📎 ' + doc.originalName + '</p><p class="text-xs text-gray-500">This file has no extracted text.</p></div>';
      switchPanel('viewer');
    }
  } catch (e) {
    alert('Failed to open document: ' + e.message);
  }
}

let documentToDelete = null;

function deleteDocument(id) {
  documentToDelete = id;
  const modal = document.getElementById('delete-modal');
  modal.classList.add('active');
}

function closeDeleteModal() {
  const modal = document.getElementById('delete-modal');
  modal.classList.remove('active');
  setTimeout(() => {
    documentToDelete = null;
  }, 300);
}

document.addEventListener('DOMContentLoaded', () => {
  const cancelBtn = document.getElementById('cancel-delete-btn');
  const confirmBtn = document.getElementById('confirm-delete-btn');

  if (cancelBtn) cancelBtn.addEventListener('click', closeDeleteModal);

  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      if (!documentToDelete) return;
      const id = documentToDelete;
      
      const btnOriginalText = confirmBtn.innerHTML;
      confirmBtn.innerHTML = '<div class="flex items-center justify-center gap-2"><div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Deleting...</div>';
      confirmBtn.disabled = true;

      try {
        const res = await fetch('/study/documents/' + id, { method: 'DELETE' });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        loadLibrary();
        closeDeleteModal();
      } catch (e) {
        alert('Failed to delete: ' + e.message);
      } finally {
        confirmBtn.innerHTML = btnOriginalText;
        confirmBtn.disabled = false;
      }
    });
  }
  
  // Close modal on backdrop click
  const modal = document.getElementById('delete-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeDeleteModal();
    });
  }
});

async function uploadFile(input) {
  if (!input.files[0]) return;
  const formData = new FormData();
  formData.append('file', input.files[0]);
  document.getElementById('upload-status').innerHTML = '<span class="text-brand-400">Uploading...</span>';
  try {
    const res = await fetch('/study/upload', { method: 'POST', body: formData });
    let data;
    try { 
      data = await res.json(); 
    } catch (e) { 
      throw new Error(res.status === 413 ? 'File too large (Max 20MB)' : 'Server error: ' + res.status); 
    }
    
    if (data.error) throw new Error(data.error);
    
    document.getElementById('upload-status').innerHTML = '<span class="text-accent-400">✓ ' + data.originalName + ' uploaded & saved to library!</span>';
    if (data.extractedText) {
      extractedText = data.extractedText;
      document.getElementById('summary-text').value = extractedText;
      let cleanText = formatPdfText(data.extractedText);
      let htmlContent = typeof marked !== 'undefined' ? marked.parse(cleanText) : cleanText;
      document.getElementById('viewer-content').innerHTML = '<div class="text-left text-white"><p class="text-xs text-brand-400 font-semibold mb-6 pb-2 border-b border-white/10">📄 ' + data.originalName + '</p><div class="prose prose-invert prose-base lg:prose-lg max-w-none text-gray-200 leading-loose">' + htmlContent + '</div></div>';
      switchPanel('viewer');
    }
  } catch (e) { document.getElementById('upload-status').innerHTML = '<span class="text-red-400">Upload failed: ' + e.message + '</span>'; }
}

function uploadDoubtImage(input) {
  if (!input.files[0]) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    currentDoubtImage = e.target.result;
    addMessage('📷 Added image to your doubt. Ask a question about it!', 'user');
  };
  reader.readAsDataURL(input.files[0]);
}

async function summarize(mode) {
  const text = document.getElementById('summary-text').value.trim();
  if (!text) { alert('Please paste or upload some text first.'); return; }
  const resultDiv = document.getElementById('summary-result');
  resultDiv.classList.remove('hidden');
  resultDiv.innerHTML = '<div class="flex items-center gap-2"><div class="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"></div><span class="text-gray-400">Generating summary...</span></div>';
  try {
    const res = await fetch('/study/summarize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, mode }) });
    const data = await res.json();
    let htmlOutput = typeof marked !== 'undefined' ? marked.parse(data.summary || 'No result.') : (data.summary || 'No result.');
    resultDiv.innerHTML = '<div class="prose prose-invert prose-sm max-w-none">' + htmlOutput + '</div>';
  } catch (e) { resultDiv.innerHTML = '<span class="text-red-400">Summary failed.</span>'; }
}

// ── YouTube Functions ──

async function processYouTube() {
  const urlInput = document.getElementById('youtube-url');
  const url = urlInput.value.trim();
  if (!url) { alert('Please paste a YouTube URL.'); return; }

  const btn = document.getElementById('youtube-btn');
  const resultDiv = document.getElementById('youtube-result');
  const previewDiv = document.getElementById('youtube-preview');

  btn.innerHTML = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>';
  btn.disabled = true;
  resultDiv.classList.remove('hidden');
  resultDiv.innerHTML = '<div class="flex items-center gap-2"><div class="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"></div><span class="text-gray-400">Fetching transcript & generating notes...</span></div>';

  try {
    const res = await fetch('/youtube/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // Show video preview
    if (data.videoId) {
      previewDiv.classList.remove('hidden');
      document.getElementById('youtube-iframe').src = `https://www.youtube.com/embed/${data.videoId}`;
    }

    // Show notes
    let htmlOutput = typeof marked !== 'undefined' ? marked.parse(data.notes || 'No notes generated.') : (data.notes || 'No notes generated.');
    resultDiv.innerHTML = '<div class="prose prose-invert prose-sm max-w-none">' + htmlOutput + '</div>';
  } catch (e) {
    resultDiv.innerHTML = '<span class="text-red-400">Failed: ' + e.message + '</span>';
  } finally {
    btn.innerHTML = '🎬 Process';
    btn.disabled = false;
  }
}
