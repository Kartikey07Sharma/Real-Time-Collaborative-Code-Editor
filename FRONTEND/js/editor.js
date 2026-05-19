import { socket } from './socket.js';

export let editor = null;
export let suppressNextChange = false;

export function initEditor(getState) {

  require.config({
    paths: {
      vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs'
    }
  });

  require(['vs/editor/editor.main'], () => {

    editor = monaco.editor.create(
      document.getElementById('editorContainer'),
      {
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        language: 'javascript'
      }
    );

    // 🔥 SINGLE SOURCE OF TRUTH FOR EDITOR CHANGES
    editor.onDidChangeModelContent(() => {

      if (suppressNextChange) {
        suppressNextChange = false;
        return;
      }

      const { roomId, currentFile, files } = getState();

      if (!roomId || !currentFile) return;

      const code = editor.getValue();

      // 🔥 SEND VERSION FOR CONFLICT HANDLING
      const version = files[currentFile]?.version || 0;

      socket.emit('code-change', {
        roomId,
        filename: currentFile,
        code,
        version
      });

      // 🔥 Update local state
      if (files[currentFile]) {
        files[currentFile].code = code;
      }

    });

  });
}