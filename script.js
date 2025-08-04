  // Configuration - променете тези URL-та според вашата настройка
  const CONFIG = {
    n8nLoginWebhook: 'https://primary-production-f22c.up.railway.app/webhook/1c4dd653-d61b-475b-8194-7508e9de30a9',
    n8nRegisterWebhook: 'https://primary-production-f22c.up.railway.app/webhook/d08bd30e-b920-4c06-bfce-4ed98d495e84',
    AFFILIATE_STATS_WEBHOOK: 'https://primary-production-f22c.up.railway.app/webhook/6c50c8c1-1471-49a7-8e7c-300d73c6d64a'
  };

  // Current user state
  let currentUser = null;

  // Initialize app
  document.addEventListener('DOMContentLoaded', () => {
    initMagicalBackground();
    checkAuthStatus();
    setupEventListeners();
    generatePartnerRef();
  });

  function initMagicalBackground() {
    // Create stars
    const starsContainer = document.getElementById('stars');
    for (let i = 0; i < 100; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 2 + 's';
      starsContainer.appendChild(star);
    }

    // Create floating particles
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 6 + 's';
      particle.style.animationDuration = (Math.random() * 3 + 6) + 's';
      particlesContainer.appendChild(particle);
    }
  }

  function setupEventListeners() {
    // Enter key support for forms
    document.getElementById('loginEmail').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') document.getElementById('loginPassword').focus();
    });
    
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') login();
    });

    document.getElementById('registerName').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') document.getElementById('registerEmail').focus();
    });

    document.getElementById('registerEmail').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') document.getElementById('registerPassword').focus();
    });

    document.getElementById('registerPassword').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') document.getElementById('registerPartnerRef').focus();
    });

    document.getElementById('registerPartnerRef').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') register();
    });
  }

  function generatePartnerRef(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let partnerRef = '';
    for (let i = 0; i < length; i++) {
      partnerRef += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('registerPartnerRef').value = partnerRef;
  }

  function checkAuthStatus() {
    const userData = JSON.parse(sessionStorage.getItem('affiliateUser') || 'null');
    if (userData) {
      currentUser = userData;
      showDashboard();
    } else {
      showAuthScreen();
    }
  }

  function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.auth-tab');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'login') {
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
      tabs[0].classList.add('active');
      document.getElementById('loginEmail').focus();
    } else {
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
      tabs[1].classList.add('active');
      generatePartnerRef();
      document.getElementById('registerName').focus();
    }
    
    clearAuthMessage();
  }

  async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');

    if (!email || !password) {
      showAuthMessage('Моля, попълни всички полета', 'error');
      return;
    }

    loginBtn.disabled = true;
    loginBtn.innerHTML = '<div class="magical-spinner"></div> Влизане...';

    try {
      const res = await fetch(CONFIG.n8nLoginWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) throw new Error('Грешка при вход');

      const user = await res.json();

      if (!user || !user.id) throw new Error('Невалиден email или парола');

      currentUser = user;
      sessionStorage.setItem('affiliateUser', JSON.stringify(user));
      
      // Add a magical transition effect
      setTimeout(() => {
        showDashboard();
      }, 500);

    } catch (err) {
      showAuthMessage(err.message, 'error');
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerHTML = '<span class="icon">🚀</span> Влез в Dashboard-а';
    }
  }

  async function register() {
const name = document.getElementById('registerName').value.trim();
const email = document.getElementById('registerEmail').value.trim();
const phone = document.getElementById('registerPhone').value.trim();
const password = document.getElementById('registerPassword').value;
const partnerRef = document.getElementById('registerPartnerRef').value.trim();
const registerBtn = document.getElementById('registerBtn');

if (!name || !email || !phone || !password || !partnerRef) {
  showAuthMessage('Моля, попълни всички полета', 'error');
  return;
}

if (password.length < 6) {
  showAuthMessage('Паролата трябва да е поне 6 символа', 'error');
  return;
}

// По избор: базова проверка за български номер (може да се махне/разшири)
const phoneRegex = /^(?:\+359|0)\d{9}$/;
if (!phoneRegex.test(phone)) {
  showAuthMessage('Моля, въведи валиден телефонен номер', 'error');
  return;
}

registerBtn.disabled = true;
registerBtn.innerHTML = '<div class="magical-spinner"></div> Създаване...';

try {
  const res = await fetch(CONFIG.n8nRegisterWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, password, partnerRef })
  });

  const result = await res.json();

  if (!res.ok) throw new Error(result.message || 'Грешка при регистрация');

  showAuthMessage('🎉 Регистрацията е успешна! Можеш да влезеш в профила си.', 'success');

  setTimeout(() => {
    switchTab('login');
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').focus();
  }, 2000);

} catch (error) {
  showAuthMessage(error.message, 'error');
} finally {
  registerBtn.disabled = false;
  registerBtn.innerHTML = '<span class="icon">✨</span> Създай акаунт';
}
}

  function logout() {
    currentUser = null;
    sessionStorage.removeItem('affiliateUser');
    showAuthScreen();
  }

  function showAuthScreen() {
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('dashboardScreen').classList.add('hidden');
    setTimeout(() => {
      document.getElementById('loginEmail').focus();
    }, 100);
  }

  function showDashboard() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('dashboardScreen').classList.remove('hidden');
    
    // Populate user info
    document.getElementById('userName').textContent = currentUser.name;

    
    // Add fade-in animation to dashboard elements
    const cards = document.querySelectorAll('#dashboardScreen .card, #dashboardScreen .user-info');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      setTimeout(() => {
        card.style.transition = 'all 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 200);
    });
  }

  function showAuthMessage(message, type) {
    const messageDiv = document.getElementById('authMessage');
    messageDiv.innerHTML = `<div class="message ${type}">${message}</div>`;
  }

  function clearAuthMessage() {
    document.getElementById('authMessage').innerHTML = '';
  }

  function generateLink() {
    const ref = currentUser.partnerRef;
    const linkDisplay = document.getElementById('linkDisplay');
    
    const link = `https://order.enchantiya.com/bg/?ref=${encodeURIComponent(ref)}`;
    
    linkDisplay.innerHTML = `
      <div class="generated-link">
        <strong>✨ Твоят магически афилиейт линк:</strong><br>
        ${link}
        <button class="copy-btn" onclick="copyToClipboard('${link}')">📋 Копирай</button>
      </div>
    `;
    
    // Add animation to the generated link
    const linkDiv = linkDisplay.querySelector('.generated-link');
    linkDiv.style.opacity = '0';
    linkDiv.style.transform = 'translateY(20px)';
    setTimeout(() => {
      linkDiv.style.transition = 'all 0.5s ease';
      linkDiv.style.opacity = '1';
      linkDiv.style.transform = 'translateY(0)';
    }, 100);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      const copyBtn = event.target;
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✅ Копирано!';
      copyBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = '';
      }, 2000);
    }).catch(() => {
      // Fallback за стари браузъри
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      alert('🎉 Линкът е копиран!');
    });
  }

  function openAffiliateDashboard() {
const modal = document.getElementById('affiliateModal');
const loading = document.getElementById('affiliateLoading');
const error = document.getElementById('affiliateError');
const dataSection = document.getElementById('affiliateData');

// 🔒 Заключи скрола и замрази всичко зад модала
document.body.style.overflow = 'hidden';
document.body.style.pointerEvents = 'none'; // забранява клик през модала

modal.style.display = 'flex';
modal.style.pointerEvents = 'auto'; // разрешава интеракция САМО вътре в модала

loading.style.display = 'block';
error.style.display = 'none';
dataSection.style.display = 'none';

fetch(CONFIG.AFFILIATE_STATS_WEBHOOK, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ partnerRef: currentUser.partnerRef })
})
.then(res => {
  loading.style.display = 'none';
  if (!res.ok) throw new Error();
  return res.json();
})
.then(resData => {
  const data = Array.isArray(resData) ? resData[0] : resData;
  const summary = data.summary || {};

  document.getElementById('affiliateOrders').textContent = summary.Orders || 0;
  document.getElementById('affiliateSales').textContent = (parseFloat(summary.Amount || 0)).toFixed(2) + ' лв.';
  document.getElementById('affiliatePaid').textContent = (parseFloat(summary.Paid || 0)).toFixed(2) + ' лв.';
  document.getElementById('affiliateToPay').textContent = (parseFloat(summary['To pay now'] || 0)).toFixed(2) + ' лв.';

  displayAffiliatePaymentHistory(data.payments_history || []);
  dataSection.style.display = 'block';
})
.catch(() => {
  loading.style.display = 'none';
  error.style.display = 'block';
});
}


