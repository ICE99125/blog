import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import styles from './index.module.css';

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout>
      <header className={`${clsx('hero', styles.heroBanner)} ${styles.Header}`}>
        <img src="/cover.jpg" className={styles.img} />
        <div className={`container ${styles.wrapper}`}>
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
        </div>
      </header>
    </Layout>
  );
}

