
/* scroll to a position with duration
from https://gist.github.com/andjosh/6764939
interface options{
  x: number // nullable. don't scroll horizontally when null
  y: number // nullable. don't scroll vertically when null
  duration: number // default 0
  element: Node // default is the top scrollable element.
  beforeEveryFrame: (count: number) => boolean|void // call before requestAnimationFrame execution. return false to stop
}
return stop
*/
export function scrollTo(options: {
    x?: number;
    y?: number;
    duration?: number;
    element?: Element;
    beforeEveryFrame?: (count: number) => boolean | void; // return false to stop
}) {
    if (!options.element) {
        options.element = document.scrollingElement || document.documentElement;
    }
    if (options.duration == null) {
        options.duration = 0;
    }
    const {
        x, y, duration, element,
    } = options;
    let requestAnimationFrameId;
    let count = 0;
    const startY = element.scrollTop;
    const changeY = (y ?? 0) - startY;
    const startX = element.scrollLeft;
    const changeX = (x ?? 0) - startX;
    const startDate = +new Date();
    const animateScroll = function animateScroll() {
        if (
            options.beforeEveryFrame
            && options.beforeEveryFrame(count) === false
        ) {
            return;
        }
        const currentDate = new Date().getTime();
        const changedTime = currentDate - startDate;
        if (y != null) {
            element.scrollTop = parseInt(
                calc(startY, changeY, changedTime, duration),
            );
        }
        if (x != null) {
            element.scrollLeft = parseInt(
                calc(startX, changeX, changedTime, duration),
            );
        }
        if (changedTime < duration) {
            requestAnimationFrameId = requestAnimationFrame(animateScroll);
        } else {
            if (y != null) {
                element.scrollTop = y;
            }
            if (x != null) {
                element.scrollLeft = x;
            }
        }
        count++;
    };
    const stop = () => {
        cancelAnimationFrame(requestAnimationFrameId);
    };
    animateScroll();
    // return stop
    return stop;
    function calc(startValue, changeInValue, changedTime, _duration) {
        return startValue + changeInValue * (changedTime / _duration);
    }
}
