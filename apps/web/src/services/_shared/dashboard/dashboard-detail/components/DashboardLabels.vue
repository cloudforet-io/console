<script setup lang="ts">
// CAUTION: this vOnClickOutside is using !! Please do not remove.
import { vOnClickOutside } from '@vueuse/components';
import {
    computed,
    reactive, watch,
} from 'vue';

import {
    PFieldGroup, PIconButton, PLabel, PTextInput,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import { useDashboardGetQuery } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-get-query';


interface Props {
    editable?: boolean;
    dashboardId: string;
}
const props = defineProps<Props>();
const emit = defineEmits(['update-labels']);

const {
    forms: {
        inputText,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    inputText: '',
}, {
    inputText(value: string) {
        if (value.length > 30) return i18n.t('DASHBOARDS.CUSTOMIZE.VALIDATION_LIMITED_CHAR_LABEL');
        if (state.labelList.find((d) => d === value)) return i18n.t('DASHBOARDS.CUSTOMIZE.VALIDATION_DUPLICATED_LABEL');
        return '';
    },
});

const { dashboard } = useDashboardGetQuery({
    dashboardId: computed(() => props.dashboardId),
});

const state = reactive({
    labelList: [] as string[],
    inputMode: false,
    isInputFocused: false,
});

const handleClickPlus = async () => {
    state.inputMode = true;
    state.isInputFocused = true;
};
const handleEscape = () => {
    state.inputMode = false;
    setForm('inputText', '');
};
const handlePushLabel = (e: KeyboardEvent) => {
    if (e.isComposing || !inputText.value || invalidState.inputText) return;
    state.labelList.push(inputText.value);
    setForm('inputText', '');
    emit('update-labels', state.labelList);
};
const handleDelete = (index: number) => {
    state.labelList.splice(index, 1);
    emit('update-labels', state.labelList);
};

watch(() => dashboard.value?.labels, (val) => {
    if (!val) return;
    state.labelList = val;
}, { immediate: true });
</script>

<template>
    <div class="dashboard-labels"
         @keydown.esc="handleEscape"
         @keydown.enter="handlePushLabel"
    >
        <div class="label-wrapper">
            <p-label
                v-for="(label, index) in state.labelList"
                :key="`dashboard-label-${index}`"
                :text="label"
                :deletable="props.editable"
                @delete="handleDelete(index)"
            />
            <p-icon-button v-if="!state.inputMode && props.editable"
                           style-type="tertiary"
                           name="ic_plus_bold"
                           size="sm"
                           shape="square"
                           @click="handleClickPlus"
            />
            <template v-if="!state.inputMode && !state.labelList.length">
                <span v-if="props.editable"
                      class="dashboard-labels-add-info"
                      @click="handleClickPlus"
                >
                    {{ $t('DASHBOARDS.CUSTOMIZE.ADD_LABEL') }}
                </span>
                <div v-else
                     class="no-label-text"
                >
                    {{ $t('DASHBOARDS.CUSTOMIZE.NO_LABEL') }}
                </div>
            </template>
        </div>
        <p-field-group v-if="state.inputMode"
                       v-on-click-outside="handleEscape"
                       class="label-input"
                       :invalid="invalidState.inputText"
                       :invalid-text="invalidTexts.inputText"
        >
            <p-text-input :value="inputText"
                          :is-focused.sync="state.isInputFocused"
                          :invalid="invalidState.inputText"
                          block
                          size="sm"
                          :placeholder="$t('DASHBOARDS.CUSTOMIZE.ENTER_NEW_LABEL')"
                          @update:value="setForm('inputText', $event)"
            />
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-labels {
    .label-wrapper {
        @apply flex flex-wrap items-center;
        width: 100%;
        gap: 0.25rem;
    }
    .label-input {
        max-width: 10.25rem;
    }
}
.p-icon-button {
    margin-right: 0.25rem;
}
.dashboard-labels-add-info {
    @apply text-gray-500 text-xs pt-1 cursor-pointer;
}
.no-label-text {
    @apply text-gray-300;
    display: flex;
    justify-content: center;
    width: 100%;
    height: 5rem;
    align-items: center;
}

/* custom design-system component - p-label */
.p-label {
    margin: 0.125rem 0;
    max-width: 100%;
    .label-content {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
    }
}
.p-field-group {
    @apply relative;
    margin-bottom: 0;
    .field-title-box {
        @apply hidden;
    }
}

/* custom design-system component - p-text-input */
:deep(.p-text-input) {
    .input-container {
        max-width: 10.25rem;
    }
    + .invalid-feedback {
        @apply absolute;
        top: calc(100% + 2px);
        margin-top: 0;
    }
}
</style>
