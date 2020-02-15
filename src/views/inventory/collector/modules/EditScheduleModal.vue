<template>
    <p-button-modal :header-title="tr('INVENTORY.EDIT_SCHEDULE')"
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
                <p-select-dropdown v-model="timezone" :items="timezones" class="timezone-selector" />
            </p-field-group>
            <p-field-group :label="tr('INVENTORY.COLL_TIME')">
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
import { makeProxy } from '@/lib/compostion-util';
import { MenuItem } from '@/lib/util';
import collectorEventBus from '@/views/inventory/collector/CollectorEventBus';

import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/SelectDropdown.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PTextInput from '@/components/atoms/inputs/TextInput';


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
        const getSelectedHours = () => {
            const hours = _.get(props, 'schedule.schedule.hours', []);
            const res = {};
            hours.forEach((h) => {
                res[h] = true;
            });
            return res;
        };

        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            name: _.get(props, 'schedule.name', ''),
            timezone: _.get(root, '$store.getters.auth/timezone', 'UTC'),
            timezones: computed(() => (state.timezone === 'UTC'
                ? [new MenuItem(state.timezone)] : [
                    new MenuItem(state.timezone),
                    new MenuItem('UTC'),
                ])),
            hoursMatrix: _.range(24),
            selectedHours: getSelectedHours(),
            isAllHours: false,
        });

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

        const onClickEditConfirm = () => {
            const params = {
                // eslint-disable-next-line camelcase
                collector_id: props.collectorId,
                name: state.name,
                schedule: {
                    ..._.get(props, 'schedule.schedule', null),
                    hours: _.flatMap(state.selectedHours, (val, key) => Number(key)),
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
