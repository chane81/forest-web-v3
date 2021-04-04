import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet as StyledComponentSheets } from 'styled-components';
import { ServerStyleSheets as MaterialUiServerStyleSheets } from '@material-ui/core/styles';
import theme from '~/src/components/Theme';
import { resetServerContext } from 'react-beautiful-dnd';
export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta name="theme-color" content={theme.palette.primary.main} />
          <link rel="shortcut icon" href="/images/favicon-v1.ico" type="image/x-icon" />
          <link rel="icon" href="/images/favicon-v1.ico" type="image/x-icon" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.0/css/all.min.css"
            integrity="sha512-BnbUDfEUfV0Slx6TunuB042k9tuKe3xrD6q4mg5Ed72LTgzDIcLPxg6yI2gcMFRyomt+yJJxE+zJwNmxki6/RA=="
            crossOrigin="anonymous"
          />

          {/* <script src='nprogress.js'></script>
					<link rel='stylesheet' href='nprogress.css' /> */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

MyDocument.getInitialProps = async (ctx) => {
  const styledComponentSheet = new StyledComponentSheets();
  const materialUiSheets = new MaterialUiServerStyleSheets();
  const originalRenderPage = ctx.renderPage;

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) =>
        styledComponentSheet.collectStyles(materialUiSheets.collect(<App {...props} />))
    });

  const initialProps = await Document.getInitialProps(ctx);

  resetServerContext();

  return {
    ...initialProps,
    styles: [
      <React.Fragment key="styles">
        {initialProps.styles}
        {materialUiSheets.getStyleElement()}
        {styledComponentSheet.getStyleElement()}
      </React.Fragment>
    ]
  };
};
