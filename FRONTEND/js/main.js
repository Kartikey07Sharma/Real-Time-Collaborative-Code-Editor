import { nanoid } from 'https://cdn.jsdelivr.net/npm/nanoid/nanoid.js';
import { socket } from './socket.js';
import { initEditor, editor, suppressNextChange } from './editor.js';
import { renderFileTabs, detectLanguage } from './fileManager.js';
import { initChat } from './chat.js';

// STATE
let username = "";
let roomId = "";
let files = {};
let currentFile = null;

const models = {};

// 🔥 WAIT FOR DOM (VERY IMPORTANT)
document.addEventListener("DOMContentLoaded", () => {

  console.log("App initialized");

  // DOM
  const joinBtn = document.getElementById("joinBtn");
  const createBtn = document.getElementById("createNewBtn");
  const newFileBtn = document.getElementById("newFileBtn");
  const saveBtn = document.getElementById("saveBtn");
  const deleteBtn = document.getElementById("deleteFileBtn");
  const runBtn = document.getElementById("runBtn");

  const loader = document.getElementById("globalLoader");
  const loaderText = document.getElementById("loaderText");
  const joinBtnText = document.getElementById("joinBtnText");

  function showLoader(text = "Loading...") {
    if (loader) loader.style.display = "flex";
    if (loaderText) loaderText.innerText = text;
  }

  function hideLoader() {
    if (loader) loader.style.display = "none";
  }

  // ================= CREATE ROOM =================
  createBtn?.addEventListener("click", () => {
    document.getElementById("roomIdInput").value = nanoid(8);
  });

  // ================= JOIN ROOM =================
  joinBtn?.addEventListener("click", () => {

    console.log("Join clicked");

    roomId = document.getElementById("roomIdInput").value.trim();
    username = document.getElementById("usernameInput").value.trim();

    if (!roomId || !username) {
      alert("Room ID & Username required");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    showLoader("Joining room...");
    joinBtn.classList.add("loading-btn");
    if (joinBtnText) joinBtnText.innerText = "Joining...";

    document.getElementById("homePage").style.display = "none";
    document.getElementById("editorPage").style.display = "flex";

    socket.emit("join", { roomId, token });
    socket.emit("get-files", roomId);
  });

  // ================= NEW FILE =================
  newFileBtn?.addEventListener("click", () => {

    console.log("Add file clicked");

    if (!roomId) {
      alert("Join room first");
      return;
    }

    const filename = prompt("Enter file name (e.g. app.js)");
    if (!filename) return;

    socket.emit("create-file", {
      roomId,
      filename,
      language: detectLanguage(filename)
    });
  });

  // ================= SAVE =================
  saveBtn?.addEventListener("click", () => {

    console.log("Save clicked");

    if (!currentFile) {
      alert("No file selected");
      return;
    }

    socket.emit("code-change", {
      roomId,
      filename: currentFile,
      code: editor.getValue(),
      version: files[currentFile]?.version || 0
    });

    alert("Saved!");
  });

  // ================= DELETE =================
  deleteBtn?.addEventListener("click", () => {

    console.log("Delete clicked");

    if (!currentFile) return;

    socket.emit("delete-file", {
      roomId,
      filename: currentFile
    });
  });

  // ================= RUN =================
  runBtn?.addEventListener("click", () => {

    console.log("Run clicked");

    if (!editor) {
      alert("Editor not ready");
      return;
    }

    const code = editor.getValue();
    const output = document.getElementById("outputArea");

    try {
      const result = eval(code);
      output.value = result !== undefined ? result : "Executed successfully";
    } catch (err) {
      output.value = err.message;
    }
  });

});

// ================= SOCKET =================

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

// ================= INIT =================
initEditor(() => ({ roomId, currentFile, files }));
initChat(() => roomId, () => username);

// ================= FILE LIST =================
socket.on("file-list", ({ files: serverFiles }) => {

  const loader = document.getElementById("globalLoader");
  const joinBtn = document.getElementById("joinBtn");
  const joinBtnText = document.getElementById("joinBtnText");

  if (loader) loader.style.display = "none";
  if (joinBtn) joinBtn.classList.remove("loading-btn");
  if (joinBtnText) joinBtnText.innerText = "Join";

  files = serverFiles || {};

  renderFileTabs(files, switchFile, currentFile);

  if (!currentFile) {
    const first = Object.keys(files)[0];
    if (first) switchFile(first);
  }
});

// ================= CODE SYNC =================
socket.on("code-change", ({ filename, code }) => {

  if (filename === currentFile && editor.getValue() !== code) {
    suppressNextChange = true;
    editor.setValue(code);
  }

  if (files[filename]) files[filename].code = code;
});

// ================= SWITCH FILE =================
function switchFile(fname) {

  if (!files[fname]) return;

  currentFile = fname;

  const file = files[fname];

  if (!models[fname]) {
    const model = monaco.editor.createModel(
      file.code || '',
      detectLanguage(fname)
    );
    models[fname] = model;
  }

  editor.setModel(models[fname]);
}