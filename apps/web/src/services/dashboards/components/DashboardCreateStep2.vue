<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import {
    PLabel, PI, PFieldGroup, PTextInput,
} from '@spaceone/design-system';
import type { InputItem } from '@spaceone/design-system/types/inputs/input/text-input/type';

import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import DashboardCreateScopeForm from '@/services/dashboards/components/DashboardCreateScopeForm.vue';
import { useDashboardCreatePageStore } from '@/services/dashboards/stores/dashboard-create-page-store';


const appContextStore = useAppContextStore();


interface Props {
    isValid: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:is-valid', value: boolean): void
}>();

const dashboardStore = useDashboardStore();
const dashboardCreatePageStore = useDashboardCreatePageStore();
const dashboardCreatePageState = dashboardCreatePageStore.state;
const state = reactive({
    proxyIsValid: useProxyValue('isValid', props, emit),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    dashboardNameList: computed<string[]>(() => dashboardStore.getDashboardNameList(dashboardCreatePageState.dashboardType)),
    labels: [] as InputItem[],
});
const {
    forms: {
        dashboardName,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    dashboardName: '',
}, {
    dashboardName(value: string) {
        if (value.length > 100) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_LENGTH');
        if (!value.trim().length) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_INPUT');
        if (state.dashboardNameList.find((d) => d === value)) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_UNIQUE');
        return '';
    },
});

/* Event */
const handleUpdateDashboardName = (value: string) => {
    setForm('dashboardName', value);
    dashboardCreatePageStore.setDashboardName(value);
};
const handleUpdateLabels = (items: InputItem[]) => {
    state.labels = items;
    dashboardCreatePageStore.setDashboardLabels(items.map((item) => item.name));
};

/* Watcher */
watch(() => isAllValid.value, (value) => {
    emit('update:is-valid', value);
});
</script>

<template>
    <div class="dashboard-create-step2">
        <div class="selected-ootb-wrapper">
            <p-i name="ic_dashboard-template_others"
                 width="3.5rem"
                 height="3.5rem"
            />
            <div class="description-wrapper">
                <p class="description-title">
                    {{ dashboardCreatePageState.templateName }}
                </p>
                <div class="label-wrapper">
                    <p-label v-for="(label, idx) in dashboardCreatePageState.templateLabels"
                             :key="`${label}-${idx}`"
                             :text="label"
                    />
                </div>
            </div>
        </div>
        <div class="input-form-wrapper">
            <p-field-group :label="$t('DASHBOARDS.CREATE.NAME')"
                           required
                           :invalid="invalidState.dashboardName"
                           :invalid-text="invalidTexts.dashboardName"
            >
                <template #default="{invalid}">
                    <p-text-input :value="dashboardName"
                                  :invalid="invalid"
                                  block
                                  @update:value="handleUpdateDashboardName"
                    />
                </template>
            </p-field-group>
            <p-field-group :label="$t('DASHBOARDS.CREATE.LABEL')">
                <p-text-input multi-input
                              appearance-type="stack"
                              :selected="state.labels"
                              block
                              @update:selected="handleUpdateLabels"
                />
            </p-field-group>
            <dashboard-create-scope-form v-if="!state.isAdminMode" />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-create-step2 {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}
.selected-ootb-wrapper {
    display: flex;
    gap: 1rem;
    .description-wrapper {
        display: grid;
        align-items: center;
        padding: 0.25rem 0;
        .description-title {
            @apply text-label-lg;
            font-weight: 500;
        }
    }
}
.input-form-wrapper {
    .p-field-group {
        margin-bottom: 1.5rem;
    }
}
</style>
