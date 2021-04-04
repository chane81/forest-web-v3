import styled, { css } from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';

/** Props */
interface IProps {
  isShow: boolean;
  isBgShow?: boolean;
  iconBgColor?: string;
  top?: string;
  left?: string;
  width?: string;
  height?: string;
}

/** style */
const FullLoadingWrapper = styled('div')<IProps>`
  position: absolute;
  justify-content: center;
  align-items: center;
  top: ${(props) => (props.top ? props.top : '0px')};
  left: ${(props) => (props.left ? props.left : '0px')};
  width: ${(props) => (props.width ? props.width : '100%')};
  height: ${(props) => (props.height ? props.height : '100%')};
  color: #343a40;
  z-index: 999 !important;
  display: ${(props: IProps) => (props.isShow ? 'flex' : 'none')};

  .circle-spinner {
    position: absolute;
    color: ${(props: IProps) => props.iconBgColor ?? '#3f51b5'};
  }

  .Loading {
    width: 100%;
    height: 100%;
    ${(props: IProps) =>
      (props.isBgShow === undefined || props.isBgShow) &&
      css`
        background: rgba(100, 100, 100, 0.3);
      `};
  }
`;

/**
 * Component
 *  로딩 spinner 컴포넌트
 * */
const FullLoading: React.FC<IProps> = (props) => {
  return (
    <FullLoadingWrapper {...props}>
      <div className={`Loading ${props.isBgShow ? 'bg-show' : ''}`} />
      <CircularProgress className="circle-spinner" />
    </FullLoadingWrapper>
  );
};

export { FullLoading };
