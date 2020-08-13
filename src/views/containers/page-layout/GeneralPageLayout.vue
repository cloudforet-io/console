<template>
    <div class="general-page-layout">
        <div class="page-contents">
            <slot />
        </div>
        <div class="fnb">
            <FNB />
        </div>
    </div>
</template>

<script>
import FNB from '@/views/containers/fnb/FNB.vue';

export default {
    name: 'GeneralPageLayout',
    components: { FNB },
    setup() {
        return {};
    },
};
</script>

<style lang="postcss" scoped>
.general-page-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: stretch;
    overflow-y: scroll;

    .page-contents {
        width: 100%;
        flex-grow: 1;
        padding: 1.5rem 1.5rem 2rem 1.5rem;
    }
    .fnb {
        width: 100%;
    }
}
</style>
