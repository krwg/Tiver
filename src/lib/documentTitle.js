export function setDocumentTitle(title) {
  document.title = title.includes('Tiver') ? title : `${title} · Tiver`;
}
