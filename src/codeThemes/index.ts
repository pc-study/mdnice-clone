export interface CodeThemeDefinition {
  id: string;
  name: string;
  css: string;
}

const atomOneDarkCss = `/*

Atom One Dark by Daniel Gamage
Original One Dark Syntax theme from https://github.com/atom/one-dark-syntax

base:    #282c34
mono-1:  #abb2bf
mono-2:  #818896
mono-3:  #5c6370
hue-1:   #56b6c2
hue-2:   #61aeee
hue-3:   #c678dd
hue-4:   #98c379
hue-5:   #e06c75
hue-5-2: #be5046
hue-6:   #d19a66
hue-6-2: #e6c07b

*/

.hljs {
  display: block;
  overflow-x: auto;
  padding: 16px;
  color: #abb2bf;
  background: #282c34;
}

.hljs-comment,
.hljs-quote {
  color: #5c6370;
  font-style: italic;
}

.hljs-doctag,
.hljs-keyword,
.hljs-formula {
  color: #c678dd;
}

.hljs-section,
.hljs-name,
.hljs-selector-tag,
.hljs-deletion,
.hljs-subst {
  color: #e06c75;
}

.hljs-literal {
  color: #56b6c2;
}

.hljs-string,
.hljs-regexp,
.hljs-addition,
.hljs-attribute,
.hljs-meta-string {
  color: #98c379;
}

.hljs-built_in,
.hljs-class .hljs-title {
  color: #e6c07b;
}

.hljs-attr,
.hljs-variable,
.hljs-template-variable,
.hljs-type,
.hljs-selector-class,
.hljs-selector-attr,
.hljs-selector-pseudo,
.hljs-number {
  color: #d19a66;
}

.hljs-symbol,
.hljs-bullet,
.hljs-link,
.hljs-meta,
.hljs-selector-id,
.hljs-title {
  color: #61aeee;
}

.hljs-emphasis {
  font-style: italic;
}

.hljs-strong {
  font-weight: bold;
}

.hljs-link {
  text-decoration: underline;
}`;

const atomOneLightCss = `/*

Atom One Light by Daniel Gamage
Original One Light Syntax theme from https://github.com/atom/one-light-syntax

base:    #fafafa
mono-1:  #383a42
mono-2:  #686b77
mono-3:  #a0a1a7
hue-1:   #0184bb
hue-2:   #4078f2
hue-3:   #a626a4
hue-4:   #50a14f
hue-5:   #e45649
hue-5-2: #c91243
hue-6:   #986801
hue-6-2: #c18401

*/

.hljs {
  display: block;
  overflow-x: auto;
  padding: 16px;
  color: #383a42;
  background: #fafafa;
}

.hljs-comment,
.hljs-quote {
  color: #a0a1a7;
  font-style: italic;
}

.hljs-doctag,
.hljs-keyword,
.hljs-formula {
  color: #a626a4;
}

.hljs-section,
.hljs-name,
.hljs-selector-tag,
.hljs-deletion,
.hljs-subst {
  color: #e45649;
}

.hljs-literal {
  color: #0184bb;
}

.hljs-string,
.hljs-regexp,
.hljs-addition,
.hljs-attribute,
.hljs-meta-string {
  color: #50a14f;
}

.hljs-built_in,
.hljs-class .hljs-title {
  color: #c18401;
}

.hljs-attr,
.hljs-variable,
.hljs-template-variable,
.hljs-type,
.hljs-selector-class,
.hljs-selector-attr,
.hljs-selector-pseudo,
.hljs-number {
  color: #986801;
}

.hljs-symbol,
.hljs-bullet,
.hljs-link,
.hljs-meta,
.hljs-selector-id,
.hljs-title {
  color: #4078f2;
}

.hljs-emphasis {
  font-style: italic;
}

.hljs-strong {
  font-weight: bold;
}

.hljs-link {
  text-decoration: underline;
}`;

