// Simple client-side admin protection.
// WARNING: This is only suitable for local/dev use. For real protection use server-side auth.
(function(){
  const ADMIN_KEY = 'hwugy_isAdmin';
  const CORRECT_PASSWORD = 'Fuckstar'; // change this before sharing or deploy a server check

  const loginForm = document.getElementById('admin-login');
  const status = document.getElementById('admin-status');
  const content = document.getElementById('admin-content');
  const loginArea = document.getElementById('login-area');
  const logoutBtn = document.getElementById('admin-logout');

  function showAdmin(){
    loginArea.style.display = 'none';
    content.style.display = '';
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
})();
