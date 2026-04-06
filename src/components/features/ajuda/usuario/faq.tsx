import { SectionHeading } from '../section-heading';
import { Callout } from '../callout';

export function Faq() {
  return (
    <section className="space-y-4">
      <SectionHeading
        id="faq"
        title="Perguntas Frequentes (FAQ)"
        description="Respostas para as duvidas mais comuns"
      />

      <div className="space-y-6 text-sm leading-relaxed text-neutral-700">
        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Nao consigo fazer login — o que faco?
          </h3>
          <ul className="list-inside list-disc space-y-1">
            <li>Verifique se suas credenciais corporativas estao corretas.</li>
            <li>Tente limpar os cookies do navegador e acessar novamente.</li>
            <li>
              Se o problema persistir, entre em contato com a equipe de TI pelo canal de Suporte.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Por que nao vejo todas as aplicacoes?
          </h3>
          <p>
            O portal exibe somente as aplicacoes que voce tem permissao para acessar. As permissoes
            sao gerenciadas pela equipe de administracao com base no seu perfil e funcao. Se
            acredita que deveria ter acesso a uma aplicacao especifica, solicite ao seu gestor ou ao
            administrador do portal.
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            O status de uma aplicacao esta errado, o que fazer?
          </h3>
          <p>
            O status e atualizado automaticamente a cada 30 segundos via health check. Se voce notar
            uma inconsistencia:
          </p>
          <ol className="list-inside list-decimal space-y-1">
            <li>Aguarde alguns segundos e verifique novamente.</li>
            <li>Tente acessar a aplicacao diretamente para confirmar.</li>
            <li>
              Se o problema persistir, reporte pelo canal de <strong>Suporte</strong>.
            </li>
          </ol>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Como reportar um problema?
          </h3>
          <Callout variant="info">
            Acesse a pagina de <strong>Suporte</strong> pelo menu lateral ou envie uma mensagem ao
            CatIA descrevendo o problema. Inclua o maximo de detalhes possivel: qual aplicacao, o
            que estava fazendo e qual erro apareceu.
          </Callout>
        </div>
      </div>
    </section>
  );
}
