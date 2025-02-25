import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';

import { toInt } from '../../../../logic/utils';

const CubesField = ({ initialValue, onValue, ...props }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <TextField
      {...props}
      fullWidth
      variant="outlined"
      value={value || ''}
      onChange={event => {
        const newValue = toInt(event.target.value.replace(/\D/g, '')) || 0;
        if (newValue <= 99) setValue(newValue);
      }}
      onBlur={() => {
        onValue(value);
        /* Once we emit the change, reflect the initial state. */
        setValue(initialValue);
      }}
    />
  );
};

export default CubesField;
