import { SectionHeading } from '../section-heading';

export function Monitoramento() {
  return (
    <section className="space-y-4">
      <SectionHeading
        id="monitoramento"
        title="Monitoramento"
        description="Acompanhe a saude e disponibilidade das aplicacoes"
      />

      <div className="space-y-6 text-sm leading-relaxed text-neutral-700">
        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Entendendo o Health Checker
          </h3>
          <p>
            O portal verifica automaticamente a saude de cada aplicacao registrada a cada 30
            segundos. Os resultados sao exibidos como indicadores de status nos cards do catalogo e
            no painel Admin.
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">Historico de saude</h3>
          <p>
            No painel Admin, clique em uma aplicacao para ver o historico de saude. O grafico mostra
            o tempo de resposta e a disponibilidade (uptime) nos ultimos 7, 30 ou 90 dias.
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Quando uma aplicacao fica offline
          </h3>
          <ol className="list-inside list-decimal space-y-2">
            <li>Verifique se o servico esta em execucao no ambiente de deploy.</li>
            <li>
              Consulte os logs do microsservico para identificar a causa da indisponibilidade.
            </li>
            <li>
              Se necessario, reinicie o servico via Docker Compose (veja a secao Configuracao).
            </li>
            <li>
              Aguarde o proximo ciclo de health check (ate 30 segundos) para o status atualizar no
              portal.
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
