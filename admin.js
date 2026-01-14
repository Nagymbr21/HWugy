// Simple client-side admin protection.
// WARNING: This is only suitable for local/dev use. For real protection use server-side auth.
(function(){
  const ADMIN_KEY = 'hwugy_isAdmin';
  const CORRECT_PASSWORD = 'changeme'; // change this before sharing or deploy a server check

  const loginForm = document.getElementById('admin-login');
  const status = document.getElementById('admin-status');
  const content = document.getElementById('admin-content');
  const loginArea = document.getElementById('login-area');
  const logoutBtn = document.getElementById('admin-logout');

  function showAdmin(){
    loginArea.style.display = 'none';
    content.style.display = '';
    // initialize documents viewer when admin is shown
    initDocuments();
  }

  function showLogin(){
    loginArea.style.display = '';
    content.style.display = 'none';
  }

  if(sessionStorage.getItem(ADMIN_KEY) === '1'){
    showAdmin();
  } else {
    showLogin();
  }

  if(loginForm){
    loginForm.addEventListener('submit', function(e){
      e.preventDefault();
      const pass = document.getElementById('admin-pass').value || '';
      status.textContent = '';
      if(pass === CORRECT_PASSWORD){
        sessionStorage.setItem(ADMIN_KEY,'1');
        showAdmin();
      } else {
        status.textContent = 'Incorrect password.';
      }
    });
  }

  if(logoutBtn){
    logoutBtn.addEventListener('click',function(){
      sessionStorage.removeItem(ADMIN_KEY);
      showLogin();
    });
  }

  // Documents viewer
  const docs = [
    { title: 'Admin Guide', path: 'docs/guide-intro.md' },
    { title: 'Release Notes', path: 'docs/release-notes.md' },
    { title: 'Policies', path: 'docs/policies.md' }
  ];

  function escapeHtml(str){
    return str.replace(/[&<>]/g, function(tag){
      const chars = { '&':'&amp;','<':'&lt;','>':'&gt;' };
      return chars[tag] || tag;
    });
  }

  function renderMarkdown(md){
    // Very small markdown -> HTML renderer (headings, links, bold, paragraphs)
    const lines = md.split(/\r?\n/);
    let out = '';
    let inPara = false;
    lines.forEach(line => {
      if(!line.trim()){
        if(inPara){ out += '</p>'; inPara = false; }
        return;
      }
      // headings
      const h = line.match(/^(#{1,6})\s+(.*)/);
      if(h){ if(inPara){ out += '</p>'; inPara = false; } const level = h[1].length; out += `<h${level}>${escapeHtml(h[2])}</h${level}>`; return; }
      // links [text](url)
      let html = escapeHtml(line)
        .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
        .replace(/\*(.*?)\*/g,'<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
      if(!inPara){ out += '<p>'; inPara = true; }
      out += html;
    });
    if(inPara) out += '</p>';
    return out;
  }

  function initDocuments(){
    const list = document.getElementById('doc-list');
    const viewer = document.getElementById('doc-viewer');
    if(!list || !viewer) return;
    list.innerHTML = '';
    docs.forEach((d, idx) => {
      const btn = document.createElement('button');
      btn.textContent = d.title;
      btn.style.display = 'block';
      btn.style.margin = '0 0 .5rem 0';
      btn.className = 'btn';
      btn.addEventListener('click', ()=> loadDoc(d.path));
      list.appendChild(btn);
      // load first doc by default
      if(idx===0) loadDoc(d.path);
    });
  }

  // Helpers for admin editing
  function isAdmin(){ return sessionStorage.getItem(ADMIN_KEY) === '1'; }
  function storageKey(path){ return 'doc:' + path; }
  function getStoredDoc(path){ return localStorage.getItem(storageKey(path)); }
  function saveStoredDoc(path, content){ localStorage.setItem(storageKey(path), content); }
  function removeStoredDoc(path){ localStorage.removeItem(storageKey(path)); }
  function downloadDoc(filename, content){
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.split('/').pop();
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function displayDoc(path, originalText){
    const viewer = document.getElementById('doc-viewer');
    if(!viewer) return;
    const override = getStoredDoc(path);
    const current = override !== null ? override : originalText;
    viewer.innerHTML = renderMarkdown(current);

    // admin controls
    if(isAdmin()){
      const ctrl = document.createElement('div');
      ctrl.style.marginTop = '.75rem';
      // Edit button
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.className = 'btn';
      editBtn.style.marginRight = '.5rem';
      editBtn.addEventListener('click', ()=>{
        // open editor
        const ta = document.createElement('textarea');
        ta.style.width = '100%';
        ta.style.minHeight = '40vh';
        ta.value = current;
        viewer.innerHTML = '';
        viewer.appendChild(ta);

        const row = document.createElement('div');
        row.style.marginTop = '.5rem';

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.className = 'btn';
        saveBtn.style.marginRight = '.5rem';
        saveBtn.addEventListener('click', ()=>{
          const newContent = ta.value || '';
          saveStoredDoc(path, newContent);
          viewer.innerHTML = renderMarkdown(newContent);
          // reattach controls
          displayDoc(path, originalText);
        });

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.className = 'btn';
        cancelBtn.style.marginRight = '.5rem';
        cancelBtn.addEventListener('click', ()=>{
          // return to rendered view without saving
          displayDoc(path, originalText);
        });

        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download';
        downloadBtn.className = 'btn';
        downloadBtn.style.marginRight = '.5rem';
        downloadBtn.addEventListener('click', ()=>{
          downloadDoc(path, ta.value || '');
        });

        const revertBtn = document.createElement('button');
        revertBtn.textContent = 'Revert';
        revertBtn.className = 'btn';
        revertBtn.style.marginRight = '.5rem';
        revertBtn.addEventListener('click', ()=>{
          removeStoredDoc(path);
          displayDoc(path, originalText);
        });

        row.appendChild(saveBtn);
        row.appendChild(cancelBtn);
        row.appendChild(downloadBtn);
        row.appendChild(revertBtn);
        viewer.appendChild(row);
      });

      // Download current rendered content
      const downloadBtn = document.createElement('button');
      downloadBtn.textContent = 'Download';
      downloadBtn.className = 'btn';
      downloadBtn.style.marginRight = '.5rem';
      downloadBtn.addEventListener('click', ()=>{
        downloadDoc(path, current);
      });

      // Revert to original (remove saved override)
      const revertBtn = document.createElement('button');
      revertBtn.textContent = 'Revert';
      revertBtn.className = 'btn';
      revertBtn.style.marginRight = '.5rem';
      revertBtn.addEventListener('click', ()=>{
        removeStoredDoc(path);
        displayDoc(path, originalText);
      });

      ctrl.appendChild(editBtn);
      ctrl.appendChild(downloadBtn);
      ctrl.appendChild(revertBtn);
      viewer.appendChild(ctrl);
    }
  }

  function loadDoc(path){
    const viewer = document.getElementById('doc-viewer');
    if(!viewer) return;
    viewer.innerHTML = '<em>Loading…</em>';
    fetch(path).then(r=>{
      if(!r.ok) throw new Error('Failed to load');
      return r.text();
    }).then(text=>{
      displayDoc(path, text);
    }).catch(err=>{
      viewer.innerHTML = '<p style="color:crimson">Could not load document.</p>';
    });
  }
})();
