<template>
    <div class="issue-inventory-menu">
        <template v-for="(subMenu, index) in issueSubMenuList">
            <g-n-b-sub-menu :key="index"
                            :label="subMenu.label"
                            :href="subMenu.href"
                            @navigate="hideMenu"
            >
                <template #extra-mark>
                    <p-i name="ic_external-link"
                         height="1em"
                         width="1em"
                         color="inherit"
                    />
                </template>
            </g-n-b-sub-menu>
        </template>
    </div>
</template>

<script setup lang="ts">

import { computed, reactive, toRefs } from 'vue';

import { PI } from '@spaceone/design-system';

import GNBSubMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBSubMenu.vue';


const emit = defineEmits(['close']);

const state = reactive({
    issueSubMenuList: computed(() => [
        {
            label: '이슈 01 - blah blah blah',
            href: '',
            show: true,
        },
        {
            label: '이슈 02 - blah blah blah',
            href: '',
            show: true,
        },
        {
            label: '이슈 03 - blah blah blah',
            href: '',
            show: true,
        },
        {
            label: '이슈 04 - blah blah blah',
            href: '',
            show: true,
        },
    ]),
});

const hideMenu = () => {
    emit('close');
};

const { issueSubMenuList } = toRefs(state);

</script>

<style scoped lang="postcss">
.issue-inventory-menu {
    @apply bg-white border border-gray-200;
    width: 20rem;
    padding: 0.5rem;
}
</style>
