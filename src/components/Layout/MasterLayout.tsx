import { useState, useEffect } from 'react';
import styled from 'styled-components';
import clsx from 'clsx';
import {
  useMediaQuery,
  Theme,
  IconButton,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  List
} from '@material-ui/core';
import { Menu, ChevronLeft, LockOpen } from '@material-ui/icons';
import theme from '~/components/Theme';
import { mainListItems } from './ListItems';
import { useRouter } from 'next/router';
import { apiCall } from '~/src/utils/fetchUtils';
import { ILoginInfo } from '~/src/interfaces/index';
import { observer } from 'mobx-react';
import { useFirstMountState, useWindowSize } from 'react-use';
import { useStore } from '~/store';

interface IProps {
  className?: string;
  children?: React.ReactNode;
  loginInfo?: ILoginInfo;
}

interface IStyle {
  className?: string;
  muiTheme: Theme;
  drawerWidth: string;
}

const MasterLayoutWrapper = styled('div')<IStyle>`
  display: flex;

  .dv-container {
    min-width: 780px;
    overflow-x: auto;
  }

  .appbar {
    z-index: ${(props) => props.muiTheme.zIndex.drawer + 1};
    transition: ${(props) =>
      props.muiTheme.transitions.create(['width', 'margin'], {
        easing: props.muiTheme.transitions.easing.sharp,
        duration: props.muiTheme.transitions.duration.leavingScreen
      })};
  }

  .appbar-shift {
    margin-left: ${(props) => props.drawerWidth};
    width: calc(100% - ${(props) => props.drawerWidth});
    transition: ${(props) =>
      props.muiTheme.transitions.create(['width', 'margin'], {
        easing: props.muiTheme.transitions.easing.sharp,
        duration: props.muiTheme.transitions.duration.enteringScreen
      })};
  }

  .drawer-paper {
    position: relative;
    white-space: nowrap;
    width: ${(props) => props.drawerWidth};
    transition: ${(props) =>
      props.muiTheme.transitions.create(['width'], {
        easing: props.muiTheme.transitions.easing.sharp,
        duration: props.muiTheme.transitions.duration.enteringScreen
      })};
  }

  .drawer-paper-close {
    overflow-x: hidden;
    width: ${(props) => props.muiTheme.spacing(7)}px;
    transition: ${(props) =>
      props.muiTheme.transitions.create(['width'], {
        easing: props.muiTheme.transitions.easing.sharp,
        duration: props.muiTheme.transitions.duration.leavingScreen
      })};
  }

  ${(props) => props.muiTheme.breakpoints.up('sm')} {
    .drawer-paper-close {
      width: ${(props) => props.muiTheme.spacing(9)}px;
    }
  }

  .appbar-spacer {
    ${(props) => ({ ...(props.muiTheme.mixins.toolbar as any) })};
  }

  .toolbar {
    padding-right: 24px;
  }

  .toolbar-icon {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 8px;
    ${(props) => ({ ...(props.muiTheme.mixins.toolbar as any) })};
  }

  .menu-button {
    margin-right: 36px;
  }

  .menu-button-hidden {
    display: none;
  }

  .title {
    flex-grow: 1;
  }

  .content {
    flex-grow: 1;
    height: 100vh;
    overflow: auto;
    background-color: #e9ecef;
  }

  .container {
    padding-top: ${(props) => props.muiTheme.spacing(4)}px;
    padding-bottom: ${(props) => props.muiTheme.spacing(4)}px;
  }

  .paper {
    padding: ${(props) => props.muiTheme.spacing(2)}px;
    display: flex;
    overflow: auto;
    flex-direction: column;
  }

  .fixed-height {
    height: 240px;
  }
`;

const MasterLayout: React.FC<IProps> = (props) => {
  const router = useRouter();
  const matches = useMediaQuery(theme.breakpoints.up(1064));
  const isFirst = useFirstMountState();
  const { width } = useWindowSize();
  const { layoutModel } = useStore();
  const { leftMenuIsOpen } = layoutModel;

  // 브라우저 width 변경시 md size(960px) 보다 크면 레프트 메뉴 open, 작으면 레프트 메뉴 hide 작동
  useEffect(() => {
    if (!isFirst) {
      layoutModel.setLeftMenuIsOpen(matches);
    }
  }, [width]);

  // drawer 오픈
  const handleDrawerOpen = () => {
    layoutModel.setLeftMenuIsOpen(true);
  };

  // drawer 닫기
  const handleDrawerClose = () => {
    layoutModel.setLeftMenuIsOpen(false);
  };

  // 로그아웃
  const handleLogout = async () => {
    const res = await apiCall({ url: '/setLogout' });

    if (res.RESULT_CODE !== '00') {
      console.error('Logout Failed!');
    } else {
      router.push('/login');
    }
  };

  return (
    <MasterLayoutWrapper muiTheme={theme} drawerWidth="240px">
      <AppBar position="absolute" className={clsx('appbar', leftMenuIsOpen && 'appbar-shift')}>
        <Toolbar className="toolbar">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx('menu-button', leftMenuIsOpen && 'menu-button-hidden')}
          >
            <Menu />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap className="title">
            Forest Admin
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LockOpen></LockOpen>
            <Typography variant="subtitle1">
              Logout [{props.loginInfo ? props.loginInfo.name : ''}]
            </Typography>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx('drawer-paper', !leftMenuIsOpen && 'drawer-paper-close')
        }}
        open={leftMenuIsOpen}
      >
        <div className="toolbar-icon">
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeft />
          </IconButton>
        </div>
        <Divider />
        <List>{mainListItems}</List>
      </Drawer>
      <main className="content">
        <div className="appbar-spacer" />
        <div className="container-fluid p-4 dv-container">{props.children}</div>
      </main>
    </MasterLayoutWrapper>
  );
};

export default observer(MasterLayout);
