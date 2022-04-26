<template>
    <l-n-b header="My Page" :menu-set="MenuSet">
        <template #default>
            <div class="member-profile">
                <p-i v-if="isDomainOwner" class="member-icon" name="root-account"
                     width="3rem" height="3rem"
                />
                <p-i v-else-if="!isDomainOwner && isAdmin" class="member-icon" name="admin"
                     width="3rem" height="3rem"
                />
                <p-i v-else class="member-icon" name="user"
                     width="3rem" height="3rem"
                />
                <p class="member-id">
                    {{ userId }}
                </p>
                <p v-if="isDomainOwner" class="member-type">
                    {{ $t('IDENTITY.USER.MAIN.ROOT_ACCOUNT') }}
                </p>
                <p v-else class="member-type">
                    {{ $t('IDENTITY.USER.MAIN.SPACEONE_USER') }}
                </p>
            </div>
        </template>
    </l-n-b>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import { PDivider, PI } from '@spaceone/design-system';
import { store } from '@/store';
import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';
import { LNBMenu } from '@/common/modules/navigations/lnb/type';
import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import { MENU_ID } from '@/lib/menu/config';

interface SidebarItemType {
    label?: TranslateResult;
    routeName?: string;
    userOnly?: boolean;
    isAdminMenu?: boolean;
    beta?: boolean;
}

const MenuSet: LNBMenu[] = [
    {
        type: 'title', label: 'My Account', id: MENU_ID.MY_PAGE_ACCOUNT, foldable: false,
    },
    {
        type: 'item', label: 'Account & Profile', id: MENU_ID.MY_PAGE_ACCOUNT_PROFILE, to: { name: MY_PAGE_ROUTE.MY_ACCOUNT.ACCOUNT._NAME },
    },
    {
        type: 'item', label: 'Access with API & CLI', id: MENU_ID.MY_PAGE_API_KEY, to: { name: MY_PAGE_ROUTE.MY_ACCOUNT.API_KEY._NAME },
    },
    {
        type: 'item', label: 'Notifications Channel', id: MENU_ID.MY_PAGE_NOTIFICATIONS, to: { name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION._NAME }, isBeta: true,
    },
];


export default defineComponent({
    name: 'MyPageLNB',
    components: {
        PI,
        PDivider,
        LNB,
    },
    setup() {
        const state = reactive({
            isAdmin: computed(() => store.getters['user/isAdmin']),
            isDomainOwner: computed(() => store.getters['user/isDomainOwner']),
            userType: computed(() => store.state.user.backend) as unknown as string,
            userName: computed(() => store.state.user.name),
            email: computed(() => store.state.user.email),
            userId: computed(() => store.state.user.userId),
            hasPermission: computed((() => store.getters['user/hasPermission'])),
        });

        return {
            ...toRefs(state),
            MenuSet,
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
