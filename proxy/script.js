const form = document.getElementById('proxyForm');
const urlInput = document.getElementById('urlInput');
const resultView = document.getElementById('proxyFrame');
const statusText = document.getElementById('statusText');
const homeBtn = document.getElementById('homeBtn');
const previewBtn = document.getElementById('previewBtn');
const newTabBtn = document.getElementById('newTabBtn');
const fallbackPanel = document.getElementById('fallbackPanel');

const defaultQuery = 'hello';
const bingProxyBase = 'https://r.jina.ai/http://www.bing.com/search';

function buildBingSearchUrl(rawValue) {
  const query = (rawValue || '').trim() || defaultQuery;
  return `${bingProxyBase}?q=${encodeURIComponent(query)}`;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;');
}

function formatInlineText(text) {
  let safe = escapeHtml(text);

  safe = safe.replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)(?:\s+"[^"]*")?\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>');
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  safe = safe.replace(/\*(.+?)\*/g, '<em>$1</em>');
  safe = safe.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noreferrer noopener">$1</a>');

  return safe;
}

function formatMarkdown(markdown) {
  const lines = markdown.split(/\n/);
  let html = '';
  let inList = false;

  const closeList = () => {
    if (inList) {
      html += '</ul>';
      inList = false;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      html += '<div class="spacer"></div>';
      return;
    }

    if (/^#+\s+/.test(trimmed)) {
      closeList();
      html += `<h2>${formatInlineText(trimmed.replace(/^#+\s+/, ''))}</h2>`;
      return;
    }

    if (/^\*\s+/.test(trimmed)) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${formatInlineText(trimmed.replace(/^\*\s+/, ''))}</li>`;
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      closeList();
      html += `<p>${formatInlineText(trimmed.replace(/^\d+\.\s+/, ''))}</p>`;
      return;
    }

    closeList();
    html += `<p>${formatInlineText(trimmed)}</p>`;
  });

  closeList();
  return html;
}

function showFallbackNotice(message) {
  fallbackPanel.classList.remove('hidden');
  fallbackPanel.innerHTML = `<h2>Bing proxy issue</h2><p>${message}</p>`;
}

function hideFallbackNotice() {
  fallbackPanel.classList.add('hidden');
}

async function loadUrl(rawValue) {
  const query = (rawValue || '').trim() || defaultQuery;
  urlInput.value = query;
  statusText.textContent = `Searching Bing for “${query}”`;

  try {
    const response = await fetch(buildBingSearchUrl(query), {
      headers: {
        Accept: 'text/plain, text/markdown, */*'
      }
    });

    if (!response.ok) {
      throw new Error('The proxy could not load search results.');
    }

    const text = await response.text();
    resultView.innerHTML = formatMarkdown(text);
    hideFallbackNotice();
    statusText.textContent = 'Bing results loaded';
  } catch (error) {
    resultView.innerHTML = `<div class="error-card">${escapeHtml(error.message || 'Unable to fetch results right now.')}</div>`;
    showFallbackNotice('The Bing proxy is temporarily unavailable. Try again in a moment.');
    statusText.textContent = 'Proxy unavailable';
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  loadUrl(urlInput.value);
});

homeBtn.addEventListener('click', () => {
  loadUrl(defaultQuery);
});

previewBtn.addEventListener('click', () => {
  loadUrl(urlInput.value);
});

newTabBtn.addEventListener('click', () => {
  const query = (urlInput.value || '').trim() || defaultQuery;
  const target = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
  window.open(target, '_blank', 'noopener');
  statusText.textContent = 'Opened search in a new tab';
});

hideFallbackNotice();
loadUrl(defaultQuery);
