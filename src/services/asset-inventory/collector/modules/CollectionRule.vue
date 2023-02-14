<template>
    <div class="collection-rule">
        <p-heading heading-type="sub"
                   use-total-count
                   :total-count="totalCount"
                   :title="$t('PLUGIN.COLLECTOR.MAIN.COLLECTION_RULE')"
        />
        <div class="content-wrapper">
            <p-card>
                <template #header>
                    <span class="card-header">
                        Rule Name 있으면 이름을, 아니면 순서대로 번호를 #1
                    </span>
                </template>
                <div class="card-body">
                    <div class="left-part" />
                    <div class="right-part" />
                </div>
            </p-card>
        </div>
    </div>
</template>

<script lang="ts">
import { reactive, toRefs } from 'vue';

import {
    PHeading, PCard,
} from '@spaceone/design-system';

export default {
    name: 'CollectionRule',
    components: {
        PHeading,
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
