import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Play, CheckCircle2, ChevronRight, Award, AlertTriangle } from 'lucide-react';
import { api } from '../../api/client';

export default function TrainingScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [operatorId, setOperatorId] = useState<string>('');
  
  const [trainingData, setTrainingData] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const ops = await api.getOperators();
        if (!ops || ops.length === 0) return;
        const opId = ops[0].operator_id;
        setOperatorId(opId);

        const [progressRes, modulesRes] = await Promise.allSettled([
          api.getTrainingProgress(opId),
          api.getTrainingModules()
        ]);

        if (progressRes.status === 'fulfilled') setTrainingData(progressRes.value);
        if (modulesRes.status === 'fulfilled') setModules(modulesRes.value);

      } catch (err) {
        console.error('Failed to load training data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-[#080A0B] text-[#929A9E] font-mono select-none overflow-hidden">
        <div className="w-12 h-12 rounded-full border-2 border-[#141819] border-t-[#FFCC00] animate-spin mb-6" />
        <p className="text-sm font-bold uppercase tracking-widest text-[#F1F3F4]">LOADING TRAINING RECORDS</p>
      </div>
    );
  }

  const skillProgress = trainingData?.current_skill_progress || 0;
  const recentCompletion = trainingData?.completed_modules?.[0];
  const recModules = trainingData?.recommended_modules || [];

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#080A0B] select-none">
      
      <div className="flex-1 min-h-0 flex flex-col px-8 py-4 lg:py-6 lg:px-12 max-w-[1600px] mx-auto w-full gap-4 lg:gap-6">
        
        {/* UPPER: HEADER & OVERALL PROGRESS */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 shrink-0">
          <div>
            <span className="font-mono text-xs font-bold tracking-widest text-[#929A9E] uppercase flex items-center gap-2">
              <BookOpen size={14} /> OPERATOR TRAINING
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#F1F3F4] tracking-tight mt-2 uppercase">
              SKILL PROGRESS
            </h1>
            <p className="font-mono text-sm tracking-widest text-[#FFCC00] mt-3 uppercase">
              {trainingData?.certifications_held?.length || 0} ACTIVE CERTIFICATIONS
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-6xl lg:text-7xl font-extrabold text-[#F1F3F4] tracking-tighter">
                  {skillProgress}
                </span>
                <span className="text-3xl text-[#929A9E] font-medium">%</span>
              </div>
              <span className="font-mono text-sm tracking-widest text-[#929A9E] uppercase">
                OVERALL COMPETENCY
              </span>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-[#141819] shrink-0" />

        {/* MIDDLE / LOWER: CONTENT REGION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 flex-1 min-h-0 items-start mt-2">
          
          {/* LEFT: RECOMMENDED & IN PROGRESS */}
          <div className="flex flex-col gap-6 h-full min-h-0 pr-2">
            <span className="font-mono text-xs tracking-widest text-[#5E676C] uppercase font-bold">
              UPCOMING & RECOMMENDED
            </span>

            <div className="flex flex-col gap-4 overflow-y-auto scrollbar-thin">
              {recModules.length > 0 ? (
                recModules.map((mod: any, idx: number) => (
                  <div key={idx} className="flex flex-col border border-[#141819] p-4 group hover:border-[#5E676C] transition-colors cursor-pointer bg-[#0D1011]">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-mono text-sm font-bold text-[#F1F3F4] uppercase tracking-widest">
                        {mod.module_name}
                      </span>
                      <span className="font-mono text-[10px] bg-[#141819] text-[#929A9E] px-2 py-1 uppercase font-bold">
                        {mod.priority_score > 80 ? 'HIGH PRIORITY' : 'RECOMMENDED'}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[#929A9E] uppercase mb-4 line-clamp-2">
                      {mod.reason}
                    </span>
                    <div className="mt-auto flex items-center justify-between text-[#5E676C]">
                      <span className="font-mono text-[10px] tracking-widest uppercase">Est. 15 MIN</span>
                      <div className="font-mono text-[10px] font-bold tracking-widest text-[#FFCC00] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={10} />
                        <span>START</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center p-8 border border-[#141819] border-dashed">
                  <span className="font-mono text-sm text-[#5E676C] tracking-widest uppercase font-bold">
                    ALL MODULES COMPLETE
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: RECENT HISTORY & CERTS */}
          <div className="flex flex-col gap-6 h-full min-h-0">
            <div className="flex flex-col flex-1 min-h-0 border border-[#141819] p-6 bg-[#0D1011]">
              <div className="flex items-center gap-2 mb-6">
                <Award size={16} className="text-[#42C76A]" />
                <span className="font-mono text-xs tracking-widest text-[#F1F3F4] uppercase font-bold">
                  RECENTLY COMPLETED
                </span>
              </div>
              
              {recentCompletion ? (
                <div className="flex flex-col gap-2 border-b border-[#141819] pb-4 mb-4">
                  <span className="font-mono text-sm font-bold text-[#42C76A] uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={14} /> {recentCompletion.module_name}
                  </span>
                  <span className="font-mono text-xs text-[#929A9E] uppercase">
                    Completed: {new Date(recentCompletion.completed_at).toLocaleDateString()}
                  </span>
                  <span className="font-mono text-xs text-[#5E676C] uppercase">
                    Score: {recentCompletion.score}%
                  </span>
                </div>
              ) : (
                <span className="font-mono text-xs text-[#5E676C] uppercase tracking-widest mb-6">NO RECENT HISTORY</span>
              )}

              <span className="font-mono text-xs tracking-widest text-[#5E676C] uppercase font-bold mb-4 mt-2">
                ACTIVE CERTIFICATIONS
              </span>
              <div className="flex flex-col gap-3">
                {trainingData?.certifications_held?.map((cert: string, idx: number) => (
                  <div key={idx} className="flex justify-between items-center font-mono text-xs tracking-widest uppercase">
                    <span className="text-[#F1F3F4] font-bold">{cert}</span>
                    <span className="text-[#42C76A]">VALID</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contextual Action */}
            <div className="mt-auto flex justify-end shrink-0">
              <button 
                onClick={() => navigate('/assist?question=' + encodeURIComponent('What specific skills should I focus on to improve my operator competency score?'), { state: { autoSubmit: true } })}
                className="group flex flex-col items-end gap-1 cursor-pointer outline-none"
              >
                <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-[#FFCC00]">
                  <span>✦ ASK ASSIST</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">→</span>
                </div>
                <span className="font-mono text-sm tracking-widest text-[#929A9E] group-hover:text-[#F1F3F4] transition-colors uppercase">
                  How can I improve my skill level?
                </span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
