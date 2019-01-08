import * as React from 'react';

import {classNames} from '@shopify/react-utilities';

import UnstyledLink from '../UnstyledLink';

import * as styles from './Link.scss';

export interface BaseProps {
  /** ID for the link */
  id?: string;
  /** The url to link to */
  url?: string;
  /** The content to display inside link */
  children?: React.ReactNode;
  /** Use for a links that open a different site */
  external?: boolean;
  /** Use for links when inheriting the same color as the surrounding text is more visually appropriate */
  monochrome?: boolean;
  /** Callback when a link is clicked */
  onClick?(): void;
}

export interface Props extends BaseProps {}

export default function Link({
  url,
  children,
  onClick,
  external,
  id,
  monochrome,
}: Props) {
  const className = classNames(styles.Link, monochrome && styles.monochrome);
  return url ? (
    <UnstyledLink
      onClick={onClick}
      className={className}
      url={url}
      external={external}
      id={id}
    >
      {children}
    </UnstyledLink>
  ) : (
    <button type="button" onClick={onClick} className={className} id={id}>
      {children}
    </button>
  );
}
