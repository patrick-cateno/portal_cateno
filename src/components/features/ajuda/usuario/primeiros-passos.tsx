import { SectionHeading } from '../section-heading';
import { Callout } from '../callout';

export function PrimeirosPassos() {
  return (
    <section className="space-y-4">
      <SectionHeading
        id="primeiros-passos"
        title="Primeiros Passos"
        description="Comece a utilizar o Portal Cateno"
      />

      <div className="space-y-6 text-sm leading-relaxed text-neutral-700">
        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">O que e o Portal Cateno</h3>
          <p>
            O Portal Cateno e a plataforma centralizada que reune todas as aplicacoes e ferramentas
            da Cateno em um unico ponto de acesso. Ao inves de acessar cada sistema separadamente,
            voce encontra tudo organizado por categorias, com busca inteligente e monitoramento de
            status em tempo real.
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">Como fazer login</h3>
          <ol className="list-inside list-decimal space-y-2">
            <li>Acesse o portal pelo endereco fornecido pela equipe de TI.</li>
            <li>
              Clique no botao <strong>&quot;Entrar com Login Cateno&quot;</strong>.
            </li>
            <li>Voce sera redirecionado para a tela de autenticacao (Keycloak).</li>
            <li>Insira suas credenciais corporativas (e-mail e senha).</li>
            <li>Apos a autenticacao, voce sera redirecionado de volta ao portal.</li>
          </ol>
          <Callout variant="tip" title="Dica">
            Se voce ja estiver autenticado em outro sistema Cateno, o login pode ser automatico via
            Single Sign-On (SSO).
          </Callout>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Visao geral da interface
          </h3>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <strong>Barra superior:</strong> logo, alternador de visualizacao (Aplicacoes/CatIA),
              busca, notificacoes e menu do usuario.
            </li>
            <li>
              <strong>Menu lateral:</strong> acesso rapido a Inicio, Favoritos, Suporte e Ajuda.
              Administradores tambem veem o painel Admin.
            </li>
            <li>
              <strong>Area principal:</strong> catalogo de aplicacoes ou interface do CatIA,
              conforme a visualizacao selecionada.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
