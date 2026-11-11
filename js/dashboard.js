const Dashboard = {
  getStatsAdmin() {
    const users = DB.get('users').filter(u => u.role === 'user');
    const divisi = DB.get('divisi');
    const pembimbing = DB.get('pembimbing');
    const aktivitas = DB.get('aktivitas');
    const absensi = DB.get('absensi');
    const today = new Date().toISOString().split('T')[0];
    const todayAbsensi = absensi.filter(a => a.tanggal === today);
    return {
      totalMagang: users.length,
      totalDivisi: divisi.length,
      totalPembimbing: pembimbing.length,
      aktivitasHariIni: aktivitas.filter(a => a.tanggal === today).length,
      aktivitasMenunggu: aktivitas.filter(a => a.status === 'menunggu').length,
      aktivitasDisetujui: aktivitas.filter(a => a.status === 'disetujui').length,
      aktivitasDitolak: aktivitas.filter(a => a.status === 'ditolak').length,
      hadir: todayAbsensi.filter(a => a.status === 'hadir').length,
      terlambat: todayAbsensi.filter(a => a.status === 'terlambat').length,
      izin: todayAbsensi.filter(a => a.status === 'izin').length,
      sakit: todayAbsensi.filter(a => a.status === 'sakit').length,
      alpha: todayAbsensi.filter(a => a.status === 'alpha').length
    };
  },
  getStatsUser(userId) {
    const user = DB.getById('users', userId);
    if (!user) return null;
    const allAktivitas = DB.getAktivitasByUser(userId);
    const allAbsensi = DB.getAbsensiByUser(userId);
    const today = new Date().toISOString().split('T')[0];
    const todayAbsensi = allAbsensi.find(a => a.tanggal === today);
    const thisMonth = today.slice(0, 7);
    const monthAbsensi = allAbsensi.filter(a => a.tanggal.startsWith(thisMonth));
    const hadirCount = monthAbsensi.filter(a => a.status === 'hadir' || a.status === 'terlambat').length;
    const totalHariKerja = monthAbsensi.length || 1;
    return {
      nama: user.nama,
      divisi: DB.getNamaDivisi(user.divisiId),
      pembimbing: DB.getNamaPembimbing(user.pembimbingId),
      totalAktivitas: allAktivitas.length,
      aktivitasBulanIni: allAktivitas.filter(a => a.tanggal.startsWith(thisMonth)).length,
      jamMasuk: todayAbsensi ? todayAbsensi.jamMasuk : '-',
      jamPulang: todayAbsensi ? todayAbsensi.jamPulang : '-',
      statusKehadiran: todayAbsensi ? todayAbsensi.status : 'Belum absen',
      persentaseKehadiran: Math.round((hadirCount / totalHariKerja) * 100)
    };
  },
  getAktivitasPerMonth() {
    const aktivitas = DB.get('aktivitas');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const data = new Array(12).fill(0);
    aktivitas.forEach(a => {
      const m = new Date(a.tanggal).getMonth();
      data[m]++;
    });
    return { labels: months, data };
  },
  getAktivitasPerDivisi() {
    const aktivitas = DB.get('aktivitas');
    const divisi = DB.get('divisi');
    const counts = {};
    aktivitas.forEach(a => {
      const nama = DB.getNamaDivisi(a.divisiId);
      counts[nama] = (counts[nama] || 0) + 1;
    });
    return { labels: Object.keys(counts), data: Object.values(counts) };
  },
  getKehadiranPerMonth() {
    const absensi = DB.get('absensi');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const hadir = new Array(12).fill(0);
    const terlambat = new Array(12).fill(0);
    absensi.forEach(a => {
      const m = new Date(a.tanggal).getMonth();
      if (a.status === 'hadir') hadir[m]++;
      else if (a.status === 'terlambat') terlambat[m]++;
    });
    return { labels: months, hadir, terlambat };
  },
  getAktivitasTerbaru(limit = 10) {
    return DB.get('aktivitas').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
  },
  getAbsensiHariIni() {
    const today = new Date().toISOString().split('T')[0];
    return DB.get('absensi').filter(a => a.tanggal === today);
  },
  getUserAktivitasPerMonth(userId) {
    const aktivitas = DB.getAktivitasByUser(userId);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const data = new Array(12).fill(0);
    aktivitas.forEach(a => {
      const m = new Date(a.tanggal).getMonth();
      data[m]++;
    });
    return { labels: months, data };
  },
  getUserKehadiranBulanan(userId) {
    const absensi = DB.getAbsensiByUser(userId);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const hadir = new Array(12).fill(0);
    absensi.forEach(a => {
      const m = new Date(a.tanggal).getMonth();
      if (a.status === 'hadir' || a.status === 'terlambat') hadir[m]++;
    });
    return { labels: months, data: hadir };
  }
};
