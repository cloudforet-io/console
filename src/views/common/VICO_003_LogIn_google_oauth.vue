<template>
  <body onload="init()">
    <div id="g-signin-btn" />
    <div><a href="#" onclick="signOut();">Sign out</a></div>
    <div><a href="#" onclick="disconnect();">Disconnect</a></div>
    <div><img id="profileImage" src=""></div>
    <textarea id="message" cols="80" rows="10" />
  </body>
</template>
<script src="https://apis.google.com/js/platform.js" async defer></script>
<script>
export default {
    components: {
        BaseSimpleModal
    },
    data () {
        return {
            instructionContents: signupContents,
            rememberStatus: false,
            seenGreet: true,
            seenError: false,
            userId: 'admin',
            password: 'admin'
        };
    },
    computed: {
        ...mapGetters('auth', [
            'nextPath'
        ])
    },
    mounted () {
        this.isRemembered();
    },
    methods: {
        init(){
            gapi.load('auth2', function() {
                auth2 = gapi.auth2.init({
                    client_id: '150323145707-hp5i8q4hm1vcb2hpta23c1829167nl1h.apps.googleusercontent.com',
                    fetch_basic_profile: false,
                    scope: 'profile'
                });
                gapi.signin2.render('g-signin-btn', {
                    scope: 'email',
                    width: 200,
                    height: 50,
                    longtitle: false,
                    theme: 'dark',
                    onsuccess: onSignIn,
                    onfailure: null
                });
            });

        }
    }
};
</script>

<style lang="scss" scoped>
    @import '../../asset/style/css/slideShow.css';

    .login-check {
        float: right;
        padding: 0px 6px 6px 0px;
    }

    .container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .card-group {
        @extend %sheet;
        .input-group-text {
            border: 0;
            background: none;
        }
        .form-control {
            border: 1px solid $lightgray;
            border-radius: 5px;
        }
    }
    .login-btn {
        border: 0;
        background: linear-gradient(to right, $blue, $violet);
        box-shadow: 0 0 5px 1px rgba($navy, 0.3);
        color: $white;
    }
</style>
