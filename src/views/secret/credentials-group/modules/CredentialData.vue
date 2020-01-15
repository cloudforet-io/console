<template>
    <div>
        <p-toolbox-table
            :items="items"
            :fields="fields"
            :selectable="true"
            :sortable="true"
            :hover="true"
            :sort-by.sync="proxySortBy"
            :sort-desc.sync="proxySortDesc"
            :all-page="proxyAllPage"
            :this-page.sync="proxyThisPage"
            :page-size.sync="proxyPageSize"
            :responsive-style="{'height': '24rem', 'overflow-y':'auto'}"
            :setting-visible="false"
            :shadow="false"
            :border="false"
            :padding="false"
            :loading="loading"
            :use-spinner-loading="true"
            :use-cursor-loading="true"
            @changePageSize="getData"
            @changePageNumber="getData"
            @clickRefresh="getData"
            @changeSort="getData"
        >
            <template #col-credential_group_info-format="{value}">
                {{value}}
            </template>
        </p-toolbox-table>
    </div>
</template>

<script>
import {
    onMounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import { makeTrItems } from '@/lib/view-helper';
import cdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';
import { makeProxy } from '@/lib/compostion-util';

const PToolboxTable = () => import('@/components/organisms/tables/toolbox-table/ToolboxTable.vue');


export default {
    name: 'PCdgData',
    components: { PToolboxTable },
    props: {
        credentialGroupId: String,
        items: {
            type: Array,
            default: () => [],
        },
        sortBy: {
            type: String,
            default: null,
        },
        sortDesc: {
            type: Boolean,
            default: true,
        },
        pageSize: {
            type: Number,
            default: 15,
        },
        allPage: {
            type: Number,
            default: 1,
            validator(value) {
                return value > 0;
            },
        },
        thisPage: {
            type: Number,
            default: 1,
            validator(value) {
                return value > 0;
            },
        },
        loading: {
            type: Boolean,
            default: false,
        },
        getCdList: String, // event name!
        // TODO: ADD button, Delete Button
    },
    setup(props, { parent, emit }) {
        const fields = makeTrItems([
            ['credential_id', 'COMMON.ID'],
            ['name', 'COMMON.NAME'],
            ['issue_type', 'COMMON.ISSUE_TYPE'],
            ['credential_group_info', 'COMMON.GROUP'],
            ['created_at', 'COMMON.CREATED'],
        ], parent);
        const state = reactive({
            proxyThisPage: makeProxy('thisPage', props, emit),
            proxyAllPage: makeProxy('allPage', props, emit),
            proxyPageSize: makeProxy('pageSize', props, emit),
            proxySortBy: makeProxy('sortBy', props, emit),
            proxySortDesc: makeProxy('sortDesc', props, emit),
            fields,
        });
        const getData = () => {
            console.log(props.getCdList)
            cdgEventBus.$emit(props.getCdList, props.credentialGroupId);
        };
        onMounted(() => {
            watch(() => props.credentialGroupId, (val) => {
                if (val) {
                    getData();
                }
            });
            getData();
        });

        return {
            ...toRefs(state),
            getData,
        };
    },
};
</script>
<style lang="scss" scoped>
    .toolbox-table{
        padding: 0;
    }
</style>
