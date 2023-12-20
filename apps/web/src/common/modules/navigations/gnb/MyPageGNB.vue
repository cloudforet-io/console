<template>
    <div class="my-page-gnb">
        <my-page-g-n-b-header ref="gnbHeaderRef"
                              :to="workspaceLink"
        />
        <div class="contents-wrapper">
            <router-link :to="workspaceLink">
                <div class="back-to-workspace-button">
                    <p-i name="ic_arrow-left"
                         color="inherit"
                         width="1rem"
                         height="1rem"
                    />
                    <span>{{ $t('COMMON.GNB.MY_PAGE.BACK_LINK') }}</span>
                </div>
            </router-link>
        </div>
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs, computed, defineComponent,
} from 'vue';

import { PI } from '@spaceone/design-system';

import { store } from '@/store';

import { ROOT_ROUTE } from '@/router/constant';


import { isUserAccessibleToMenu } from '@/lib/access-control';
import { MENU_ID } from '@/lib/menu/config';

import MyPageGNBHeader from '@/common/modules/navigations/gnb/modules/MyPageGNBHeader.vue';

export default defineComponent({
    name: 'GNB',
    components: {
        MyPageGNBHeader,
        PI,
    },
    setup() {
        const state = reactive({
            workspaceLink: computed(() => (isUserAccessibleToMenu(MENU_ID.HOME_DASHBOARD, store.getters['user/pageAccessPermissionList']) ? { name: ROOT_ROUTE._NAME } : null)),
        });


        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss" scoped>
.my-page-gnb {
    @apply bg-white items-center h-full w-full;
    display: flex !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);

    .contents-wrapper {
        @apply h-full flex items-center;
        padding-left: 0.75rem;

        .back-to-workspace-button {
            @apply flex items-center text-gray-900 text-label-md font-bold gap-1;
            padding: 0 0.75rem;
        }
    }
}
</style>
