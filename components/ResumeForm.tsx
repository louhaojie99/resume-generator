import React, { useState } from 'react';
import { ResumeData, Experience, Project, SkillCategory, Education } from '../types';
import { Plus, Trash2, Wand2, ChevronDown, ChevronUp, User, Briefcase, Code, GraduationCap, FolderGit2, Settings, UserCheck } from 'lucide-react';
import { GeminiService } from '../services/geminiService';

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ data, onChange }) => {
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [loadingAI, setLoadingAI] = useState<string | null>(null);

  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value }
    });
  };

  const updateSectionTitle = (key: keyof ResumeData['sectionTitles'], value: string) => {
    onChange({
      ...data,
      sectionTitles: { ...data.sectionTitles, [key]: value }
    });
  };

  const handleAISummary = async () => {
    setLoadingAI('summary');
    const skills = data.skills.flatMap(s => s.skills);
    const newSummary = await GeminiService.optimizeSummary(
      data.personalInfo.summary, 
      data.personalInfo.title, 
      skills
    );
    updatePersonalInfo('summary', newSummary);
    setLoadingAI(null);
  };

  const handleAISelfEvaluation = async () => {
    setLoadingAI('selfEval');
    const skills = data.skills.flatMap(s => s.skills);
    // Re-use optimizeSummary logic but maybe we can tweak prompt later. 
    // For now, using a simple optimization.
    const newEval = await GeminiService.optimizeSummary(
      data.selfEvaluation || '', 
      data.personalInfo.title, 
      skills
    );
    onChange({ ...data, selfEvaluation: newEval });
    setLoadingAI(null);
  };

  // --- Experience Handlers ---
  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: '新公司名称',
      position: '职位名称',
      startDate: '2023.01',
      endDate: '至今',
      current: true,
      highlights: ['负责核心业务模块的开发与维护。']
    };
    onChange({ ...data, experience: [newExp, ...data.experience] });
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    const newExp = data.experience.map(e => e.id === id ? { ...e, [field]: value } : e);
    onChange({ ...data, experience: newExp });
  };

  const updateHighlight = (expId: string, index: number, value: string) => {
    const exp = data.experience.find(e => e.id === expId);
    if (!exp) return;
    const newHighlights = [...exp.highlights];
    newHighlights[index] = value;
    updateExperience(expId, 'highlights', newHighlights);
  };

  const addHighlight = (expId: string) => {
    const exp = data.experience.find(e => e.id === expId);
    if (!exp) return;
    updateExperience(expId, 'highlights', [...exp.highlights, '']);
  };

  const removeHighlight = (expId: string, index: number) => {
      const exp = data.experience.find(e => e.id === expId);
      if(!exp) return;
      const newHighlights = exp.highlights.filter((_, i) => i !== index);
      updateExperience(expId, 'highlights', newHighlights);
  }

  const handleAIBullet = async (expId: string, index: number, text: string) => {
    setLoadingAI(`exp-${expId}-${index}`);
    const improved = await GeminiService.improveBulletPoint(text);
    updateHighlight(expId, index, improved);
    setLoadingAI(null);
  };

  // --- Skills Handlers ---
  const updateSkillCategory = (id: string, name: string) => {
    const newSkills = data.skills.map(s => s.id === id ? { ...s, name } : s);
    onChange({ ...data, skills: newSkills });
  };
  
  const updateSkillsList = (id: string, skillsStr: string) => {
      // Split by comma and clean
      const skillsArray = skillsStr.split(/[,,，]/).map(s => s.trim()).filter(s => s); // Support Chinese comma
      const newSkills = data.skills.map(s => s.id === id ? { ...s, skills: skillsArray } : s);
      onChange({...data, skills: newSkills});
  }

  // --- Projects Handlers ---
  const addProject = () => {
      const newProj: Project = {
          id: Date.now().toString(),
          name: '新项目名称',
          description: '项目简述...',
          technologies: ['React', 'TypeScript']
      };
      onChange({ ...data, projects: [newProj, ...data.projects] });
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    const newProjs = data.projects.map(p => p.id === id ? { ...p, [field]: value } : p);
    onChange({ ...data, projects: newProjs });
  };

  const updateProjectTech = (id: string, techStr: string) => {
      const techArray = techStr.split(/[,,，]/).map(t => t.trim()).filter(t => t);
      updateProject(id, 'technologies', techArray);
  };

  // --- Education Handlers ---
  const addEducation = () => {
      const newEdu: Education = {
          id: Date.now().toString(),
          school: '学校名称',
          degree: '本科',
          field: '专业名称',
          startDate: '2015.09',
          endDate: '2019.06'
      };
      onChange({ ...data, education: [...data.education, newEdu] });
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
      const newEdu = data.education.map(e => e.id === id ? { ...e, [field]: value } : e);
      onChange({ ...data, education: newEdu });
  }


  // --- Render Helpers ---
  const SectionHeader = ({ id, title, icon: Icon }: { id: string, title: string, icon: any }) => (
    <button 
      onClick={() => setActiveSection(activeSection === id ? '' : id)}
      className={`w-full flex items-center justify-between p-4 bg-white border-b ${activeSection === id ? 'bg-blue-50 border-blue-200' : ''}`}
    >
      <div className="flex items-center gap-2 font-medium text-gray-700">
        <Icon size={18} />
        {title}
      </div>
      {activeSection === id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
  );

  return (
    <div className="h-full overflow-y-auto bg-gray-100 border-r border-gray-200 custom-scrollbar">
      
      {/* Personal Info */}
      <div className="mb-2">
        <SectionHeader id="personal" title="个人信息 (Personal Info)" icon={User} />
        {activeSection === 'personal' && (
          <div className="p-4 space-y-4 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase">姓名</label>
                <input 
                  type="text" 
                  value={data.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                  className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase">求职意向/职位</label>
                <input 
                  type="text" 
                  value={data.personalInfo.title}
                  onChange={(e) => updatePersonalInfo('title', e.target.value)}
                  className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase">出生年月</label>
                <input 
                  type="text" 
                  value={data.personalInfo.birthDate}
                  onChange={(e) => updatePersonalInfo('birthDate', e.target.value)}
                  placeholder="1995.08"
                  className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase">工作年限</label>
                <input 
                  type="text" 
                  value={data.personalInfo.yearsOfExperience}
                  onChange={(e) => updatePersonalInfo('yearsOfExperience', e.target.value)}
                  placeholder="5年"
                  className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase">联系电话</label>
                <input 
                  type="text" 
                  value={data.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase">电子邮箱</label>
                <input 
                  type="email" 
                  value={data.personalInfo.email}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase">学历</label>
                <input 
                  type="text" 
                  value={data.personalInfo.degree}
                  onChange={(e) => updatePersonalInfo('degree', e.target.value)}
                  placeholder="本科"
                  className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
               <div className="col-span-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase">所在城市</label>
                <input 
                  type="text" 
                  value={data.personalInfo.location}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase">GitHub (可选)</label>
                <input 
                  type="text" 
                  value={data.personalInfo.github}
                  onChange={(e) => updatePersonalInfo('github', e.target.value)}
                  placeholder="github.com/username"
                  className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

             {/* Social Links Management */}
            <div className="mt-2">
               <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">其他链接</label>
               {data.personalInfo.socials.map((social, index) => (
                 <div key={index} className="flex gap-2 mb-2">
                    <input 
                      className="w-1/3 text-sm p-2 border rounded"
                      value={social.platform}
                      onChange={(e) => {
                        const newSocials = [...data.personalInfo.socials];
                        newSocials[index].platform = e.target.value;
                        onChange({ ...data, personalInfo: { ...data.personalInfo, socials: newSocials } });
                      }}
                      placeholder="名称 (博客等)"
                    />
                    <input 
                      className="flex-1 text-sm p-2 border rounded"
                      value={social.url}
                      onChange={(e) => {
                        const newSocials = [...data.personalInfo.socials];
                        newSocials[index].url = e.target.value;
                        onChange({ ...data, personalInfo: { ...data.personalInfo, socials: newSocials } });
                      }}
                      placeholder="URL"
                    />
                    <button 
                      onClick={() => {
                         const newSocials = data.personalInfo.socials.filter((_, i) => i !== index);
                         onChange({ ...data, personalInfo: { ...data.personalInfo, socials: newSocials } });
                      }}
                      className="text-gray-400 hover:text-red-500 p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                 </div>
               ))}
               <button 
                  onClick={() => onChange({ ...data, personalInfo: { ...data.personalInfo, socials: [...data.personalInfo.socials, { platform: '', url: '' }] } })}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
               >
                 <Plus size={12} /> 添加链接
               </button>
            </div>
            
            <hr className="my-4 border-gray-100" />

            {/* Custom Section Title for Summary */}
            <div className="flex justify-between items-center mb-2">
               <input 
                 value={data.sectionTitles.summary}
                 onChange={(e) => updateSectionTitle('summary', e.target.value)}
                 className="font-bold text-gray-700 border-b border-dashed border-gray-300 focus:border-blue-500 outline-none text-sm w-32"
               />
               <button 
                  onClick={handleAISummary}
                  disabled={!!loadingAI}
                  className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                >
                  <Wand2 size={12} />
                  {loadingAI === 'summary' ? 'AI 正在优化...' : 'AI 优化总结'}
                </button>
            </div>
            <div>
              <textarea 
                rows={4}
                value={data.personalInfo.summary}
                onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="mb-2">
        <SectionHeader id="skills" title="技能 (Skills)" icon={Code} />
        {activeSection === 'skills' && (
          <div className="p-4 bg-white space-y-4">
             {/* Section Title Config */}
             <div className="mb-4">
                <label className="text-xs text-gray-400">板块标题</label>
                <input 
                  value={data.sectionTitles.skills}
                  onChange={(e) => updateSectionTitle('skills', e.target.value)}
                  className="block w-full font-bold text-gray-700 border-b border-gray-200 focus:border-blue-500 outline-none py-1"
                />
             </div>

             {data.skills.map((cat) => (
               <div key={cat.id} className="border p-3 rounded bg-gray-50 relative group">
                  <button 
                    onClick={() => onChange({...data, skills: data.skills.filter(s => s.id !== cat.id)})}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="mb-2">
                     <label className="text-xs font-semibold text-gray-500">分类名称</label>
                     <input 
                        className="w-full mt-1 p-1 border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                        value={cat.name}
                        onChange={(e) => updateSkillCategory(cat.id, e.target.value)}
                     />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500">技能列表 (逗号分隔)</label>
                    <textarea 
                        className="w-full mt-1 text-sm p-2 border rounded"
                        rows={2}
                        value={cat.skills.join(', ')}
                        onChange={(e) => updateSkillsList(cat.id, e.target.value)}
                        placeholder="React, TypeScript, Tailwind..."
                    />
                  </div>
               </div>
             ))}
             <button 
                onClick={() => onChange({...data, skills: [...data.skills, {id: Date.now().toString(), name: '新技能分类', skills: []}]})}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
             >
                <Plus size={14} /> 添加技能分类
             </button>
          </div>
        )}
      </div>

      {/* Experience */}
      <div className="mb-2">
        <SectionHeader id="experience" title="工作经历 (Experience)" icon={Briefcase} />
        {activeSection === 'experience' && (
          <div className="p-4 bg-white space-y-6">
            {/* Section Title Config */}
             <div className="mb-2">
                <label className="text-xs text-gray-400">板块标题</label>
                <input 
                  value={data.sectionTitles.experience}
                  onChange={(e) => updateSectionTitle('experience', e.target.value)}
                  className="block w-full font-bold text-gray-700 border-b border-gray-200 focus:border-blue-500 outline-none py-1"
                />
             </div>
            <button 
              onClick={addExperience}
              className="w-full py-2 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              <Plus size={16} /> 添加工作经历
            </button>

            {data.experience.map((exp) => (
              <div key={exp.id} className="border rounded-lg p-4 relative group hover:border-blue-300 transition-colors">
                <button 
                  onClick={() => onChange({...data, experience: data.experience.filter(e => e.id !== exp.id)})}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="col-span-1">
                    <label className="text-xs text-gray-500">公司名称</label>
                    <input 
                        className="w-full font-medium text-gray-800 border-b border-gray-200 focus:border-blue-500 outline-none"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs text-gray-500">职位</label>
                    <input 
                        className="w-full font-medium text-gray-800 border-b border-gray-200 focus:border-blue-500 outline-none"
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 col-span-2">
                    <input 
                      type="text"
                      className="w-full text-sm border p-1 rounded"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                      placeholder="开始时间"
                    />
                    <input 
                      type="text"
                      className="w-full text-sm border p-1 rounded"
                      value={exp.endDate}
                      disabled={exp.current}
                      onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                      placeholder="结束时间"
                    />
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                     <input 
                        type="checkbox" 
                        checked={exp.current}
                        onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                        id={`curr-${exp.id}`}
                     />
                     <label htmlFor={`curr-${exp.id}`} className="text-sm text-gray-600">至今</label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase">工作内容与成就</label>
                  {exp.highlights.map((h, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                      <textarea 
                        className="flex-1 text-sm p-2 border rounded focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                        rows={2}
                        value={h}
                        onChange={(e) => updateHighlight(exp.id, idx, e.target.value)}
                      />
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => handleAIBullet(exp.id, idx, h)}
                          disabled={!!loadingAI}
                          className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                          title="AI 润色"
                        >
                          <Wand2 size={14} />
                        </button>
                        <button 
                          onClick={() => removeHighlight(exp.id, idx)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => addHighlight(exp.id)} className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2">
                    <Plus size={12} /> 添加经历详情
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Projects */}
      <div className="mb-2">
        <SectionHeader id="projects" title="项目经历 (Projects)" icon={FolderGit2} />
        {activeSection === 'projects' && (
          <div className="p-4 bg-white space-y-6">
             {/* Section Title Config */}
             <div className="mb-2">
                <label className="text-xs text-gray-400">板块标题</label>
                <input 
                  value={data.sectionTitles.projects}
                  onChange={(e) => updateSectionTitle('projects', e.target.value)}
                  className="block w-full font-bold text-gray-700 border-b border-gray-200 focus:border-blue-500 outline-none py-1"
                />
             </div>
             <button 
              onClick={addProject}
              className="w-full py-2 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              <Plus size={16} /> 添加项目
            </button>
            {data.projects.map((proj) => (
                <div key={proj.id} className="border rounded-lg p-4 relative group hover:border-blue-300">
                    <button 
                        onClick={() => onChange({...data, projects: data.projects.filter(p => p.id !== proj.id)})}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={16} />
                    </button>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="col-span-1">
                                <label className="text-xs text-gray-500">项目名称</label>
                                <input 
                                    className="w-full font-medium border-b border-gray-200 focus:border-blue-500 outline-none"
                                    value={proj.name}
                                    onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="text-xs text-gray-500">所属公司 (可选)</label>
                                <input 
                                    className="w-full text-sm border-b border-gray-200 focus:border-blue-500 outline-none"
                                    value={proj.company || ''}
                                    onChange={(e) => updateProject(proj.id, 'company', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500">技术栈</label>
                            <input 
                                className="w-full text-sm border-b border-gray-200 focus:border-blue-500 outline-none"
                                value={proj.technologies.join(', ')}
                                onChange={(e) => updateProjectTech(proj.id, e.target.value)}
                            />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                             <div className="col-span-1">
                                <label className="text-xs text-gray-500">团队规模 (可选)</label>
                                <input 
                                    className="w-full text-sm border p-1 rounded"
                                    value={proj.teamSize || ''}
                                    onChange={(e) => updateProject(proj.id, 'teamSize', e.target.value)}
                                    placeholder="例如：5人"
                                />
                             </div>
                             <div className="col-span-2">
                                <label className="text-xs text-gray-500">在线链接/源码 (可选)</label>
                                <div className="flex gap-2">
                                    <input 
                                        className="w-1/2 text-sm border p-1 rounded"
                                        value={proj.link || ''}
                                        onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                                        placeholder="演示 URL"
                                    />
                                    <input 
                                        className="w-1/2 text-sm border p-1 rounded"
                                        value={proj.github || ''}
                                        onChange={(e) => updateProject(proj.id, 'github', e.target.value)}
                                        placeholder="GitHub URL"
                                    />
                                </div>
                             </div>
                        </div>
                        
                        <div>
                             <label className="text-xs text-gray-500 font-bold">项目简述</label>
                             <textarea 
                                className="w-full text-sm p-2 border rounded resize-none mt-1"
                                rows={2}
                                value={proj.description}
                                onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                             />
                        </div>

                        {/* Detailed Optional Fields */}
                        <div className="space-y-2 border-t pt-2 mt-2">
                            <p className="text-xs text-gray-400 font-medium">详细信息 (可选)</p>
                            
                            <div>
                                <label className="text-xs text-gray-500">负责内容</label>
                                <textarea 
                                    className="w-full text-sm p-2 border rounded resize-none"
                                    rows={2}
                                    value={proj.content || ''}
                                    onChange={(e) => updateProject(proj.id, 'content', e.target.value)}
                                    placeholder="描述你在项目中的具体职责..."
                                />
                            </div>
                             <div>
                                <label className="text-xs text-gray-500">项目难点</label>
                                <textarea 
                                    className="w-full text-sm p-2 border rounded resize-none"
                                    rows={2}
                                    value={proj.difficulties || ''}
                                    onChange={(e) => updateProject(proj.id, 'difficulties', e.target.value)}
                                    placeholder="遇到的技术挑战及解决方案..."
                                />
                            </div>
                             <div>
                                <label className="text-xs text-gray-500">工作成果</label>
                                <textarea 
                                    className="w-full text-sm p-2 border rounded resize-none"
                                    rows={2}
                                    value={proj.achievements || ''}
                                    onChange={(e) => updateProject(proj.id, 'achievements', e.target.value)}
                                    placeholder="量化的成果，如性能提升、用户增长..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
          </div>
        )}
      </div>

       {/* Education */}
      <div className="mb-2">
        <SectionHeader id="education" title="教育背景 (Education)" icon={GraduationCap} />
        {activeSection === 'education' && (
          <div className="p-4 bg-white space-y-4">
             {/* Section Title Config */}
             <div className="mb-2">
                <label className="text-xs text-gray-400">板块标题</label>
                <input 
                  value={data.sectionTitles.education}
                  onChange={(e) => updateSectionTitle('education', e.target.value)}
                  className="block w-full font-bold text-gray-700 border-b border-gray-200 focus:border-blue-500 outline-none py-1"
                />
             </div>
             {data.education.map((edu) => (
                 <div key={edu.id} className="border p-3 rounded bg-gray-50 relative group">
                    <button 
                        onClick={() => onChange({...data, education: data.education.filter(e => e.id !== edu.id)})}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={14} />
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                             className="border-b border-transparent focus:border-blue-500 outline-none bg-transparent font-medium"
                             value={edu.school}
                             onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                             placeholder="学校"
                        />
                         <input 
                             className="border-b border-transparent focus:border-blue-500 outline-none bg-transparent"
                             value={edu.degree}
                             onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                             placeholder="学历/学位"
                        />
                         <input 
                             className="border-b border-transparent focus:border-blue-500 outline-none bg-transparent"
                             value={edu.field}
                             onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                             placeholder="专业"
                        />
                        <div className="flex gap-1 text-sm text-gray-500">
                             <input value={edu.startDate} onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)} className="w-16 bg-transparent outline-none" placeholder="开始" />
                             -
                             <input value={edu.endDate} onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)} className="w-16 bg-transparent outline-none" placeholder="结束" />
                        </div>
                    </div>
                 </div>
             ))}
             <button onClick={addEducation} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                <Plus size={14} /> 添加教育经历
             </button>
          </div>
        )}
      </div>

       {/* Self Evaluation */}
      <div className="mb-2">
        <SectionHeader id="selfEvaluation" title="个人评价 (Self Evaluation)" icon={UserCheck} />
        {activeSection === 'selfEvaluation' && (
          <div className="p-4 bg-white space-y-4">
             {/* Section Title Config */}
             <div className="flex justify-between items-center mb-2">
               <input 
                 value={data.sectionTitles.selfEvaluation}
                 onChange={(e) => updateSectionTitle('selfEvaluation', e.target.value)}
                 className="font-bold text-gray-700 border-b border-dashed border-gray-300 focus:border-blue-500 outline-none text-sm w-32"
               />
               <button 
                  onClick={handleAISelfEvaluation}
                  disabled={!!loadingAI}
                  className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                >
                  <Wand2 size={12} />
                  {loadingAI === 'selfEval' ? 'AI 正在优化...' : 'AI 优化评价'}
                </button>
            </div>
             <div>
              <textarea 
                rows={4}
                value={data.selfEvaluation || ''}
                onChange={(e) => onChange({...data, selfEvaluation: e.target.value})}
                placeholder="填写个人评价（可选）..."
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ResumeForm;