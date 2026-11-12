import type { DocumentVersion, Edit, Material, Quote, Reference } from "./model.js";

export function createDossier(documents: Record<string, Material>) {
  const visible = new Map<string, DocumentVersion[]>();

  function publish(id: string) {
    if (visible.has(id)) return null;
    const document = Object.hasOwn(documents, id) ? documents[id] : undefined;
    if (!document) throw new Error(`Unknown document: ${id}`);
    const initial = { id, name: document.name, detail: document.detail, version: 1, sections: document.sections };
    visible.set(id, [initial]);
    return initial;
  }

  function amend(edits: Edit[], applied: string[]) {
    const changes = new Map<DocumentVersion, Map<string, string>>();
    for (const edit of edits) {
      if (edit.unlessAmended && applied.includes(edit.unlessAmended)) continue;
      const current = visible.get(edit.document)?.at(-1);
      if (!current?.sections.some(section => section.lines.some(line => line.id === edit.line))) {
        throw new Error(`Cannot amend ${edit.document}.${edit.line}`);
      }
      const replacements = changes.get(current) ?? new Map<string, string>();
      replacements.set(edit.line, edit.text);
      changes.set(current, replacements);
    }
    return [...changes].map(([current, replacements]) => {
      const revised = {
        ...current,
        version: current.version + 1,
        sections: current.sections.map(section => ({
          ...section,
          lines: section.lines.map(line => {
            const text = replacements.get(line.id);
            return text === undefined ? line : { ...line, text };
          }),
        })),
      };
      visible.get(current.id)!.push(revised);
      return revised;
    });
  }

  function quote(ref: Reference): Quote | null {
    const versions = visible.get(ref?.document);
    const document = versions?.find(item => item.version === ref.version);
    if (!versions || !document) return null;
    const section = document.sections.find(item => item.lines.some(line => line.id === ref.line));
    if (!section) return null;
    const { text } = section.lines.find(item => item.id === ref.line)!;
    const current = versions.at(-1)?.sections.flatMap(item => item.lines).find(item => item.id === ref.line);
    return {
      document: document.id, version: document.version, line: ref.line,
      name: document.name, label: section.label, text, current: current?.text === text,
    };
  }

  return { publish, amend, quote, has: (id: string) => visible.has(id), documents: () => [...visible.values()].flat() };
}
