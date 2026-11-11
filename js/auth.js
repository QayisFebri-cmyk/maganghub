function rootPath() {
  const p = window.location.pathname;
  return p.includes('/dashboard/') || p.includes('/pages/') ? '../' : './';
}

const Auth = {
  _redirect(path) {
    window.location.href = rootPath() + path;
  },
  login(username, password) {
    const user = DB.getUserByUsernamePassword(username, password);
    if (!user) return { success: false, message: 'Username atau password salah' };
    const session = { userId: user.id, username: user.username, role: user.role, loginAt: new Date().toISOString() };
    localStorage.setItem('session', JSON.stringify(session));
    return { success: true, role: user.role, user };
  },
  logout() {
    localStorage.removeItem('session');
    this._redirect('login.html');
  },
  getSession() {
    const s = localStorage.getItem('session');
    return s ? JSON.parse(s) : null;
  },
  isAuthenticated() {
    return !!Auth.getSession();
  },
  getCurrentUser() {
    const session = Auth.getSession();
    if (!session) return null;
    return DB.getById('users', session.userId);
  },
  requireAuth() {
    const session = Auth.getSession();
    if (!session) this._redirect('login.html');
    return session;
  },
  _dashboardByRole(role) {
    if (role === 'admin') return 'dashboard/admin.html';
    if (role === 'pembimbing') return 'dashboard/pembimbing.html';
    return 'dashboard/user.html';
  },
  requireRole(role) {
    const session = Auth.requireAuth();
    if (session.role !== role) {
      this._redirect(Auth._dashboardByRole(session.role));
    }
    return session;
  },
  redirectByRole() {
    const session = Auth.getSession();
    if (!session) return;
    this._redirect(Auth._dashboardByRole(session.role));
  }
};
