<script setup lang="ts">
import {
    computed, onMounted, reactive, ref, watch,
} from 'vue';

import {
    PFieldGroup, PHeading, PSkeleton, PTextInput,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

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
    placeHolder: dashboardDetailState.placeholder,
    dashboardNameList: computed<string[]>(() => dashboardStore.getDashboardNameList(dashboardDetailState.dashboardType)),
});
const formState = reactive({
    nameInput: '',
    invalidState: false,
    invalidTexts: '',
});

const isTextInputFocused = ref(false);

const updateName = (name: string) => {
    formState.nameInput = name;
    const { invalidState, invalidTexts } = validationCheck();
    formState.invalidState = invalidState;
    formState.invalidTexts = invalidTexts;
    dashboardDetailStore.setIsNameValid(!invalidState);
    emit('update:name', name);
};

const handleInput = (t: string) => {
    updateName(t);
};
const handleClickBackButton = () => {
    emit('click-back-button');
};
const validationCheck = () => {
    let invalidState = false;
    let invalidTexts = '';
    if (formState.nameInput === dashboardDetailState.dashboardInfo?.name) {
        invalidState = true;
        invalidTexts = '';
    } else if (formState.nameInput.length > 100) {
        invalidState = true;
        invalidTexts = i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_LENGTH') as string;
    } else if (formState.nameInput.trim().length === 0) {
        invalidState = true;
        invalidTexts = i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_INPUT') as string;
    } else if (state.dashboardNameList.find((d) => d === formState.nameInput)) {
        invalidState = true;
        invalidTexts = i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_UNIQUE') as string;
    }
    return {
        invalidState,
        invalidTexts,
    };
};

watch(() => props.name, (d) => {
    if (d === formState.nameInput) return;
    if (d) updateName(d);
    else updateName('');
}, { immediate: true });

onMounted(() => {
    if (formState.nameInput.length > 0) dashboardDetailStore.setIsNameValid(true);
    else dashboardDetailStore.setIsNameValid(false);
});
</script>

<template>
    <p-heading show-back-button
               @click-back-button="handleClickBackButton"
    >
        <p-skeleton v-if="state.loading"
                    width="20rem"
                    height="1.5rem"
        />
        <p-field-group v-else
                       :invalid="formState.invalidState"
                       :invalid-text="formState.invalidTexts"
        >
            <template #default="{invalid}">
                <p-text-input :value="formState.nameInput"
                              :invalid="invalid"
                              :placeholder="state.placeHolder"
                              :is-focused.sync="isTextInputFocused"
                              @update:value="handleInput"
                />
            </template>
        </p-field-group>
    </p-heading>
</template>

<style scoped lang="postcss">
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
            margin-bottom: 0.75rem;
        }
        .back-button {
            margin-top: 0.1875rem;
        }
    }
}
.p-field-group {
    :deep(.invalid-feedback) {
        font-weight: normal;
    }
}
</style>
