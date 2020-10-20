import { action } from '@storybook/addon-actions';
import PToolboxGridLayout from '@/components/organisms/layouts/toolbox-grid-layout/PToolboxGridLayout.vue';
import casual, { arrayOf } from '@/components/util/casual';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { getAllPage } from '@/components/organisms/paginations/text-pagination/helper';

export default {
    title: 'organisms/layouts/toolbox-grid-layout',
    component: PToolboxGridLayout,
    parameters: {
        info: {
            components: { PToolboxGridLayout },
        },
    },
};

export const defaultCase = () => ({
    components: { PToolboxGridLayout },
    template: `<PToolboxGridLayout
                v-bind="$props"
                :items="items"
                :this-page="thisPage"
                :page-size="pageSize"
                :all-page="allPage"
                @changePageNumber="getData"
                @changePageSize="getData"
                @clickRefresh="getData"
    >
        <template #card="{item}">
            <div> 이 곳에 내용을 작성하세요 {{ item.name }}</div>
        </template>
    </PToolboxGridLayout>`,
    props: {

    },
    setup(props, context) {
        const state = reactive({
            items: [],
            loading: true,
            thisPage: 1,
            pageSize: 24,
            allPage: computed(() => getAllPage(state.totalCount, (state.pageSize))),
            totalCount: 0,
        });
        const getData = async () => {
            state.loading = true;
            state.items = await new Promise(resolve => setTimeout(() => resolve(arrayOf(30, () => ({
                id: casual.uuid, name: casual.word, group: casual.word,
            }))), 1000));
            state.totalCount = state.items.length;
            state.loading = false;
        };
        getData();

        return {
            ...toRefs(state),
            ...action,
            getData,
        };
    },
});
