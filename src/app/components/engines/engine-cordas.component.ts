// =============================================
// EngineCordas - SACRO / SUZUKI tabbed engine
// Angular 19 Standalone - per-turma lesson lists
// =============================================

import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { AutocompleteInputComponent } from './autocomplete-input.component';
import { StatusSelectorComponent, StatusLevel } from './status-selector.component';
import { HistoryAccumulatorComponent, HistoryEntry } from './history-accumulator.component';

type Tab = 'sacro' | 'suzuki';

// ─── Violino (cordas-01) ─────────────────────────────────────────────────────
const SACRO_VIOLINO: string[] = [
  '31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50',
  '51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70',
  '71','72','73','74','75','76','77','78','79','80','81','82','83','84','85','86','87','88','89','90',
  '91','92','93','94','95','96','97','98','99','100','101','102','103','104','105','106','107','108',
  '109','110','111','112','113','114','115','116','117','118','119','120','121','122','123','124','125',
  '126','127','128','129','130','131','132','133','134','135','136','137','138','139','140','141','142',
  '143','144','145','146','147','148','149','150','151A','151B','151C','151D','151E','151F',
  '152','153','154','155','156','157','158','159','160','161','162','163','164','165','166','167','168',
  '169','170','171','172','173','174','175','176','177','178','179','180','181','182','183','184','185',
  '186','187','188','189','190','191','192','193','194','195','196','197','198','199','200','201','202',
  '203','204','205','206','207','208','209','210','211','212','213','214','215',
  '216 - 1ªvoz','216 - 2ªvoz',
  '217A','217B','218A','218B','219','220','221','222','223','224','225','226','227','228','229','230',
  '231','232','233A','233B','234A','234B','234C','235','236','237','238','239','240','241','242','243',
  '244','245','246','247','248','249','250','251','252','253','254','255','256','257','258','259','260',
  '261','262','263','264','265','266','267','268','269','270','271','272','273','274','275','276','277',
  '278','279','280','281','282','283','284','285','286','287','288','289','290','291','292','293','294',
  '295','296','297','298','299','300','301','302','303','304','305','306','307','308','309','310','311',
  '312','313','314','315','316','317','318','319','320','321','322','323','324','325','326','327','328',
  '329','330','331','332','333','334','335','336','337','338','339','340','341','342','343','344','345',
  '346','347','348','349','350','351','352','353','354','355','356','357','358','359','360','361','362',
  '363','364','365','366','367','368','369','370','371','372','373','374','375','376','377','378','379','380',
  '01A','01B','01C','01D','02A','02B','02C','02D','03A','03B','03C','03D','04A','04B','04C','04D',
  '05A','05B','05C','06A','06B','06C','07A','07B','07C','08A','08B','08C','09A','09B','09C','09D',
  '10A','10B','10C','11A','11B','11C','12A','12B','12C','13A','13B','13C','13D',
  '14A1','14B1','14C1','14D1','14A2','14B2','14C2','14D2',
  '15A','15B','15C','16A','16B','16C','17A','17B','17C','18A','18B','18C',
  '19A','19B','19C','19D','19E','19F','19G','19H','19I','19J','19K','19L','20A','20B','20C',
];

const SUZUKI_VIOLINO: string[] = [
  'Exercise for Proper E-String Posture',
  'Exercise for Changing Strings',
  'Exercises for Quick Placement of Fingers',
  'Twinkle, Twinkle, Little Star - VARIATION A',
  'Twinkle, Twinkle, Little Star - VARIATION B',
  'Twinkle, Twinkle, Little Star - VARIATION C',
  'Twinkle, Twinkle, Little Star - VARIATION D',
  'Twinkle, Twinkle, Little Star - VARIATION E',
  'Theme',
  'Lightly Row',
  'Song of the Wind',
  'Go Tell Aunt Rhody',
  "O Come, Little Children",
  'Tonalization',
  'May Song',
  'Long, Long Ago',
  'Allegro',
  'Perpetual Motion in A major - VARIATION A',
  'Perpetual Motion in A major - VARIATION B',
  'Exercise for the 4th Finger',
  'Exercise for the 4th Finger - Tonalization',
  'D Major Scale',
  'Perpetual Motion in D major - VARIATION A',
  'Perpetual Motion in D major - VARIATION B',
  'Allegretto',
  'Andantino',
  'Andantino - Tonalization',
  'G Major Scale',
  'Etude - VARIATION A',
  'Etude - VARIATION B',
  'Minuet 1',
  'Minuet 2',
  'Minuet 3',
  'The Happy Farmer',
  'Gavotte',
];

