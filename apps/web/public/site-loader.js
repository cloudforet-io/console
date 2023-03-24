// eslint-disable-next-line no-undef
lottie.loadAnimation({
    container: document.getElementById('site-loader'), // the dom element that will contain the animation
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'lottiefiles/lottie_initializing.json', // the path to the animation json
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(() => {
                // console.log('Service worker registered.', reg);
            });
    });
}
