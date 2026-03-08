import { Component, Input } from '@angular/core';
import { StructuredRecord, StructuredGroup } from '../../models/lesson.model';

// Agrupa StructuredGroups pelo prefixo do método (ex: "Sacro", "Suzuki")
interface MethodGroup {
  methodName: string;  // ex: "Sacro"
  entries: StructuredGroup[];
}

// Para Rubank: agrupar por "Lesson X"
interface RubankLesson {
  lessonName: string; // ex: "Lesson 1 - Supplementary"
  items: StructuredGroup[];
}

// Para Almeida Dias: agrupar por Fase e depois por tipo (RITMO, ESCALAS, etc)
interface AlmeidaDiasFase {
  faseName: string; // ex: "Fase 1"
  types: AlmeidaDiasType[];
}

interface AlmeidaDiasType {
  typeName: string; // ex: "RITMO", "ESCALAS"
  items: StructuredGroup[];
}

function groupByMethod(groups: StructuredGroup[]): MethodGroup[] {
  const map = new Map<string, StructuredGroup[]>();
  const order: string[] = [];
  for (const g of groups) {
    // Extrai prefixo do método: "Sacro Lição 1" → "Sacro", "Suzuki Perpetual" → "Suzuki"
    const prefix = extractMethodPrefix(g.methodName);
    if (!map.has(prefix)) { map.set(prefix, []); order.push(prefix); }
    map.get(prefix)!.push(g);
  }
  return order.map(m => ({ methodName: m, entries: map.get(m)! }));
}

function extractMethodPrefix(source: string): string {
  const METHODS = ['Sacro', 'Suzuki', 'Almeida Dias', 'Rubank', "Clark's", 'Clarks',
    'MSA Exercicios', 'MSA Teoria', 'MSA', 'Apostila', 'Solfejo', 'Leitura', 'Ditado', 'Percepção'];
  for (const m of METHODS) {
    if (source.startsWith(m)) return m;
  }
  return source.split(' ')[0] ?? source;
}

function groupRubankLessons(entries: StructuredGroup[]): RubankLesson[] {
  // Rubank entries look like: "Rubank Lesson 1 - Supplementary L1"
  // Group by "Lesson X - Supplementary" or "Lesson X"
  const map = new Map<string, StructuredGroup[]>();
  const order: string[] = [];
  
  for (const entry of entries) {
    const text = entry.methodName.replace('Rubank ', '');
    // Extract lesson part: "Lesson 1 - Supplementary L1" → "Lesson 1 - Supplementary"
    const match = text.match(/^(Lesson \d+(?:\s*-\s*\w+)?)/);
    const lessonName = match ? match[1] : text.split(' L')[0];
    
    if (!map.has(lessonName)) { map.set(lessonName, []); order.push(lessonName); }
    map.get(lessonName)!.push(entry);
  }
  
  return order.map(name => ({ lessonName: name, items: map.get(name)! }));
}

function groupAlmeidaDiasFases(entries: StructuredGroup[]): AlmeidaDiasFase[] {
  // Almeida Dias entries look like: "Almeida Dias Fase 1 RITMO L1"
  // Group by Fase, then by type (RITMO, ESCALAS, etc)
  const faseMap = new Map<string, StructuredGroup[]>();
  const faseOrder: string[] = [];
  
  for (const entry of entries) {
    const text = entry.methodName.replace('Almeida Dias ', '');
    const match = text.match(/^(Fase \d+)/);
    const faseName = match ? match[1] : 'Sem Fase';
    
    if (!faseMap.has(faseName)) { faseMap.set(faseName, []); faseOrder.push(faseName); }
    faseMap.get(faseName)!.push(entry);
  }
  
  return faseOrder.map(faseName => {
    const faseEntries = faseMap.get(faseName)!;
    // Now group by type within this fase
    const typeMap = new Map<string, StructuredGroup[]>();
    const typeOrder: string[] = [];
    
    for (const entry of faseEntries) {
      const text = entry.methodName.replace('Almeida Dias ', '').replace(/Fase \d+\s*/, '');
      const typeMatch = text.match(/^([A-Z]+)/);
      const typeName = typeMatch ? typeMatch[1] : 'OUTROS';
      
      if (!typeMap.has(typeName)) { typeMap.set(typeName, []); typeOrder.push(typeName); }
      typeMap.get(typeName)!.push(entry);
    }
    
    const types = typeOrder.map(typeName => ({
      typeName,
      items: typeMap.get(typeName)!
    }));
    
    return { faseName, types };
  });
}

