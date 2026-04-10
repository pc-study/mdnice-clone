import { useRef, useCallback } from 'react';
import { EditorView } from '@codemirror/view';

export function useSyncScroll(
  editorViewRef: React.MutableRefObject<EditorView | null>,
  previewRef: React.RefObject<HTMLDivElement | null>
) {
  const isSyncing = useRef(false);

  const handleEditorScroll = useCallback((info: { scrollTop: number; scrollHeight: number; clientHeight: number }) => {
    if (isSyncing.current || !previewRef.current) return;
    isSyncing.current = true;
    const ratio = info.scrollTop / Math.max(1, info.scrollHeight - info.clientHeight);
    previewRef.current.scrollTop = ratio * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
    requestAnimationFrame(() => { isSyncing.current = false; });
  }, [previewRef]);

  const handlePreviewScroll = useCallback((_info?: { scrollTop: number; scrollHeight: number; clientHeight: number }) => {
    if (isSyncing.current || !previewRef.current || !editorViewRef.current) return;
    isSyncing.current = true;
    const preview = previewRef.current;
    const ratio = preview.scrollTop / Math.max(1, preview.scrollHeight - preview.clientHeight);
    const editor = editorViewRef.current;
    const scrollDOM = editor.scrollDOM;
    scrollDOM.scrollTop = ratio * (scrollDOM.scrollHeight - scrollDOM.clientHeight);
    requestAnimationFrame(() => { isSyncing.current = false; });
  }, [editorViewRef, previewRef]);

  return { handleEditorScroll, handlePreviewScroll };
}
