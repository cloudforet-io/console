<template>
    <div class="dashboard-refresh-dropdown">
        <p-icon-button class="left-icon-button"
                       name="ic_renew"
                       style-type="tertiary"
                       shape="square"
                       :animation="loading ? 'reserve-spin' : undefined"
        />
        <p-select-dropdown class="currency-select-dropdown"
                           :items="intervalItems"
                           :selected="interval"
                           :read-only="loading"
                           :class="{ loading, unfilled: !filled }"
                           @select="handleSelectInterval"
        >
            <span v-if="!filled" />
        </p-select-dropdown>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PIconButton, PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import { i18n } from '@/translations';

import type { RefreshInterval } from '@/services/dashboards/config';
import { refreshInterval } from '@/services/dashboards/config';

interface Props {
    readOnly: boolean;
    filled: boolean;
    defaultInterval: RefreshInterval;
    customizeMode: boolean;
    loading: boolean;
}

export default defineComponent<Props>({
    name: 'DashboardRefreshDropdown',
    components: {
        PIconButton,
        PSelectDropdown,
    },
    props: {
        readOnly: {
            type: Boolean,
            default: false,
        },
        filled: {
            type: Boolean,
            default: true,
        },
        defaultInterval: {
            type: String as PropType<RefreshInterval>,
            default: refreshInterval[0],
        },
        customizeMode: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            interval: props.defaultInterval,
            intervalList: computed<{label: TranslateResult; value: RefreshInterval}[]>(() => [
                { label: i18n.t('off'), value: 'off' }, // song-lang
                { label: i18n.t('15s'), value: '15s' }, // song-lang
                { label: i18n.t('30s'), value: '30s' }, // song-lang
                { label: i18n.t('1m'), value: '1m' }, // song-lang
                { label: i18n.t('5m'), value: '5m' }, // song-lang
                { label: i18n.t('10m'), value: '10m' }, // song-lang
                { label: i18n.t('30m'), value: '30m' }, // song-lang
                { label: i18n.t('1h'), value: '1h' }, // song-lang
            ]),
            intervalItems: computed<MenuItem[]>(() => state.intervalList.map((interval) => ({
                type: 'item',
                name: interval.value,
                label: interval.label,
            }))),
        });

        const handleSelectInterval = (interval) => {
            emit('update', interval);
        };

        return {
            ...toRefs(state),
            handleSelectInterval,
        };
    },
});
</script>

<style lang="postcss" scoped>
.dashboard-refresh-dropdown {
    @apply inline-flex items-center;

    /* custom design-system component - p-icon-button */
    :deep(.left-icon-button) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right: 0;
    }

    .currency-select-dropdown {
        min-width: unset;
    }

    /* custom design-system component - p-select-dropdown */
    :deep(.currency-select-dropdown) {
        .dropdown-button {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }
        &.unfilled {
            .dropdown-button {
                padding-left: 0.25rem;
            }
        }
    }
}

</style>
