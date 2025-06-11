interface TrailerPageProps {
    params: {
        id: string;
    };
}

export default async function TrailerPage({ params }: TrailerPageProps) {
    const { id } = params;

    console.log("ID ricevuto:", id); // tt6548754

    return (
        <>
            <div>
                <h1>Trailer per film: {id}</h1>
            </div>
        </>
    );
}