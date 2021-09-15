<template>
    <div class="collection-rule">
        <p-panel-top use-total-count :total-count="totalCount">
            {{ $t('PLUGIN.COLLECTOR.MAIN.COLLECTION_RULE') }}
        </p-panel-top>
        <div class="content-wrapper">
            <p-card>
                <template #header>
                    <span class="card-header">
                        Rule Name 있으면 이름을, 아니면 순서대로 번호를 #1
                    </span>
                </template>
                <div class="card-body">
                    <div class="left-part">
                    </div>
                    <div class="right-part">
                    </div>
                </div>
            </p-card>
        </div>
    </div>
</template>

<script lang="ts">
import {
    PPanelTop, PCard,
} from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';

export default {
    name: 'CollectionRule',
    components: {
        PPanelTop,
        PCard,
    },
    props: {},
    setup() {
        const state = reactive({
            totalCount: 0,
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.collection-rule {
    .content-wrapper {
        padding: 0 1rem;
        .card-header {
            @apply text-blue-900;
            font-weight: bold;
            font-size: 1rem;
        }
        .card-body {
            @apply grid grid-cols-12;
            .left-part {
                @apply grid-cols-4;
            }
            .right-part {
                @apply grid-cols-8;
            }
        }
    }
}

@screen tablet {
    .collection-rule {
        .content-wrapper {
            .card-body {
                .left-part {
                    @apply col-span-12;
                }
                .right-part {
                    @apply col-span-12;
                }
            }
        }
    }
}
</style>
