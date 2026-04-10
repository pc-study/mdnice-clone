export interface ThemeDefinition {
  id: string;
  name: string;
  css: string;
}

import theme_3060_css from './css/theme_3060';
import theme_3050_css from './css/theme_3050';
import theme_1377_css from './css/theme_1377';
import theme_1348_css from './css/theme_1348';
import theme_11773_css from './css/theme_11773';
import theme_1_css from './css/theme_1';
import theme_3_css from './css/theme_3';
import theme_4_css from './css/theme_4';
import theme_5_css from './css/theme_5';
import theme_6_css from './css/theme_6';
import theme_8_css from './css/theme_8';
import theme_10_css from './css/theme_10';
import theme_11_css from './css/theme_11';
import theme_12_css from './css/theme_12';
import theme_13_css from './css/theme_13';
import theme_15_css from './css/theme_15';
import theme_16_css from './css/theme_16';
import theme_17_css from './css/theme_17';
import theme_18_css from './css/theme_18';
import theme_19_css from './css/theme_19';
import theme_33_css from './css/theme_33';
import theme_35_css from './css/theme_35';
import theme_42_css from './css/theme_42';
import theme_44_css from './css/theme_44';
import theme_45_css from './css/theme_45';
import theme_48_css from './css/theme_48';
import theme_51_css from './css/theme_51';
import theme_62_css from './css/theme_62';
import theme_63_css from './css/theme_63';
import theme_1653_css from './css/theme_1653';

export const themes: Record<string, ThemeDefinition> = {
  '3060': { id: '3060', name: '重影', css: theme_3060_css },
  '3050': { id: '3050', name: '丘比特忙', css: theme_3050_css },
  '1377': { id: '1377', name: '奇点', css: theme_1377_css },
  '1348': { id: '1348', name: '雁栖湖', css: theme_1348_css },
  '11773': { id: '11773', name: '柠檬黄', css: theme_11773_css },
  '1': { id: '1', name: '橙心', css: theme_1_css },
  '3': { id: '3', name: '姹紫', css: theme_3_css },
  '4': { id: '4', name: '嫩青', css: theme_4_css },
  '5': { id: '5', name: '绿意', css: theme_5_css },
  '6': { id: '6', name: '红绯', css: theme_6_css },
  '8': { id: '8', name: '蓝莹', css: theme_8_css },
  '10': { id: '10', name: '兰青', css: theme_10_css },
  '11': { id: '11', name: '山吹', css: theme_11_css },
  '12': { id: '12', name: '前端之巅同款', css: theme_12_css },
  '13': { id: '13', name: '极客黑', css: theme_13_css },
  '15': { id: '15', name: '蔷薇紫', css: theme_15_css },
  '16': { id: '16', name: '萌绿', css: theme_16_css },
  '17': { id: '17', name: '全栈蓝', css: theme_17_css },
  '18': { id: '18', name: '极简黑', css: theme_18_css },
  '19': { id: '19', name: '橙蓝风', css: theme_19_css },
  '33': { id: '33', name: 'Pornhub黄', css: theme_33_css },
  '35': { id: '35', name: '凝夜紫', css: theme_35_css },
  '42': { id: '42', name: '萌粉', css: theme_42_css },
  '44': { id: '44', name: 'Obsidian', css: theme_44_css },
  '45': { id: '45', name: '灵动蓝', css: theme_45_css },
  '48': { id: '48', name: '草原绿', css: theme_48_css },
  '51': { id: '51', name: '科技蓝', css: theme_51_css },
  '62': { id: '62', name: 'WeFormat', css: theme_62_css },
  '63': { id: '63', name: '简', css: theme_63_css },
  '1653': { id: '1653', name: '锤子便签主题第2版', css: theme_1653_css },
};

export const themeList: { id: string; name: string }[] = [
  { id: '3060', name: '重影' },
  { id: '3050', name: '丘比特忙' },
  { id: '1377', name: '奇点' },
  { id: '1348', name: '雁栖湖' },
  { id: '11773', name: '柠檬黄' },
  { id: '1', name: '橙心' },
  { id: '3', name: '姹紫' },
  { id: '4', name: '嫩青' },
  { id: '5', name: '绿意' },
  { id: '6', name: '红绯' },
  { id: '8', name: '蓝莹' },
  { id: '10', name: '兰青' },
  { id: '11', name: '山吹' },
  { id: '12', name: '前端之巅同款' },
  { id: '13', name: '极客黑' },
  { id: '15', name: '蔷薇紫' },
  { id: '16', name: '萌绿' },
  { id: '17', name: '全栈蓝' },
  { id: '18', name: '极简黑' },
  { id: '19', name: '橙蓝风' },
  { id: '33', name: 'Pornhub黄' },
  { id: '35', name: '凝夜紫' },
  { id: '42', name: '萌粉' },
  { id: '44', name: 'Obsidian' },
  { id: '45', name: '灵动蓝' },
  { id: '48', name: '草原绿' },
  { id: '51', name: '科技蓝' },
  { id: '62', name: 'WeFormat' },
  { id: '63', name: '简' },
  { id: '1653', name: '锤子便签主题第2版' },
];
