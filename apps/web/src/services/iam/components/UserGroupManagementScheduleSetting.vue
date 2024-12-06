<script lang="ts" setup>
import { PFieldGroup, PRadioGroup, PRadio } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

const SCHEDULE_SETTING_LIST = [
    i18n.t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.WEEKDAYS'),
    i18n.t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.EVERYDAY'),
    i18n.t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.CUSTOM'),
];
</script>

<template>
    <div class="user-group-schedule-setting-wrapper">
        <p-field-group :label="$t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.SCHEDULE_SETTING')"
                       required
        >
            <p-radio-group direction="horizontal">
                <p-radio v-for="(schedule_setting, i) in SCHEDULE_SETTING_LIST"
                         :key="i"
                >
                    {{ schedule_setting }}
                </p-radio>
            </p-radio-group>
        </p-field-group>
    </div>
</template>

<style scoped lang="postcss">
.user-group-schedule-setting-wrapper {
    @apply flex flex-col bg-white border border-primary-3 rounded-md;
    padding: 0.75rem;
}
</style>
