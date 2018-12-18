import * as React from 'react';
import {classNames} from '@shopify/react-utilities/styles';

import Subheading from '../../../Subheading';

import * as styles from '../../Card.scss';

export interface Props {
  title?: React.ReactNode;
  children?: React.ReactNode;
  subdued?: boolean;
  fullWidth?: boolean;
}

export default function Section({children, title, subdued, fullWidth}: Props) {
  const className = classNames(
    styles.Section,
    subdued && styles['Section-subdued'],
    fullWidth && styles['Section-fullWidth'],
  );

  return (
    <div className={className}>
      {renderHeaderContent()}
      {children}
    </div>
  );

  function renderHeaderContent(): React.ReactNode | null {
    if (!title) {
      return null;
    }
    const subHeader = React.isValidElement(title) ? (
      title
    ) : (
      <Subheading>{title}</Subheading>
    );

    return <div className={styles.SectionHeader}>{subHeader}</div>;
  }
}
