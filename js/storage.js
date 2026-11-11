const DB = {
  init() {
    const version = localStorage.getItem('db_version');
    if (version !== '2') {
      ['users', 'divisi', 'pembimbing', 'aktivitas', 'absensi', 'laporan'].forEach(k => localStorage.removeItem(k));
      localStorage.setItem('db_version', '2');
    }
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify(DummyData.users || []));
    }
    if (!localStorage.getItem('divisi')) localStorage.setItem('divisi', '[]');
    if (!localStorage.getItem('pembimbing')) localStorage.setItem('pembimbing', '[]');
    if (!localStorage.getItem('aktivitas')) localStorage.setItem('aktivitas', '[]');
    if (!localStorage.getItem('absensi')) localStorage.setItem('absensi', '[]');
    if (!localStorage.getItem('laporan')) localStorage.setItem('laporan', '[]');
  },
  get(store) { return JSON.parse(localStorage.getItem(store) || '[]'); },
  set(store, data) { localStorage.setItem(store, JSON.stringify(data)); },
  add(store, item) {
    const data = DB.get(store);
    item.id = data.length ? Math.max(...data.map(d => d.id)) + 1 : 1;
    data.push(item);
    DB.set(store, data);
    return item;
  },
  update(store, id, updates) {
    const data = DB.get(store);
    const idx = data.findIndex(d => d.id === id);
    if (idx === -1) return null;
    data[idx] = { ...data[idx], ...updates };
    DB.set(store, data);
    return data[idx];
  },
  delete(store, id) {
    const data = DB.get(store);
    DB.set(store, data.filter(d => d.id !== id));
  },
  getById(store, id) {
    return DB.get(store).find(d => d.id === id) || null;
  },
  getUserByUsername(username) {
    return DB.get('users').find(u => u.username === username) || null;
  },
  getUserByUsernamePassword(username, password) {
    return DB.get('users').find(u => u.username === username && u.password === password) || null;
  },
  getAktivitasByUser(userId) {
    return DB.get('aktivitas').filter(a => a.userId === userId);
  },
  getAbsensiByUser(userId) {
    return DB.get('absensi').filter(a => a.userId === userId);
  },
  getAktivitasToday() {
    const today = new Date().toISOString().split('T')[0];
    return DB.get('aktivitas').filter(a => a.tanggal === today);
  },
  getAbsensiToday() {
    const today = new Date().toISOString().split('T')[0];
    return DB.get('absensi').filter(a => a.tanggal === today);
  },
  getNamaDivisi(id) {
    const d = DB.getById('divisi', id);
    return d ? d.nama : '-';
  },
  getNamaPembimbing(id) {
    const p = DB.getById('pembimbing', id);
    return p ? p.nama : '-';
  },
  getNamaUser(id) {
    const u = DB.getById('users', id);
    return u ? u.nama : '-';
  }
};
