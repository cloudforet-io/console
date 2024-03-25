<script setup lang="ts">
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PFieldGroup, PHeading, PSkeleton, PTextInput, PI,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { useFormValidator } from '@/common/composables/form-validator';

import { DASHBOARD_TEMPLATES } from '@/services/dashboards/dashboard-template/template-list';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


const props = defineProps<{
    name: string;
    dashboardId?: string;
}>();
const emit = defineEmits<{(e: 'update:name', value?: string): void,
    (e: 'click-back-button'): void}>();

const dashboardStore = useDashboardStore();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

const state = reactive({
    loading: computed<boolean>(() => {
        if (!props.dashboardId) return false;
        return !dashboardDetailState.name;
    }),
    templateName: computed(() => DASHBOARD_TEMPLATES[dashboardDetailState.templateId]?.name),
    placeHolder: dashboardDetailState.placeholder,
    dashboardNameList: computed<string[]>(() => dashboardStore.getDashboardNameList(dashboardDetailState.dashboardType)),
    isTextInputFocused: false,
});
const {
    forms: {
        nameInput,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    nameInput: props.dashboardId ? props.name : '',
}, {
    nameInput(value: string) {
        if (dashboardDetailState.dashboardInfo?.name === undefined && dashboardDetailState.name !== '') return ''; // after create case: dashboardInfo is undefined but value is not empty
        if (value === dashboardDetailState.dashboardInfo?.name) return '';
        if (value.length > 100) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_LENGTH');
        if (!value.trim().length) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_INPUT');
        if (state.dashboardNameList.find((d) => d === value)) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_UNIQUE');
        return '';
    },
});

const getDashboardNamePlaceholder = (): string => {
    let _placeholder = dashboardDetailState.placeholder;
    const _dashboardNameList = dashboardStore.getDashboardNameList(dashboardDetailState.dashboardType);
    let _count = 0;
    while (_dashboardNameList.includes(_placeholder)) {
        _placeholder = `${dashboardDetailState.placeholder} (${++_count})`; // e.g. AWS Monthly Cost Summary (1)
    }
    return _placeholder;
};
const updateName = (name: string) => {
    setForm('nameInput', name);
    emit('update:name', name);
};

const handleInput = (t: string) => {
    updateName(t);
};
const handleClickBackButton = () => {
    emit('click-back-button');
};

watch(() => props.name, (d) => {
    if (d === nameInput.value) return;
    if (d) updateName(d);
    else updateName('');
}, { immediate: true });

watch(() => invalidState.nameInput, (invalid) => {
    dashboardDetailStore.setIsNameValid(!invalid);
});

onMounted(() => {
    if (nameInput.value?.length) {
        dashboardDetailStore.setIsNameValid(true);
    } else {
        dashboardDetailStore.setIsNameValid(false);
        setForm('nameInput', getDashboardNamePlaceholder());
    }
});
</script>

<template>
    <div class="dashboard-customize-page-name">
        <p-heading show-back-button
                   @click-back-button="handleClickBackButton"
        >
            <template v-if="dashboardDetailStore.getters.displayInfo?.icon"
                      #title-left-extra
            >
                <p-i width="2rem"
                     height="2rem"
                     :name="dashboardDetailStore.getters.displayInfo?.icon"
                />
            </template>
            <p-skeleton v-if="state.loading"
                        width="20rem"
                        height="1.5rem"
            />
            <p-field-group v-else
                           :invalid="invalidState.nameInput"
                           :invalid-text="invalidTexts.nameInput"
            >
                <template #default="{invalid}">
                    <p-text-input :value="nameInput"
                                  :invalid="invalid"
                                  :placeholder="state.placeHolder"
                                  :is-focused.sync="state.isTextInputFocused"
                                  @update:value="handleInput"
                    />
                </template>
            </p-field-group>
        </p-heading>
        <p v-if="state.templateName"
           class="template-name"
        >
            {{ state.templateName }}
        </p>
    </div>
</template>

<style scoped lang="postcss">
.dashboard-customize-page-name {
    margin-bottom: 0.75rem;
    .template-name {
        @apply text-paragraph-sm text-gray-500;
        margin-left: 4.75rem;
    }
    .title-area {
        cursor: pointer;
    }
    .title-area:hover {
        text-decoration: underline;
    }
    .p-text-input {
        @apply font-normal;
        width: 100%;
    }

    .p-heading {
        margin-bottom: 0;
        :deep(.heading-wrapper) {
            display: flex;
            width: 100%;
            & h2 {
                width: calc(100% - 2.25rem);
            }
            .p-field-group {
                margin-bottom: 0.25rem;
            }
            .back-button {
                margin-top: 0.75rem;
            }
        }
    }
    .p-field-group {
        :deep(.invalid-feedback) {
            font-weight: normal;
        }
        .back-button {
            margin-bottom: 0.75rem;
        }
    }
}
</style>
