import { SectionHeading } from '../section-heading';
import { Callout } from '../callout';

export function Aplicacoes() {
  return (
    <section className="space-y-4">
      <SectionHeading
        id="aplicacoes"
        title="Gestao de Aplicacoes"
        description="Cadastre, edite e gerencie as aplicacoes do portal"
      />

      <div className="space-y-6 text-sm leading-relaxed text-neutral-700">
        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Acessando o painel de administracao
          </h3>
          <p>
            No menu lateral, clique em <strong>Admin</strong> para acessar o painel de
            administracao. Este item so e visivel para usuarios com role{' '}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">admin</code>.
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Criando uma nova aplicacao
          </h3>
          <p>No painel Admin, clique em &quot;Nova Aplicacao&quot; e preencha os campos:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <strong>Nome:</strong> nome de exibicao da aplicacao.
            </li>
            <li>
              <strong>Slug:</strong> identificador unico e permanente (nao pode ser alterado apos a
              criacao).
            </li>
            <li>
              <strong>Descricao:</strong> texto descritivo exibido no card.
            </li>
            <li>
              <strong>Categoria:</strong> classificacao para filtros do catalogo.
            </li>
            <li>
              <strong>Tipo de integracao:</strong> como a aplicacao sera aberta.
            </li>
            <li>
              <strong>URL do frontend:</strong> endereco da aplicacao (obrigatorio para redirect e
              embed).
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">Tipos de integracao</h3>
          <div className="overflow-hidden rounded-lg border border-neutral-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-2 font-semibold text-neutral-900">Tipo</th>
                  <th className="px-4 py-2 font-semibold text-neutral-900">Comportamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">redirect</td>
                  <td className="px-4 py-2">
                    Redireciona o navegador para a URL do frontend da aplicacao.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">embed</td>
                  <td className="px-4 py-2">Renderiza a aplicacao dentro do portal via iframe.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">modal</td>
                  <td className="px-4 py-2">
                    Consulta a API e exibe dados inline em janela modal.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Editando e arquivando aplicacoes
          </h3>
          <p>
            No painel Admin, clique no icone de edicao ao lado da aplicacao para alterar suas
            informacoes. Para remover uma aplicacao do catalogo sem excluir permanentemente, use a
            opcao <strong>Arquivar</strong>.
          </p>
          <Callout variant="warning" title="Atencao">
            O slug de uma aplicacao nunca pode ser alterado apos o registro. Certifique-se de que
            esta correto antes de salvar.
          </Callout>
        </div>
      </div>
    </section>
  );
}
