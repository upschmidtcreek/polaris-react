import * as React from 'react';
import {autobind} from '@shopify/javascript-utilities/decorators';
import {
  addEventListener,
  removeEventListener,
} from '@shopify/javascript-utilities/events';
import {classNames} from '@shopify/react-utilities/styles';
import TextField from '../../../TextField';
import {roundToNearestStepValue} from '../../utilities';

import {Error, Key} from '../../../../types';
import * as styles from './DualThumb.scss';

export interface State {
  valueLower: number;
  valueUpper: number;
  trackWidth: number;
}

export interface Props {
  id: string;
  cssVarPrefix: string;
  value: [number, number];
  min: number;
  max: number;
  step: number;
  output: boolean;
  error?: Error;
  disabled: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  accessibilityInputs?: boolean;
  onChange(value: [number, number], id: string): void;
  onFocus?(): void;
  onBlur?(): void;
}

const THUMB_SIZE = 24;
const OUTPUT_TIP_SIZE = 8;

export default class DualThumb extends React.Component<Props, State> {
  state: State = {
    valueLower: this.props.value[0],
    valueUpper: this.props.value[1],
    trackWidth: 0,
  };

  private track = React.createRef<HTMLDivElement>();
  private thumbLower = React.createRef<HTMLDivElement>();
  private thumbUpper = React.createRef<HTMLDivElement>();

  componentDidMount() {
    const {valueLower, valueUpper} = this.state;
    const {step, min, max} = this.props;
    const valueWithinBoundsLower = keepValueWithinBoundsLower(
      roundToNearestStepValue(valueLower, step),
      valueUpper,
      min,
      step,
    );

    const valueWithinBoundsUpper = keepValueWithinBoundsUpper(
      roundToNearestStepValue(valueUpper, step),
      valueLower,
      max,
      step,
    );

    this.setState({
      valueLower: valueWithinBoundsLower,
      valueUpper: valueWithinBoundsUpper,
    });

    if (this.track.current) {
      this.setState({
        trackWidth: this.track.current.getBoundingClientRect().width,
      });
    }

    if (this.thumbLower.current && !this.props.disabled) {
      addEventListener(
        this.thumbLower.current,
        'mousedown',
        this.handleMouseDownThumbLower,
      );
      addEventListener(
        this.thumbLower.current,
        'keyup',
        this.handleKeypressLower,
      );
    }

    if (this.thumbUpper.current && !this.props.disabled) {
      addEventListener(
        this.thumbUpper.current,
        'mousedown',
        this.handleMouseDownThumbUpper,
      );
      addEventListener(
        this.thumbUpper.current,
        'keyup',
        this.handleKeypressUpper,
      );
    }
  }

