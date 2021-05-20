<template>
    <div class="handbook-page">
        <handbook-button :tabs="tabState.tabs" :active-tab.sync="tabState.activeTab">
            <template #tab1>
                <keep-alive>
                    <p><span>lectus earum fugiat mollitia natus porro repellendus voluptatem. Consequatur dicta eaque error, eveniet hic mollitia, nihil odio ratione rem vitae voluptatem?</span><span>Accusantium at culpa cupiditate id magni quas reprehenderit? Commodi dolore fugiat fugit itaque modi quisquam repellendus suscipit tempora vel. Asperiores doloribus fugit neque obcaecati officia porro saepe tempore voluptate voluptates!</span><span>Aspernatur aut deleniti, deserunt doloremque dolores esse explicabo fugit inventore magni, odit officiis perspiciatis quam ratione reiciendis repellendus repudiandae rerum sint voluptate. Architecto dolores nam numquam odit quaerat tempora vero!</span><span>Dicta ducimus inventore nam voluptatum. Accusantium beatae eius eum expedita incidunt iusto nemo nihil perspiciatis reiciendis sequi. Animi cupiditate ducimus excepturi impedit iste itaque iusto neque placeat, quae sequi vero?</span><span>Ab amet animi cumque illo maiores modi reprehenderit voluptatum! Aliquid culpa nihil odio. Culpa dicta eius facilis ipsum laboriosam libero modi, nobis odit, omnis perspiciatis provident quam quis, saepe soluta!Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque delectus earum fugiat mollitia natus porro repellendus voluptatem. Consequatur dicta eaque error, eveniet hic mollitia, nihil odio ratione rem vitae voluptatem?</span><span>Accusantium at culpa cupiditate id magni quas reprehenderit? Commodi dolore fugiat fugit itaque modi quisquam repellendus suscipit tempora vel. Asperiores doloribus fugit neque obcaecati officia porro saepe tempore voluptate voluptates!</span><span>Aspernatur aut deleniti, deserunt doloremque dolores esse explicabo fugit inventore magni, odit officiis perspiciatis quam ratione reiciendis repellendus repudiandae rerum sint voluptate. Architecto dolores nam numquam odit quaerat tempora vero!</span><span>Dicta ducimus inventore nam voluptatum. Accusantium beatae eius eum expedita incidunt iusto nemo nihil perspiciatis reiciendis sequi. Animi cupiditate ducimus excepturi impedit iste itaque iusto neque placeat, quae sequi vero?</span><span>Ab amet animi cumque illo maiores modi reprehenderit voluptatum! Aliquid culpa nihil odio. Culpa dicta eius facilis ipsum laboriosam libero modi, nobis odit, omnis perspiciatis provident quam quis, saepe soluta!Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque delectus earum fugiat mollitia natus porro repellendus voluptatem. Consequatur dicta eaque error, eveniet hic mollitia, nihil odio ratione rem vitae voluptatem?</span><span>Accusantium at culpa cupiditate id magni quas reprehenderit? Commodi dolore fugiat fugit itaque modi quisquam repellendus suscipit tempora vel. Asperiores doloribus fugit neque obcaecati officia porro saepe tempore voluptate voluptates!</span><span>Aspernatur aut deleniti, deserunt doloremque dolores esse explicabo fugit inventore magni, odit officiis perspiciatis quam ratione reiciendis repellendus repudiandae rerum sint voluptate. Architecto dolores nam numquam odit quaerat tempora vero!</span><span>Dicta ducimus inventore nam voluptatum. Accusantium beatae eius eum expedita incidunt iusto nemo nihil perspiciatis reiciendis sequi. Animi cupiditate ducimus excepturi impedit iste itaque iusto neque placeat, quae sequi vero?</span><span>Ab amet animi cumque illo maiores modi reprehenderit voluptatum! Aliquid culpa nihil odio. Culpa dicta eius facilis ipsum laboriosam libero modi, nobis odit, omnis perspiciatis provident quam quis, saepe soluta!Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque delectus earum fugiat mollitia natus porro repellendus voluptatem. Consequatur dicta eaque error, eveniet hic mollitia, nihil odio ratione rem vitae voluptatem?</span><span>Accusantium at culpa cupiditate id magni quas reprehenderit? Commodi dolore fugiat fugit itaque modi quisquam repellendus suscipit tempora vel. Asperiores doloribus fugit neque obcaecati officia porro saepe tempore voluptate voluptates!</span><span>Aspernatur aut deleniti, deserunt doloremque dolores esse explicabo fugit inventore magni, odit officiis perspiciatis quam ratione reiciendis repellendus repudiandae rerum sint voluptate. Architecto dolores nam numquam odit quaerat tempora vero!</span><span>Dicta ducimus inventore nam voluptatum. Accusantium beatae eius eum expedita incidunt iusto nemo nihil perspiciatis reiciendis sequi. Animi cupiditate ducimus excepturi impedit iste itaque iusto neque placeat, quae sequi vero?</span><span>Ab amet animi cumque illo maiores modi reprehenderit voluptatum! Aliquid culpa nihil odio. Culpa dicta eius facilis ipsum laboriosam libero modi, nobis odit, omnis perspiciatis provident quam quis, saepe soluta!</span></p>
                </keep-alive>
            </template>
            <template #tab2>
                <p> this tab is</p>
            </template>
            <template #tab3>
                <p> this tab is</p>
            </template>
        </handbook-button>
