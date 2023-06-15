<template>
    <div class="info-item">
        <p class="info-label">
            {{ $t('INVENTORY.COLLECTOR.MAIN.RECENT_JOBS') }}
        </p>
        <div class="jobs-wrapper">
            <div v-for="(jobStatus, index) in props.item.recentJobAnalyze"
                 :key="`job-item-${index}`"
                 class="jobs-contents"
                 @click.stop
            >
                <p-tooltip v-if="jobStatus.status === JOB_STATE.SUCCESS"
                           class="icon-fill-wrapper success"
                           :contents="$t('INVENTORY.COLLECTOR.MAIN.JOB_SUCCESS', {date: dayjs.utc(jobStatus.finished_at).tz(storeState.timezone).format('YYYY-MM-DD hh:mm:ss')})"
                           position="top"
                >
                    <router-link :to="{ name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME, params: { jobId: jobStatus.job_id} }">
                        <p-i
                            name="ic_check"
                            class="icon success"
                            height="1rem"
                            width="1rem"
                            color="inherit"
                        />
                    </router-link>
                </p-tooltip>
                <p-tooltip v-else-if="jobStatus.status === JOB_STATE.IN_PROGRESS"
                           class="icon-fill-wrapper progress"
                           :contents="$t('INVENTORY.COLLECTOR.MAIN.JOB_PROGRESS')"
                           position="top"
                >
                    <p-i
                        name="ic_settings-filled"
                        class="icon progress"
                        height="1rem"
                        width="1rem"
                        color="inherit"
                    />
                </p-tooltip>
                <p-tooltip v-else-if="jobStatus.status === JOB_STATE.NONE"
                           class="icon-fill-wrapper none"
                           :contents="$t('INVENTORY.COLLECTOR.MAIN.JOB_NONE')"
                           position="top"
                />
                <p-tooltip v-else
                           class="icon-fill-wrapper error"
                           :contents="$t('INVENTORY.COLLECTOR.MAIN.JOB_ERROR', {date: dayjs.utc(jobStatus.finished_at).tz(storeState.timezone).format('YYYY-MM-DD hh:mm:ss')})"
                           position="top"
                >
                    <router-link :to="{ name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME, params: { jobId: jobStatus.job_id} }">
                        <span class="exclamation-mark">!</span>
                    </router-link>
                </p-tooltip>
            </div>
        </div>
        <div class="to-history-detail">
            <router-link :to="props.item.historyLink">
                <span>{{ $t('INVENTORY.COLLECTOR.MAIN.VIEW_HISTORY_DETAIL') }}</span>
                <p-i
                    name="ic_chevron-right"
                    width="0.75rem"
                    height="0.75rem"
                    color="inherit transparent"
                />
            </router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTooltip, PI } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { store } from '@/store';

import type { CollectorItemInfo } from '@/services/asset-inventory/collector/collector-main/type';
import { JOB_STATE } from '@/services/asset-inventory/collector/collector-main/type';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

interface Props {
    item?: CollectorItemInfo;
}

const props = withDefaults(defineProps<Props>(), {
    item: undefined,
});

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone),
});
</script>

<style lang="postcss" scoped>
.info-item {
    @apply flex flex-col;
    gap: 0.5rem;

    .info-label {
        @apply text-label-sm text-gray-500;
    }
}
</style>
