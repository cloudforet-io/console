<template>
    <tr class="p-definition"
        :class="{block}"
    >
        <td class="key"
            :class="{'auto-width': autoKeyWidth, 'no-copy-button': disableCopy}"
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
                               :value-item="{ name: objValue, label: objValue }"
                               :deletable="false"
                        />
                    </template>
                    <template v-else-if="dataType === 'array'">
                        <p-text-list :items="displayData" />
                    </template>
                    <template v-else>
                        {{ displayData }}
                    </template>
                </slot>
                <p-copy-button v-else
                               width="0.8rem"
                               height="0.8rem"
                               :value="copyValueFormatter ? copyValueFormatter(data, $props) : copyValue"
                               auto-hide-icon
                >
                    <slot name="default"
                          v-bind="{name, label, data, value: displayData}"
                    >
                        <template v-if="dataType === 'object'">
                            <p-tag v-for="([objKey, objValue], idx) in Object.entries(displayData)"
                                   :key="`tag-${idx}-${objKey}`"
                                   :key-item="{ name: objKey, label: objKey }"
                                   :value-item="{ name: objValue, label: objValue }"
                                   :deletable="false"
                            />
                        </template>
                        <template v-else-if="dataType === 'array'">
                            <p-text-list :items="displayData" />
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
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import type { DefinitionProps } from '@/data-display/tables/definition-table/definition/type';
import PTag from '@/data-display/tags/PTag.vue';
import PTextList from '@/data-display/text-list/PTextList.vue';
import PCopyButton from '@/inputs/buttons/copy-button/PCopyButton.vue';

export default defineComponent<DefinitionProps>({
    name: 'PDefinition',
    components: {
        PTag, PTextList, PCopyButton,
    },
    props: {
        name: {
            type: String,
            default: '',
        },
        label: {
            type: String,
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
            type: Function,
            default: undefined,
        },
        block: {
            type: Boolean,
            default: false,
        },
        copyValue: {
            type: [String, Number],
            default: undefined,
        },
        copyValueFormatter: {
            type: Function,
            default: undefined,
        },
        autoKeyWidth: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const state = reactive({
            displayData: computed(() => (props.formatter ? props.formatter(props.data, props) : props.data)),
            dataType: computed(() => {
                if (Array.isArray(props.data)) return 'array';
                return typeof props.data;
            }),
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss">
.p-definition {
    display: flex;
    > .key {
        @apply font-bold;
        width: 18rem;
        padding: 0.65rem 1rem 0.35rem 1rem;
        font-size: 0.875rem;
        line-height: 1.25;

        &.auto-width {
            width: auto;
        }
        &.no-copy-button {
            padding: 0.5rem 1rem;
        }
    }
    > .value-wrapper {
        max-width: calc(100% - 18rem);
        display: inline-flex;
        align-items: center;
        flex-grow: 1;
        flex-wrap: wrap;
        padding: 0.5rem 1rem;
        font-size: 0.875rem;

        &.auto-width {
            max-width: none;
        }

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
