<template>
    <div class="gnb-search-input">
        <p-i v-if="!isFocused"
             name="ic_search"
             height="1.5rem"
             width="1.5rem"
             color="inherit"
        />
        <input ref="inputRef"
               :value="value"
               :placeholder="placeholder"
               @input="$emit('update:value', $event.target.value)"
               @focus="$emit('update:isFocused', true)"
               @blur="$emit('update:isFocused', false)"
               v-on="$listeners"
        >
    </div>
</template>

<script lang="ts">
import {
    computed,
    defineComponent,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { PI } from '@spaceone/design-system';
import { i18n } from '@/translations';

interface Props {
    value: string;
    isFocused: boolean;
}

export default defineComponent<Props>({
    name: 'GNBSearchInput',
    components: {
        PI,
    },
    model: {
        prop: 'value',
        event: 'update:value',
    },
    props: {
        value: {
            type: String,
            default: '',
        },
        isFocused: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const state = reactive({
            inputRef: null as null|HTMLElement,
            placeholder: computed(() => (i18n.t('COMMON.GNB.SEARCH.SERACH'))),
        });

        watch(() => props.isFocused, (isFocused) => {
            if (!state.inputRef) return;
            if (isFocused) state.inputRef.focus();
            else state.inputRef.blur();
        });


        return {
            ...toRefs(state),
        };
    },
});
</script>

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
        box-shadow: 0 0 0 2px rgba(73, 167, 247, 0.2);
    }

    input {
        @apply flex-grow text-gray-900;
        background-color: inherit;

        &::placeholder {
            @apply text-gray-400;
        }
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
