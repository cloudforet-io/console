<template>
    <div>
        <div class="toggle-wrapper" :class="{optimized: isOptimized}">
            <p-toggle-button :value="isOptimized" sync @change="onToggleChange" />
            <span class="label">{{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.INSTANCE_TYPE.OPTIMIZED_TYPE') }}</span>
        </div>
        <div class="table-container">
            <div class="table-wrapper">
                <table v-if="types.size > 0">
                    <thead>
                        <tr>
                            <th />
                            <th v-for="(type, i) in types" :key="i" class="header">
                                {{ type }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(items, size, rowIdx) in candidates" :key="rowIdx">
                            <td class="header">
                                {{ size }}
                            </td>
                            <template v-for="(type, idx) in types">
                                <td :key="idx">
                                    <p-check-box v-if="items[type] !== undefined"
                                                 :selected="checkedTypes[size] && checkedTypes[size].includes(type)"
                                                 @change="onSelect(size, type, ...arguments)"
                                    />
                                </td>
                            </template>
                        </tr>
                    </tbody>
                    <p v-if="showValidation && selectedTypes.length === 0">
                        {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.INSTANCE_TYPE.ONE_MORE_REQUIRED') }}
                    </p>
                </table>
            </div>
            <div v-if="loading" class="loading-backdrop">
                <p-lottie name="thin-spinner" :size="2"
                          auto
                />
            </div>
            <div v-if="showSelectValidation && !isValid" class="invalid-cover" />
        </div>
        <p v-if="showSelectValidation && !isValid" class="invalid-text">
            {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.INSTANCE_TYPE.ONE_MORE_REQUIRED') }}
        </p>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';
import { PCheckBox, PLottie, PToggleButton } from '@spaceone/design-system';
import {
    cloneDeep, remove, forEach, isEmpty,
} from 'lodash';

interface Props {
    resourceId: string;
    resourceType: string;
    showValidation: boolean;
}

interface CandidateMap {
    [size: string]: {
        [type: string]: number;
    };
}

interface SelectedType {
    [size: string]: string[];
}

export default {
    name: 'InstanceTypeSelection',
    components: { PToggleButton, PCheckBox, PLottie },
    props: {
        resourceId: {
            type: String,
            default: '',
        },
        resourceType: {
            type: String,
            default: '',
        },
        showValidation: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            loading: true,
            candidates: {} as CandidateMap,
            types: {} as Set<string>,
            isOptimized: true,
            selectedTypes: {} as SelectedType,
            optimizedTypes: {} as SelectedType,
            checkedTypes: computed(() => (state.isOptimized ? state.optimizedTypes : state.selectedTypes)),
            showSelectValidation: props.showValidation,
            isValid: computed(() => !isEmpty(state.checkedTypes)),
        });

        const emitChange = () => {
            const res: string[] = [];
            forEach(state.checkedTypes, (types, size) => {
                types.forEach(type => res.push(`${type}.${size}`));
            });
            emit('change', res, state.isValid);
        };

        const onToggleChange = ({ value }) => {
            state.isOptimized = value;
            emitChange();
        };

        const getCandidates = async () => {
            try {
                state.loading = true;
                const { results } = await SpaceConnector.client.spotAutomation.spotGroup.getCandidates({
                    resource_id: props.resourceId,
                    resource_type: props.resourceType,
                });

                const candidates = {} as CandidateMap;
                const types = new Set<string>();
                const optimizedTypes = {} as SelectedType;

                results.forEach(({ type: str, priority }) => {
                    const idx = str.indexOf('.');
                    const size = str.slice(idx + 1);
                    const type = str.slice(0, idx);

                    if (!types.has(type)) types.add(type);
                    if (!candidates[size]) candidates[size] = { [type]: priority };
                    else candidates[size][type] = priority;

                    if (priority > 0) {
                        if (optimizedTypes[size]) optimizedTypes[size].push(type);
                        else optimizedTypes[size] = [type];
                    }
                });

                state.candidates = candidates;
                state.types = types;
                state.optimizedTypes = optimizedTypes;
                state.selectedTypes = {};
            } catch (e) {
                console.error(e);
                state.candidates = {};
                state.types = new Set<string>();
                state.optimizedTypes = {};
                state.selectedTypes = {};
            } finally {
                state.loading = false;
            }
        };

        const checkSelectedAndOptimizedTypes = () => {
            const selectedKeys = Object.keys(state.selectedTypes).sort();
            const optimizedKeys = Object.keys(state.optimizedTypes).sort();
            const selectedValues = selectedKeys.map(k => state.selectedTypes[k]);
            const optimizedValues = optimizedKeys.map(k => state.optimizedTypes[k]);
            return JSON.stringify(selectedKeys) === JSON.stringify(optimizedKeys)
                && JSON.stringify(selectedValues) === JSON.stringify(optimizedValues);
        };

        const onSelect = (size, type, selected) => {
            if (!state.showSelectValidation) state.showSelectValidation = true;

            if (state.isOptimized) {
                state.isOptimized = false;
                state.selectedTypes = cloneDeep(state.optimizedTypes);
            }

            if (selected) {
                if (!state.selectedTypes[size]) {
                    state.selectedTypes[size] = [type];
                } else if (!state.selectedTypes[size].includes(type)) {
                    state.selectedTypes[size].push(type);
                }
            } else if (state.selectedTypes[size]) {
                remove(state.selectedTypes[size], d => d === type);
                if (state.selectedTypes[size].length === 0) delete state.selectedTypes[size];
            }
            state.selectedTypes = cloneDeep(state.selectedTypes);

            if (!state.isOptimized && checkSelectedAndOptimizedTypes()) {
                state.isOptimized = true;
            }

            emitChange();
        };

        watch(() => props.showValidation, (showValidation) => {
            state.showSelectValidation = showValidation;
        });

        watch(() => props.resourceId, async (resourceId) => {
            if (resourceId) {
                state.loading = true;
                setTimeout(async () => {
                    await getCandidates();
                }, 2000);
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            onToggleChange,
            onSelect,
        };
    },
};
</script>

<style lang="postcss" scoped>
.toggle-wrapper {
    display: flex;
    align-items: center;
    .label {
        margin-left: 0.25rem;
        font-size: 0.875rem;
        line-height: 1.5;
    }
    &.optimized {
        .label {
            @apply text-secondary;
        }
    }
}
.table-container {
    position: relative;
}
.table-wrapper {
    width: 100%;
    overflow: auto;
    margin-top: 1.5rem;
    min-height: 12rem;
}
table {
    min-width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
    tr {
        display: flex;
    }
    th, td {
        @apply border-b border-gray-200;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        min-width: 4.5rem;
        min-height: 2rem;
    }
    .header {
        font-size: 0.75rem;
        line-height: 1.5;
        font-weight: bold;
    }
}
.loading-backdrop {
    @apply bg-white;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0.5;
}
.invalid-cover {
    @apply absolute w-full h-full overflow-hidden border border-alert;
    background-color: rgba(theme('colors.red.100'), 0.3);
    pointer-events: none;
    top: 0;
    z-index: 1;
}
.invalid-text {
    @apply text-alert;
    margin-top: 0.25rem;
    font-size: 0.875rem;
    line-height: 1.5;
}
</style>