const githubCss = `/*

github.com style (c) Vasily Polovnyov <vast@whiteants.net>

*/

.hljs {
  display: block;
  overflow-x: auto;
  padding: 16px;
  color: #333;
  background: #f8f8f8;
}

.hljs-comment,
.hljs-quote {
  color: #998;
  font-style: italic;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-subst {
  color: #333;
  font-weight: bold;
}

.hljs-number,
.hljs-literal,
.hljs-variable,
.hljs-template-variable,
.hljs-tag .hljs-attr {
  color: #008080;
}

.hljs-string,
.hljs-doctag {
  color: #d14;
}

.hljs-title,
.hljs-section,
.hljs-selector-id {
  color: #900;
  font-weight: bold;
}

.hljs-subst {
  font-weight: normal;
}

.hljs-type,
.hljs-class .hljs-title {
  color: #458;
  font-weight: bold;
}

.hljs-tag,
.hljs-name,
.hljs-attribute {
  color: #000080;
  font-weight: normal;
}

.hljs-regexp,
.hljs-link {
  color: #009926;
}

.hljs-symbol,
.hljs-bullet {
  color: #990073;
}

.hljs-built_in,
.hljs-builtin-name {
  color: #0086b3;
}

.hljs-meta {
  color: #999;
  font-weight: bold;
}

.hljs-deletion {
  background: #fdd;
}

.hljs-addition {
  background: #dfd;
}

.hljs-emphasis {
  font-style: italic;
}

.hljs-strong {
  font-weight: bold;
}`;

const monokaiCss = `/*
Monokai style - ported by Luigi Maselli - http://grigio.org
*/

.hljs {
  display: block;
  overflow-x: auto;
  padding: 16px;
  background: #272822; color: #ddd;
}

.hljs-tag,
.hljs-keyword,
.hljs-selector-tag,
.hljs-literal,
.hljs-strong,
.hljs-name {
  color: #f92672;
}

.hljs-code {
  color: #66d9ef;
}

.hljs-class .hljs-title {
  color: white;
}

.hljs-attribute,
.hljs-symbol,
.hljs-regexp,
.hljs-link {
  color: #bf79db;
}

.hljs-string,
.hljs-bullet,
.hljs-subst,
.hljs-title,
.hljs-section,
.hljs-emphasis,
.hljs-type,
.hljs-built_in,
.hljs-builtin-name,
.hljs-selector-attr,
.hljs-selector-pseudo,
.hljs-addition,
.hljs-variable,
.hljs-template-tag,
.hljs-template-variable {
  color: #a6e22e;
}

.hljs-comment,
.hljs-quote,
.hljs-deletion,
.hljs-meta {
  color: #75715e;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-literal,
.hljs-doctag,
.hljs-title,
.hljs-section,
.hljs-type,
.hljs-selector-id {
  font-weight: bold;
}`;

const vs2015Css = `/*
 * Visual Studio 2015 dark style
 * Author: Nicolas LLOBERA <nllobera@gmail.com>
 */

.hljs {
  display: block;
  overflow-x: auto;
  padding: 16px;
  background: #1E1E1E;
  color: #DCDCDC;
}

.hljs-keyword,
.hljs-literal,
.hljs-symbol,
.hljs-name {
  color: #569CD6;
}
.hljs-link {
  color: #569CD6;
  text-decoration: underline;
}

.hljs-built_in,
.hljs-type {
  color: #4EC9B0;
}

.hljs-number,
.hljs-class {
  color: #B8D7A3;
}

.hljs-string,
.hljs-meta-string {
  color: #D69D85;
}

.hljs-regexp,
.hljs-template-tag {
  color: #9A5334;
}

.hljs-subst,
.hljs-function,
.hljs-title,
.hljs-params,
.hljs-formula {
  color: #DCDCDC;
}

.hljs-comment,
.hljs-quote {
  color: #57A64A;
  font-style: italic;
}

.hljs-doctag {
  color: #608B4E;
}

.hljs-meta,
.hljs-meta-keyword,
.hljs-tag {
  color: #9B9B9B;
}

.hljs-variable,
.hljs-template-variable {
  color: #BD63C5;
}

.hljs-attr,
.hljs-attribute,
.hljs-builtin-name {
  color: #9CDCFE;
}

.hljs-section {
  color: gold;
}

.hljs-emphasis {
  font-style: italic;
}

.hljs-strong {
  font-weight: bold;
}

/*.hljs-code {
  font-family:'Monospace';
}*/

.hljs-bullet,
.hljs-selector-tag,
.hljs-selector-id,
.hljs-selector-class,
.hljs-selector-attr,
.hljs-selector-pseudo {
  color: #D7BA7D;
}

.hljs-addition {
  background-color: #144212;
  display: inline-block;
  width: 100%;
}

.hljs-deletion {
  background-color: #600;
  display: inline-block;
  width: 100%;
}`;

