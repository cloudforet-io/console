import { computed } from 'vue';
import { useRouter } from 'vue-router/composables';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useProjectGroupApi } from '@/api-clients/identity/project-group/composables/use-project-group-api';
import { i18n } from '@/translations';

import { useProjectGroupReferenceStore } from '@/store/reference/project-group-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';

export const useProjectGroupMutations = () => {
    const { projectGroupAPI, projectGroupQueryKey, projectGroupListQueryKey } = useProjectGroupApi();
    const queryClient = useQueryClient();
    const projectGroupStore = useProjectGroupReferenceStore();
    const router = useRouter();
    const { mutateAsync: createProjectGroup, isPending: isCreating } = useMutation({
        mutationFn: projectGroupAPI.create,
        onSuccess: (data) => {
            showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_CREATE_PROJECT_GROUP'), '');
            projectGroupStore.sync(data);
            queryClient.invalidateQueries({ queryKey: projectGroupListQueryKey.value });
            router.replace({
                name: PROJECT_ROUTE_V2._NAME,
                params: {
                    projectGroupOrProjectId: data.project_group_id,
                },
            });
        },
        onError: (e) => {
            ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_CREATE_PROJECT_GROUP'));
        },
    });

    const { mutateAsync: updateProjectGroup, isPending: isUpdating } = useMutation({
        mutationFn: projectGroupAPI.update,
        onSuccess: (data) => {
            showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '');
            projectGroupStore.sync(data);
            queryClient.invalidateQueries({ queryKey: [...projectGroupQueryKey.value, data.project_group_id] });
            queryClient.invalidateQueries({ queryKey: projectGroupListQueryKey.value });
        },
        onError: (e) => {
            ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP'));
        },
    });

    const isProcessing = computed(() => isCreating.value || isUpdating.value);

    return {
        createProjectGroup, updateProjectGroup, isProcessing,
    };
};
