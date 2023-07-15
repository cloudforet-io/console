<script lang="ts" setup>

import { PFieldGroup, PSelectDropdown } from '@spaceone/design-system';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';

const LEVEL_LIST = Object.freeze([
    { label: 'Level 1', name: 'LV1', type: 'item' },
    { label: 'Level 2', name: 'LV2', type: 'item' },
    { label: 'Level 3', name: 'LV3', type: 'item' },
    { label: 'Level 4', name: 'LV4', type: 'item' },
    { label: 'Level 5', name: 'LV5', type: 'item' },
]);

interface props {
    notificationLevel: string;
}

const props = defineProps<props>();
const emit = defineEmits<{(e: 'change', value: { level: string }): void}>();
const { t } = useI18n();

const state = reactive({
    proxyNotificationLevel: props.notificationLevel ? props.notificationLevel : 'LV1',
});
const emitChange = () => {
    emit('change', {
        level: state.proxyNotificationLevel,
    });
};
const onChangeLevel = (value) => {
    state.proxyNotificationLevel = value;
    emitChange();
};

</script>

<template>
    <p-field-group :label="t('IDENTITY.USER.NOTIFICATION.FORM.NOTIFICATION_LEVEL')"
                   required
                   class="level-dropdown"
    >
        <template #default>
            <p-select-dropdown v-model:selected="state.proxyNotificationLevel"
                               :items="LEVEL_LIST"
                               @select="onChangeLevel"
            />
        </template>
    </p-field-group>
</template>

<style lang="postcss" scoped>
.level-dropdown {
    margin-top: 1.5rem;
    max-width: 15rem;
}
</style>
