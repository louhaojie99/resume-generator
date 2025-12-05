import React, { useState, useEffect } from 'react';
import { ResumeData, ATSResult } from './types';
import ResumeForm from './components/ResumeForm';
import ResumePreview from './components/ResumePreview';
import { Download, FileJson, FileText, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { generateMarkdown, generateHTMLForWord, downloadFile } from './utils/exportHelpers';
import { GeminiService } from './services/geminiService';

// Initial Data (Chinese Demo)
const INITIAL_DATA: ResumeData = {
  sectionTitles: {
    summary: '个人总结',
    skills: '专业技能',
    experience: '工作经历',
    projects: '项目经历',
    education: '教育背景',
    selfEvaluation: '个人评价'
  },
  personalInfo: {
    fullName: '张伟',
    title: '高级前端工程师',
    email: 'zhang.wei@example.com',
    phone: '138 0013 8000',
    location: '北京',
    birthDate: '1995.08',
    yearsOfExperience: '5年',
    degree: '本科',
    github: 'github.com/zhangwei-dev',
    summary: '拥有 5 年以上前端开发经验，精通 React 和 Vue 生态系统。擅长构建高性能、可扩展的 Web 应用程序。在微前端架构落地和组件库建设方面有丰富经验。热衷于新技术探索和工程化实践，具备良好的团队领导能力。',
    socials: [
      { platform: '技术博客', url: 'https://juejin.cn/user/zhangwei' }
    ]
  },
  skills: [
    { id: '1', name: '核心技术', skills: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'TypeScript'] },
    { id: '2', name: '前端框架', skills: ['React', 'Vue.js', 'Next.js', 'Tailwind CSS', 'Element Plus'] },
    { id: '3', name: '工程化 & 工具', skills: ['Webpack', 'Vite', 'Git', 'Docker', 'CI/CD', 'Jest'] }
  ],
  experience: [
    {
      id: '1',
      company: '光速科技技术有限公司',
      position: '高级前端工程师',
      startDate: '2021-03',
      endDate: '至今',
      current: true,
      highlights: [
        '主导公司核心 SaaS 平台的重构工作，利用 Webpack 模块联邦技术落地微前端架构，将大型单体应用拆分为 5 个子应用，提升了 40% 的构建速度。',
        '设计并开发企业级通用 UI 组件库，覆盖 50+ 常用组件，被内部 10+ 个项目采用，显著提升了研发效率和 UI 一致性。',
        '负责前端性能优化专项，通过代码分割、资源预加载和长列表优化，将核心页面 LCP 从 2.5s 优化至 1.2s。'
      ]
    },
    {
      id: '2',
      company: '创意互动网络',
      position: '前端开发工程师',
      startDate: '2018-06',
      endDate: '2021-02',
      current: false,
      highlights: [
        '负责多个高流量营销活动页面的开发，使用 Vue.js 和 GSAP 实现复杂的动画交互效果，兼容主流移动端设备。',
        '配合后端工程师完成 API 接口联调，并使用 TypeScript 重构核心业务逻辑，减少了 30% 的线上运行时错误。',
        '参与前端规范制定和代码走查，指导初级工程师解决技术难题。'
      ]
    }
  ],
  projects: [
    {
      id: '1',
      name: '电商数据可视化大屏',
      company: '光速科技',
      description: '为电商大促活动开发的实时数据监控大屏，支持千万级数据量的实时渲染和交互。',
      technologies: ['Vue 3', 'ECharts', 'WebSocket', 'Node.js'],
      link: 'https://demo-datav.com',
      github: 'https://github.com/zhangwei/datav',
      teamSize: '5人',
      content: '负责大屏核心渲染引擎的开发，设计组件通信机制。',
      difficulties: '在大数据量下 ECharts 渲染卡顿，内存泄漏问题严重。',
      achievements: '通过 Canvas 层级优化和数据采样算法，将渲染帧率稳定在 60fps，内存占用降低 40%。'
    }
  ],
  education: [
    {
      id: '1',
      school: '北京理工大学',
      degree: '学士',
      field: '计算机科学与技术',
      startDate: '2014.09',
      endDate: '2018.06'
    }
  ],
  selfEvaluation: '性格开朗，善于沟通，具有良好的团队合作精神。热爱技术，对新事物保持好奇心，有较强的自驱力和学习能力。'
};

