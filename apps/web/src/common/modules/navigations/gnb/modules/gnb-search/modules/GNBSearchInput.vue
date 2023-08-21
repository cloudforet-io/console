<script lang="ts" setup>
import { PI } from '@spaceone/design-system';
import {
    computed,
    reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';


interface Props {
    value: string;
    isFocused: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'input', value: string): void;
    (e: 'update:is-focused', value: boolean): void;
    (e: 'esc'): void;
    (e: 'arrow-up'): void;
    (e: 'arrow-down'): void;
    (e: 'click'): void;
}>();
const { t } = useI18n();

const state = reactive({
    inputRef: null as null|HTMLElement,
    placeholder: computed(() => (t('COMMON.GNB.SEARCH.SERACH'))),
});
const handleClick = () => {
    emit('click');
};
const handleInput = (value: string) => {
    emit('input', value);
};
const handleIsFocused = (isFocused: boolean) => {
    emit('update:is-focused', isFocused);
};
const handleEsc = () => {
    emit('esc');
};
const handleArrowUp = () => {
    emit('arrow-up');
};
const handleArrowDown = () => {
    emit('arrow-down');
};

watch(() => props.isFocused, (isFocused) => {
    if (!state.inputRef) return;
    if (isFocused) state.inputRef.focus();
    else state.inputRef.blur();
});

</script>

<template>
    <div class="gnb-search-input"
         @click.stop="handleClick"
    >
        <p-i v-if="!isFocused"
             name="ic_search"
             height="1.5rem"
             width="1.5rem"
             color="inherit"
        />
        <input ref="inputRef"
               :value="value"
               :placeholder="state.placeholder"
               @input="handleInput"
               @focus="handleIsFocused(true)"
               @blur="handleIsFocused(false)"
               @keyup.esc="handleEsc"
               @keydown.up="handleArrowUp"
               @keydown.down="handleArrowDown"
        >
        <p-i v-if="value"
             name="ic_close"
             height="1rem"
             width="1rem"
             color="inherit"
             class="delete-button"
             @click.stop="handleInput('')"
        />
    </div>
</template>

<style lang="postcss" scoped>
.gnb-search-input {
    @apply flex items-center border border-transparent bg-gray-100 rounded-full text-gray-400;
    width: 17.5rem;
    height: 2rem;
    padding: 0 0.75rem;
    font-size: 0.875rem;

    &:hover {
        @apply bg-secondary-2;
    }

    &:focus-within {
        @apply border-secondary-1 bg-secondary-2;
        box-shadow: 0 0 0 2px rgba(73, 167, 247, 20%);
    }

    input {
        @apply flex-grow text-gray-900;
        background-color: inherit;

        &::placeholder {
            @apply text-gray-400;
        }
    }

    .delete-button {
        @apply text-gray-400;
        cursor: pointer;
    }
}

@screen laptop {
    .gnb-search-input {
        width: calc(100% - 1.5rem);
        margin-left: 0.75rem;
        margin-right: 0.75rem;
        margin-bottom: 1rem;
    }
}
</style>
