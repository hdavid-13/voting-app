// app/results/page.tsx
import { supabase } from '@/lib/supabase'

export default async function ProposalsList() {
  const { data: proposals, error } = await supabase
    .from('proposals')
    .select('*') // On prend tout pour voir ce qui arrive
    .order('created_at', { ascending: false });

  // 1. Si Supabase renvoie une erreur (ex: problème de table ou de RLS)
  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-red-500 font-bold">Erreur de connexion :</h1>
        <pre className="bg-gray-100 p-4 mt-2">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  // 2. Si ça marche, on affiche le JSON brut
  return (
    <div className="p-4">
      <h1 className="text-green-600 font-bold mb-4">Données reçues ({proposals?.length || 0} lignes) :</h1>
      
      {proposals && proposals.length > 0 ? (
        <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto">
          {JSON.stringify(proposals, null, 2)}
        </pre>
      ) : (
        <p className="text-orange-500">La requête a réussi, mais la table est VIDE.</p>
      )}
    </div>
  );
}
