<template>
    <div>
        <p-panel-top :panel-title="$t('INVENTORY.SCHEDULE')">
            <template #head>
                <p-button v-if="!isEditMode"
                          style-type="primary-dark" class="edit-btn"
                          @click="onClickEdit"
                >
                    {{ $t('COMMON.BTN_EDIT') }}
                </p-button>
                <div v-else class="edit-mode-btn-box">
                    <p-button style-type="secondary" outline
                              class="cancel-btn"
                              @click="onClickCancel"
                    >
                        {{ $t('COMMON.BTN_CANCEL') }}
                    </p-button>
                    <p-button style-type="secondary"
                              @click="onClickConfirm"
                    >
                        {{ $t('COMMON.BTN_CONFIRM') }}
                    </p-button>
                </div>
            </template>

            <template v-if="isEditMode" #body>
                <p-field-group :label="$t('COMMON.TIMEZONE')">
                    <p-select-dropdown v-model="timezone" :items="timezones" class="timezone-selector" />
                </p-field-group>
                <p-field-group :label="$t('INVENTORY.COLL_TIME')">
                    <div>
                        <span v-for="hour in hoursMatrix" :key="hour"
                              class="time-block"
                              :class="{active: selectedHours[hour]}"
                              @click="onClickHour(hour)"
                        >
                            {{ hour }}
                        </span>
                        <p-button style-type="dark" :outline="!isAllHours"
                                  @click="onClickAllHours"
                        >
                            {{ $t('COMMON.ALL') }}
                        </p-button>
                    </div>
                </p-field-group>
            </template>
        </p-panel-top>

        <div class="contents-container">
            <p-dynamic-view v-if="!isEditMode"
                            view_type="item"
                            :data="data"
                            :data_source="dataSources"
            />
        </div>
    </div>
</template>

<script>
import _ from 'lodash';
import {
    reactive, toRefs, computed, watch,
} from '@vue/composition-api';
import { MenuItem } from '@/lib/util';
import collectorEventBus from '@/views/inventory/collector/CollectorEventBus';

import PButton from '@/components/atoms/buttons/Button.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/SelectDropdown.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import { makeProxy } from '@/lib/compostion-util';

export default {
    name: 'CollectorSchedules',
    components: {
        PFieldGroup,
        PPanelTop,
        PButton,
        PSelectDropdown,
        PDynamicView,
    },
    props: {
        collector: Object,
        loading: Boolean,
        hours: Array,
        scheduleId: String,
        /**
         * sync prop
         */
        isEditMode: Boolean,
    },
    setup(props, { root, parent, emit }) {
        const getSelectedHours = () => {
            const hours = props.hours || [];
            const res = {};
            hours.forEach((h) => {
                res[h] = true;
            });
            return res;
        };

        const state = reactive({
            proxyIsEditMode: makeProxy('isEditMode', props, emit),
            timezone: _.get(root, '$store.getters.auth/timezone', 'UTC'),
            timezones: computed(() => (state.timezone === 'UTC'
                ? [new MenuItem(state.timezone)] : [
                    new MenuItem(state.timezone),
                    new MenuItem('UTC'),
                ])),
            hoursMatrix: _.range(24),
            selectedHours: getSelectedHours(),
            data: computed(() => ({
                timezone: state.timezone,
                hours: props.hours.map(val => `${val}:00`),
            })),
            dataSources: computed(() => [
                { name: parent.$t('COMMON.TIMEZONE'), key: 'timezone' },
                {
                    name: parent.$t('INVENTORY.COLL_TIME'),
                    key: 'hours',
                    // eslint-disable-next-line camelcase
                    view_type: 'list',
                    // eslint-disable-next-line camelcase
                    view_option: { item: { view_type: 'text' } },
                },
            ]),
            onClickHour: (hour) => {
                state.selectedHours[hour] = !state.selectedHours[hour];
                state.selectedHours = { ...state.selectedHours };
            },
            isAllHours: false,
            onClickAllHours: () => {
                state.isAllHours = !state.isAllHours;
                if (state.isAllHours) {
                    state.hoursMatrix.forEach((hour) => { state.selectedHours[hour] = true; });
                    state.selectedHours = { ...state.selectedHours };
                } else state.selectedHours = {};
            },
            onClickConfirm: () => {
                const params = {
                    // eslint-disable-next-line camelcase
                    collector_id: props.collector.collector_id,
                    schedule: {
                        hours: _.flatMap(state.selectedHours, (val, key) => Number(key)),
                    },
                };
                // eslint-disable-next-line camelcase
                if (props.scheduleId) params.schedule_id = props.scheduleId;
                collectorEventBus.$emit('updateCollectorSchedule', params);
            },
            onClickCancel: () => {
                state.selectedHours = getSelectedHours();
                state.proxyIsEditMode = false;
            },
            onClickEdit: () => {
                state.proxyIsEditMode = true;
            },
        });

        watch(() => props.hours, () => {
            state.selectedHours = getSelectedHours();
        });
        watch(() => props.collector, () => {
            // eslint-disable-next-line camelcase
            collectorEventBus.$emit('getCollectorSchedule', { collector_id: props.collector.collector_id });
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="scss" scoped>
    .edit-btn {
        margin-left: 1rem;
    }
    .edit-mode-btn-box {
        display: inline-block;
        margin-left: auto;
    }
    .cancel-btn {
        margin-right: 1rem;
    }
    .contents-container {
        min-height: 196px;
    }
    .timezone-selector {
        width: 30%;
        min-width: 260px;
    }
    .time-block {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border: 1px solid $gray2;
        border-radius: 2px;
        margin-right: .5rem;
        font-size: .875rem;
        cursor: pointer;
        &:hover {
            background-color: $other4;
            color: $white;
        }
        &.active {
            background-color: $safe;
            color: $white;
        }
    }
</style>
