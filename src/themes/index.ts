export interface ThemeDefinition {
  id: string;
  name: string;
  css: string;
}

const orangeHeartCSS = `
.preview-theme {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 15px; line-height: 1.8; color: #333; padding: 20px;
}
.preview-theme h1 { font-size: 1.8em; text-align: center; color: #e67e22; margin: 1.2em 0 1em; font-weight: 700; }
.preview-theme h2 { font-size: 1.4em; color: #e67e22; border-bottom: 2px solid #e67e22; padding-bottom: 6px; margin: 1.5em 0 0.8em; }
.preview-theme h3 { font-size: 1.2em; color: #e67e22; margin: 1.2em 0 0.6em; }
.preview-theme h4, .preview-theme h5, .preview-theme h6 { color: #e67e22; margin: 1em 0 0.5em; }
.preview-theme p { margin: 0.8em 0; text-align: justify; }
.preview-theme strong { color: #e67e22; }
.preview-theme em { font-style: italic; }
.preview-theme del { color: #999; }
.preview-theme blockquote { border-left: 4px solid #e67e22; background: #fef5e7; padding: 10px 15px; margin: 1em 0; color: #555; }
.preview-theme ul, .preview-theme ol { padding-left: 2em; margin: 0.8em 0; }
.preview-theme li { margin: 0.3em 0; }
.preview-theme code { background: #fef5e7; color: #e67e22; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
.preview-theme pre { background: #282c34; border-radius: 5px; padding: 16px; overflow-x: auto; margin: 1em 0; }
.preview-theme pre code { background: none; color: #abb2bf; padding: 0; }
.preview-theme table { width: 100%; border-collapse: collapse; margin: 1em 0; }
.preview-theme th { background: #e67e22; color: #fff; padding: 8px 12px; text-align: left; }
.preview-theme td { border: 1px solid #ddd; padding: 8px 12px; }
.preview-theme tr:nth-child(even) { background: #fef5e7; }
.preview-theme img { max-width: 100%; border-radius: 4px; margin: 0.5em auto; display: block; }
.preview-theme a { color: #e67e22; text-decoration: none; border-bottom: 1px solid #e67e22; }
.preview-theme hr { border: none; border-top: 2px solid #e67e22; margin: 1.5em 0; }
`;
const purpleCSS = `
.preview-theme { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 15px; line-height: 1.8; color: #333; padding: 20px; }
.preview-theme h1 { font-size: 1.8em; text-align: center; color: #8e44ad; margin: 1.2em 0 1em; font-weight: 700; }
.preview-theme h2 { font-size: 1.4em; color: #8e44ad; border-bottom: 2px solid #8e44ad; padding-bottom: 6px; margin: 1.5em 0 0.8em; }
.preview-theme h3 { font-size: 1.2em; color: #8e44ad; margin: 1.2em 0 0.6em; }
.preview-theme h4, .preview-theme h5, .preview-theme h6 { color: #8e44ad; margin: 1em 0 0.5em; }
.preview-theme p { margin: 0.8em 0; text-align: justify; }
.preview-theme strong { color: #8e44ad; }
.preview-theme em { font-style: italic; }
.preview-theme del { color: #999; }
.preview-theme blockquote { border-left: 4px solid #8e44ad; background: #f5eef8; padding: 10px 15px; margin: 1em 0; color: #555; }
.preview-theme ul, .preview-theme ol { padding-left: 2em; margin: 0.8em 0; }
.preview-theme li { margin: 0.3em 0; }
.preview-theme code { background: #f5eef8; color: #8e44ad; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
.preview-theme pre { background: #282c34; border-radius: 5px; padding: 16px; overflow-x: auto; margin: 1em 0; }
.preview-theme pre code { background: none; color: #abb2bf; padding: 0; }
.preview-theme table { width: 100%; border-collapse: collapse; margin: 1em 0; }
.preview-theme th { background: #8e44ad; color: #fff; padding: 8px 12px; text-align: left; }
.preview-theme td { border: 1px solid #ddd; padding: 8px 12px; }
.preview-theme tr:nth-child(even) { background: #f5eef8; }
.preview-theme img { max-width: 100%; border-radius: 4px; margin: 0.5em auto; display: block; }
.preview-theme a { color: #8e44ad; text-decoration: none; border-bottom: 1px solid #8e44ad; }
.preview-theme hr { border: none; border-top: 2px solid #8e44ad; margin: 1.5em 0; }
`;
const greenCSS = `
.preview-theme { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 15px; line-height: 1.8; color: #333; padding: 20px; }
.preview-theme h1 { font-size: 1.8em; text-align: center; color: #27ae60; margin: 1.2em 0 1em; font-weight: 700; }
.preview-theme h2 { font-size: 1.4em; color: #27ae60; border-bottom: 2px solid #27ae60; padding-bottom: 6px; margin: 1.5em 0 0.8em; }
.preview-theme h3 { font-size: 1.2em; color: #27ae60; margin: 1.2em 0 0.6em; }
.preview-theme h4, .preview-theme h5, .preview-theme h6 { color: #27ae60; margin: 1em 0 0.5em; }
.preview-theme p { margin: 0.8em 0; text-align: justify; }
.preview-theme strong { color: #27ae60; }
.preview-theme blockquote { border-left: 4px solid #27ae60; background: #eafaf1; padding: 10px 15px; margin: 1em 0; color: #555; }
.preview-theme ul, .preview-theme ol { padding-left: 2em; margin: 0.8em 0; }
.preview-theme li { margin: 0.3em 0; }
.preview-theme code { background: #eafaf1; color: #27ae60; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
.preview-theme pre { background: #282c34; border-radius: 5px; padding: 16px; overflow-x: auto; margin: 1em 0; }
.preview-theme pre code { background: none; color: #abb2bf; padding: 0; }
.preview-theme table { width: 100%; border-collapse: collapse; margin: 1em 0; }
.preview-theme th { background: #27ae60; color: #fff; padding: 8px 12px; text-align: left; }
.preview-theme td { border: 1px solid #ddd; padding: 8px 12px; }
.preview-theme tr:nth-child(even) { background: #eafaf1; }
.preview-theme img { max-width: 100%; border-radius: 4px; margin: 0.5em auto; display: block; }
.preview-theme a { color: #27ae60; text-decoration: none; border-bottom: 1px solid #27ae60; }
.preview-theme hr { border: none; border-top: 2px solid #27ae60; margin: 1.5em 0; }
`;
function generateTheme(id: string, name: string, accent: string, accentBg: string, darkBg?: string): ThemeDefinition {
  const bgColor = darkBg || '#fff';
  const textColor = darkBg ? '#e0e0e0' : '#333';
  const subText = darkBg ? '#aaa' : '#555';
  return {
    id, name,
    css: `
.preview-theme { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 15px; line-height: 1.8; color: ${textColor}; padding: 20px; background: ${bgColor}; }
.preview-theme h1 { font-size: 1.8em; text-align: center; color: ${accent}; margin: 1.2em 0 1em; font-weight: 700; }
.preview-theme h2 { font-size: 1.4em; color: ${accent}; border-bottom: 2px solid ${accent}; padding-bottom: 6px; margin: 1.5em 0 0.8em; }
.preview-theme h3 { font-size: 1.2em; color: ${accent}; margin: 1.2em 0 0.6em; }
.preview-theme h4, .preview-theme h5, .preview-theme h6 { color: ${accent}; margin: 1em 0 0.5em; }
.preview-theme p { margin: 0.8em 0; text-align: justify; }
.preview-theme strong { color: ${accent}; }
.preview-theme em { font-style: italic; }
.preview-theme del { color: #999; }
.preview-theme blockquote { border-left: 4px solid ${accent}; background: ${accentBg}; padding: 10px 15px; margin: 1em 0; color: ${subText}; }
.preview-theme ul, .preview-theme ol { padding-left: 2em; margin: 0.8em 0; }
.preview-theme li { margin: 0.3em 0; }
.preview-theme code { background: ${accentBg}; color: ${accent}; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
.preview-theme pre { background: #282c34; border-radius: 5px; padding: 16px; overflow-x: auto; margin: 1em 0; }
.preview-theme pre code { background: none; color: #abb2bf; padding: 0; }
.preview-theme table { width: 100%; border-collapse: collapse; margin: 1em 0; }
.preview-theme th { background: ${accent}; color: #fff; padding: 8px 12px; text-align: left; }
.preview-theme td { border: 1px solid ${darkBg ? '#444' : '#ddd'}; padding: 8px 12px; }
.preview-theme tr:nth-child(even) { background: ${accentBg}; }
.preview-theme img { max-width: 100%; border-radius: 4px; margin: 0.5em auto; display: block; }
.preview-theme a { color: ${accent}; text-decoration: none; border-bottom: 1px solid ${accent}; }
.preview-theme hr { border: none; border-top: 2px solid ${accent}; margin: 1.5em 0; }
`
  };
}
export const themes: Record<string, ThemeDefinition> = {
  orangeHeart: { id: 'orangeHeart', name: '橙心', css: orangeHeartCSS },
  purple: { id: 'purple', name: '姹紫', css: purpleCSS },
  green: { id: 'green', name: '绿意', css: greenCSS },
  blue: generateTheme('blue', '蓝蓝', '#2980b9', '#ebf5fb'),
  techBlue: generateTheme('techBlue', '科技蓝', '#1a5276', '#d4e6f1', '#0a1628'),
  cyanBlue: generateTheme('cyanBlue', '兰青', '#148f77', '#d1f2eb'),
  geekBlack: generateTheme('geekBlack', '极客黑', '#00b894', '#1a1a2e', '#1a1a2e'),
  fullStackBlue: generateTheme('fullStackBlue', '全栈蓝', '#3498db', '#ebf5fb'),
  tenderCyan: generateTheme('tenderCyan', '嫩青', '#1abc9c', '#e8f8f5'),
  nightPurple: generateTheme('nightPurple', '凝夜紫', '#9b59b6', '#1a1a2e', '#1a1a2e'),
  simple: generateTheme('simple', '简', '#333', '#f5f5f5'),
  inkBlack: generateTheme('inkBlack', '墨黑', '#ccc', '#2c2c2c', '#1a1a1a'),
  frontendTop: generateTheme('frontendTop', '前端之巅', '#e74c3c', '#fdedec'),
  redScarlet: generateTheme('redScarlet', '红绯', '#c0392b', '#fdedec'),
  yamabuki: generateTheme('yamabuki', '山吹', '#f39c12', '#fef9e7'),
  vGreen: generateTheme('vGreen', 'v-green', '#42b883', '#e8f5e9'),
  orangeBlue: generateTheme('orangeBlue', '橙蓝风', '#e67e22', '#fef5e7'),
  cuteGreen: generateTheme('cuteGreen', '萌绿', '#2ecc71', '#eafaf1'),
  wechatGreen: generateTheme('wechatGreen', '微绿', '#35b378', '#edf7f0'),
  minimalistDark: generateTheme('minimalistDark', '极简黑', '#bbb', '#333', '#222'),
};

export const themeList = Object.values(themes);
