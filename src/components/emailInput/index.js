import React, { useState, useEffect } from 'react';
import { CInput } from '@coreui/react';
import * as EmailValidator from "email-validator";
import { 
  noSpaceAtBeginning, 
  fixDoubleSpacing, 
  fixSpacing, 
  noSpaceAtBeginningAndLast
} from 'core/regex';
import { isNotEmptyString } from 'core/helpers'


const EmailInput = ({handleError, isInvalid, innerRef, ...props}) => {
  // input value/state
  const [value, setValue] = useState(props.value);
  // error message
  const [error, setError] = useState('');

  // format input/string
  const fixedText = e => {
    const fixSpaces = e
      .replace(noSpaceAtBeginningAndLast, '')
      .replace(fixDoubleSpacing, ' ')
      .replace(fixSpacing, '');
    return fixSpaces;
  };

  useEffect(() => {
    !isNotEmptyString(value) && setError('This field is required.')
  }, [value])

  useEffect(() => {
    handleError(error)
  }, [error]) /* eslint-disable-line */
  
  // input field onChange handler 
  const handleChange = e => {
    e.target.value.replace(noSpaceAtBeginning, '');
    setValue(e.target.value);
    props.onChange(e);
  };

  // input field onBlur handler
  const handleBlur = e => {
    const isValid = EmailValidator.validate(value);
    const fixedValue = fixedText(value)
    isNotEmptyString(fixedValue) 
    ? isValid
      ? setError('')
      : setError('The email must be a valid email address.')
    : setError('Email Address is required.') 
  };
  return (
    <React.Fragment>
      <CInput
        {...props}
        innerRef={innerRef}
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={isInvalid ? 'border-danger' : ''}
      />
    </React.Fragment>
  );
};

export default EmailInput;
