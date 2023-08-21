<template>
    <div>
        <p-heading heading-type="sub"
                   :title="title"
        />
        <p-definition-table :fields="fields"
                            :data="data"
                            :loading="loading"
                            :skeleton-rows="4"
                            v-on="$listeners"
        >
            <template #data-created_at="{ data }">
                {{ iso8601Formatter(data, timezone) }}
            </template>
            <template #data-role_type="{ data }">
                <p-badge v-if="data"
                         badge-type="solid-outline"
                         :style-type="ROLE_TYPE_BADGE_OPTION[data].styleType"
                >
                    {{ ROLE_TYPE_BADGE_OPTION[data] ? ROLE_TYPE_BADGE_OPTION[data].label : '' }}
                </p-badge>
            </template>
        </p-definition-table>
        <p-heading heading-type="sub"
                   :title="pageAccessState.title"
        />
        <div v-for="pageAccessData in pageAccessState.pageAccessDataList"
             :key="pageAccessData.label"
        >
            <h4 class="definition-table-header">
                {{ pageAccessData.label }}
            </h4>
            <p-definition-table :fields="pageAccessData.fields"
                                :data="pageAccessData.data"
                                :loading="pageAccessState.loading"
                                :skeleton-rows="3"
                                disable-copy
                                class="page-access-table"
                                v-on="$listeners"
            >
                <template #data="{ data }">
                    {{ convertPagePermissionLabel(data) }}
                </template>
            </p-definition-table>
        </div>
        <p-heading heading-type="sub">
            {{ $t('IAM.ROLE.DETAIL.API_POLICY') }}
        </p-heading>
        <p-data-table :fields="policyState.fields"
                      :items="policyState.items"
                      :loading="loading"
                      :sortable="true"
                      sort-by="name"
                      :sort-desc="true"
        >
            <template #col-policy_type-format="{ value }">
                <p-badge badge-type="solid-outline"
                         :style-type="policyTypeBadgeColorFormatter(value)"
                >
                    {{ value }}
                </p-badge>
            </template>
            <template #col-policy_id-format="{ value, item }">
                <p-link :highlight="true"
                        :to="{
                            name: ADMINISTRATION_ROUTE.IAM.POLICY.DETAIL._NAME,
                            params: { id: value },
                            query: { type: item.policy_type }
                        }"
                >
                    {{ value }}
                </p-link>
            </template>
        </p-data-table>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PLink, PBadge, PDataTable, PDefinitionTable, PHeading,
} from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';

import { iso8601Formatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import { PAGE_PERMISSION_TYPE } from '@/lib/access-control/config';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { PolicyTypes } from '@/services/administration/iam/policy/lib/config';
import { POLICY_TYPES } from '@/services/administration/iam/policy/lib/config';
import { policyTypeBadgeColorFormatter } from '@/services/administration/iam/policy/lib/helper';
import type { PolicyDataModel } from '@/services/administration/iam/policy/lib/type';
import {
    usePageAccessDefinitionTableData,
} from '@/services/administration/iam/role/composables/page-access-definition-table-data';
import { ROLE_TYPE_BADGE_OPTION } from '@/services/administration/iam/role/config';
import type { RoleData } from '@/services/administration/iam/role/type';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';

type DataTableTranslationField = DataTableField | {
    label?: TranslateResult | string;
};

export default {
    name: 'RoleDetail',
    components: {
        PDefinitionTable,
        PHeading,
        PBadge,
        PDataTable,
        PLink,
    },
    props: {
        roleId: {
            type: String,
            required: true,
            default: '',
        },
    },
    setup(props) {
        const baseInfoState = reactive({
            title: computed(() => i18n.t('IAM.ROLE.DETAIL.BASE_INFORMATION')),
            loading: true,
            timezone: computed(() => store.state.user.timezone || 'UTC'),
            fields: computed<DataTableTranslationField[]>(() => [
                { name: 'name', label: i18n.t('IAM.ROLE.DETAIL.NAME') },
                { name: 'tags.description', label: i18n.t('IAM.ROLE.DETAIL.DESCRIPTION') },
                { name: 'role_type', label: i18n.t('IAM.ROLE.DETAIL.ROLE_TYPE'), disableCopy: true },
                { name: 'created_at', label: i18n.t('IAM.ROLE.DETAIL.CREATED_AT') },
            ]),
            data: {} as Partial<RoleData>,
            pagePermissions: computed(() => baseInfoState.data?.page_permissions),
        });
        const pageAccessState = reactive({
            title: i18n.t('IAM.ROLE.DETAIL.PAGE_ACCESS'),
            loading: false,
            pageAccessDataList: usePageAccessDefinitionTableData(computed(() => baseInfoState.pagePermissions ?? [])),
        });
        const policyState = reactive({
            fields: [
                { name: 'name', label: 'Policy Name' },
                { name: 'policy_type', label: 'Policy Type' },
                { name: 'policy_id', label: 'Policy ID', sortable: false },
                { name: 'tags.description', label: 'Policy Description', sortable: false },
            ] as DataTableField[],
            items: [] as (PolicyDataModel | { policy_type: PolicyTypes })[],
        });

        /* Api */
        const getPolicy = async (policy) => {
            try {
                let res;
                if (policy.policy_type === POLICY_TYPES.MANAGED) {
                    res = await SpaceConnector.client.repository.policy.get({
                        policy_id: policy.policy_id,
                        policy_type: policy.policy_type,
                    });
                } else {
                    res = await SpaceConnector.client.identity.policy.get({
                        policy_id: policy.policy_id,
                        policy_type: policy.policy_type,
                    });
                }
                res.policy_type = policy.policy_type;
                return res;
            } catch (e) {
                ErrorHandler.handleError(e);
                return undefined;
            }
        };
        const getRoleDetailData = async (roleId) => {
            baseInfoState.loading = true;
            pageAccessState.loading = true;
            try {
                baseInfoState.data = await SpaceConnector.client.identity.role.get({
                    role_id: roleId,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
                baseInfoState.data = {};
            } finally {
                baseInfoState.loading = false;
                pageAccessState.loading = false;
            }
        };
        const convertPagePermissionLabel = (data) => {
            switch (data) {
            case PAGE_PERMISSION_TYPE.MANAGE:
                return i18n.t('IAM.ROLE.FORM.MANAGE');
            case PAGE_PERMISSION_TYPE.VIEW:
                return i18n.t('IAM.ROLE.FORM.VIEW');
            default:
                return '--';
            }
        };

        /* Init */
        const initPolicy = async (policies) => {
            policyState.items = [];
            await Promise.all(policies.map(async (policy) => {
                const result = await getPolicy(policy);
                if (result) policyState.items.push(result);
            }));
        };

        /* Watcher */
        watch(() => props.roleId, async () => {
            const roleId = props.roleId;
            await getRoleDetailData(roleId);
            //
            await initPolicy(baseInfoState.data.policies ?? []);
        }, { immediate: true });

        return {
            ...toRefs(baseInfoState),
            pageAccessState,
            policyState,
            iso8601Formatter,
            ROLE_TYPE_BADGE_OPTION,
            PAGE_PERMISSION_TYPE,
            convertPagePermissionLabel,
            policyTypeBadgeColorFormatter,
            ADMINISTRATION_ROUTE,
        };
    },
};
</script>
<style lang="postcss" scoped>
.definition-table-header {
    @apply ml-4 mb-3 text-violet-700 font-bold;
}
.page-access-table {
    min-height: unset;
    margin-bottom: 1rem;
}
</style>
