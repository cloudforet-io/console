<template>
    <p-button-modal :header-title="scheduleId ?$t('INVENTORY.UPT_SCHEDULE') :$t('INVENTORY.ADD_SCHEDULE')"
                    centered
                    fade
                    backdrop
                    size="lg"
                    :loading="loading"
                    :visible.sync="proxyVisible"
                    @confirm="onClickEditConfirm"
    >
        <template #body>
            <p-field-group :label="$t('COMMON.NAME')">
                <br>
                <p-text-input v-model="name" class="name" />
            </p-field-group>
            <p-field-group :label="$t('COMMON.TIMEZONE')">
                <p-select-dropdown v-model="timezone" :items="timezones"
                                   class="timezone"
                                   @input="changeTimezone"
                />
            </p-field-group>
            <p-field-group :label="$t('INVENTORY.COLL_TIME')"
                           required
                           :invalid="showValidation && !isValid"
                           invalid-text="Please select time"
            >
                <div class="time-block-container">
                    <span v-for="(hour) in hoursMatrix" :key="hour"
                          class="time-block"
                          :class="{active: selectedHours[hour] }"
                          @click="onClickHour(hour)"
                    >
                        {{ hour }}
                    </span>
                    <p-button style-type="gray" :outline="!isAllHours"
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

<script lang="ts">
import {
    reactive, toRefs, computed, getCurrentInstance, watch,
} from '@vue/composition-api';
import _ from 'lodash';
import moment from 'moment';
import { makeProxy } from '@/lib/compostion-util';

import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import { fluentApi } from '@/lib/fluent-api';
import { ScheduleAddParameter, ScheduleUpdateParameter } from '@/lib/fluent-api/inventory/collector.type';
import { showErrorMessage } from '@/lib/util';

class MenuItem {
    name: string;

    label: string;

    type: string;

    constructor(name, label?) {
        this.name = name;
        this.label = label || name;
        this.type = 'item';
    }
}

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
        /**
             * sync prop
             */
        visible: Boolean,
        collectorId: {
            type: String,
            default: '',
        },
        scheduleId: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit, root }) {
        const vm: any = getCurrentInstance();
        const state: any = reactive({
            loading: false,
            schedule: null,
            proxyVisible: makeProxy('visible', props, emit),
            name: '',
            timezone: vm.$ls.user.state.timezone || 'UTC',
            hoursMatrix: _.range(24),
            selectedHours: {},
            selectedUTCHoursList: computed(() => _.flatMap(state.selectedHours, time => moment.utc(time).hour())),
            isAllHours: computed(() => state.selectedUTCHoursList.length === 24),
            showValidation: false,
            isValid: computed(() => state.selectedUTCHoursList.length !== 0),
        });

        const timezones: any = state.timezone === 'UTC'
            ? [new MenuItem(state.timezone)] : [
                new MenuItem(state.timezone),
                new MenuItem('UTC'),
            ];

        const initSelectedHours = () => {
            const res = {};
            _.get(state, 'schedule.schedule.hours', []).forEach((hour) => {
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

        const addSchedule = async () => {
            try {
                const params: ScheduleAddParameter = {
                    // eslint-disable-next-line camelcase
                    collector_id: props.collectorId,
                    name: state.name,
                    schedule: {
                        hours: state.selectedUTCHoursList,
                    },
                };
                await fluentApi.inventory().collector().schedule().add()
                    .setParameter(params)
                    .execute();

                emit('success');
                root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'success',
                    text: 'Add Schedule',
                    duration: 2000,
                    speed: 1000,
                });
            } catch (e) {
                console.error(e);
                showErrorMessage('Fail to Add Schedule', e, root);
            }
        };

        const updateSchedule = async () => {
            try {
                const params: ScheduleUpdateParameter = {
                    // eslint-disable-next-line camelcase
                    schedule_id: props.scheduleId,
                    // eslint-disable-next-line camelcase
                    collector_id: props.collectorId,
                    name: state.name,
                    schedule: {
                        hours: state.selectedUTCHoursList,
                    },
                };

                await fluentApi.inventory().collector().schedule().update()
                    .setParameter(params)
                    .execute();

                emit('success');
                root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'success',
                    text: 'Update Schedule',
                    duration: 2000,
                    speed: 1000,
                });
            } catch (e) {
                console.error(e);
                showErrorMessage('Fail to Update Schedule', e, root);
            }
        };

        const onClickEditConfirm = async () => {
            state.showValidation = true;
            if (!state.isValid) return;

            state.loading = true;
            if (props.scheduleId) await updateSchedule();
            else await addSchedule();
            state.loading = false;
            state.proxyVisible = false;
        };

        const getSchedule = async (): Promise<void> => {
            state.loading = true;
            try {
                const res = await fluentApi.inventory().collector().schedule().get()
                    .setId(props.scheduleId)
                    .setCollectorId(props.collectorId)
                    .execute();
                state.schedule = res.data;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        watch([() => props.collectorId, () => props.scheduleId],
            async ([collectorId, scheduleId]) => {
                if (collectorId && scheduleId) await getSchedule();
            });


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

<style lang="postcss" scoped>
    .name, .timezone {
        width: 60%;
    }
    .all-btn {
        @apply text-black border-gray-300;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
        vertical-align: unset;
        &:hover {
            background-color: theme('colors.black') !important;
        }
    }
    .time-block-container {
        @apply grid;
        gap: 0.5rem;
        grid-template-columns: repeat(12, 2rem);
        grid-template-rows: auto;
    }
    .time-block {
        @apply border border-gray-300;
        display: inline-block;
        height: 2rem;
        line-height: 2rem;
        text-align: center;
        border-radius: 2px;
        font-size: 0.875rem;
        cursor: pointer;
        &:hover {
            @apply bg-green-600 text-white;
        }
        &.active {
            @apply bg-safe text-white;
        }
    }
</style>
