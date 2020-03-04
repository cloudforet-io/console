<template>
    <div>
        <p-menu-list :list-items="languages"
                     :tooltip="tooltip"
                     :tooltip-options="{offset: '20px'}"
                     @select="changeLanguage"
        >
            <template #contents>
                <p-i name="ic_gnb_language" width="2rem" height="2rem"
                     class="icon" color="transparent inherit"
                />
            </template>
        </p-menu-list>
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs, computed, getCurrentInstance, defineComponent,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import PMenuList from '@/components/organisms/lists/menu-list/MenuList.vue';
import { LANGUAGES } from '@/lib/global-enums';

export default defineComponent({
    name: 'LanguageMenu',
    components: {
        PI,
        PMenuList,
    },
    setup() {
        const vm:any = getCurrentInstance();
        const state = reactive({
            language: computed({
                set(val) { vm.$ls.user.state.language = val; },
                get() {
                    return vm.$ls.user.state.language;
                },
            }),
            languages: computed(() => vm.$i18n.availableLocales.map(lang => ({
                key: lang,
                contents: LANGUAGES[lang],
                selected: state.language === lang,
            }))),
            tooltip: computed(() => `Language: ${LANGUAGES[state.language]}`),
        });

        const changeLanguage = (item) => {
            state.language = item.key;
            vm.$i18n.locale = state.language;
        };

        vm.$i18n.locale = state.language;

        return {
            ...toRefs((state)),
            changeLanguage,
        };
    },
});
</script>

<style lang="scss" scoped>
    .icon {
        color: $primary4;
    }
</style>
