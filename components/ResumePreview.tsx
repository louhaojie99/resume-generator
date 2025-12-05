import React, { useEffect, useRef, useState } from 'react';
import { ResumeData } from '../types';
import { Github, Globe, Mail, Phone } from 'lucide-react';

interface ResumePreviewProps {
  data: ResumeData;
  scale?: number;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, scale = 1 }) => {
  const { personalInfo, sectionTitles } = data;
  const contentRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(1);

  // Calculate pages based on content height
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Get content height in pixels
        const contentHeight = entry.contentRect.height;
        
        // Calculate the height of one A4 page in pixels based on current width
        // A4 aspect ratio is 210mm / 297mm ~ 0.707
        // We know the width is set to 210mm in CSS
        const contentWidth = entry.contentRect.width;
        // 1mm = contentWidth / 210
        const onePageHeightPx = (contentWidth / 210) * 297;
        
        if (onePageHeightPx > 0) {
          const pages = Math.ceil(contentHeight / onePageHeightPx);
          setTotalPages(Math.max(pages, 1));
        }
      }
    });

    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => observer.disconnect();
  }, [data]);

  const Title = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-lg font-bold border-b-2 border-slate-800 mb-3 pb-1 text-slate-900 mt-5 first:mt-0">
      {children}
    </h2>
  );

  return (
    <div 
      className="origin-top relative"
      style={{ 
        width: '210mm', 
        transform: `scale(${scale})`,
        marginBottom: `${(scale - 1) * 297 * totalPages}mm` // Adjust margin based on scale and total pages
      }}
    >
      {/* Visual Page Break Indicators (Background) */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          height: `${totalPages * 297}mm`,
          backgroundImage: 'linear-gradient(to bottom, transparent 296.5mm, #94a3b8 296.5mm, #94a3b8 297mm)',
          backgroundSize: '100% 297mm'
        }}
      />

      {/* Main Resume Container */}
      <div 
        id="resume-preview" 
        className="bg-white shadow-2xl mx-auto relative z-10"
        style={{ 
          minHeight: `${totalPages * 297}mm`, // Snap to full A4 pages
          fontFamily: '"Microsoft YaHei", "Inter", sans-serif' 
        }}
      >
        <div ref={contentRef} className="p-10 h-full text-slate-800 leading-relaxed">
          
          {/* Modern Header: 2 Columns */}
          <header className="flex justify-between items-start border-b border-slate-300 pb-6 mb-2">
            {/* Left: Name & Title */}
            <div className="flex-1 pr-8">
               <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">{personalInfo.fullName}</h1>
               <p className="text-xl text-blue-800 font-medium mb-3">{personalInfo.title}</p>
               <div className="flex gap-4 text-sm text-slate-600 flex-wrap">
                   {personalInfo.yearsOfExperience && <span>{personalInfo.yearsOfExperience}经验</span>}
                   {personalInfo.degree && <span className="border-l border-slate-300 pl-4">{personalInfo.degree}</span>}
                   {personalInfo.birthDate && <span className="border-l border-slate-300 pl-4">{personalInfo.birthDate}</span>}
                   {personalInfo.location && <span className="border-l border-slate-300 pl-4">{personalInfo.location}</span>}
               </div>
            </div>
            
            {/* Right: Contact & Links - Icons Left Aligned */}
            <div className="text-sm text-slate-700 min-w-[200px] flex flex-col gap-2">
               {personalInfo.phone && (
                 <div className="flex items-center gap-3">
                   <div className="w-5 flex justify-center text-slate-500"><Phone size={16} /></div>
                   <span>{personalInfo.phone}</span>
                 </div>
               )}
               {personalInfo.email && (
                 <div className="flex items-center gap-3">
                   <div className="w-5 flex justify-center text-slate-500"><Mail size={16} /></div>
                   <span>{personalInfo.email}</span>
                 </div>
               )}
               {personalInfo.github && (
                 <div className="flex items-center gap-3">
                   <div className="w-5 flex justify-center text-slate-500"><Github size={16} /></div>
                   <a href={`https://${personalInfo.github.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="hover:text-blue-600 hover:underline">
                     {personalInfo.github.replace(/^https?:\/\//, '')}
                   </a>
                 </div>
               )}
               {personalInfo.socials.map((social, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                     <div className="w-5 flex justify-center text-slate-500"><Globe size={16} /></div>
                     <a href={social.url} target="_blank" rel="noreferrer" className="hover:text-blue-600 hover:underline truncate max-w-[220px]">
                        {social.url.replace(/^https?:\/\//, '')}
                     </a>
                  </div>
               ))}
            </div>
          </header>

          {/* Top-Down Layout Container */}
          <div className="space-y-2">

            {/* Summary */}
            {personalInfo.summary && (
              <section className="break-inside-avoid">
                <Title>{sectionTitles.summary}</Title>
                <p className="text-sm text-slate-800 leading-7 text-justify">
                  {personalInfo.summary}
                </p>
              </section>
            )}

            {/* Skills - Improved Layout */}
            {data.skills.length > 0 && (
              <section className="break-inside-avoid">
                <Title>{sectionTitles.skills}</Title>
                <div className="space-y-2.5">
                  {data.skills.map((cat) => (
                    <div key={cat.id} className="flex items-start text-sm">
                      <div className="w-24 font-bold text-slate-900 shrink-0 pt-0.5">{cat.name}</div>
                      <div className="flex-1 text-slate-700 leading-relaxed border-l border-slate-200 pl-3">
                         {cat.skills.join('、')}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Experience */}
            {data.experience.length > 0 && (
              <section>
                <Title>{sectionTitles.experience}</Title>
                <div className="space-y-6">
                  {data.experience.map((exp) => (
                    <div key={exp.id} className="break-inside-avoid">
                      <div className="flex justify-between items-end mb-1">
                        <h3 className="font-bold text-base text-slate-900">{exp.company}</h3>
                        <span className="text-sm text-slate-500 font-mono">
                          {exp.startDate} – {exp.current ? '至今' : exp.endDate}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-700 mb-2">{exp.position}</div>
                      <ul className="list-disc list-outside ml-4 space-y-1">
                        {exp.highlights.map((bullet, i) => (
                          <li key={i} className="text-sm text-slate-700 pl-1 leading-relaxed">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {data.projects.length > 0 && (
              <section>
                 <Title>{sectionTitles.projects}</Title>
                <div className="space-y-6">
                  {data.projects.map((proj) => (
                    <div key={proj.id} className="relative break-inside-avoid">
                      <div className="flex justify-between items-baseline mb-1">
                        <div className="flex items-baseline gap-3">
                           <h3 className="font-bold text-base text-slate-900">{proj.name}</h3>
                           {proj.company && <span className="text-sm text-slate-500">@{proj.company}</span>}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                           {proj.link && <span className="mr-3">{proj.link}</span>}
                        </div>
                      </div>
                      
                      <div className="text-sm text-slate-800 mb-2 leading-relaxed">
                          {proj.description}
                      </div>

                      <div className="bg-slate-50 p-3 rounded-sm border border-slate-100 text-sm space-y-2">
                          {/* Tech Stack */}
                          {proj.technologies.length > 0 && (
                              <div className="flex gap-2">
                                  <span className="font-bold text-slate-700 shrink-0">技术栈:</span>
                                  <span className="text-slate-600">{proj.technologies.join(', ')}</span>
                              </div>
                          )}
                          
                          {proj.teamSize && (
                               <div className="flex gap-2">
                                  <span className="font-bold text-slate-700 shrink-0">团队规模:</span>
                                  <span className="text-slate-600">{proj.teamSize}</span>
                              </div>
                          )}

                          {proj.content && (
                              <div className="flex gap-2 items-start">
                                  <span className="font-bold text-slate-700 shrink-0">负责内容:</span>
                                  <span className="text-slate-600 leading-relaxed">{proj.content}</span>
                              </div>
                          )}

                          {proj.difficulties && (
                              <div className="flex gap-2 items-start">
                                  <span className="font-bold text-slate-700 shrink-0">项目难点:</span>
                                  <span className="text-slate-600 leading-relaxed">{proj.difficulties}</span>
                              </div>
                          )}

                           {proj.achievements && (
                              <div className="flex gap-2 items-start">
                                  <span className="font-bold text-slate-700 shrink-0">工作成果:</span>
                                  <span className="text-slate-600 leading-relaxed">{proj.achievements}</span>
                              </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {data.education.length > 0 && (
              <section className="break-inside-avoid">
                <Title>{sectionTitles.education}</Title>
                <div className="space-y-3">
                  {data.education.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-baseline border-b border-dashed border-slate-200 pb-2 last:border-0 break-inside-avoid">
                      <div className="flex gap-6 items-baseline">
                          <h3 className="font-bold text-sm text-slate-900">{edu.school}</h3>
                          <span className="text-sm text-slate-700">{edu.field}</span>
                          <span className="text-sm text-slate-700 bg-slate-100 px-2 rounded-sm text-xs py-0.5">{edu.degree}</span>
                      </div>
                      <span className="text-sm text-slate-500 font-mono">{edu.startDate} - {edu.endDate}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

             {/* Self Evaluation */}
             {data.selfEvaluation && (
              <section className="break-inside-avoid">
                <Title>{sectionTitles.selfEvaluation}</Title>
                <p className="text-sm text-slate-800 leading-7 text-justify whitespace-pre-wrap">
                  {data.selfEvaluation}
                </p>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;