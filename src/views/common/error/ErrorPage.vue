<template>
    <div id='oops'>
        <div id='error-text'>
            <span>404</span>
            <p id="error-message">PAGE NOT FOUND</p>
            <p id="sub-message">The page you are looking for could not be found.</p>
        </div>
    </div>

</template>

<script>
import { reactive, toRefs } from '@vue/composition-api';

export default {
    name: 'ErrorPage',
    setup() {
        const state = reactive({
            errorStatus: '404',
            errorMessage: 'Page Not Found',
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="css" scoped>
    @import url(https://fonts.googleapis.com/css?family=Roboto);
    * {
        paading: 0;
        margin: 0;
    }
    #oops  {
        background: #ffffff;
        text-align: center;
        margin-bottom: 50px;
        font-weight: 900;
        font-size: 40px;
        position: fixed;
        width: 100%;
        height: 100%;
        line-height: 1.5em;
        z-index: 9999;
        left: 0px;
    }
    #error-text  {
        top: 40%;
        position: relative;
        font-family: 'Roboto', sans-serif;
    }
    #error-text #error-message {
        margin: 60px 0 0 0;
        font-family: 'Roboto', sans-serif;
        font-weight: 800;
        font-size: 2rem;
    }
    #error-text #sub-message  {
        color: #444444;
        margin: -20px 0 0 0;
        font-family: 'Roboto', sans-serif;
        font-weight: lighter;
        font-size: 1.3rem;
    }
    #error-text span  {
        position: relative;
        background: #4568DC;  /* fallback for old browsers */
        /*background: -webkit-linear-gradient(to right, #B06AB3, #4568DC);  !* Chrome 10-25, Safari 5.1-6 *!*/
        /*background: linear-gradient(to right, #B06AB3, #4568DC); !* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ *!*/
        background-color: #9921e8;
        background-image: linear-gradient(315deg, #9921e8 0%, #5f72be 74%);
        color: #fff;
        font-size: 450%;
        padding: 0 20px;
        border-radius: 5px;
        font-weight: bolder;
        transition: all .5s;
        box-shadow: 5px 5px 5px 0px rgba(50, 50, 50, 0.4);
    }
    /* CSS Error Page Responsive */
    @media only screen and (max-width:640px) {

        #error-text span  {
            font-size: 200%;
        }

        #error-text a:hover  {
            color: #fff;
        }
    }
</style>
