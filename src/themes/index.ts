import juejin_css from './css/juejin';
import github_css from './css/github';
import smartblue_css from './css/smartblue';
import cyanosis_css from './css/cyanosis';
import channing_cyan_css from './css/channing-cyan';
import fancy_css from './css/fancy';
import hydrogen_css from './css/hydrogen';
import condensed_night_purple_css from './css/condensed-night-purple';
import greenwillow_css from './css/greenwillow';
import v_green_css from './css/v-green';
import vue_pro_css from './css/vue-pro';
import healer_readable_css from './css/healer-readable';
import mk_cute_css from './css/mk-cute';
import jzman_css from './css/jzman';
import geek_black_css from './css/geek-black';
import awesome_green_css from './css/awesome-green';
import qklhk_chocolate_css from './css/qklhk-chocolate';
import orange_css from './css/orange';
import scrolls_light_css from './css/scrolls-light';
import simplicity_green_css from './css/simplicity-green';
import arknights_css from './css/arknights';
import vuepress_css from './css/vuepress';
import Chinese_red_css from './css/Chinese-red';
import nico_css from './css/nico';
import devui_blue_css from './css/devui-blue';
import serene_rose_css from './css/serene-rose';
import z_blue_css from './css/z-blue';
import minimalism_css from './css/minimalism';
import koi_css from './css/koi';
import yu_css from './css/yu';
import lilsnake_css from './css/lilsnake';
import keepnice_css from './css/keepnice';

export interface ThemeDefinition {
  id: string;
  name: string;
  css: string;
  highlight?: string;
}

export const themes: Record<string, ThemeDefinition> = {
  'juejin': { id: 'juejin', name: 'juejin', css: juejin_css, highlight: 'juejin' },
  'github': { id: 'github', name: 'github', css: github_css, highlight: 'github' },
  'smartblue': { id: 'smartblue', name: 'smartblue', css: smartblue_css },
  'cyanosis': { id: 'cyanosis', name: 'cyanosis', css: cyanosis_css, highlight: 'atom-one-dark' },
  'channing-cyan': { id: 'channing-cyan', name: 'channing-cyan', css: channing_cyan_css },
  'fancy': { id: 'fancy', name: 'fancy', css: fancy_css },
  'hydrogen': { id: 'hydrogen', name: 'hydrogen', css: hydrogen_css },
  'condensed-night-purple': { id: 'condensed-night-purple', name: 'condensed-night-purple', css: condensed_night_purple_css, highlight: 'github-gist' },
  'greenwillow': { id: 'greenwillow', name: 'greenwillow', css: greenwillow_css },
  'v-green': { id: 'v-green', name: 'v-green', css: v_green_css },
  'vue-pro': { id: 'vue-pro', name: 'vue-pro', css: vue_pro_css, highlight: 'monokai' },
  'healer-readable': { id: 'healer-readable', name: 'healer-readable', css: healer_readable_css, highlight: 'srcery' },
  'mk-cute': { id: 'mk-cute', name: 'mk-cute', css: mk_cute_css },
  'jzman': { id: 'jzman', name: 'jzman', css: jzman_css, highlight: 'monokai' },
  'geek-black': { id: 'geek-black', name: 'geek-black', css: geek_black_css, highlight: 'monokai' },
  'awesome-green': { id: 'awesome-green', name: 'awesome-green', css: awesome_green_css },
  'qklhk-chocolate': { id: 'qklhk-chocolate', name: 'qklhk-chocolate', css: qklhk_chocolate_css },
  'orange': { id: 'orange', name: 'orange', css: orange_css, highlight: 'atom-one-light' },
  'scrolls-light': { id: 'scrolls-light', name: 'scrolls-light', css: scrolls_light_css },
  'simplicity-green': { id: 'simplicity-green', name: 'simplicity-green', css: simplicity_green_css },
  'arknights': { id: 'arknights', name: 'arknights', css: arknights_css, highlight: 'atom-one-light' },
  'vuepress': { id: 'vuepress', name: 'vuepress', css: vuepress_css, highlight: 'base16/tomorrow-night' },
  'Chinese-red': { id: 'Chinese-red', name: 'Chinese-red', css: Chinese_red_css, highlight: 'xcode' },
  'nico': { id: 'nico', name: 'nico', css: nico_css, highlight: 'atelier-sulphurpool-light' },
  'devui-blue': { id: 'devui-blue', name: 'devui-blue', css: devui_blue_css },
  'serene-rose': { id: 'serene-rose', name: 'serene-rose', css: serene_rose_css, highlight: 'atom-one-dark' },
  'z-blue': { id: 'z-blue', name: 'z-blue', css: z_blue_css, highlight: 'androidstudio' },
  'minimalism': { id: 'minimalism', name: 'minimalism', css: minimalism_css, highlight: 'atom-one-dark' },
  'koi': { id: 'koi', name: 'koi', css: koi_css, highlight: 'base16/tomorrow-night' },
  'yu': { id: 'yu', name: 'yu', css: yu_css, highlight: 'atom-one-dark' },
  'lilsnake': { id: 'lilsnake', name: 'lilsnake', css: lilsnake_css, highlight: 'hybrid' },
  'keepnice': { id: 'keepnice', name: 'keepnice', css: keepnice_css, highlight: 'github' },
};

export const themeList: { id: string; name: string }[] = [
  { id: 'juejin', name: 'juejin' },
  { id: 'github', name: 'github' },
  { id: 'smartblue', name: 'smartblue' },
  { id: 'cyanosis', name: 'cyanosis' },
  { id: 'channing-cyan', name: 'channing-cyan' },
  { id: 'fancy', name: 'fancy' },
  { id: 'hydrogen', name: 'hydrogen' },
  { id: 'condensed-night-purple', name: 'condensed-night-purple' },
  { id: 'greenwillow', name: 'greenwillow' },
  { id: 'v-green', name: 'v-green' },
  { id: 'vue-pro', name: 'vue-pro' },
  { id: 'healer-readable', name: 'healer-readable' },
  { id: 'mk-cute', name: 'mk-cute' },
  { id: 'jzman', name: 'jzman' },
  { id: 'geek-black', name: 'geek-black' },
  { id: 'awesome-green', name: 'awesome-green' },
  { id: 'qklhk-chocolate', name: 'qklhk-chocolate' },
  { id: 'orange', name: 'orange' },
  { id: 'scrolls-light', name: 'scrolls-light' },
  { id: 'simplicity-green', name: 'simplicity-green' },
  { id: 'arknights', name: 'arknights' },
  { id: 'vuepress', name: 'vuepress' },
  { id: 'Chinese-red', name: 'Chinese-red' },
  { id: 'nico', name: 'nico' },
  { id: 'devui-blue', name: 'devui-blue' },
  { id: 'serene-rose', name: 'serene-rose' },
  { id: 'z-blue', name: 'z-blue' },
  { id: 'minimalism', name: 'minimalism' },
  { id: 'koi', name: 'koi' },
  { id: 'yu', name: 'yu' },
  { id: 'lilsnake', name: 'lilsnake' },
  { id: 'keepnice', name: 'keepnice' },
];
