<template>
    <div class="project-search-widget">
        <p-toolbox
            class="col-span-12"
        />
    </div>
</template>

<script lang="ts">
import {
    PToolbox,
} from '@spaceone/design-system';


export default {
    name: 'ProjectSearchWidget',
    components: {
        PToolbox,
    },
};
</script>

<style lang="postcss" scoped>
.project-search-widget {
    .p-toolbox::v-deep {
        .p-search {
            border-radius: 0.25rem;
        }
    }
}
</style>
