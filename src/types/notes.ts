import { BrickWall, Scale, Leaf } from 'lucide-react'

export type PriorityLevel = 'fuerte' | 'intermedio' | 'bajo'

export interface CodeSnippetItem {
  id: string
  title?: string
  code: string
}

export interface TextBlock {
  id: string
  type: 'text'
  text: string
}

export interface CodeBlock {
  id: string
  type: 'code'
  title?: string
  code: string
}

export type NoteBlock = TextBlock | CodeBlock

export interface Note {
  id: string
  topicId: string
  title: string
  subtitle?: string
  content: string // fallback / concatenación
  codeSnippet?: string // legacy fallback
  codeSnippets?: CodeSnippetItem[] // legacy fallback
  blocks?: NoteBlock[] // Flujo secuencial tipo IA: Texto -> Código -> Texto -> Código...
  priority: PriorityLevel
  isHighlighted: boolean
  createdAt: number
}

export interface Topic {
  id: string
  name: string
  description: string
  badgeColor: string
}

export const PRIORITY_CONFIG = {
  fuerte: {
    label: 'Fuerte (Concreto)',
    shortLabel: 'Fuerte',
    icon: BrickWall,
    badgeClass: 'priority-fuerte',
    description: 'Concepto fundamental y crítico'
  },
  intermedio: {
    label: 'Intermedio (Balanza)',
    shortLabel: 'Intermedio',
    icon: Scale,
    badgeClass: 'priority-intermedio',
    description: 'Concepto a sopesar / condicional'
  },
  bajo: {
    label: 'Bajo (Hoja)',
    shortLabel: 'Bajo',
    icon: Leaf,
    badgeClass: 'priority-bajo',
    description: 'Tip secundario o detalle leve'
  }
} as const

export function getNoteSnippets(note: Note): CodeSnippetItem[] {
  if (note.blocks && note.blocks.length > 0) {
    const codeBlocks = note.blocks.filter((b): b is CodeBlock => b.type === 'code')
    if (codeBlocks.length > 0) {
      return codeBlocks.map((b) => ({ id: b.id, title: b.title, code: b.code }))
    }
  }
  if (note.codeSnippets && note.codeSnippets.length > 0) {
    return note.codeSnippets
  }
  if (note.codeSnippet && note.codeSnippet.trim()) {
    return [{ id: 'legacy-1', title: 'Ejemplo C#', code: note.codeSnippet }]
  }
  return []
}

export function getNoteBlocks(note: Note): NoteBlock[] {
  if (note.blocks && note.blocks.length > 0) {
    return note.blocks
  }

  // Generar bloques desde notas legacy
  const blocks: NoteBlock[] = []
  if (note.content && note.content.trim()) {
    blocks.push({
      id: 'legacy-text-1',
      type: 'text',
      text: note.content
    })
  }

  const snippets = getNoteSnippets(note)
  snippets.forEach((snip, index) => {
    blocks.push({
      id: `legacy-code-${index}`,
      type: 'code',
      title: snip.title || `Código C# #${index + 1}`,
      code: snip.code
    })
  })

  return blocks.length > 0
    ? blocks
    : [{ id: 'default-text', type: 'text', text: '' }]
}
