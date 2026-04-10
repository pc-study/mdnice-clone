// === 掘金社区主题 (juejin-markdown-themes) ===
import juejin_css from './juejin/juejin';
import github_css from './juejin/github';
import smartblue_css from './juejin/smartblue';
import cyanosis_css from './juejin/cyanosis';
import channing_cyan_css from './juejin/channing-cyan';
import fancy_css from './juejin/fancy';
import hydrogen_css from './juejin/hydrogen';
import condensed_night_purple_css from './juejin/condensed-night-purple';
import greenwillow_css from './juejin/greenwillow';
import v_green_css from './juejin/v-green';
import vue_pro_css from './juejin/vue-pro';
import healer_readable_css from './juejin/healer-readable';
import mk_cute_css from './juejin/mk-cute';
import jzman_css from './juejin/jzman';
import geek_black_css from './juejin/geek-black';
import awesome_green_css from './juejin/awesome-green';
import qklhk_chocolate_css from './juejin/qklhk-chocolate';
import orange_css from './juejin/orange';
import scrolls_light_css from './juejin/scrolls-light';
import simplicity_green_css from './juejin/simplicity-green';
import arknights_css from './juejin/arknights';
import vuepress_css from './juejin/vuepress';
import Chinese_red_css from './juejin/Chinese-red';
import nico_css from './juejin/nico';
import devui_blue_css from './juejin/devui-blue';
import serene_rose_css from './juejin/serene-rose';
import z_blue_css from './juejin/z-blue';
import minimalism_css from './juejin/minimalism';
import koi_css from './juejin/koi';
import yu_css from './juejin/yu';
import lilsnake_css from './juejin/lilsnake';
import keepnice_css from './juejin/keepnice';

// === mdnice 原版主题 ===
import mdnice_orange_heart_css from './mdnice/orange-heart';
import mdnice_purple_css from './mdnice/purple';
import mdnice_tender_cyan_css from './mdnice/tender-cyan';
import mdnice_green_css from './mdnice/green';
import mdnice_red_css from './mdnice/red';
import mdnice_blue_css from './mdnice/blue';
import mdnice_cyan_blue_css from './mdnice/cyan-blue';
import mdnice_yamabuki_css from './mdnice/yamabuki';
import mdnice_frontend_peak_css from './mdnice/frontend-peak';
import mdnice_geek_black_css from './mdnice/geek-black';
import mdnice_rose_purple_css from './mdnice/rose-purple';
import mdnice_cute_green_css from './mdnice/cute-green';
import mdnice_fullstack_blue_css from './mdnice/fullstack-blue';
import mdnice_minimal_black_css from './mdnice/minimal-black';
import mdnice_orange_blue_css from './mdnice/orange-blue';
import mdnice_pornhub_css from './mdnice/pornhub';
import mdnice_night_purple_css from './mdnice/night-purple';
import mdnice_cute_pink_css from './mdnice/cute-pink';
import mdnice_obsidian_css from './mdnice/obsidian';
import mdnice_vivid_blue_css from './mdnice/vivid-blue';
import mdnice_grassland_css from './mdnice/grassland';
import mdnice_tech_blue_css from './mdnice/tech-blue';
import mdnice_weformat_css from './mdnice/weformat';
import mdnice_simple_css from './mdnice/simple';
import mdnice_yanqi_lake_css from './mdnice/yanqi-lake';
import mdnice_singularity_css from './mdnice/singularity';
import mdnice_smartisan_css from './mdnice/smartisan';
import mdnice_cupid_css from './mdnice/cupid';
import mdnice_double_shadow_css from './mdnice/double-shadow';
import mdnice_lemon_css from './mdnice/lemon';

export interface ThemeDefinition {
  id: string;
  name: string;
  css: string;
  highlight?: string;
  group: 'juejin' | 'mdnice';
}

