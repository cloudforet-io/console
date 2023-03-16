<template>
    <p-list-card v-if="visible && !loading && maintenanceHappenings.length !== 0"
                 :loading="loading"
                 :items="maintenanceHappenings"
                 style-type="yellow500"
    >
        <template #header>
            <div class="header-wrapper"
                 @click="onClickHeader"
            >
                <p-i name="ic_warning-filled"
                     height="1.25rem"
                     width="1.25rem"
                     color="inherit"
                     class="icon"
                />
                <span class="text">{{ $t('PROJECT.DETAIL.NOW_HAPPENING_MAINTENANCE') }}</span>
                <p-i name="ic_close"
                     height="1.25rem"
                     width="1.25rem"
                     color="inherit"
                     class="close-button"
                />
            </div>
        </template>
        <template #item="{item}">
            <div>
                <span class="title">{{ item.title }}</span>
                <span>
                    {{ iso8601Formatter(item.startTime, timezone, TIME_FORMAT) }} ~
                    {{ iso8601Formatter(item.endTime, timezone, TIME_FORMAT) }}
                </span>
            </div>
        </template>
    </p-list-card>
</template>

<script lang="ts">

import { computed, reactive, toRefs } from 'vue';

import { PListCard, PI } from '@spaceone/design-system';

import { iso8601Formatter } from '@cloudforet/core-lib';

import { store } from '@/store';

import { useProjectDetailPageStore } from '@/services/project/store/project-detail-page-store';
import type { MaintenanceHappening } from '@/services/project/store/project-detail-page-store';

const TIME_FORMAT = 'YYYY-MM-DD HH:mm';
export default {
    name: 'MaintenanceHappeningList',
    components: {
        PListCard,
        PI,
    },
    setup() {
        const projectDetailPageStore = useProjectDetailPageStore();
        const projectDetailPageState = projectDetailPageStore.state;
        const state = reactive({
            loading: false,
            maintenanceHappenings: computed<MaintenanceHappening[]>(() => projectDetailPageState.maintenanceHappenings),
            timezone: computed(() => store.state.user.timezone),
            visible: true,
        });

        const onClickHeader = () => {
            state.visible = false;
        };

        /* Init */
        (async () => {
            state.loading = true;
            console.log(projectDetailPageStore);
            projectDetailPageStore.loadMaintenanceHappenings();
            state.loading = false;
        })();

        return {
            ...toRefs(state),
            onClickHeader,
            iso8601Formatter,
            TIME_FORMAT,
        };
    },
};
</script>

<style lang="postcss" scoped>
.header-wrapper {
    display: flex;
    align-items: center;
    cursor: pointer;
    .icon {
        margin-right: 0.25rem;
        flex-shrink: 0;
    }
    .text {
        flex-shrink: 0;
        flex-grow: 1;
    }
    .close-button {
        flex-shrink: 0;
    }
}

.title {
    @apply font-bold;
    margin-right: 0.5rem;
}
</style>
