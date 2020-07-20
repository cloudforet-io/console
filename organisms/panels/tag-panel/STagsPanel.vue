<template>
    <div class="mb-8">
        <p-panel-top :use-total-count="true" :total-count="items.length">
            <template>{{ $t('WORD.TAG') }}</template>
            <template #extra>
                <p-button style-type="primary-dark"
                          @click="editTag"
                >
                    {{ $t('BTN.EDIT') }}
                </p-button>
            </template>
        </p-panel-top>

        <p-data-table
            :fields="fields"
            :items="items"
            :col-copy="true"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, getCurrentInstance, onMounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import _ from 'lodash';
import { makeTrItems } from '@/lib/view-helper';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';

export default {
    name: 'STagsPanel',
    components: { PDataTable, PPanelTop, PButton },
    props: {
        action: {
            type: Object,
            default: null,
        },
        resourceId: {
            type: [String, Object],
            default: '',
        },
        tagPageName: {
            type: String,
            required: true,
        },
        isShow: {
            type: Boolean,
            required: true,
        },
    },
    setup(props, context) {
        const vm: any = getCurrentInstance();

        const state = reactive({
            parentRouter: computed(() => vm?.$route.matched[vm?.$route.matched.length - 2]),
            resource: computed(() => state.parentRouter?.meta),
            api: computed(() => props.action || state.resource?.api),
            fields: makeTrItems([
                ['name', 'WORD.KEY'],
                ['value', 'WORD.VALUE'],
            ], vm),
            tags: {},
            items: computed(() => _.map(state.tags, (v, k) => ({ name: k, value: v })) || []),
        });
        const editTag = () => {
            vm?.$router.push({
                name: props.tagPageName,
                params: { resourceId: props.resourceId },
                query: {
                    nextPath: vm?.$route.fullPath,
                },
            });
        };
        const getTagData = _.debounce(async () => {
            state.tags = {};
            const resp = await state.api.get().setId(props.resourceId).setOnly('tags').execute();
            state.tags = resp.data.tags;
        }, 200);

        onMounted(async () => {
            if (props.isShow && props.resourceId) {
                await getTagData();
            }
        });
        watch(() => props.resourceId, async (after, before) => {
            if (props.isShow && after && after !== before) {
                await getTagData();
            }
        });
        return {
            ...toRefs(state),
            editTag,

        };
    },
};
</script>

<style scoped>

</style>
