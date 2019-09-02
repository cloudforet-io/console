<template>
  <g-signin-button
    :params="googleSignInParams"
    @success="onSignInSuccess"
    @error="onSignInError">
    Sign in with Google
  </g-signin-button>
</template>
<script>
export default {
    data () {
        return {
            googleSignInParams: {
                client_id: '150323145707-hp5i8q4hm1vcb2hpta23c1829167nl1h.apps.googleusercontent.com',
                fetch_basic_profile: false,
                scope: 'profile'
            }
        };
    },
    methods: {
        onSignInSuccess (googleUser) {
            const profile = googleUser.getBasicProfile(); // etc etc
            debugger;
        },
        onSignInError (error) {
            console.log('OH NOES', error);
        }
    }
};
</script>
<!--

<script>
import { mapGetters } from 'vuex';
export default {
    components: {
    },
    data () {
        return {
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
    mounted (){
        window.googleApis.load('auth2', () => {
            const auth2 = window.gapi.auth2.init({
                client_id: '150323145707-hp5i8q4hm1vcb2hpta23c1829167nl1h.apps.googleusercontent.com',
                fetch_basic_profile: false,
                scope: 'profile'
            });
            auth2.attachClickHandler(this.$refs.signinBtn, {}, googleUser => {
                this.$emit('done', googleUser);
            }, error => console.log(error));
        });
    },

    methods: {
        onUserLoggedIn (user) {
            console.log(user);
        }
    }
};
</script>
-->
<style lang="scss" scoped>
  @import '../../../asset/style/css/slideShow.css';

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
  .btn-sign-in {
    background: #fff;
    font: 16px/22px Roboto;
    padding: 4px 8px;
    border: 1px solid #ccc;
    display: inline-block;
    cursor: pointer;
  }
  .g-signin-button {
    /* This is where you control how the button looks. Be creative! */
    display: inline-block;
    padding: 4px 8px;
    border-radius: 3px;
    background-color: #3c82f7;
    color: #fff;
    box-shadow: 0 3px 0 #0f69ff;
  }
</style>
