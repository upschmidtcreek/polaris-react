import * as React from 'react';
import {autobind} from '@shopify/javascript-utilities/decorators';
import {
  addEventListener,
  removeEventListener,
} from '@shopify/javascript-utilities/events';
import {classNames} from '@shopify/react-utilities/styles';
import TextField from '../../TextField';
import {invertNumber} from '../utilities';

import {Error} from '../../../types';

import * as styles from './DualThumb.scss';

export interface State {
  valueLower: number;
  valueUpper: number;
  accessibilityPrefix: string;
  accessibilitySuffix: string;
}

interface Props {
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

export default class DualThumb extends React.Component<Props, State> {
  state: State = {
    valueLower: this.props.value[0],
    valueUpper: this.props.value[1],
    accessibilityPrefix: `${this.props.value[0]}`,
    accessibilitySuffix: `${this.props.value[1]}`,
  };

  private rail = React.createRef<HTMLDivElement>();
  private thumbLower = React.createRef<HTMLDivElement>();
  private thumbUpper = React.createRef<HTMLDivElement>();

  componentDidMount() {
    if (this.thumbLower.current && !this.props.disabled) {
      addEventListener(
        this.thumbLower.current,
        'mousedown',
        this.handleMouseDownThumbLower,
      );
    }

    if (this.thumbUpper.current && !this.props.disabled) {
      addEventListener(
        this.thumbUpper.current,
        'mousedown',
        this.handleMouseDownThumbUpper,
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

    const ariaDescribedBy = describedBy.length
      ? describedBy.join(' ')
      : undefined;

    const maxCharacters = max.toString().length;
    const fontSize = 16;
    const accessibilityInputMinWidth = 132;
    const accessibilityInputWidth =
      maxCharacters * fontSize + accessibilityInputMinWidth;

    const cssVars = {
      [`${cssVarPrefix}progress-lower`]: `${valueLower + 1}%`,
      [`${cssVarPrefix}progress-upper`]: `${valueUpper + 1}%`,
      [`${cssVarPrefix}output-factor-lower`]: invertNumber(
        (valueLower - 50) / 100,
      ),
      [`${cssVarPrefix}output-factor-upper`]: invertNumber(
        (valueUpper - 50) / 100,
      ),
    };

    const classNameOutputLower = classNames(styles.Output, styles.OutputLower);
    const outputMarkupLower = !disabled &&
      output && (
        <output
          htmlFor={idLower}
          className={classNameOutputLower}
          style={{
            left: `${this.state.valueLower}%`,
          }}
        >
          <div className={styles.OutputBubble}>
            <span className={styles.OutputText}>{valueLower}</span>
          </div>
        </output>
      );

    const classNameOutputUpper = classNames(styles.Output, styles.OutputUpper);
    const outputMarkupUpper = !disabled &&
      output && (
        <output
          htmlFor={idUpper}
          className={classNameOutputUpper}
          style={{
            left: `calc(${this.state.valueUpper}%  - 24px)`,
          }}
        >
          <div className={styles.OutputBubble}>
            <span className={styles.OutputText}>{valueUpper}</span>
          </div>
        </output>
      );

    const classNameTrackWrapper = classNames(
      styles.TrackWrapper,
      error && styles.error,
      disabled && styles.disabled,
    );

    const classNameThumbLower = classNames(
      styles.Thumbs,
      disabled && styles.disabled,
    );
    const classNameThumbUpper = classNames(
      styles.Thumbs,
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
          label=""
          labelHidden
          type="number"
          step={step}
          prefix={prefix}
          suffix={suffix}
          disabled={disabled}
          value={this.state.accessibilityPrefix}
          onChange={this.handleTextFieldChangeLower}
          onBlur={this.handleTextFieldBlurLower}
        />
      </div>
    ) : null;

    const accessibilitySuffixMarkup = accessibilityInputs ? (
      <div className={classNameAccessibilityInputUpper}>
        <TextField
          label=""
          labelHidden
          type="number"
          step={step}
          prefix={prefix}
          suffix={suffix}
          disabled={disabled}
          value={this.state.accessibilitySuffix}
          onChange={this.handleTextFieldChangeUpper}
          onBlur={this.handleTextFieldBlurUpper}
        />
      </div>
    ) : null;

    return (
      <div className={styles.Wrapper}>
        <div className={classNameTrackWrapper}>
          <div className={styles.Track} style={cssVars} ref={this.rail} />
          <div
            id={idLower}
            className={classNameThumbLower}
            ref={this.thumbLower}
            style={{
              left: `${this.state.valueLower}%`,
            }}
            role="slider"
            aria-disabled={disabled}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={valueLower}
            aria-invalid={Boolean(error)}
            aria-describedby={ariaDescribedBy}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {outputMarkupLower}
          <div
            id={idUpper}
            className={classNameThumbUpper}
            ref={this.thumbUpper}
            style={{
              left: `calc(${this.state.valueUpper}% - 24px)`,
            }}
            role="slider"
            aria-disabled={disabled}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={valueLower}
            aria-invalid={Boolean(error)}
            aria-describedby={ariaDescribedBy}
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
    if (this.rail.current) {
      const clientRect = this.rail.current.getBoundingClientRect();

      const relativeX = event.clientX - clientRect.left;

      const percentage = (relativeX / clientRect.width) * 100;

      const steppedPercentage = this.props.step
        ? roundToNearestStepValue(percentage, this.props.step)
        : percentage;

      if (steppedPercentage <= 0) {
        this.setState({valueLower: 0});
      } else if (steppedPercentage >= this.state.valueUpper) {
        const {valueUpper} = this.state;
        const valueLessStep = valueUpper - this.props.step;
        this.setState({valueLower: valueLessStep});
      } else {
        this.setState({valueLower: steppedPercentage}, () => {
          this.handleChange();
        });
      }
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
    if (this.rail.current) {
      const clientRect = this.rail.current.getBoundingClientRect();

      const relativeX = event.clientX - clientRect.left;
      // const thumbWidth = 24;

      const percentage = (relativeX / clientRect.width) * 100;

      const steppedPercentage = this.props.step
        ? roundToNearestStepValue(percentage, this.props.step)
        : percentage;

      if (steppedPercentage >= 100) {
        this.setState({valueUpper: 100});
      } else if (steppedPercentage <= this.state.valueLower) {
        const {valueLower} = this.state;
        const valuePlusStep = valueLower + this.props.step;
        this.setState({valueUpper: valuePlusStep});
      } else {
        this.setState({valueUpper: steppedPercentage}, () => {
          this.handleChange();
        });
      }
    }
  }

  @autobind
  private handleChange() {
    const {onChange} = this.props;

    return onChange(
      [this.state.valueLower, this.state.valueUpper] as [number, number],
      this.props.id,
    );
  }

  @autobind
  private handleTextFieldChangeLower(value: string) {
    this.setState({accessibilityPrefix: value});
  }

  @autobind
  private handleTextFieldChangeUpper(value: string) {
    this.setState({accessibilitySuffix: value});
  }

  @autobind
  private handleTextFieldBlurLower() {
    const steppedValue = roundToNearestStepValue(
      Number(this.state.accessibilityPrefix),
      this.props.step,
    );

    if (steppedValue <= 0) {
      this.setState({valueLower: 100, accessibilityPrefix: '100'});
    } else if (steppedValue >= this.state.valueUpper) {
      const {valueUpper} = this.state;
      const valuePlusStep = valueUpper - this.props.step;
      this.setState({
        valueLower: valuePlusStep,
        accessibilityPrefix: `${valuePlusStep}`,
      });
    } else {
      this.setState({
        valueLower: steppedValue,
        accessibilityPrefix: `${steppedValue}`,
      });
    }
  }

  @autobind
  private handleTextFieldBlurUpper() {
    const steppedValue = roundToNearestStepValue(
      Number(this.state.accessibilitySuffix),
      this.props.step,
    );

    if (steppedValue >= 100) {
      this.setState({valueUpper: 100, accessibilitySuffix: '100'});
    } else if (steppedValue <= this.state.valueLower) {
      const {valueLower} = this.state;
      const valuePlusStep = valueLower + this.props.step;
      this.setState({
        valueUpper: valuePlusStep,
        accessibilitySuffix: `${valuePlusStep}`,
      });
    } else {
      this.setState({
        valueUpper: steppedValue,
        accessibilitySuffix: `${steppedValue}`,
      });
    }
  }
}

function roundToNearestStepValue(value: number, step: number) {
  const intermediateValue = value / step;
  const roundedValue = Math.round(intermediateValue);
  return roundedValue * step;
}