export const themes: Record<string, ThemeDefinition> = {
  // --- 掘金社区主题 ---
  'juejin': { id: 'juejin', name: 'juejin', css: juejin_css, highlight: 'juejin', group: 'juejin' },
  'github': { id: 'github', name: 'github', css: github_css, highlight: 'github', group: 'juejin' },
  'smartblue': { id: 'smartblue', name: 'smartblue', css: smartblue_css, group: 'juejin' },
  'cyanosis': { id: 'cyanosis', name: 'cyanosis', css: cyanosis_css, highlight: 'atom-one-dark', group: 'juejin' },
  'channing-cyan': { id: 'channing-cyan', name: 'channing-cyan', css: channing_cyan_css, group: 'juejin' },
  'fancy': { id: 'fancy', name: 'fancy', css: fancy_css, group: 'juejin' },
  'hydrogen': { id: 'hydrogen', name: 'hydrogen', css: hydrogen_css, group: 'juejin' },
  'condensed-night-purple': { id: 'condensed-night-purple', name: 'condensed-night-purple', css: condensed_night_purple_css, highlight: 'github-gist', group: 'juejin' },
  'greenwillow': { id: 'greenwillow', name: 'greenwillow', css: greenwillow_css, group: 'juejin' },
  'v-green': { id: 'v-green', name: 'v-green', css: v_green_css, group: 'juejin' },
  'vue-pro': { id: 'vue-pro', name: 'vue-pro', css: vue_pro_css, highlight: 'monokai', group: 'juejin' },
  'healer-readable': { id: 'healer-readable', name: 'healer-readable', css: healer_readable_css, highlight: 'srcery', group: 'juejin' },
  'mk-cute': { id: 'mk-cute', name: 'mk-cute', css: mk_cute_css, group: 'juejin' },
  'jzman': { id: 'jzman', name: 'jzman', css: jzman_css, highlight: 'monokai', group: 'juejin' },
  'geek-black': { id: 'geek-black', name: 'geek-black', css: geek_black_css, highlight: 'monokai', group: 'juejin' },
  'awesome-green': { id: 'awesome-green', name: 'awesome-green', css: awesome_green_css, group: 'juejin' },
  'qklhk-chocolate': { id: 'qklhk-chocolate', name: 'qklhk-chocolate', css: qklhk_chocolate_css, group: 'juejin' },
  'orange': { id: 'orange', name: 'orange', css: orange_css, highlight: 'atom-one-light', group: 'juejin' },
  'scrolls-light': { id: 'scrolls-light', name: 'scrolls-light', css: scrolls_light_css, group: 'juejin' },
  'simplicity-green': { id: 'simplicity-green', name: 'simplicity-green', css: simplicity_green_css, group: 'juejin' },
  'arknights': { id: 'arknights', name: 'arknights', css: arknights_css, highlight: 'atom-one-light', group: 'juejin' },
  'vuepress': { id: 'vuepress', name: 'vuepress', css: vuepress_css, highlight: 'base16/tomorrow-night', group: 'juejin' },
  'Chinese-red': { id: 'Chinese-red', name: 'Chinese-red', css: Chinese_red_css, highlight: 'xcode', group: 'juejin' },
  'nico': { id: 'nico', name: 'nico', css: nico_css, highlight: 'atelier-sulphurpool-light', group: 'juejin' },
  'devui-blue': { id: 'devui-blue', name: 'devui-blue', css: devui_blue_css, group: 'juejin' },
  'serene-rose': { id: 'serene-rose', name: 'serene-rose', css: serene_rose_css, highlight: 'atom-one-dark', group: 'juejin' },
  'z-blue': { id: 'z-blue', name: 'z-blue', css: z_blue_css, highlight: 'androidstudio', group: 'juejin' },
  'minimalism': { id: 'minimalism', name: 'minimalism', css: minimalism_css, highlight: 'atom-one-dark', group: 'juejin' },
  'koi': { id: 'koi', name: 'koi', css: koi_css, highlight: 'base16/tomorrow-night', group: 'juejin' },
  'yu': { id: 'yu', name: 'yu', css: yu_css, highlight: 'atom-one-dark', group: 'juejin' },
  'lilsnake': { id: 'lilsnake', name: 'lilsnake', css: lilsnake_css, highlight: 'hybrid', group: 'juejin' },
  'keepnice': { id: 'keepnice', name: 'keepnice', css: keepnice_css, highlight: 'github', group: 'juejin' },

  // --- mdnice 原版主题 ---
  'mdnice-orange-heart': { id: 'mdnice-orange-heart', name: '橙心', css: mdnice_orange_heart_css, group: 'mdnice' },
  'mdnice-purple': { id: 'mdnice-purple', name: '姹紫', css: mdnice_purple_css, group: 'mdnice' },
  'mdnice-tender-cyan': { id: 'mdnice-tender-cyan', name: '嫩青', css: mdnice_tender_cyan_css, group: 'mdnice' },
  'mdnice-green': { id: 'mdnice-green', name: '绿意', css: mdnice_green_css, group: 'mdnice' },
  'mdnice-red': { id: 'mdnice-red', name: '红绯', css: mdnice_red_css, group: 'mdnice' },
  'mdnice-blue': { id: 'mdnice-blue', name: '蓝莹', css: mdnice_blue_css, group: 'mdnice' },
  'mdnice-cyan-blue': { id: 'mdnice-cyan-blue', name: '兰青', css: mdnice_cyan_blue_css, group: 'mdnice' },
  'mdnice-yamabuki': { id: 'mdnice-yamabuki', name: '山吹', css: mdnice_yamabuki_css, group: 'mdnice' },
  'mdnice-frontend-peak': { id: 'mdnice-frontend-peak', name: '前端之巅同款', css: mdnice_frontend_peak_css, group: 'mdnice' },
  'mdnice-geek-black': { id: 'mdnice-geek-black', name: '极客黑', css: mdnice_geek_black_css, group: 'mdnice' },
  'mdnice-rose-purple': { id: 'mdnice-rose-purple', name: '蔷薇紫', css: mdnice_rose_purple_css, group: 'mdnice' },
  'mdnice-cute-green': { id: 'mdnice-cute-green', name: '萌绿', css: mdnice_cute_green_css, group: 'mdnice' },
  'mdnice-fullstack-blue': { id: 'mdnice-fullstack-blue', name: '全栈蓝', css: mdnice_fullstack_blue_css, group: 'mdnice' },
  'mdnice-minimal-black': { id: 'mdnice-minimal-black', name: '极简黑', css: mdnice_minimal_black_css, group: 'mdnice' },
  'mdnice-orange-blue': { id: 'mdnice-orange-blue', name: '橙蓝风', css: mdnice_orange_blue_css, group: 'mdnice' },
  'mdnice-pornhub': { id: 'mdnice-pornhub', name: 'Pornhub黄', css: mdnice_pornhub_css, group: 'mdnice' },
  'mdnice-night-purple': { id: 'mdnice-night-purple', name: '凝夜紫', css: mdnice_night_purple_css, group: 'mdnice' },
  'mdnice-cute-pink': { id: 'mdnice-cute-pink', name: '萌粉', css: mdnice_cute_pink_css, group: 'mdnice' },
  'mdnice-obsidian': { id: 'mdnice-obsidian', name: 'Obsidian', css: mdnice_obsidian_css, group: 'mdnice' },
  'mdnice-vivid-blue': { id: 'mdnice-vivid-blue', name: '灵动蓝', css: mdnice_vivid_blue_css, group: 'mdnice' },
  'mdnice-grassland': { id: 'mdnice-grassland', name: '草原绿', css: mdnice_grassland_css, group: 'mdnice' },
  'mdnice-tech-blue': { id: 'mdnice-tech-blue', name: '科技蓝', css: mdnice_tech_blue_css, group: 'mdnice' },
  'mdnice-weformat': { id: 'mdnice-weformat', name: 'WeFormat', css: mdnice_weformat_css, group: 'mdnice' },
  'mdnice-simple': { id: 'mdnice-simple', name: '简', css: mdnice_simple_css, group: 'mdnice' },
  'mdnice-yanqi-lake': { id: 'mdnice-yanqi-lake', name: '雁栖湖', css: mdnice_yanqi_lake_css, group: 'mdnice' },
  'mdnice-singularity': { id: 'mdnice-singularity', name: '奇点', css: mdnice_singularity_css, group: 'mdnice' },
  'mdnice-smartisan': { id: 'mdnice-smartisan', name: '锤子便签主题第2版', css: mdnice_smartisan_css, group: 'mdnice' },
  'mdnice-cupid': { id: 'mdnice-cupid', name: '丘比特忙', css: mdnice_cupid_css, group: 'mdnice' },
  'mdnice-double-shadow': { id: 'mdnice-double-shadow', name: '重影', css: mdnice_double_shadow_css, group: 'mdnice' },
  'mdnice-lemon': { id: 'mdnice-lemon', name: '柠檬黄', css: mdnice_lemon_css, group: 'mdnice' },
};

export const themeList = Object.values(themes).map(t => ({ id: t.id, name: t.name, group: t.group }));
export const juejinThemes = themeList.filter(t => t.group === 'juejin');
export const mdniceThemes = themeList.filter(t => t.group === 'mdnice');
