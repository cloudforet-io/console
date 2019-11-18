<template>
    <div class="p-select-btn-group">
        <p-button v-for="btn in btnsData"
                  :key="btn.name"
                  :class="{ active:selected===btn.name}"
                  v-bind="btn.vbind"
                  @click="clickEvent(btn.name)"
        >
            {{ btn.label }}
        </p-button>
    </div>
</template>

<script>
import { reactive, computed, toRefs } from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/Button';

export default {
    name: 'SelectBtnGroup',
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
        });
        return {
            ...toRefs(state),
            clickEvent(name) {
                context.emit('update:selected', name);
            },
        };
    },
};
</script>

<style scoped>
.p-select-btn-group{
    white-space:nowrap;
    overflow-x:scroll;
}
</style>
