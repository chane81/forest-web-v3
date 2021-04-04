import React, { useEffect } from 'react';
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
  Typography,
  Container,
  Paper,
  Theme
} from '@material-ui/core';
import { LockOutlined } from '@material-ui/icons';
import styled from 'styled-components';
import { useFormik } from 'formik';
import { Copyright } from '~/components/Share';
import theme from '~/components/Theme';
import { apiCall } from '~/src/utils/fetchUtils';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';

/** style props */
interface IStyle {
  muiTheme: Theme;
}

const LoginWrapper = styled('div')<IStyle>`
  .paper {
    margin-top: ${(props) => props.muiTheme.spacing(8)}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: transparent;
  }

  .avatar {
    margin: 1rem;
    background-color: ${(props) => props.muiTheme.palette.secondary.main};
  }

  form {
    width: 100%;
    margin-top: ${(props) => props.muiTheme.spacing(1)}px;
  }

  .submit {
    margin: ${(props) => props.muiTheme.spacing(2, 0, 2)};
  }

  .chk-remember {
    margin-top: 2rem;
  }
`;

const Login = () => {
  const router = useRouter();
  const [cookies, setCookie, removeCookie] = useCookies(['logiall']);
  const isSaveId = () => (cookies && cookies.isSaveId === 'true' ? true : false);
  const userId = () => (cookies && cookies.userId ? cookies.userId : '');

  // 로그인 사용 상태 타입
  interface loginInfo {
    userId: string;
    password: string;
    isSaveId: boolean;
    isCorrect: boolean;
  }

  useEffect(() => {
    formik.setValues({
      ...formik.values,
      userId: userId(),
      isSaveId: isSaveId()
    });
  }, []);

  const formik = useFormik<loginInfo>({
    initialValues: {
      userId: '',
      password: '',
      isSaveId: false,
      isCorrect: true
    },
    onSubmit: async (values) => {
      // 로그인 버튼 클릭시 로그인 api 호출
      const res = await apiCall({
        url: '/setLogin',
        params: {
          EMAIL: values.userId,
          PWD: values.password
        }
      });

      if (res.RESULT_CODE === '00') {
        // id 및 저장여부 쿠키로 저장
        saveCookie(values);

        // redirect
        router.push('/forestList');
      } else {
        formik.setFieldValue('isCorrect', false);
      }
    }
  });

  // ID 저장 기능
  const handleChangeSaveId = () => {
    formik.setFieldValue('isSaveId', !formik.values.isSaveId);
  };

  // id 및 저장여부 쿠키로 저장
  const saveCookie = (values: loginInfo) => {
    // 쿠키값에 사용자ID 저장
    // 쿠키 유효기간: 1년
    const maxAge = 1000 * 60 * 60 * 24 * 365;

    // check true 이면 사용자ID 와 현재 체크값 상태를 쿠키로 저장
    if (values.isSaveId) {
      setCookie('isSaveId', values.isSaveId, { maxAge });
      setCookie('userId', values.userId);
    } else {
      removeCookie('isSaveId');
      removeCookie('userId');
    }
  };

  return (
    <LoginWrapper muiTheme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Paper className="paper" elevation={0}>
          <Avatar className="avatar">
            <LockOutlined />
          </Avatar>
          <Typography component="h1" variant="h5">
            Admin Login
          </Typography>
          <form noValidate onSubmit={formik.handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="userId"
              label="ID"
              value={formik.values.userId}
              onChange={formik.handleChange}
              autoFocus
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="password"
              label="Password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
            />
            <Box>
              <Typography variant="caption" color="error" hidden={formik.values.isCorrect}>
                <b>* 아이디 또는 비밀번호를 확인해 주세요.</b>
              </Typography>
            </Box>
            <FormControlLabel
              className="chk-remember"
              control={
                <Checkbox
                  checked={formik.values.isSaveId}
                  onChange={handleChangeSaveId}
                  color="primary"
                />
              }
              label="Remember me"
            />
            <Button type="submit" fullWidth variant="contained" color="primary" className="submit">
              Login
            </Button>
            <Grid container>
              {/* <Grid item xs>
								<Link href='#' variant='body2'>
									Forgot password?
								</Link>
							</Grid>
							<Grid item>
								<Link href='#' variant='body2'>
									{"Don't have an account? Sign Up"}
								</Link>
							</Grid> */}
            </Grid>
          </form>
        </Paper>
        <Box mt={8}>
          <Copyright />
        </Box>
      </Container>
    </LoginWrapper>
  );
};

export default Login;
