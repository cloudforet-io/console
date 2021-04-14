<template>
    <add-section :title="$t('AUTOMATION.SPOT_AUTOMATION.ADD.INSTANCE_TYPE.LABEL')"
                 :empty-text="$t('AUTOMATION.SPOT_AUTOMATION.ADD.SELECT_RESOURCE')"
                 :is-empty="!resourceId"
    >
        <div class="toggle-wrapper" :class="{optimized: isOptimized}">
            <p-toggle-button :value="isOptimized" sync @change="onToggleChange" />
            <span class="label">{{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.INSTANCE_TYPE.OPTIMIZED_TYPE') }}</span>
        </div>
        <div class="table-container">
            <try-again-button v-if="errored" class="mt-4" @refresh="refresh" />
            <div v-else class="table-wrapper">
                <table v-if="types.length > 0" :class="{optimized: isOptimized}">
                    <thead>
                        <tr>
                            <th scope="col" class="has-optimized" />
                            <th v-for="(type, i) in types" :key="i" scope="col"
                                :class="{'has-optimized': optimizedTypeList.includes(type)}"
                            >
                                {{ type }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="([size, items]) in candidates" :key="size">
                            <th :class="{'has-optimized': !!optimizedTypes[size]}" scope="row">
                                {{ size }}
                            </th>
                            <template v-for="(type, idx) in types">
                                <td :key="idx"
                                    :class="{'has-optimized': optimizedTypes[size] && optimizedTypeList.includes(type)}"
                                >
                                    <p-check-box v-if="items[type] !== undefined"
                                                 v-tooltip.bottom="`${type}.${size}`"
                                                 :selected="checkedTypes[size] && checkedTypes[size].includes(type)"
                                                 @change="onSelect(size, type, ...arguments)"
                                    />
                                </td>
                            </template>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-if="loading" class="loading-backdrop">
                <p-lottie name="thin-spinner" :size="2"
                          auto
                />
            </div>
            <div v-else-if="!errored && showSelectValidation && !isValid" class="invalid-cover" />
        </div>
        <p v-if="!errored && !loading && showSelectValidation && !isValid" class="invalid-text">
            {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.INSTANCE_TYPE.ONE_MORE_REQUIRED') }}
        </p>
    </add-section>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';
import { PCheckBox, PLottie, PToggleButton } from '@spaceone/design-system';
import {
    cloneDeep, remove, forEach, isEmpty, sortBy, flatMap, uniq,
} from 'lodash';
import TryAgainButton from '@/views/automation/spot-automation/components/TryAgainButton.vue';
import AddSection from '@/views/automation/spot-automation/components/AddSection.vue';

interface Props {
    resourceId: string;
    resourceType: string;
    originCandidates: string[];
}

type CandidateTuple = [string, {
    [type: string]: number;
}]

interface SelectedType {
    [size: string]: string[];
}

export default {
    name: 'InstanceTypeSelection',
    components: {
        AddSection,
        TryAgainButton,
        PToggleButton,
        PCheckBox,
        PLottie,
    },
    props: {
        resourceId: {
            type: String,
            default: '',
        },
        resourceType: {
            type: String,
            default: '',
        },
        originCandidates: {
            type: Array,
            default: () => [],
        },
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            loading: true,
            errored: false,
            candidates: [] as CandidateTuple[],
            types: [] as string[],
            isOptimized: true,
            selectedTypes: {} as SelectedType,
            optimizedTypes: {} as SelectedType,
            optimizedTypeList: computed(() => uniq(flatMap(state.optimizedTypes))),
            checkedTypes: computed(() => (state.isOptimized ? state.optimizedTypes : state.selectedTypes)),
            showSelectValidation: false,
            isValid: computed(() => !state.errored && !isEmpty(state.checkedTypes)),
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

        const candidates = new Map<string, {[type: string]: number}>();
        const types = new Set<string>();
        const setVariables = (items) => {
            candidates.clear();
            types.clear();

            state.optimizedTypes = {};
            if (props.originCandidates.length === 0) state.selectedTypes = {};

            items.forEach(({ type: str, priority }) => {
                const idx = str.indexOf('.');
                const size = str.slice(idx + 1);
                const type = str.slice(0, idx);

                if (!types.has(type)) types.add(type);

                if (candidates.has(size)) {
                    const obj = candidates.get(size);
                    if (obj) obj[type] = priority;
                } else candidates.set(size, { [type]: priority });

                if (priority === 0) {
                    if (state.optimizedTypes[size]) state.optimizedTypes[size].push(type);
                    else state.optimizedTypes[size] = [type];
                }
            });

            forEach(state.selectedTypes, (typeArr, size) => {
                if (!candidates.has(size)) {
                    typeArr.forEach((t) => {
                        candidates.set(size, { [t]: 1 });
                        types.add(t);
                    });
                } else {
                    const exists: any = candidates.get(size);
                    typeArr.forEach((t) => {
                        exists[t] = exists[t] === undefined ? 1 : exists[t];
                        if (!types.has(t)) types.add(t);
                    });
                }
            });

            const sizes = sortBy<string>(Array.from(candidates.keys()), [
                size => size.replace(/[^a-zA-Z]/g, ''), // sort by alphabet
                size => parseInt(size.replace(/[^0-9]/g, '')) || 0, // sort by numbers
            ]);

            state.candidates = sizes.map(k => [k, candidates.get(k)]);
            state.types = Array.from(types).sort();
        };

        const getCandidates = async () => {
            try {
                state.loading = true;
                const { results } = await SpaceConnector.client.spotAutomation.spotGroup.getCandidates({
                    resource_id: props.resourceId,
                    resource_type: props.resourceType,
                    limit: 50,
                });

                state.errored = false;
                setVariables(results);
            } catch (e) {
                console.error(e);
                state.errored = true;
                state.candidates = [];
                state.types = [];
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

        const refresh = async () => {
            await getCandidates();
            emitChange();
        };

        const setOriginData = () => {
            props.originCandidates.forEach((str) => {
                const idx = str.indexOf('.');
                const size = str.slice(idx + 1);
                const type = str.slice(0, idx);

                if (state.selectedTypes[size]) state.selectedTypes[size].push(type);
                else state.selectedTypes[size] = [type];
            });
            state.isOptimized = false;
        };

        watch(() => props.resourceId, async (resourceId) => {
            state.errored = false;
            if (resourceId) {
                state.selectedTypes = {};
                if (props.originCandidates.length > 0) setOriginData();

                state.optimizedTypes = {};
                emitChange();
                await getCandidates();
                emitChange();
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            onToggleChange,
            onSelect,
            refresh,
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
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
    tr {
        display: flex;
        &:hover {
            th[scope=row], td {
                @apply bg-secondary2;
            }
        }
    }
    th, td {
        @apply border-b border-gray-200 bg-white;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        min-width: 4.5rem;
        min-height: 2rem;
    }
    th {
        font-size: 0.75rem;
        line-height: 1.5;
        font-weight: bold;
        position: sticky;
        &[scope=col] {
            top: 0;
        }
        &[scope=row] {
            left: 0;
        }
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
    //background-color: rgba(theme('colors.red.100'), 0.3);
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

@screen mobile {
    table.optimized {
        th, td {
            &:not(.has-optimized) {
                display: none;
            }
        }
    }
}
</style>