  render() {
    const {
      id,
      cssVarPrefix,
      min,
      max,
      step,
      prefix,
      suffix,
      disabled,
      output,
      error,
      accessibilityInputs,
      onFocus,
      onBlur,
    } = this.props;
    const {valueLower, valueUpper} = this.state;

    const idLower = `${id}Lower`;
    const idUpper = `${id}Upper`;

    const describedBy: string[] = [];

    if (error) {
      describedBy.push(`${id}Error`);
    }

    const ariaDescribedBy = describedBy.length
      ? describedBy.join(' ')
      : undefined;

    const classNameTrackWrapper = classNames(
      styles.TrackWrapper,
      error && styles.error,
      disabled && styles.disabled,
    );

    const classNameThumbLower = classNames(
      styles.Thumbs,
      styles.ThumbLower,
      disabled && styles.disabled,
    );
    const classNameThumbUpper = classNames(
      styles.Thumbs,
      styles.ThumbUpper,
      disabled && styles.disabled,
    );

    const classNameAccessibilityInputLower = classNames(
      styles.AccessibilityInputs,
      styles.AccessibilityInputLower,
    );
    const classNameAccessibilityInputUpper = classNames(
      styles.AccessibilityInputs,
      styles.AccessibilityInputUpper,
    );

    const accessibilityPrefixMarkup = accessibilityInputs ? (
      <div className={classNameAccessibilityInputLower}>
        <TextField
          label="Lower value"
          labelHidden
          type="number"
          step={step}
          prefix={prefix}
          suffix={suffix}
          disabled={disabled}
          value={`${valueLower}`}
          onChange={this.handleTextFieldChangeLower}
          onBlur={this.handleTextFieldBlurLower}
        />
      </div>
    ) : null;

    const accessibilitySuffixMarkup = accessibilityInputs ? (
      <div className={classNameAccessibilityInputUpper}>
        <TextField
          label="Upper value"
          labelHidden
          type="number"
          step={step}
          prefix={prefix}
          suffix={suffix}
          disabled={disabled}
          value={`${valueUpper}`}
          onChange={this.handleTextFieldChangeUpper}
          onBlur={this.handleTextFieldBlurUpper}
        />
      </div>
    ) : null;

    const trackWidth = this.state.trackWidth;
    const adjustedTrackWidth = trackWidth - THUMB_SIZE;
    const range = max - min;

    const leftPositionThumbLower = (valueLower / range) * adjustedTrackWidth;
    const leftPositionThumbUpper = (valueUpper / range) * adjustedTrackWidth;

    const classNameOutputLower = classNames(styles.Output, styles.OutputLower);
    const outputMarkupLower =
      !disabled && output ? (
        <output
          htmlFor={idLower}
          className={classNameOutputLower}
          style={{
            left: `calc(${leftPositionThumbLower}px - ${OUTPUT_TIP_SIZE}px)`,
          }}
        >
          <div className={styles.OutputBubble}>
            <span className={styles.OutputText}>{valueLower}</span>
          </div>
        </output>
      ) : null;

    const classNameOutputUpper = classNames(styles.Output, styles.OutputUpper);
    const outputMarkupUpper =
      !disabled && output ? (
        <output
          htmlFor={idUpper}
          className={classNameOutputUpper}
          style={{
            left: `calc(${leftPositionThumbUpper}px - ${OUTPUT_TIP_SIZE}px)`,
          }}
        >
          <div className={styles.OutputBubble}>
            <span className={styles.OutputText}>{valueUpper}</span>
          </div>
        </output>
      ) : null;

    const cssVars = {
      [`${cssVarPrefix}progress-lower`]: `${leftPositionThumbLower +
        THUMB_SIZE / 2}px`,
      [`${cssVarPrefix}progress-upper`]: `${leftPositionThumbUpper +
        THUMB_SIZE / 2}px`,
    };

    return (
      <div className={styles.Wrapper} id={id}>
        <div className={classNameTrackWrapper}>
          <div
            className={styles.Track}
            style={cssVars}
            ref={this.track}
            testID="track"
          />
          <div
            id={idLower}
            testID="thumbLower"
            className={classNameThumbLower}
            ref={this.thumbLower}
            style={{
              left: `${leftPositionThumbLower}px`,
            }}
            role="slider"
            aria-disabled={disabled}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={valueLower}
            aria-invalid={Boolean(error)}
            aria-describedby={ariaDescribedBy}
            tabIndex={1}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {outputMarkupLower}
          <div
            id={idUpper}
            testID="thumbUpper"
            className={classNameThumbUpper}
            ref={this.thumbUpper}
            style={{
              left: `${leftPositionThumbUpper}px`,
            }}
            role="slider"
            aria-disabled={disabled}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={valueUpper}
            aria-invalid={Boolean(error)}
            aria-describedby={ariaDescribedBy}
            tabIndex={1}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {outputMarkupUpper}
        </div>
        <div className={styles.AccessibilityInputsWrapper}>
          {accessibilityPrefixMarkup}
          {accessibilitySuffixMarkup}
        </div>
      </div>
    );
  }

  @autobind
  private handleMouseDownThumbLower() {
    if (this.thumbLower.current) {
      addEventListener(document, 'mousemove', this.handleMouseMoveThumbLower);
      addEventListener(
        document,
        'mouseup',
        () => {
          removeEventListener(
            document,
            'mousemove',
            this.handleMouseMoveThumbLower,
          );
        },
        {once: true},
      );
    }
  }

  @autobind
  private handleMouseMoveThumbLower(event: MouseEvent) {
    if (this.track.current) {
      const {valueUpper} = this.state;
      const {min, max, step} = this.props;
      const clientRect = this.track.current.getBoundingClientRect();

      const relativeX = event.clientX - clientRect.left;

      const percentageOfTrack = relativeX / (clientRect.width - THUMB_SIZE);
      const percentageOfRange = percentageOfTrack * (max - min);

      const steppedPercentageOfRange = roundToNearestStepValue(
        percentageOfRange,
        step,
      );

      const valueWithinBoundsLower = keepValueWithinBoundsLower(
        steppedPercentageOfRange,
        valueUpper,
        min,
        step,
      );
      this.setState(
        {
          valueLower: valueWithinBoundsLower,
        },
        () => {
          this.handleChange();
        },
      );
    }
  }

  @autobind
  private handleMouseDownThumbUpper() {
    if (this.thumbUpper.current) {
      addEventListener(document, 'mousemove', this.handleMouseMoveThumbUpper);
      addEventListener(
        document,
        'mouseup',
        () => {
          removeEventListener(
            document,
            'mousemove',
            this.handleMouseMoveThumbUpper,
          );
        },
        {once: true},
      );
    }
  }

