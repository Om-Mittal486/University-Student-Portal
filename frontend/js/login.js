// =============================================
//  SRM Portal — Login Page JavaScript
// =============================================

const API_BASE = 'http://localhost:5000/api';

// DOM refs
const loginForm = document.getElementById('loginForm');
const registerInput = document.getElementById('registerNumber');
const passwordInput = document.getElementById('password');
const captchaInput = document.getElementById('captchaInput');
const captchaDisplay = document.getElementById('captchaDisplay');
const captchaText = document.getElementById('captchaText');
const alertMsg = document.getElementById('alertMsg');
const loginBtn = document.getElementById('loginBtn');

// Current CAPTCHA value (from server or client-generated)
let currentCaptcha = '';

// ---- Captcha Generation ----
function generateClientCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 5; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

async function loadCaptcha() {
  try {
    const resp = await fetch(`${API_BASE}/auth/captcha`, { credentials: 'include' });
    if (resp.ok) {
      const data = await resp.json();
      currentCaptcha = data.captcha;
    } else {
      throw new Error('Server unavailable');
    }
  } catch (e) {
    // Fallback: generate client-side captcha
    currentCaptcha = generateClientCaptcha();
  }
  captchaText.textContent = currentCaptcha;
  captchaInput.value = '';
  captchaInput.focus();
}

// Click captcha to refresh
captchaDisplay.addEventListener('click', loadCaptcha);

// ---- Show Alert ----
function showAlert(message, type = 'error') {
  alertMsg.textContent = message;
  alertMsg.className = `alert-msg ${type} show`;
}

function hideAlert() {
  alertMsg.className = 'alert-msg';
}

// ---- Form Submit ----
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  const regNum = registerInput.value.trim();
  const password = passwordInput.value.trim();
  const captcha = captchaInput.value.trim();

  // Client-side validation
  if (!regNum) return showAlert('Please enter your Application/Register Number.');
  if (!password) return showAlert('Please enter your Password.');
  if (!captcha) return showAlert('Please enter the CAPTCHA text.');
  if (captcha.toUpperCase() !== currentCaptcha.toUpperCase()) {
    showAlert('Invalid CAPTCHA. Please try again.');
    loadCaptcha();
    return;
  }

  // Disable button, show spinner
  loginBtn.disabled = true;
  loginBtn.innerHTML = '<span class="spinner"></span>Verifying...';

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ registerNumber: regNum, password, captcha })
    });

    const data = await response.json();

    if (data.success) {
      showAlert('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '/portal';
      }, 800);
    } else {
      showAlert(data.message || 'Invalid credentials. Please try again.');
      loadCaptcha();
    }

  } catch (err) {
    // If server is unreachable, do a demo offline login
    console.warn('Server unreachable, using demo mode:', err.message);
    performDemoLogin(regNum, password, captcha);
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = 'Login';
  }
});

// ---- Demo / Offline Login (when no server) ----
function performDemoLogin(regNum, password, captcha) {
  const demoCredentials = {
    'AP24110010412': '16092007',
    'AP24110010213': '25112006',
    'AP24110010337': '08032007',
    'AP23110020156': '14072005',
    'AP24210030089': '20012007'
  };

  if (captcha.toUpperCase() !== currentCaptcha.toUpperCase()) {
    showAlert('Invalid CAPTCHA. Please try again.');
    loadCaptcha();
    return;
  }

  if (demoCredentials[regNum] && demoCredentials[regNum] === password) {
    sessionStorage.setItem('srm_user', JSON.stringify({
      registerNumber: regNum,
      fullName: getDemoName(regNum),
      demoMode: true
    }));
    showAlert('Login successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = '/portal';
    }, 800);
  } else {
    showAlert('Invalid Application/Register Number or Password.');
    loadCaptcha();
  }
}

function getDemoName(regNum) {
  const names = {
    'AP24110010412': 'IMMIDISETTI TERISH CHARAN TEJ',
    'AP24110010213': 'KARTHIK REDDY SURAPANENI',
    'AP24110010337': 'PRIYA ANANTHA KRISHNAN',
    'AP23110020156': 'RAHUL SHARMA BOPPANA',
    'AP24210030089': 'SNEHA VARMA KONDURI'
  };
  return names[regNum] || 'STUDENT USER';
}

// ---- Session Auto-redirect ----
async function checkSession() {
  // Check sessionStorage first (demo mode)
  const storedUser = sessionStorage.getItem('srm_user');
  if (storedUser) {
    window.location.href = '/portal';
    return;
  }

  try {
    const resp = await fetch(`${API_BASE}/auth/session`, { credentials: 'include' });
    if (resp.ok) {
      const data = await resp.json();
      if (data.loggedIn) window.location.href = '/portal';
    }
  } catch (e) { /* offline */ }
}

// ---- Forgot Password ----
document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
  e.preventDefault();
  alert('Please contact the IT Help Desk:\nitkm.helpdesk@srmap.edu.in\nPhone: +91-863-2344700');
});

// ---- Init ----
checkSession();
loadCaptcha();
