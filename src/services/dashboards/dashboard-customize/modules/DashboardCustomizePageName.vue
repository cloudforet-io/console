<template>
    <p-page-title
        child
        @goBack="$router.go(-1)"
    >
        <template v-if="props.dashboardId"
                  #title
        >
            <input v-if="state.editMode"
                   v-on-click-outside="handleEscape"
                   class="name-input"
                   :value="state.nameInput"
                   @input="handleInput($event, 'INPUT')"
                   @keydown.esc="handleEscape"
                   @keydown.enter="handleEnter"
            >
            <span v-else
                  class="title-area"
                  @click="handleClickTitle"
            >
                {{ state.name }}
            </span>
        </template>
        <template v-else-if="props.dashboardId === undefined"
                  #title
        >
            <p-text-input
                :placeholder="name"
                :value="state.nameInput"
                @input="handleInput($event, 'TEXT_INPUT')"
            />
        </template>
    </p-page-title>
</template>
<script setup lang="ts">
// Below directive is used. Do not remove!!!
import { vOnClickOutside } from '@vueuse/components';
import { reactive } from 'vue';

import { PPageTitle, PTextInput } from '@spaceone/design-system';

import { useProxyValue } from '@/common/composables/proxy-state';

const props = defineProps<{
    name: string;
    dashboardId?: string;
}>();
const emit = defineEmits<{(e: string, value: string): void}>();

const state = reactive({
    name: useProxyValue('name', props, emit),
    nameInput: props.dashboardId ? props.name : '',
    editMode: false,
});

const handleClickTitle = () => {
    state.editMode = true;
};
const handleInput = (e: InputEvent | string, type: 'INPUT' | 'TEXT_INPUT') => {
    if (type === 'INPUT') state.nameInput = ((e as InputEvent).target as HTMLInputElement).value;
    if (type === 'TEXT_INPUT') {
        state.nameInput = (e as string);
        state.name = state.nameInput;
    }
};
const handleEscape = () => {
    state.editMode = false;
    state.nameInput = props.name;
};
const handleEnter = () => {
    state.editMode = false;
    state.name = state.nameInput;
};
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
    width: calc(100% - 2.25rem);
}
</style>
