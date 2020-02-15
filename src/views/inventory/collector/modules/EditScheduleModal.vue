<template>
    <p-button-modal :header-title="collectorId ? tr('INVENTORY.UPT_SCHEDULE') : tr('INVENTORY.ADD_SCHEDULE')"
                    centered
                    fade
                    backdrop
                    :loading="loading"
                    :visible.sync="proxyVisible"
                    @confirm="onClickEditConfirm"
    >
        <template #body>
            <p-field-group :label="tr('COMMON.NAME')">
                <br>
                <p-text-input v-model="name" />
            </p-field-group>
            <p-field-group :label="tr('COMMON.TIMEZONE')">
                <p-select-dropdown v-model="timezone" :items="timezones"
                                   class="timezone-selector"
                                   @input="setSelectedHours"
                />
            </p-field-group>
            <p-field-group :label="tr('INVENTORY.COLL_TIME')"
                           required
                           :invalid="showValidation && !isValid"
                           invalid-text="Please select time"
            >
                <div>
                    <span v-for="hour in hoursMatrix" :key="hour"
                          class="time-block"
                          :class="{active: selectedHours[hour]}"
                          @click="onClickHour(hour)"
                    >
                        {{ hour }}
                    </span>
                    <p-button style-type="dark" :outline="!isAllHours"
                              class="all-btn"
                              @click="onClickAllHours"
                    >
                        {{ tr('COMMON.ALL') }}
                    </p-button>
                </div>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script>
import { reactive, toRefs, computed } from '@vue/composition-api';
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
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            name: _.get(props, 'schedule.name', ''),
            timezone: _.get(root, '$store.getters.auth/timezone', 'UTC'),
            hoursMatrix: _.range(24),
            selectedHours: undefined,
            isAllHours: false,
            showValidation: false,
            isValid: false,
        });

        const timezones = state.timezone === 'UTC'
            ? [new MenuItem(state.timezone)] : [
                new MenuItem(state.timezone),
                new MenuItem('UTC'),
            ];

        const setSelectedHours = () => {
            const hours = _.get(props, 'schedule.schedule.hours', []);
            const res = {};
            hours.forEach((hour) => {
                res[moment.tz(moment.utc({ hour }), state.timezone).hour()] = true;
            });
            state.selectedHours = res;
        };
        setSelectedHours();

        const onClickHour = (hour) => {
            state.selectedHours[hour] = !state.selectedHours[hour];
            state.selectedHours = { ...state.selectedHours };
        };

        const onClickAllHours = () => {
            state.isAllHours = !state.isAllHours;
            if (state.isAllHours) {
                state.hoursMatrix.forEach((hour) => { state.selectedHours[hour] = true; });
                state.selectedHours = { ...state.selectedHours };
            } else state.selectedHours = {};
        };

        const getHours = () => {
            const hours = [];
            _.forEach(state.selectedHours, (val, hour) => {
                if (val) hours.push(hour);
            });
            return hours;
        };

        const onClickEditConfirm = () => {
            state.showValidation = true;
            const hours = [];
            _.forEach(state.selectedHours, (val, hour) => {
                if (val) hours.push(moment.utc(moment.tz({ hour }, state.timezone)).hour());
            });
            if (hours.length === 0) {
                state.isValid = false;
                return;
            }

            const params = {
                // eslint-disable-next-line camelcase
                collector_id: props.collectorId,
                name: state.name,
                schedule: {
                    ..._.get(props, 'schedule.schedule', null),
                    hours,
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
            setSelectedHours,
            onClickHour,
            onClickAllHours,
            getHours,
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
