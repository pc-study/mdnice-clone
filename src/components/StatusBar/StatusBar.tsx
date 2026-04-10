import React, { useMemo } from 'react';
import { useEditorStore } from '../../store/editorStore';

export const StatusBar: React.FC = () => {
  const content = useEditorStore((s) => s.content);

  const stats = useMemo(() => {
    const lines = content.split('\n').length;
    const chars = content.length;
    // Chinese characters count as 1 word each, English words separated by spaces
    const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishWords = content
      .replace(/[\u4e00-\u9fff]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    const words = chineseChars + englishWords;
    return { lines, words, chars };
  }, [content]);

  return (
    <div style={{
      height: 28,
      backgroundColor: '#f7f7f7',
      borderTop: '1px solid #e0e0e0',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      fontSize: 12,
      color: '#888',
      gap: 16,
      flexShrink: 0,
    }}>
      <span>行数: {stats.lines}</span>
      <span>字数: {stats.words}</span>
      <span>字符数: {stats.chars}</span>
    </div>
  );
};
