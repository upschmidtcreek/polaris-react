import * as React from 'react';
import {createUniqueIDFactory} from '@shopify/javascript-utilities/other';
import {withAppProvider, WithAppProviderProps} from '../AppProvider';
import {Props, RangeSliderValue} from './types';

import {SingleThumb, DualThumb} from './components';

export type CombinedProps = Props & WithAppProviderProps;

const getUniqueID = createUniqueIDFactory('RangeSlider');
const cssVarPrefix = '--Polaris-RangeSlider-';

export function RangeSlider(props: CombinedProps) {
  const {
    id = getUniqueID(),
    min = 0,
    max = 100,
    step = 1,
    value,
    ...rest
  } = props;
  let markup;
  if (isDualThumb(value)) {
    markup = (
      <DualThumb
        id={id}
        value={value}
        cssVarPrefix={cssVarPrefix}
        min={min}
        max={max}
        step={step}
        {...rest}
      />
    );
  } else {
    markup = (
      <SingleThumb
        id={id}
        value={value}
        cssVarPrefix={cssVarPrefix}
        min={min}
        max={max}
        step={step}
        {...rest}
      />
    );
  }

  return markup;
}

function isDualThumb(value: RangeSliderValue): value is [number, number] {
  return Array.isArray(value);
}

export default withAppProvider<Props>()(RangeSlider);
