import type { Topic, Note } from '../types/notes'

export const INITIAL_TOPICS: Topic[] = [
  {
    id: 'fundamentos',
    name: 'Fundamentos de C#',
    description: 'Tipos de datos, memoria stack vs heap, structs y pattern matching.',
    badgeColor: '#8b5cf6'
  },
  {
    id: 'poo-solid',
    name: 'POO & Principios SOLID',
    description: 'Abstracción, interfaces, encapsulación y diseño desacoplado.',
    badgeColor: '#38bdf8'
  },
  {
    id: 'linq-async',
    name: 'LINQ & Concurrencia',
    description: 'Consultas sobre IEnumerable/IQueryable, Tasks y async/await.',
    badgeColor: '#f59e0b'
  }
]

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    topicId: 'fundamentos',
    title: 'Value Types vs Reference Types',
    content: 'Los tipos por valor viven en el Stack y los tipos por referencia viven en el Heap.',
    blocks: [
      {
        id: 'b1',
        type: 'text',
        text: `## Tipos por Valor en C#
Los tipos por valor (int, bool, struct) viven en el Stack o embebidos en el struct contenedor.
- Son ultrarrápidos y se destruyen inmediatamente al salir del ámbito de ejecución.`
      },
      {
        id: 'b2',
        type: 'code',
        title: 'Ejemplo: Tipos por Valor (Stack)',
        code: `int edad = 25;\nbool activo = true;\nPunto p = new Punto(10, 20); // struct asignado en Stack`
      },
      {
        id: 'b3',
        type: 'text',
        text: `## Tipos por Referencia y Heap
Las clases, registros (records) e interfaces se alojan en el Heap.
- La variable solo almacena un puntero o referencia en el Stack.
- La recolección de memoria la gestiona automáticamente el Garbage Collector (GC).`
      },
      {
        id: 'b4',
        type: 'code',
        title: 'Ejemplo: Tipos por Referencia (Heap)',
        code: `string nombre = "AndWhy";\nUsuario user = new Usuario("Alex"); // Objeto en Heap`
      }
    ],
    priority: 'fuerte',
    isHighlighted: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2
  },
  {
    id: 'note-2',
    topicId: 'fundamentos',
    title: 'Pattern Matching con switch expression',
    content: 'A partir de C# 8+, las expresiones switch reducen la verbosidad para evaluar tipos y propiedades con una sintaxis limpia y declarativa.',
    codeSnippet: `string ObtenerDescripcion(object figura) => figura switch
{
    Circulo { Radio: > 10 } => "Círculo grande",
    Circulo => "Círculo estándar",
    Rectangulo r when r.Ancho == r.Alto => "Cuadrado",
    _ => "Figura no reconocida"
};`,
    priority: 'intermedio',
    isHighlighted: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 12
  },
  {
    id: 'note-3',
    topicId: 'fundamentos',
    title: 'Uso de string.Create para optimización',
    content: 'Truco ligero de rendimiento: string.Create evita asignaciones intermedias en el Garbage Collector cuando formateamos cadenas de texto frecuentes.',
    priority: 'bajo',
    isHighlighted: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 4
  },
  {
    id: 'note-4',
    topicId: 'poo-solid',
    title: 'Principio de Inversión de Dependencias (DIP)',
    content: 'Los módulos de alto nivel no deben depender de módulos de bajo nivel; ambos deben depender de abstracciones (interfaces). Esto permite cambiar implementaciones y facilitar Unit Testing con Mocks.',
    codeSnippet: `public interface INotificador
{
    Task EnviarAsync(string mensaje);
}

public class ServicioPedidos
{
    private readonly INotificador _notificador;
    public ServicioPedidos(INotificador notificador)
    {
        _notificador = notificador;
    }
}`,
    priority: 'fuerte',
    isHighlighted: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 20
  },
  {
    id: 'note-5',
    topicId: 'linq-async',
    title: 'Evitar async void salvo en manejadores de eventos',
    content: 'async void no permite capturar excepciones con try/catch fuera del método ni sincronizar su finalización. Utiliza siempre Task o ValueTask en su lugar.',
    codeSnippet: `// ❌ Evitar
public async void GuardarNota() { ... }

// ✅ Correcto
public async Task GuardarNotaAsync() { ... }`,
    priority: 'fuerte',
    isHighlighted: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 8
  },
  {
    id: 'note-6',
    topicId: 'linq-async',
    title: 'Select vs SelectMany en LINQ',
    content: 'Select transforma cada elemento 1 a 1. SelectMany aplana listas anidadas (proyección 1 a N).',
    codeSnippet: `var temasConNotas = temas.SelectMany(t => t.Notas);`,
    priority: 'intermedio',
    isHighlighted: true,
    createdAt: Date.now() - 1000 * 60 * 30
  }
]
