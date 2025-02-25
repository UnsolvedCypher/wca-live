import React, { Fragment } from 'react';
import { Mutation } from 'react-apollo';

import ErrorSnackbar from '../ErrorSnackbar/ErrorSnackbar';

/* Wrapper around Mutation with common error handling logic. */
const CustomMutation = ({ children, ...props }) => (
  <Mutation {...props}>
    {(...args) => {
      const [, { error }] = args;
      return (
        <Fragment>
          {error && <ErrorSnackbar message="Something went wrong 😔" />}
          {children(...args)}
        </Fragment>
      );
    }}
  </Mutation>
);

export default CustomMutation;
