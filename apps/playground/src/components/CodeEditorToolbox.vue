<script setup lang="ts">
import { reactive, watch } from 'vue';

import { PButton, PIconButton, PSelectDropdown } from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

const props = defineProps<{
    codeType?: string;
    showExpandButton?: boolean;
    readonly?: boolean;
}>();
const emit = defineEmits<{(event: 'click-beautify'): void;
    (event: 'click-expand'): void;
    (event: 'update:code-type', codeType: string): void;
}>();
const state = reactive({
    codeType: props.codeType ? { name: props.codeType, label: props.codeType } : { name: 'Json', label: 'Json' } as SelectDropdownMenuItem,
    codeTypes: [{ name: 'Json', label: 'Json' }, { name: 'Yaml', label: 'Yaml' }] as SelectDropdownMenuItem[],
});

const handleClickChangeCodeType = (item: SelectDropdownMenuItem) => {
    state.codeType = item;
    emit('update:code-type', state.codeType.name);
};

const handleClickExpand = () => {
    emit('click-expand');
};

const handleClickBeautify = () => {
    emit('click-beautify');
};

watch(() => props.codeType, (codeType) => {
    state.codeType = { name: codeType, label: codeType } as SelectDropdownMenuItem;
});
</script>

<template>
    <div class="code-editor-toolbox">
        <p-select-dropdown :menu="state.codeTypes"
                           style-type="transparent"
                           :selected="[state.codeType]"
                           :readonly="props.readonly"
                           @select="handleClickChangeCodeType"
        />
        <p-button v-if="!props.readonly"
                  size="sm"
                  style-type="secondary"
                  @click="handleClickBeautify"
        >
            Beautify
        </p-button>
        <p-icon-button v-if="!props.readonly && props.showExpandButton"
                       name="ic_arrows-expand-all"
                       size="sm"
                       shape="square"
                       style-type="tertiary"
                       class="expand-button"
                       @click="handleClickExpand"
        />
    </div>
</template>

<style scoped lang="postcss">
.code-editor-toolbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    .expand-button {
        flex-shrink: 0;
        justify-self: flex-end;
        margin-left: auto;
    }
}
</style>
