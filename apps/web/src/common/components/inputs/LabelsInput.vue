<script setup lang="ts">
// CAUTION: this vOnClickOutside is using !! Please do not remove.
import { vOnClickOutside } from '@vueuse/components';
import {
    watch, ref,
} from 'vue';

import {
    PIconButton, PLabel, PTextInput,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useFieldValidator } from '@/common/composables/form-validator';

const props = defineProps<{
    labels?: string[];
    editable?: boolean;
}>();
const emit = defineEmits<{(event: 'update:labels', value: string[]): void;
}>();


const labelList = ref<string[]>([]);

const {
    value, setValue, isInvalid, invalidText,
} = useFieldValidator(
    '',
    (val: string) => {
        if (val.length > 30) return i18n.t('DASHBOARDS.CUSTOMIZE.VALIDATION_LIMITED_CHAR_LABEL');
        if (labelList.value.find((d) => d === val)) return i18n.t('DASHBOARDS.CUSTOMIZE.VALIDATION_DUPLICATED_LABEL');
        return '';
    },
);

const inputMode = ref(false);
const isInputFocused = ref(false);

const handleClickPlus = async () => {
    inputMode.value = true;
    isInputFocused.value = true;
};
const handleKeyEscape = () => {
    inputMode.value = false;
    setValue('');
};
const handleKeyEnter = (e: KeyboardEvent) => {
    if (e.isComposing || !value.value || isInvalid.value) return;
    labelList.value.push(value.value);
    setValue('');
    emit('update:labels', labelList.value);
};
const handleClickDelete = (index: number) => {
    labelList.value.splice(index, 1);
    emit('update:labels', labelList.value);
};
watch(() => props.labels, (newLabels) => {
    labelList.value = newLabels || [];
}, { immediate: true });
</script>

<template>
    <div class="flex flex-wrap items-start gap-1 min-h-8"
         @keydown.esc="handleKeyEscape"
         @keydown.enter="handleKeyEnter"
    >
        <div class="flex flex-wrap items-center gap-1 min-h-6">
            <p-label
                v-for="(label, index) in labelList"
                :key="`dashboard-label-${index}`"
                :text="label"
                :deletable="props.editable"
                @delete="handleClickDelete(index)"
            />
            <p-icon-button v-if="!inputMode && props.editable"
                           class="mr-1"
                           style-type="tertiary"
                           name="ic_plus_bold"
                           size="sm"
                           shape="square"
                           @click="handleClickPlus"
            />
            <template v-if="!inputMode && !labelList.length">
                <span v-if="props.editable"
                      class="text-gray-500 text-xs pt-1 cursor-pointer"
                      @click="handleClickPlus"
                >
                    {{ $t('DASHBOARDS.CUSTOMIZE.ADD_LABEL') }}
                </span>
                <div v-else
                     class="text-gray-300 text-xs"
                >
                    {{ $t('DASHBOARDS.CUSTOMIZE.NO_LABEL') }}
                </div>
            </template>
        </div>
        <div v-if="inputMode"
             v-on-click-outside="handleKeyEscape"
             class="min-w-40 max-w-40"
        >
            <p-text-input :value="value"
                          :is-focused="isInputFocused"
                          :invalid="isInvalid"
                          block
                          size="sm"
                          :placeholder="$t('DASHBOARDS.CUSTOMIZE.ENTER_NEW_LABEL')"
                          @update:value="setValue"
                          @update:is-focused="isInputFocused = $event"
            />
            <p v-if="isInvalid"
               class="text-label-sm text-alert mt-1"
            >
                {{ invalidText }}
            </p>
        </div>
    </div>
</template>
