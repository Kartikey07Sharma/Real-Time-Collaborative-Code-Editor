import { editor } from './editor.js';

export function renderFileTabs(files, switchFile, currentFile) {

  const fileTabs = document.getElementById("fileTabs");
  fileTabs.innerHTML = "";

  Object.keys(files).forEach(fname => {

    const btn = document.createElement("button");

    btn.className = "file-tab-btn";
    btn.innerText = fname;

    // 🔥 Highlight active file
    if (fname === currentFile) {
      btn.classList.add("active-tab");
    }

    btn.onclick = () => {
      switchFile(fname);
      renderFileTabs(files, switchFile, fname); // re-render to update active state
    };

    fileTabs.appendChild(btn);
  });
}

// 🔥 Detect language
export function detectLanguage(name){

  const n = name.toLowerCase();

  if(n.endsWith('.html')) return 'html';
  if(n.endsWith('.css')) return 'css';
  if(n.endsWith('.js')) return 'javascript';
  if(n.endsWith('.py')) return 'python';

  return 'plaintext';
}