// ─── Viola (cordas-02) ───────────────────────────────────────────────────────
const SACRO_VIOLA: string[] = [
  '31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50',
  '51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70',
  '71','72','73','74','75','76','77','78','79','80','81','82','83','84','85','86','87','88','89','90',
  '91','92','93','94','95','96','97','98','99','100','101','102','103','104','105','106','107','108',
  '109','110','111','112','113','114','115','116','117','118','119','120','121','122','123','124','125',
  '126','127','128','129','130','131','132','133','134','135','136','137','138','139','140','141','142',
  '143','144','145','146','147','148','149','150','151A','151B','151C','151D','151E','151F',
  '152','153','154','155','156','157','158','159','160','161','162','163','164','165','166','167','168',
  '169','170','171','172','173','174','175','176','177','178','179','180','181','182','183','184','185',
  '186','187','188','189','190','191','192','193','194','195','196','197','198','199','200','201','202',
  '203','204','205','206','207','208','209','210','211','212','213','214','215','216',
  '217A','217B','218A','218B','219','220','221','222','223','224','225','226','227','228','229','230',
  '231','232','233','234A','234B','234C','234A','235','236','237','238','239','240','241','242','243',
  '244','245','246','247','248','249','250','251','252','253','254','255','256','257','258','259','260',
  '261','262','263','264','265','266','267','268','269','270','271','272','273','274','275','276','277',
  '278','279','280','281','282','283','284','285','286','287','288','289','290','291','292','293','294',
  '295','296','297','298','299','300','301','302','303','304','305','306','307','308','309','310','311',
  '312','313','314','315','316','317','318','319','320','321','322','323','324A','324B','325','326','327',
  '328A','328B','328C','329A','329B','330','331','332A','332B',
  '337','338','339','340','341A','341B','341C','342A','342B','343','344','345A','345B','346','347',
  '348A','348B','349','350','351','352','353','354','355','356A','356B','357','358','359A','359B',
  '360','361','362A','362B','362C','363','364','365','366A','366B','367','368','369A','369B','369C',
  '370A','370B','371','372','373','374','375','376','377','378','379','380',
  '01-Soprano','01-Contralto','01-Tenor',
  '02A','02B','02C','02D','02E','02F','03A','04A','04B','04C','04D',
  '05A','05B','05C','06A','06B','06C','06D','07A','07B','07C','07D','08A',
  '09A','09B','09C','09D','10A','10B','10C','11A','11B','11C','12A','12B','12C',
  '13A','14A','14B','14C','14D','15A','15B','15C','16A','16B','16C',
  '17A','17B','17C','18A','18B','18C','18D',
  '19A','19B','19C','20A','20B','20C','20D',
  '21A','21B','21C','22A','23A','23B','23C','23D','23E',
];

const SUZUKI_VIOLA: string[] = [
  'Exercise for Proper E-String Posture',
  'Exercise for Changing Strings',
  'Exercises for Quick Placement of Fingers',
  'The D Major Scale',
  'Twinkle, Twinkle, Little Star - VARIATION A',
  'Twinkle, Twinkle, Little Star - VARIATION B',
  'Twinkle, Twinkle, Little Star - VARIATION C',
  'Twinkle, Twinkle, Little Star - VARIATION D',
  'Twinkle, Twinkle, Little Star - VARIATION E',
  'Theme',
  'French Folk Song',
  'Lightly Row',
  'Song of the Wind',
  'Go Tell Aunt Rhody',
  "O Come, Little Children",
  'Tonalization',
  'May Song',
  'Exercises for the 4th Finger',
  'Perpetual Motion in A major - VARIATION A',
  'Perpetual Motion in A major - VARIATION B',
  'Perpetual Motion in A major - Tonalization',
  'G Major Scale',
  'Allegretto',
  'Andantino',
  'The Close 1-2 Pattern',
  'Twinkle, Twinkle, Little Star (Theme in C Major)',
  'C Major Scale (two octaves)',
  'Exercises for Good Intonation (Diminished Fifths)',
  'Bohemian Folk Song',
  'Bohemian Folk Song - Tonalization',
  'Etude - VARIATION A',
  'Etude - VARIATION B',
  'Minuet No. 1',
  'Minuet No. 1 - Bowing Patterns',
  'Minuet No. 2',
  'Minuet No. 3',
  'The Happy Farmer',
  'Gavotte',
];

