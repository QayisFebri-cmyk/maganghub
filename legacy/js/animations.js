// ===== SIMPLE ANIMATIONS ONLY =====

// ===== CARD HOVER EFFECT =====
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.stat-card, .chart-card, .tabel-card, .card');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });
  });
});

// ===== TABLE ROW HOVER =====
document.addEventListener('DOMContentLoaded', () => {
  const tableRows = document.querySelectorAll('.table-wrapper tbody tr');
  
  tableRows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      row.style.backgroundColor = 'rgba(0, 217, 255, 0.05)';
    });
    
    row.addEventListener('mouseleave', () => {
      row.style.backgroundColor = 'transparent';
    });
  });
});

// ===== SIMPLE LOADING SPINNER =====
function showLoadingSpinner() {
  let overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.add('active');
  }
}

function hideLoadingSpinner() {
  let overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

// ===== SIMPLE MODAL ANIMATIONS =====
if (typeof window.openModal === 'undefined') {
  window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  };
}

if (typeof window.closeModal === 'undefined') {
  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  };
}

// ===== FORM SHAKE ON ERROR =====
function shakeElement(element) {
  if (!element) return;
  element.style.animation = 'none';
  setTimeout(() => {
    element.style.animation = 'formShake 0.3s ease';
  }, 10);
}

if (!document.querySelector('style[data-shake]')) {
  const style = document.createElement('style');
  style.setAttribute('data-shake', 'true');
  style.textContent = `
    @keyframes formShake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);
}