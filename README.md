# Serverless Next.js with TypeScript

## 참고 URL

- <https://www.serverless.com/plugins/serverless-nextjs-plugin>

## AWS Setup

- aws configure
- aws configservice get-status

## Serverless Setup

- npx serverless create --template aws-nodejs
- npx serverless
- npx serverless remove
- serverless.yml 파일 참고할 것

## Deploy

- 주의점
  - .serverless 와 .serverless_nextjs 폴더는 초기 생성시 폴더 그대로 두어야 한다.
  - 위 serverless 관련 2개 폴더 삭제 후 다시 배포한다면 AWS 의 다른 CloudFront 로 배포하려고 할것이다. 그러면 번거롭게 CloudFront 부터 Route 53의 record 도 수동으로 지워 주어야 하므로 주의해야 한다.
  - yarn deploy 로 계속 배포를 하면 같은 CloudFront 로 배포한다.

## Env

- AWS_ACCESS_KEY_ID=AWS 액세스 키
- AWS_SECRET_ACCESS_KEY=AWS 시크릿 키

## Route53 과 CloudFront 연결

- "미국 동부 (버지니아 북부) us-east-1" 에 와일드카드 인증서가 존재하면 따로 세팅이 필요없다.
  - 아래 도메인으로 인증서 생성
    - <domain.com>
    - \*.<domain.com>
- 그냥 yarn deploy 하면 된다.
- 꼭 미국 동부(us-east-1)에 생성할 것!

- 아래는 참고사항이다.(수동 세팅시 참고 할 것)

  - CloudFront 세팅

    - CloudFront 를 선택하고 Edit 버튼 클릭
    - Alternate Domain Names에 아래 도메인 입력
      - admin.xn--2e0b797ac2eion.com
    - SSL Certificate 에서 Custom SSL Certificate 선택
      - 주의사항
        - SSL 인증서가 미국 동부 (버지니아 북부) us-east-1 에도 있어야 한다.
        - DNS 검증으로 간단하게 발급이 가능하다.
      - 발급후에 입력 INPUT 박스에 발급한 인증서 명이 나오면 선택한다.

  - Route 53 세팅
    - 해당 호스팅을 선택후 레코드 생성버튼을 클릭
    - 단순 라우팅 선택
    - 단순 레코드 정의 클릭
    - 레코드 이름 INPUT 박스에 admin 입력
    - 엔드포인트에 CloudFront 배포에 대한 별칭 선택
    - 기본 미국 동부(버지니아 북부) us-east-1 이다
    - CloudFront 명칭이 인텔리센스로 나오면 선택
    - 단순레코드정의 버튼을 클릭하여 완료

## 개발이슈

1. material-table 컴포넌트를 쓰면 페이지로딩시에 아래와 같은 warning 가 뜨게 된다.

  - warning 메시지

   ```text
    Warning: Prop `data-rbd-draggable-context-id` did not match. Server: "1" Client: "0"

    react-beautiful-dnd
    A setup problem was encountered.
    > Invariant failed: Draggable[id: 0]: Unable to find drag handle
   ```

  - 해결
    - react-beautiful-dnd 모듈을 설치하고 _document.tsx 에 아래 구문을 넣어준다
    
   ```javascript
   import { resetServerContext } from 'react-beautiful-dnd';

   MyDocument.getInitialProps = async ctx => {
    ...

    resetServerContext();

    ...

    return {
     ...
    };
   ```
	
2. useLayoutEffect 이슈

	- 아래와 같이 Warning 메시지가 나올시
	> Warning: useLayoutEffect does nothing on the server, because its effect cannot be encoded into the server renderer's output format
	
	- 원인
  	- 아래 mobx-react-lite 를 썼을 때 나는 에러이다. 'mobx-react' 로 대체해서 쓰면 warning 가 나오지 않는다.
  	- import { observer } from 'mobx-react-lite';

3. 서버사이드(getServerSideProps) 에서 mst 데이터 바인딩 후 mui 컨트롤의 warning 이슈

		- 서버사이드에서 mst 바인딩 후 mui 컨트롤의 className is not match 이슈가 있어서
		- 이슈 해결 전까지는 useEffect 에서 데이터 바인딩 하게 한다.
		- 참고
  		- pages/forestEdit.tsx 에서 getServerSideProps 부분 참고
