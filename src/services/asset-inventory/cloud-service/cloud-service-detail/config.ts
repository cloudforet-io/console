import { i18n } from '@/translations';

export const CLOUD_SERVICE_TAG_TYPE = {
    CUSTOM: 'custom',
    MANAGED: 'manage',
} as const;

export type TagType = typeof CLOUD_SERVICE_TAG_TYPE[keyof typeof CLOUD_SERVICE_TAG_TYPE];


export const CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION = Object.freeze({
    [CLOUD_SERVICE_TAG_TYPE.CUSTOM]: { label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAG_CUSTOM'), styleType: 'primary1' },
    [CLOUD_SERVICE_TAG_TYPE.MANAGED]: { label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAG_MANAGED'), styleType: 'gray500' },
});
