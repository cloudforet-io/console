const httpRequest = new XMLHttpRequest();
const getTitle = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
            document.title = httpRequest.responseText;
        } else {
            console.error('Failed to get title.txt');
        }
    }
};
httpRequest.onreadystatechange = getTitle;
httpRequest.open('GET', 'title.txt');
httpRequest.send();
