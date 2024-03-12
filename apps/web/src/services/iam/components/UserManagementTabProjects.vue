<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PButton, PDataTable, PHeading, PI,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProjectListParameters } from '@/schema/identity/project/api-verbs/list';
import type { ProjectRemoveUsersParameters } from '@/schema/identity/project/api-verbs/remove-users';
import type { ProjectModel } from '@/schema/identity/project/model';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import UserManagementRemoveModal from '@/services/iam/components/UserManagementRemoveModal.vue';
import { useUserPageStore } from '@/services/iam/store/user-page-store';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';


interface TableItem {
    project_id?: string;
    name?: string;
    date?: string;
    key?: string;
    value?: string;
}
interface Props {
    activeTab: string;
}

const props = withDefaults(defineProps<Props>(), {
    activeTab: '',
});

const userPageStore = useUserPageStore();
const { getProperRouteLocation } = useProperRouteLocation();

const state = reactive({
    loading: false,
    items: [] as TableItem[],
    selectedRemoveItem: '',
    selectedUser: computed(() => userPageStore.selectedUsers[0]),
});
const tableState = reactive({
    fields: computed(() => [
        { name: 'name', label: i18n.t('IAM.USER.MAIN.PROJECT') as string },
        { name: 'project_id', label: i18n.t('IAM.USER.MAIN.PROJECT_ID') as string },
        { name: 'remove_button', label: ' ' },
    ]),
});
const modalState = reactive({
    visible: false,
    title: '',
    loading: false,
});

/* Component */
const handleClickButton = async (value: string) => {
    state.selectedRemoveItem = value;
    modalState.visible = true;
    modalState.title = i18n.t('IAM.USER.MAIN.MODAL.DELETE_PROJECT_MEMBER_TITLE') as string;
};
const closeRemoveModal = () => {
    modalState.visible = false;
};

/* API */
const fetchProjectList = async () => {
    state.loading = true;
    try {
        const { results } = await SpaceConnector.clientV2.identity.project.list<ProjectListParameters, ListResponse<ProjectModel>>({
            user_id: state.selectedUser.user_id,
        });
        if (!results) {
            state.items = [];
            return;
        }
        state.items = (results ?? []).map((k) => ({
            project_id: k.project_id,
            name: k.name,
        }));
    } catch (e) {
        state.items = [];
    } finally {
        state.loading = false;
    }
};
const handleRemoveButton = async () => {
    modalState.loading = true;
    try {
        await SpaceConnector.clientV2.identity.project.removeUsers<ProjectRemoveUsersParameters>({
            project_id: state.selectedRemoveItem,
            users: [state.selectedUser.user_id || ''],
        });
        showSuccessMessage(i18n.t('IAM.USER.MAIN.MODAL.ALT_S_DELETE_PROJECT_MEMBER'), '');
        closeRemoveModal();
        await fetchProjectList();
    } catch (e) {
        showErrorMessage(i18n.t('IAM.USER.MAIN.MODAL.ALT_E_DELETE_PROJECT_MEMBER'), '');
        ErrorHandler.handleError(e);
    } finally {
        modalState.loading = false;
    }
};

/* Watcher */
watch([() => props.activeTab, () => state.selectedUser.user_id], async () => {
    await fetchProjectList();
}, { immediate: true });
</script>

<template>
    <div class="user-management-tab-project">
        <p-heading heading-type="sub"
                   :use-total-count="true"
                   :total-count="state.items.length"
                   :title="$t('IAM.USER.MAIN.ASSOCIATED_PROJECTS')"
        />
        <p-data-table :fields="tableState.fields"
                      :items="state.items"
                      :loading="state.loading"
                      sort-by="name"
                      beautify-text
        >
            <template #col-name-format="{item}">
                <span class="project-name-wrapper">
                    <router-link :to="getProperRouteLocation({ name: PROJECT_ROUTE.DETAIL._NAME, params: { id: item.project_id } })"
                                 target="_blank"
                    >
                        <span>{{ item.name }}</span>
                        <p-i name="ic_arrow-right-up"
                             width="0.75rem"
                             height="0.75rem"
                             class="icon-link"
                        />
                    </router-link>
                </span>
            </template>
            <template #col-remove_button-format="{item}">
                <p-button style-type="tertiary"
                          size="sm"
                          class="remove-button"
                          @click.stop="handleClickButton(item.project_id)"
                >
                    {{ $t('IAM.USER.REMOVE') }}
                </p-button>
            </template>
        </p-data-table>
        <user-management-remove-modal v-if="modalState.visible"
                                      :visible.sync="modalState.visible"
                                      :title="modalState.title"
                                      :loading="modalState.loading"
                                      @confirm="handleRemoveButton"
        />
    </div>
</template>

<style scoped lang="postcss">
.user-management-tab-project {
    @apply flex flex-col;
    .project-name-wrapper {
        @apply flex items-center;
        .icon-link {
            margin-left: 0.125rem;
        }
    }
}
</style>
