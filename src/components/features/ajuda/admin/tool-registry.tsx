import { SectionHeading } from '../section-heading';
import { Callout } from '../callout';

export function ToolRegistry() {
  return (
    <section className="space-y-4">
      <SectionHeading
        id="tool-registry"
        title="Tool Registry — Integracoes com CatIA"
        description="Gerencie as tools que o CatIA pode utilizar"
      />

      <div className="space-y-6 text-sm leading-relaxed text-neutral-700">
        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">O que e o Tool Registry</h3>
          <p>
            O Tool Registry lista todas as tools (acoes) que os microsservicos conectados expoe para
            o CatIA. Cada tool corresponde a uma operacao real que o CatIA pode executar em nome do
            usuario.
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Visualizando tools registradas
          </h3>
          <p>
            No painel Admin, acesse <strong>Tool Registry</strong> para ver a lista de tools
            disponiveis. Cada tool exibe: nome, descricao, microsservico de origem, permissao
            necessaria e status (ativa/inativa).
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Ativando e desativando tools
          </h3>
          <p>
            Use o toggle ao lado de cada tool para ativar ou desativar. Tools desativadas nao
            aparecem para o CatIA, mesmo que o microsservico continue expondo-as.
          </p>
          <Callout variant="info" title="Nota">
            As tools sao registradas automaticamente quando um microsservico expoe o endpoint{' '}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">GET /catia/manifest</code>.
            Nao e necessario cadastra-las manualmente.
          </Callout>
        </div>
      </div>
    </section>
  );
}