<!--        <handbook-button>-->
<!--            <template><span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque delectus earum fugiat mollitia natus porro repellendus voluptatem. Consequatur dicta eaque error, eveniet hic mollitia, nihil odio ratione rem vitae voluptatem?</span><span>Accusantium at culpa cupiditate id magni quas reprehenderit? Commodi dolore fugiat fugit itaque modi quisquam repellendus suscipit tempora vel. Asperiores doloribus fugit neque obcaecati officia porro saepe tempore voluptate voluptates!</span><span>Aspernatur aut deleniti, deserunt doloremque dolores esse explicabo fugit inventore magni, odit officiis perspiciatis quam ratione reiciendis repellendus repudiandae rerum sint voluptate. Architecto dolores nam numquam odit quaerat tempora vero!</span><span>Dicta ducimus inventore nam voluptatum. Accusantium beatae eius eum expedita incidunt iusto nemo nihil perspiciatis reiciendis sequi. Animi cupiditate ducimus excepturi impedit iste itaque iusto neque placeat, quae sequi vero?</span><span>Ab amet animi cumque illo maiores modi reprehenderit voluptatum! Aliquid culpa nihil odio. Culpa dicta eius facilis ipsum laboriosam libero modi, nobis odit, omnis perspiciatis provident quam quis, saepe soluta!Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque delectus earum fugiat mollitia natus porro repellendus voluptatem. Consequatur dicta eaque error, eveniet hic mollitia, nihil odio ratione rem vitae voluptatem?</span><span>Accusantium at culpa cupiditate id magni quas reprehenderit? Commodi dolore fugiat fugit itaque modi quisquam repellendus suscipit tempora vel. Asperiores doloribus fugit neque obcaecati officia porro saepe tempore voluptate voluptates!</span><span>Aspernatur aut deleniti, deserunt doloremque dolores esse explicabo fugit inventore magni, odit officiis perspiciatis quam ratione reiciendis repellendus repudiandae rerum sint voluptate. Architecto dolores nam numquam odit quaerat tempora vero!</span><span>Dicta ducimus inventore nam voluptatum. Accusantium beatae eius eum expedita incidunt iusto nemo nihil perspiciatis reiciendis sequi. Animi cupiditate ducimus excepturi impedit iste itaque iusto neque placeat, quae sequi vero?</span><span>Ab amet animi cumque illo maiores modi reprehenderit voluptatum! Aliquid culpa nihil odio. Culpa dicta eius facilis ipsum laboriosam libero modi, nobis odit, omnis perspiciatis provident quam quis, saepe soluta!Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque delectus earum fugiat mollitia natus porro repellendus voluptatem. Consequatur dicta eaque error, eveniet hic mollitia, nihil odio ratione rem vitae voluptatem?</span><span>Accusantium at culpa cupiditate id magni quas reprehenderit? Commodi dolore fugiat fugit itaque modi quisquam repellendus suscipit tempora vel. Asperiores doloribus fugit neque obcaecati officia porro saepe tempore voluptate voluptates!</span><span>Aspernatur aut deleniti, deserunt doloremque dolores esse explicabo fugit inventore magni, odit officiis perspiciatis quam ratione reiciendis repellendus repudiandae rerum sint voluptate. Architecto dolores nam numquam odit quaerat tempora vero!</span><span>Dicta ducimus inventore nam voluptatum. Accusantium beatae eius eum expedita incidunt iusto nemo nihil perspiciatis reiciendis sequi. Animi cupiditate ducimus excepturi impedit iste itaque iusto neque placeat, quae sequi vero?</span><span>Ab amet animi cumque illo maiores modi reprehenderit voluptatum! Aliquid culpa nihil odio. Culpa dicta eius facilis ipsum laboriosam libero modi, nobis odit, omnis perspiciatis provident quam quis, saepe soluta!Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque delectus earum fugiat mollitia natus porro repellendus voluptatem. Consequatur dicta eaque error, eveniet hic mollitia, nihil odio ratione rem vitae voluptatem?</span><span>Accusantium at culpa cupiditate id magni quas reprehenderit? Commodi dolore fugiat fugit itaque modi quisquam repellendus suscipit tempora vel. Asperiores doloribus fugit neque obcaecati officia porro saepe tempore voluptate voluptates!</span><span>Aspernatur aut deleniti, deserunt doloremque dolores esse explicabo fugit inventore magni, odit officiis perspiciatis quam ratione reiciendis repellendus repudiandae rerum sint voluptate. Architecto dolores nam numquam odit quaerat tempora vero!</span><span>Dicta ducimus inventore nam voluptatum. Accusantium beatae eius eum expedita incidunt iusto nemo nihil perspiciatis reiciendis sequi. Animi cupiditate ducimus excepturi impedit iste itaque iusto neque placeat, quae sequi vero?</span><span>Ab amet animi cumque illo maiores modi reprehenderit voluptatum! Aliquid culpa nihil odio. Culpa dicta eius facilis ipsum laboriosam libero modi, nobis odit, omnis perspiciatis provident quam quis, saepe soluta!</span></template>-->
<!--        </handbook-button>-->
    </div>
</template>
<script lang="ts">
import HandbookButton from '@/common/components/HandbookButton.vue';
import {
    computed, reactive,
} from '@vue/composition-api';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

export default {
    name: 'HandbookPage',
    components: {
        HandbookButton,
    },
    props: {
        tabs: {
            type: Array,
            default: () => [],
        },
        activeTab: {
            type: String,
            default: '',
        },
    },
    setup() {
        const tabState = reactive({
            tabs: computed(() => ([
                { name: 'tab1', label: 'tab1_title', keepAlive: true },
                { name: 'tab2', label: 'tab2_title', keepAlive: true },
                { name: 'tab3', label: 'tab3_title', keepAlive: true },
            ] as TabItem[])),
            activeTab: 'tab1',
        });

        return {
            tabState,
        };
    },
};
</script>
<style lang="postcss" scoped>
.handbook-page {
  height: 100%;
}
</style>
