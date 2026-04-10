export interface CodeThemeDefinition {
  id: string;
  name: string;
}

export const codeThemeList: CodeThemeDefinition[] = [
  { id: 'atom-one-dark', name: 'Atom One Dark' },
  { id: 'atom-one-light', name: 'Atom One Light' },
  { id: 'monokai', name: 'Monokai' },
  { id: 'github', name: 'GitHub' },
  { id: 'vs2015', name: 'VS2015' },
  { id: 'xcode', name: 'Xcode' },
  { id: 'a11y-dark', name: 'A11y Dark' },
  { id: 'dracula', name: 'Dracula' },
];
