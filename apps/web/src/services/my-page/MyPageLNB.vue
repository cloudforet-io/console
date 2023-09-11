<script lang="ts" setup>
import { PI } from '@spaceone/design-system';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { filterLNBMenuByPermission } from '@/lib/access-control/page-permission-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import type { LNBMenu } from '@/common/modules/navigations/lnb/type';

import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';


const store = useStore();
const { t } = useI18n();

const state = reactive({
    isDomainOwner: computed(() => store.getters['user/isDomainOwner']),
    hasPermission: computed(() => store.getters['user/hasPermission']),
    hasDomainRole: computed(() => store.getters['user/hasDomainRole']),
    userType: computed(() => store.state.user.backend) as unknown as string,
    userName: computed(() => store.state.user.name),
    email: computed(() => store.state.user.email),
    userId: computed(() => store.state.user.userId),
    icon: computed(() => {
        if (state.isDomainOwner) return 'img_avatar_root-account';
        if (state.hasDomainRole) return 'img_avatar_admin';
        return 'img_avatar_user';
    }),
    memberType: computed(() => {
        if (state.isDomainOwner) return t('IDENTITY.USER.MAIN.ROOT_ACCOUNT');
        return t('IDENTITY.USER.MAIN.SPACEONE_USER');
    }),
    header: computed(() => t(MENU_INFO_MAP[MENU_ID.MY_PAGE].translationId)),
    menuSet: computed<LNBMenu[]>(() => {
        const allLnbMenu: LNBMenu[] = [
            {
                type: 'title',
                label: t(MENU_INFO_MAP[MENU_ID.MY_PAGE_ACCOUNT].translationId),
                id: MENU_ID.MY_PAGE_ACCOUNT,
                foldable: false,
            },
            {
                type: 'item',
                label: t(MENU_INFO_MAP[MENU_ID.MY_PAGE_ACCOUNT_PROFILE].translationId),
                id: MENU_ID.MY_PAGE_ACCOUNT_PROFILE,
                to: { name: MY_PAGE_ROUTE.MY_ACCOUNT.ACCOUNT._NAME },
            },
            {
                type: 'item',
                label: t(MENU_INFO_MAP[MENU_ID.MY_PAGE_API_KEY].translationId),
                id: MENU_ID.MY_PAGE_API_KEY,
                to: { name: MY_PAGE_ROUTE.MY_ACCOUNT.API_KEY._NAME },
            },
            {
                type: 'item',
                label: t(MENU_INFO_MAP[MENU_ID.MY_PAGE_NOTIFICATIONS].translationId),
                id: MENU_ID.MY_PAGE_NOTIFICATIONS,
                to: { name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION._NAME },
                hightlightTag: 'beta',
            },
        ];
        return filterLNBMenuByPermission(allLnbMenu, store.getters['user/pagePermissionList']);
    }),
});

</script>

<template>
    <l-n-b :header="state.header"
           :menu-set="state.menuSet"
    >
        <template #default>
            <div class="member-profile">
                <p-i class="member-icon"
                     :name="state.icon"
                     width="3rem"
                     height="3rem"
                />
                <p class="member-id">
                    {{ state.userId }}
                </p>
                <p class="member-type">
                    {{ state.memberType }}
                </p>
            </div>
        </template>
    </l-n-b>
</template>

<style lang="postcss" scoped>
.member-profile {
    text-align: center;
    vertical-align: middle;
    padding: 1rem 2.125rem;
    margin-top: 1.5rem;
    margin-bottom: 2.125rem;
    width: 14.75rem;
    height: 7.875rem;
    .member-icon {
        @apply mx-auto rounded-full;
        width: 3rem;
        height: 3rem;
        margin-bottom: 0.5rem;
        overflow: hidden;
    }
    .member-id {
        @apply text-gray-900;
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
        line-height: 140%;
    }
    .member-type {
        @apply text-gray-500;
        font-size: 0.75rem;
        line-height: 120%;
    }
}
</style>
