<script setup lang="ts">
import { PIconButton } from '@spaceone/design-system';

interface Props {
    isMinimizeGnb?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isMinimizeGnb: false,
});
</script>

<template>
    <div class="navigation-rail"
         :class="{'is-minimize': props.isMinimizeGnb}"
    >
        <!--  TODO: will be updated icons -->
        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_service_home"
                       size="md"
        />
    </div>
</template>

<style scoped lang="postcss">
.navigation-rail {
    @apply flex-col border-r;
    top: $gnb-toolbox-height;
    width: $gnb-navigation-rail-max-width;
    height: 100%;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    transition: width 0.3s ease;
    &.is-minimize {
        width: $gnb-navigation-rail-min-width;
    }
}
</style>
