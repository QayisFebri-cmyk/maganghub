const AktivitasManager = {
  add(userId, data) {
    const today = new Date().toISOString().split('T')[0];
    const absenHariIni = DB.getAbsensiByUser(userId).filter(a => a.tanggal === today);
    if (!absenHariIni.length) return { success: false, message: 'Silakan melakukan absensi masuk terlebih dahulu.' };
    data.userId = userId;
    data.status = 'menunggu';
    data.catatanAdmin = '';
    data.createdAt = new Date().toISOString();
    if (!data.tanggal) data.tanggal = today;
    if (!data.jam) data.jam = new Date().toTimeString().slice(0, 5);
    DB.add('aktivitas', data);
    return { success: true };
  },
  update(id, data) {
    const aktivitas = DB.getById('aktivitas', id);
    if (!aktivitas) return { success: false, message: 'Aktivitas tidak ditemukan' };
    if (aktivitas.status !== 'menunggu') return { success: false, message: 'Hanya aktivitas dengan status Menunggu yang bisa diedit' };
    DB.update('aktivitas', id, data);
    return { success: true };
  },
  approve(id, catatan) {
    DB.update('aktivitas', id, { status: 'disetujui', catatanAdmin: catatan || '' });
    return { success: true };
  },
  reject(id, catatan) {
    DB.update('aktivitas', id, { status: 'ditolak', catatanAdmin: catatan || '' });
    return { success: true };
  },
  getByUser(userId, search, status) {
    let list = DB.getAktivitasByUser(userId);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(a => a.judul.toLowerCase().includes(s) || a.deskripsi.toLowerCase().includes(s));
    }
    if (status) list = list.filter(a => a.status === status);
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  getAll(search, status, divisiId) {
    let list = DB.get('aktivitas');
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(a => a.judul.toLowerCase().includes(s) || DB.getNamaUser(a.userId).toLowerCase().includes(s));
    }
    if (status) list = list.filter(a => a.status === status);
    if (divisiId) list = list.filter(a => a.divisiId == divisiId);
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};
