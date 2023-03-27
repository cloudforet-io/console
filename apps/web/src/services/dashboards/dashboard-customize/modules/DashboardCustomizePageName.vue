<template>
    <p-heading show-back-button
               @click-back-button="$router.go(-1)"
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
                        {{ nameInput }}
                    </span>
                </template>
            </p-field-group>
            <p-skeleton v-else
                        width="20rem"
                        height="1.5rem"
            />
        </template>
        <template v-else>
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
    </p-heading>
</template>
<script setup lang="ts">
// Below directive is used. Do not remove!!!
import { vOnClickOutside } from '@vueuse/components';
import { useFocus } from '@vueuse/core';
import {
    computed, nextTick, reactive, ref, watch,
} from 'vue';

import {
    PFieldGroup, PHeading, PSkeleton, PTextInput,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';

const props = defineProps<{
    name: string;
    dashboardId?: string;
}>();
const emit = defineEmits<{(e: string, value: string): void}>();


const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

const state = reactive({
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

const updateName = (name: string) => {
    setForm('nameInput', name);
    emit('update:name', name);
};

// handlers for <p-text-input /> (creating feature)
const handlePTextInput = (t: string) => {
    updateName(t);
};

// handlers for <input /> (customizing feature)
const handleClickTitle = async () => {
    state.editMode = true;
    await nextTick();
    isInputFocused.value = true;
};
const handleInput = (e: InputEvent): void => {
    updateName((e.target as HTMLInputElement).value);
};
const handleEscape = () => {
    if (!state.editMode) return;
    state.editMode = false;
    updateName(props.name);
};
const handleEnter = () => {
    state.editMode = false;
    if (invalidState.nameInput) {
        updateName(props.name);
    }
};

watch(() => props.name, (d) => {
    if (d === nameInput.value) return;
    if (d) updateName(d);
    else updateName('');
}, { immediate: true });

watch(() => invalidState.nameInput, (invalid) => {
    dashboardDetailStore.$patch({ isNameValid: !invalid });
});

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