@Component({
  selector: 'app-engine-cordas',
  standalone: true,
  imports: [AutocompleteInputComponent, StatusSelectorComponent, HistoryAccumulatorComponent],
  template: `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <!-- Tab buttons -->
      <div style="display: flex; gap: 0.5rem;">
        @for (t of tabs; track t.key) {
          <button
            type="button"
            (click)="tab.set(t.key)"
            [style.border-color]="tab() === t.key ? 'var(--primary)' : 'var(--board-border)'"
            [style.border-style]="tab() === t.key ? 'solid' : 'dashed'"
            [style.background]="tab() === t.key ? 'rgba(212,175,55,0.1)' : 'transparent'"
            [style.color]="tab() === t.key ? 'var(--primary)' : 'var(--muted-foreground)'"
            style="flex: 1; border-radius: 0.5rem; border-width: 2px; padding: 0.625rem 0.75rem; font-size: 0.875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; transition: all 0.2s;"
            class="font-chalk"
          >{{ t.label }}</button>
        }
      </div>

      <!-- SACRO tab -->
      @if (tab() === 'sacro') {
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <label class="font-chalk" style="display: block; margin-bottom: 0.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">
            Lição (Sacro)
          </label>
          @if (!sacroSelected()) {
            <app-autocomplete-input
              [suggestions]="sacroLessons"
              placeholder="Digite o número da lição..."
              [blockedValues]="sacroBlocked()"
              duplicateMessage="Esta lição já foi adicionada."
              (confirmed)="sacroSelected.set($event)"
            />
          }
          @if (sacroSelected()) {
            <div style="display: flex; align-items: center; gap: 0.5rem; border-radius: 0.5rem; border: 1px solid rgba(212,175,55,0.4); background: rgba(212,175,55,0.05); padding: 0.5rem 0.75rem;">
              <span class="font-chalk" style="flex: 1; font-size: 0.875rem; font-weight: 700; color: var(--primary);">
                Selecionado: Lição {{ sacroSelected() }}
              </span>
              <button type="button" (click)="sacroSelected.set(null)"
                style="background: none; border: none; cursor: pointer; color: var(--primary); padding: 0; display: flex; align-items: center;" title="Cancelar seleção">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>
          }
          @if (sacroSelected()) {
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <app-status-selector [value]="sacroStatus()" (statusChange)="sacroStatus.set($event)" />
              <div style="position: relative; overflow: hidden; border-radius: 0.5rem; border: 1px solid var(--board-border); background: var(--card);">
                <textarea [value]="sacroObs()" (input)="sacroObs.set(asInput($event).value)" placeholder="Registre aqui, com o máximo de detalhes, o que foi trabalhado na aula, dificuldades encontradas e o que precisa ser desenvolvido" rows="2" class="font-chalk"
                  style="position: relative; z-index: 1; width: 100%; resize: none; background: transparent; padding: 0.5rem 0.75rem; padding-right: 6rem; font-size: 0.875rem; line-height: 1.75rem; color: var(--foreground); border: none; outline: none;"></textarea>
                <button type="button" (click)="sacroObs.set('Não houve')"
                  style="position:absolute;right:0.375rem;top:0.75rem;font-family:var(--font-chalk);font-size:0.65rem;font-weight:700;color:var(--muted-foreground);background:var(--muted);border:1px dashed var(--board-border);border-radius:0.375rem;padding:0.2rem 0.45rem;cursor:pointer;white-space:nowrap;z-index:2;">
                  Não houve
                </button>
              </div>
            </div>
          }
          <app-history-accumulator [entries]="[]" [addLabel]="'Adicionar Lição ' + (sacroSelected() || '...')" [addDisabled]="!canAddSacro()" (add)="addSacro()" />
        </div>
      }

      <!-- SUZUKI tab -->
      @if (tab() === 'suzuki') {
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <label class="font-chalk" style="display: block; margin-bottom: 0.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">
            Peça (Suzuki)
          </label>
          @if (!suzukiSelected()) {
            <app-autocomplete-input
              [suggestions]="suzukiPieces"
              placeholder="Digite o nome da peça..."
              [blockedValues]="suzukiBlocked()"
              duplicateMessage="Esta peça já foi adicionada."
              (confirmed)="suzukiSelected.set($event)"
            />
          }
          @if (suzukiSelected()) {
            <div style="display: flex; align-items: center; gap: 0.5rem; border-radius: 0.5rem; border: 1px solid rgba(212,175,55,0.4); background: rgba(212,175,55,0.05); padding: 0.5rem 0.75rem;">
              <span class="font-chalk" style="flex: 1; font-size: 0.875rem; font-weight: 700; color: var(--primary);">
                Selecionado: {{ suzukiSelected() }}
              </span>
              <button type="button" (click)="suzukiSelected.set(null)"
                style="background: none; border: none; cursor: pointer; color: var(--primary); padding: 0; display: flex; align-items: center;" title="Cancelar seleção">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>
          }
          @if (suzukiSelected()) {
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <app-status-selector [value]="suzukiStatus()" (statusChange)="suzukiStatus.set($event)" />
              <div style="position: relative; overflow: hidden; border-radius: 0.5rem; border: 1px solid var(--board-border); background: var(--card);">
                <textarea [value]="suzukiObs()" (input)="suzukiObs.set(asInput($event).value)" placeholder="Registre aqui, com o máximo de detalhes, o que foi trabalhado na aula, dificuldades encontradas e o que precisa ser desenvolvido" rows="2" class="font-chalk"
                  style="position: relative; z-index: 1; width: 100%; resize: none; background: transparent; padding: 0.5rem 0.75rem; padding-right: 6rem; font-size: 0.875rem; line-height: 1.75rem; color: var(--foreground); border: none; outline: none;"></textarea>
                <button type="button" (click)="suzukiObs.set('Não houve')"
                  style="position:absolute;right:0.375rem;top:0.75rem;font-family:var(--font-chalk);font-size:0.65rem;font-weight:700;color:var(--muted-foreground);background:var(--muted);border:1px dashed var(--board-border);border-radius:0.375rem;padding:0.2rem 0.45rem;cursor:pointer;white-space:nowrap;z-index:2;">
                  Não houve
                </button>
              </div>
            </div>
          }
          <app-history-accumulator [entries]="[]" [addLabel]="'Adicionar ' + (suzukiSelected() || '...')" [addDisabled]="!canAddSuzuki()" (add)="addSuzuki()" />
        </div>
      }

      <!-- Combined history -->
      @if (entries().length > 0) {
        <div style="border-top: 1px solid var(--board-border); padding-top: 1rem; margin-top: 1rem;">
          <label class="font-chalk" style="display: block; margin-bottom: 0.75rem; font-size: 0.875rem; font-weight: 700; color: var(--foreground);">
            Registro do aluno na aula
          </label>
          <app-history-accumulator [entries]="entries()" addLabel="" [addDisabled]="true" [canRemoveLast]="true"
            (removeLast)="handleRemoveLast()" (removeAt)="handleRemoveAt($event)" (editAt)="handleEditAt($event)" />
        </div>
      }

      @if (hasPending() && entries().length > 0) {
        <p class="font-chalk" style="text-align: center; font-size: 0.75rem; color: rgb(230,160,50);">
          Adicione ou remova a seleção pendente antes de salvar.
        </p>
      }

      <button type="button" [disabled]="!canSave()" (click)="handleSave()"
        [style.border-color]="canSave() ? 'rgba(94,196,160,0.6)' : 'rgba(58,56,53,0.4)'"
        [style.color]="canSave() ? 'rgb(94,196,160)' : 'rgba(138,135,128,0.4)'"
        [style.cursor]="canSave() ? 'pointer' : 'not-allowed'"
        style="display: flex; width: 100%; align-items: center; justify-content: center; gap: 0.5rem; border-radius: 0.75rem; border: 2px dashed; padding: 1rem 1.5rem; font-size: 1.25rem; font-weight: 700; transition: all 0.2s; background: transparent;"
        class="font-chalk">SALVAR</button>
    </div>
  `,
})
export class EngineCordasComponent {
  @Input() turmaId = '';
  @Input() initialEntries: HistoryEntry[] = [];
  @Output() save = new EventEmitter<HistoryEntry[]>();
  @Output() entriesChange = new EventEmitter<HistoryEntry[]>();

