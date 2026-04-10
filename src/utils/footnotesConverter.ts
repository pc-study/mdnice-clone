// Convert external links (non-WeChat) to footnotes
export function convertLinksToFootnotes(content: string): string {
  const links: { text: string; url: string }[] = [];
  let counter = 0;

  // Find all markdown links that are NOT WeChat URLs
  const result = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text: string, url: string) => {
    // Keep WeChat links as-is
    if (url.includes('mp.weixin.qq.com')) return match;
    // Keep image links (starting with !)
    // This regex won't match image links since they start with ![
    counter++;
    links.push({ text, url });
    return `${text}[${counter}]`;
  });

  if (links.length === 0) return content;

  // Append references section
  const references = links.map((link, i) => `[${i + 1}] ${link.text}: ${link.url}`).join('\n');
  return result + '\n\n---\n\n**\u53c2\u8003\u8d44\u6599**\n\n' + references + '\n';
}
