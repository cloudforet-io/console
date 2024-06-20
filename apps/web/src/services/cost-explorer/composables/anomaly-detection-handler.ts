import { yellow, gray, red } from '@/styles/colors';

export const getNotifyLevelInfo = (type: string): string => {
    switch (type) {
    case 'critical': return red[400];
    case 'info': return gray[400];
    case 'warning': return yellow[400];
    default: return '';
    }
};

export const getNotifyLevelBadgeInfo = (type: string): string => {
    switch (type) {
    case 'critical': return 'alert';
    case 'info': return 'gray900';
    case 'warning': return 'coral500';
    default: return '';
    }
};
