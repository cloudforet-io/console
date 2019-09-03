<template>
  <div id="app">
    <notifications group="auth" position="top center" :width="500" classes="v-notice" />
    <notifications group="notice" position="top left" />
    <router-view />
  </div>
</template>
<script>
export default {
    name: 'App',
    props: {
        processEnv: {
            type: String,
            default: process.env.NODE_ENV,
            apis: null,
        }
    },
    async beforeMount() {
        let gapiScript = document.createElement('script');
        //let isLoaded = false;
        await gapiScript.setAttribute('src', 'https://apis.google.com/js/platform.js');
       /* gapiScript.async = true;
        gapiScript.defer = true;*/
        await document.head.appendChild(gapiScript);
        /*gapiScript.onload = (e) => {
            isLoaded = true;
        };
        let gapiInterval = setInterval(() => {
            if (isLoaded) {
                clearInterval(gapiInterval);
            }
        }, 1000);*/
    }
};

</script>

<style lang="scss">
  @import 'asset/style/style';
</style>
