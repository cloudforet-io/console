<template>
    <p-pane-layout v-on="$listeners" class="p-card-item-container">
        <p-row class="p-card-item">
            <p-col :flex-grow="0">
                <slot name="side">
                    <p-i :name="icon" width="4.5rem" height="4.5rem" />
                </slot>
            </p-col>
            <p-col class="card-body">
                <p-row wrap="wrap">
                    <p-col :col="12">
                        <slot name="body">
                            <header class="title">
                                {{ title }}
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

<script>
import PI from '@/components/atoms/icons/PI';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PaneLayout';
import PCol from '@/components/atoms/grid/col/Col';
import PRow from '@/components/atoms/grid/row/Row';

export default {
    name: 'CardItem',
    components: {
        PRow, PCol, PI, PPaneLayout,
    },
    props: {
        icon: {
            type: String,
            default: 'ic_collector_tags',
        },
        title: {
            type: String,
            default: '',
        },
        contents: {
            type: String,
            default: '',
        },
    },
    setup() {
        return {};
    },
};
</script>

<style lang="scss" scoped>
.p-card-item-container {
    &:hover {
        box-shadow: 0px 0px 8px rgba($primary, 0.22);
    }
}
.p-card-item {
    padding: 1rem;
    height: 126px;
    .card-body {
        all: unset;
        width: 100%;
        padding-left: 1.5rem;
        >div {
            height: 100%;
        }
        .title {
            font-size: 1rem;
            font-weight: bold;
            line-height: 1.125rem;
            padding-bottom: .5rem;
        }
        .contents {
            font-size: .875rem;
        }
    }
}
</style>
