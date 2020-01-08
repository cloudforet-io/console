<template>
    <div class="p-query-search-bar">
        <p-search
            ref="searchBar"
            class="p-search"
            :search-placeholder="searchPlaceholder"
            :search-text.sync="proxySearchText"
            :focused.sync="focused"
            @onSearch="newQuery"
        />
    </div>
</template>

<script>
import {
    createComponent, reactive, computed, ref,
} from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';
import PSearch from '@/components/molecules/search/Search.vue';

// export class QueryAutocompleteHandler{
//   constructor () {
//
//   }
//   _
// }

export const searchContextType = Object.freeze({
    Key: Symbol('Key'),
    Value: Symbol('Value'),
    None: Symbol('None'),
});

// regx
const keyRegx = new RegExp('^(?<key>.+?):');
const operatorRegx = new RegExp('^.+?:(?<operator>[=|<|>|!]=?)?');
// const valueRegx = new RegExp('^.+?:(?:[=|<|>|!]=?)?(?<value>.+)');

export class SearchQuery {
    constructor(key, operator, value) {
        this.key = key;
        this.operator = operator;
        this.value = value;
    }
}

export default createComponent({
    name: 'PQuerySearchBar',
    components: { PSearch },
    props: {
        searchText: {
            type: String,
            default: '',
        },
        searchPlaceholder: {
            type: String,
            default: null,
        },
    },
    event: ['newQuery'],
    setup(props, context) {
        const proxySearchText = makeProxy('searchText', props, context.emit);
        const cleanSearchText = () => { proxySearchText.value = ''; };
        const contextState = reactive({
            hasKey: computed(() => keyRegx.test(proxySearchText.value)),
            key: computed(() => {
                const result = keyRegx.exec(proxySearchText.value);
                return result && !!result.groups.key ? result.groups.key.trim() : null;
            }),
            operator: computed(() => {
                const result = operatorRegx.exec(proxySearchText.value);
                return result && !!result.groups.operator ? result.groups.operator.trim() : null;
            }),
            value: computed(() => {
                if (operatorRegx.test(proxySearchText.value)) {
                    const operatorIndex = operatorRegx.exec(proxySearchText.value)[0].length;
                    return proxySearchText.value.slice(operatorIndex);
                }
                return null;
            }),
        });

        const focused = ref(false);
        const contextType = computed(() => {
            if (focused.value) {
                if (contextState.hasKey) return searchContextType.Value;
                return searchContextType.Key;
            }
            return searchContextType.None;
        });

        const newQuery = (_) => {
            if (!!contextState.key && !!contextState.value) {
                const query = new SearchQuery(contextState.key, contextState.operator, contextState.value);
                context.emit('newQuery', query);
                cleanSearchText();
            }
        };
        return {
            proxySearchText,
            focused,
            contextState,
            newQuery,
        };
    },
});

</script>

<style lang="scss" scoped>
    .p-query-search-bar{
        width: 100%;
        .p-search{
            display: flex;
        }
    }

</style>
