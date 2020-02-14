<template>
    <div>
        <p-panel-top :panel-title="tr('INVENTORY.SCHEDULE')">
            <template #head>
                <p-button v-if="!isEditMode"
                          style-type="primary-dark" class="edit-btn"
                          @click="onClickCancel"
                >
                    {{ tr('COMMON.BTN_EDIT') }}
                </p-button>
                <div v-else class="edit-mode-btn-box">
                    <p-button style-type="secondary" outline
                              class="cancel-btn"
                              @click="proxyIsEditMode = false"
                    >
                        {{ tr('COMMON.BTN_CANCEL') }}
                    </p-button>
                    <p-button style-type="secondary"
                              @click="onClickConfirm"
                    >
                        {{ tr('COMMON.BTN_CONFIRM') }}
                    </p-button>
                </div>
            </template>

            <template v-if="isEditMode" #body>
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
                                  @click="onClickAllHours"
                        >
                            {{ tr('COMMON.ALL') }}
                        </p-button>
                    </div>
                </p-field-group>
            </template>
        </p-panel-top>

        <div class="contents-container">
            <p-dynamic-view v-if="!isEditMode"
                            :name="tr('INVENTORY.SCHEDULE')"
                            view_type="item"
                            :data="data"
                            :data_source="dataSources"
                            root-mode
            />
        </div>
    </div>
</template>

<script>
import _ from 'lodash';
import { reactive, toRefs, computed } from '@vue/composition-api';
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
        /**
         * sync prop
         */
        selectedHours: Object,
        /**
         * sync prop
         */
        isEditMode: Boolean,
    },
    setup(props, { root, parent, emit }) {
        const state = reactive({
            proxyIsEditMode: makeProxy('isEditMode', props, emit),
            timezone: _.get(root, '$store.getters.auth/timezone', 'UTC'),
            timezones: computed(() => (state.timezone === 'UTC'
                ? [new MenuItem(state.timezone)] : [
                    new MenuItem(state.timezone),
                    new MenuItem('UTC'),
                ])),
            hoursMatrix: _.range(24),
            proxySelectedHours: makeProxy('selectedHours', props, emit),
            formattedHours: computed(() => _.flatMap(state.proxySelectedHours, (val, key) => `${key}:00`)),
            data: computed(() => ({
                timezone: state.timezone,
                hours: state.formattedHours,
            })),
            dataSources: computed(() => [
                { name: parent.tr('COMMON.TIMEZONE'), key: 'timezone' },
                {
                    name: parent.tr('INVENTORY.COLL_TIME'),
                    key: 'hours',
                    // eslint-disable-next-line camelcase
                    view_type: 'list',
                    // eslint-disable-next-line camelcase
                    view_option: { item: { view_type: 'text' } },
                },
            ]),
            onClickHour: (hour) => {
                state.proxySelectedHours[hour] = !state.proxySelectedHours[hour];
                state.proxySelectedHours = { ...state.proxySelectedHours };
            },
            isAllHours: false,
            onClickAllHours: () => {
                state.isAllHours = !state.isAllHours;
                if (state.isAllHours) {
                    state.hoursMatrix.forEach((hour) => { state.proxySelectedHours[hour] = true; });
                    state.proxySelectedHours = { ...state.proxySelectedHours };
                } else state.proxySelectedHours = {};
            },
            onClickConfirm: () => {
                collectorEventBus.$emit('updateCollectorSchedule', {});
            },
            onClickCancel: () => {
                state.proxySelectedHours = {};
                state.proxyIsEditMode = true;
            },
        });

        collectorEventBus.$emit('getCollectorSchedule');

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
