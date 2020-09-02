<template>
    <div ref="btnGroup" class="p-select-btn-group">
        <div class="btns">
            <p-button v-for="btn in btnsData"
                      :key="btn.name"
                      :class="{ active:selected === btn.name }"
                      :outline="selected !== btn.name"
                      style-type="gray900"
                      @click="clickEvent(btn.name)"
            >
                {{ btn.label }}
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
import {
    reactive, computed, toRefs,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/PButton.vue';
import { Props, SelectBtnType } from '@/components/organisms/buttons/select-btn-group/PSelectBtnGroup.toolset';

export default {
    name: 'PSelectBtnGroup',
    components: { PButton },
    props: {
        buttons: Array,
        selected: [String, Number],
        space: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props, context) {
        const state = reactive({
            btnsData: computed(() => {
                const buttons: Array<SelectBtnType> = [];
                props.buttons.forEach((value: string|SelectBtnType) => {
                    if (typeof value === 'string') {
                        buttons.push({ name: value, label: value });
                    } else {
                        value.label = value.label || value.name;
                        buttons.push(value);
                    }
                });
                return buttons;
            }),
        });
        return {
            ...toRefs(state),
            clickEvent(name: string) {
                if (props.selected !== name) {
                    context.emit('update:selected', name);
                    context.emit('clickButton', name);
                    context.emit(`click-${name}`, name);
                }
            },
        };
    },
};
</script>

<style lang="postcss">
    .p-select-btn-group {
        @apply flex flex-wrap;
        .btns {
            margin-right: -0.5rem;
            margin-bottom: -0.5rem;
        }
        .p-button {
            @apply mr-2 mb-2;
            min-width: auto;
            &.outline {
                &:not(.disabled):hover {
                    @apply border-secondary bg-blue-200 text-secondary;
                }
            }
        }
    }
</style>
