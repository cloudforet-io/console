<template>
    <fragment>
        <p-field-group :label="$t('IDENTITY.USER.NOTIFICATION.FORM.NOTIFICATION_LEVEL')" required
                       class="level-dropdown"
        >
            <template #default>
                <p-select-dropdown v-model="notificationLevel" :items="LEVEL_LIST" :use-custom-style="true"
                                   @input="onChangeLevel"
                />
            </template>
        </p-field-group>
    </fragment>
</template>

<script lang="ts">

import { PFieldGroup, PSelectDropdown } from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';

const LEVEL_LIST = [
    { label: 'All', name: 'ALL', type: 'item' },
    { label: 'Level 1', name: 'LV1', type: 'item' },
    { label: 'Level 2', name: 'LV2', type: 'item' },
    { label: 'Level 3', name: 'LV3', type: 'item' },
    { label: 'Level 4', name: 'LV4', type: 'item' },
    { label: 'Level 5', name: 'LV5', type: 'item' },
];

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
            notificationLevel: props.notificationLevel ? props.notificationLevel : 'ALL',
        });
        const emitChange = () => {
            emit('change', {
                level: state.notificationLevel,
            });
        };
        const onChangeLevel = (value) => {
            state.notificationLevel = value;
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