const xcodeCss = `/*

XCode style (c) Angel Garcia <angelgarcia.mail@gmail.com>

*/

.hljs {
  display: block;
  overflow-x: auto;
  padding: 16px;
  background: #fff;
  color: black;
}

/* Gray DOCTYPE selectors like WebKit */
.xml .hljs-meta {
  color: #c0c0c0;
}

.hljs-comment,
.hljs-quote {
  color: #007400;
}

.hljs-tag,
.hljs-attribute,
.hljs-keyword,
.hljs-selector-tag,
.hljs-literal,
.hljs-name {
  color: #aa0d91;
}

.hljs-variable,
.hljs-template-variable {
  color: #3F6E74;
}

.hljs-code,
.hljs-string,
.hljs-meta-string {
  color: #c41a16;
}

.hljs-regexp,
.hljs-link {
  color: #0E0EFF;
}

.hljs-title,
.hljs-symbol,
.hljs-bullet,
.hljs-number {
  color: #1c00cf;
}

.hljs-section,
.hljs-meta {
  color: #643820;
}


.hljs-class .hljs-title,
.hljs-type,
.hljs-built_in,
.hljs-builtin-name,
.hljs-params {
  color: #5c2699;
}

.hljs-attr {
  color: #836C28;
}

.hljs-subst {
  color: #000;
}

.hljs-formula {
  background-color: #eee;
  font-style: italic;
}

.hljs-addition {
  background-color: #baeeba;
}

.hljs-deletion {
  background-color: #ffc8bd;
}

.hljs-selector-id,
.hljs-selector-class {
  color: #9b703f;
}

.hljs-doctag,
.hljs-strong {
  font-weight: bold;
}

.hljs-emphasis {
  font-style: italic;
}`;

const macAtomOneDarkCss = `/*

Atom One Dark by Daniel Gamage
Original One Dark Syntax theme from https://github.com/atom/one-dark-syntax

base:    #282c34
mono-1:  #abb2bf
mono-2:  #818896
mono-3:  #5c6370
hue-1:   #56b6c2
hue-2:   #61aeee
hue-3:   #c678dd
hue-4:   #98c379
hue-5:   #e06c75
hue-5-2: #be5046
hue-6:   #d19a66
hue-6-2: #e6c07b

*/

.hljs {
  display: block;
  overflow-x: auto;
  padding: 16px;
  color: #abb2bf;
  background: #282c34;
}

.hljs-comment,
.hljs-quote {
  color: #5c6370;
  font-style: italic;
}

.hljs-doctag,
.hljs-keyword,
.hljs-formula {
  color: #c678dd;
}

.hljs-section,
.hljs-name,
.hljs-selector-tag,
.hljs-deletion,
.hljs-subst {
  color: #e06c75;
}

.hljs-literal {
  color: #56b6c2;
}

.hljs-string,
.hljs-regexp,
.hljs-addition,
.hljs-attribute,
.hljs-meta-string {
  color: #98c379;
}

.hljs-built_in,
.hljs-class .hljs-title {
  color: #e6c07b;
}

.hljs-attr,
.hljs-variable,
.hljs-template-variable,
.hljs-type,
.hljs-selector-class,
.hljs-selector-attr,
.hljs-selector-pseudo,
.hljs-number {
  color: #d19a66;
}

.hljs-symbol,
.hljs-bullet,
.hljs-link,
.hljs-meta,
.hljs-selector-id,
.hljs-title {
  color: #61aeee;
}

.hljs-emphasis {
  font-style: italic;
}

.hljs-strong {
  font-weight: bold;
}

.hljs-link {
  text-decoration: underline;
}

#nice .custom code {
  padding-top: 15px;
  background: #282c34;
  border-radius: 5px;
}

#nice .custom:before {
  content: '';
  display:block;
  background: url(https://files.mdnice.com/user/3441/876cad08-0422-409d-bb5a-08afec5da8ee.svg);
  height: 30px;
  width: 100%;
  background-size:40px;
  background-repeat: no-repeat;
  background-color: #282c34;
  margin-bottom: -7px;
  border-radius: 5px;
  background-position: 10px 10px;
}

#nice .custom {
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.55) 0px 2px 10px;
  text-align: left;
}`;