  tabs: { key: Tab; label: string }[] = [
    { key: 'sacro', label: 'SACRO' },
    { key: 'suzuki', label: 'SUZUKI' },
  ];

  get isViola(): boolean { return this.turmaId === 'cordas-02'; }

  get sacroLessons(): string[] { return this.isViola ? SACRO_VIOLA : SACRO_VIOLINO; }
  get suzukiPieces(): string[] { return this.isViola ? SUZUKI_VIOLA : SUZUKI_VIOLINO; }

  tab = signal<Tab>('sacro');
  entries = signal<HistoryEntry[]>([]);

  sacroSelected = signal<string | null>(null);
  sacroStatus   = signal<StatusLevel | null>(null);
  sacroObs      = signal('');

  suzukiSelected = signal<string | null>(null);
  suzukiStatus   = signal<StatusLevel | null>(null);
  suzukiObs      = signal('');

  blockedSources = computed(() => this.entries().map(e => e.source));
  sacroBlocked   = computed(() =>
    this.blockedSources().filter(s => s.startsWith('Sacro Licao ')).map(s => s.replace('Sacro Licao ', ''))
  );
  suzukiBlocked  = computed(() =>
    this.blockedSources().filter(s => s.startsWith('Suzuki ')).map(s => s.replace('Suzuki ', ''))
  );