  @autobind
  private handleMouseMoveThumbUpper(event: MouseEvent) {
    if (this.track.current) {
      const {valueLower} = this.state;
      const {min, max, step} = this.props;
      const clientRect = this.track.current.getBoundingClientRect();

      const relativeX = event.clientX - clientRect.left;

      const percentageOfTrack = relativeX / (clientRect.width - THUMB_SIZE);
      const percentageOfRange = percentageOfTrack * (max - min);

      const steppedPercentageOfRange = roundToNearestStepValue(
        percentageOfRange,
        step,
      );

      const valueWithinBoundsUpper = keepValueWithinBoundsUpper(
        steppedPercentageOfRange,
        valueLower,
        max,
        step,
      );
      this.setState(
        {
          valueUpper: valueWithinBoundsUpper,
        },
        () => {
          this.handleChange();
        },
      );
    }
  }

  @autobind
  private handleChange() {
    const {onChange, id} = this.props;
    const {valueLower, valueUpper} = this.state;

    return onChange([valueLower, valueUpper] as [number, number], id);
  }

  @autobind
  private handleTextFieldChangeLower(value: string) {
    this.setState({valueLower: Number(value)});
  }

  @autobind
  private handleTextFieldChangeUpper(value: string) {
    this.setState({valueUpper: Number(value)});
  }

  @autobind
  private handleTextFieldBlurLower() {
    const {valueLower, valueUpper} = this.state;
    const {step, min} = this.props;
    const steppedValue = roundToNearestStepValue(valueLower, step);

    const valueWithinBoundsLower = keepValueWithinBoundsLower(
      steppedValue,
      valueUpper,
      min,
      step,
    );
    this.setState(
      {
        valueLower: valueWithinBoundsLower,
      },
      () => {
        this.handleChange();
      },
    );
  }

  @autobind
  private handleTextFieldBlurUpper() {
    const {step, max} = this.props;
    const {valueUpper, valueLower} = this.state;
    const steppedValue = roundToNearestStepValue(valueUpper, step);

    const valueWithinBoundsUpper = keepValueWithinBoundsUpper(
      steppedValue,
      valueLower,
      max,
      step,
    );
    this.setState(
      {
        valueUpper: valueWithinBoundsUpper,
      },
      () => {
        this.handleChange();
      },
    );
  }

  @autobind
  private handleKeypressLower(event: KeyboardEvent) {
    const {valueLower, valueUpper} = this.state;
    const {step, min} = this.props;
    event.preventDefault();
    event.stopPropagation();

    let newValue = valueLower;

    if (event.keyCode === Key.DownArrow || event.keyCode === Key.LeftArrow) {
      newValue = valueLower - step;
    } else if (
      event.keyCode === Key.UpArrow ||
      event.keyCode === Key.RightArrow
    ) {
      newValue = valueLower + step;
    }

    const valueWithinBoundsLower = keepValueWithinBoundsLower(
      newValue,
      valueUpper,
      min,
      step,
    );

    this.setState(
      {
        valueLower: valueWithinBoundsLower,
      },
      () => {
        this.handleChange();
      },
    );
  }

  @autobind
  private handleKeypressUpper(event: KeyboardEvent) {
    const {valueLower, valueUpper} = this.state;
    const {max, step} = this.props;
    event.preventDefault();
    event.stopPropagation();

    let newValue = valueUpper;

    if (event.keyCode === Key.DownArrow || event.keyCode === Key.LeftArrow) {
      newValue = valueUpper - step;
    } else if (
      event.keyCode === Key.UpArrow ||
      event.keyCode === Key.RightArrow
    ) {
      newValue = valueUpper + step;
    }

    const valueWithinBoundsUpper = keepValueWithinBoundsUpper(
      newValue,
      valueLower,
      max,
      step,
    );

    this.setState(
      {
        valueUpper: valueWithinBoundsUpper,
      },
      () => {
        this.handleChange();
      },
    );

    event.preventDefault();
    event.stopPropagation();
  }
}

function keepValueWithinBoundsLower(
  steppedValue: number,
  valueUpper: number,
  min: number,
  step: number,
) {
  if (steppedValue <= min) {
    return min;
  } else if (steppedValue >= valueUpper) {
    return valueUpper - step;
  } else {
    return steppedValue;
  }
}

function keepValueWithinBoundsUpper(
  steppedValue: number,
  valueLower: number,
  max: number,
  step: number,
) {
  if (steppedValue >= max) {
    return max;
  } else if (steppedValue <= valueLower) {
    return valueLower + step;
  } else {
    return steppedValue;
  }
}
