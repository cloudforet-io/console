<script lang="ts" setup>
import {
    PAnchor, PI, PTooltip,
} from '@spaceone/design-system';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import { ACCOUNT_TYPE } from '@/services/asset-inventory/service-account/config';
import type { AccountType } from '@/services/asset-inventory/service-account/type';

interface Props {
    projectId?: string;
    serviceAccountType?: AccountType;
}

const props = withDefaults(defineProps<Props>(), {
    projectId: undefined,
    serviceAccountType: 'GENERAL',
});
const { t } = useI18n();
const router = useRouter();
const store = useStore();

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
            return router.resolve(referenceRouter(props.projectId, {
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

</script>

<template>
    <div class="service-account-project-detail">
        <p-anchor v-if="!!state.projectName"
                  :href="state.projectLink"
        >
            {{ state.projectName }}
        </p-anchor>
        <span v-if="!state.projectName && serviceAccountType === ACCOUNT_TYPE.TRUSTED">N/A</span>
        <div v-if="!state.projectName && serviceAccountType === ACCOUNT_TYPE.GENERAL">
            <span>-- <span class="required-span">{{ t('INVENTORY.SERVICE_ACCOUNT.DETAIL.REQUIRED') }}</span></span>
            <p-tooltip position="bottom"
                       class="project-required-tooltip"
                       :contents="t('INVENTORY.SERVICE_ACCOUNT.DETAIL.PROJECT_REQUIRED_HELP_TEXT')"
            >
                <p-i name="ic_question-mark-circle-filled"
                     width="1rem"
                     height="1rem"
                />
            </p-tooltip>
        </div>
    </div>
</template>

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
