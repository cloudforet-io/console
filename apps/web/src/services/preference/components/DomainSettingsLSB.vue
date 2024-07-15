<script setup lang="ts">
import { computed, reactive } from 'vue';

import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';
import type { LSBItem } from '@/common/modules/navigations/lsb/type';

import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';

const state = reactive({
    menuSet: computed<LSBItem[]>(() => [
        {
            type: MENU_ITEM_TYPE.ITEM,
            label: i18n.t('IAM.DOMAIN_SETTINGS.DOMAIN_INFORMATION'),
            to: { name: makeAdminRouteName(PREFERENCE_ROUTE.DOMAIN_SETTINGS.DOMAIN_INFORMATION._NAME) },
            hideFavorite: true,
        },
        {
            type: MENU_ITEM_TYPE.ITEM,
            label: i18n.t('IAM.DOMAIN_SETTINGS.APPEARANCE'),
            to: { name: makeAdminRouteName(PREFERENCE_ROUTE.DOMAIN_SETTINGS.APPEARANCE._NAME) },
            hideFavorite: true,
        },
        {
            type: MENU_ITEM_TYPE.ITEM,
            label: i18n.t('IAM.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION'),
            to: { name: makeAdminRouteName(PREFERENCE_ROUTE.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION._NAME) },
            hideFavorite: true,
            highlightTag: 'new',
        },
        // TODO: To be implemented after completion of the feature API
        // {
        //     type: MENU_ITEM_TYPE.ITEM,
        //     label: i18n.t('IAM.DOMAIN_SETTINGS.ANOMALY_DETECTION_CONFIGURATION'),
        //     to: { name: makeAdminRouteName(PREFERENCE_ROUTE.DOMAIN_SETTINGS.ANOMALY_DETECTION_DOMAIN_CONFIGURATION._NAME) },
        //     hideFavorite: true,
        //     highlightTag: 'new',
        // },
    ]),
});
</script>

<template>
    <l-s-b class="domain-settings-l-s-b"
           :menu-set="state.menuSet"
    />
</template>
