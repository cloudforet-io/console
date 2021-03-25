<template>
    <div class="schedule-policy-settings">
        <p-field-group required :label="$t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.SETTING_TYPE_LABEL')">
            <div class="mt-2">
                <p-radio v-for="(item, i) in supportedSettingsTypeItems" :key="i"
                         :selected="item.name" :value="selectedType" class="mr-4"
                         @click="changeType(item.name)"
                >
                    <span @click="changeType(item.name)">{{ item.label }}</span>
                </p-radio>
            </div>
        </p-field-group>

        <p-field-group required :label="$t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.SETTING_LABEL')">
            <div class="input-wrapper">
                <div class="input-group">
                    <p class="label on-demand">
                        {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.SETTING_ONDEMAND') }}
                    </p>
                    <p-text-input v-model.number="onDemand" type="number"
                                  :min="0" :max="capacity"
                                  @input="onInput"
                    >
                        <template #right-extra>
                            {{ unit }}
                        </template>
                    </p-text-input>
                </div>
                <div class="input-group">
                    <p class="label spot-instance">
                        {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.SETTING_SPOT_INSTANCE') }}
                    </p>
                    <p-text-input v-model.number="spotInstance" type="number"
                                  :min="0" :max="capacity"
                                  @input="onInput"
                    >
                        <template #right-extra>
                            {{ unit }}
                        </template>
                    </p-text-input>
                </div>
            </div>

            <div ref="dragContainer" class="dragger-wrapper">
                <div class="line on-demand" :style="{width: `${leftWidth}%`}" />
                <div class="dragger-point">
                    <div class="dragger" :class="{dragging: isMoving}"
                         @mousedown="startMove"
                    >
                        <p-i name="ic_arrow_left_sm" width="0.5rem" height="0.5rem"
                             color="inherit"
                        />
                        <p-i name="ic_arrow_right_sm" width="0.5rem" height="0.5rem"
                             color="inherit"
                        />
                    </div>
                </div>
                <div class="line spot-instance" :style="{width: `${rightWidth}%`}" />
            </div>

            <div class="axes-wrapper">
                <div class="axes" />
                <span class="scale-group">
                    <span class="scale" />
                    <span class="tick">0</span>
                </span>
                <span class="scale-group">
                    <span class="scale" />
                    <span v-if="capacity !== 0 && capacity / 2 === halfCapacity">
                        <span class="tick">{{ halfCapacity }}</span>
                        <span class="unit">{{ unit }}</span>
                    </span>
                </span>
                <span class="scale-group">
                    <span class="scale" />
                    <span class="tick">{{ capacity }}</span>
                </span>
            </div>
        </p-field-group>
    </div>
</template>

<script lang="ts">
import {
    PFieldGroup, PI, PRadio, PTextInput,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import { SETTINGS_TYPE } from '@/views/automation/spot-automation/config';

interface Props {
    desiredCapacity: number;
}

export default {
    name: 'SchedulePolicySettings',
    components: {
        PFieldGroup,
        PRadio,
        PTextInput,
        PI,
    },
    props: {
        desiredCapacity: {
            type: Number,
            default: 0,
        },
    },
    setup(props: Props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            supportedSettingsTypeItems: computed(() => [
                { name: SETTINGS_TYPE.ratio, label: vm.$t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.SETTING_TYPE_RATIO') },
                { name: SETTINGS_TYPE.count, label: vm.$t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.SETTING_TYPE_COUNT') },
            ]),
            selectedType: SETTINGS_TYPE.ratio,
            onDemand: 0,
            spotInstance: computed({
                get: () => {
                    const res = state.capacity - state.onDemand;
                    if (res < 0) return 0;
                    return res;
                },
                set: (val) => {
                    const res = state.capacity - val;
                    if (res > state.capacity) state.onDemand = 0;
                    else if (res < 0) state.onDemand = state.capacity;
                    else state.onDemand = res;
                },
            }),
            leftWidth: computed(() => {
                if (state.selectedType === SETTINGS_TYPE.ratio) return state.onDemand;
                if (props.desiredCapacity === 0) return 50;
                return 100 / props.desiredCapacity * state.onDemand;
            }),
            rightWidth: computed<number>(() => 100 - state.leftWidth),
            isMoving: false,
            dragContainer: null as null|HTMLElement,
            unit: computed(() => (state.selectedType === SETTINGS_TYPE.count ? vm.$t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.UNIT_COUNT') : '%')),
            capacity: computed(() => (state.selectedType === SETTINGS_TYPE.count ? props.desiredCapacity : 100)),
            halfCapacity: computed(() => Math.floor(state.capacity / 2)),
        });

        const emitChange = () => {
            emit('change', {
                onDemand: state.onDemand,
                type: state.selectedType,
            });
        };


        const changeType = (type) => {
            state.selectedType = type;
            state.onDemand = 0;

            emitChange();
        };

        watch(() => props.desiredCapacity, () => {
            changeType(state.selectedType);
        });

        const onInput = () => {
            if (props.desiredCapacity === 0) {
                state.onDemand = state.halfCapacity;
                return;
            }

            if (state.onDemand > state.capacity) state.onDemand = state.capacity;
            else if (state.onDemand < 0) state.onDemand = 0;

            emitChange();
        };

        const startMove = () => {
            if (props.desiredCapacity === 0) return;
            state.isMoving = true;
        };


        const endMove = () => {
            if (state.isMoving) {
                state.isMoving = false;
                emitChange();
            }
        };

        const onMove = (event: MouseEvent) => {
            if (state.dragContainer === null || !state.isMoving || props.desiredCapacity === 0) return;

            event.preventDefault();

            const rect = state.dragContainer.getBoundingClientRect();
            const leftX = event.x - rect.x;
            const ratio = 100 / rect.width;
            const segment = 100 / props.desiredCapacity;

            let leftPercent: number;
            if (state.selectedType === SETTINGS_TYPE.ratio) {
                leftPercent = Math.round(leftX * ratio);
            } else {
                leftPercent = Math.round(leftX * ratio / segment) * segment;
            }

            if (leftPercent > 100) leftPercent = 100;
            else if (leftPercent < 0) leftPercent = 0;

            if (state.selectedType === SETTINGS_TYPE.ratio) {
                state.onDemand = leftPercent;
            } else {
                state.onDemand = Math.floor(leftPercent / 100 * props.desiredCapacity);
            }
        };

        document.addEventListener('mouseup', endMove);
        document.addEventListener('mousemove', onMove);
        onUnmounted(() => {
            document.removeEventListener('mouseup', endMove);
            document.removeEventListener('mousemove', onMove);
        });

        return {
            ...toRefs(state),
            SETTINGS_TYPE,
            changeType,
            startMove,
            onInput,
            emitChange,
        };
    },
};
</script>

<style lang="postcss" scoped>
.schedule-policy-settings {
    max-width: 696px;
}
.input-wrapper {
    display: flex;
    justify-content: space-between;
    margin-top: 0.625rem;
    .input-group {
        .label {
            margin-bottom: 0.75rem;
            font-size: 0.875rem;
            &.on-demand {
                @apply text-secondary;
            }
            &.spot-instance {
                @apply text-peacock-500;
            }
        }
        .p-text-input {
            width: 80px;
        }
    }
}
.dragger-wrapper {
    display: flex;
    align-items: center;
    margin-top: 0.5rem;
    height: 2rem;
    .dragger-point {
        position: relative;
        height: 0;
        width: 0;
        overflow: visible;
    }
    .dragger {
        @apply text-peacock-400 border border-peacock-400 bg-white;
        position: absolute;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 2rem;
        width: 2rem;
        border-radius: 100%;
        left: -1rem;
        top: -1rem;
        box-shadow: 0px 2px 4px rgba(theme('colors.black'), 0.2);
        &.dragging, &:hover {
            @apply bg-blue-100;
        }
    }
    .line {
        height: 0.5rem;
        flex-grow: 1;
        flex-shrink: 0;
        &.on-demand {
            @apply bg-secondary;
            border-bottom-left-radius: 100px;
            border-top-left-radius: 100px;
        }
        &.spot-instance {
            @apply bg-peacock-400;
            border-bottom-right-radius: 100px;
            border-top-right-radius: 100px;
        }
    }
}
.axes-wrapper {
    width: 100%;
    position: relative;
    margin-top: 1rem;
    .axes {
        @apply border-b border-gray-300;
        width: 100%;
    }
    .scale-group {
        @apply text-gray-400;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: -0.5rem;
        &:first-of-type {
            left: 0;
            transform: unset;
            align-items: flex-start;
        }
        &:last-of-type {
            left: unset;
            transform: unset;
            right: 0;
            align-items: flex-end;
        }
        .scale {
            @apply border-l border-gray-300;
            display: inline-block;
            margin-bottom: 0.25rem;
            height: 0.5rem;
        }
        .tick {
            font-size: 0.875rem;
        }
        .unit {
            font-size: 0.625rem;
        }
    }
}
</style>
