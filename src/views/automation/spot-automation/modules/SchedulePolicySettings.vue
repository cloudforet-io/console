<template>
    <add-section :title="$t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.LABEL')"
                 :empty-text="$t('AUTOMATION.SPOT_AUTOMATION.ADD.SELECT_RESOURCE')"
                 :is-empty="!resourceId"
    >
        <template #default>
            <div class="schedule-policy-settings">
                <p-field-group required :label="$t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.SETTING_TYPE_LABEL')">
                    <p-radio v-for="(item, i) in supportedSettingsTypeItems" :key="i"
                             :selected="item.name" :value="selectedType" class="mr-4"
                             @click="changeType(item.name)"
                    >
                        <span @click="changeType(item.name)">{{ item.label }}</span>
                    </p-radio>
                </p-field-group>

                <p v-if="selectedType === SETTINGS_TYPE.count" class="count-info">
                    <p-i name="ic_outlined-info" color="inherit" height="1em"
                         width="1em"
                    />
                    <span class="desc"> {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.DESC') }}</span>
                </p>

                <p-field-group required :label="$t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.SETTING_LABEL')" class="mb-0">
                    <div class="settings-wrapper">
                        <try-again-button v-if="showError" class="error-box" @refresh="refresh" />
                        <template v-else>
                            <div class="input-wrapper">
                                <div class="input-group">
                                    <p class="label on-demand">
                                        {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.SETTING_ONDEMAND') }}
                                    </p>
                                    <p-text-input v-model.number="onDemand" type="number"
                                                  :min="0" :max="capacity"
                                                  :disabled="changeDisabled"
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
                                    <p-text-input :value="spotInstance" disabled type="number">
                                        <template #right-extra>
                                            {{ unit }}
                                        </template>
                                    </p-text-input>
                                </div>
                            </div>

                            <div ref="dragContainer" class="dragger-wrapper">
                                <div class="line on-demand" :style="{width: `${leftWidth}%`}" @mousedown="onMove($event, true)" />
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
                                <div class="line spot-instance" :style="{width: `${rightWidth}%`}" @mousedown="onMove($event, true)" />
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
                        </template>

                        <div v-if="loading" class="loading-backdrop">
                            <p-lottie name="thin-spinner" :size="2"
                                      auto
                            />
                        </div>
                    </div>
                </p-field-group>
            </div>
        </template>
    </add-section>
</template>

<script lang="ts">
import {
    PFieldGroup, PI, PLottie, PRadio, PTextInput,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy,
    computed,
    getCurrentInstance,
    onUnmounted,
    reactive,
    toRefs,
    watch,
} from '@vue/composition-api';
import { SETTINGS_TYPE } from '@/views/automation/spot-automation/lib/config';
import { throttle } from 'lodash';
import TryAgainButton from '@/views/automation/spot-automation/components/TryAgainButton.vue';
import { SpaceConnector } from '@/lib/space-connector';
import AddSection from '@/views/automation/spot-automation/components/AddSection.vue';

interface Props {
    resourceId: string;
    originOnDemand: {
        type: SETTINGS_TYPE;
        value: number;
    };
}

const PADDING = 16;

export default {
    name: 'SchedulePolicySettings',
    components: {
        AddSection,
        TryAgainButton,
        PFieldGroup,
        PRadio,
        PTextInput,
        PI,
        PLottie,
    },
    props: {
        resourceId: {
            type: String,
            default: '',
        },
        originOnDemand: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: Props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            supportedSettingsTypeItems: computed(() => [
                { name: SETTINGS_TYPE.count, label: vm.$t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.SETTING_TYPE_COUNT') },
                { name: SETTINGS_TYPE.ratio, label: vm.$t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.SETTING_TYPE_RATIO') },
            ]),
            selectedType: SETTINGS_TYPE.count,
            loading: false,
            errored: false,
            showError: computed(() => state.errored && state.selectedType === SETTINGS_TYPE.count),
            desiredCapacity: 0,
            onDemand: 0,
            spotInstance: computed(() => {
                const res = state.capacity - state.onDemand;
                if (res < 0) return 0;
                return res;
            }),
            changeDisabled: computed(() => state.selectedType === SETTINGS_TYPE.count && state.desiredCapacity === 0),
            dragContainer: null as null|HTMLElement,
            dragContainerWidth: 0,
            dragContainerX: 0,
            pxRatio: computed(() => (state.dragContainerWidth === 0 ? 1 : 100 / state.dragContainerWidth)),
            padding: computed(() => (state.dragContainerWidth === 0 ? PADDING : state.pxRatio * PADDING)),
            leftWidth: computed(() => {
                let res;
                if (state.changeDisabled) res = 0;
                else if (state.selectedType === SETTINGS_TYPE.ratio) res = state.onDemand;
                else res = 100 / state.desiredCapacity * state.onDemand;

                const max = 100 - state.padding;
                const min = state.padding;
                if (res > max) res = max;
                else if (res < min) res = min;

                return res;
            }),
            rightWidth: computed<number>(() => 100 - state.leftWidth),
            isMoving: false,
            unit: computed(() => (state.selectedType === SETTINGS_TYPE.count ? vm.$t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.UNIT_COUNT') : '%')),
            capacity: computed(() => (state.selectedType === SETTINGS_TYPE.count ? state.desiredCapacity : 100)),
            halfCapacity: computed(() => Math.floor(state.capacity / 2)),
            intervalByCountRatio: computed(() => 100 / state.desiredCapacity),
        });

        const emitChange = () => {
            emit('change', {
                onDemand: state.onDemand,
                spotInstance: state.spotInstance,
                type: state.selectedType,
            }, !state.showError);
        };


        const changeType = (type) => {
            state.selectedType = type;
            state.onDemand = 0;

            emitChange();
        };

        const onInput = () => {
            if (state.onDemand > state.capacity) state.onDemand = state.capacity;
            else if (state.onDemand < 0) state.onDemand = 0;

            emitChange();
        };

        const startMove = () => {
            if (state.changeDisabled) return;
            state.isMoving = true;
        };


        const endMove = () => {
            if (state.isMoving) {
                state.isMoving = false;
                emitChange();
            }
        };

        const onResize = throttle(() => {
            if (!state.dragContainer) return;
            const rect = state.dragContainer.getBoundingClientRect();
            state.dragContainerWidth = rect.width;
            state.dragContainerX = rect.x;
        }, 500);

        const onMove = (event: MouseEvent, force = false) => {
            if (state.dragContainer === null || (!force && !state.isMoving) || state.changeDisabled) return;

            event.preventDefault();
            const leftX = event.pageX - state.dragContainerX;

            let onDemandPercent: number;
            if (state.selectedType === SETTINGS_TYPE.ratio) {
                onDemandPercent = Math.round(leftX * state.pxRatio);
            } else {
                onDemandPercent = Math.round(leftX * state.pxRatio / state.intervalByCountRatio) * state.intervalByCountRatio;
            }

            if (onDemandPercent > 100) onDemandPercent = 100;
            else if (onDemandPercent < 0) onDemandPercent = 0;

            if (state.selectedType === SETTINGS_TYPE.ratio) {
                state.onDemand = onDemandPercent;
            } else {
                state.onDemand = Math.floor(onDemandPercent / 100 * state.desiredCapacity);
            }

            if (force) emitChange();
        };

        window.addEventListener('resize', onResize);
        document.addEventListener('mouseup', endMove);
        document.addEventListener('mousemove', onMove);
        onUnmounted(() => {
            window.removeEventListener('resize', onResize);
            document.removeEventListener('mouseup', endMove);
            document.removeEventListener('mousemove', onMove);
        });

        watch(() => state.dragContainer, (dragContainer) => {
            if (dragContainer && state.dragContainerWidth === 0) {
                onResize();
            }
        });


        const getDesiredCapacity = async () => {
            try {
                state.loading = true;
                const { count } = await SpaceConnector.client.spotAutomation.spotGroup.getCloudServiceInstanceCount({
                    // eslint-disable-next-line camelcase
                    cloud_service_id: props.resourceId,
                });
                state.desiredCapacity = count;
                state.errored = false;
            } catch (e) {
                state.errored = true;
                state.desiredCapacity = 0;
            } finally {
                state.loading = false;
            }
        };

        const refresh = async () => {
            await getDesiredCapacity();
            changeType(state.selectedType);
        };

        watch(() => props.resourceId, async (resourceId) => {
            state.errored = false;
            if (resourceId) await getDesiredCapacity();
            state.selectedType = props.originOnDemand.type || SETTINGS_TYPE.count;
            state.onDemand = props.originOnDemand.value || 0;
            emitChange();
        }, { immediate: true });

        return {
            ...toRefs(state),
            SETTINGS_TYPE,
            changeType,
            startMove,
            onInput,
            onMove,
            refresh,
        };
    },
};
</script>

<style lang="postcss" scoped>
.schedule-policy-settings {
    max-width: 696px;
}
.settings-wrapper {
    position: relative;
    padding-bottom: 1rem;
    .loading-backdrop {
        @apply bg-white;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        opacity: 0.5;
    }
}
.input-wrapper {
    display: flex;
    justify-content: space-between;
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
    margin-top: 0.75rem;
    height: 32px;
    .dragger-point {
        position: relative;
        height: 0;
        width: 0;
        overflow: visible;
    }
    .dragger {
        @apply text-peacock-400 border-2 border-peacock-400 bg-white;
        position: absolute;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        width: 32px;
        border-radius: 100%;
        left: -16px;
        top: -16px;
        box-shadow: 0 2px 4px rgba(theme('colors.black'), 0.2);
        transition: all .2s .2s;
        &.dragging, &:hover {
            @apply bg-blue-100;
            transform: scale(1.1);
            transition: all .2s .2s;
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
    padding-bottom: 0.25rem;
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
.error-box {
    margin-top: 0.375rem;
}
.count-info {
    @apply text-secondary;
    font-size: 0.75rem;
    vertical-align: middle;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    .desc {
        line-height: 1.5;
    }
}

</style>
