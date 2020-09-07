<template>
    <span class="hover:cursor-pointer" @mousedown="click=true"
          @mouseleave="mouseOut()"
          @mouseenter="onMouseOver()"
          @mouseup="copyText()"
          v-on="$listeners"
    ><p-i :width="width" :height="height" :name="icon"
          :color="color"
          @click="copyText"
    /></span>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import { CopyButtonProps } from '@/components/molecules/buttons/copy-button/type';

import { copyAnyData, isNotEmpty } from '@/lib/util';
import { mouseOverState } from '@/lib/compostion-util';
import color from '@/styles/colors';

export default {
    name: 'PCopyButton',
    components: { PI },
    event: ['copy'],
    props: {
        value: {
            type: String,
            default: null,
        },
        width: {
            type: String,
            default: '1rem',
        },
        height: {
            type: String,
            default: '1rem',
        },
    },
    setup(props: CopyButtonProps, context) {
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
        const copyText = () => {
            if (state.click) {
                if (isNotEmpty(props.value)) {
                    copyAnyData(props.value);
                } else {
                    context.emit('copy');
                }
                state.click = false;
            }
        };

        return {
            ...toRefs(state),
            isMouseOver,
            onMouseOver,
            mouseOut,
            copyText,
        };
    },

};
</script>

<style lang="postcss" scoped>
</style>
