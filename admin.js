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

  function loadDoc(path){
    const viewer = document.getElementById('doc-viewer');
    if(!viewer) return;
    viewer.innerHTML = '<em>Loading…</em>';
    fetch(path).then(r=>{
      if(!r.ok) throw new Error('Failed to load');
      return r.text();
    }).then(text=>{
      viewer.innerHTML = renderMarkdown(text);
    }).catch(err=>{
      viewer.innerHTML = '<p style="color:crimson">Could not load document.</p>';
    });
  }
})();
