<template>
    <div class="notice-page">
        <p-heading :title="$t('INFO.NOTICE.MAIN.NOTICE_TITLE')">
            <template v-if="state.hasReadWriteAccess"
                      #extra
            >
                <p-button v-if="storeState.hasDomainRoleUser"
                          style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateNotice"
                >
                    {{ $t('INFO.NOTICE.FORM.CREATE_NOTICE') }}
                </p-button>
            </template>
        </p-heading>
        <notice-list />
    </div>
</template>

<script lang="ts">
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { clone } from 'lodash';

import {
    PButton, PHeading,
} from '@cloudforet/mirinae';

import { store } from '@/store';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import type { PageAccessMap } from '@/lib/access-control/config';
import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import NoticeList from '@/services/info/components/NoticeList.vue';
import { INFO_ROUTE } from '@/services/info/routes/route-constant';

export default {
    name: 'AdminNoticeMainPage',
    components: {
        PHeading,
        PButton,
        NoticeList,
    },
    setup() {
        const router = useRouter();
        const route = useRoute();

        const storeState = reactive({
            hasDomainRoleUser: computed(() => store.getters['user/isDomainAdmin']),
            pageAccessPermissionMap: computed<PageAccessMap>(() => store.getters['user/pageAccessPermissionMap']),
        });
        const state = reactive({
            selectedMenuId: computed(() => {
                const reversedMatched = clone(route.matched).reverse();
                const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
                const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
                if (route.name === COST_EXPLORER_ROUTE.LANDING._NAME) {
                    return '';
                }
                return targetMenuId;
            }),
            hasReadWriteAccess: computed<boolean|undefined>(() => storeState.pageAccessPermissionMap[state.selectedMenuId]?.write),
        });
        const handleCreateNotice = () => {
            router.push({ name: makeAdminRouteName(INFO_ROUTE.NOTICE.CREATE._NAME) });
        };

        return {
            storeState,
            state,
            handleCreateNotice,
        };
    },
};
</script>


