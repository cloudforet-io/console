<script lang="ts" setup>

import { iso8601Formatter } from '@cloudforet/core-lib';
import { PListCard, PI } from '@spaceone/design-system';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { useProjectDetailPageStore } from '@/services/project/store/project-detail-page-store';
import type { MaintenanceHappening } from '@/services/project/store/project-detail-page-store';

const TIME_FORMAT = 'YYYY-MM-DD HH:mm';

const store = useStore();
const { t } = useI18n();

const projectDetailPageStore = useProjectDetailPageStore();
const projectDetailPageState = projectDetailPageStore.$state;
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
    await projectDetailPageStore.loadMaintenanceHappenings();
    state.loading = false;
})();

</script>

<template>
    <p-list-card v-if="state.visible && !state.loading && state.maintenanceHappenings.length !== 0"
                 :loading="state.loading"
                 :items="state.maintenanceHappenings"
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
                <span class="text">{{ t('PROJECT.DETAIL.NOW_HAPPENING_MAINTENANCE') }}</span>
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
                    {{ iso8601Formatter(item.startTime, state.timezone, TIME_FORMAT) }} ~
                    {{ iso8601Formatter(item.endTime, state.timezone, TIME_FORMAT) }}
                </span>
            </div>
        </template>
    </p-list-card>
</template>

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
