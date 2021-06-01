<template>
    <div class="webhook-tab">
        <p-toolbox-table selectable
                         sortable
                         :exportable="true"
                         :settings-visible="true"
                         :loading="loading"
                         :fields="fields"
                         :items="items"
                         :select-index.sync="selectIndex"
                         :total-count="totalCount"
                         class="mb-2 px-4"
                         @refresh="onChangeWebhookTable"
                         @export="exportDataToExcel"
        >
            <template #toolbox-top>
                <p-panel-top :title="$t('PROJECT.DETAIL.SUBTAB_WEBHOOK')" use-total-count :total-count="totalCount" />
            </template>
            <template #toolbox-left>
                <p-icon-text-button style-type="primary-dark" class="mr-4 add-btn"
                                    name="ic_plus_bold"
                                    @click="onClickAdd()"
                >
                    {{ $t('PROJECT.DETAIL.SUBTAB_WEBHOOK') }}
                </p-icon-text-button>
                <p-dropdown-menu-btn :menu="dropdownMenu"
                                     @click-update="onClickUpdate"
                                     @click-delete="onClickDelete"
                >
                    {{ $t('PROJECT.DETAIL.WEBHOOK_ACTION') }}
                </p-dropdown-menu-btn>
            </template>
        </p-toolbox-table>

        <p-button-modal :header-title="$t('PROJECT.DETAIL.MODAL_ADD_WEBHOOK_TITLE')"
                        :visible.sync="webhookAddFormVisible"
                        size="md"
                        @confirm="onAddConfirm"
        >
            <template #body>
                <div>add webhook list</div>
            </template>
        </p-button-modal>

        <p-button-modal :header-title="$t('PROJECT.DETAIL.MODAL_UPDATE_WEBHOOK_TITLE')"
                        :visible.sync="webhookUpdateFormVisible"
                        size="sm"
                        @confirm="onUpdateConfirm"
        >
            <template #body>
                <p-field-group
                    :label="$t('PROJECT.DETAIL.MODAL_UPDATE_WEBHOOK_LABEL_1')"
                    required
                >
                    <p-text-input class="block w-full"
                                  :placeholder="$t('PROJECT.DETAIL.MODAL_UPDATE_WEBHOOK_PLACEHOLDER')"
                    />
                </p-field-group>
                <p-field-group
                    :label="$t('PROJECT.DETAIL.MODAL_UPDATE_WEBHOOK_LABEL_2')"
                    required
                >
                    <div class="toggle-wrapper" :class="{enabled: enabled}">
                        <p-toggle-button :value="enabled"
                                         :theme="'secondary'"
                                         sync
                                         @change="onToggleChange"
                        />
                        <span class="label">{{ enabled ? 'enabled' : 'disabled' }}</span>
                    </div>
                </p-field-group>
            </template>
        </p-button-modal>

        <delete-modal :header-title="$t('PROJECT.DETAIL.MODAL_DELETE_WEBHOOK_TITLE')"
                      :visible.sync="webhookDeleteFormVisible"
                      @confirm="onDeleteConfirm"
        >
            <p>
                {{ $t('PROJECT.DETAIL.MODAL_DELETE_WEBHOOK_CONTENT') }}
            </p>
        </delete-modal>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import {
    PToolboxTable, PPanelTop, PIconTextButton, PDropdownMenuBtn, PButtonModal, PToggleButton, PFieldGroup, PTextInput,
} from '@spaceone/design-system';
import DeleteModal from '@/common/modules/delete-modal/DeleteModal.vue';
import { Options } from '@spaceone/design-system/dist/src/data-display/tables/search-table/type';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { SpaceConnector } from '@/lib/space-connector';
import { TranslateResult } from 'vue-i18n';
import { store } from '@/store';
import { showErrorMessage, showLoadingMessage, showSuccessMessage } from '@/lib/util';
import { Tags, TimeStamp } from '@/models';
import { FILE_NAME_PREFIX } from '@/lib/type';
import { getPageStart } from '@/lib/component-utils/pagination';
import { QueryHelper } from '@/lib/query';