const App: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('resumeData');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  
  const [scale, setScale] = useState(0.8);
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAtsModal, setShowAtsModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  useEffect(() => {
    const handleResize = () => {
      // Auto-scale preview based on window width
      const width = window.innerWidth;
      if (width > 1200) setScale(0.85);
      else if (width > 1000) setScale(0.7);
      else setScale(0.5);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleExportPDF = () => {
    const element = document.getElementById('resume-preview');
    if (!element) return;

    // @ts-ignore - html2pdf is loaded via CDN in index.html
    if (window.html2pdf) {
      const opt = {
        margin: [0, 0, 0, 0], // Removed default margins as we control padding in the component
        filename: `${resumeData.personalInfo.fullName}_简历.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save();
    } else {
      alert("PDF 生成库尚未加载，请稍候。");
    }
  };

  const handleExportMD = () => {
    const md = generateMarkdown(resumeData);
    downloadFile(`${resumeData.personalInfo.fullName}_简历.md`, md, 'text/markdown');
  };

  const handleExportWord = () => {
    const html = generateHTMLForWord(resumeData);
    downloadFile(`${resumeData.personalInfo.fullName}_简历.doc`, html, 'application/msword');
  };

  const runATSCheck = async () => {
    setIsAnalyzing(true);
    setShowAtsModal(true);
    const result = await GeminiService.checkATS(resumeData);
    setAtsResult(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      
      {/* Left Sidebar: Editor */}
      <div className="w-1/3 min-w-[420px] bg-white border-r border-gray-200 flex flex-col z-10 shadow-lg">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2 mb-1">
             <div className="bg-blue-600 text-white p-1 rounded font-bold">DR</div>
             <h1 className="text-xl font-bold text-gray-800">DevResume.ai</h1>
          </div>
          <p className="text-xs text-gray-500">前端工程师专用简历生成器</p>
        </div>
        
        <ResumeForm data={resumeData} onChange={setResumeData} />
        
        <div className="p-4 bg-gray-50 border-t border-gray-200">
           <button 
             onClick={runATSCheck}
             className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-md shadow hover:opacity-90 transition-all flex items-center justify-center gap-2 font-medium"
           >
             <CheckCircle size={18} /> AI 简历诊断 (ATS Check)
           </button>
        </div>
      </div>

      {/* Right Area: Preview & Actions */}
      <div className="flex-1 bg-gray-100 relative flex flex-col">
        
        {/* Toolbar */}
        <div className="absolute top-4 right-4 z-20 flex gap-2 no-print">
          <button 
            onClick={handleExportMD}
            className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700 flex items-center gap-2 text-sm"
            title="导出 Markdown"
          >
            <FileJson size={16} /> Markdown
          </button>
          <button 
            onClick={handleExportWord}
            className="bg-blue-700 text-white px-4 py-2 rounded shadow hover:bg-blue-600 flex items-center gap-2 text-sm"
            title="导出 Word"
          >
            <FileText size={16} /> Word
          </button>
          <button 
            onClick={handleExportPDF}
            className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-500 flex items-center gap-2 text-sm"
            title="导出 PDF"
          >
            <Download size={16} /> PDF
          </button>
        </div>

        {/* Preview Container */}
        <div className="flex-1 overflow-auto p-8 custom-scrollbar flex justify-center items-start pt-16">
          <ResumePreview data={resumeData} scale={scale} />
        </div>
      </div>

      {/* ATS Modal */}
      {showAtsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <CheckCircle className="text-purple-600" /> AI 简历诊断结果
              </h2>
              <button onClick={() => setShowAtsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {isAnalyzing ? (
                <div className="text-center py-10">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Gemini 正在分析您的简历关键词和结构...</p>
                </div>
              ) : atsResult ? (
                <div className="space-y-6">
                  {/* Score */}
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-4 text-2xl font-bold ${
                      atsResult.score >= 80 ? 'border-green-500 text-green-700' : 
                      atsResult.score >= 60 ? 'border-yellow-500 text-yellow-700' : 'border-red-500 text-red-700'
                    }`}>
                      {atsResult.score}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">简历评分</p>
                  </div>

                  {/* Missing Keywords */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-500" /> 缺失关键词 (Missing Keywords)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {atsResult.missingKeywords.length > 0 ? (
                        atsResult.missingKeywords.map((kw, i) => (
                          <span key={i} className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded border border-amber-200">
                            {kw}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-green-600">太棒了！没有发现关键技术词缺失。</span>
                      )}
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">优化建议 (Suggestions)</h3>
                    <ul className="space-y-2">
                      {atsResult.suggestions.map((sug, i) => (
                        <li key={i} className="text-sm text-gray-600 flex gap-2">
                          <span className="text-purple-500">•</span> {sug}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-center text-red-500">分析失败，请重试。</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;