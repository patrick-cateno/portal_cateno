import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

const features = [
  {
    title: 'Quickstart',
    emoji: '🚀',
    description: 'Em 5 minutos seu microsserviço aparece no portal.',
    link: '/docs/getting-started/quickstart',
  },
  {
    title: 'Registrar Microsserviço',
    emoji: '📋',
    description: 'Passo a passo completo com exemplos de código.',
    link: '/docs/integrating/register-microservice',
  },
  {
    title: 'CatIA Tools',
    emoji: '🤖',
    description: 'Exponha seus dados e ações para o assistente de IA.',
    link: '/docs/catia/how-it-works',
  },
  {
    title: 'Referência da API',
    emoji: '📖',
    description: 'Endpoints, schemas e exemplos interativos.',
    link: '/docs/api-reference/applications',
  },
];

function FeatureCard({
  title,
  emoji,
  description,
  link,
}: {
  title: string;
  emoji: string;
  description: string;
  link: string;
}): ReactNode {
  return (
    <Link to={link} className="feature-card">
      <h3>
        {emoji} {title}
      </h3>
      <p>{description}</p>
    </Link>
  );
}

function HomepageHeader(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header
      style={{
        padding: '4rem 0 2rem',
        textAlign: 'center',
      }}
    >
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{siteConfig.title}</h1>
        <p
          style={{
            fontSize: '1.25rem',
            color: 'var(--ifm-color-emphasis-600)',
            maxWidth: 600,
            margin: '0 auto',
          }}
        >
          {siteConfig.tagline}
        </p>
        <div style={{ marginTop: '1.5rem' }}>
          <Link className="button button--primary button--lg" to="/docs/getting-started/quickstart">
            Começar em 5 minutos →
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="Home" description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <div className="container" style={{ padding: '2rem 0 4rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
              maxWidth: 900,
              margin: '0 auto',
            }}
          >
            {features.map((props) => (
              <FeatureCard key={props.title} {...props} />
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
