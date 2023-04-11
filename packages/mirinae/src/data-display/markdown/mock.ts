export default {
    markdown: {
        en: `
# Help for AWS Users

## Find Your AWS Account ID
Get your AWS Account ID.
[AWS Account ID](https://docs.aws.amazon.com/IAM/latest/UserGuide/console_account-alias.html)

## Get Your Assume role
Granting permissions to create temporary security credentials.
[AWS Assume Role](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_permissions-to-switch.html)

## Issue AWS Access Key 
Get your AWS Access Key & AWS Secret Key
[AWS Access Key & AWS Secret Key](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey)
`,
        ko: `
# AWS 이용자 가이드

## AWS 어카운트 아이디(Account ID) 찾기
사용자의 AWS 어카운트 아이디 AWS 콘솔(Console)에서 확인하기
[AWS Account ID](https://docs.aws.amazon.com/ko_kr/IAM/latest/UserGuide/console_account-alias.html)

## Assume role 획득하기
임시 보안 자격증명을 만들 수있는 권한을 부여하기.
[AWS Assume Role](https://docs.aws.amazon.com/ko_kr/IAM/latest/UserGuide/id_roles_use_permissions-to-switch.html)

## AWS Access Key 발급하기
AWS Access Key & AWS Secret Key 발급하기
[AWS Access Key & AWS Secret Key](https://docs.aws.amazon.com/ko_kr/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey)
`,
    },
    markdownWithData: {
        en: `
# Hello, <%= name %>!

## Your phone number is <%= phone %>.
`,
        ko: `
# 안녕하세요, <%= name %>님!

## 고객님의 전화번호는 <%= phone %> 입니다.
`,
    },
    data: {
        name: 'Gina',
        phone: '+82 10-1111-1111',
    },
};
