<template>
    <div>
        <p-toolbox-table
            ref="toolbox"
            :items="items"
            :fields="fields"
            :selectable="true"
            :sortable="true"
            :dragable="true"
            :hover="true"
            :responsive="true"
            :sort-by.sync="proxySortBy"
            :sort-desc.sync="proxySortDesc"
            :all-page="proxyAllPage"
            :this-page.sync="proxyThisPage"
            :page-size.sync="proxyPageSize"
            :select-index.sync="selectIndex"
            :responsive-style="{'height': '24rem', 'overflow-y':'auto'}"
            :setting-visible="true"
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
            <template slot="toolbox-left">
                <p-button class="left-toolbox-item" style-type="primary-dark"
                          @click="onClick"
                >
                    {{ tr('COMMON.BTN_ADD') }}
                </p-button>
                <p-button style-type="alert"
                          :disabled="isNotSelected"
                          :outline="true"
                          class="left-toolbox-item"
                          @click="clickDelete"
                >
                    {{ tr('COMMON.BTN_DELETE') }}
                </p-button>
            </template>
            <template #col-credential_groups-format="{value}">
                <p-badge v-for="(grp, index) in value" :key="index" style-type="gray2"
                         class="group-badge"
                >
                    {{ grp.name }}
                </p-badge>
            </template>
            <template #col-created_at-format="{value}">
                {{ timestampFormatter(value) }}
            </template>
        </p-toolbox-table>
        <p-table-check-modal
            v-if="!!checkTableModalState.mode"
            :visible.sync="checkTableModalState.visible"
            :header-title="checkTableModalState.title"
            :sub-title="checkTableModalState.subTitle"
            :theme-color="checkTableModalState.themeColor"
            :fields="modalFields"
            size="lg"
            :centered="true"
            :selectable="false"
            :items="getSelectedCdItems"
            @confirm="checkModalConfirm"
        />
        <p-cdg-form v-if="cdgFormState.visible"
                    :header-title="cdgFormState.headerTitle"
                    :items="cdgFormState.items"
                    :update-mode="cdgFormState.updateMode"
                    :visible.sync="cdgFormState.visible"
                    @confirm="cdgFormConfirm"
        />
    </div>
</template>

<script>
import {
    computed,
    onMounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import { eventNames } from '@/views/secret/credentials-group/pages/CredentialsGroup.template.vue';
import { makeTrItems } from '@/lib/view-helper';
import cdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';
import PButton from '@/components/atoms/buttons/Button.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PCdgForm from '@/views/secret/credentials-group/modules/CredentialGroupForm.vue';
import { timestampFormatter } from '@/lib/util';
import { makeProxy } from '@/lib/compostion-util';
import PTableCheckModal from '@/components/organisms/modals/action-modal/ActionConfirmModal.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';

const PToolboxTable = () => import('@/components/organisms/tables/toolbox-table/ToolboxTable.vue');

export default {
    name: 'PCdgCredential',
    components: {
        PBadge,
        PI,
        PToolboxTable,
        PTableCheckModal,
        PButton,
        PCdgForm,
    },
    props: {
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
        getCdList: String, // event name
        deleteCd: String,
        credentialGroupId: String,
    },

    setup(props, { parent, emit }) {
        const fields = makeTrItems([
            ['credential_id', 'COMMON.ID'],
            ['name', 'COMMON.NAME'],
            ['issue_type', 'COMMON.ISSUE_TYPE'],
            ['credential_groups', 'COMMON.GROUP'],
            ['created_at', 'COMMON.CREATED'],
        ], parent);
        const modalFields = makeTrItems([
            ['credential_id', 'COMMON.ID'],
            ['name', 'COMMON.NAME'],
        ], parent);
        const state = reactive({
            proxyThisPage: makeProxy('thisPage', props, emit),
            proxyAllPage: makeProxy('allPage', props, emit),
            proxyPageSize: makeProxy('pageSize', props, emit),
            proxySortBy: makeProxy('sortBy', props, emit),
            proxySortDesc: makeProxy('sortDesc', props, emit),
            selectIndex: [],
            fields,
            modalFields,
        });
        const getData = () => {
            cdgEventBus.$emit(props.getCdList, props.credentialGroupId);
        };

        const sortSelectIndex = computed(() => {
            const idxs = [...state.selectIndex];
            idxs.sort((a, b) => a - b);
            return idxs;
        });
        const isNotSelected = computed(() => state.selectIndex.length === 0);
        const isNotOnlyOneSelected = computed(() => state.selectIndex.length !== 1);
        const getSelectedCdItems = computed(() => {
            const items = [];
            sortSelectIndex.value.forEach((idx) => {
                items.push(props.items[idx]);
            });
            return items;
        });
        const getSelectedCdIds = computed(() => {
            const ids = [];
            getSelectedCdItems.value.forEach((item) => {
                ids.push(item.credential_id);
            });
            return ids;
        });
        const getFirstSelectedCdId = computed(() => (getSelectedCdIds.value.length >= 1 ? getSelectedCdIds.value[0] : ''));
        const cdgFormState = reactive({
            visible: false,
            mode: '',
            headerTitle: '',
            item: null,
            searchText: '',
            eventName: '',
        });
        const checkTableModalState = reactive({
            visible: false,
            mode: '',
            item: null,
            confirmEventName: '',
            title: '',
            subTitle: '',
            themeColor: '',
        });

        const resetCheckTableModalState = () => {
            checkTableModalState.visible = false;
            checkTableModalState.mode = '';
            checkTableModalState.confirmEventName = '';
            checkTableModalState.title = '';
            checkTableModalState.subTitle = '';
            checkTableModalState.item = null;
            checkTableModalState.themeColor = '';
        };
        const cdgFormConfirm = (item) => {
            eventBus.$emit(cdgFormState.eventName, item);
            cdgFormState.visible = false;
            cdgFormState.mode = '';
        };

        const clickDelete = () => {
            checkTableModalState.mode = 'delete';
            checkTableModalState.confirmEventName = props.deleteCd;
            checkTableModalState.title = 'Delete Credentials from Credentials Group';
            checkTableModalState.subTitle = 'Are you sure you want to delete selected Credentials below?';
            checkTableModalState.themeColor = 'alert';
            checkTableModalState.items = undefined;
            checkTableModalState.visible = true;
        };

        const checkModalConfirm = (event) => {
            state.selectIndex = [];
            cdgEventBus.$emit(checkTableModalState.confirmEventName, event, getFirstSelectedCdId.value, props.credentialGroupId);
            resetCheckTableModalState();
        };

        const onClick = () => {
            parent.$router.push({ name: 'addCredentials', params: { id: props.credentialGroupId } });
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
            checkTableModalState,
            isNotSelected,
            getSelectedCdItems,
            getSelectedCdIds,
            getFirstSelectedCdId,
            getData,
            clickDelete,
            cdgFormState,
            cdgFormConfirm,
            checkModalConfirm,
            timestampFormatter,
            onClick,
        };
    },
};
</script>
<style lang="scss" scoped>
    .left-toolbox-item{
        margin-right: 1rem;
    }

    .toolbox-table{
        padding: 0;
    }

    .group-badge {
        margin-right: 0.3rem;
    }
</style>
