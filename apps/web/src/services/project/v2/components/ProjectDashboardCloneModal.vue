<script lang="ts" setup>
import { computed, watch } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PButtonModal, PFieldGroup, PTextInput,
} from '@cloudforet/mirinae';
import { getClonedName } from '@cloudforet/utils';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { DashboardCreateParams, DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { i18n } from '@/translations';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import { useFormValidator } from '@/common/composables/form-validator';


import { useDashboardCloneMutation } from '@/services/_shared/dashboard/core/composables/mutations/use-dashboard-clone-mutation';
import { useProjectDashboardQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-query';
import { useProjectPageContext } from '@/services/project/v2/composables/use-proejct-page-context';
import { useProjectOrGroupId } from '@/services/project/v2/composables/use-project-or-group-id';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';
import { useProjectDashboardModalStore } from '@/services/project/v2/stores/Project-dashboard-modal-store';

interface Props {
    projectGroupOrProjectId: string;
}
const props = defineProps<Props>();
const router = useRouter();
const projectDashboardModalStore = useProjectDashboardModalStore();
const visible = computed(() => projectDashboardModalStore.state.dashboardCloneModalVisible);
const dashboardId = computed(() => projectDashboardModalStore.state.targetId);
const projectGroupOrProjectId = computed(() => props.projectGroupOrProjectId);
const { projectGroupId, projectId } = useProjectOrGroupId(projectGroupOrProjectId);

/* Query */
const {
    dashboardList,
    dashboardSharedList,
    setQueryData,
} = useProjectDashboardQuery({
    projectId,
    projectGroupId,
});

const projectPageContext = useProjectPageContext({
    projectGroupId,
    projectId,
});
const existingNameList = computed<string[]>(() => dashboardList.value.map((d) => d.name));
const currentDashboard = computed<DashboardModel|undefined>(() => [...dashboardList.value, ...dashboardSharedList.value].find((d) => d.dashboard_id === dashboardId.value));

const {
    forms: {
        name,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    name: '',
}, {
    name(value: string) {
        if (value.length > 100) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_LENGTH');
        if (!value.trim().length) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_INPUT');
        if (existingNameList.value.find((d) => d === value)) {
            return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_UNIQUE');
        }
        return '';
    },
});

/* Event */
const handleConfirm = async () => {
    if (!isAllValid) return;

    const _sharedDashboard: DashboardCreateParams = {
        name: name.value,
        resource_group: projectPageContext.value === 'PROJECT_GROUP' ? RESOURCE_GROUP.WORKSPACE : RESOURCE_GROUP.PROJECT,
    };

    if (projectPageContext.value === 'PROJECT_GROUP') {
        _sharedDashboard.project_group_id = projectGroupId.value;
    } else if (projectPageContext.value === 'PROJECT') {
        _sharedDashboard.project_id = projectId.value;
    }

    cloneDashboard(_sharedDashboard as DashboardCreateParams, dashboardId.value);
};

const { mutate: cloneDashboard, isPending: dashboardCloneLoading } = useDashboardCloneMutation({
    onSuccess: async (data: DashboardModel) => {
        setQueryData([data as PublicDashboardModel]);
        projectDashboardModalStore.closeDashboardCloneModal();
        await router.replace({
            name: PROJECT_ROUTE_V2._NAME,
            params: {
                projectGroupOrProjectId: projectGroupOrProjectId.value,
                dashboardId: data.dashboard_id,
            },
        }).catch(() => {});
    },
    onError: (e) => {
        showErrorMessage(i18n.t('DASHBOARDS.FORM.ALT_E_CLONE_DASHBOARD'), e);
    },
});

watch(visible, (_visible) => {
    if (_visible) {
        const _clonedName = getClonedName(existingNameList.value, currentDashboard.value?.name ?? '');
        setForm('name', _clonedName);
    }
}, { immediate: true });
</script>

<template>
    <p-button-modal :visible="visible"
                    :header-title="$t('DASHBOARDS.FORM.CLONE_TITLE')"
                    size="sm"
                    :disabled="!isAllValid"
                    :loading="dashboardCloneLoading"
                    class="dashboard-clone-modal"
                    @confirm="handleConfirm"
                    @close="projectDashboardModalStore.closeDashboardCloneModal"
                    @cancel="projectDashboardModalStore.closeDashboardCloneModal"
                    @closed="projectDashboardModalStore.resetTarget"
    >
        <template #body>
            <p-field-group :label="$t('DASHBOARDS.FORM.LABEL_DASHBOARD_NAME')"
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
                           required
            >
                <template #default="{ invalid }">
                    <p-text-input :value="name"
                                  :invalid="invalid"
                                  @update:value="setForm('name', $event)"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.dashboard-clone-modal {
    .p-text-input {
        @apply w-full;
    }
}
</style>