const macAtomOneLightCss = `/*

Atom One Light by Daniel Gamage
Original One Light Syntax theme from https://github.com/atom/one-light-syntax

base:    #fafafa
mono-1:  #383a42
mono-2:  #686b77
mono-3:  #a0a1a7
hue-1:   #0184bb
hue-2:   #4078f2
hue-3:   #a626a4
hue-4:   #50a14f
hue-5:   #e45649
hue-5-2: #c91243
hue-6:   #986801
hue-6-2: #c18401

*/

.hljs {
  display: block;
  overflow-x: auto;
  padding: 16px;
  color: #383a42;
  background: #fafafa;
}

.hljs-comment,
.hljs-quote {
  color: #a0a1a7;
  font-style: italic;
}

.hljs-doctag,
.hljs-keyword,
.hljs-formula {
  color: #a626a4;
}

.hljs-section,
.hljs-name,
.hljs-selector-tag,
.hljs-deletion,
.hljs-subst {
  color: #e45649;
}

.hljs-literal {
  color: #0184bb;
}

.hljs-string,
.hljs-regexp,
.hljs-addition,
.hljs-attribute,
.hljs-meta-string {
  color: #50a14f;
}

.hljs-built_in,
.hljs-class .hljs-title {
  color: #c18401;
}

.hljs-attr,
.hljs-variable,
.hljs-template-variable,
.hljs-type,
.hljs-selector-class,
.hljs-selector-attr,
.hljs-selector-pseudo,
.hljs-number {
  color: #986801;
}

.hljs-symbol,
.hljs-bullet,
.hljs-link,
.hljs-meta,
.hljs-selector-id,
.hljs-title {
  color: #4078f2;
}

.hljs-emphasis {
  font-style: italic;
}

.hljs-strong {
  font-weight: bold;
}

.hljs-link {
  text-decoration: underline;
}

#nice .custom code {
  padding-top: 15px;
  background: #fafafa;
  border-radius: 5px;
}

#nice .custom:before {
  content: '';
  display:block;
  background: url(https://files.mdnice.com/user/3441/876cad08-0422-409d-bb5a-08afec5da8ee.svg);
  height: 30px;
  width: 100%;
  background-size:40px;
  background-repeat: no-repeat;
  background-color: #fafafa;
  margin-bottom: -7px;
  border-radius: 5px;
  background-position: 10px 10px;
}

#nice .custom {
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.55) 0px 2px 10px;
  text-align: left;
}`;

const macGithubCss = `/*

github.com style (c) Vasily Polovnyov <vast@whiteants.net>

*/

.hljs {
  display: block;
  overflow-x: auto;
  padding: 16px;
  color: #333;
  background: #f8f8f8;
}

.hljs-comment,
.hljs-quote {
  color: #998;
  font-style: italic;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-subst {
  color: #333;
  font-weight: bold;
}

.hljs-number,
.hljs-literal,
.hljs-variable,
.hljs-template-variable,
.hljs-tag .hljs-attr {
  color: #008080;
}

.hljs-string,
.hljs-doctag {
  color: #d14;
}

.hljs-title,
.hljs-section,
.hljs-selector-id {
  color: #900;
  font-weight: bold;
}

.hljs-subst {
  font-weight: normal;
}

.hljs-type,
.hljs-class .hljs-title {
  color: #458;
  font-weight: bold;
}

.hljs-tag,
.hljs-name,
.hljs-attribute {
  color: #000080;
  font-weight: normal;
}

.hljs-regexp,
.hljs-link {
  color: #009926;
}

.hljs-symbol,
.hljs-bullet {
  color: #990073;
}

.hljs-built_in,
.hljs-builtin-name {
  color: #0086b3;
}

.hljs-meta {
  color: #999;
  font-weight: bold;
}

.hljs-deletion {
  background: #fdd;
}

.hljs-addition {
  background: #dfd;
}

.hljs-emphasis {
  font-style: italic;
}

.hljs-strong {
  font-weight: bold;
}

#nice .custom code {
  padding-top: 15px;
  background: #f8f8f8;
  border-radius: 5px;
}

#nice .custom:before {
  content: '';
  display:block;
  background: url(https://files.mdnice.com/user/3441/876cad08-0422-409d-bb5a-08afec5da8ee.svg);
  height: 30px;
  width: 100%;
  background-size:40px;
  background-repeat: no-repeat;
  background-color: #f8f8f8;
  margin-bottom: -7px;
  border-radius: 5px;
  background-position: 10px 10px;
}

#nice .custom {
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.55) 0px 2px 10px;
  text-align: left;
}`;

