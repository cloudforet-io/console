<template>
    <div class="container">
        <slot name="top">
            <p-row class="top-row">
                <p-col>
                    <slot name="leftTop">
                        <span class="title">{{ title }}</span>
                    </slot>
                </p-col>
                <p-col :flex-grow="0" align-self="flex-end">
                    <slot name="rightTop">
                        <p-text-pagenation class="tool pagination"
                                           :this-page.sync="proxyThisPage"
                                           :all-page="allPage"
                                           @pageChange="onPageChange"
                        />
                        <p-dropdown-menu-btn class="tool"
                                             :menu="sortMenu"
                                             @clickMenuEvent="onClickSortMenu"
                        >
                            Sort by {{ sortBy }}
                        </p-dropdown-menu-btn>
                    </slot>
                </p-col>
            </p-row>
        </slot>
        <slot name="filters" />
        <p-card-list class="card-container" :items="items" :mapper="mapper">
            <template v-for="(_, slot) of cardSlots" v-slot:[slot]="scope">
                <slot :name="`card-${slot}`" v-bind="scope" :items="items" />
            </template>
        </p-card-list>
        <p-row class="bottom-row" justify-content="center">
            <slot name="bottom">
                <p-col>
                    <p-text-pagenation :this-page.sync="proxyThisPage"
                                       :all-page="allPage"
                                       @pageChange="onPageChange"
                    />
                </p-col>
            </slot>
        </p-row>
    </div>
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

    const onClickSortMenu = (menu) => {
        context.emit('update:sortBy', menu);
        context.emit('sortChange', menu);
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
    events: ['pageChange', 'sortChange', 'filterChange'],
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
        sortBy: {
            type: String,
            default: '',
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
        &.pagination {
            margin-right: 1.75rem;
        }
    }
}
.card-container {
    margin-top: 1.5rem;
}
.bottom-row {
    margin-top: 1rem;
    text-align: center;
}
</style>
