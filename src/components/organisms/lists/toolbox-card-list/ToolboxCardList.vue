<template>
    <p-row class="container" direction="column">
        <p-col :flex-grow="0">
            <slot name="top">
                <p-row class="top-row">
                    <p-col>
                        <slot name="leftTop">
                            <span class="title">{{ title }}</span>
                        </slot>
                    </p-col>
                    <p-col :flex-grow="0" align-self="flex-end">
                        <slot name="rightTop">
                            <p-text-pagenation class="tool t-pagination"
                                               :this-page.sync="proxyThisPage"
                                               :all-page="allPage"
                                               @pageChange="onPageChange"
                            />
                            <p-dropdown-menu-btn class="tool"
                                                 :menu="sortMenu"
                                                 @clickMenuEvent="onClickSortMenu"
                            >
                                Sort by {{ sortMenu[sortByIdx].label }}
                            </p-dropdown-menu-btn>
                        </slot>
                    </p-col>
                </p-row>
            </slot>
        </p-col>
        <p-col :flex-grow="0">
            <slot name="filters" />
        </p-col>
        <p-col :flex-shrink="0">
            <p-card-list class="card-container" :items="items" :mapper="mapper"
                         :loading="loading"
            >
                <template v-for="(_, slot) of cardSlots" v-slot:[slot]="scope">
                    <slot :name="`card-${slot}`" v-bind="scope" :items="items" />
                </template>
            </p-card-list>
        </p-col>
        <p-col :flex-grow="0">
            <slot name="bottom">
                <p-row class="bottom-row" justify-content="center">
                    <p-col>
                        <p-text-pagenation :this-page.sync="proxyThisPage"
                                           :all-page="allPage"
                                           @pageChange="onPageChange"
                        />
                    </p-col>
                </p-row>
            </slot>
        </p-col>
    </p-row>
</template>

<script>
import {
    computed, toRefs, reactive,
} from '@vue/composition-api';
import PCardList from '@/components/organisms/lists/card-list/CardList.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PTextPagenation from '@/components/organisms/pagenations/textPagenation.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import { makeProxy } from '@/lib/compostion-util';

const setTools = (props, context) => {
    const state = reactive({
        allPage: computed(() => Math.ceil((props.totalCount || 1) / props.pageSize)),
        proxyThisPage: makeProxy('thisPage', props, context.emit),
    });

    const onPageChange = (page) => {
        state.proxyThisPage = page;
        context.emit('pageChange', page);
    };

    const onClickSortMenu = (menu, idx) => {
        context.emit('update:sortByIdx', idx);
        context.emit('sortChange', idx);
    };

    return {
        ...toRefs(state),
        onPageChange,
        onClickSortMenu,
    };
};


const setCardItems = (props, context) => {
    const cardSlots = computed(() => {
        const result = {};
        Object.keys(context.slots).forEach((slotName) => {
            if (slotName.startsWith('card-')) {
                result[slotName.split('card-')[1]] = context.slots[slotName];
            }
        });
        return result;
    });
    return {
        cardSlots,
    };
};

export default {
    name: 'ToolboxCardList',
    events: ['pageChange', 'sortChange'],
    components: {
        PCardList,
        PRow,
        PCol,
        PTextPagenation,
        PDropdownMenuBtn,
    },
    props: {
        items: Array,
        mapper: Object,
        loading: {
            type: Boolean,
            default: false,
        },
        totalCount: {
            type: Number,
            default: 0,
        },
        title: {
            type: String,
            default: '',
        },
        sortMenu: {
            type: Array,
            default: null,
        },
        thisPage: {
            type: Number,
            default: 1,
        },
        pageSize: {
            type: Number,
            default: 10,
        },
        sortByIdx: {
            type: Number,
            default: 0,
        },
    },
    setup(props, context) {
        const toolState = setTools(props, context);
        const cardItemState = setCardItems(props, context);
        return {
            ...toolState,
            ...cardItemState,
        };
    },
};
</script>

<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100%;
    padding-right: 1rem;
    padding-left: 1rem;
    margin-right: auto;
    margin-left: auto;
    max-width: 916px;
}
.top-row {
    padding-bottom: 1.125rem;
    .title {
        font-size: 1.5rem;
        line-height: 1.75rem;
    }
    .tool {
        display: inline-block;
        &.t-pagination {
            margin-right: 1.75rem;
        }
    }
}
.card-container {
    height: 100%;
    margin-top: 1.5rem;
}
.bottom-row {
    margin-top: 1rem;
    text-align: center;
}
</style>
