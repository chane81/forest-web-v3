import Router from 'next/router';

const redirect = (context: any, target: string): void => {
  // 서버실행
  if (context.res) {
    context.res.writeHead(303, { Location: target });
    context.res.end();
  }
  // 클라이언트 실행
  else {
    Router.replace(target);
  }
};

export { redirect };
