<template>
    <div ref="btnGroup" class="p-select-btn-group">
        <p-button v-for="btn in btnsData"
                  :key="btn.name"
                  class="select-btn"
                  :class="{ active:selected===btn.name}"
                  v-bind="btn.vbind"
                  @click="clickEvent(btn.name)"
        >
            {{ btn.label }}
        </p-button>
    </div>
</template>

<script>
import {
    reactive, computed, toRefs, onMounted, onUnmounted,
} from '@vue/composition-api';
import ScrollBooster from 'scrollbooster';
import PButton from '@/components/atoms/buttons/Button.vue';

export default {
    name: 'PSelectBtnGroup',
    components: { PButton },
    props: {
        buttons: Array,
        selected: String,
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
            btnGroup: null,
            sb: null,
        });

        onMounted(() => {
            const scrollOptions = {
                viewport: context.parent.$el,
                content: state.btnGroup,
                mode: 'x',
                onUpdate: (data) => {
                    state.btnGroup.scrollLeft = data.position.x;
                },
                onClick: (data, event) => {
                    const { target } = event;
                    const selectableElements = ['input', 'select', 'textarea'];
                    if (selectableElements.find(element => element === target.tagName.toLowerCase())) {
                        target.focus();
                    }
                },
            };
            state.sb = new ScrollBooster(scrollOptions);
        });
        onUnmounted(() => {
            state.sb.destroy();
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
}
</style>
