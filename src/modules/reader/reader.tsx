'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  FileText,
  Highlighter,
  Maximize,
  PenLine,
  RefreshCw,
  Search,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db, save, useRecords, download, message } from '@/lib/db';
import { openPdf, openPdfUrl, pdfjs, indexDocument } from '@/modules/library/service';
import { getOriginal } from '@/modules/sync/service';
import { courseMaterials } from '@/modules/library/course-materials';
import type { Progress, Doc } from '@/lib/types';
import { terms } from '@/modules/english/content';

type OutlineEntry = { title: string; page: number };

export function Reader({ user, documentId, onError }: { user: string; documentId: string; onError: (s: string) => void }) {
  const docs = useRecords<Doc>(user, 'documents');
  const progresses = useRecords<Progress>(user, 'reading_progress');
  const annotations = useRecords(user, 'annotations');
  const marks = useRecords(user, 'bookmarks');
  const indexed = useRecords(user, 'document_pages');
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [pageDraft, setPageDraft] = useState('1');
  const [zoom, setZoom] = useState(1);
  const [mode, setMode] = useState('single');
  const [busy, setBusy] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [focus, setFocus] = useState(false);
  const [query, setQuery] = useState('');
  const [text, setText] = useState('');
  const [color, setColor] = useState('#facc15');
  const [tool, setTool] = useState('select');
  const [selection, setSelection] = useState<{ text: string; rects: number[][] } | null>(null);
  const [outline, setOutline] = useState<OutlineEntry[]>([]);
  const [process, setProcess] = useState('');
  const [processProgress, setProcessProgress] = useState(0);
  const [animation, setAnimation] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelProcess = useRef<AbortController | null>(null);
  const strokes = useRef<number[][]>([]);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const fitWidth = useRef(false);
  const savedScroll = useRef(0);
  const restoredScroll = useRef(false);
  const active = docs.find((item) => item.id === documentId);
  const progress = progresses.find((item) => item.data.document_id === documentId);
  const ready = useRef(false);

  useEffect(() => {
    let alive = true;
    let pdf: PDFDocumentProxy | undefined;
    ready.current = false;
    fitWidth.current = false;
    savedScroll.current = 0;
    restoredScroll.current = false;
    setBusy(true);
    setLoadError('');
    setDoc(null);
    setOutline([]);

    void (async () => {
      try {
        const record = await db.records.get(documentId);
        const slug = String(record?.data.courseMaterialSlug ?? '');
        const material = courseMaterials.find((item) => item.slug === slug);
        pdf = material
          ? await openPdfUrl(material.href)
          : await openPdf(await getOriginal(user, documentId));
        if (!alive) {
          await pdf.destroy();
          return;
        }

        const rows = await db.records.where('[user_id+entity]').equals([user, 'reading_progress']).toArray();
        const old = rows.find((item) => item.data.document_id === documentId)?.data as Progress | undefined;
        const savedPage = Math.max(1, Math.min(pdf.numPages, Number(old?.page) || 1));
        savedScroll.current = Number(old?.scroll) || 0;
        const mobile = window.matchMedia('(max-width: 760px)').matches;
        let initialZoom = Number(old?.zoom) || 1;
        let initialMode = old?.mode ?? 'single';

        if (mobile) {
          // Mount the reader immediately; refine this estimate after PDF.js starts rendering.
          // Waiting for getPage(savedPage) here delayed the whole reader on large remote PDFs.
          const availableWidth = (container.current?.clientWidth || window.innerWidth) - 20;
          initialZoom = Math.max(0.25, Math.min(3, availableWidth / 595.28));
          initialMode = 'single';
          fitWidth.current = true;
        }

        setIsMobile(mobile);
        setPage(savedPage);
        setPageDraft(String(savedPage));
        setZoom(initialZoom);
        setMode(initialMode);
        setDoc(pdf);
        ready.current = true;

        // Load the table of contents after the first page can already be read.
        void (async () => {
          try {
            const tree = await pdf?.getOutline();
            const mapped: OutlineEntry[] = [];
            for (const item of tree ?? []) {
              let destination = item.dest;
              if (typeof destination === 'string') destination = await pdf?.getDestination(destination);
              let targetPage = 1;
              if (Array.isArray(destination) && destination[0] && typeof destination[0] === 'object') {
                targetPage = (await pdf?.getPageIndex(destination[0]))! + 1;
              }
              mapped.push({ title: item.title, page: targetPage });
            }
            if (alive) setOutline(mapped);
          } catch {
            if (alive) setOutline([]);
          }
        })();
      } catch (error) {
        if (alive) setLoadError(message(error));
      } finally {
        if (alive) setBusy(false);
      }
    })();

    return () => {
      alive = false;
      ready.current = false;
      void pdf?.destroy();
      cancelProcess.current?.abort();
    };
  }, [user, documentId, retry]);

  useEffect(() => {
    setPageDraft(String(page));
  }, [page]);

  const persist = useCallback(async (changes: Partial<Progress> = {}) => {
    if (!ready.current || !doc) return;
    const rows = await db.records.where('[user_id+entity]').equals([user, 'reading_progress']).toArray();
    const old = rows.find((item) => item.data.document_id === documentId);
    const prior = old?.data as Progress | undefined;
    const pageToSave = Number(changes.page ?? page);
    const data: Progress = {
      document_id: documentId,
      page: pageToSave,
      zoom,
      mode,
      scroll: prior?.scroll ?? 0,
      visited: Array.from(new Set([...(prior?.visited ?? []), pageToSave])),
      completed: prior?.completed ?? [],
      ...changes,
    };
    await save(user, 'reading_progress', data, old?.id, documentId);
  }, [user, documentId, doc, page, zoom, mode]);

  useEffect(() => {
    if (!doc || !ready.current) return;
    const timer = setTimeout(() => {
      void persist().catch((error) => onError(message(error)));
    }, 300);
    return () => clearTimeout(timer);
  }, [doc, page, zoom, mode, persist, onError]);

  const fitPageToWidth = useCallback(async (targetPage = page) => {
    if (!doc || !container.current) return;
    try {
      const pdfPage = await doc.getPage(targetPage);
      const pageWidth = pdfPage.getViewport({ scale: 1 }).width;
      const availableWidth = container.current.clientWidth - (isMobile ? 20 : 40);
      setZoom(Math.max(0.25, Math.min(3, availableWidth / pageWidth)));
    } catch (error) {
      onError(message(error));
    }
  }, [doc, page, isMobile, onError]);

  useEffect(() => {
    if (!doc || !fitWidth.current) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const resize = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void fitPageToWidth(), 100);
    };
    window.addEventListener('resize', resize);
    const observer = container.current ? new ResizeObserver(resize) : null;
    if (container.current) observer?.observe(container.current);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('resize', resize);
      observer?.disconnect();
    };
  }, [doc, isMobile, fitPageToWidth]);

  const go = useCallback((requestedPage: number) => {
    if (!doc || !Number.isFinite(requestedPage)) return;
    const targetPage = Math.max(1, Math.min(doc.numPages, Math.trunc(requestedPage)));
    if (targetPage === page) {
      setPageDraft(String(targetPage));
      return;
    }
    setPage(targetPage);
    setPageDraft(String(targetPage));
    restoredScroll.current = true;
    savedScroll.current = 0;
    if (container.current) container.current.scrollTo({ top: 0, left: 0 });
    void persist({ page: targetPage, scroll: 0 }).catch((error) => onError(message(error)));
    if (fitWidth.current) void fitPageToWidth(targetPage);
  }, [doc, page, persist, fitPageToWidth, onError]);

  const commitPageDraft = () => {
    const value = Number(pageDraft);
    if (Number.isFinite(value) && value > 0) go(value);
    else setPageDraft(String(page));
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).closest('input,textarea,select')) return;
      if (event.key === 'ArrowRight') go(page + 1);
      if (event.key === 'ArrowLeft') go(page - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [page, go]);

  useEffect(() => () => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
  }, []);

  const addAnnotation = async (kind = 'highlight', rects = selection?.rects ?? [], body = text) => {
    if (!body.trim() && !selection?.text && !rects.length) return;
    await save(user, 'annotations', {
      document_id: documentId,
      page,
      body,
      quote: selection?.text ?? '',
      color,
      rects,
      kind,
    }, undefined, documentId);
    setText('');
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  async function processPdf(ocr = false) {
    if (!doc) return;
    const controller = new AbortController();
    cancelProcess.current = controller;
    setProcess(ocr ? 'OCR' : 'Extração');
    setProcessProgress(0);
    try {
      if (!ocr) {
        await indexDocument(user, documentId, await getOriginal(user, documentId), setProcessProgress, controller.signal);
      } else {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('por+eng', 1, {
          logger: (entry) => {
            if (entry.status === 'recognizing text') setProcessProgress(entry.progress);
          },
        });
        const abort = () => { void worker.terminate(); };
        controller.signal.addEventListener('abort', abort, { once: true });
        try {
          const pdfPage = await doc.getPage(page);
          const viewport = pdfPage.getViewport({ scale: 1.4 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await pdfPage.render({ canvas, viewport }).promise;
          const result = await worker.recognize(canvas);
          if (!controller.signal.aborted) {
            const prior = indexed.find((item) => item.parent_id === documentId && item.data.page === page);
            await save(user, 'document_pages', {
              document_id: documentId,
              page,
              text: result.data.text,
              source: 'OCR — revisar',
            }, prior?.id, documentId);
          }
          canvas.width = 0;
          canvas.height = 0;
        } finally {
          controller.signal.removeEventListener('abort', abort);
          await worker.terminate();
        }
      }
    } catch (error) {
      if (!controller.signal.aborted) onError(message(error));
    } finally {
      setProcess('');
    }
  }

  const term = selection
    ? terms.find((item) => item.term.toLowerCase() === selection.text.toLowerCase().trim())
    : null;

  const captureSelection = () => {
    const selected = window.getSelection();
    if (!selected || selected.isCollapsed || !selected.rangeCount) return;
    const range = selected.getRangeAt(0);
    const parent = (range.commonAncestorContainer.nodeType === 1
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement) as HTMLElement | null;
    const paper = parent?.closest<HTMLElement>('.pdf-paper');
    if (!paper) return;
    const selectedPage = Number(paper.dataset.page);
    if (selectedPage !== page) go(selectedPage);
    const box = paper.getBoundingClientRect();
    setSelection({
      text: selected.toString(),
      rects: Array.from(range.getClientRects()).map((rect) => [
        (rect.left - box.left) / box.width,
        (rect.top - box.top) / box.height,
        rect.width / box.width,
        rect.height / box.height,
      ]),
    });
  };

  const visible = isMobile
    ? [page]
    : mode === 'spread'
      ? [page, Math.min(page + 1, doc?.numPages ?? page)]
      : mode === 'continuous'
        ? Array.from({ length: Math.min(3, (doc?.numPages ?? 1) - Math.max(1, page - 1) + 1) }, (_, index) => Math.max(1, page - 1) + index)
        : [page];

  if (!documentId) {
    return <div className="empty"><h3>Abra uma apostila para começar</h3><p>Importe seu PDF na biblioteca. O original será preservado.</p></div>;
  }

  return (
    <div className={focus ? 'reader focus-reader' : 'reader'}>
      <div className="reader-title">
        <div><span className="eyebrow">SUA SALA DE LEITURA</span><h2>{active?.data.title ?? 'Apostila'}</h2></div>
        <Button variant="outline" onClick={() => setFocus(!focus)}><Maximize size={16}/>{focus ? 'Sair da concentração' : 'Concentração'}</Button>
      </div>

      <div className="reader-toolbar">
        <div className="reader-pager" aria-label="Navegação de páginas">
          <Button className="reader-page-button" variant="outline" onClick={() => go(page - 1)} disabled={busy || !doc || page <= 1}>
            <ArrowLeft size={18}/><span>Anterior</span>
          </Button>
          <label className="inline-label">
            <span>Página</span>
            <input
              aria-label="Número da página"
              type="number"
              inputMode="numeric"
              min={1}
              max={doc?.numPages ?? active?.data.pages ?? 1}
              value={pageDraft}
              disabled={busy || !doc}
              onChange={(event) => setPageDraft(event.target.value)}
              onBlur={commitPageDraft}
              onKeyDown={(event) => { if (event.key === 'Enter') { commitPageDraft(); event.currentTarget.blur(); } }}
            />
            <span>de {doc?.numPages ?? active?.data.pages ?? '—'}</span>
          </label>
          <Button className="reader-page-button" variant="outline" onClick={() => go(page + 1)} disabled={busy || !doc || page >= doc.numPages}>
            <span>Próxima</span><ArrowRight size={18}/>
          </Button>
        </div>

        <div className="reader-toolbar-options" aria-label="Ferramentas de leitura">
          <Button variant="ghost" size="icon" aria-label="Diminuir zoom" disabled={!doc} onClick={() => { fitWidth.current = false; setZoom((value) => Math.max(0.25, value - 0.1)); }}><ZoomOut size={18}/></Button>
          <span className="reader-zoom-label">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" aria-label="Aumentar zoom" disabled={!doc} onClick={() => { fitWidth.current = false; setZoom((value) => Math.min(3, value + 0.1)); }}><ZoomIn size={18}/></Button>
          <Button variant="ghost" onClick={() => { fitWidth.current = true; void fitPageToWidth(); }} disabled={!doc}>Ajustar largura</Button>
          <select aria-label="Modo de leitura" value={isMobile ? 'single' : mode} onChange={(event) => setMode(event.target.value)} disabled={!doc}>
            <option value="single">Uma página</option>
            <option value="spread" disabled={isMobile}>Duas páginas</option>
            <option value="continuous" disabled={isMobile}>Rolagem contínua</option>
          </select>
          <Button variant="ghost" size="icon" aria-label="Tela cheia" disabled={!doc} onClick={() => void container.current?.requestFullscreen().catch((error) => onError(message(error)))}><Maximize size={16}/></Button>
        </div>
      </div>

      <div className="reader-layout">
        {!isMobile && <aside className="reader-aside">
          <h3>Explorar apostila</h3>
          <label><Search size={16}/><input placeholder="Buscar no texto" value={query} onChange={(event) => setQuery(event.target.value)}/></label>
          <div className="stack">
            <Button variant="outline" disabled={!doc || !!process} onClick={() => void processPdf()}>Indexar texto do PDF</Button>
            <Button variant="outline" disabled={!doc || !!process} onClick={() => void processPdf(true)}>OCR da página atual</Button>
            {process && <><span>{process}: {Math.round(processProgress * 100)}%</span><Button variant="ghost" onClick={() => cancelProcess.current?.abort()}>Cancelar</Button></>}
          </div>
          {query && indexed.filter((item) => item.parent_id === documentId && String(item.data.text).toLowerCase().includes(query.toLowerCase())).slice(0, 30).map((item) => (
            <button className="search-result" key={item.id} onClick={() => go(Number(item.data.page))}>
              Página {String(item.data.page)}
              <small>{String(item.data.text).slice(Math.max(0, String(item.data.text).toLowerCase().indexOf(query.toLowerCase()) - 30), String(item.data.text).toLowerCase().indexOf(query.toLowerCase()) + 120)}</small>
            </button>
          ))}
          <h4>Sumário</h4>
          {outline.length ? outline.map((item, index) => <button key={`${item.page}-${index}`} className="search-result" onClick={() => go(item.page)}>{item.title}</button>) : <p className="muted">Sem índice interno.</p>}
          <h4>Marcadores</h4>
          {marks.filter((item) => item.parent_id === documentId).map((item) => <button className="search-result" key={item.id} onClick={() => go(Number(item.data.page))}>{String(item.data.name)} · p. {String(item.data.page)}</button>)}
          <Button variant="outline" onClick={() => {
            const name = window.prompt('Nome do marcador', `Página ${page}`);
            if (name) void save(user, 'bookmarks', { name, page, document_id: documentId }, undefined, documentId).catch((error) => onError(message(error)));
          }}><Bookmark size={15}/>Marcar página</Button>
          <div className="thumbnail-list">
            {doc && Array.from({ length: Math.min(5, doc.numPages - Math.max(1, page - 2) + 1) }, (_, index) => Math.max(1, page - 2) + index).map((number) => (
              <button key={number} onClick={() => go(number)} aria-label={`Abrir página ${number}`}><PdfPage pdf={doc} page={number} scale={0.18}/><span>{number}</span></button>
            ))}
          </div>
        </aside>}

        <div
          ref={container}
          className={`pdf-view ${animation ? 'page-motion' : ''}`}
          onMouseUp={captureSelection}
          onTouchStart={(event) => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
          onTouchEnd={(event) => {
            const start = touchStart.current;
            touchStart.current = null;
            if (!isMobile || !start || !fitWidth.current) return;
            const deltaX = event.changedTouches[0].clientX - start.x;
            const deltaY = event.changedTouches[0].clientY - start.y;
            if (Math.abs(deltaX) > 70 && Math.abs(deltaY) < 55) go(page + (deltaX < 0 ? 1 : -1));
          }}
          onScroll={() => {
            if (scrollTimer.current) clearTimeout(scrollTimer.current);
            scrollTimer.current = setTimeout(() => {
              void persist({ scroll: container.current?.scrollTop ?? 0 }).catch((error) => onError(message(error)));
            }, 500);
          }}
        >
          {busy && <div className="reader-state" role="status"><RefreshCw className="spin" size={22}/><span>Abrindo o leitor…</span><small>A primeira página aparece assim que estiver pronta.</small></div>}
          {!busy && loadError && <div className="reader-state reader-state-error" role="alert"><strong>Não foi possível abrir esta apostila.</strong><span>{loadError}</span><Button variant="outline" onClick={() => setRetry((value) => value + 1)}><RefreshCw size={16}/>Tentar novamente</Button></div>}
          {!busy && !loadError && doc && (
            <div className={mode === 'spread' && !isMobile ? 'spread-pages' : ''}>
              {Array.from(new Set(visible)).map((number) => (
                <div
                  key={`${documentId}-${number}`}
                  className="pdf-paper"
                  data-page={number}
                  onPointerDown={(event) => {
                    if (tool !== 'draw') return;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    const rect = event.currentTarget.getBoundingClientRect();
                    strokes.current = [[(event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height]];
                  }}
                  onPointerMove={(event) => {
                    if (tool !== 'draw' || !event.buttons) return;
                    const rect = event.currentTarget.getBoundingClientRect();
                    strokes.current.push([(event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height]);
                  }}
                  onPointerUp={() => {
                    if (tool === 'draw' && strokes.current.length > 1) {
                      void save(user, 'annotations', { document_id: documentId, page: number, kind: 'drawing', points: strokes.current, color, body: 'Desenho' }, undefined, documentId)
                        .catch((error) => onError(message(error)));
                      strokes.current = [];
                    }
                  }}
                >
                  <PdfPage
                    pdf={doc}
                    page={number}
                    scale={zoom}
                    textLayer={tool === 'select'}
                    onError={onError}
                    onRendered={() => {
                      if (number === page && !restoredScroll.current) {
                        restoredScroll.current = true;
                        if (!isMobile && container.current && savedScroll.current) container.current.scrollTop = savedScroll.current;
                      }
                    }}
                    onLink={go}
                  />
                  {annotations.filter((item) => item.parent_id === documentId && item.data.page === number).map((item) => item.data.kind === 'drawing'
                    ? <svg className="drawing-overlay" key={item.id} viewBox="0 0 1 1" preserveAspectRatio="none"><polyline points={(item.data.points as number[][]).map((point) => point.join(',')).join(' ')} fill="none" stroke={String(item.data.color)} strokeWidth=".003"/></svg>
                    : <div className="annotation-overlay" key={item.id}>{((item.data.rects ?? []) as number[][]).map((rect, index) => <span key={index} title={String(item.data.body || item.data.quote)} style={{ left: `${rect[0] * 100}%`, top: `${rect[1] * 100}%`, width: `${rect[2] * 100}%`, height: `${rect[3] * 100}%`, background: String(item.data.color), opacity: 0.33, borderBottom: item.data.kind === 'underline' ? '2px solid #183e78' : undefined }}/>)}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="reader-notes">
          <h3>Anotações da página</h3>
          <p className="muted">Selecione um trecho para destacar e consultar o vocabulário.</p>
          <div className="row">
            {['#facc15', '#86efac', '#93c5fd', '#fca5a5'].map((entry) => <button key={entry} className={`swatch ${color === entry ? 'selected' : ''}`} style={{ background: entry }} onClick={() => setColor(entry)} aria-label={`Cor ${entry}`}/>)}
            <Button variant="ghost" size="icon" aria-label="Desenhar" onClick={() => setTool(tool === 'draw' ? 'select' : 'draw')}><PenLine size={18}/></Button>
          </div>
          {selection && <div className="selection-box">
            <q>{selection.text}</q>
            <div className="row"><Button size="sm" onClick={() => void addAnnotation().catch((error) => onError(message(error)))}><Highlighter size={14}/>Destacar</Button><Button size="sm" variant="outline" onClick={() => void addAnnotation('underline').catch((error) => onError(message(error)))}>Sublinhar</Button></div>
            {term ? <><strong>{term.translation}</strong><p>{term.context}</p><Button size="sm" variant="outline" onClick={() => void save(user, 'flashcards', { front: term.term, back: term.translation, deck: 'Da leitura', interval: 0, ease: 2.5, repetitions: 0, due: new Date().toISOString() }, undefined).catch((error) => onError(message(error)))}>Criar flashcard</Button></> : <p className="muted">Termo não cadastrado. Use a anotação para registrar sua tradução.</p>}
          </div>}
          <textarea aria-label="Anotação" placeholder="Uma dúvida, um conceito, uma conexão…" value={text} onChange={(event) => setText(event.target.value)}/>
          <Button onClick={() => void addAnnotation('note').catch((error) => onError(message(error)))} disabled={!text.trim()}>Salvar anotação</Button>
          {annotations.filter((item) => item.parent_id === documentId && item.data.page === page).map((item) => <div className="note-card" key={item.id}><q>{String(item.data.quote ?? '')}</q><p>{String(item.data.body)}</p></div>)}
          <Button variant="outline" onClick={() => void persist({ completed: Array.from(new Set([...(progress?.data.completed ?? []), page])) }).catch((error) => onError(message(error)))}><Check size={16}/>Concluir esta página</Button>
          <small>Progresso concluído: {progress?.data.completed.length ?? 0}/{doc?.numPages ?? active?.data.pages ?? 0} páginas.</small>
          <label className="check-label"><input type="checkbox" checked={animation} onChange={(event) => setAnimation(event.target.checked)}/>Transição suave</label>
          <Button variant="ghost" onClick={() => download(new Blob([JSON.stringify(annotations.filter((item) => item.parent_id === documentId), null, 2)], { type: 'application/json' }), 'anotacoes.json')}><FileText size={16}/>Exportar anotações</Button>
          <details><summary>Corrigir texto extraído</summary><textarea key={`${page}:${indexed.length}`} defaultValue={String(indexed.find((item) => item.parent_id === documentId && item.data.page === page)?.data.text ?? '')} onBlur={(event) => {
            const prior = indexed.find((item) => item.parent_id === documentId && item.data.page === page);
            void save(user, 'document_pages', { document_id: documentId, page, text: event.target.value, source: 'Correção manual' }, prior?.id, documentId).catch((error) => onError(message(error)));
          }}/></details>
        </aside>
      </div>
    </div>
  );
}

function PdfPage({
  pdf,
  page,
  scale,
  textLayer = false,
  onRendered,
  onLink,
  onError,
}: {
  pdf: PDFDocumentProxy;
  page: number;
  scale: number;
  textLayer?: boolean;
  onRendered?: () => void;
  onLink?: (page: number) => void;
  onError?: (error: string) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const [links, setLinks] = useState<{ rect: number[]; url?: string; dest?: unknown }[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState('');
  const [retry, setRetry] = useState(0);
  const callback = useRef(onRendered);
  callback.current = onRendered;

  useEffect(() => {
    let dead = false;
    let renderTask: { cancel: () => void } | undefined;
    let textTask: { cancel: () => void } | undefined;
    setLoading(true);
    setFailure('');
    setLinks([]);

    void (async () => {
      try {
        const pdfPage = await pdf.getPage(page);
        if (dead || !canvas.current) return;
        const viewport = pdfPage.getViewport({ scale });
        const mobile = window.matchMedia('(max-width: 760px)').matches;
        const deviceRatio = window.devicePixelRatio || 1;
        const maxRatio = mobile ? 3 : 2.5;
        const pixelBudgetRatio = Math.sqrt(16_000_000 / (viewport.width * viewport.height));
        const ratio = Math.max(1, Math.min(deviceRatio, maxRatio, pixelBudgetRatio));
        const element = canvas.current;
        element.width = Math.floor(viewport.width * ratio);
        element.height = Math.floor(viewport.height * ratio);
        element.style.width = `${viewport.width}px`;
        element.style.height = `${viewport.height}px`;
        setSize({ width: viewport.width, height: viewport.height });

        const task = pdfPage.render({
          canvas: element,
          viewport,
          transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0],
        });
        renderTask = task;
        await task.promise;
        if (dead) return;
        setLoading(false);
        callback.current?.();

        if (textLayer && layer.current) {
          layer.current.replaceChildren();
          layer.current.style.setProperty('--scale-factor', String(scale));
          const lib = await pdfjs();
          const text = new lib.TextLayer({ textContentSource: await pdfPage.getTextContent(), container: layer.current, viewport });
          textTask = text;
          await text.render();
        }

        const annotations = await pdfPage.getAnnotations();
        if (!dead) {
          setLinks(annotations.filter((item) => item.subtype === 'Link').map((item) => {
            const rect = viewport.convertToViewportRectangle(item.rect);
            return {
              rect: [Math.min(rect[0], rect[2]), Math.min(rect[1], rect[3]), Math.abs(rect[2] - rect[0]), Math.abs(rect[3] - rect[1])],
              url: item.url,
              dest: item.dest,
            };
          }));
        }
      } catch (error) {
        if (!dead) {
          const reason = message(error);
          setFailure(reason);
          setLoading(false);
          onError?.(reason);
        }
      }
    })();

    return () => {
      dead = true;
      renderTask?.cancel();
      textTask?.cancel();
    };
  }, [pdf, page, scale, textLayer, onError, retry]);

  return <div className="pdf-render" style={{ width: size.width || undefined, height: size.height || undefined }}>
    <canvas ref={canvas}/>
    {textLayer && <div className="textLayer" ref={layer}/>}
    {loading && !failure && <div className="pdf-page-state" role="status">Renderizando página…</div>}
    {failure && <div className="pdf-page-state pdf-page-state-error" role="alert"><span>Não foi possível renderizar esta página.</span><Button variant="outline" onClick={() => setRetry((value) => value + 1)}>Tentar novamente</Button></div>}
    {links.map((link, index) => <a
      key={index}
      aria-label="Link do documento"
      className="pdf-link"
      href={link.url && /^https?:/.test(link.url) ? link.url : undefined}
      target={link.url ? '_blank' : undefined}
      rel="noopener noreferrer"
      style={{ left: link.rect[0], top: link.rect[1], width: link.rect[2], height: link.rect[3] }}
      onClick={(event) => {
        if (!link.url) {
          event.preventDefault();
          void (async () => {
            let destination = link.dest;
            if (typeof destination === 'string') destination = await pdf.getDestination(destination);
            if (Array.isArray(destination) && destination[0]) onLink?.(await pdf.getPageIndex(destination[0]) + 1);
          })();
        }
      }}
    />)}
  </div>;
}
