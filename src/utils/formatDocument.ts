// Add space between Chinese and English/numbers (pangu.js style)
function addSpaceBetweenCJK(text: string): string {
  // CJK followed by half-width
  text = text.replace(/([\u4e00-\u9fff\u3400-\u4dbf])([A-Za-z0-9`$])/g, '$1 $2');
  // Half-width followed by CJK
  text = text.replace(/([A-Za-z0-9`$%])([\u4e00-\u9fff\u3400-\u4dbf])/g, '$1 $2');
  return text;
}

// Remove excessive blank lines (keep at most 1 blank line)
function removeExcessiveBlankLines(text: string): string {
  return text.replace(/\n{3,}/g, '\n\n');
}

// Normalize list markers to use -
function normalizeListMarkers(text: string): string {
  return text.replace(/^(\s*)[*+] /gm, '$1- ');
}

export function formatDocument(content: string): string {
  let result = content;
  result = addSpaceBetweenCJK(result);
  result = removeExcessiveBlankLines(result);
  result = normalizeListMarkers(result);
  // Ensure file ends with newline
  if (!result.endsWith('\n')) result += '\n';
  return result;
}
