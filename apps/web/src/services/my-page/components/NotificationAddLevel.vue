<script setup lang="ts">
import { PFieldGroup, PSelectDropdown } from '@spaceone/design-system';

import type { NotificationLevel } from '@/schema/notification/notification/type';

const LEVEL_LIST = Object.freeze([
    { label: 'Level 1', name: 'LV1', type: 'item' },
    { label: 'Level 2', name: 'LV2', type: 'item' },
    { label: 'Level 3', name: 'LV3', type: 'item' },
    { label: 'Level 4', name: 'LV4', type: 'item' },
    { label: 'Level 5', name: 'LV5', type: 'item' },
]);

const props = withDefaults(defineProps<{
    notificationLevel?: NotificationLevel;
}>(), {
    notificationLevel: 'LV1',
});
const emit = defineEmits<{(event: 'change', level: NotificationLevel): void;
}>();

const onChangeLevel = (value: NotificationLevel) => {
    emit('change', value);
};
</script>

<template>
    <fragment>
        <p-field-group :label="$t('IDENTITY.USER.NOTIFICATION.FORM.NOTIFICATION_LEVEL')"
                       required
                       class="level-dropdown"
        >
            <template #default>
                <p-select-dropdown :selected="props.notificationLevel"
                                   :menu="LEVEL_LIST"
                                   @select="onChangeLevel"
                />
            </template>
        </p-field-group>
    </fragment>
</template>

<style lang="postcss" scoped>
.level-dropdown {
    margin-top: 1.5rem;
    max-width: 15rem;
}
</style>
