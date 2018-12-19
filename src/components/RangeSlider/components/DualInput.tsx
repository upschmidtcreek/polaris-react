import * as React from 'react';
import {autobind} from '@shopify/javascript-utilities/decorators';
import {classNames} from '@shopify/react-utilities/styles';
import {
  addEventListener,
  removeEventListener,
} from '@shopify/javascript-utilities/events';
import {invertNumber} from '../RangeSlider';

import {Error} from '../../../types';

import * as styles from '../RangeSlider.scss';

export interface State {
  valueLower: number;
  valueUpper: number;
  mouseDownLower: boolean;
  mouseDownUpper: boolean;
}

interface Props {
  id: string;
  cssVarPrefix: string;
  value: [number, number];
  min: number;
  max: number;
  step?: number;
  output?: boolean;
  error?: Error;
  disabled?: boolean;
  onChange(value: [number, number], id: string): void;
  onFocus?(): void;
  onBlur?(): void;
}

export class DualInput extends React.Component<Props, State> {
  state: State = {
    valueLower: this.props.value[0],
    valueUpper: this.props.value[1],
    mouseDownLower: false,
    mouseDownUpper: false,
  };

  private rail = React.createRef<HTMLDivElement>();
  private lowerThumb = React.createRef<HTMLDivElement>();
  private upperThumb = React.createRef<HTMLDivElement>();

  componentDidMount() {
    if (this.lowerThumb.current) {
      addEventListener(
        this.lowerThumb.current,
        'mousedown',
        this.handleLowerThumbMouseDown.bind(this),
      );

      addEventListener(
        this.lowerThumb.current,
        'mousemove',
        this.handleLowerThumbMouseMove.bind(this),
      );
    }

    if (this.upperThumb.current) {
      addEventListener(
        this.upperThumb.current,
        'mousedown',
        this.handleUpperThumbMouseDown.bind(this),
      );

      addEventListener(
        this.upperThumb.current,
        'mousemove',
        this.handleUpperThumbMouseMove.bind(this),
      );
    }

    addEventListener(document, 'mouseup', this.handleMouseUp.bind(this));
  }

  componentWillUnmount() {
    if (this.lowerThumb.current) {
      removeEventListener(
        this.lowerThumb.current,
        'mousedown',
        this.handleLowerThumbMouseDown.bind(this),
      );

      removeEventListener(
        this.lowerThumb.current,
        'mousemove',
        this.handleLowerThumbMouseMove.bind(this),
      );
    }

    if (this.upperThumb.current) {
      removeEventListener(
        this.upperThumb.current,
        'mousedown',
        this.handleUpperThumbMouseDown.bind(this),
      );

      removeEventListener(
        this.upperThumb.current,
        'mousemove',
        this.handleUpperThumbMouseMove.bind(this),
      );
    }

    removeEventListener(document, 'mouseup', this.handleMouseUp.bind(this));
  }

