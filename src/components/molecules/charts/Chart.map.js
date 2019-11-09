import styles from '@/styles/_variables.scss';
import chartStyles from '@/components/molecules/charts/Chart.styles.scss';

export const DEFAULT_OPTIONS = Object.freeze({
    layout: {
        padding: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        },
    },
    legend: {
        display: true,
        position: 'top',
        labels: {
            usePointStyle: true,
            boxWidth: 10,
            padding: 20,
        },
    },
});

export const PRIMARY_COLORSET = Object.freeze([
    styles.primary,
    styles.primary2,
    styles.other1,
    styles.secondary,
    styles.secondary1,
    styles.safe,
    styles.other4,
    styles.other3,
    styles.other2,
    styles.primary1,
]);

export const HOVER_COLORSET = Object.freeze([
    chartStyles.primary_op3,
    chartStyles.primary2_op3,
    chartStyles.other1_op3,
    chartStyles.secondary_op3,
    chartStyles.secondary1_op3,
    chartStyles.safe_op3,
    chartStyles.other4_op3,
    chartStyles.other3_op3,
    chartStyles.other2_op3,
    chartStyles.primary1_op3,
]);

export const initHover = function (Chart) {
    Chart.defaults.global.hover = {
        tooltips: {
            intersect: true,
            mode: 'y',
        },
    };
};

export const initRectangleDraw = function (Chart) {
    Chart.elements.Rectangle.prototype.draw = function () {
        const ops = this._chart.config.options;
        const ctx = this._chart.ctx;
        const vm = this._view;
        let left; let right; let top; let bottom; let signX; let signY; let borderSkipped;
        let radius;
        let borderWidth = vm.borderWidth;
        // Set Radius Here
        // If radius is large enough to cause drawing errors a max radius is imposed
        const cornerRadius = ops.barRadius || 0;


        if (!vm.horizontal) {
            // bar
            left = vm.x - vm.width / 2;
            right = vm.x + vm.width / 2;
            top = vm.y;
            bottom = vm.base;
            signX = 1;
            signY = bottom > top ? 1 : -1;
            borderSkipped = vm.borderSkipped || 'bottom';
        } else {
            // horizontal bar
            left = vm.base;
            right = vm.x;
            top = vm.y - vm.height / 2;
            bottom = vm.y + vm.height / 2;
            signX = right > left ? 1 : -1;
            signY = 1;
            borderSkipped = vm.borderSkipped || 'left';
        }

        // Canvas doesn't allow us to stroke inside the width so we can
        // adjust the sizes to fit if we're setting a stroke on the line
        if (borderWidth) {
            // borderWidth shold be less than bar width and bar height.
            const barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
            borderWidth = borderWidth > barSize ? barSize : borderWidth;
            const halfStroke = borderWidth / 2;
            // Adjust borderWidth when bar top position is near vm.base(zero).
            const borderLeft = left + (borderSkipped !== 'left' ? halfStroke * signX : 0);
            const borderRight = right + (borderSkipped !== 'right' ? -halfStroke * signX : 0);
            const borderTop = top + (borderSkipped !== 'top' ? halfStroke * signY : 0);
            const borderBottom = bottom + (borderSkipped !== 'bottom' ? -halfStroke * signY : 0);
            // not become a vertical line?
            if (borderLeft !== borderRight) {
                top = borderTop;
                bottom = borderBottom;
            }
            // not become a horizontal line?
            if (borderTop !== borderBottom) {
                left = borderLeft;
                right = borderRight;
            }
        }

        ctx.beginPath();
        ctx.fillStyle = vm.backgroundColor;
        ctx.strokeStyle = vm.borderColor;
        ctx.lineWidth = borderWidth;

        // Corner points, from bottom-left to bottom-right clockwise
        // | 1 2 |
        // | 0 3 |
        const corners = [
            [left, bottom],
            [left, top],
            [right, top],
            [right, bottom],
        ];

        // Find first (starting) corner with fallback to 'bottom'
        const borders = ['bottom', 'left', 'top', 'right'];
        let startCorner = borders.indexOf(borderSkipped, 0);
        if (startCorner === -1) {
            startCorner = 0;
        }

        function cornerAt(index) {
            return corners[(startCorner + index) % 4];
        }

        // Draw rectangle from 'startCorner'
        let corner = cornerAt(0);
        ctx.moveTo(corner[0], corner[1]);

        for (let i = 1; i < 4; i++) {
            corner = cornerAt(i);
            // let nextCornerId = i + 1;
            // if (nextCornerId == 4) {
            //     nextCornerId = 0;
            // }
            //
            // const nextCorner = cornerAt(nextCornerId);

            const width = corners[2][0] - corners[1][0];
            const height = corners[0][1] - corners[1][1];
            const x = corners[1][0];
            const y = corners[1][1];

            radius = cornerRadius;

            // Fix radius being too large
            if (radius > height / 2) {
                radius = height / 2;
            } if (radius > width / 2) {
                radius = width / 2;
            }
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius); // right top
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);// right bottom
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius); // left bottom
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y); // left top
        }

        ctx.fill();
        if (borderWidth) {
            ctx.stroke();
        }
    };
};
