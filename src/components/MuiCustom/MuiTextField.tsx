import React, { useState } from 'react';
import { TextField, TextFieldProps } from '@material-ui/core';

/** OUTLINED 박스 */
const MuiTextField: React.FC<TextFieldProps> = (props) => {
  const [isChangedState, setIsChangedState] = useState(false);

  // change 핸들러
  const handleChange = (e) => {
    setIsChangedState(true);

    props.onChange(e);
  };

  return (
    <TextField
      {...props}
      onChange={handleChange}
      error={isChangedState && props.value?.toString()?.trim() === ''}
    />
  );
};

export { MuiTextField };
