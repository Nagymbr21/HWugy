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
      // Fake async submit (replace with real endpoint)
      setTimeout(()=>{
        status.textContent='Thanks! Your message was received.';
        form.reset();
      },800);
    });
  }
});
