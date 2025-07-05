// app/page.tsx o app/(home)/page.tsx

interface MediaPageProps {
    params: {
        id: string;
    };
}

import NavBar from "../../_components/NavBar";
import HeroMediaCard from "../../_components/HeroMediaCard";
import Footer from "../../_components/Footer";

export default async function Media({ params }: MediaPageProps) {
  const { id } = await params;

  return (
    <>
      <NavBar />

      <HeroMediaCard mediaID={id} />

      <Footer />
    </>
  );
}
