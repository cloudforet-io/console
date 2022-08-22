import { i18n } from '@/translations';

import type { NoticeType } from '@/services/info/notice/config';
import { NOTICE_TYPE } from '@/services/info/notice/config';
import type { NoticePostBadgeInfo } from '@/services/info/notice/type';

export const getPostBadgeInfo = (noticeType: NoticeType): NoticePostBadgeInfo => {
    switch (noticeType) {
    case NOTICE_TYPE.SYSTEM:
        return {
            label: i18n.t('INFO.NOTICE.SYSTEM_NOTICE'),
            style: 'primary',
        };
    case NOTICE_TYPE.DOMAIN:
        return {
            label: i18n.t('INFO.NOTICE.DOMAIN_NOTICE'),
            style: 'gray',
        };
    default: return { label: '', style: '' };
    }
};
