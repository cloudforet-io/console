<template>
    <span class="hover:cursor-pointer" @mousedown="click=true"
          @mouseleave="mouseOut()"
          @mouseenter="onMouseOver()"
          @mouseup="copyText()"
          v-on="$listeners"
    ><p-i width="1rem" height="1rem" :name="icon"
          :color="color"
          @click="copyText"
    /></span>
</template>

<script>
import { copyAnyData, isNotEmpty } from '@/lib/util';
import PI from '@/components/atoms/icons/PI.vue';
import { computed, reactive, toRefs } from '@vue/composition-api';
import color from '@/styles/colors';
import { mouseOverState } from '@/lib/compostion-util';

export default {
    name: 'PCopyButton',
    components: { PI },
    event: ['copy'],
    props: {
        value: {
            type: [String, Array, Number, Object, Boolean, null],
            default: null,
        },
    },
    setup(props, context) {
        const { isMouseOver, onMouseOut, onMouseOver } = mouseOverState();

        const state = reactive({
            click: false,
            icon: computed(() => (state.click ? 'ic_copied' : 'ic_copy')),
            color: computed(() => {
                if (state.click || isMouseOver.value) {
                    return color.blue[500];
                }
                return undefined;
            }),
        });
        const mouseOut = () => {
            state.click = false;
            onMouseOut();
        };
        return {
            ...toRefs(state),
            isMouseOver,
            onMouseOver,
            mouseOut,
            copyText() {
                if (state.click) {
                    if (isNotEmpty(props.value)) {
                        copyAnyData(props.value);
                    } else {
                        context.emit('copy');
                    }
                    state.click = false;
                }
            },
        };
    },

};
</script>

<style lang="postcss" scoped>
</style>
