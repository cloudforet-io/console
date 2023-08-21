<template>
    <div class="service-account-project-detail">
        <p-link v-if="!!projectName"
                :href="projectLink"
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

import {
    PLink, PI, PTooltip,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import { ACCOUNT_TYPE } from '@/services/asset-inventory/service-account/config';
import type { AccountType } from '@/services/asset-inventory/service-account/type';

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
        const storeState = reactive({
            projects: computed(() => store.getters['reference/projectItems']),
        });
        const state = reactive({
            projectName: computed(() => {
                if (props.projectId) return storeState.projects[props.projectId]?.label ?? '';
                return '';
            }),
            projectLink: computed(() => {
                if (props.projectId) {
                    return SpaceRouter.router.resolve(referenceRouter(props.projectId, {
                        resource_type: 'identity.Project',
                    })).href;
                }
                return undefined;
            }),
        });

        /* Init */
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
            ]);
        })();

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
