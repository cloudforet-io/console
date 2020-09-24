<template>
    <div ref="btnGroup" class="p-select-btn-group">
        <div class="button-lap">
            <p-button v-for="button in formattedButtons"
                      :key="button.name"
                      :class="{ active:selected === button.name }"
                      :outline="selected !== button.name"
                      :style-type="styleType"
                      @click="onClickButton(button.name)"
            >
                {{ button.label }}
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
import {
    reactive, computed, toRefs,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/PButton.vue';
import { SelectBtnGroupProps, SelectBtnType } from '@/components/organisms/buttons/select-btn-group/type';

export default {
    name: 'PSelectBtnGroup',
    components: { PButton },
    props: {
        buttons: {
            type: Array,
            default: () => [],
        },
        selected: {
            type: [String, Number],
            default: '',
        },
        styleType: {
            type: String,
            default: 'gray900',
        },
    },
    setup(props: SelectBtnGroupProps, context) {
        const state = reactive({
            formattedButtons: computed(() => {
                const buttons: SelectBtnType[] = [];
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

        const onClickButton = (name) => {
            if (props.selected !== name) {
                context.emit('update:selected', name);
                context.emit('clickButton', name);
                context.emit(`click-${name}`, name);
            }
        };
        return {
            ...toRefs(state),
            onClickButton,
        };
    },
};
</script>

<style lang="postcss">
.p-select-btn-group {
    @apply flex flex-wrap;
    .button-lap {
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
