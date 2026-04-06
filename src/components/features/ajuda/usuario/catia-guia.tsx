import { SectionHeading } from '../section-heading';
import { Callout } from '../callout';

export function CatiaGuia() {
  return (
    <section className="space-y-4">
      <SectionHeading
        id="catia"
        title="CatIA — Assistente Inteligente"
        description="Converse com a inteligencia artificial do CatIA Super App"
      />

      <div className="space-y-6 text-sm leading-relaxed text-neutral-700">
        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            O que o CatIA pode fazer
          </h3>
          <p>
            O CatIA e o assistente inteligente do CatIA Super App. Ele entende linguagem natural e
            pode executar acoes nos microsservicos conectados ao portal. Voce pode pedir
            informacoes, executar operacoes e navegar entre aplicacoes usando comandos em texto
            livre.
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">Exemplos de perguntas</h3>
          <ul className="space-y-2">
            <li className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-xs">
              &quot;Quais apps de Cartoes estao disponiveis?&quot;
            </li>
            <li className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-xs">
              &quot;Como esta o status do portal?&quot;
            </li>
            <li className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-xs">
              &quot;Abrir Fatura Digital&quot;
            </li>
            <li className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-xs">
              &quot;Quais aplicacoes estao em manutencao?&quot;
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Chips de aplicacao nas respostas
          </h3>
          <p>
            Quando o CatIA menciona uma aplicacao, ela aparece como um chip clicavel na resposta.
            Clique no chip para abrir a aplicacao diretamente.
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">Limitacoes do CatIA</h3>
          <Callout variant="info" title="Importante">
            <ul className="list-inside list-disc space-y-1">
              <li>O CatIA so pode executar acoes que voce tem permissao para realizar.</li>
              <li>
                Ele nao tem acesso a dados sensiveis alem do que as APIs autorizadas fornecem.
              </li>
              <li>
                Respostas podem levar alguns segundos quando envolvem consultas a microsservicos.
              </li>
              <li>Para operacoes criticas, o CatIA pedira confirmacao antes de executar.</li>
            </ul>
          </Callout>
        </div>
      </div>
    </section>
  );
}
