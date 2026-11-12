export function createDossier(documents) {
  const visible = new Map();

  function publish(id) {
    if (visible.has(id)) return null;
    const document = documents[id];
    if (!document) throw new Error(`Unknown document: ${id}`);
    const initial = { id, name: document.name, detail: document.detail, version: 1, sections: document.sections };
    visible.set(id, [initial]);
    return initial;
  }

  function amend(edits, applied) {
    const changes = new Map();
    for (const edit of edits) {
      if (edit.unlessAmended && applied.includes(edit.unlessAmended)) continue;
      const current = visible.get(edit.document)?.at(-1);
      if (!current?.sections.some(section => section.lines.some(line => line.id === edit.line))) {
        throw new Error(`Cannot amend ${edit.document}.${edit.line}`);
      }
      if (!changes.has(current)) changes.set(current, new Map());
      changes.get(current).set(edit.line, edit.text);
    }
    return [...changes].map(([current, replacements]) => {
      const revised = {
        ...current,
        version: current.version + 1,
        sections: current.sections.map(section => ({
          ...section,
          lines: section.lines.map(line => replacements.has(line.id)
            ? { ...line, text: replacements.get(line.id) }
            : line),
        })),
      };
      visible.get(current.id).push(revised);
      return revised;
    });
  }

  function quote(ref) {
    const versions = visible.get(ref?.document);
    const document = versions?.find(item => item.version === ref.version);
    const section = document?.sections.find(item => item.lines.some(line => line.id === ref.line));
    if (!section) return null;
    const { text } = section.lines.find(item => item.id === ref.line);
    const current = versions.at(-1).sections.flatMap(item => item.lines).find(item => item.id === ref.line);
    return {
      document: document.id, version: document.version, line: ref.line,
      name: document.name, label: section.label, text, current: current?.text === text,
    };
  }

  return { publish, amend, quote, documents: () => [...visible.values()].flat() };
}
