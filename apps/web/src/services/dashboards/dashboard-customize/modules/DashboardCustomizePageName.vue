<script setup lang="ts">
// Below directive is used. Do not remove!!!
import {
    PFieldGroup, PHeading, PSkeleton, PTextInput,
} from '@spaceone/design-system';
import {
    computed, onMounted, reactive, ref, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { useFormValidator } from '@/common/composables/form-validator';

import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';

const props = defineProps<{
    name: string;
    dashboardId?: string;
}>();
const emit = defineEmits<{(e: 'update:name', value?: string): void,
    (e: 'click-back-button'): void}>();
const { t } = useI18n();
const store = useStore();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

const state = reactive({
    loading: computed<boolean>(() => {
        if (!props.dashboardId) return false;
        return !dashboardDetailState.name;
    }),
    placeHolder: dashboardDetailState.placeholder,
    dashboardNameList: computed<string[]>(() => store.getters['dashboard/getDashboardNameList'](dashboardDetailState.projectId, dashboardDetailState.name)),
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
        if (value.length > 100) return t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_LENGTH');
        if (!value.trim().length) return t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_INPUT');
        if (state.dashboardNameList.find((d) => d === value)) return t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_UNIQUE');
        return '';
    },
});

const isTextInputFocused = ref(false);

const updateName = (name: string) => {
    setForm('nameInput', name);
    emit('update:name', name);
};

const handleInput = (string: string) => {
    updateName(string);
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
    dashboardDetailStore.$patch({ isNameValid: !invalid });
});

onMounted(() => {
    if (nameInput.value?.length) dashboardDetailStore.$patch({ isNameValid: true });
    else dashboardDetailStore.$patch({ isNameValid: false });
});

(async () => {
    await store.dispatch('dashboard/loadProjectDashboard');
})();
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
                       :invalid="invalidState.nameInput"
                       :invalid-text="invalidTexts.nameInput"
        >
            <template #default="{invalid}">
                <p-text-input v-model:is-focused="isTextInputFocused"
                              :value="nameInput"
                              :invalid="invalid"
                              :placeholder="state.placeHolder"
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
