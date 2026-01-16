// Simple client-side admin protection.
// WARNING: This is only suitable for local/dev use. For real protection use server-side auth.
(function(){
  const ADMIN_KEY = 'hwugy_isAdmin';
  const CORRECT_PASSWORD = 'Fuckcsillag'; // change this before sharing or deploy a server check

  const loginForm = document.getElementById('admin-login');
  const status = document.getElementById('admin-status');
  const content = document.getElementById('admin-content');
  const loginArea = document.getElementById('login-area');
  const logoutBtn = document.getElementById('admin-logout');

  function showAdmin(){
    loginArea.style.display = 'none';
    content.style.display = '';
    // initialize contact submissions when admin is shown
    initContactSubmissions();
    initCriminalRecords();
  }

  function showLogin(){
    loginArea.style.display = '';
    // keep document content visible so visitors can read documents
    // (admin controls remain hidden unless signed in)
  }

  // Documents feature removed
  const adminContentEl = document.getElementById('admin-content');
  if(adminContentEl) adminContentEl.style.display = '';
  const loginAreaEl = document.getElementById('login-area');
  if(loginAreaEl) loginAreaEl.style.display = '';

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

  // Documents feature removed

  // Contact submissions storage & admin UI
  function loadContactSubmissions(){
    try{ const raw = localStorage.getItem('contact_submissions'); return raw ? JSON.parse(raw) : []; }catch(e){ return []; }
  }
  function saveContactSubmissions(list){
    try{ localStorage.setItem('contact_submissions', JSON.stringify(list || [])); }catch(e){ console.error('Could not save submissions', e); }
  }

  function initContactSubmissions(){
    const container = document.getElementById('submissions-list');
    if(!container) return;
    renderContactSubmissions(container, loadContactSubmissions());
  }

  function renderContactSubmissions(container, list){
    container.innerHTML = '';
    if(!Array.isArray(list) || list.length === 0){ container.textContent = 'No submissions yet.'; return; }

    // Create table
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th style="text-align:left;padding:.25rem;border-bottom:1px solid #ddd">Date</th><th style="text-align:left;padding:.25rem;border-bottom:1px solid #ddd">Name</th><th style="text-align:left;padding:.25rem;border-bottom:1px solid #ddd">Recipient</th><th style="text-align:left;padding:.25rem;border-bottom:1px solid #ddd">Message</th><th style="padding:.25rem;border-bottom:1px solid #ddd"></th></tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');

    // show newest first
    list.slice().reverse().forEach((s, idx)=>{
      const tr = document.createElement('tr');
      const dateTd = document.createElement('td');
      const d = s.date ? new Date(s.date) : null;
      dateTd.textContent = d ? d.toLocaleString() : '';
      dateTd.style.padding = '.5rem';

      const nameTd = document.createElement('td');
      nameTd.textContent = s.name || '';
      nameTd.style.padding = '.5rem';

      const recTd = document.createElement('td');
      recTd.textContent = s.recipient || '';
      recTd.style.padding = '.5rem';

      const msgTd = document.createElement('td');
      msgTd.textContent = s.message || '';
      msgTd.style.padding = '.5rem';

      const ctrlTd = document.createElement('td');
      ctrlTd.style.padding = '.5rem';
      const del = document.createElement('button');
      del.type = 'button';
      del.textContent = 'Delete';
      del.className = 'btn';
      del.style.background = 'crimson';
      del.addEventListener('click', ()=>{
        if(!confirm('Delete this submission?')) return;
        // find original index in stored list (since we reversed for display)
        const stored = loadContactSubmissions();
        const realIdx = stored.length - 1 - idx;
        stored.splice(realIdx, 1);
        saveContactSubmissions(stored);
        renderContactSubmissions(container, stored);
      });
      ctrlTd.appendChild(del);

      tr.appendChild(dateTd);
      tr.appendChild(nameTd);
      tr.appendChild(recTd);
      tr.appendChild(msgTd);
      tr.appendChild(ctrlTd);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const actions = document.createElement('div');
    actions.style.marginTop = '.5rem';
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.textContent = 'Clear all';
    clearBtn.className = 'btn';
    clearBtn.style.background = 'crimson';
    clearBtn.style.marginRight = '.5rem';
    clearBtn.addEventListener('click', ()=>{
      if(!confirm('Clear all contact submissions?')) return;
      saveContactSubmissions([]);
      renderContactSubmissions(container, []);
    });
    actions.appendChild(clearBtn);

    container.appendChild(table);
    container.appendChild(actions);
  }

  // Criminal records storage & admin UI (read-only in browser)
  async function loadCriminalRecords(){
    // Try to load from a repo file first (requires serving files via HTTP).
    try{
      const resp = await fetch('./criminal_records.json', { cache: 'no-store' });
      if(resp.ok){
        const data = await resp.json();
        return Array.isArray(data) ? data : [];
      }
    }catch(e){ /* ignore fetch errors and fall back to localStorage */ }

    try{ const raw = localStorage.getItem('criminal_records'); return raw ? JSON.parse(raw) : []; }catch(e){ return []; }
  }

  function saveCriminalRecords(list){
    // Keep for backward-compatibility if someone wants to write locally via browser devtools
    try{ localStorage.setItem('criminal_records', JSON.stringify(list || [])); }catch(e){ console.error('Could not save records', e); }
  }

  function initCriminalRecords(){
    const container = document.getElementById('records-list');
    if(!container) return;
    // load and render (file or fallback)
    loadCriminalRecords().then(list => renderCriminalRecords(container, list));
  }

  function renderCriminalRecords(container, list){
    container.innerHTML = '';
    if(!Array.isArray(list) || list.length === 0){ container.textContent = 'No records yet.'; return; }

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th style="text-align:left;padding:.25rem;border-bottom:1px solid #ddd">Name</th><th style="text-align:left;padding:.25rem;border-bottom:1px solid #ddd">DOB</th><th style="text-align:left;padding:.25rem;border-bottom:1px solid #ddd">Offense</th><th style="text-align:left;padding:.25rem;border-bottom:1px solid #ddd">Notes</th></tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');

    list.forEach(r => {
      const tr = document.createElement('tr');
      ['name','dob','offense','notes'].forEach(k=>{
        const td = document.createElement('td');
        td.textContent = r[k] || '';
        td.style.padding = '.5rem';
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);

    const note = document.createElement('p');
    note.style.marginTop = '.5rem';
    note.style.color = '#666';
    note.textContent = 'To add or edit records, open criminal_records.json in Visual Studio Code and edit the JSON array.';
    container.appendChild(note);
  }
})();
