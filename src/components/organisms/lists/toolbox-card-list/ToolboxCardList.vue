<template>
    <div>
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
                                           :this-page.sync="thisPage"
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
        <p-filter-badge-list :filters.sync="proxyFilters" @delete="onDeleteFilter" />
        <p-card-list class="card-container" :items="items" :mapper="mapper">
            <template v-for="(_, slot) of cardSlots" v-slot:[slot]="scope">
                <slot :name="`card-${slot}`" v-bind="scope" :items="items" />
            </template>
        </p-card-list>
        <p-row class="bottom-row" justify-content="center">
            <slot name="bottom">
                <p-col>
                    <p-text-pagenation :this-page.sync="thisPage"
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
    computed, toRefs, reactive, ref,
} from '@vue/composition-api';
import PCardList from '@/components/organisms/lists/card-list/CardList';
import PFilterBadgeList from '@/components/organisms/lists/filter-badge-list/FilterBadgeList';
import PRow from '@/components/atoms/grid/row/Row';
import PCol from '@/components/atoms/grid/col/Col';
import PTextPagenation from '@/components/organisms/pagenations/textPagenation';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn';

const setFilters = (props, context) => {
    const proxyFilters = computed({
        set(filters) {
            context.emit('update:filters', filters);
        },
        get() { return props.filters; },
    });

    const onDeleteFilter = (filter, type) => {
        context.emit('filterChange', filter, type, 'delete');
    };

    return {
        proxyFilters,
        onDeleteFilter,
    };
};

const setTools = (props, context) => {
    const limit = 10;

    const state = reactive({
        thisPage: 1,
        allPage: Math.ceil((props.totalCount || 1) / limit),
    });

    const onPageChange = (page) => {
        state.thisPage = page;
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
        PFilterBadgeList,
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
        filters: {
            type: Object,
            default: () => ({}),
        },
        title: {
            type: String,
            default: '',
        },
        sortMenu: {
            type: Array,
            default: null,
        },
        sortBy: {
            type: String,
            default: '',
        },
    },
    setup(props, context) {
        const filterState = setFilters(props, context);
        const toolState = setTools(props, context);
        const cardItemState = setCardItems(props, context);
        return {
            ...filterState,
            ...toolState,
            ...cardItemState,
        };
    },
};
</script>

<style lang="scss" scoped>
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
