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
});
