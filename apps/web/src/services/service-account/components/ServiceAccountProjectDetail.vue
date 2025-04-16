<template>
    <div class="service-account-project-detail">
        <p-link v-if="!!projectName"
                action-icon="internal-link"
                new-tab
                :to="projectLink"
        >
            {{ projectName }}
        </p-link>
        <span v-if="!projectName && serviceAccountType === ACCOUNT_TYPE.TRUSTED">N/A</span>
        <div v-if="!projectName && serviceAccountType === ACCOUNT_TYPE.GENERAL">
            <span>-- <span class="required-span">{{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.REQUIRED') }}</span></span>
            <p-tooltip position="bottom"
                       class="project-required-tooltip"
                       :contents="$t('INVENTORY.SERVICE_ACCOUNT.DETAIL.PROJECT_REQUIRED_HELP_TEXT')"
            >
                <p-i name="ic_question-mark-circle-filled"
                     width="1rem"
                     height="1rem"
                />
            </p-tooltip>
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { computed, reactive, toRefs } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PLink, PI, PTooltip,
} from '@cloudforet/mirinae';


import { ACCOUNT_TYPE } from '@/api-clients/identity/service-account/schema/constant';
import type { AccountType } from '@/api-clients/identity/service-account/schema/type';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

export default {
    name: 'ServiceAccountProjectDetail',
    components: {
        PLink,
        PI,
        PTooltip,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
        serviceAccountType: {
            type: String as PropType<AccountType>,
            default: 'GENERAL',
        },
    },
    setup(props) {
        const allReferenceStore = useAllReferenceStore();
        const userWorkspaceStore = useUserWorkspaceStore();
        const router = useRouter();

        const { getReferenceLocation } = useReferenceRouter();

        const storeState = reactive({
            projects: computed(() => allReferenceStore.getters.project),
        });
        const state = reactive({
            projectName: computed(() => {
                if (props.projectId) return storeState.projects[props.projectId]?.label ?? '';
                return '';
            }),
            projectLink: computed(() => {
                if (props.projectId) {
                    return router.resolve(getReferenceLocation(props.projectId, {
                        resource_type: 'identity.Project',
                        workspace_id: userWorkspaceStore.getters.currentWorkspaceId,
                    })).resolved;
                }
                return undefined;
            }),
        });

        return {
            ...toRefs(state),
            ACCOUNT_TYPE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.service-account-project-detail {
    font-size: 0.875rem;
    .required-span {
        @apply text-red-500 mx-1;
    }
}
</style>

<style lang="postcss">
/* custom design-system component - p-tooltip */
.p-tooltip {
    .tooltip-inner {
        white-space: pre-line;
    }
}
</style>
