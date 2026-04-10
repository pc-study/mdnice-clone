import { EditorView } from '@codemirror/view';

export function wrapSelection(view: EditorView, before: string, after: string) {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  const replacement = before + (selected || '文本') + after;
  view.dispatch({
    changes: { from, to, insert: replacement },
    selection: { anchor: from + before.length, head: from + replacement.length - after.length },
  });
  view.focus();
}

export function prefixLines(view: EditorView, prefix: string) {
  const { from, to } = view.state.selection.main;
  const line1 = view.state.doc.lineAt(from);
  const line2 = view.state.doc.lineAt(to);
  const changes: { from: number; to: number; insert: string }[] = [];
  for (let i = line1.number; i <= line2.number; i++) {
    const line = view.state.doc.line(i);
    changes.push({ from: line.from, to: line.from, insert: prefix });
  }
  view.dispatch({ changes });
  view.focus();
}

export function prefixLinesOrdered(view: EditorView) {
  const { from, to } = view.state.selection.main;
  const line1 = view.state.doc.lineAt(from);
  const line2 = view.state.doc.lineAt(to);
  const changes: { from: number; to: number; insert: string }[] = [];
  let num = 1;
  for (let i = line1.number; i <= line2.number; i++) {
    const line = view.state.doc.line(i);
    changes.push({ from: line.from, to: line.from, insert: `${num}. ` });
    num++;
  }
  view.dispatch({ changes });
  view.focus();
}

export function insertCodeBlock(view: EditorView) {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  const replacement = '```javascript\n' + (selected || '// code here') + '\n```';
  view.dispatch({
    changes: { from, to, insert: replacement },
  });
  view.focus();
}

export function insertLink(view: EditorView) {
  wrapSelection(view, '[', '](url)');
}

export function insertImage(view: EditorView) {
  const { from, to } = view.state.selection.main;
  const replacement = '![图片描述](url)';
  view.dispatch({
    changes: { from, to, insert: replacement },
  });
  view.focus();
}

export function insertTable(view: EditorView, rows: number = 3, cols: number = 3) {
  const { from, to } = view.state.selection.main;
  const header = '| ' + Array.from({ length: cols }, (_, i) => `列${i + 1}`).join(' | ') + ' |';
  const divider = '| ' + Array.from({ length: cols }, () => '---').join(' | ') + ' |';
  const bodyRows = Array.from({ length: rows - 1 }, () =>
    '| ' + Array.from({ length: cols }, () => '   ').join(' | ') + ' |'
  ).join('\n');
  const table = '\n' + header + '\n' + divider + '\n' + bodyRows + '\n';
  view.dispatch({ changes: { from, to, insert: table } });
  view.focus();
}

export function insertHorizontalRule(view: EditorView) {
  const { from, to } = view.state.selection.main;
  view.dispatch({ changes: { from, to, insert: '\n---\n' } });
  view.focus();
}

export function insertInlineCode(view: EditorView) {
  wrapSelection(view, '`', '`');
}
