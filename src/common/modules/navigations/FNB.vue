<template>
    <div class="fnb h-11 sm:h-10 ">
        <div class="fnb-contents flex flex-col sm:flex-row">
            <div class="flex-1 sm:flex-auto">
                <span class="copyright"><span class="hidden sm:inline-block">Copyright </span>© Cloudforet a Series of LF Projects, LLC</span>
            </div>
            <div class="sm:flex-col-reverse ">
                <span class="email">
                    <p-i name="ic_footer_email"
                         width="1rem"
                         height="1rem"
                         color="gray-200"
                    />
                    <a target="_blank"
                       href="mailto:support@cloudforet.io"
                    >support@cloudforet.io</a>
                </span>
                <span class="divider" />
                <a class="policy"
                   href="https://lfprojects.org/"
                   target="_blank"
                >{{ $t('COMMON.FNB.PROJECT_POLICIES') }}</a>
            </div>
        </div>
    </div>
</template>

<script>
import { PI } from '@spaceone/design-system';

export default {
    name: 'FNB',
    components: {
        PI,
    },
    props: {
        width: {
            type: String,
            default: '100%',
        },
    },
    data() {
        return {
            temp: false,
        };
    },
};
</script>

<style lang="postcss" scoped>
.fnb {
    @apply text-gray-300 text-xs;
    background-color: inherit;
    .fnb-contents {
        @apply border-t border-gray-200 h-full py-2 px-0 my-0 mx-6;
    }
    .divider {
        @apply border-l border-gray-200 mx-2;
    }
    .email, .policy {
        @apply underline cursor-pointer;
        transition: color 0.3s ease-in-out;
        &:hover {
            @apply text-gray-500;
        }
    }
    .footerMsg {
        @apply bg-black text-white py-1 px-4 fixed bottom-0 right-0 m-4 opacity-75 rounded;
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity 0.5s;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }
}
</style>
