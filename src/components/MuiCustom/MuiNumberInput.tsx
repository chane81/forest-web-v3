import React, { useState } from 'react';
import NumberFormat from 'react-number-format';
import { TextField, TextFieldProps } from '@material-ui/core';

/** react-number-format custom 컴포넌트 props */
interface NumberFormatCustomProps {
  inputRef: (instance: NumberFormat | null) => void;
  onChange: (event: { target: { name: string; value: string } }) => void;
  format?: string;
  name: string;
}

/** react-number-format custom 컴포넌트 */
const NumberFormatCustom: React.FC<NumberFormatCustomProps> = (props) => {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      format={props.format}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value
          }
        });
      }}
      isNumericString
    />
  );
};

interface INumberProps {
  format?: string;
}

/** MUI 숫자 인풋 컴포넌트 */
const MuiNumberInput: React.FC<TextFieldProps & INumberProps> = (props) => {
  const [isChangedState, setIsChangedState] = useState(false);

  // change 핸들러
  const handleChange = (e) => {
    setIsChangedState(true);

    props.onChange(e);
  };

  return (
    <TextField
      {...props}
      error={isChangedState && props.value?.toString()?.trim() === ''}
      onChange={handleChange}
      InputProps={{
        inputComponent: NumberFormatCustom as any,
        inputProps: { format: props.format }
      }}
      variant="outlined"
    />
  );
};

export { MuiNumberInput };
