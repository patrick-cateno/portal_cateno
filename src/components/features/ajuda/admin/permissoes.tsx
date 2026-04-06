import { SectionHeading } from '../section-heading';

export function Permissoes() {
  return (
    <section className="space-y-4">
      <SectionHeading
        id="permissoes"
        title="Gestao de Permissoes"
        description="Controle quem pode ver e executar cada aplicacao"
      />

      <div className="space-y-6 text-sm leading-relaxed text-neutral-700">
        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">Diferenca entre roles</h3>
          <div className="overflow-hidden rounded-lg border border-neutral-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-2 font-semibold text-neutral-900">Role</th>
                  <th className="px-4 py-2 font-semibold text-neutral-900">Descricao</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">admin</td>
                  <td className="px-4 py-2">
                    Acesso total: gerencia aplicacoes, categorias, permissoes, tools e
                    configuracoes.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">user</td>
                  <td className="px-4 py-2">
                    Acessa aplicacoes autorizadas, usa o CatIA, marca favoritos.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">viewer</td>
                  <td className="px-4 py-2">
                    Acesso somente leitura. Pode visualizar aplicacoes concedidas individualmente.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Concedendo acesso granular
          </h3>
          <p>
            Para usuarios com role{' '}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">viewer</code>, voce pode
            conceder acesso individual a aplicacoes especificas. No painel Admin, selecione o
            usuario e marque as aplicacoes que ele podera visualizar ou executar.
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Verificando permissoes de um usuario
          </h3>
          <p>
            No painel Admin, busque o usuario pelo nome ou e-mail. A pagina de detalhes mostra todas
            as aplicacoes que o usuario pode acessar, com indicacao de permissao de visualizacao e
            execucao.
          </p>
        </div>
      </div>
    </section>
  );
}
