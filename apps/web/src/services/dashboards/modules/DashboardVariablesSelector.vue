<template>
    <div class="dashboard-variable-selector">
        <template v-for="(propertyName, idx) in state.order">
            <div v-if="state.variableProperties[propertyName]?.use"
                 :key="`${propertyName}-${idx}`"
                 class="variable-selector-box"
            >
                <variable-selector-dropdown :property-name="propertyName"
                                            :reference-map="state.allReferenceTypeInfo[propertyName]?.referenceMap"
                />
                <span class="circle-mark"
                      :class="{'changed': state.modifiedVariablesSchemaProperties.includes(propertyName)}"
                />
            </div>
        </template>
        <variable-more-button-dropdown :is-manageable="props.isManageable" />
        <p-text-button style-type="highlight"
                       class="reset-button"
                       @click="dashboardDetailStore.resetVariables(props.originVariables, props.originVariablesSchema)"
        >
            <p-i name="ic_refresh"
                 width="1rem"
                 height="1rem"
                 color="inherit"
            />
            <span>{{ $t('DASHBOARDS.CUSTOMIZE.RESET') }}</span>
        </p-text-button>
        <p-divider v-if="state.isModified"
                   :vertical="true"
        />
        <p-text-button v-if="state.isModified"
                       style-type="highlight"
                       @click.stop="handleClickSave"
        >
            <!--song-lang-->
            Save
        </p-text-button>
        <dashboard-manage-variable-overlay :visible="state.showOverlay" />
    </div>
</template>

<script lang="ts" setup>
import type Vue from 'vue';
import { computed, getCurrentInstance, reactive } from 'vue';

import { PI, PDivider, PTextButton } from '@spaceone/design-system';
import { isEqual, xor } from 'lodash';

import { store } from '@/store';

import type { DashboardVariables, DashboardVariablesSchema } from '@/services/dashboards/config';
import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/config';
import DashboardManageVariableOverlay
    from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/DashboardManageVariableOverlay.vue';
import VariableMoreButtonDropdown
    from '@/services/dashboards/dashboard-customize/modules/VariableMoreButtonDropdown.vue';
import VariableSelectorDropdown from '@/services/dashboards/dashboard-customize/modules/VariableSelectorDropdown.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';

interface Props {
    isManageable: boolean;
    disableSaveButton?: boolean;
    originVariables?: DashboardVariables;
    originVariablesSchema?: DashboardVariablesSchema;
}

const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

const vm = getCurrentInstance()?.proxy as Vue;

const state = reactive({
    showOverlay: computed(() => vm.$route.hash === `#${MANAGE_VARIABLES_HASH_NAME}`),
    variableProperties: computed(() => dashboardDetailState.variablesSchema.properties),
    order: computed(() => dashboardDetailState.variablesSchema.order),
    allReferenceTypeInfo: computed(() => store.getters['reference/allReferenceTypeInfo']),
    isModified: computed(() => {
        if (props.disableSaveButton) return false;
        const prevVariables = dashboardDetailState.dashboardInfo?.variables;
        const prevVariablesSchema = dashboardDetailState.dashboardInfo?.variables_schema;
        return !isEqual(prevVariables, dashboardDetailState.variables) || !isEqual(prevVariablesSchema, dashboardDetailState.variablesSchema);
    }),
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
        results.concat(xor(prevUsedProperties.map(([k]) => k), currUsedProperties.map(([k]) => k)));
        return results;
    }),
});

const handleClickSave = () => {
    console.log('Save!');
    // TODO: Save!
};

</script>

<style lang="postcss" scoped>
.dashboard-variable-selector {
    .variable-selector-box {
        position: relative;
        .circle-mark {
            &.changed {
                @apply bg-secondary1 rounded-xl;
                position: absolute;
                width: 0.5rem;
                height: 0.5rem;
                right: -0.25rem;
                top: -0.125rem;
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
