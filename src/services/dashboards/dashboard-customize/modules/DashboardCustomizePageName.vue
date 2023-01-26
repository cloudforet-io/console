<template>
    <p-page-title
        child
        @goBack="$router.go(-1)"
    >
        <template v-if="props.dashboardId">
            <p-field-group v-if="props.name"
                           :invalid="invalidState.nameInput"
                           :invalid-text="invalidTexts.nameInput"
            >
                <template #default>
                    <input v-show="state.editMode"
                           ref="inputRef"
                           v-on-click-outside="handleEnter"
                           class="name-input"
                           :value="nameInput"
                           @input="handleInput"
                           @keydown.esc="handleEscape"
                           @keydown.enter="handleEnter"
                    >
                    <span v-if="!state.editMode"
                          class="title-area"
                          @click="handleClickTitle"
                    >
                        {{ state.name }}
                    </span>
                </template>
            </p-field-group>
            <p-skeleton v-else
                        width="20rem"
                        height="1.5rem"
            />
        </template>
        <template v-else-if="props.dashboardId === undefined">
            <p-field-group
                :invalid="invalidState.nameInput"
                :invalid-text="invalidTexts.nameInput"
            >
                <template #default="{invalid}">
                    <p-text-input
                        :invalid="invalid"
                        :placeholder="state.placeHolder"
                        :value="nameInput"
                        :is-focused.sync="isTextInputFocused"
                        @update:value="handlePTextInput"
                    />
                </template>
            </p-field-group>
        </template>
    </p-page-title>
</template>
<script setup lang="ts">
// Below directive is used. Do not remove!!!
import { vOnClickOutside } from '@vueuse/components';
import { useFocus } from '@vueuse/core';
import {
    computed, nextTick, reactive, ref, watch,
} from 'vue';

import {
    PFieldGroup, PPageTitle, PSkeleton, PTextInput,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useDashboardDetailInfoStore } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';

const props = defineProps<{
    name: string;
    dashboardId?: string;
}>();
const emit = defineEmits<{(e: string, value: string): void}>();


const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

const state = reactive({
    name: useProxyValue('name', props, emit),
    placeHolder: dashboardDetailState.placeholder,
    editMode: false,
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
        if (value.length > 100) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_LENGTH');
        if (!value.trim().length) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_INPUT');
        if (state.dashboardNameList.find((d) => d === value)) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_UNIQUE');
        return '';
    },
});

const inputRef = ref<HTMLElement|null>(null);
const { focused: isInputFocused } = useFocus(inputRef, { initialValue: true });
const isTextInputFocused = ref(true);

// handlers for <p-text-input /> (creating feature)
const handlePTextInput = (t: string) => {
    setForm('nameInput', t);
    if (invalidState.nameInput === false) {
        state.name = nameInput.value;
    }
};

// handlers for <input /> (customizing feature)
const handleClickTitle = async () => {
    state.editMode = true;
    await nextTick();
    isInputFocused.value = true;
};
const handleInput = (e: InputEvent): void => {
    setForm('nameInput', (e.target as HTMLInputElement).value);
};
const handleEscape = () => {
    if (!state.editMode) return;
    state.editMode = false;
    setForm('nameInput', props.name);
};
const handleEnter = () => {
    state.editMode = false;
    if (invalidState.nameInput === false) {
        state.name = nameInput.value;
    } else {
        setForm('nameInput', props.name);
        state.name = props.name;
    }
};

watch(() => props.name, (d) => {
    // for creating dashboard
    if (!d) setForm('nameInput', '');
}, { immediate: true });

(async () => {
    await store.dispatch('dashboard/loadProjectDashboard');
})();
</script>

<style scoped lang="postcss">
.title-area {
    cursor: pointer;
}
.title-area:hover {
    text-decoration: underline;
}
.name-input {
    width: 60%;
    max-width: 60%;
    text-decoration: underline;
}
.p-text-input {
    @apply font-normal;
    width: 100%;
}

.p-page-title {
    margin-bottom: 0;
    :deep(.title-wrapper) {
        display: flex;
        width: 100%;
        & h2 {
            width: calc(100% - 2.25rem);
        }
        .p-field-group {
            margin-bottom: 0.75rem;
        }
        .back-btn {
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
