<template>
    <div class="p-query-search-bar">
        <p-search
            ref="searchBarRef"
            class="p-search"
            :placeholder="searchPlaceholder"
            v-model="proxySearchText"
            :focused="searchFocused"
            @search="newQuery"
            @onDownKey="focusAC"
            @keyup:esc="focusOut"
        />
        <p-context-menu v-if="showAC" ref="contextMenuRef"
                        theme="secondary"
                        :menu="acState.items"
                        @select="clickMenuEvent"
                        @keyup:up:end="searchFocused=true"
                        @keyup:esc="searchFocused=true"
        />
    </div>
</template>

<script lang="ts">
import _ from 'lodash';
import {
    computed, isRef, onMounted, reactive, Ref, ref, watch,
} from '@vue/composition-api';
import { windowEventMount } from '@/lib/compostion-util';

import PSearch from '@/components/molecules/search/PSearch.vue';
import PContextMenu from '@/components/organisms/context-menu/PContextMenu.vue';
import {
    SEARCH_PREFIX,
    searchContextType,
    SearchQuery,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import { parseTag } from '@/components/organisms/search/query-search-bar/toolset';

// regx

export default {
    name: 'PQuerySearchBar',
    components: { PSearch, PContextMenu },
    props: {
        searchText: {
            type: String,
            default: '',
        },
        searchPlaceholder: {
            type: String,
            default: null,
        },
        autocompleteHandler: {
            type: Object,
        },
    },
    event: ['newQuery'],
    setup(props, context) {
        // const proxySearchText = makeProxy('searchText', props, context.emit);
        const proxySearchText: Ref<string> = computed({
            get: () => props.searchText,
            set: _.debounce((val) => {
                context.emit('update:searchText', val);
            }, 100),
        }) as unknown as Ref<string>;

        const cleanSearchText = () => { proxySearchText.value = ''; };
        const contextState = reactive({
            tag: computed(() => {
                const text = proxySearchText.value;
                return parseTag(text);
            }),
            hasKey: computed(() => contextState.tag.hasKey),
            key: computed(() => contextState.tag.key),
            operator: computed(() => contextState.tag.operator),
            value: computed(() => contextState.tag.value),
        });


        const searchFocused = ref(false);
        const contextType = computed(() => {
            if (searchFocused.value) {
                if (contextState.hasKey) return searchContextType.Value;
                return searchContextType.Key;
            }
            return searchContextType.None;
        });
        const searchBarRef = ref(null);
        const contextMenuRef = ref(null);
        const acState = reactive({
            isFocusAC: false,
            items: [],
        });


        // AC = autoComplete
        const hideAC = () => {
            acState.isFocusAC = false;
        };
        const showAC = computed(() => {
            if ((contextType.value !== searchContextType.None && acState.items.length !== 0) || acState.isFocusAC) {
                acState.isFocusAC = true;
                return true;
            }
            return false;
        });
        windowEventMount('click', hideAC);
        const getACData = async (text, forceContextType: any = undefined) => {
            const handler = isRef(props.autocompleteHandler) ? props.autocompleteHandler.value : props.autocompleteHandler;
            const result = await handler.getAutoCompleteData(forceContextType || contextType.value, text, contextState);
            acState.items = result;
        };
        watch(proxySearchText, async (text, preText) => {
            if (text !== preText) {
                await getACData(text);
                if (acState.items.length === 0) { hideAC(); }
            }
        });
        onMounted(async () => {
            await getACData('', searchContextType.Key);
        });


        const focusAC = (event) => {
            if (contextMenuRef.value && acState.items.length >= 1) {
                acState.isFocusAC = true;
                // @ts-ignore
                contextMenuRef.value.focus();
            }
        };
        const focusOut = () => {
            acState.isFocusAC = false;
            searchFocused.value = false;
        };

        const newQuery = (val?: string) => {
            if (!!contextState.key && !!contextState.value) {
                const query = new SearchQuery(contextState.key, contextState.operator, contextState.value);
                context.emit('newQuery', query);
                cleanSearchText();
            } else if (val) {
                const trimmed = val.trim();
                if (trimmed) context.emit('newQuery', new SearchQuery(SEARCH_PREFIX, '', trimmed));
                cleanSearchText();
            }
        };

        const clickMenuEvent = (event) => {
            const acType = contextType.value;
            proxySearchText.value = event;
            searchFocused.value = true;
            hideAC();
            if (acType === searchContextType.Value) { newQuery(); }
        };


        return {
            proxySearchText,
            searchFocused,
            contextState,
            newQuery,
            showAC,
            acState,
            contextMenuRef,
            searchBarRef,
            focusAC,
            focusOut,
            clickMenuEvent,
        };
    },
};

</script>

<style lang="postcss" scoped>
    .p-query-search-bar{
        width: 100%;
        position: relative;
        /*.p-search{*/
        /*    display: flex;*/
        /*}*/
    }

</style>