const macMonokaiCss = `/*
Monokai style - ported by Luigi Maselli - http://grigio.org
*/

.hljs {
  display: block;
  overflow-x: auto;
  padding: 16px;
  background: #272822; color: #ddd;
}

.hljs-tag,
.hljs-keyword,
.hljs-selector-tag,
.hljs-literal,
.hljs-strong,
.hljs-name {
  color: #f92672;
}

.hljs-code {
  color: #66d9ef;
}

.hljs-class .hljs-title {
  color: white;
}

.hljs-attribute,
.hljs-symbol,
.hljs-regexp,
.hljs-link {
  color: #bf79db;
}

.hljs-string,
.hljs-bullet,
.hljs-subst,
.hljs-title,
.hljs-section,
.hljs-emphasis,
.hljs-type,
.hljs-built_in,
.hljs-builtin-name,
.hljs-selector-attr,
.hljs-selector-pseudo,
.hljs-addition,
.hljs-variable,
.hljs-template-tag,
.hljs-template-variable {
  color: #a6e22e;
}

.hljs-comment,
.hljs-quote,
.hljs-deletion,
.hljs-meta {
  color: #75715e;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-literal,
.hljs-doctag,
.hljs-title,
.hljs-section,
.hljs-type,
.hljs-selector-id {
  font-weight: bold;
}

#nice .custom code {
  padding-top: 15px;
  background: #272822;
  border-radius: 5px;
}

#nice .custom:before {
  content: '';
  display:block;
  background: url(https://files.mdnice.com/user/3441/876cad08-0422-409d-bb5a-08afec5da8ee.svg);
  height: 30px;
  width: 100%;
  background-size:40px;
  background-repeat: no-repeat;
  background-color: #272822;
  margin-bottom: -7px;
  border-radius: 5px;
  background-position: 10px 10px;
}

#nice .custom {
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.55) 0px 2px 10px;
  text-align: left;
}`;

const macVs2015Css = `/*
 * Visual Studio 2015 dark style
 * Author: Nicolas LLOBERA <nllobera@gmail.com>
 */

.hljs {
  display: block;
  overflow-x: auto;
  padding: 16px;
  background: #1E1E1E;
  color: #DCDCDC;
}

.hljs-keyword,
.hljs-literal,
.hljs-symbol,
.hljs-name {
  color: #569CD6;
}
.hljs-link {
  color: #569CD6;
  text-decoration: underline;
}

.hljs-built_in,
.hljs-type {
  color: #4EC9B0;
}

.hljs-number,
.hljs-class {
  color: #B8D7A3;
}

.hljs-string,
.hljs-meta-string {
  color: #D69D85;
}

.hljs-regexp,
.hljs-template-tag {
  color: #9A5334;
}

.hljs-subst,
.hljs-function,
.hljs-title,
.hljs-params,
.hljs-formula {
  color: #DCDCDC;
}

.hljs-comment,
.hljs-quote {
  color: #57A64A;
  font-style: italic;
}

.hljs-doctag {
  color: #608B4E;
}

.hljs-meta,
.hljs-meta-keyword,
.hljs-tag {
  color: #9B9B9B;
}

.hljs-variable,
.hljs-template-variable {
  color: #BD63C5;
}

.hljs-attr,
.hljs-attribute,
.hljs-builtin-name {
  color: #9CDCFE;
}

.hljs-section {
  color: gold;
}

.hljs-emphasis {
  font-style: italic;
}

.hljs-strong {
  font-weight: bold;
}

/*.hljs-code {
  font-family:'Monospace';
}*/

.hljs-bullet,
.hljs-selector-tag,
.hljs-selector-id,
.hljs-selector-class,
.hljs-selector-attr,
.hljs-selector-pseudo {
  color: #D7BA7D;
}

.hljs-addition {
  background-color: #144212;
  display: inline-block;
  width: 100%;
}

.hljs-deletion {
  background-color: #600;
  display: inline-block;
  width: 100%;
}

#nice .custom code {
  padding-top: 15px;
  background: #1E1E1E;
  border-radius: 5px;
}

#nice .custom:before {
  content: '';
  display:block;
  background: url(https://files.mdnice.com/user/3441/876cad08-0422-409d-bb5a-08afec5da8ee.svg);
  height: 30px;
  width: 100%;
  background-size:40px;
  background-repeat: no-repeat;
  background-color: #1E1E1E;
  margin-bottom: -7px;
  border-radius: 5px;
  background-position: 10px 10px;
}

#nice .custom {
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.55) 0px 2px 10px;
  text-align: left;
}`;

