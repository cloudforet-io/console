import { useI18n } from 'vue-i18n';

import type { NoticePostType } from '@/services/info/notice/config';
import { NOTICE_POST_TYPE } from '@/services/info/notice/config';
import type { NoticePostBadgeInfo } from '@/services/info/notice/type';

export const getPostBadgeInfo = (noticePostType: NoticePostType): NoticePostBadgeInfo => {
    const { t } = useI18n({ useScope: 'global' });
    switch (noticePostType) {
    case NOTICE_POST_TYPE.SYSTEM:
        return {
            label: t('INFO.NOTICE.SYSTEM_NOTICE'),
            style: 'primary',
        };
    case NOTICE_POST_TYPE.INTERNAL:
        return {
            label: t('INFO.NOTICE.DOMAIN_NOTICE'),
            style: 'gray500',
        };
    default: return { label: '', style: 'gray500' };
    }
};
