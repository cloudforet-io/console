<template>
    <div class="card-list-container">
        <div class="top">
            <slot name="top">
                <slot name="leftTop">
                    <span class="title">{{ title }}</span>
                </slot>

                <slot name="rightTop">
                    <div class="right-top">
                        <span>
                            <p-text-pagenation :this-page.sync="proxyThisPage"
                                               :all-page="allPage"
                                               @pageChange="onPageChange"
                            />
                        </span>
                        <p-dropdown-menu-btn class="sort"
                                             :menu="sortMenu"
                                             @clickMenuEvent="onClickSortMenu"
                        >
                            Sort by {{ sortMenu[sortByIdx].label }}
                        </p-dropdown-menu-btn>
                    </div>
                </slot>
            </slot>
        </div>

        <div class="filters">
            <slot name="filters" />
        </div>

        <p-card-list class="card-container" :items="items" :mapper="mapper"
                     :loading="loading"
        >
            <template v-for="(_, slot) of cardSlots" v-slot:[slot]="scope">
                <slot :name="`card-${slot}`" v-bind="scope" :items="items" />
            </template>
        </p-card-list>

        <div class="bottom">
            <slot name="bottom">
                <div class="bottom-page">
                    <p-text-pagenation :this-page.sync="proxyThisPage"
                                       :all-page="allPage"
                                       @pageChange="onPageChange"
                    />
                </div>
            </slot>
        </div>
    </div>
</template>

<script>
import {
    computed, toRefs, reactive,
} from '@vue/composition-api';
import PCardList from '@/components/organisms/lists/card-list/CardList.vue';
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

<style lang="postcss" scoped>
.card-list-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding-right: 1rem;
    padding-left: 1rem;
    max-width: 916px;
}
.top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1.125rem;
    .right-top {
        display: inline-flex;
        align-items: center;
    }
    .title {
        font-size: 1.5rem;
        line-height: 1.75rem;
    }
    .sort {
        margin-left: 1.75rem;
        display: inline-block;
    }
}
.card-container {
    flex-grow: 1;
    margin-top: 1.5rem;
}
.bottom {
    margin-top: 1rem;
    text-align: center;
}
</style>
