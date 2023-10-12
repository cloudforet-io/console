<template>
    <fragment>
        <p-field-group :label="$t('IDENTITY.USER.NOTIFICATION.FORM.NOTIFICATION_LEVEL')"
                       required
                       class="level-dropdown"
        >
            <template #default>
                <p-select-dropdown v-model="proxyNotificationLevel"
                                   :items="LEVEL_LIST"
                                   @select="onChangeLevel"
                />
            </template>
        </p-field-group>
    </fragment>
</template>

<script lang="ts">

import { reactive, toRefs } from 'vue';

import { PFieldGroup, PSelectDropdown } from '@spaceone/design-system';

const LEVEL_LIST = Object.freeze([
    { label: 'Level 1', name: 'LV1', type: 'item' },
    { label: 'Level 2', name: 'LV2', type: 'item' },
    { label: 'Level 3', name: 'LV3', type: 'item' },
    { label: 'Level 4', name: 'LV4', type: 'item' },
    { label: 'Level 5', name: 'LV5', type: 'item' },
]);

export default {
    name: 'AddNotificationLevel',
    components: {
        PFieldGroup,
        PSelectDropdown,
    },
    props: {
        notificationLevel: {
            type: String,
            default: null,
        },
    },
    setup(props, { emit }) {
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
        return {
            LEVEL_LIST,
            ...toRefs(state),
            onChangeLevel,
        };
    },
};
</script>

<style lang="postcss" scoped>
.level-dropdown {
    margin-top: 1.5rem;
    max-width: 15rem;
}
</style>
