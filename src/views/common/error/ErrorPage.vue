<template>
    <div id="oops">
        <div id="error-text">
            <span>404</span>
            <p id="error-message">
                PAGE NOT FOUND
            </p>
            <p id="sub-message">
                The page you are looking for could not be found.
            </p>
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
    * {
        padding: 0;
        margin: 0;
    }
    #oops  {
        background: #ffffff;
        text-align: center;
        margin-bottom: 50px;
        font-weight: 800;
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
    }
    #error-text #error-message {
        margin: 60px 0 0 0;
        font-weight: 600;
        font-size: 2rem;
    }
    #error-text #sub-message  {
        color: #444444;
        margin: -20px 0 0 0;
        font-weight: 500;
        font-size: 1.3rem;
    }
    #error-text span  {
        position: relative;
        background: #4568DC linear-gradient(315deg, #9921e8 0%, #5f72be 74%);
        color: #fff;
        font-size: 450%;
        padding: 0 20px;
        border-radius: 5px;
        font-weight: 600;
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