// Remove duplicatas dentro de details (a source era repetida antes)
function cleanDetails(details: string[]): string[] {
  if (details.length === 0) return [];
  const first = details[0];
  return details.filter((d, i) => {
    if (i === 0) return true;
    // Remove linhas que são apenas "Source: ..." repetindo o título
    if (d === first) return false;
    return true;
  });
}

@Component({
  selector: 'app-structured-review',
  standalone: true,
  template: `
    @if (record) {
      <div style="display: flex; flex-direction: column; gap: 1rem;">

        <!-- MÉTODO -->
        @if (record.metodo.length > 0) {
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <span class="section-label">MÉTODO</span>
            @for (mg of groupedMetodo(); track mg.methodName) {
              <div style="margin-left: 0.5rem;">
                <!-- Nome do método em negrito -->
                <span class="font-chalk" style="font-size: 0.875rem; font-weight: 700; color: var(--foreground); display: block; margin-bottom: 0.25rem;">
                  {{ mg.methodName }}:
                </span>
                
                @if (mg.methodName === 'Rubank') {
                  <!-- Estrutura hierárquica para Rubank -->
                  @for (lesson of groupRubankLessons(mg.entries); track lesson.lessonName) {
                    <div style="margin-left: 0.75rem; margin-bottom: 0.5rem;">
                      <p class="font-chalk" style="font-size: 0.8rem; color: var(--foreground); margin: 0; margin-bottom: 0.25rem;">
                        • {{ lesson.lessonName }}
                      </p>
                      @for (item of lesson.items; track item.methodName) {
                        <div style="margin-left: 1.25rem;">
                          <p class="font-chalk" style="font-size: 0.75rem; color: var(--foreground); margin: 0;">
                            {{ extractRubankLessonNumber(item.methodName) }}{{ buildEntrySuffix(item) }}
                          </p>
                        </div>
                      }
                    </div>
                  }
                } @else if (mg.methodName === 'Almeida Dias') {
                  <!-- Estrutura hierárquica para Almeida Dias -->
                  @for (fase of groupAlmeidaDiasFases(mg.entries); track fase.faseName) {
                    <div style="margin-left: 0.75rem; margin-bottom: 0.5rem;">
                      <p class="font-chalk" style="font-size: 0.8rem; color: var(--foreground); margin: 0; margin-bottom: 0.25rem;">
                        • {{ fase.faseName }}
                      </p>
                      @for (type of fase.types; track type.typeName) {
                        <div style="margin-left: 1.25rem; margin-bottom: 0.25rem;">
                          <p class="font-chalk" style="font-size: 0.75rem; font-weight: 600; color: var(--foreground); margin: 0;">
                            {{ type.typeName }}
                          </p>
                          @for (item of type.items; track item.methodName) {
                            <div style="margin-left: 1rem;">
                              <p class="font-chalk" style="font-size: 0.7rem; color: var(--foreground); margin: 0;">
                                {{ extractAlmeidaDiasLessonNumber(item.methodName) }}{{ buildEntrySuffix(item) }}
                              </p>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                } @else {
                  <!-- Lições com bullet points (padrão para outros métodos) -->
                  @for (entry of mg.entries; track entry.methodName) {
                    <div style="margin-left: 0.75rem; margin-bottom: 0.25rem;">
                      <p class="font-chalk" style="font-size: 0.8rem; color: var(--foreground); margin: 0;">
                        • {{ getLessonPart(entry.methodName) }}{{ buildEntrySuffix(entry) }}
                      </p>
                    </div>
                  }
                }
              </div>
            }
          </div>
        }

        <!-- HINÁRIO -->
        @if (record.hinario.length > 0) {
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <span class="section-label">HINÁRIO</span>
            @for (group of record.hinario; track group.methodName) {
              <div style="margin-left: 1.25rem; margin-bottom: 0.25rem;">
                <p class="font-chalk" style="font-size: 0.8rem; color: var(--foreground); margin: 0;">
                  • {{ group.methodName }}{{ buildEntrySuffix(group) }}
                </p>
              </div>
            }
          </div>
        }

        <!-- ESCALAS -->
        @if (record.escalas.length > 0) {
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <span class="section-label">ESCALAS</span>
            @for (group of record.escalas; track group.methodName) {
              <div style="margin-left: 1.25rem; margin-bottom: 0.25rem;">
                <p class="font-chalk" style="font-size: 0.8rem; color: var(--foreground); margin: 0;">
                  • {{ group.methodName }}{{ buildEntrySuffix(group) }}
                </p>
              </div>
            }
          </div>
        }

        <!-- OUTROS -->
        @if (record.outros) {
          <div>
            <span class="section-label">OUTROS</span>
            <p class="font-chalk" style="margin-top: 0.5rem; margin-left: 0.5rem; font-size: 0.875rem; color: var(--foreground); line-height: 1.6;">
              {{ record.outros }}
            </p>
          </div>
        }

        @if (record.metodo.length === 0 && record.hinario.length === 0 && record.escalas.length === 0 && !record.outros) {
          <p class="font-chalk" style="font-size: 0.875rem; color: var(--muted-foreground); opacity: 0.5; font-style: italic;">Nenhum registro</p>
        }
      </div>
    }
  `,
})
export class StructuredReviewComponent {
  @Input() record!: StructuredRecord;

