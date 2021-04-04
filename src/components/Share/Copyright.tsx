import React from 'react';
import Typography from '@material-ui/core/Typography';

const Copyright = () => {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {`Copyrightⓒ${new Date().getFullYear()}. 1983 Inc. All rights reserved.`}
    </Typography>
  );
};

export default Copyright;
