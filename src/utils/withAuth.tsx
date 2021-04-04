import React from 'react';
import { NextPage, NextPageContext } from 'next';
import { redirect } from '~/src/utils/redirect';
import { apiCall } from '~/src/utils/fetchUtils';
import { ILoginInfo } from '~/src/interfaces';

// 로그인 체크 HOC 컴포넌트
const withAuth = <T extends Record<string, unknown>>(
  AppComponent: NextPage<T>
): NextPage => {
  return class AuthComponent extends React.Component<T> {
    public static async getInitialProps({ ...ctx }: NextPageContext) {
      // 감싸는 하위 컴포넌트에 getInitialProps() 가 있다면 수행
      let appProps = {};
      if (AppComponent.getInitialProps) {
        appProps = await AppComponent.getInitialProps(ctx);
      }

      const isServer = typeof window === 'undefined';
      const headersCookie = ctx?.req?.headers?.cookie ?? null;
      const headerObj = headersCookie ? { cookie: headersCookie } : undefined;

      // 로그인 api 쿼리 호출
      const res = await apiCall({
        url: '/getSessionCheck',
        headers: headerObj
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

      return {
        ...appProps,
        loginInfo
      };
    }

    public constructor(props) {
      super(props);
    }

    public render() {
      return <>{<AppComponent {...this.props} />}</>;
    }
  };
};

export default withAuth;
