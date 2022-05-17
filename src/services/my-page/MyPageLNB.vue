<template>
    <l-n-b :header="header" :menu-set="menuSet">
        <template #default>
            <div class="member-profile">
                <p-i class="member-icon" :name="icon"
                     width="3rem" height="3rem"
                />
                <p class="member-id">
                    {{ userId }}
                </p>
                <p class="member-type">
                    {{ memberType }}
                </p>
            </div>
        </template>
    </l-n-b>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import { PDivider, PI } from '@spaceone/design-system';
import { store } from '@/store';
import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';
import { LNBMenu } from '@/common/modules/navigations/lnb/type';
import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import { MENU_ID } from '@/lib/menu/config';
import { i18n } from '@/translations';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';
import { filterLNBMenuByPermission } from '@/lib/access-control/page-permission-helper';

export default defineComponent({
    name: 'MyPageLNB',
    components: {
        PI,
        PDivider,
        LNB,
    },
    setup() {
        const state = reactive({
            isDomainOwner: computed(() => store.getters['user/isDomainOwner']),
            hasDomainRole: computed(() => store.getters['user/hasDomainRole']),
            userType: computed(() => store.state.user.backend) as unknown as string,
            userName: computed(() => store.state.user.name),
            email: computed(() => store.state.user.email),
            userId: computed(() => store.state.user.userId),
            icon: computed(() => {
                if (state.isDomainOwner) return 'root-account';
                if (state.hasDomainRole) return 'admin';
                return 'user';
            }),
            memberType: computed(() => {
                if (state.isDomainOwner) return i18n.t('IDENTITY.USER.MAIN.ROOT_ACCOUNT');
                return i18n.t('IDENTITY.USER.MAIN.SPACEONE_USER');
            }),
            header: computed(() => MENU_INFO_MAP[MENU_ID.MY_PAGE].label),
            menuSet: computed<LNBMenu[]>(() => filterLNBMenuByPermission([
                {
                    type: 'title', label: MENU_INFO_MAP[MENU_ID.MY_PAGE_ACCOUNT].label, id: MENU_ID.MY_PAGE_ACCOUNT, foldable: false,
                },
                {
                    type: 'item', label: MENU_INFO_MAP[MENU_ID.MY_PAGE_ACCOUNT_PROFILE].label, id: MENU_ID.MY_PAGE_ACCOUNT_PROFILE, to: { name: MY_PAGE_ROUTE.MY_ACCOUNT.ACCOUNT._NAME },
                },
                {
                    type: 'item', label: MENU_INFO_MAP[MENU_ID.MY_PAGE_API_KEY].label, id: MENU_ID.MY_PAGE_API_KEY, to: { name: MY_PAGE_ROUTE.MY_ACCOUNT.API_KEY._NAME },
                },
                {
                    type: 'item', label: MENU_INFO_MAP[MENU_ID.MY_PAGE_NOTIFICATIONS].label, id: MENU_ID.MY_PAGE_NOTIFICATIONS, to: { name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION._NAME }, isBeta: true,
                },
            ], store.getters['user/pagePermissionList'])),
        });

        return {
            ...toRefs(state),
        };
    },
});

</script>

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
