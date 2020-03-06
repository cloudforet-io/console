<template>
    <p-button-modal :header-title="schedule ?$t('INVENTORY.UPT_SCHEDULE') :$t('INVENTORY.ADD_SCHEDULE')"
                    centered
                    fade
                    backdrop
                    :loading="loading"
                    :visible.sync="proxyVisible"
                    @confirm="onClickEditConfirm"
    >
        <template #body>
            <p-field-group :label="$t('COMMON.NAME')">
                <br>
                <p-text-input v-model="name" />
            </p-field-group>
            <p-field-group :label="$t('COMMON.TIMEZONE')">
                <p-select-dropdown v-model="timezone" :items="timezones"
                                   class="timezone-selector"
                                   @input="changeTimezone"
                />
            </p-field-group>
            <p-field-group :label="$t('INVENTORY.COLL_TIME')"
                           required
                           :invalid="showValidation && !isValid"
                           invalid-text="Please select time"
            >
                <div>
                    <span v-for="(hour) in hoursMatrix" :key="hour"
                          class="time-block"
                          :class="{active: selectedHours[hour] }"
                          @click="onClickHour(hour)"
                    >
                        {{ hour }}
                    </span>
                    <p-button style-type="dark" :outline="!isAllHours"
                              class="all-btn"
                              @click="onClickAllHours"
                    >
                        {{ $t('COMMON.ALL') }}
                    </p-button>
                </div>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script>
import {
    reactive, toRefs, computed, getCurrentInstance,
} from '@vue/composition-api';
import _ from 'lodash';
import moment from 'moment';
import { makeProxy } from '@/lib/compostion-util';
import { MenuItem } from '@/lib/util';
import collectorEventBus from '@/views/inventory/collector/CollectorEventBus';

import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/SelectDropdown.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';


export default {
    name: 'EditScheduleModal',
    components: {
        PTextInput,
        PButton,
        PSelectDropdown,
        PFieldGroup,
        PButtonModal,
    },
    props: {
        loading: Boolean,
        /**
             * sync prop
             */
        visible: Boolean,
        collectorId: String,
        schedule: Object,
    },
    setup(props, { emit, root }) {
        const vm = getCurrentInstance();
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            name: _.get(props, 'schedule.name', ''),
            timezone: vm.$ls.user.state.timezone || 'UTC',
            hoursMatrix: _.range(24),
            selectedHours: {},
            selectedUTCHoursList: computed(() => _.flatMap(state.selectedHours, time => moment.utc(time).hour())),
            isAllHours: computed(() => state.selectedUTCHoursList.length === 24),
            showValidation: false,
            isValid: computed(() => state.selectedUTCHoursList.length !== 0),
        });

        const timezones = state.timezone === 'UTC'
            ? [new MenuItem(state.timezone)] : [
                new MenuItem(state.timezone),
                new MenuItem('UTC'),
            ];

        const initSelectedHours = () => {
            const res = {};
            _.get(props, 'schedule.schedule.hours', []).forEach((hour) => {
                const time = moment.tz(moment.utc({ hour }), state.timezone);
                res[time.hour()] = time;
            });
            state.selectedHours = res;
        };
        initSelectedHours();

        const changeTimezone = () => {
            const res = {};
            _.forEach(state.selectedHours, (time) => {
                const newTime = moment.tz(time, state.timezone);
                res[newTime.hour()] = newTime;
            });
            state.selectedHours = res;
        };

        const onClickHour = (hour) => {
            if (state.selectedHours[hour]) delete state.selectedHours[hour];
            else state.selectedHours[hour] = moment.tz({ hour }, state.timezone);
            state.selectedHours = { ...state.selectedHours };
        };

        const onClickAllHours = () => {
            if (state.isAllHours) state.selectedHours = {};
            else {
                state.hoursMatrix.forEach((hour) => {
                    state.selectedHours[hour] = moment.tz({ hour }, state.timezone);
                });
                state.selectedHours = { ...state.selectedHours };
            }
        };

        const onClickEditConfirm = () => {
            state.showValidation = true;
            if (!state.isValid) return;

            const params = {
                // eslint-disable-next-line camelcase
                collector_id: props.collectorId,
                name: state.name,
                schedule: {
                    ..._.get(props, 'schedule.schedule', null),
                    hours: state.selectedUTCHoursList,
                },
            };

            if (props.schedule) {
                // eslint-disable-next-line camelcase
                params.scheduler_id = props.schedule.scheduler_id;
                collectorEventBus.$emit('updateCollectorSchedule', params);
            } else { collectorEventBus.$emit('addCollectorSchedule', params); }
        };


        return {
            ...toRefs(state),
            timezones,
            changeTimezone,
            onClickHour,
            onClickAllHours,
            onClickEditConfirm,
        };
    },
};
</script>

<style lang="scss" scoped>
    .timezone-selector {
        width: 30%;
        min-width: 260px;
    }
    .all-btn {
        margin-right: .5rem;
        margin-bottom: .5rem;
        vertical-align: unset;
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
        margin-bottom: .5rem;
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
