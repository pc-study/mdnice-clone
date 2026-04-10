import React, { useEffect, useRef } from 'react';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { languages } from '@codemirror/language-data';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { useEditorStore } from '../../store/editorStore';
import {
  wrapSelection,
  prefixLines,
  prefixLinesOrdered,
  insertCodeBlock,
  insertLink,
  insertImage,
} from '../../utils/editorCommands';

interface MarkdownEditorProps {
  onScroll?: (info: { scrollTop: number; scrollHeight: number; clientHeight: number }) => void;
  editorViewRef?: React.MutableRefObject<EditorView | null>;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ onScroll, editorViewRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { content, setContent, fontSize, wordWrap } = useEditorStore();

  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        setContent(update.state.doc.toString());
      }
    });

    const scrollListener = EditorView.domEventHandlers({
      scroll: (_event, view) => {
        if (onScroll) {
          const dom = view.scrollDOM;
          onScroll({
            scrollTop: dom.scrollTop,
            scrollHeight: dom.scrollHeight,
            clientHeight: dom.clientHeight,
          });
        }
        return false;
      },
    });

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        history(),
        closeBrackets(),
        bracketMatching(),
        highlightSelectionMatches(),
        syntaxHighlighting(defaultHighlightStyle),
        markdown({ codeLanguages: languages }),
        keymap.of([
          { key: 'Mod-b', run: (v) => { wrapSelection(v, '**', '**'); return true; } },
          { key: 'Mod-i', run: (v) => { wrapSelection(v, '*', '*'); return true; } },
          { key: 'Mod-d', run: (v) => { wrapSelection(v, '~~', '~~'); return true; } },
          { key: 'Mod-k', run: (v) => { insertLink(v); return true; } },
          { key: 'Mod-Shift-i', run: (v) => { insertImage(v); return true; } },
          { key: 'Mod-Shift-c', run: (v) => { insertCodeBlock(v); return true; } },
          { key: 'Mod-Shift-o', run: (v) => { prefixLinesOrdered(v); return true; } },
          { key: 'Mod-Shift-u', run: (v) => { prefixLines(v, '- '); return true; } },
          { key: 'Mod-Shift-q', run: (v) => { prefixLines(v, '> '); return true; } },
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          ...closeBracketsKeymap,
        ]),
        updateListener,
        scrollListener,
        EditorView.lineWrapping,
        EditorView.theme({
          '&': { height: '100%', fontSize: fontSize + 'px' },
          '.cm-scroller': { fontFamily: '"Fira Code", "Source Code Pro", Menlo, monospace', overflow: 'auto' },
          '.cm-content': { padding: '10px 0' },
          '.cm-gutters': { backgroundColor: '#f7f7f7', border: 'none', color: '#999' },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;
    if (editorViewRef) editorViewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [fontSize, wordWrap]); // Recreate on settings change

  return <div ref={containerRef} style={{ height: '100%', overflow: 'hidden' }} />;
};
