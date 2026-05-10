// app/documents/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Récupérer la liste des fichiers
  useEffect(() => {
    const fetchDocuments = async () => {
    const { data, error } = await supabase
        .storage
        .from('admin')
        .list();

    if (error) console.log(error);
    setDocuments(data || []);
    setLoading(false);
    };
    fetchDocuments();
  }, []);


  // 2. Ouvrir le fichier dans un nouvel onglet
  const ouvrirFichier = (nomFichier: string) => {
    const { data } = supabase
      .storage
      .from('admin')
      .getPublicUrl(nomFichier);

    window.open(data.publicUrl, '_blank');
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--gold)' }}>Documents</h1>
      </div>
      {documents.map((doc: any) => (
        <div
          key={doc.id}
          onClick={() => ouvrirFichier(doc.name)}
            className='btn-secondary'
        >
          📄 {doc.name}
        </div>
      ))}
    </div>
  );
}
