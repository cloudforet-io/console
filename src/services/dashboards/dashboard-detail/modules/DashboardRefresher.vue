<template>
    <div class="dashboard-refresher">
        <!--song-lang-->
        <span class="label">{{ $t('Auto Refresh') }}: {{ interval }}</span><p-icon-button class="icon-button"
                                                                                          name="ic_renew"
                                                                                          style-type="tertiary"
                                                                                          shape="square"
                                                                                          :animation="loading ? 'reserve-spin' : undefined"
        />
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';

import { PIconButton } from '@spaceone/design-system';

import type { RefreshInterval } from '@/services/dashboards/config';
import { refreshInterval } from '@/services/dashboards/config';

interface Props {
    interval: RefreshInterval;
    loading: boolean;
}

export default defineComponent<Props>({
    name: 'DashboardRefresher',
    components: { PIconButton },
    props: {
        interval: {
            type: String as PropType<RefreshInterval>,
            default: refreshInterval[0],
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
});
</script>

<style scoped lang="postcss">
.dashboard-refresher {
    @apply inline-flex items-center;

    .label {
        @apply text-gray-500 mr-3;
        font-size: 0.875rem;
    }
}

</style>
