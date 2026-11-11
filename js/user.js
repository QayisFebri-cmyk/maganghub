const UserManager = {
  updateProfil(userId, data) {
    DB.update('users', userId, data);
    return { success: true };
  },
  changePassword(userId, oldPassword, newPassword) {
    const user = DB.getById('users', userId);
    if (user.password !== oldPassword) return { success: false, message: 'Password lama salah' };
    DB.update('users', userId, { password: newPassword });
    return { success: true };
  }
};
