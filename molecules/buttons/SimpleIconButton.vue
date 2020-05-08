<template>
    <span
        class="simple-icon-button"
        v-on="$listeners"
        @mouseenter="onHover(true)"
        @mouseleave="onHover(false)"
    >
        <p-i
            class="simple-icon" width="1.25rem" height="1.25rem"
            :name="simpleIconBind"
        />
    </span>
</template>

<script lang="ts">
import {
    reactive, computed, toRefs, defineComponent,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';

export default defineComponent({
    name: 'PSimpleIconButton',
    components: { PI },
    mixins: [PI],
    props: {
        hovered: {
            type: Boolean,
            default: false,
        },
        normalIconName: {
            type: String,
            default: '',
        },
        hoveredIconName: {
            type: String,
            default: '',
        },
    },
    setup(props: any) {
        const state = reactive({
            isHover: false,
            simpleIconBind: computed(() => {
                let name = props.normalIconName;
                if (props.hovered || state.isHover) {
                    name = props.hoveredIconName;
                }
                return name;
            }),
        });
        const onHover = (value) => {
            state.isHover = value;
        };
        return {
            ...toRefs(state),
            onHover,
        };
    },
});
</script>

<style lang="postcss" scoped>

</style>
