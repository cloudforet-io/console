<template>
    <p-pane-layout class="p-card-item-container" v-on="$listeners">
        <p-row class="p-card-item">
            <p-col :flex-grow="0">
                <slot name="side">
                    <p-lazy-img :img-url="icon"
                                :error-icon="defaultIcon"
                                width="4.5rem" height="4.5rem"
                    />
                    <!--                    <img :src="icon" class="icon">-->
                </slot>
            </p-col>
            <p-col class="p-card-body">
                <p-row wrap="wrap">
                    <p-col :col="12">
                        <slot name="body">
                            <header class="title">
                                <slot name="title">
                                    {{ title }}
                                </slot>
                            </header>
                            <span class="contents">
                                {{ contents }}
                            </span>
                        </slot>
                    </p-col>
                    <p-col :col="12">
                        <slot name="extra" />
                    </p-col>
                </p-row>
            </p-col>
        </p-row>
    </p-pane-layout>
</template>

<script lang="ts">
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PaneLayout.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import { cardItemProps } from '@/components/molecules/cards/PCardItem.toolset';
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
    name: 'PCardItem',
    components: {
        PRow, PCol, PPaneLayout, PLazyImg,
    },
    props: cardItemProps,
    setup() {
        return {};
    },
});
</script>

<style lang="postcss" scoped>
.p-card-item-container {
    &:hover {
        box-shadow: 0 0 8px rgba(theme('colors.primary'), 0.22);
    }
}
.p-card-item {
    padding: 1rem;
    height: 126px;
    .p-card-body {
        all: unset;
        width: 100%;
        padding-left: 1.5rem;
        > div {
            height: 100%;
        }
        .title {
            font-size: 1rem;
            font-weight: bold;
            line-height: 1.125rem;
            padding-bottom: 0.5rem;
        }
        .contents {
            font-size: 0.875rem;
        }
    }
}
</style>
