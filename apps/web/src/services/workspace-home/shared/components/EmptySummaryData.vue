<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { isEmpty } from 'lodash';

import { PI, PTextButton } from '@cloudforet/mirinae';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import type { RoleInfo } from '@/store/authorization/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import {
    green, indigo, peacock, violet,
} from '@/styles/colors';

import { SUMMARY_DATA_TYPE } from '@/services/workspace-home/shared/constants/summary-type-constant';
import type { EmptyData } from '@/services/workspace-home/shared/types/empty-data-type';
import type { SummaryDataType } from '@/services/workspace-home/shared/types/summary-type';

type IconInfo = {
    name: string,
    color: string,
};
interface Props {
    imageUrl: string;
    emptyData?: EmptyData;
    type?: SummaryDataType;
}

const props = withDefaults(defineProps<Props>(), {
    imageUrl: '',
    emptyData: undefined,
    type: undefined,
});

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const authorizationStore = useAuthorizationStore();

const router = useRouter();

const storeState = reactive({
    getCurrentRoleInfo: computed<RoleInfo|undefined>(() => authorizationStore.state.currentRoleInfo),
    projects: computed<ProjectReferenceMap>(() => allReferenceGetters.project),
});
const state = reactive({
    isWorkspaceMember: computed(() => storeState.getCurrentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
    icon: computed<IconInfo>(() => {
        if (props.type === SUMMARY_DATA_TYPE.ASSET) {
            return {
                name: 'ic_service_cloud-service',
                color: peacock[800],
            };
        }
        if (props.type === SUMMARY_DATA_TYPE.ACCOUNT) {
            return {
                name: 'ic_service_service-account',
                color: indigo[700],
            };
        }
        if (state.isWorkspaceMember && isEmpty(storeState.projects)) {
            return {
                name: 'ic_service_project',
                color: violet[700],
            };
        }
        return {
            name: 'ic_service_cost-report',
            color: green[800],
        };
    }),
});

const handleClickButton = () => {
    if (props.emptyData?.to) {
        router.push(props.emptyData.to);
    }
};
</script>

<template>
    <div v-if="props.emptyData"
         class="empty-summary-data"
         :style="{ backgroundImage: `url(${props.imageUrl})` }"
         :class="{
             [props.type ? props.type.toLowerCase() : '']: true,
             'no-project-data': state.isWorkspaceMember && isEmpty(storeState.projects)
         }"
    >
        <div class="icon-wrapper">
            <p-i class="menu-icon"
                 :name="state.icon.name"
                 height="1.75rem"
                 width="1.75rem"
                 :color="state.icon.color"
            />
        </div>
        <span class="title">{{ props.emptyData.title }}</span>
        <span class="desc">{{ props.emptyData.desc }}</span>
        <p-text-button v-if="!state.isWorkspaceMember && props.emptyData?.buttonText"
                       style-type="highlight"
                       @click="handleClickButton"
        >
            <span>{{ props.emptyData.buttonText }}</span>
        </p-text-button>
    </div>
</template>

<style scoped>
.empty-summary-data {
    @apply flex flex-col justify-center items-center text-center;
    min-height: 25.25rem;
    height: 27.625rem;
    background-repeat: no-repeat;
    background-position: left;
    padding-right: 2.5rem;
    padding-left: 2.5rem;
    gap: 0.75rem;
    &.cost {
        background-position: left 1rem center;
        .icon-wrapper {
            @apply bg-green-100;
        }
        .title {
            @apply text-green-800;
        }
        &.no-project-data {
            .icon-wrapper {
                @apply bg-violet-150;
            }
            .title {
                @apply text-violet-700;
            }
        }
    }
    &.account {
        .icon-wrapper {
            @apply bg-indigo-100;
        }
        .title {
            @apply text-indigo-700;
        }
    }
    .icon-wrapper {
        @apply flex justify-center items-center bg-peacock-100 rounded-full;
        width: 2.75rem;
        height: 2.75rem;
    }
    .title {
        @apply text-label-xl text-peacock-800 font-medium;
    }
    .desc {
        @apply text-gray-700;
    }
}
</style>
