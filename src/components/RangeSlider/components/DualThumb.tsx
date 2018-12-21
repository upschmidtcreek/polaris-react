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
  private lowerThumb = React.createRef<HTMLDivElement>();
  private upperThumb = React.createRef<HTMLDivElement>();

  componentDidMount() {
    if (this.lowerThumb.current && !this.props.disabled) {
      addEventListener(
        this.lowerThumb.current,
        'mousedown',
        this.handleLowerThumbMouseDown,
      );
    }

    if (this.upperThumb.current && !this.props.disabled) {
      addEventListener(
        this.upperThumb.current,
        'mousedown',
        this.handleUpperThumbMouseDown,
      );
    }
  }

  render() {
    const {
      id,
      cssVarPrefix,
      min,
      max,
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
    const outputLowerMarkup = !disabled &&
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
    const outputUpperMarkup = !disabled &&
      output && (
        <output
          htmlFor={idUpper}
          className={classNameOutputUpper}
          style={{
            left: `${this.state.valueUpper}%`,
          }}
        >
          <div className={styles.OutputBubble}>
            <span className={styles.OutputText}>{valueUpper}</span>
          </div>
        </output>
      );

    const classNameWrapper = classNames(
      styles.Wrapper,
      error && styles.error,
      disabled && styles.disabled,
    );

    const classNameLowerThumb = classNames(
      styles.Thumbs,
      styles.LowerThumb,
      disabled && styles.disabled,
    );
    const classNameUpperThumb = classNames(
      styles.Thumbs,
      styles.UpperThumb,
      disabled && styles.disabled,
    );

    const prefixMarkup = accessibilityInputs ? (
      <div className={styles.PrefixSuffix}>
        <TextField
          label=""
          labelHidden
          value={this.state.accessibilityPrefix}
          onChange={this.handleTextFieldChangeLower}
          onBlur={this.handleTextFieldBlurLower}
        />
      </div>
    ) : null;

    const suffixMarkup = accessibilityInputs ? (
      <div className={styles.PrefixSuffix}>
        <TextField
          label=""
          labelHidden
          value={this.state.accessibilitySuffix}
          onChange={this.handleTextFieldChangeUpper}
          onBlur={this.handleTextFieldBlurUpper}
        />
      </div>
    ) : null;

    return (
      <div className={styles.PrefixSuffixWrapper}>
        {prefixMarkup}
        <div className={classNameWrapper}>
          <div className={styles.Track} style={cssVars} ref={this.rail} />
          <div
            id={idLower}
            className={classNameLowerThumb}
            ref={this.lowerThumb}
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
          {outputLowerMarkup}
          <div
            id={idUpper}
            className={classNameUpperThumb}
            ref={this.upperThumb}
            style={{
              left: `${this.state.valueUpper}%`,
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
          {outputUpperMarkup}
        </div>
        {suffixMarkup}
      </div>
    );
  }

  @autobind
  private handleLowerThumbMouseDown() {
    if (this.lowerThumb.current) {
      addEventListener(document, 'mousemove', this.handleLowerThumbMouseMove);
      addEventListener(
        document,
        'mouseup',
        () => {
          removeEventListener(
            document,
            'mousemove',
            this.handleLowerThumbMouseMove,
          );
        },
        {once: true},
      );
    }
  }

  @autobind
  private handleLowerThumbMouseMove(event: MouseEvent) {
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
  private handleUpperThumbMouseDown() {
    if (this.upperThumb.current) {
      addEventListener(document, 'mousemove', this.handleUpperThumbMouseMove);
      addEventListener(
        document,
        'mouseup',
        () => {
          removeEventListener(
            document,
            'mousemove',
            this.handleUpperThumbMouseMove,
          );
        },
        {once: true},
      );
    }
  }

  @autobind
  private handleUpperThumbMouseMove(event: MouseEvent) {
    if (this.rail.current) {
      const clientRect = this.rail.current.getBoundingClientRect();

      const relativeX = event.clientX - clientRect.left;

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
