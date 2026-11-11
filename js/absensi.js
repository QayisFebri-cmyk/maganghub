const AbsensiManager = {
  canCheckIn(userId) {
    const today = new Date().toISOString().split('T')[0];
    return !DB.getAbsensiByUser(userId).some(a => a.tanggal === today);
  },
  checkIn(userId, data) {
    const jamSekarang = new Date();
    const jamStr = jamSekarang.toTimeString().slice(0, 5);
    const tgl = jamSekarang.toISOString().split('T')[0];
    const jamKerja = new Date(jamSekarang);
    jamKerja.setHours(8, 0, 0, 0);
    const status = jamSekarang > jamKerja ? 'terlambat' : 'hadir';
    DB.add('absensi', {
      userId, tanggal: tgl, jamMasuk: jamStr, jamPulang: '-',
      durasi: '-', status,
      lokasi: data.lokasi || (data.latitude && data.longitude ? `${data.latitude.toFixed(6)},${data.longitude.toFixed(6)}` : 'Tanpa Lokasi'),
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      keterangan: data.keterangan || '-', selfie: data.selfie || '',
      createdAt: new Date().toISOString()
    });
    return { success: true, status, jam: jamStr };
  },
  checkOut(userId, data) {
    const today = new Date().toISOString().split('T')[0];
    const absenList = DB.getAbsensiByUser(userId).filter(a => a.tanggal === today);
    if (!absenList.length) return { success: false, message: 'Belum Check In hari ini' };
    const absen = absenList[0];
    if (absen.jamPulang !== '-') return { success: false, message: 'Sudah Check Out hari ini' };
    const now = new Date();
    if (now.getHours() < 17) return { success: false, message: 'Belum waktunya pulang, minimal jam 17:00' };
    const jamPulang = now.toTimeString().slice(0, 5);
    const msMasuk = new Date(`${today}T${absen.jamMasuk}:00`).getTime();
    const durasiMs = now.getTime() - msMasuk;
    const durasiJam = Math.floor(durasiMs / 3600000);
    const durasiMenit = Math.floor((durasiMs % 3600000) / 60000);
    const durasiStr = `${durasiJam} jam ${durasiMenit} menit`;
    DB.update('absensi', absen.id, {
      jamPulang, durasi: durasiStr,
      aktivitasRingkasan: data.ringkasan || '',
      kendala: data.kendala || ''
    });
    return { success: true, jam: jamPulang, durasi: durasiStr };
  },
  getRiwayat(userId, bulan, tahun) {
    let list = DB.getAbsensiByUser(userId);
    if (bulan) list = list.filter(a => a.tanggal.slice(5, 7) === bulan);
    if (tahun) list = list.filter(a => a.tanggal.slice(0, 4) === tahun);
    return list.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  },
  getAllRiwayat(bulan, tahun) {
    let list = DB.get('absensi');
    if (bulan) list = list.filter(a => a.tanggal.slice(5, 7) === bulan);
    if (tahun) list = list.filter(a => a.tanggal.slice(0, 4) === tahun);
    return list.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  },
  getKalenderData(userId, bulan, tahun) {
    const absensi = DB.getAbsensiByUser(userId);
    const kalender = {};
    absensi.forEach(a => {
      if (a.tanggal.slice(5, 7) === bulan && a.tanggal.slice(0, 4) === tahun) {
        kalender[a.tanggal] = a.status;
      }
    });
    return kalender;
  },
  getStatusColor(status) {
    const map = { hadir: '#10B981', terlambat: '#F59E0B', izin: '#3B82F6', sakit: '#F97316', alpha: '#EF4444', libur: '#94A3B8' };
    return map[status] || '#94A3B8';
  },
  getStatusLabel(status) {
    const map = { hadir: 'Hadir', terlambat: 'Terlambat', izin: 'Izin', sakit: 'Sakit', alpha: 'Alpha', libur: 'Libur' };
    return map[status] || '-';
  }
};
