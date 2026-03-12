import { nanoid } from 'https://cdn.jsdelivr.net/npm/nanoid/nanoid.js';

const socket = io();

let editor = null;
let pyodide = null;

const decorations = {};
const userColors = {};
const activeUsers = new Set();
let suppressNextChange = false;

// Load Python runtime
async function initPython(){
  pyodide = await loadPyodide();
  console.log("Python runtime loaded");
}
initPython();


// Monaco setup
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' } });

require(['vs/editor/editor.main'], () => {

  editor = monaco.editor.create(document.getElementById('editorContainer'), {
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    language: 'javascript'
  });

  editor.onDidChangeModelContent(() => {

    if (suppressNextChange) {
      suppressNextChange = false;
      return;
    }

    if (!currentFile) return;

    const code = editor.getValue();

    socket.emit('code-change', {
      roomId,
      filename: currentFile,
      code
    });

    if(files[currentFile]) files[currentFile].code = code;
  });

  editor.onDidChangeCursorPosition(() => {

    socket.emit("presence", {
      roomId,
      username,
      position: editor.getPosition()
    });

  });

});


// DOM elements
const homePage = document.getElementById("homePage");
const editorPage = document.getElementById("editorPage");

const joinBtn = document.getElementById("joinBtn");
const createBtn = document.getElementById("createNewBtn");
const leaveBtn = document.getElementById("leaveBtn");

const runBtn = document.getElementById("runBtn");

const sendBtn = document.getElementById("sendBtn");

const newFileBtn = document.getElementById("newFileBtn");
const saveBtn = document.getElementById("saveBtn");
const saveServerBtn = document.getElementById("saveServerBtn");
const deleteFileBtn = document.getElementById("deleteFileBtn");

const roomIdInput = document.getElementById("roomIdInput");
const usernameInput = document.getElementById("usernameInput");

const languageSelect = document.getElementById("languageSelect");

const inputArea = document.getElementById("inputArea");
const outputArea = document.getElementById("outputArea");

const chatArea = document.getElementById("chatArea");
const chatInput = document.getElementById("chatInput");

const clientsList = document.getElementById("clientsList");
const fileTabs = document.getElementById("fileTabs");


// state
let username = "";
let roomId = "";

let files = {};
let currentFile = null;

const models = {};


// create room
createBtn.addEventListener("click", () => {

  roomIdInput.value = nanoid(8);

});


// join room
joinBtn.addEventListener("click", () => {

  roomId = roomIdInput.value.trim();
  username = usernameInput.value.trim();

  if(!roomId || !username){
    alert("Room ID & Username required");
    return;
  }

  homePage.style.display = "none";
  editorPage.style.display = "flex";

  socket.emit("join", { roomId, username });

  socket.emit("get-files", roomId);

});


// leave room
leaveBtn.addEventListener("click", () => {

  socket.emit("leave", { roomId, username });

  window.location.reload();

});


// new file
newFileBtn.addEventListener("click", () => {

  const filename = prompt("Enter file name");

  if(!filename) return;

  const lang = detectLanguage(filename);

  socket.emit("create-file", {
    roomId,
    filename,
    language: lang
  });

});


// save locally
saveBtn.addEventListener("click", () => {

  if(!currentFile) return;

  const content = editor.getValue();

  const blob = new Blob([content]);

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = currentFile;

  link.click();

});


// save server
saveServerBtn.addEventListener("click", () => {

  if(!currentFile) return;

  const content = editor.getValue();

  socket.emit("save-file-server", {
    roomId,
    filename: currentFile,
    code: content
  });

});


// delete file
deleteFileBtn.addEventListener("click", () => {

  if(!currentFile) return;

  if(!confirm(`Delete ${currentFile}?`)) return;

  socket.emit("delete-file", {
    roomId,
    filename: currentFile
  });

  currentFile = null;

});


// RUN BUTTON
runBtn.addEventListener("click", async () => {

  if(!currentFile) return alert("Open a file first");

  const entry = files[currentFile];
  const code = editor.getValue();

  const language = entry.language;


  // HTML / CSS / JS preview
  if(['html','css','javascript'].includes(language)){

    const html = files['index.html']?.code || '';
    const css = files['style.css']?.code || '';
    const js = files['script.js']?.code || '';

    const preview = `
    <!doctype html>
    <html>
    <head>
    <style>${css}</style>
    </head>
    <body>
    ${html}
    <script>${js}<\/script>
    </body>
    </html>
    `;

    const win = window.open();
    win.document.write(preview);

    outputArea.value = "Preview opened in new tab";

    return;
  }


  // Python execution
  if(language === "python3"){

    try{

      const result = await pyodide.runPythonAsync(code);

      outputArea.value = result ?? "Python executed";

    }
    catch(err){

      outputArea.value = err;

    }

    return;
  }

  outputArea.value = "Language execution not supported in browser";

});


// CHAT
sendBtn.addEventListener("click", () => {

  const msg = chatInput.value.trim();

  if(!msg) return;

  socket.emit("chat-message", {
    roomId,
    username,
    message: msg
  });

  chatInput.value = "";

});


// SOCKET EVENTS

socket.on("chat-message", ({username,message}) => {

  const msgDiv = document.createElement("div");

  msgDiv.innerHTML = `<strong>${username}:</strong> ${message}`;

  chatArea.appendChild(msgDiv);

});


socket.on("joined", ({clients}) => {

  updateClientList(clients);

});


socket.on("file-list", ({files:serverFiles}) => {

  files = serverFiles || {};

  renderFileTabs();

  if(!currentFile){

    const first = Object.keys(files)[0];

    if(first) switchFile(first);

  }

});


socket.on("code-change", ({filename,code}) => {

  if(filename === currentFile && editor.getValue() !== code){

    suppressNextChange = true;

    editor.setValue(code);

  }

  if(files[filename]) files[filename].code = code;

});


// helpers

function renderFileTabs(){

  fileTabs.innerHTML = "";

  Object.keys(files).forEach(fname => {

    const btn = document.createElement("button");

    btn.className = "file-tab-btn";
    btn.innerText = fname;

    btn.onclick = () => switchFile(fname);

    fileTabs.appendChild(btn);

  });

}


function switchFile(fname){

  if(!files[fname]) return;

  currentFile = fname;

  const file = files[fname];

  if(!models[fname]){

    const model = monaco.editor.createModel(
      file.code || '',
      mapToMonacoLang(file.language)
    );

    models[fname] = model;

  }

  editor.setModel(models[fname]);

}


function detectLanguage(name){

  const n = name.toLowerCase();

  if(n.endsWith('.html')) return 'html';
  if(n.endsWith('.css')) return 'css';
  if(n.endsWith('.js')) return 'javascript';
  if(n.endsWith('.py')) return 'python3';

  return 'plaintext';

}


function mapToMonacoLang(lang){

  if(lang === "python3") return "python";

  return lang || "plaintext";

}


function updateClientList(clients){

  clientsList.innerHTML = "";

  clients.forEach((c,i) => {

    const div = document.createElement("div");

    div.textContent = `User ${i+1}: ${c}`;

    clientsList.appendChild(div);

  });

}