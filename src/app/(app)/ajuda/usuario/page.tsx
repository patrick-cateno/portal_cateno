import { PrimeirosPassos } from '@/components/features/ajuda/usuario/primeiros-passos';
import { Catalogo } from '@/components/features/ajuda/usuario/catalogo';
import { CatiaGuia } from '@/components/features/ajuda/usuario/catia-guia';
import { Faq } from '@/components/features/ajuda/usuario/faq';

export default function AjudaUsuarioPage() {
  return (
    <div className="space-y-12">
      <PrimeirosPassos />
      <Catalogo />
      <CatiaGuia />
      <Faq />
    </div>
  );
}
