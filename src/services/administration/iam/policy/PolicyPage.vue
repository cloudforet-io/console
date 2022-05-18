<template>
    <section>
        <p-page-title
            :title="$t('IAM.POLICY.POLICY')"
            use-total-count
            :total-count="totalCount"
        >
            <template #extra>
                <router-link :to="{name: ADMINISTRATION_ROUTE.IAM.POLICY.CREATE._NAME}">
                    <p-button style-type="primary-dark"
                              name="ic_plus_bold"
                              :disabled="!hasManagePermission"
                    >
                        {{ $t('PLUGIN.COLLECTOR.MAIN.CREATE') }}
                    </p-button>
                </router-link>
            </template>
        </p-page-title>
        <policy-list-data-table :anchor-icon-visible="false" />
    </section>
</template>

<script lang="ts">
import { PPageTitle, PButton } from '@spaceone/design-system';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import PolicyListDataTable from '@/services/administration/modules/PolicyListDataTable.vue';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { administrationStore } from '@/services/administration/store';
import { store } from '@/store';
import { SpaceRouter } from '@/router';
import { PAGE_PERMISSION_TYPE } from '@/lib/access-control/page-permission-helper';

export default {
    name: 'PolicyPage',
    components: {
        PPageTitle,
        PButton,
        PolicyListDataTable,
    },
    setup() {
        const currentRoute = SpaceRouter.router.currentRoute;
        const state = reactive({
            totalCount: computed(() => administrationStore.state.policy.totalCount),
            pagePermissionList: computed<boolean>(() => store.getters['user/pagePermissionList']),
            hasManagePermission: computed(() => {
                const currentPermission = state.pagePermissionList.find(([permissionId]) => permissionId === currentRoute.name);
                const type = currentPermission[1];
                return type === PAGE_PERMISSION_TYPE.MANAGE;
            }),
        });

        return {
            ...toRefs(state),
            ADMINISTRATION_ROUTE,
        };
    },
};
</script>
