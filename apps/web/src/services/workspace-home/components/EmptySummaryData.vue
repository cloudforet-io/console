<script setup lang="ts">
import { useRouter } from 'vue-router/composables';

import { PI, PTextButton } from '@spaceone/design-system';

import { green, peacock } from '@/styles/colors';

import { SUMMARY_DATA_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import type { EmptyData, SummaryDataType } from '@/services/workspace-home/types/workspace-home-type';

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

const router = useRouter();
</script>

<template>
    <div class="empty-summary-data"
         :style="{ backgroundImage: `url(${props.imageUrl})` }"
         :class="{[props.type]: true}"
    >
        <div class="icon-wrapper">
            <p-i class="menu-icon"
                 :name="props.type === SUMMARY_DATA_TYPE.ASSET ? 'ic_service_cloud-service' : 'ic_service_cost-report'"
                 height="1.75rem"
                 width="1.75rem"
                 :color="props.type === SUMMARY_DATA_TYPE.ASSET ? peacock[800] : green[800]"
            />
        </div>
        <span class="title">{{ props.emptyData.title }}</span>
        <span class="desc">{{ props.emptyData.desc }}</span>
        <p-text-button style-type="highlight"
                       @click="router.push(props.emptyData.to)"
        >
            <span>{{ props.emptyData.buttonText }}</span>
        </p-text-button>
    </div>
</template>

<style scoped>
.empty-summary-data {
    @apply flex flex-col justify-center items-center;
    min-height: 25.25rem;
    height: calc(100% - 1.375rem);
    background-repeat: no-repeat;
    background-position: left;
    gap: 0.75rem;
    &.cost {
        background-position: left 1rem center;
        .icon-wrapper {
            @apply bg-green-100;
        }
        .title {
            @apply text-green-800;
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
