import { SectionHeading } from '../section-heading';
import { Callout } from '../callout';

export function Configuracao() {
  return (
    <section className="space-y-4">
      <SectionHeading
        id="configuracao"
        title="Configuracao do Ambiente"
        description="Variaveis de ambiente, deploy e gerenciamento de usuarios"
      />

      <div className="space-y-6 text-sm leading-relaxed text-neutral-700">
        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Variaveis de ambiente importantes
          </h3>
          <div className="overflow-hidden rounded-lg border border-neutral-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-2 font-semibold text-neutral-900">Variavel</th>
                  <th className="px-4 py-2 font-semibold text-neutral-900">Descricao</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">DATABASE_URL</td>
                  <td className="px-4 py-2">String de conexao com o banco de dados.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">NEXTAUTH_SECRET</td>
                  <td className="px-4 py-2">Chave secreta para criptografia de sessao.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">KEYCLOAK_ISSUER</td>
                  <td className="px-4 py-2">
                    URL do realm Keycloak (ex: https://auth.cateno.com.br/realms/cateno).
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">KEYCLOAK_CLIENT_ID</td>
                  <td className="px-4 py-2">ID do client configurado no Keycloak.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">KEYCLOAK_CLIENT_SECRET</td>
                  <td className="px-4 py-2">Secret do client Keycloak.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Callout variant="warning" title="Seguranca">
            Nunca exponha variaveis de ambiente com secrets no bundle client-side. Apenas variaveis
            com prefixo{' '}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">NEXT_PUBLIC_</code> sao
            acessiveis no navegador.
          </Callout>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Reiniciando servicos via Docker Compose
          </h3>
          <div className="rounded-lg border border-neutral-200 bg-neutral-900 p-4">
            <pre className="text-xs text-neutral-100">
              <code>{`# Reiniciar todos os servicos
docker compose restart

# Reiniciar apenas o portal
docker compose restart portal

# Ver logs em tempo real
docker compose logs -f portal`}</code>
            </pre>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-neutral-900">
            Gerenciamento de usuarios no Keycloak
          </h3>
          <p>
            O gerenciamento de usuarios e roles e feito diretamente no Keycloak. Acesse o console de
            administracao do Keycloak para:
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>Criar e desativar contas de usuario.</li>
            <li>
              Atribuir roles (
              <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">admin</code>,{' '}
              <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">user</code>,{' '}
              <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">viewer</code>).
            </li>
            <li>Configurar politicas de senha e MFA.</li>
            <li>Gerenciar sessoes ativas.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
