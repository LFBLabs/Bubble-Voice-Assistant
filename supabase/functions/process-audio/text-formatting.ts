
export function formatResponseForSpeech(text: string): string {
  const abbreviationMap: Record<string, string> = {
    'e.g.': 'for example',
    'i.e.': 'that is',
    'etc.': 'etcetera',
    'viz.': 'namely',
    'vs.': 'versus',
    'w.r.t.': 'with respect to',
    'approx.': 'approximately',
    '>': 'greater than',
    '<': 'less than',
    '>=': 'greater than or equal to',
    '<=': 'less than or equal to',
    '==': 'equals',
    '!=': 'not equal to',
    '===': 'strictly equals',
    '!==': 'strictly not equal to',
    '+': 'plus',
    '-': ' ',
    '*': 'times',
    '/': 'divided by',
    '\\': ' ',
    '%': 'percent',
    '=': 'equals',
    '&': 'and',
    '|': 'or',
    '^': 'to the power of',
    '√': 'square root of',
    '∑': 'sum of',
    '∏': 'product of',
    '∆': 'delta',
    '≈': 'approximately equal to',
    '≠': 'not equal to',
    '±': 'plus or minus',
    '_': ' ',
    '.js': ' JavaScript',
    '.ts': ' TypeScript',
    '.jsx': ' JavaScript X',
    '.tsx': ' TypeScript X',
    '.css': ' CSS',
    '.html': ' HTML',
    '.md': ' markdown',
    '.json': ' JSON',
    '.yml': ' YAML',
    '.yaml': ' YAML',
    '.env': ' environment',
    'README': 'read me',
    'API': 'A P I',
    'UI': 'U I',
    'CSS': 'C S S',
    'HTML': 'H T M L',
    'URL': 'U R L',
    'SDK': 'S D K',
    'CLI': 'C L I',
    'npm': 'N P M',
    'AWS': 'A W S',
    'SQL': 'S Q L',
    'IDE': 'I D E'
  };
  
  const commonPhrases = {
    'left-hand': 'left hand',
    'right-hand': 'right hand',
    'drop-down': 'drop down',
    'drag-and-drop': 'drag and drop',
    'step-by-step': 'step by step',
    'built-in': 'built in',
    'sign-in': 'sign in',
    'sign-up': 'sign up',
    'log-in': 'log in',
    'log-out': 'log out',
    'check-in': 'check in',
    'check-out': 'check out',
    'set-up': 'set up',
    'clean-up': 'clean up'
  };
  
  const pathPhrases = {
    'edit/': 'edit',
    'src/': 'source',
    'docs/': 'docs',
    'public/': 'public',
    'components/': 'components',
    'utils/': 'utilities',
    'pages/': 'pages',
    'assets/': 'assets',
    'styles/': 'styles'
  };
  
  let formattedText = text
    // Handle abbreviations first
    .replace(/\b(e\.g\.|i\.e\.|etc\.|viz\.|vs\.|w\.r\.t\.|approx\.)\b/g, match => 
      abbreviationMap[match.toLowerCase()]
    )
    
    // Remove markdown formatting
    .replace(/[*_~`#]/g, '')
    .replace(/\[(.*?)\]/g, '$1')
    
    // Format lists
    .replace(/^\s*[-•*]\s*/gm, 'Here is a point: ')
    .replace(/^\s*(\d+)\.\s*/gm, '')
    
    // Handle path-like strings
    .replace(/\b\w+[/\\]\w+\b/g, match => {
      for (const [pattern, replacement] of Object.entries(pathPhrases)) {
        if (match.includes(pattern)) {
          return match.replace(pattern, replacement + ' ');
        }
      }
      return match.replace(/[/\\]/g, ' ');
    })
    
    // Replace common hyphenated phrases
    .replace(/\b(left-hand|right-hand|drop-down|drag-and-drop|step-by-step|built-in|sign-in|sign-up|log-in|log-out|check-in|check-out|set-up|clean-up)\b/gi, match => 
      commonPhrases[match.toLowerCase()] || match
    )
    
    // Handle code-related symbols
    .replace(/([<>]=?|={2,3}|!=={0,2}|[+\-*/%=&|^√∑∏∆≈≠±\\])/g, match => 
      abbreviationMap[match] || match
    )
    
    // Replace common file extensions and technical terms
    .replace(/\.(js|ts|jsx|tsx|css|html|md|json|yml|yaml|env)\b/gi, match => 
      abbreviationMap[match.toLowerCase()] || match
    )
    
    // Handle uppercase technical acronyms
    .replace(/\b(README|API|UI|CSS|HTML|URL|SDK|CLI|npm|AWS|SQL|IDE)\b/g, match => 
      abbreviationMap[match] || match
    )
    
    // Handle multi-word hyphenated terms not covered by commonPhrases
    .replace(/(\w+)-(\w+)/g, '$1 $2')
    
    // Clean up remaining formatting
    .replace(/\b(First|Second|Third|Fourth|Fifth|Next|Then),?\s*/g, '')
    .replace(/^\s*>\s*/gm, '')
    .replace(/https?:\/\/[^\s]+/g, 'the linked website')
    .replace(/[;:]|(?<=[.!?])\s+(?=[A-Z])/g, '. ')
    .replace(/,\s*/g, ', ')
    
    // Fix remaining CamelCase words AFTER handling common phrases
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    
    // Clean up spaces
    .replace(/\s+/g, ' ')
    .trim();

  // Final cleanup
  formattedText = formattedText
    .replace(/\.{2,}/g, '.')
    .replace(/\.\s*\./g, '.')
    .replace(/\s+/g, ' ')
    .trim();

  return formattedText;
}
