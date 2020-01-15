<template>
    <div ref="btnGroup" class="p-select-btn-group">
        <p-button v-for="btn in btnsData"
                  :key="btn.name"
                  :class="{ active:selected===btn.name, 'select-btn': !space, 'select-next-btn': space }"
                  v-bind="btn.vbind"
                  @click="clickEvent(btn.name)"
        >
            {{ btn.label }}
        </p-button>
    </div>
</template>

<script>
import {
    reactive, computed, toRefs,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/Button.vue';

export default {
    name: 'PSelectBtnGroup',
    components: { PButton },
    props: {
        buttons: Array,
        selected: String,
        space: {
            type: Boolean,
            default: false,
        },

    },
    setup(props, context) {
        const state = reactive({
            btnsData: computed(() => {
                const buttons = [];
                props.buttons.forEach((value) => {
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
            clickEvent(name) {
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

<style lang="scss" scoped>
    .p-select-btn-group{
        white-space:nowrap;
        overflow-x:auto;
        scroll-snap-type: x mandatory;
        display: flex;
        justify-content: flex-start ;
        -ms-overflow-style: none; // scroll hide in IE
        &::-webkit-scrollbar {
            display: none !important; //scroll hide in window,chrome
        }

        .select-btn{
            margin-right: 0.5rem;
            min-width: auto;
            display: inline;
        }

        .select-next-btn {
            min-width: auto;
            display: inline;
            border-right: none;
            border-radius: unset;
        }

        [class~='select-next-btn']:last-of-type  {
            min-width: auto;
            display: inline;
            border-right: 1px solid;
            border-radius: unset;
        }
    }
</style>
