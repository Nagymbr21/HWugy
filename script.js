document.addEventListener('DOMContentLoaded',()=>{
  const navToggle=document.getElementById('nav-toggle');
  const siteNav=document.getElementById('site-nav');
  navToggle && navToggle.addEventListener('click',()=>{
    if(siteNav.style.display==='block') siteNav.style.display=''; else siteNav.style.display='block';
  });

  const form=document.getElementById('contact-form');
  const status=document.getElementById('form-status');
  if(form){
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const data=new FormData(form);
      status.textContent='Sending...';
      // Collect values
      const name = (data.get('name') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();
      // Save submission to localStorage (no backend available)
      try{
        const key = 'contact_submissions';
        const raw = localStorage.getItem(key);
        const list = raw ? JSON.parse(raw) : [];
        list.push({ name: name, message: message, date: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(list));
      }catch(err){ console.error('Could not save submission', err); }
      // Fake async submit (replace with real endpoint)
      setTimeout(()=>{
        status.textContent='Thanks! Your message was received.';
        form.reset();
      },800);
    });
  }
  // Public documents viewer (read-only). Includes admin-created docs stored in localStorage.
  const baseDocs = [
    { title: 'Admin Guide', path: 'docs/guide-intro.md' },
    { title: 'Release Notes', path: 'docs/release-notes.md' },
    { title: 'Policies', path: 'docs/policies.md' }
  ];

  function loadCustomDocs(){
    try{ const raw = localStorage.getItem('custom_docs'); return raw ? JSON.parse(raw) : []; }catch(e){ return []; }
  }
  function getCombinedDocs(){ return baseDocs.concat(loadCustomDocs()); }
  function getStoredDoc(path){ return localStorage.getItem('doc:' + path); }

  function escapeHtml(str){
    return str.replace(/[&<>]/g, function(tag){
      const chars = { '&':'&amp;','<':'&lt;','>':'&gt;' };
      return chars[tag] || tag;
    });
  }

  function renderMarkdown(md){
    const lines = md.split(/\r?\n/);
    let out = '';
    let inPara = false;
    lines.forEach(line => {
      if(!line.trim()){
        if(inPara){ out += '</p>'; inPara = false; }
        return;
      }
      const h = line.match(/^(#{1,6})\s+(.*)/);
      if(h){ if(inPara){ out += '</p>'; inPara = false; } const level = h[1].length; out += `<h${level}>${escapeHtml(h[2])}</h${level}>`; return; }
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

  function initPublicDocs(){
    const list = document.getElementById('doc-list');
    const viewer = document.getElementById('doc-viewer');
    if(!list || !viewer) return;
    list.innerHTML = '';
    const all = getCombinedDocs();
    all.forEach((d, idx) => {
      const btn = document.createElement('button');
      btn.textContent = d.title;
      btn.style.display = 'block';
      btn.style.margin = '0 0 .5rem 0';
      btn.className = 'btn';
      btn.addEventListener('click', ()=> loadDoc(d.path));
      list.appendChild(btn);
      if(idx===0) loadDoc(d.path);
    });
  }

  function loadDoc(path){
    const viewer = document.getElementById('doc-viewer');
    if(!viewer) return;
    viewer.innerHTML = '<em>Loading…</em>';
    // Prefer stored content (admin-created or overrides)
    const stored = getStoredDoc(path);
    if(stored !== null){
      viewer.innerHTML = renderMarkdown(stored);
      return;
    }
    fetch(path).then(r=>{
      if(!r.ok) throw new Error('Failed to load');
      return r.text();
    }).then(text=>{
      viewer.innerHTML = renderMarkdown(text);
    }).catch(err=>{
      viewer.innerHTML = '<p style="color:crimson">Could not load document.</p>';
    });
  }

  // initialize when DOM ready
  initPublicDocs();
});
