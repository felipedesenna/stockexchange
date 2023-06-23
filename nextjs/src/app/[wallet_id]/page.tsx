import MyWallet from "../components/MyWallet";

type HomePageProps = {
  params: {
    wallet_id: string;
  }
}

export default async function HomePage({ params }: HomePageProps) {
  return (
    <main className="container mx-auto px-2">
      <article className="format format-invert">
        <h1>Meus investimentos</h1>
      </article>
      <MyWallet wallet_id={params.wallet_id} />
    </main>
  );
}