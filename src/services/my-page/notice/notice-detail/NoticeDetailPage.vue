<template>
    <div class="notice-detail-page">
        <text-editor-viewer :contents="contents" />
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

import TextEditorViewer from '@/common/components/editor/TextEditorViewer.vue';

export default {
    name: 'NoticeDetailPage',
    components: { TextEditorViewer },
    setup() {
        const state = reactive({
            // eslint-disable-next-line max-len
            contents: '<p>normal text</p><h1>h1</h1><h2>h2</h2><h3>h3</h3><p style="text-align: center">align center</p><p style="text-align: right">align right</p><p style="text-align: justify">align justify</p><p style="text-align: justify">color1 <span style="color: #7D5DD2">color2</span> <span style="color: #49A7F7">color3</span> ...</p><p style="text-align: justify"><strong>bold </strong></p><p style="text-align: justify"><em>italic</em></p><p style="text-align: justify"><u>underline</u></p><p style="text-align: justify"><s>strike</s></p><p style="text-align: justify"><code class="inline-code">this is inline code</code></p><ul><li><p style="text-align: justify">bullet</p><ul><li><p style="text-align: justify">bullet2</p><ul><li><p style="text-align: justify">bullet3</p></li></ul></li></ul></li><li><p style="text-align: justify">bullet4</p></li></ul><ol><li><p style="text-align: justify">number</p><ol><li><p style="text-align: justify">number1</p><ol><li><p style="text-align: justify">number2</p></li></ol></li></ol></li><li><p style="text-align: justify">number3</p><ol><li><p style="text-align: justify">number4</p></li></ol></li></ol><p style="text-align: justify"><a target="_blank" rel="noopener noreferrer nofollow" href="http://www.google.com">http://www.google.com</a></p><p style="text-align: justify"><img src="https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/spaceone.svg"></p><pre><code>const a = \'This is Code Block!\'nconsole.log(a)</code></pre><blockquote><p>This is Quote Block!</p></blockquote><hr><p></p><p>Good bye...!</p>',
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>