const macXcodeCss = `/*

XCode style (c) Angel Garcia <angelgarcia.mail@gmail.com>

*/

.hljs {
  display: block;
  overflow-x: auto;
  padding: 16px;
  background: #fff;
  color: black;
}

/* Gray DOCTYPE selectors like WebKit */
.xml .hljs-meta {
  color: #c0c0c0;
}

.hljs-comment,
.hljs-quote {
  color: #007400;
}

.hljs-tag,
.hljs-attribute,
.hljs-keyword,
.hljs-selector-tag,
.hljs-literal,
.hljs-name {
  color: #aa0d91;
}

.hljs-variable,
.hljs-template-variable {
  color: #3F6E74;
}

.hljs-code,
.hljs-string,
.hljs-meta-string {
  color: #c41a16;
}

.hljs-regexp,
.hljs-link {
  color: #0E0EFF;
}

.hljs-title,
.hljs-symbol,
.hljs-bullet,
.hljs-number {
  color: #1c00cf;
}

.hljs-section,
.hljs-meta {
  color: #643820;
}


.hljs-class .hljs-title,
.hljs-type,
.hljs-built_in,
.hljs-builtin-name,
.hljs-params {
  color: #5c2699;
}

.hljs-attr {
  color: #836C28;
}

.hljs-subst {
  color: #000;
}

.hljs-formula {
  background-color: #eee;
  font-style: italic;
}

.hljs-addition {
  background-color: #baeeba;
}

.hljs-deletion {
  background-color: #ffc8bd;
}

.hljs-selector-id,
.hljs-selector-class {
  color: #9b703f;
}

.hljs-doctag,
.hljs-strong {
  font-weight: bold;
}

.hljs-emphasis {
  font-style: italic;
}

#nice .custom code {
  padding-top: 15px;
  background: #fff;
  border-radius: 5px;
}

#nice .custom:before {
  content: '';
  display:block;
  background: url(https://files.mdnice.com/user/3441/876cad08-0422-409d-bb5a-08afec5da8ee.svg);
  height: 30px;
  width: 100%;
  background-size:40px;
  background-repeat: no-repeat;
  background-color: #fff;
  margin-bottom: -7px;
  border-radius: 5px;
  background-position: 10px 10px;
}

#nice .custom {
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.55) 0px 2px 10px;
  text-align: left;
}`;

export const codeThemes: Record<string, CodeThemeDefinition> = {
  'atomOneDark': { id: 'atomOneDark', name: 'Atom One Dark', css: atomOneDarkCss },
  'atomOneLight': { id: 'atomOneLight', name: 'Atom One Light', css: atomOneLightCss },
  'github': { id: 'github', name: 'GitHub', css: githubCss },
  'monokai': { id: 'monokai', name: 'Monokai', css: monokaiCss },
  'vs2015': { id: 'vs2015', name: 'VS 2015', css: vs2015Css },
  'xcode': { id: 'xcode', name: 'Xcode', css: xcodeCss },
  'macAtomOneDark': { id: 'macAtomOneDark', name: 'Mac Atom One Dark', css: macAtomOneDarkCss },
  'macAtomOneLight': { id: 'macAtomOneLight', name: 'Mac Atom One Light', css: macAtomOneLightCss },
  'macGithub': { id: 'macGithub', name: 'Mac GitHub', css: macGithubCss },
  'macMonokai': { id: 'macMonokai', name: 'Mac Monokai', css: macMonokaiCss },
  'macVs2015': { id: 'macVs2015', name: 'Mac VS 2015', css: macVs2015Css },
  'macXcode': { id: 'macXcode', name: 'Mac Xcode', css: macXcodeCss },
};

export const codeThemeList: { id: string; name: string }[] = [
  { id: 'atomOneDark', name: 'Atom One Dark' },
  { id: 'atomOneLight', name: 'Atom One Light' },
  { id: 'github', name: 'GitHub' },
  { id: 'monokai', name: 'Monokai' },
  { id: 'vs2015', name: 'VS 2015' },
  { id: 'xcode', name: 'Xcode' },
  { id: 'macAtomOneDark', name: 'Mac Atom One Dark' },
  { id: 'macAtomOneLight', name: 'Mac Atom One Light' },
  { id: 'macGithub', name: 'Mac GitHub' },
  { id: 'macMonokai', name: 'Mac Monokai' },
  { id: 'macVs2015', name: 'Mac VS 2015' },
  { id: 'macXcode', name: 'Mac Xcode' },
];
