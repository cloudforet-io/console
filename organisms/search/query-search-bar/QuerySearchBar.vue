<template>
    <div class="p-query-search-bar">
        <p-search
            ref="searchBarRef"
            class="p-search"
            :search-placeholder="searchPlaceholder"
            :search-text.sync="proxySearchText"
            :focused.sync="searchFocused"
            @onSearch="newQuery"
            @onDownKey="focusAC"
            @onEscKey="focusOut"
        />
        <p-context-menu v-if="showAC" ref="contextMenuRef"
                        theme="dark"
                        :menu="acState.items"
                        @clickMenuEvent="clickMenuEvent"
                        @onEndOfUpKey="searchFocused=true"
                        @onEscKey="searchFocused=true"
        />
    </div>
</template>

<script>
import {
    computed, createComponent, onMounted, reactive, ref, watch,
} from '@vue/composition-api';
import { windowEventMount } from '@/lib/compostion-util';

import PSearch from '@/components/molecules/search/Search.vue';
import PContextMenu from '@/components/organisms/context-menu/context-menu/ContextMenu.vue';
import { baseAutocompleteHandler, searchContextType, SearchQuery } from '@/components/organisms/search/query-search-bar/autocompleteHandler';

// regx
const keyRegx = new RegExp('^(?<key>.+?):');
const operatorRegx = new RegExp('^.+?:(?<operator>[=|<|>|!|$]=?)?');
// const valueRegx = new RegExp('^.+?:(?:[=|<|>|!]=?)?(?<value>.+)');

export default createComponent({
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
            type: baseAutocompleteHandler,
        },
    },
    event: ['newQuery'],
    setup(props, context) {
        // const proxySearchText = makeProxy('searchText', props, context.emit);
        const proxySearchText = computed({
            get: () => props.searchText,
            set: _.debounce((val) => {
                context.emit('update:searchText', val);
            }, 150),
        });

        const cleanSearchText = () => { proxySearchText.value = ''; };
        const contextState = reactive({
            hasKey: computed(() => keyRegx.test(proxySearchText.value)),
            key: computed(() => {
                const result = keyRegx.exec(proxySearchText.value);
                return result && !!result.groups.key ? result.groups.key.trim() : '';
            }),
            operator: computed(() => {
                const result = operatorRegx.exec(proxySearchText.value);
                return result && !!result.groups.operator ? result.groups.operator.trim() : '';
            }),
            value: computed(() => {
                if (operatorRegx.test(proxySearchText.value)) {
                    const operatorIndex = operatorRegx.exec(proxySearchText.value)[0].length;
                    return proxySearchText.value.slice(operatorIndex);
                }
                return null;
            }),
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
        const getACData = async (text, forceContextType) => {
            const result = await props.autocompleteHandler.getAutoCompleteData(forceContextType || contextType.value, text, contextState);
            acState.items = result;
        };
        watch(proxySearchText, async (text, preText) => {
            if (text !== preText) {
                await getACData(text);
                if (acState.items.length === 0) { console.log('hide'); hideAC(); }
            }
        });
        onMounted(async () => {
            await getACData('', searchContextType.Key);
            console.log('onMount', acState.items);
        });


        const focusAC = (event) => {
            if (contextMenuRef.value && acState.items.length >= 1) {
                acState.isFocusAC = true;
                contextMenuRef.value.focus();
            }
        };
        const focusOut = () => {
            acState.isFocusAC = false;
            searchFocused.value = false;
        };

        const newQuery = () => {
            if (!!contextState.key && !!contextState.value) {
                console.log('newQuery');
                const query = new SearchQuery(contextState.key, contextState.operator, contextState.value);
                context.emit('newQuery', query);
                cleanSearchText();
            }
        };

        const clickMenuEvent = (event) => {
            const acType = contextType.value;
            console.log('click menu', event);
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
});

</script>

<style lang="scss" scoped>
    .p-query-search-bar{
        width: 100%;
        position: relative;
        /*.p-search{*/
        /*    display: flex;*/
        /*}*/
    }

</style>
