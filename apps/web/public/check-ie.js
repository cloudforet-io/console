function includes(text, target) {
    if (text.indexOf(target) !== -1) {
        return true;
    }
    return false;
}

function isIEBrowser() {
    const agent = window.navigator.userAgent.toLowerCase();
    const isIE = includes(agent, 'msie') || includes(agent, 'trident');
    return isIE;
}

if (isIEBrowser()) {
    window.location.href = '/ie-redirect-page.html';
}