interface WebhookItem {
    created_at?: TimeStamp;
    domain_id?: string;
    labels: string[];
    // eslint-disable-next-line camelcase
    project_group_info?: object;
    resource_id?: string;
    resource_type?: string;
    role_binding_id?: string;
    // eslint-disable-next-line camelcase
    role_info?: object;
    tags?: Tags;
}
interface WebhookListApiResponse {
    results: WebhookItem[];
    // eslint-disable-next-line camelcase
    total_count: number;
}
export default {
    name: 'ProjectWebhookTab',
    components: {
        PToolboxTable,
        PPanelTop,
        PIconTextButton,
        PDropdownMenuBtn,
        PButtonModal,
        PToggleButton,
        PFieldGroup,
        PTextInput,
        DeleteModal,
    },
    props: {
        projectId: {
            type: String,
            default: '',
        },
        isProjectGroup: {
            type: Boolean,
            default: false,
        },
        projectGroupId: {
            type: String,
            default: '',
        },
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            enabled: true,
            users: computed(() => vm.$store.state.resource.user.items),
            selectIndex: [] as number[],
            fields: [
                { label: 'Type', name: '', type: '' },
                { label: 'Name', name: '', type: '' },
                { label: 'Key', name: '', type: '' },
                { label: 'Webhook URL', name: '', type: '' },
                { label: 'State', name: '', type: '' },
            ],
            items: [] as WebhookItem[],
            thisPage: 1,
            pageSize: 24,
            loading: true,
            totalCount: 0,
            options: {
                searchText: '',
            } as Partial<Options>,
            selectedItems: computed(() => state.selectIndex.map(i => state.items[i])),
            isSelected: computed(() => state.selectIndex.length > 0),
            dropdownMenu: computed(() => ([
                {
                    type: 'item',
                    name: 'update',
                    label: vm.$t('PROJECT.DETAIL.WEBHOOK_UPDATE'),
                    disabled: state.selectIndex.length > 1 || !state.isSelected,
                },
                {
                    type: 'item',
                    name: 'delete',
                    label: vm.$t('PROJECT.DETAIL.WEBHOOK_DELETE'),
                    disabled: !state.isSelected,
                },
            ] as MenuItem[])),
        });

        // List api Handler for query search table
        const queryHelper = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);
        const apiQuery = new ApiQueryHelper();
        apiQuery.setPageStart(getPageStart(state.thisPage, state.pageSize))
            .setPageLimit(state.pageSize)
            .setFilters(queryHelper.filters);

        const listWebhook = async () => {
            const res = await SpaceConnector.client.identity.project.member.list({
                project_id: props.projectId,
                query: apiQuery.data,
            });
            return res;
        };
        const listGroupWebhook = async () => {
            const res = await SpaceConnector.client.identity.projectGroup.member.list({
                project_group_id: props.projectGroupId,
                query: apiQuery.data,
            });
            return res;
        };
        const listWebhooks = async () => {
            state.loading = true;
            state.selectIndex = [];
            let res = [] as unknown as WebhookListApiResponse;
            try {
                if (props.isProjectGroup) res = await listGroupWebhook();
                else res = await listWebhook();
                state.items = res.results.map(d => ({
                    ...d,
                    user_id: d.resource_id,
                }));
                state.totalCount = res.total_count;
            } catch (e) {
                state.items = [];
                state.totalCount = 0;
                console.error(e);
            }
            state.loading = false;
        };

        const onChangeWebhookTable = async (changed: any = {}) => {
        };

        const exportDataToExcel = async () => {
        };

        const formState = reactive({
            headerTitle: '' as TranslateResult,
            themeColor: '',
            webhookAddFormVisible: false,
            webhookUpdateFormVisible: false,
            webhookDeleteFormVisible: false,
        });

        const onClickAdd = () => {
            formState.webhookAddFormVisible = true;
        };

        const onAddConfirm = async () => {
            formState.webhookAddFormVisible = false;
        };

        const onClickUpdate = () => {
            formState.webhookUpdateFormVisible = true;
        };

        const onUpdateConfirm = async () => {
            formState.webhookUpdateFormVisible = false;
        };

        const onClickDelete = () => {
            formState.webhookDeleteFormVisible = true;
        };

        const onDeleteConfirm = async () => {
            formState.webhookDeleteFormVisible = false;
        };

        const onToggleChange = ({ value }) => {
            state.enabled = value;
        };

        (async () => {
            await vm.$store.dispatch('resource/user/load');
            await listWebhooks();
        })();

        return {
            ...toRefs(state),
            ...toRefs(formState),
            onChangeWebhookTable,
            onClickAdd,
            onClickUpdate,
            onClickDelete,
            onAddConfirm,
            onDeleteConfirm,
            onUpdateConfirm,
            onToggleChange,
            exportDataToExcel,
        };
    },

};
</script>

<style lang="postcss" scoped>
.webhook-tab {
    .p-pane-layout {
        @apply mb-0;
        border-width: 0;
        padding-left: 0;
        padding-right: 0;
    }
    .p-toolbox-table::v-deep {
        .p-toolbox {
            padding-top: 0;
        }
    }
}

.toggle-wrapper {
    display: flex;
    align-items: center;
    .label {
        @apply text-gray;
        margin-left: 0.25rem;
        font-size: 0.875rem;
        line-height: 1.5;
        color: theme('colors.gray[400]');
    }
    &.enabled {
        .label {
            color: theme('colors.secondary');
        }
    }
}
</style>
