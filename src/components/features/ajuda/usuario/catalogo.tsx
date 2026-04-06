import { SectionHeading } from '../section-heading';
import { Callout } from '../callout';

export function Catalogo() {
  return (
    <section className="space-y-4">
      <SectionHeading
        id="catalogo"
        title="Catalogo de Aplicacoes"
        description="Navegue, busque e acesse as aplicacoes disponiveis"
      />

      <div className="space-y-6 text-sm leading-relaxed text-neutral-700">
        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Navegando pelos cards de aplicacoes
          </h3>
          <p>
            O catalogo exibe cada aplicacao como um card com nome, descricao, categoria e status
            atual. Os cards sao organizados por ordem de relevancia e podem ser filtrados por
            categoria ou texto de busca.
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Usando os filtros de categoria
          </h3>
          <p>
            No topo do catalogo, clique nos chips de categoria para filtrar as aplicacoes. Somente
            as aplicacoes da categoria selecionada serao exibidas. Clique novamente para remover o
            filtro.
          </p>
          <Callout variant="tip" title="Dica">
            Voce pode combinar o filtro de categoria com a busca por nome para refinar ainda mais os
            resultados.
          </Callout>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Buscando por nome ou descricao
          </h3>
          <p>
            Use o campo de busca na barra superior para encontrar aplicacoes pelo nome ou descricao.
            A busca e instantanea e atualiza os resultados conforme voce digita.
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Marcando aplicacoes como favoritas
          </h3>
          <p>
            Clique no icone de estrela no canto superior direito de cada card para marcar a
            aplicacao como favorita. Suas aplicacoes favoritas ficam acessiveis rapidamente pelo
            menu lateral em <strong>Favoritos</strong>.
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">Entendendo os status</h3>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" />{' '}
              <strong>Online:</strong> a aplicacao esta funcionando normalmente.
            </li>
            <li>
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />{' '}
              <strong>Manutencao:</strong> a aplicacao esta em manutencao programada.
            </li>
            <li>
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />{' '}
              <strong>Offline:</strong> a aplicacao esta indisponivel no momento.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">Abrindo uma aplicacao</h3>
          <p>
            Clique no card da aplicacao para abri-la. Dependendo da configuracao, ela pode abrir em
            uma nova aba, dentro do portal (embed) ou em uma janela modal.
          </p>
        </div>
      </div>
    </section>
  );
}
