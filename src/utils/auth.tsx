import { GetServerSidePropsContext } from 'next';
import { redirect } from '~/src/utils/redirect';
import { apiCall } from '~/src/utils/fetchUtils';
import { ILoginInfo } from '~/src/interfaces';

// client side 에서 호출할 세션 유지 함수
const sessionPersist = async () => {
  await apiCall({
    url: '/setSessionPersist'
  });
};

// 로그인
const authCheck = async ({
  ...ctx
}: GetServerSidePropsContext): Promise<ILoginInfo> => {
  const headersCookie = ctx?.req?.headers?.cookie ?? null;
  const headers = headersCookie
    ? { headers: { cookie: headersCookie } }
    : undefined;

  // 로그인 api 쿼리 호출
  const res = await apiCall({
    url: '/getSessionCheck',
    ...headers
  });

  // 로그인화면에서 로그인시에 돌아갈 refUrl
  // const refUrl = !!ctx.pathname ? ctx.pathname : '';

  let loginInfo: ILoginInfo = null;

  // 세션정보가 없으면 login 페이지로 이동
  if (!res || !res.RESULT) {
    redirect(ctx, `/login`);
  } else {
    // 로그인 정보 전달 위해 객체에 담기
    loginInfo = {
      userSeqNo: res.USER_SEQ_NO,
      name: res.NAME,
      email: res.EMAIL,
      phoneNo: res.PHONE_NO,
      gubun: res.GUBUN
    };
  }

  return loginInfo;
};

export { authCheck, sessionPersist };
