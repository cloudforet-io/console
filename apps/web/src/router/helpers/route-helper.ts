export const makeAdminRouteName = (routeName: string): string => {
    if (routeName.startsWith('admin.')) return routeName;
    return `admin.${routeName}`;
};

