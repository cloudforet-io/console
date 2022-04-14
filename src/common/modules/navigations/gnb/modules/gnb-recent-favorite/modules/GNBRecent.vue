<template>
    <div class="gnb-recent">
        <div class="no-data-wrapper">
            <img class="img" src="@/assets/images/illust_spaceship_3.svg">
            <p class="text">
                Recently visited page list will appear here
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api';

export default {
    name: 'GNBRecent',
    components: {},
    props: {},
    setup() {
        const state = reactive({

        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
<style lang="postcss" scoped>
.gnb-recent {
    .no-data-wrapper {
        text-align: center;
        padding: 2rem 0;
        .img {
            margin: auto;
        }
        .text {
            @apply text-gray-400;
            font-size: 0.875rem;
        }
    }
}
</style>
