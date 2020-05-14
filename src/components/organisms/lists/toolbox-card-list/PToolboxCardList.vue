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
                        <p-select-dropdown class="sort" :select-item="sortBy" :items="sortMenu"
                                           @input="updateSortBy"
                                           @onSelected="onClickSortMenu"
                        />
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

<script lang="ts">
import {
    computed, toRefs, reactive,
} from '@vue/composition-api';
import PCardList from '@/components/organisms/lists/card-list/PCardList.vue';
import PTextPagenation from '@/components/organisms/pagenations/textPagenation.vue';
import { makeProxy } from '@/lib/compostion-util';
import _ from 'lodash';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/SelectDropdown.vue';
import { toolboxCardListProps } from './PToolboxCardList.toolset';

const setTools = (props, context) => {
    const state = reactive({
        allPage: computed(() => Math.ceil((props.totalCount || 1) / props.pageSize)),
        proxyThisPage: makeProxy('thisPage', props, context.emit),
        proxySortBy: makeProxy('sortBy', props, context.emit),
    });

    const onPageChange = (page) => {
        state.proxyThisPage = page;
        context.emit('pageChange', page);
    };

    const updateSortBy = _.debounce((val) => {
        context.emit('update:sortBy', val);
    }, 200);

    const onClickSortMenu = (menu, idx) => {
        // context.emit('update:sortByIdx', idx);
        updateSortBy(menu);
        context.emit('sortChange', menu);
    };

    return {
        ...toRefs(state),
        onPageChange,
        onClickSortMenu,
        updateSortBy,
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
    name: 'PToolboxCardList',
    events: ['pageChange', 'sortChange'],
    components: {
        PSelectDropdown,
        PCardList,
        PTextPagenation,
    },
    props: toolboxCardListProps,
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
    width: 100%;
}
.bottom {
    margin-top: 1rem;
    text-align: center;
}
</style>
