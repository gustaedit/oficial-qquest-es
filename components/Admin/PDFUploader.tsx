
import React, { useState } from 'react';
import { FileText, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
// Fix: Import aiService instead of non-existent named export processPDFQuestions
import { aiService } from '../../services/ai';
import { Question, Tags } from '../../types';

interface PDFUploaderProps {
  tags: Tags;
  onQuestionsExtracted: (questions: Question[]) => void;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ tags, onQuestionsExtracted }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [board, setBoard] = useState(tags.boards[0]);
  const [institution, setInstitution] = useState(tags.institutions[0]);
  const [year, setYear] = useState(tags.years[0]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        // Fix: Call aiService.processPDF instead of processPDFQuestions
        const questions = await aiService.processPDF(base64, board, institution, year);
        onQuestionsExtracted(questions);
        setFile(null);
        alert(`${questions.length} questões extraídas e indexadas com sucesso!`);
      };
    } catch (error) {
      console.error(error);
      alert('Erro ao processar PDF. Verifique sua chave API e o formato do arquivo.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="mb-10 text-center">
        <h3 className="text-2xl font-black uppercase tracking-widest italic flex items-center justify-center gap-3">
          <FileText className="text-cyan-400 w-8 h-8" /> Processador PDF Inteligente
        </h3>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">Extração em lote via Visão Computacional Gemini</p>
      </div>

      <div className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Banca da Prova</label>
            <select value={board} onChange={(e) => setBoard(e.target.value)} className="w-full bg-black/50 border border-white/10 p-3 text-xs font-bold uppercase tracking-widest text-white">
              {tags.boards.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Órgão</label>
            <select value={institution} onChange={(e) => setInstitution(e.target.value)} className="w-full bg-black/50 border border-white/10 p-3 text-xs font-bold uppercase tracking-widest text-white">
              {tags.institutions.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Ano</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full bg-black/50 border border-white/10 p-3 text-xs font-bold uppercase tracking-widest text-white">
              {tags.years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className={`relative border-2 border-dashed rounded-xl p-12 transition-all flex flex-col items-center justify-center gap-4 ${file ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/10 hover:border-white/20'}`}>
          <input type="file" accept="application/pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
          {file ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-cyan-400" />
              <div className="text-center">
                <p className="text-sm font-bold text-white">{file.name}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Clique para alterar o arquivo</p>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-white/20" />
              <div className="text-center">
                <p className="text-sm font-bold text-white/60">Arraste ou selecione o PDF da prova</p>
                <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">Formatos suportados: .pdf</p>
              </div>
            </>
          )}
        </div>

        <button 
          onClick={handleUpload}
          disabled={!file || isProcessing}
          className="w-full py-5 bg-cyan-500 text-black font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-3"
        >
          {isProcessing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Analisando Documento...</>
          ) : (
            <><Upload className="w-5 h-5" /> Iniciar Processamento</>
          )}
        </button>

        <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-lg">
          <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wider">
            A IA analisará o layout da prova, extrairá enunciados, alternativas e gabaritos automaticamente. Revise as questões no banco após o processo.
          </p>
        </div>
      </div>
    </div>
  );
};
