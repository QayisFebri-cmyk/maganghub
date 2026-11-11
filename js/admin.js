const AdminManager = {
  getMagang() { return DB.get('users').filter(u => u.role === 'user'); },
  addMagang(data) {
    data.role = 'user';
    const existing = DB.get('users');
    if (existing.some(u => u.username === data.username)) return { success: false, message: 'Username sudah digunakan' };
    DB.add('users', data);
    return { success: true };
  },
  updateMagang(id, data) {
    DB.update('users', id, data);
    return { success: true };
  },
  deleteMagang(id) {
    const aktivitas = DB.get('aktivitas').filter(a => a.userId === id);
    const absensi = DB.get('absensi').filter(a => a.userId === id);
    if (aktivitas.length || absensi.length) {
      if (!confirm('User ini memiliki data aktivitas dan absensi. Hapus semua data terkait?')) return false;
    }
    aktivitas.forEach(a => DB.delete('aktivitas', a.id));
    absensi.forEach(a => DB.delete('absensi', a.id));
    DB.delete('users', id);
    return true;
  },
  getDivisi() { return DB.get('divisi'); },
  addDivisi(data) { DB.add('divisi', data); },
  updateDivisi(id, data) { DB.update('divisi', id, data); },
  deleteDivisi(id) {
    const users = DB.get('users').filter(u => u.divisiId === id);
    if (users.length) { alert('Divisi masih memiliki anggota. Pindahkan atau hapus terlebih dahulu.'); return false; }
    DB.delete('divisi', id);
    return true;
  },
  getPembimbing() { return DB.get('pembimbing'); },
  addPembimbing(data) {
    const existing = DB.get('users');
    if (existing.some(u => u.username === data.username)) return { success: false, message: 'Username sudah digunakan' };
    const p = DB.add('pembimbing', {
      nama: data.nama,
      nip: data.nip || '',
      email: data.email || '',
      divisiId: data.divisiId || null
    });
    DB.add('users', {
      username: data.username,
      password: data.password || '123456',
      role: 'pembimbing',
      nama: data.nama,
      email: data.email || '',
      divisiId: data.divisiId || null,
      pembimbingId: p.id
    });
    return { success: true };
  },
  updatePembimbing(id, data) {
    DB.update('pembimbing', id, {
      nama: data.nama,
      nip: data.nip || '',
      email: data.email || '',
      divisiId: data.divisiId || null
    });
    const acc = DB.get('users').find(u => u.pembimbingId === id && u.role === 'pembimbing');
    if (acc) {
      const upd = { nama: data.nama, email: data.email || '', divisiId: data.divisiId || null, username: data.username };
      if (data.password) upd.password = data.password;
      DB.update('users', acc.id, upd);
    }
    return { success: true };
  },
  deletePembimbing(id) {
    const students = DB.get('users').filter(u => u.pembimbingId === id && u.role === 'user');
    if (students.length) { alert('Pembimbing masih memiliki anak magang.'); return false; }
    const acc = DB.get('users').find(u => u.pembimbingId === id && u.role === 'pembimbing');
    if (acc) DB.delete('users', acc.id);
    DB.delete('pembimbing', id);
    return true;
  },
  searchMagang(keyword) {
    const list = AdminManager.getMagang();
    if (!keyword) return list;
    const k = keyword.toLowerCase();
    return list.filter(u => u.nama.toLowerCase().includes(k) || u.nim?.toLowerCase().includes(k) || u.universitas?.toLowerCase().includes(k));
  }
};
