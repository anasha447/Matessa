export const isAdminUser = (user) => {
  if (!user || !user.roles) return false;

  // 1. Check if 'roles' is an array of simple strings ["ROLE_ADMIN"]
  if (Array.isArray(user.roles) && user.roles.includes("ROLE_ADMIN")) {
    return true;
  }

  // 2. Check if 'roles' is an array of objects (Spring Security format)
  if (Array.isArray(user.roles)) {
    return user.roles.some(r => 
      r === "ROLE_ADMIN" || 
      r.roleName === "ROLE_ADMIN" || 
      r.authority === "ROLE_ADMIN"
    );
  }

  return false;
};