  groupedMetodo(): MethodGroup[] {
    return groupByMethod(this.record?.metodo ?? []);
  }

  groupRubankLessons(entries: StructuredGroup[]): RubankLesson[] {
    return groupRubankLessons(entries);
  }

  groupAlmeidaDiasFases(entries: StructuredGroup[]): AlmeidaDiasFase[] {
    return groupAlmeidaDiasFases(entries);
  }

  extractRubankLessonNumber(methodName: string): string {
    // "Rubank Lesson 1 - Supplementary L1" → "Lição 01"
    const match = methodName.match(/L(\d+)/);
    if (match) {
      const num = match[1].padStart(2, '0');
      return `Lição ${num}`;
    }
    return methodName.replace('Rubank ', '');
  }

  extractAlmeidaDiasLessonNumber(methodName: string): string {
    // "Almeida Dias Fase 1 RITMO L1" → "Lição 01"
    const match = methodName.match(/L(\d+)/);
    if (match) {
      const num = match[1].padStart(2, '0');
      return `Lição ${num}`;
    }
    // Se houver múltiplas lições como "L1,L2", dividir
    const multiMatch = methodName.match(/L([\d,]+)/);
    if (multiMatch) {
      const nums = multiMatch[1].split(',').map(n => `Lição ${n.padStart(2, '0')}`);
      return nums.join(', ');
    }
    return methodName.replace(/Almeida Dias\s*/, '').replace(/Fase \d+\s*/, '').replace(/[A-Z]+\s*/, '');
  }

  /** Build the inline suffix for an entry: "; Status: X; Obs: Y" */
  buildEntrySuffix(group: StructuredGroup): string {
    // details[0] is the source (repeated) — skip it; rest are Status/Obs
    const parts = group.details.slice(1).filter((d: string) => d.trim().length > 0);
    if (parts.length === 0) return '';
    // inline all: "; Status: regular; Obs: melhorar"
    return '; ' + parts.join('; ') + '.';
  }

  // Pega apenas a parte da lição, removendo o prefixo do método
  getLessonPart(methodName: string): string {
    const PREFIXES = [
      'Sacro Licao ', 'Sacro Lição ', 'Sacro ',
      'Suzuki ', 'Almeida Dias ', 'Rubank ', "Clark's ", 'Clarks ',
      'MSA Exercicios ', 'MSA Teoria ', 'MSA ',
      'Hino ', 'Coro ',
    ];
    for (const p of PREFIXES) {
      if (methodName.startsWith(p)) return methodName.slice(p.length);
    }
    return methodName;
  }

  // Remove a primeira linha se ela repete o methodName
  getOnlyDetails(details: string[]): string[] {
    if (!details || details.length === 0) return [];
    return details.slice(1).filter(d => d.trim().length > 0);
  }
}