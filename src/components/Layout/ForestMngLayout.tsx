import styled from 'styled-components';
import { observer } from 'mobx-react';
import { ILoginInfo } from '~/src/interfaces';
import {
  Card,
  CardContent,
  Stepper,
  Step,
  Button,
  StepButton,
  Grid,
  Typography
} from '@material-ui/core';
import { AlertTypeA } from '~/components/Popup';
import { useRouter } from 'next/router';
import { IAlertTypeAmodelType } from '~/store/common/alertTypeAstore';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import SaveIcon from '@material-ui/icons/Save';

/** props */
interface IProps {
  className?: string;
  children?: React.ReactNode;
  loginInfo?: ILoginInfo;
  activeStep?: number;
  forestSeqNo?: number;
  opSave?: () => void;
  opExpAdd?: () => void;
  opMovieAdd?: () => void;
  alertModel?: IAlertTypeAmodelType;
}

/** style */
const ForestMngLayoutWrapper = styled('div')`
  .title {
    height: 45.63px;
    margin-bottom: 1.5rem;
    align-items: flex-end;
  }

  .btn-proc-area {
    display: flex;
    justify-content: flex-end;
  }
`;

/** 휴양림 등록/수정, 체험등록/수정, 동영상등록/수정 레이아웃 */
const ForestMngLayout: React.FC<IProps> = (props) => {
  const { loginInfo, activeStep, children, forestSeqNo } = props;
  const { alertModel, opSave, opExpAdd, opMovieAdd } = props;
  const router = useRouter();
  const steps = ['기본 정보', '체험 정보', '동영상 정보'];
  const setpMapData = new Map([
    [0, 'forestEdit'],
    [1, 'expEdit'],
    [2, 'movieEdit']
  ]);

  // 휴양림 정보가 등록되어 있지 않을 때 alert
  const alertWarning = () => {
    alertModel.setToggleWithSetting({
      bodyContents: '휴양림 정보를 등록해 주세요.',
      firstBtnText: '확인',
      secondBtnClassName: 'd-none'
    });

    return;
  };

  /** step 에 해당하는 url로 이동*/
  const handleStepClick = (idx: number) => {
    if (idx > 0 && !!!forestSeqNo) {
      return alertWarning();
    }

    const pageUrl = setpMapData.get(idx);

    router.push(`${pageUrl}?forestSeqNo=${forestSeqNo}`);
  };

  /** back 클릭시 */
  const handleBackClick = () => {
    handleStepClick(activeStep === 0 ? 0 : activeStep - 1);
  };

  /** next 클릭시 */
  const handleNextClick = () => {
    if (!!!forestSeqNo) {
      return alertWarning();
    }

    handleStepClick(activeStep === 2 ? 2 : activeStep + 1);
  };

  /** title */
  const title =
    activeStep === 0
      ? '기본 정보 등록/수정'
      : activeStep === 1
      ? '체험 정보 등록/수정'
      : activeStep === 2
      ? '동영상 정보 등록/수정'
      : '';

  return (
    <ForestMngLayoutWrapper>
      <Card elevation={10} className="position-relative">
        <CardContent>
          <div className="mb-3">
            <Stepper nonLinear activeStep={activeStep}>
              {steps.map((label, idx) => (
                <Step key={label}>
                  {/* step 클릭시 */}
                  <StepButton onClick={() => handleStepClick(idx)}>{label}</StepButton>
                  {/* step 클릭시 */}
                </Step>
              ))}
            </Stepper>
          </div>
          <Grid container className="title">
            <Grid item xs={4}>
              <Typography variant="h6">
                <b>{title}</b>
              </Typography>
            </Grid>
            <Grid item xs={8} className="btn-proc-area">
              {activeStep === 0 && (
                <Button
                  variant="contained"
                  className="bg-primary text-white mr-2"
                  startIcon={<SaveIcon />}
                  onClick={opSave}
                >
                  저장하기
                </Button>
              )}
              {activeStep === 1 && (
                <Button
                  variant="contained"
                  className="bg-primary text-white mr-2 mr-2"
                  startIcon={<AddCircleIcon />}
                  onClick={opExpAdd}
                >
                  체험 정보 추가
                </Button>
              )}
              {activeStep === 2 && (
                <Button
                  variant="contained"
                  className="bg-primary text-white mr-2 mr-2"
                  startIcon={<AddCircleIcon />}
                  onClick={opMovieAdd}
                >
                  동영상 정보 추가
                </Button>
              )}
              {activeStep !== 0 && (
                <Button
                  variant="contained"
                  color="default"
                  className="mr-2"
                  startIcon={<NavigateBeforeIcon />}
                  onClick={handleBackClick}
                >
                  Back
                </Button>
              )}
              {activeStep !== 2 && (
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<NavigateNextIcon />}
                  onClick={handleNextClick}
                >
                  Next
                </Button>
              )}
            </Grid>
          </Grid>
          {/* children 컴포넌트 */}
          <div>{children}</div>
          {/* children 컴포넌트 */}
          <div className="mt-5">
            {/* 휴양림 수정/저장 페이지에서만 저장버튼 보이게 */}
            {activeStep === 0 && (
              <Button variant="contained" className="bg-primary text-white mr-2" onClick={opSave}>
                저장하기
              </Button>
            )}
            {/* 휴양림 수정/저장 페이지에서만 저장버튼 보이게 */}
            {activeStep !== 0 && (
              <Button
                variant="contained"
                color="default"
                className="mr-2"
                startIcon={<NavigateBeforeIcon />}
                onClick={handleBackClick}
              >
                Back
              </Button>
            )}
            {activeStep !== 2 && (
              <Button
                variant="contained"
                color="primary"
                endIcon={<NavigateNextIcon />}
                onClick={handleNextClick}
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <AlertTypeA
        alertInfo={alertModel}
        alertStyle={{
          width: '300px'
        }}
      ></AlertTypeA>
    </ForestMngLayoutWrapper>
  );
};

export default observer(ForestMngLayout);
