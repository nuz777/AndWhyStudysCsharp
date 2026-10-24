export interface CSharpCodeBlockProps {
  code: string
  showLineNumbers?: boolean
}

interface Token {
  type:
    | 'comment'
    | 'string'
    | 'char'
    | 'number'
    | 'keyword'
    | 'primitive'
    | 'method'
    | 'class'
    | 'variable'
    | 'operator'
    | 'whitespace'
    | 'other'
  text: string
}

const NET_TYPES = new Set([
  'Task',
  'ValueTask',
  'List',
  'Dictionary',
  'HashSet',
  'Queue',
  'Stack',
  'IEnumerable',
  'IQueryable',
  'ICollection',
  'IList',
  'IDictionary',
  'HttpClient',
  'HttpResponseMessage',
  'HttpRequestMessage',
  'CancellationToken',
  'CancellationTokenSource',
  'Console',
  'WebApplication',
  'IServiceCollection',
  'DateTime',
  'DateOnly',
  'TimeOnly',
  'TimeSpan',
  'Guid',
  'Exception',
  'Math',
  'Array',
  'Action',
  'Func',
  'Predicate',
  'Nullable',
  'MemoryStream',
  'FileStream',
  'Stream',
  'StringBuilder',
  'Thread',
  'ThreadPool',
  'Parallel',
  'Monitor',
  'Mutex',
  'Semaphore',
  'Regex',
  'JsonSerializer',
  'Convert',
  'Type',
  'Tuple',
  'Span',
  'ReadOnlySpan',
  'Memory',
  'ReadOnlyMemory',
  'DbContext',
  'DbSet',
  'Controller',
  'ControllerBase',
  'ActionResult',
  'IActionResult'
])

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = []
  let remaining = line

  const patterns: { type: Token['type']; regex: RegExp }[] = [
    { type: 'comment', regex: /^(\/\/.*)$/ },
    { type: 'string', regex: /^((?:\$|@|\$@|@\$)?"(?:\\.|[^\\"])*")/ },
    { type: 'char', regex: /^('(?:\\.|[^'\\])*')/ },
    { type: 'number', regex: /^(0x[0-9a-fA-F]+|\d+(?:\.\d+)?(?:f|d|m|L|u|ul)?)\b/ },
    {
      type: 'keyword',
      regex:
        /^(public|private|protected|internal|static|readonly|const|void|async|await|var|new|return|if|else|switch|case|break|continue|for|foreach|while|do|in|try|catch|finally|throw|using|namespace|get|set|init|record|class|struct|interface|enum|delegate|override|virtual|abstract|sealed|base|this|typeof|nameof|is|as|true|false|null|default|out|ref)\b/
    },
    {
      type: 'primitive',
      regex: /^(int|string|bool|double|float|decimal|char|byte|long|short|object|dynamic)\b/
    },
    { type: 'method', regex: /^([a-zA-Z_][a-zA-Z0-9_]*)(?=(?:<[^>]+>)?\s*\()/ },
    { type: 'class', regex: /^([A-Z][a-zA-Z0-9_]*)\b/ },
    { type: 'variable', regex: /^([a-zA-Z_][a-zA-Z0-9_]*)\b/ },
    { type: 'operator', regex: /^([+\-*/%&|^!=<>?:.]+)/ },
    { type: 'whitespace', regex: /^(\s+)/ },
    { type: 'other', regex: /^([^a-zA-Z0-9_\s])/ }
  ]

  while (remaining.length > 0) {
    let matched = false
    for (const p of patterns) {
      const m = remaining.match(p.regex)
      if (m && m[1]) {
        tokens.push({ type: p.type, text: m[1] })
        remaining = remaining.slice(m[1].length)
        matched = true
        break
      }
    }
    if (!matched) {
      tokens.push({ type: 'other', text: remaining[0] ?? '' })
      remaining = remaining.slice(1)
    }
  }

  // Second pass: contextual refinement for classes and types
  for (let i = 0; i < tokens.length; i++) {
    const currentToken = tokens[i]
    if (!currentToken) continue

    // 1. Any word immediately after "new", "class", "interface", "struct", "record", "enum" is a class/type
    if (
      currentToken.type === 'keyword' &&
      ['new', 'class', 'interface', 'struct', 'record', 'enum'].includes(currentToken.text)
    ) {
      let nextIdx = i + 1
      while (nextIdx < tokens.length && tokens[nextIdx]?.type === 'whitespace') nextIdx++
      const nextToken = tokens[nextIdx]
      if (nextToken && nextToken.type !== 'keyword') {
        nextToken.type = 'class'
      }
    }

    // 2. Known standard .NET types
    if (NET_TYPES.has(currentToken.text)) {
      currentToken.type = 'class'
    }
  }

  return tokens
}

export function CSharpCodeBlock({ code, showLineNumbers = false }: CSharpCodeBlockProps) {
  if (!code) return null

  const lines = code.split('\n')

  return (
    <div className={`csharp-code-highlighter ${showLineNumbers ? 'with-line-numbers' : ''}`}>
      {lines.map((line, lineIndex) => {
        const tokens = tokenizeLine(line)
        return (
          <div key={`line-${lineIndex}`} className="code-line">
            {showLineNumbers && (
              <span className="code-line-number" aria-hidden="true">
                {lineIndex + 1}
              </span>
            )}
            <span className="code-line-content">
              {tokens.length === 0 ? (
                <span>&nbsp;</span>
              ) : (
                tokens.map((token, tokenIndex) => {
                  if (token.type === 'whitespace' || token.type === 'other') {
                    return <span key={`tok-${lineIndex}-${tokenIndex}`}>{token.text}</span>
                  }
                  return (
                    <span
                      key={`tok-${lineIndex}-${tokenIndex}`}
                      className={`csharp-token token-${token.type}`}
                      title={token.type === 'class' ? `Clase / Tipo: ${token.text}` : undefined}
                    >
                      {token.text}
                    </span>
                  )
                })
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}
