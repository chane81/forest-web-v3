import React, { ReactNode } from 'react';
import { TextField } from '@material-ui/core';

/* props  */
interface IOutlinedBoxProps {
  children?: ReactNode;
  label?: string;
  required?: boolean;
}

/** OUTLINED 박스 */
const OutlinedBox: React.FC<IOutlinedBoxProps> = (props) => {
  const { children, label, required } = props;

  return (
    <TextField
      variant="outlined"
      name="outLineBox"
      required={required}
      label={label}
      multiline
      InputLabelProps={{ shrink: true }}
      InputProps={{
        inputComponent: ({ className }) => <div className={className}>{children}</div>
      }}
    />
  );
};

export { OutlinedBox };