  canAddSacro  = computed(() => this.sacroSelected()  !== null && this.sacroStatus()  !== null && this.sacroObs().trim().length > 0);
  canAddSuzuki = computed(() => this.suzukiSelected() !== null && this.suzukiStatus() !== null && this.suzukiObs().trim().length > 0);
  hasPending   = computed(() => this.sacroSelected()  !== null || this.suzukiSelected() !== null);
  canSave      = computed(() => this.entries().length > 0 && !this.hasPending());

  ngOnInit(): void { this.entries.set([...this.initialEntries]); }

  addSacro(): void {
    const sel = this.sacroSelected(), st = this.sacroStatus();
    if (!sel || !st || !this.sacroObs().trim()) return;
    const source = `Sacro Licao ${sel}`;
    if (this.blockedSources().includes(source)) return;
    this.entries.update(prev => [...prev, { source, status: st, observation: this.sacroObs().trim() }]);
    this.sacroSelected.set(null); this.sacroStatus.set(null); this.sacroObs.set('');
    this.entriesChange.emit(this.entries());
  }

  addSuzuki(): void {
    const sel = this.suzukiSelected(), st = this.suzukiStatus();
    if (!sel || !st || !this.suzukiObs().trim()) return;
    const source = `Suzuki ${sel}`;
    if (this.blockedSources().includes(source)) return;
    this.entries.update(prev => [...prev, { source, status: st, observation: this.suzukiObs().trim() }]);
    this.suzukiSelected.set(null); this.suzukiStatus.set(null); this.suzukiObs.set('');
    this.entriesChange.emit(this.entries());
  }

  handleEditAt(e: { index: number; entry: HistoryEntry }): void {
    this.entries.update(prev => prev.map((en, i) => i === e.index ? e.entry : en));
    this.entriesChange.emit(this.entries());
  }

  handleRemoveLast(): void {
    this.entries.update(prev => prev.slice(0, -1));
    this.entriesChange.emit(this.entries());
  }

  handleRemoveAt(idx: number): void {
    this.entries.update(prev => prev.filter((_, i) => i !== idx));
    this.entriesChange.emit(this.entries());
  }

  handleSave(): void { this.save.emit(this.entries()); }

  asInput(e: Event): HTMLInputElement { return e.target as HTMLInputElement; }
}