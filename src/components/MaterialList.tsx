import React, { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';

interface Material {
  id: string;
  textbookTitle: string;
  lessonMd: string;
  teacherNotesMd: string;
  studentNotesMd: string;
  quizJson: any;
  flashcardsJson: any;
  slidesJson: any;
  voiceScriptMd: string;
  metadataJson: any;
}

export const MaterialList: React.FC<{ grade: string; syllabus: string }> = ({ grade, syllabus }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/materials/list?grade=${encodeURIComponent(grade)}&syllabus=${encodeURIComponent(syllabus)}`);
        const data = await response.json();
        setMaterials(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching materials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [grade, syllabus]);

  if (loading) return <div className="text-white">Loading materials...</div>;

  return (
    <div className="space-y-4">
      {materials.map(material => (
        <div key={material.id} className="p-4 bg-slate-800 rounded-lg flex justify-between items-center">
          <span className="text-white font-medium">{material.textbookTitle}</span>
          <button 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
            onClick={() => {
                // Simple download trigger
                const blob = new Blob([JSON.stringify(material, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${material.textbookTitle.replace(/\s+/g, '_')}_materials.json`;
                a.click();
            }}
          >
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      ))}
    </div>
  );
};
