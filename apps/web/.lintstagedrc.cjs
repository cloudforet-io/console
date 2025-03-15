module.exports = {
    "**/!(*spec).{ts,tsx,js,jsx,vue}": ["eslint --fix --max-warnings=0"],
    
    // 타입 체크는 함수로 구현하여 staged 파일에 대해서만 실행
    "**/*.{ts,tsx,vue}": (files) => {
        // 파일 목록을 문자열로 변환
        const filePaths = files.join(' ');
        // TypeScript 컴파일러 옵션을 명시적으로 지정
        return `tsc -p tsconfig.json --noEmit ${filePaths}`;
    },
    "src/**/*.{css,vue,pcss,scss}": ["stylelint --fix"]
}
