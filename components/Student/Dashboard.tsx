import React, { useMemo } from 'react';
import { UserAttempt } from '../../types';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';
import { Activity, Zap, Crosshair, BarChart3, Clock, Target, TrendingUp, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  attempts: UserAttempt[];
}

export const Dashboard: React.FC<DashboardProps> = ({ attempts }) => {
  const stats = useMemo(() => {
    const total = attempts.length;
    const correct = attempts.filter(a => a.isCorrect).length;
    const rate = total > 0 ? (correct / total) * 100 : 0;

    // Cálculo de tempo médio
    const timedAttempts = attempts.filter(a => a.timeSpent !== undefined);
    const totalTime = timedAttempts.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0);
    const avgTimeMs = timedAttempts.length > 0 ? totalTime / timedAttempts.length : 0;
    
    const formatTime = (ms: number) => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
      return `${remainingSeconds}s`;
    };

    // Dados para o Gráfico de Evolução (Média Móvel das últimas 20)
    const evolutionData = attempts.slice(-30).map((a, i) => {
      const window = attempts.slice(0, attempts.indexOf(a) + 1).slice(-10);
      const windowRate = (window.filter(x => x.isCorrect).length / window.length) * 100;
      return {
        name: `Q${i + 1}`,
        taxa: Math.round(windowRate),
      };
    });

    // Distribuição por Disciplina (Top Erros/Acertos)
    const disciplineMap: Record<string, { correct: number; total: number }> = {};
    attempts.forEach(a => {
      if (!disciplineMap[a.discipline]) disciplineMap[a.discipline] = { correct: 0, total: 0 };
      disciplineMap[a.discipline].total++;
      if (a.isCorrect) disciplineMap[a.discipline].correct++;
    });

    const disciplineData = Object.entries(disciplineMap).map(([name, data]) => ({
      name: name.split(' ')[0], // Abrevia o nome
      full: name,
      taxa: Math.round((data.correct / data.total) * 100),
    })).sort((a, b) => b.taxa - a.taxa);

    return { total, correct, rate, avgTime: formatTime(avgTimeMs), evolutionData, disciplineData };
  }, [attempts]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* ── SEÇÃO DE METRICS (HERO) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusBlock 
          icon={<Crosshair />} 
          label="Precisão Geral" 
          value={`${stats.rate.toFixed(1)}%`} 
          color="text-primary"
          insight={stats.rate > 70 ? "Pronto para o combate" : "Reforce o treinamento"}
        />
        <StatusBlock 
          icon={<Zap />} 
          label="Questões Resolvidas" 
          value={stats.total} 
          color="text-cyan-400"
          insight="Volume operacional total"
        />
        <StatusBlock 
          icon={<Clock />} 
          label="Tempo Médio" 
          value={stats.avgTime} 
          color="text-amber-400"
          insight="Velocidade de resposta"
        />
        <StatusBlock 
          icon={<TrendingUp />} 
          label="Tendência Recente" 
          value={stats.evolutionData.length > 0 ? `${stats.evolutionData[stats.evolutionData.length-1].taxa}%` : "---"} 
          color="text-emerald-400"
          insight="Média nas últimas 10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── GRÁFICO DE EVOLUÇÃO ── */}
        <div className="lg:col-span-2 glass-card !bg-white/[0.02] border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-white font-black uppercase italic tracking-tighter text-xl">Curva de Performance</h3>
              <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">Evolução tática das últimas 30 questões</p>
            </div>
            <Activity className="w-6 h-6 text-primary animate-pulse" />
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.evolutionData}>
                <defs>
                  <linearGradient id="colorTaxa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D9FF00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D9FF00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#D9FF00', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="taxa" stroke="#D9FF00" strokeWidth={4} fillOpacity={1} fill="url(#colorTaxa)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── DISTRIBUIÇÃO POR MATÉRIA ── */}
        <div className="glass-card !bg-white/[0.02] border-white/10 p-8 rounded-[2.5rem]">
          <h3 className="text-white font-black uppercase italic tracking-tighter text-xl mb-8 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-cyan-400" /> Domínio por Área
          </h3>
          <div className="space-y-6">
            {stats.disciplineData.slice(0, 5).map((d) => (
              <div key={d.full} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span className="text-white/60">{d.full}</span>
                  <span className={d.taxa > 60 ? "text-primary" : "text-red-500"}>{d.taxa}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${d.taxa > 60 ? 'bg-primary' : 'bg-red-500'}`}
                    style={{ width: `${d.taxa}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── LOG DE ATIVIDADE RECENTE (ESTILO TERMINAL) ── */}
      <div className="glass-card !bg-white/[0.01] border-white/5 p-8 rounded-[2.5rem]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <h3 className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px]">Log de Operações Recentes</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attempts.slice(-6).reverse().map((a, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-all">
              <div className={`p-2 rounded-xl ${a.isCorrect ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                {a.isCorrect ? <Target className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black uppercase text-white truncate">{a.discipline}</p>
                <p className="text-[8px] font-bold text-white/30 uppercase tracking-tighter italic">Status: {a.isCorrect ? 'Sucesso' : 'Neutralizado'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatusBlock = ({ icon, label, value, color, insight }: any) => (
  <div className="glass-card !bg-white/[0.03] border-white/10 p-6 md:p-8 rounded-[2.5rem] group hover:border-primary/50 transition-all flex flex-col gap-4 relative overflow-hidden">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
      {React.cloneElement(icon, { size: 48 })}
    </div>
    <div className={`${color} group-hover:scale-110 transition-transform duration-500 origin-left`}>
      {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</p>
      <p className={`text-4xl font-black italic tracking-tighter text-white`}>{value}</p>
    </div>
    <div className="pt-2 border-t border-white/5">
      <p className="text-[9px] font-bold uppercase tracking-tight text-white/20 italic">{insight}</p>
    </div>
  </div>
);