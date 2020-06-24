<template>
    <span>
        <p-text-input v-model="proxyValue" v-focus.lazy="isFocused"
                      class="input-box"
                      @input="onInput"
        />
        <p-context-menu v-if="visibleContext"
                        ref="contextMenuRef" class="context-menu-box"
                        theme="gray900"
                        :menu="acState.items"
                        @clickMenuEvent="clickMenuEvent"
                        @onEndOfUpKey="isFocused=true"
                        @onEscKey="isFocused=true"
        />
    </span>
</template>

<script>
import {
    computed, defineComponent, onMounted, reactive, ref, watch, toRefs,
} from '@vue/composition-api';
import { windowEventMount, makeProxy } from '@/lib/compostion-util';

import PTextInput from '@/components/atoms/inputs/TextInput.vue';
import PContextMenu from '@/components/organisms/context-menu/context-menu/ContextMenu.vue';
import { BaseAutocompleteHandler, searchContextType, SearchQuery } from '@/components/organisms/search/query-search-bar/autocompleteHandler';


export default defineComponent({
    name: 'PAutocompleteInput',
    components: {
        PTextInput,
        PContextMenu,
    },
    model: {
        prop: 'value',
        event: 'inputText',
    },
    props: {
        value: String,
        autocompleteHandler: BaseAutocompleteHandler,
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyValue: computed({
                get: () => props.value,
                set: val => emit('inputText', val),
            }),
            isFocused: false,
            visibleContext: undefined,
        });

        const acState = reactive({
            isFocusAC: false,
            items: [],
        });

        state.visibleContext = computed(() => state.isFocused);

        const getACData = async (text, forceContextType) => {
            const result = await props.autocompleteHandler.getAutoCompleteData(forceContextType || contextType.value, text, contextState);
            acState.items = result;
        };
        const hideAC = () => {
            acState.isFocusAC = false;
        };
        const onInput = async (e) => {
            if (!e) return;
            await getACData(text);
            if (acState.items.length === 0) { hideAC(); }
        };
        const clickMenuEvent = () => {};
        return {
            ...toRefs(state),
            onInput,
            acState,
            clickMenuEvent,
        };
    },
});
</script>

<style lang="postcss" scoped>

</style>
