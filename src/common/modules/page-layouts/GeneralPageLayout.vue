<template>
    <div class="general-page-layout">
        <div class="page-contents">
            <slot />
        </div>
        <div class="fnb">
            <f-n-b />
        </div>
    </div>
</template>

<script>
import FNB from '@/common/modules/navigations/FNB.vue';

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
    overflow: auto;
    justify-content: stretch;

    .page-contents {
        width: 100%;
        flex-grow: 1;
        padding: 2rem 1.5rem;
    }
    .fnb {
        width: 100%;
    }
}
</style>
