import styled, { createGlobalStyle } from 'styled-components';
import { observer } from 'mobx-react';
import { IAlertTypeAmodelType } from '~/store';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

/** props */
interface IProps {
  alertInfo: IAlertTypeAmodelType;
  alertStyle?: React.CSSProperties;
}

/** style */
// 모달창은 global style 로 적용해야 됨 wrapper 안에 들어 있지 않음
const GlobalStyle = createGlobalStyle<IProps>`
	.MuiDialog-paper {
		min-width: ${(props) => props.alertStyle?.width ?? 'auto'};
		max-width: ${(props) => props.alertStyle?.width ?? 'auto'};
	}

	.MuiDialogContent-root {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2rem 1rem 2rem 1rem !important;
	}

	.MuiDialogContentText-root {
		margin-bottom: 0 !important;
	}

	.close-btn {
		position: absolute !important;
		right: 1rem;
		top: 0.85rem;
		padding: 0 !important;
		color: lightgray;
	}
`;

const AlertTypeAWrapper = styled('div')<IProps>``;

/**
 * component
 * ALERT 팝업
 */
const AlertTypeA: React.FC<IProps> = (props) => {
  const { alertInfo: store } = props;

  // 토글 및 버튼 클릭 이벤트 핸들러
  const handleToggle = async (btnGubun: 'first' | 'second') => {
    store.setToggle();

    // 콜백 수행
    if (btnGubun === 'first') {
      await store.opFirstBtnClick?.();
    } else {
      await store.opSecondBtnClick?.();
    }
  };

  // closed 이벤트 핸들러
  const handleClosed = () => {
    // 초기화
    store.setInit();

    // close
    store.opClosed?.();
  };

  return (
    <>
      <GlobalStyle {...props} />
      <AlertTypeAWrapper {...props} className="popup-layer">
        <Dialog
          open={store.isOpen}
          onClose={handleClosed}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle disableTypography className="m-0 p-2 pl-3">
            <Typography variant="h6">
              <i className="far fa-sm fa-bell mr-2"></i>
              {store.title}
            </Typography>
            <IconButton aria-label="close" className="close-btn" onClick={handleClosed}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <DialogContentText
              id="alert-dialog-description"
              dangerouslySetInnerHTML={{ __html: store.bodyContents }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleToggle('first')}
            >
              {store.firstBtnText}
            </Button>
            <Button
              variant="contained"
              className={'bg-light-gray' && store.secondBtnClassName}
              size="small"
              onClick={() => handleToggle('second')}
            >
              {store.secondBtnText}
            </Button>
          </DialogActions>
        </Dialog>
      </AlertTypeAWrapper>
    </>
  );
};

export default observer(AlertTypeA);
