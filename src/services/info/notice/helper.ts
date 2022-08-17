import type { TranslateResult } from 'vue-i18n';

import { i18n } from '@/translations';

import { NOTICE_TYPE } from '@/services/info/notice/config';

export const getPostBadgeInfo = (noticeType): { label?: TranslateResult; style?: string } => {
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
    default: return {};
    }
};
