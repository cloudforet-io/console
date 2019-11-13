<template>
    <div>
        <p-info-panel info-title="Base Information" />
        <p-info-panel info-title="VM" />
        <p-info-panel info-title="Compute" />
        <p-tag-panel :tags.sync="proxyTags" @confirm="confirm" />
    </div>
</template>

<script>
import PInfoPanel from '@/components/organisms/panels/info-panel/InfoPanel';
import PTagPanel from '@/components/organisms/panels/tag-panel/TagPanel';

export default {
    name: 'PServerDetail',
    components: { PInfoPanel, PTagPanel },
    pros: {
        item: Object,
        tags: Object,
    },
};
</script>

<style scoped>

</style>
