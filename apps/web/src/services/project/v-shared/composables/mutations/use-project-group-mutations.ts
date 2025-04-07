import { computed } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useProjectGroupApi } from '@/api-clients/identity/project-group/composables/use-project-group-api';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const useProjectGroupMutations = () => {
    const { projectGroupAPI, projectGroupQueryKey, projectGroupListQueryKey } = useProjectGroupApi();
    const queryClient = useQueryClient();

    const { mutateAsync: createProjectGroup, isPending: isCreating } = useMutation({
        mutationFn: projectGroupAPI.create,
        onSuccess: () => {
            showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_CREATE_PROJECT_GROUP'), '');
            queryClient.invalidateQueries({ queryKey: projectGroupListQueryKey.value });
        },
        onError: (e) => {
            ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_CREATE_PROJECT_GROUP'));
        },
    });

    const { mutateAsync: updateProjectGroup, isPending: isUpdating } = useMutation({
        mutationFn: projectGroupAPI.update,
        onSuccess: (data) => {
            showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '');
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
