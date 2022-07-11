<template>
    <div class="cloud-service-history-changes-tab">
        <vueDiff :prev="prev" :current="current" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

import vueDiff from '@/common/components/forms/vue-diff/Diff.vue';

export default defineComponent({
    name: 'CloudServiceHistoryChangesTab',
    components: {
        vueDiff,
    },
    setup() {
        const response = {
            key: 'example',
            type: 'changed',
            before: {
                a: 'aaa',
                b: 'bbb',
                c: 'ccc',
            },
            after: {
                a: 'AAA',
                b: 'BBB',
                d: 'DDD',
            },
        };

        const data = {
            [response.key]: {
                before: {
                    a: 'aaa',
                    b: 'bbb',
                    c: 'ccc',
                },
                after: {
                    a: 'AAA',
                    b: 'BBB',
                    d: 'DDD',
                },
            },
        };

        console.log(data);

        return {
            prev: JSON.stringify(response.before, undefined, 4),
            current: JSON.stringify(response.after, undefined, 4),
        };
    },
});
</script>
