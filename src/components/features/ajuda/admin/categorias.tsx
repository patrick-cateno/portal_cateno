import { SectionHeading } from '../section-heading';
import { Callout } from '../callout';

export function Categorias() {
  return (
    <section className="space-y-4">
      <SectionHeading
        id="categorias"
        title="Gestao de Categorias"
        description="Organize as aplicacoes do catalogo por categorias"
      />

      <div className="space-y-6 text-sm leading-relaxed text-neutral-700">
        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Criando e editando categorias
          </h3>
          <p>
            No painel Admin, acesse a secao de categorias. Cada categoria tem um nome e slug unicos.
            Os filtros do catalogo sao gerados automaticamente a partir das categorias cadastradas.
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">Reordenando categorias</h3>
          <p>
            Use drag-and-drop para alterar a ordem de exibicao das categorias no catalogo. Arraste o
            icone de alca ao lado do nome da categoria para reposicionar.
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">Excluindo categorias</h3>
          <Callout variant="warning" title="Restricao">
            Uma categoria so pode ser excluida se nao houver aplicacoes vinculadas a ela. Mova ou
            reclassifique todas as aplicacoes antes de tentar excluir.
          </Callout>
        </div>
      </div>
    </section>
  );
}
