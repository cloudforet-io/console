export const getNotifyLevelBadgeInfo = (type: string): string => {
    switch (type) {
    case 'critical': return 'alert';
    case 'info': return 'gray900';
    case 'warning': return 'coral500';
    default: return '';
    }
};
