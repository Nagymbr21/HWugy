document.addEventListener('DOMContentLoaded',()=>{
  const navToggle=document.getElementById('nav-toggle');
  const siteNav=document.getElementById('site-nav');
  navToggle && navToggle.addEventListener('click',()=>{
    if(siteNav.style.display==='block') siteNav.style.display=''; else siteNav.style.display='block';
  });

  const form=document.getElementById('contact-form');
  const status=document.getElementById('form-status');
  const recipientInput = document.getElementById('contact-recipient');
  const recipientDisplay = document.getElementById('contact-recipient-display');
  if(form){
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const data=new FormData(form);
      status.textContent='Sending...';
      // Collect values
      const name = (data.get('name') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();
      const recipient = (data.get('recipient') || '').toString().trim();
      // Save submission: prefer Firebase Realtime DB when configured, otherwise localStorage
      const submission = { name: name, message: message, recipient: recipient, date: new Date().toISOString() };
      try{
        if(window.firebase && window.firebaseConfig && window.firebase.apps && window.firebase.apps.length){
          try{
            const submissionsRef = window._hwugy_submissions_ref;
            if(submissionsRef){
              submissionsRef.push(submission);
            }
          }catch(e){
            console.error('Firebase push failed', e);
          }
        } else {
          const key = 'contact_submissions';
          const raw = localStorage.getItem(key);
          const list = raw ? JSON.parse(raw) : [];
          list.push(submission);
          localStorage.setItem(key, JSON.stringify(list));
        }
      }catch(err){ console.error('Could not save submission', err); }
      // Fake async submit (replace with real endpoint)
      setTimeout(()=>{
        status.textContent='Thanks! Your message was received.';
        form.reset();
        if(recipientDisplay) recipientDisplay.textContent = '';
        if(recipientInput) recipientInput.value = '';
      },800);
    });
  }

  // lawyer contact buttons: prefill contact form recipient and scroll
  document.querySelectorAll('.contact-lawyer').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const email = btn.getAttribute('data-email') || '';
      // allow user to open their email client instead
      if(email && confirm('E-mail kliens megnyitása helyett használja a beépített kapcsolat űrlapot?\n\nOK = e-mail kliens megnyitása, Mégse = űrlap használata')){
        const subject = encodeURIComponent('Kapcsolat a HWugy weboldalon');
        window.location.href = `mailto:${email}?subject=${subject}`;
        return;
      }
      if(recipientInput) recipientInput.value = email;
      if(recipientDisplay) recipientDisplay.textContent = email ? ('Címzett: ' + email) : '';
      // open contact section
      const contactSection = document.getElementById('contact');
      if(contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
      const message = document.querySelector('#contact-form textarea[name="message"]');
      if(message) message.focus();
    });
  });

  // Documents feature removed
  // Documents feature removed

  // Ügyek: password-protected folder
  const DEFAULT_UGY_PASS = 'HellNahCsillag';
  function getUgyPass(){ return localStorage.getItem('ugy_pass') || DEFAULT_UGY_PASS; }
  function setUgyPass(p){ localStorage.setItem('ugy_pass', p); }

  const folderBtn = document.getElementById('open-folder');
  const folderContent = document.getElementById('folder-content');
  const folderMsg = document.getElementById('folder-msg');
  

  if(folderBtn){
    folderBtn.addEventListener('click', ()=>{
      if(folderContent && folderContent.style.display === 'block'){
          folderContent.style.display = 'none';
          folderBtn.textContent = 'Megnyitás';
          if(folderMsg) folderMsg.textContent = 'Ez a mappa jelszóval védett. Kattints a megnyitáshoz.';
          return;
        }
      const p = prompt('Jelszó a mappa megnyitásához:');
      if(p === getUgyPass()){
        if(folderContent) folderContent.style.display = 'block';
        folderBtn.textContent = 'Bezárás';
        if(folderMsg) folderMsg.textContent = 'Mappa megnyitva.';
      } else {
        alert('Hibás jelszó.');
      }
    });
  }
});
