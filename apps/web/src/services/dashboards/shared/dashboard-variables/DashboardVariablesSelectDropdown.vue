<template>
    <div class="dashboard-variables-select-dropdown">
        <template v-for="(propertyName, idx) in state.order"
                  :key="`${propertyName}-${idx}`"
        >
            <div v-if="state.variableProperties[propertyName]?.use"
                 class="variable-selector-box"
            >
                <dashboard-variables-dropdown :property-name="propertyName"
                                              :reference-map="state.allReferenceTypeInfo[propertyName]?.referenceMap"
                                              :disabled="state.saveLoading"
                />
                <span class="circle-mark"
                      :class="{'changed': state.modifiedVariablesSchemaProperties.includes(propertyName)}"
                />
            </div>
        </template>
        <dashboard-variables-more-button :is-manageable="props.isManageable"
                                         :disabled="state.saveLoading"
        />
        <p-text-button style-type="highlight"
                       class="reset-button"
                       :disabled="state.saveLoading"
                       @click="dashboardDetailStore.resetVariables(props.originVariables, props.originVariablesSchema)"
        >
            <p-i name="ic_refresh"
                 width="1rem"
                 height="1rem"
                 color="inherit"
            />
            <span>{{ t('DASHBOARDS.CUSTOMIZE.RESET') }}</span>
        </p-text-button>
        <p-divider v-if="state.modifiedVariablesSchemaProperties.length"
                   :vertical="true"
        />
        <p-text-button v-if="state.modifiedVariablesSchemaProperties.length"
                       style-type="highlight"
                       :loading="state.saveLoading"
                       :disabled="state.saveLoading"
                       @click.stop="handleClickSaveButton"
        >
            {{ t('DASHBOARDS.CUSTOMIZE.SAVE') }}
        </p-text-button>
        <dashboard-manage-variable-overlay :visible="state.showOverlay" />
    </div>
</template>

<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PI, PTextButton, PDivider } from '@spaceone/design-system';
import { isEqual, xor } from 'lodash';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DashboardVariables, DashboardVariablesSchema } from '@/services/dashboards/config';
import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/config';
import DashboardManageVariableOverlay
    from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/DashboardManageVariableOverlay.vue';
import DashboardVariablesDropdown from '@/services/dashboards/shared/dashboard-variables/DashboardVariablesDropdown.vue';
import DashboardVariablesMoreButton
    from '@/services/dashboards/shared/dashboard-variables/DashboardVariablesMoreButton.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';




interface Props {
    isManageable: boolean;
    disableSaveButton?: boolean;
    originVariables?: DashboardVariables;
    originVariablesSchema?: DashboardVariablesSchema;
    dashboardId?: string;
}

const props = defineProps<Props>();
const store = useStore();
const route = useRoute();
const { t } = useI18n();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;


const state = reactive({
    showOverlay: computed(() => route.hash === `#${MANAGE_VARIABLES_HASH_NAME}`),
    variableProperties: computed(() => dashboardDetailState.variablesSchema.properties),
    order: computed(() => dashboardDetailState.variablesSchema.order),
    allReferenceTypeInfo: computed(() => store.getters['reference/allReferenceTypeInfo']),
    modifiedVariablesSchemaProperties: computed<string[]>(() => {
        if (props.disableSaveButton) return [];
        const results: string[] = [];
        const prevUsedProperties = Object.entries(dashboardDetailState.dashboardInfo?.variables_schema.properties ?? {}).filter(([, v]) => v.use);
        const currUsedProperties = Object.entries(dashboardDetailState.variablesSchema.properties).filter(([, v]) => v.use);
        // check variables changed
        currUsedProperties.forEach(([k]) => {
            if (!isEqual(dashboardDetailState.dashboardInfo?.variables?.[k], dashboardDetailState.variables?.[k])) {
                results.push(k);
            }
        });
        // check schema changed
        results.push(...xor(prevUsedProperties.map(([k]) => k), currUsedProperties.map(([k]) => k)));
        return results;
    }),
    saveLoading: false,
});


const updateDashboardVariables = async () => {
    state.saveLoading = true;
    try {
        const isProjectDashboard = props.dashboardId?.startsWith('project');
        if (isProjectDashboard) {
            await SpaceConnector.clientV2.dashboard.projectDashboard.update({
                project_dashboard_id: props.dashboardId,
                variables: dashboardDetailState.variables,
                variables_schema: dashboardDetailState.variablesSchema,
            });
        } else {
            await SpaceConnector.clientV2.dashboard.domainDashboard.update({
                domain_dashboard_id: props.dashboardId,
                variables: dashboardDetailState.variables,
                variables_schema: dashboardDetailState.variablesSchema,
            });
        }
        dashboardDetailStore.$patch((_state) => {
            if (_state.dashboardInfo) {
                _state.dashboardInfo.variables = dashboardDetailState.variables;
                _state.dashboardInfo.variables_schema = dashboardDetailState.variablesSchema;
            }
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.saveLoading = false;
    }
};
const handleClickSaveButton = () => {
    updateDashboardVariables();
};

</script>

<style lang="postcss" scoped>
.dashboard-variables-select-dropdown {
    .variable-selector-box {
        position: relative;
        .circle-mark {
            &.changed {
                @apply bg-secondary1 rounded-xl border-white border-2;
                position: absolute;
                width: 0.75rem;
                height: 0.75rem;
                right: -0.25rem;
                top: -0.25rem;
            }
        }
    }
    .reset-button {
        @apply flex items-center;
        gap: 0.25rem;
    }
    .p-divider {
        &.vertical {
            height: 1rem;
        }
    }
}
</style>
