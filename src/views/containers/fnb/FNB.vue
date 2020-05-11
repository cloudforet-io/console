<template>
    <div class="fnb">
        <div class="fnb-contents">
            <span class="copyright">Copyright © 2020 Megazone Cloud Inc.</span>
            <span class="policy" @click="showTemp">Privacy Policy</span>
            <span class="email">
                <p-i name="ic_footer_email" width="1rem" height="1rem" />
                <a href="mailto:support@spaceone.dev">
                    support@spaceone.dev
                </a>
            </span>
            <transition name="fade"><span v-if="temp" class="footerMsg" transition="expand" @click="showTemp">Will be updated</span></transition>
        </div>
    </div>
</template>

<script>
import PI from '@/components/atoms/icons/PI';

export default {
    name: 'FNB',
    props: {
        width: {
            type: String,
            default: '100%', 
        },
    },
    components: {
        PI,
    },
    data() {
        return {
            temp: false,
        };
    },
    methods: {
        showTemp() {
            this.temp =!this.temp;
            var self = this;
            setTimeout(function() {
                self.temp=false;
            }, 1500);
        },
    },
};
</script>


<style lang="postcss" scoped>
    .fnb {
        @apply text-gray-200 h-10 text-xs;
        .fnb-contents {
            @apply border-t border-gray-200 h-full py-2 px-0 my-0 mx-6;
        }
        .email{
            @apply mx-2;
        }
        .policy{
            @apply border-l border-gray-200 pl-2;
        }
        .email, .policy{
            @apply float-right underline cursor-pointer;
            transition: color 0.3s ease-in-out;
            &:hover {
                @apply text-gray-500;
            }
        }
        .footerMsg{
            @apply bg-black text-white py-1 px-4 fixed bottom-0 right-0 m-4 opacity-75 rounded;
        }

        .fade-enter-active, .fade-leave-active {
         transition: opacity .5s;
        }
        .fade-enter, .fade-leave-to {
         opacity: 0;
        }
    }
</style>

