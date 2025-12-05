import { ResumeData } from "../types";

// Helper to generate Markdown
export const generateMarkdown = (data: ResumeData): string => {
  const { personalInfo, skills, experience, projects, education, sectionTitles, selfEvaluation } = data;

  let md = `# ${personalInfo.fullName}\n\n`;
  md += `**${personalInfo.title}**\n\n`;
  
  // Basic Info Line
  const infos = [
      personalInfo.phone,
      personalInfo.email,
      personalInfo.location,
      personalInfo.birthDate ? `出生年月: ${personalInfo.birthDate}` : '',
      personalInfo.yearsOfExperience ? `经验: ${personalInfo.yearsOfExperience}` : '',
      personalInfo.degree ? `学历: ${personalInfo.degree}` : '',
      personalInfo.github ? `GitHub: ${personalInfo.github}` : ''
  ].filter(Boolean);
  
  md += infos.join(' | ') + '\n\n';

  personalInfo.socials.forEach(s => {
    md += `[${s.platform}](${s.url}) `;
  });
  if (personalInfo.socials.length > 0) md += `\n\n`;

  md += `## ${sectionTitles.summary}\n\n${personalInfo.summary}\n\n`;

  md += `## ${sectionTitles.skills}\n\n`;
  skills.forEach(cat => {
    md += `- **${cat.name}**: ${cat.skills.join(', ')}\n`;
  });
  md += `\n`;

  md += `## ${sectionTitles.experience}\n\n`;
  experience.forEach(exp => {
    md += `### ${exp.company} | ${exp.position}\n`;
    md += `*${exp.startDate} - ${exp.current ? '至今' : exp.endDate}*\n\n`;
    exp.highlights.forEach(h => md += `- ${h}\n`);
    md += `\n`;
  });

  md += `## ${sectionTitles.projects}\n\n`;
  projects.forEach(proj => {
    md += `### ${proj.name} ${proj.company ? `@ ${proj.company}` : ''}\n`;
    md += `*技术栈: ${proj.technologies.join(', ')}*\n\n`;
    md += `${proj.description}\n\n`;
    
    if (proj.teamSize) md += `- **团队规模**: ${proj.teamSize}\n`;
    if (proj.content) md += `- **负责内容**: ${proj.content}\n`;
    if (proj.difficulties) md += `- **项目难点**: ${proj.difficulties}\n`;
    if (proj.achievements) md += `- **工作成果**: ${proj.achievements}\n`;
    
    md += `\n`;
    if (proj.link) md += `在线演示: ${proj.link}\n`;
    if (proj.github) md += `项目源码: ${proj.github}\n`;
    md += `\n`;
  });

  md += `## ${sectionTitles.education}\n\n`;
  education.forEach(edu => {
    md += `### ${edu.school}\n`;
    md += `${edu.degree} | ${edu.field} | ${edu.startDate} - ${edu.endDate}\n\n`;
  });
  
  if (selfEvaluation) {
    md += `## ${sectionTitles.selfEvaluation}\n\n${selfEvaluation}\n\n`;
  }

  return md;
};

// Helper to trigger download
export const downloadFile = (filename: string, content: string | Blob, type: string = 'text/plain') => {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// HTML for Word export wrapper
export const generateHTMLForWord = (data: ResumeData): string => {
    const md = generateMarkdown(data);
    
    // Simple conversion for demo purposes - replacing newlines with breaks
    const content = md
        .replace(/^# (.*$)/gim, '<h1 style="font-size: 24pt; color: #333; text-align: center; margin-bottom: 10px;">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 style="font-size: 14pt; color: #2563eb; margin-top: 20px; border-bottom: 1px solid #ccc; padding-bottom: 4px;">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 style="font-size: 11pt; font-weight: bold; margin-top: 15px; color: #333; background-color: #f8f9fa; padding: 4px;">$1</h3>')
        .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
        .replace(/\*(.*)\*/gim, '<i>$1</i>')
        .replace(/^- (.*$)/gim, '<li style="margin-bottom: 4px; margin-left: 20px;">$1</li>')
        .replace(/\n/gim, '<br />');

    return `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>${data.personalInfo.fullName} 简历</title>
            <!-- Define A4 Page Setup for Word -->
            <style>
                @page {
                    size: 21.0cm 29.7cm;
                    margin: 2.0cm 2.0cm 2.0cm 2.0cm;
                    mso-page-orientation: portrait;
                }
                body {
                    font-family: 'Microsoft YaHei', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #fff;
                }
                /* Ensure tables or containers don't overflow */
                div, table {
                    max-width: 100%;
                }
            </style>
        </head>
        <body>
            ${content}
        </body>
        </html>
    `;
};