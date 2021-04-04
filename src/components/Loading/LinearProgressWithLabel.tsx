import React, { useEffect, useState } from 'react';
import LinearProgress, { LinearProgressProps } from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

/**
 * progress 컴포넌트
 * 참고: dropZone 스토어와 연계해서 쓸 경우 아래와 같은 warning 메시지를 만나게 된다.
 * can't perform a react state update on an unmounted component
 *
 * 위의 warning 대응 코드로 useState, useEffect를 사용하여 처리
 */
const LinearProgressWithLabel = (props: LinearProgressProps & { value: number }) => {
  const [valueState, setValueState] = useState(0);

  useEffect(() => {
    setValueState(props.value);
  }, [props.value]);

  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} value={valueState} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
};

export default LinearProgressWithLabel;