function closeAffiliateDashboard() {
document.getElementById('affiliateModal').style.display = 'none';
document.body.style.overflow = 'auto';
document.body.style.pointerEvents = 'auto';
}


function displayAffiliatePaymentHistory(history) {
const container = document.getElementById('affiliatePaymentsHistory');
container.innerHTML = '';

if (!history.length) {
  container.innerHTML = `
    <div class="no-payments">
      <div class="no-payments-icon">📭</div>
      <div class="no-payments-text">Няма регистрирани плащания</div>
    </div>
  `;
  return;
}

const sorted = history.sort((a, b) => new Date(b.Date || b.CreatedAt) - new Date(a.Date || a.CreatedAt));

sorted.forEach((item, i) => {
  const date = new Date(item.Date || item.CreatedAt).toLocaleDateString('bg-BG', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const amount = parseFloat(item.Amount || 0).toFixed(2);
  const notes = item.Notes || 'Няма бележки';

  const card = document.createElement('div');
  card.className = 'payment-history-card';
  card.style.animationDelay = `${i * 0.1}s`;

  card.innerHTML = `
    <div class="payment-card-header">
      <div class="payment-date">📅 ${date}</div>
      <div class="payment-amount">${amount} лв.</div>
    </div>
    <div class="payment-details">
      <div class="payment-notes">📝 ${notes}</div>
    </div>
  `;

  container.appendChild(card);
});
}
