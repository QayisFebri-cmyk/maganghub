const Validator = {
  required(val, msg) {
    if (!val || !val.toString().trim()) return msg || 'Field wajib diisi';
    return '';
  },
  email(val) {
    if (!val) return '';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? '' : 'Email tidak valid';
  },
  minLength(val, min, msg) {
    if (val && val.length < min) return msg || `Minimal ${min} karakter`;
    return '';
  },
  phone(val) {
    if (!val) return '';
    return /^0\d{8,13}$/.test(val) ? '' : 'Nomor HP tidak valid';
  },
  number(val, msg) {
    if (val && isNaN(val)) return msg || 'Harus berupa angka';
    return '';
  },
  validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;
    let isValid = true;
    form.querySelectorAll('[required]').forEach(el => {
      const errorEl = el.closest('.form-group')?.querySelector('.error-msg') || el.parentElement.querySelector('.error-msg');
      if (!errorEl) return;
      const msg = Validator.required(el.value);
      errorEl.textContent = msg;
      el.classList.toggle('error', !!msg);
      if (msg) isValid = false;
    });
    return isValid;
  },
  clearErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  },
  showError(el, msg) {
    const errorEl = el.closest('.form-group')?.querySelector('.error-msg') || el.parentElement.querySelector('.error-msg');
    if (errorEl) { errorEl.textContent = msg; el.classList.add('error'); }
  }
};
