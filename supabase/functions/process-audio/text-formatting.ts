
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
    '-': 'minus',
    '*': 'times',
    '/': 'divided by',
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
    '±': 'plus or minus'
  };
  
  let formattedText = text
    .replace(/[*_~`#]/g, '')
    .replace(/\[(.*?)\]/g, '$1')
    .replace(/^\s*[-•*]\s*/gm, 'Here is a point: ')
    .replace(/^\s*(\d+)\.\s*/gm, (_, num) => {
      return '';
    })
    .replace(/\b(e\.g\.|i\.e\.|etc\.|viz\.|vs\.|w\.r\.t\.|approx\.)\b/g, match => 
      abbreviationMap[match.toLowerCase()] || match
    )
    .replace(/([<>]=?|={2,3}|!=={0,2}|[+\-*/%=&|^√∑∏∆≈≠±])/g, match => 
      abbreviationMap[match] || match
    )
    .replace(/\b(First|Second|Third|Fourth|Fifth|Next|Then),?\s*/g, '')
    .replace(/^\s*>\s*/gm, '')
    .replace(/https?:\/\/[^\s]+/g, 'the linked website')
    .replace(/[;:]|(?<=[.!?])\s+(?=[A-Z])/g, '. ')
    .replace(/,\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

  formattedText = formattedText
    .replace(/\.{2,}/g, '.')
    .replace(/\.\s*\./g, '.')
    .replace(/\s+/g, ' ')
    .trim();

  return formattedText;
}
