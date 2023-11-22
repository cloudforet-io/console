import { NOTICE_POST_TYPE } from '@/schema/board/post/constant';
import type { NoticePostType } from '@/schema/board/post/type';
import { i18n } from '@/translations';

import type { NoticePostBadgeInfo } from '@/services/info/types/notice-type';


export const getPostBadgeInfo = (noticePostType: NoticePostType): NoticePostBadgeInfo => {
    switch (noticePostType) {
    case NOTICE_POST_TYPE.SYSTEM:
        return {
            label: i18n.t('INFO.NOTICE.SYSTEM_NOTICE'),
            style: 'primary',
        };
    case NOTICE_POST_TYPE.INTERNAL:
        return {
            label: i18n.t('INFO.NOTICE.DOMAIN_NOTICE'),
            style: 'gray500',
        };
    default: return { label: '', style: 'gray500' };
    }
};
