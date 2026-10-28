// OCR 100% no navegador com Tesseract.js (o servidor não processa imagens).

const MAX_SIDE = 2200;

/** Redimensiona, converte para tons de cinza e aumenta o contraste para melhorar o OCR de manuscritos. */
async function preprocess(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  const contrast = 1.5;
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const v = Math.max(0, Math.min(255, (gray - 128) * contrast + 128));
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/** Limpa quebras de linha do OCR: junta linhas do mesmo parágrafo e preserva parágrafos. */
function cleanText(raw) {
  return raw
    .replace(/\r/g, '')
    .replace(/-\n(?=\p{Ll})/gu, '')
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').replace(/[ \t]{2,}/g, ' ').trim())
    .filter(Boolean)
    .join('\n\n');
}

export async function recognizeEssay(file, onProgress) {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('por', 1, {
    logger: (m) => {
      if (onProgress && typeof m.progress === 'number') onProgress(m.status, m.progress);
    },
  });
  try {
    const image = await preprocess(file).catch(() => file);
    const { data } = await worker.recognize(image);
    return { text: cleanText(data.text || ''), confidence: Math.round(data.confidence || 0) };
  } finally {
    await worker.terminate();
  }
}
