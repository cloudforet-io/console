<template>
    <tr class="p-definition"
        :class="{block}"
    >
        <td class="key"
            :class="{'auto-width': autoKeyWidth, 'no-copy-button': disableCopy}"
            :style="{ minWidth: customKeyWidth }"
        >
            <slot name="key"
                  v-bind="{name, label, data, value: displayData}"
            >
                {{ label || name }}
            </slot>
        </td>
        <td class="value-wrapper"
            :class="{'auto-width': autoKeyWidth}"
        >
            <span class="value">
                <slot v-if="disableCopy"
                      name="default"
                      v-bind="{name, label, data, value: displayData}"
                >
                    <template v-if="dataType === 'object'">
                        <p-tag v-for="([objKey, objValue], idx) in Object.entries(displayData)"
                               :key="`tag-${idx}-${objKey}`"
                               :key-item="{ name: objKey, label: objKey }"
                               :value-item="{ name: objValue, label: String(objValue) }"
                               :deletable="false"
                        />
                    </template>
                    <template v-else-if="dataType === 'array'">
                        <p-text-list :items="displayData" />
                    </template>
                    <template v-else-if="dataType === 'array_of_object'">
                        <pre>{{ formatter ? displayData : getArrayOfObjectDisplayData(parsedData) }}</pre>
                    </template>
                    <template v-else>
                        {{ displayData }}
                    </template>
                </slot>
                <p-copy-button v-else
                               width="0.8rem"
                               height="0.8rem"
                               :value="refinedCopyValue"
                               auto-hide-icon
                >
                    <slot name="default"
                          v-bind="{name, label, data, value: displayData}"
                    >
                        <template v-if="dataType === 'object'">
                            <p-tag v-for="([objKey, objValue], idx) in Object.entries(displayData)"
                                   :key="`tag-${idx}-${objKey}`"
                                   :key-item="{ name: objKey, label: objKey }"
                                   :value-item="{ name: objValue, label: String(objValue) }"
                                   :deletable="false"
                            />
                        </template>
                        <template v-else-if="dataType === 'array'">
                            <p-text-list :items="displayData" />
                        </template>
                        <template v-else-if="dataType === 'array_of_object'">
                            <pre>{{ formatter ? displayData : getArrayOfObjectDisplayData(parsedData) }}</pre>
                        </template>
                        <template v-else>
                            {{ displayData }}
                        </template>
                    </slot>
                </p-copy-button>
            </span>
            <span v-if="$scopedSlots.extra"
                  class="extra"
            >
                <slot name="extra"
                      v-bind="{name, label, data, value: displayData}"
                />
            </span>
        </td>
    </tr>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import PCopyButton from '@/controls/buttons/copy-button/PCopyButton.vue';
import type { DefinitionProps } from '@/data-display/tables/definition-table/definition/type';
import PTag from '@/data-display/tags/PTag.vue';
import PTextList from '@/data-display/text-list/PTextList.vue';

type DataType = 'string'|'boolean'|'number'|'object'|'array'|'array_of_object'|'undefined';
export default defineComponent({
    name: 'PDefinition',
    components: {
        PTag,
        PTextList,
        PCopyButton,
    },
    props: {
        name: {
            type: String,
            default: '',
        },
        label: {
            type: String as PropType<DefinitionProps['label']>,
            default: '',
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: undefined,
        },
        disableCopy: {
            type: Boolean,
            default: undefined,
        },
        formatter: {
            type: Function as PropType<DefinitionProps['formatter']>,
            default: undefined,
        },
        block: {
            type: Boolean,
            default: false,
        },
        copyValue: {
            type: [String, Number, Array],
            default: undefined,
        },
        copyValueFormatter: {
            type: Function as PropType<DefinitionProps['copyValueFormatter']>,
            default: undefined,
        },
        autoKeyWidth: {
            type: Boolean,
            default: false,
        },
        customKeyWidth: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            displayData: computed<any>(() => (props.formatter ? props.formatter(props.data, props) : props.data)),
            parsedData: computed<any>(() => {
                let parsed;
                if (typeof props.data === 'string') {
                    try {
                        parsed = JSON.parse(props.data);
                    } catch (e) {}
                } else {
                    parsed = props.data;
                }
                return parsed;
            }),
            dataType: computed<DataType>(() => {
                if (Array.isArray(state.parsedData)) {
                    const hasObject = state.parsedData.some((d) => typeof d === 'object');
                    if (hasObject) {
                        return 'array_of_object';
                    }
                    return 'array';
                }

                return typeof state.parsedData as DataType;
            }),
        });

        const refinedCopyValue = computed(() => {
            if (props.copyValueFormatter) {
                return String(props.copyValueFormatter(props.data, props));
            }
            if (Array.isArray(props.copyValue)) {
                return props.copyValue.join(', ');
            }
            return String(props.copyValue);
        });

        const getArrayOfObjectDisplayData = (data) => JSON.stringify(data, undefined, 2);

        return {
            ...toRefs(state),
            refinedCopyValue,
            getArrayOfObjectDisplayData,
        };
    },
});
</script>

<style lang="postcss">
.p-definition {
    display: flex;
    > .key {
        @apply font-bold;
        min-width: 18rem;
        padding: 0.65rem 1rem 0.35rem 1rem;
        font-size: 0.875rem;
        line-height: 1.25;

        &.auto-width {
            min-width: auto;
        }
        &.no-copy-button {
            padding: 0.5rem 1rem;
        }
    }
    > .value-wrapper {
        display: inline-flex;
        align-items: center;
        flex-grow: 1;
        flex-wrap: wrap;
        padding: 0.5rem 1rem;
        font-size: 0.875rem;

        > .value {
            line-height: 1.25;
            > .p-copy-button {
                flex-shrink: 0;
            }
        }

        > .extra {
            flex-grow: 1;
            flex-shrink: 0;
            margin-left: 0.5rem;
        }
    }

    &.block {
        display: flex;
        > .value-wrapper {
            > .value {
                flex-grow: 1;
            }
            > .extra {
                flex-grow: unset;
            }
        }
    }

    @screen mobile {
        flex-wrap: nowrap;
        flex-direction: column;
        > .key, > .value-wrapper {
            width: 100%;
            max-width: 100%;
        }
    }
}
</style>
