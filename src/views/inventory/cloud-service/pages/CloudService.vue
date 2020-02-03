<script lang="ts">
import { createComponent } from '@vue/composition-api';
import CloudService from './CloudService.template.vue';

export default createComponent({
    mixins: [CloudService],
    name: 'CloudService.vue',
});
</script>
