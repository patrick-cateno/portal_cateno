import { siteConfig } from '@/config/site';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <main className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-cateno-primary text-4xl font-bold tracking-tight">{siteConfig.name}</h1>
        <p className="max-w-md text-lg text-gray-600">{siteConfig.description}</p>
      </main>
    </div>
  );
}
