<template>
  <div>
    <div id="g-signin-btn" />
    <div><a href="#" @click="signOut">Sign out</a></div>
    <div><a href="#" @click="disconnect">Disconnect</a></div>
    <div><img id="profileImage" src=""></div>
    <textarea id="message" cols="80" rows="10" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
function onSignIn(googleUser) {
    console.log("on sign in, granted scopes: " + googleUser.getGrantedScopes());
    console.log("ID token: " + googleUser.getAuthResponse().id_token);
    console.log("Access token: " + googleUser.getAuthResponse().access_token);
    var profile = googleUser.getBasicProfile();
    var message = 'ID: ' + profile.getId() + "\n"
        + 'Name: ' + profile.getName() + "\n"
        + 'Image URL: ' + profile.getImageUrl() + "\n"
        + 'Email: ' + profile.getEmail();
    document.getElementById("message").value = message;
    setProfileImage(profile.getImageUrl());
}
export default {
    components: {},
    data() {
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
    beforeMount() {
        this.init();
    },
    methods: {
        init() {
              gapi.load('auth2', function () {
                console.log('150323145707-gnuesem937pjv8c46jfer5ma2r746p54.apps.googleusercontent.com');
                let auth2 = gapi.auth2.init({
                    client_id: '150323145707-gnuesem937pjv8c46jfer5ma2r746p54.apps.googleusercontent.com',
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
        },
        onSignIn(googleUser) {
            debugger;
            console.log('on sign in, granted scopes: ' + googleUser.getGrantedScopes());
            console.log('ID token: ' + googleUser.getAuthResponse().id_token);
            console.log('Access token: ' + googleUser.getAuthResponse().access_token);
            var profile = googleUser.getBasicProfile();
            var message = 'ID: ' + profile.getId() + '\n'
                    + 'Name: ' + profile.getName() + '\n'
                    + 'Image URL: ' + profile.getImageUrl() + '\n'
                    + 'Email: ' + profile.getEmail();
            document.getElementById('message').value = message;
            setProfileImage(profile.getImageUrl());
        },
        signOut() {
            debugger;
            var auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(function () {
                console.log('on sign out');
                setMessage('User signed out');
                setProfileImage(null);
            });
        },
        disconnect() {
            debugger;
            console.log('on disconnect');
            var auth2 = gapi.auth2.getAuthInstance();
            if (!auth2.isSignedIn.get()) {
                setMessage('Not signed in, cannot disconnect');
                return;
            }
            auth2.disconnect();
            setProfileImage(null);
            setMessage('Disconnected');
        },
        setMessage(message) {
            document.getElementById('message').value = message;
        },
        setProfileImage(srcUrl){
            var element = document.getElementById('profileImage');
            if (srcUrl == null) {
                element.style.display = 'none';
                element.src = '';
            } else {
                element.style.display = 'block';
                element.src = srcUrl;
            }
        }
    }
}
;
</script>

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
</style>
