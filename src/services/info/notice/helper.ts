import type { TranslateResult } from 'vue-i18n';

import { i18n } from '@/translations';

import { NOTICE_TYPE } from '@/services/info/notice/config';

export const getPostBadgeInfo = (noticeType): { label?: TranslateResult; style?: string } => {
    switch (noticeType) {
    case NOTICE_TYPE.SYSTEM:
        return {
            // song-lang
            label: i18n.t('시스템 공지'),
            style: 'primary',
        };
    case NOTICE_TYPE.DOMAIN:
        return {
            // song-lang
            label: i18n.t('내부 공지'),
            style: 'gray',
        };
    default: return {};
    }
};