  render() {
    const {min = 0, max = 100} = this.props;
    const {
      id,
      cssVarPrefix,
      value,
      output,
      error,
      disabled,
      onFocus,
      onBlur,
    } = this.props;

    const {valueLower, valueUpper} = this.state;

    const describedBy: string[] = [];

    const ariaDescribedBy = describedBy.length
      ? describedBy.join(' ')
      : undefined;

    const idLower = `${id}Lower`;
    const idUpper = `${id}Upper`;

    const sliderProgressLower = ((valueLower - min) * 100) / (max - min);
    const sliderProgressUpper = ((valueUpper - min) * 100) / (max - min);

    const cssVars = {
      [`${cssVarPrefix}min`]: min,
      [`${cssVarPrefix}max`]: max,
      [`${cssVarPrefix}current-lower`]: valueLower,
      [`${cssVarPrefix}current-upper`]: valueUpper,
      [`${cssVarPrefix}unselected-lower`]: `${sliderProgressLower - 1}%`,
      [`${cssVarPrefix}selected-lower`]: `${sliderProgressLower}%`,
      [`${cssVarPrefix}selected-upper`]: `${sliderProgressUpper}%`,
      [`${cssVarPrefix}unselected-upper`]: `${sliderProgressUpper + 1}%`,
      [`${cssVarPrefix}output-factor-lower`]: invertNumber(
        (sliderProgressLower - 50) / 100,
      ),
      [`${cssVarPrefix}output-factor-upper`]: invertNumber(
        (sliderProgressUpper - 50) / 100,
      ),
    };

    const classNameOutputLower = classNames(
      styles.Output,
      styles.DualInputLowerOutput,
    );
    const outputLowerMarkup = !disabled &&
      output && (
        <output htmlFor={idLower} className={classNameOutputLower}>
          <div className={styles.OutputBubble}>
            <span className={styles.OutputText}>{valueLower}</span>
          </div>
        </output>
      );

    const classNameOutputUpper = classNames(
      styles.Output,
      styles.DualInputUpperOutput,
    );
    const outputUpperMarkup = !disabled &&
      output && (
        <output htmlFor={idUpper} className={classNameOutputUpper}>
          <div className={styles.OutputBubble}>
            <span className={styles.OutputText}>{valueUpper}</span>
          </div>
        </output>
      );

    const classNameLower = classNames(
      styles.DualInputThumbs,
      styles.DualInputLowerThumb,
    );
    const classNameUpper = classNames(
      styles.DualInputThumbs,
      styles.DualInputUpperThumb,
    );

    return (
      <div className={styles.InputWrapper}>
        <div className={styles.DualInputRail} style={cssVars} ref={this.rail}>
          <div
            className={classNameLower}
            id={idLower}
            ref={this.lowerThumb}
            // role="slider"
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
            className={classNameUpper}
            id={idUpper}
            ref={this.upperThumb}
            // role="slider"
            aria-disabled={disabled}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={valueUpper}
            aria-invalid={Boolean(error)}
            aria-describedby={ariaDescribedBy}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {outputUpperMarkup}
        </div>
      </div>
    );
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
  private handleLowerThumbMouseDown() {
    this.setState({mouseDownLower: true});
  }

  @autobind
  private handleLowerThumbMouseMove(event: React.MouseEvent) {
    if (this.state.mouseDownLower) {
      const {min} = this.props;
      const {valueUpper} = this.state;
      let value = this.calculateThumbValue(event);

      if (value && this.rail.current) {
        if (value < min) {
          value = min;
        }

        if (value >= valueUpper) {
          // value = step ? valueUpper - step : valueUpper - 1;
          value = valueUpper - 1;
        }

        this.setState({valueLower: value});
      }
    }
  }

  @autobind
  private handleUpperThumbMouseDown() {
    this.setState({mouseDownUpper: true});
  }

  @autobind
  private handleUpperThumbMouseMove(event: React.MouseEvent) {
    if (this.state.mouseDownUpper) {
      const {max} = this.props;
      const {valueLower} = this.state;
      let value = this.calculateThumbValue(event);

      if (value && this.rail.current) {
        if (value > max) {
          value = max;
        }

        if (value <= valueLower) {
          // value = step ? valueLower + step : valueLower + 1;
          value = valueLower + 1;
        }

        this.setState({valueUpper: value});
      }
    }
  }

  @autobind
  private handleMouseUp() {
    this.setState({mouseDownUpper: false, mouseDownLower: false});

    this.handleChange();
  }

  @autobind
  private calculateThumbValue(event: React.MouseEvent) {
    if (this.rail.current) {
      // const {max, min, step} = this.props;
      const rail = this.rail.current;
      const railLength = rail.clientWidth;
      const lowerBoundary =
        event.pageX - rail.getBoundingClientRect().left + 12;
      const rawValue = Math.floor((lowerBoundary / railLength) * 100);
      // const rawStep = railLength / (max - min);
      // const adjustedStep = step ? step * rawStep : rawStep;
      // Math.floor(rawValue / adjustedStep) * adjustedStep;

      return rawValue;
    }
  }
}
