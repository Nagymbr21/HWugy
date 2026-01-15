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
  // Documents feature removed

  // Ügyek: password-protected folder
  const DEFAULT_UGY_PASS = 'ugy123';
  function getUgyPass(){ return localStorage.getItem('ugy_pass') || DEFAULT_UGY_PASS; }
  function setUgyPass(p){ localStorage.setItem('ugy_pass', p); }

  const folderBtn = document.getElementById('open-folder');
  const folderContent = document.getElementById('folder-content');
  const folderMsg = document.getElementById('folder-msg');
  const changePassBtn = document.getElementById('change-folder-pass');

  if(folderBtn){
    folderBtn.addEventListener('click', ()=>{
      if(folderContent && folderContent.style.display === 'block'){
        folderContent.style.display = 'none';
        folderBtn.textContent = 'Megnyitás';
        if(changePassBtn) changePassBtn.style.display = 'none';
        if(folderMsg) folderMsg.textContent = 'Ez a mappa jelszóval védett. Kattints a megnyitáshoz.';
        return;
      }
      const p = prompt('Jelszó a mappa megnyitásához:');
      if(p === getUgyPass()){
        if(folderContent) folderContent.style.display = 'block';
        folderBtn.textContent = 'Bezárás';
        if(changePassBtn) changePassBtn.style.display = 'inline-block';
        if(folderMsg) folderMsg.textContent = 'Mappa megnyitva.';
      } else {
        alert('Hibás jelszó.');
      }
    });
  }

  if(changePassBtn){
    changePassBtn.addEventListener('click', ()=>{
      const cur = prompt('Jelenlegi jelszó:');
      if(cur !== getUgyPass()){ alert('Hibás jelszó.'); return; }
      const nxt = prompt('Új jelszó:');
      if(nxt && nxt.trim()){
        setUgyPass(nxt.trim());
        alert('Jelszó frissítve.');
      } else {
        alert('Érvénytelen jelszó.');
      }
    });
  }
});
