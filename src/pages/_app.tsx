import React, { useEffect } from 'react';
import Head from 'next/head';
import makeInspectable from 'mobx-devtools-mst';
import { Provider } from 'mobx-react';
import { onPatch } from 'mobx-state-tree';
import { NextComponentType, NextPageContext, NextPage } from 'next';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import IconButton from '@material-ui/core/IconButton';
import theme from '~/src/components/Theme';
import { SnackbarProvider } from 'notistack';
import '~/src/styles/global.scss';
import { useStore } from '~/store';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

/** RootApp props type */
interface IProps extends IServerProps {
  Component: NextComponentType;
}

/** RootApp serverside 전달 props type */
interface IServerProps {
  initialState: any;
  isServer: boolean;
  pageProps: any;
}

/** getInitialProps props type */
interface IAppContextProps extends NextPageContext {
  Component: NextComponentType;
  ctx: NextPageContext;
}

/** root app */
const RootApp: NextPage<IProps, IServerProps> = (props) => {
  const { Component, pageProps, isServer, initialState } = props;
  // const [store] = useState<IStore>(initializeStore(initialState));

  const store = useStore(pageProps.initialState);

  // mst 디버깅 로그
  if (process.env.NODE_ENV === 'development') {
    // 크롬 console 에 해당값의 변화가 있을 때 나타나게 함
    onPatch(store, (patch) => {});

    // 크롬 mobx tools 에 MST 로 상태변화를 볼 수 있게 한다.
    makeInspectable(store);
  }

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');

    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  });

  /** 스낵바 ref */
  const notistackRef = React.createRef<SnackbarProvider>();

  /** 스택바 close */
  const onClickDismiss = (key) => () => {
    notistackRef.current.closeSnackbar(key);
  };

  return (
    <>
      <Head>
        <title>Forest Admin</title>
      </Head>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider
            maxSnack={6}
            autoHideDuration={4000}
            ref={notistackRef}
            action={(key) => (
              <IconButton component="span" onClick={onClickDismiss(key)}>
                <HighlightOffIcon style={{ color: 'white' }} />
              </IconButton>
            )}
          >
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <Component {...pageProps} />
          </SnackbarProvider>
        </ThemeProvider>
      </Provider>
    </>
  );
};

/** 서버사이드 함수 */
// RootApp.getInitialProps = async ({ Component, ctx }: IAppContextProps) => {
// 	let pageProps = {};
// 	const isServer = typeof window === 'undefined';

// 	const store = initializeStore(isServer);

// 	if (Component.getInitialProps) {
// 		pageProps = await Component.getInitialProps(ctx);
// 	}

// 	return { initialState: getSnapshot(store), isServer, pageProps };
// };

export default RootApp;
