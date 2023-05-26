<template>
    <p-pane-layout>
        <p-heading :title="$t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE')"
                   heading-type="sub"
        >
            <template #extra>
                <p-button size="md"
                          icon-left="ic_edit"
                          style-type="secondary"
                >
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.EDIT') }}
                </p-button>
            </template>
        </p-heading>
        <div class="schedule-wrapper">
            <p-field-title :label="$t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE_ON_OFF')"
                           :description="$t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE_TURN_ON_DESC')"
                           class="schedule-desc"
            />
            <!-- TODO: change value of toggle-button with real data -->
            <p-toggle-button :value="true" />
            <i18n path="INVENTORY.COLLECTOR.DETAIL.SCHEDULE_COLLECT_DESC"
                  tag="p"
                  class="collect-data-desc"
            >
                <template #times>
                    <!-- TODO: change times with real data -->
                    <span class="times">00:00, 04:00, 08:00, 12:00, 16:00, 20:00</span>
                </template>
            </i18n>
        </div>
    </p-pane-layout>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';

import {
    PHeading, PButton, PPaneLayout, PFieldTitle, PToggleButton,
} from '@spaceone/design-system';

// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/ban-types
const props = defineProps<{}>();

</script>

<style lang="postcss" scoped>
.schedule-wrapper {
    padding: 1rem;
    .schedule-desc {
        margin-bottom: 0.5rem;
    }
    .collect-data-desc {
        @apply text-paragraph-md font-normal;
        margin-top: 0.5rem;
        .times {
            @apply font-bold;
        }
    }
}
</style>

