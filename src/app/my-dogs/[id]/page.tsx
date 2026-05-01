import DogProfileContainer from "@/components/my-dogs/DogProfileContainer";

export default function Page({ params }: { params: { id: string } }) {
  return <DogProfileContainer dogId={params.id} />;
}
