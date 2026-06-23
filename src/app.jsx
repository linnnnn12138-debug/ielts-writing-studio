const { useEffect, useMemo, useRef, useState } = React;

const TOPICS = [
  ["Education", "教育"],
  ["Technology", "科技"],
  ["Environment", "环境"],
  ["Crime", "犯罪"],
  ["Health", "健康"],
  ["Work", "工作"],
  ["Culture", "文化"],
  ["Society", "社会"],
  ["Government", "政府"],
  ["Media", "媒体"],
  ["Animals", "动物保护"],
  ["Globalisation", "全球化"]
];

const ESSAY_TYPES = [
  "Opinion Essay",
  "Discussion Essay",
  "Advantages and Disadvantages",
  "Problem and Solution",
  "Two-part Question",
  "Report / Chart Writing Task 1",
  "Letter Writing Task 1"
];

const STATUSES = ["草稿", "已完成", "已批改", "需要重写"];
const NOTE_TYPES = ["词汇问题", "语法问题", "逻辑问题", "结构问题", "好句积累", "老师反馈", "自我反思"];

const NAV_ITEMS = [
  ["dashboard", "Dashboard", "▦"],
  ["essays", "Essays", "▤"],
  ["topics", "Topics", "⌗"],
  ["types", "Essay Types", "◇"],
  ["notes", "Notes", "✎"],
  ["scores", "Scores", "◎"],
  ["revisions", "Revision History", "↺"],
  ["settings", "Settings", "⚙"]
];

const STORAGE_KEY = "ielts-writing-studio-v1";

const seedData = {
  essays: [
    {
      id: "essay-demo-1",
      title: "Should university education be free?",
      question: "Some people believe that university education should be free for everyone. To what extent do you agree or disagree?",
      content: "<p>Access to higher education has become an increasingly important public issue. While free university education could create a fairer society, I believe that a shared funding model is more practical and sustainable.</p><p>On the one hand, removing tuition fees would allow talented students from low-income families to pursue degrees without taking on substantial debt. This could improve social mobility and help countries develop a more highly skilled workforce.</p><p>On the other hand, fully funding every degree would place a considerable burden on taxpayers. A better approach would be to offer targeted grants while asking graduates to contribute once their income reaches a reasonable level.</p><p>In conclusion, university should be affordable and accessible, but it does not need to be completely free for all students.</p>",
      topic: "Education",
      essayType: "Opinion Essay",
      status: "已批改",
      targetScore: 7.5,
      currentScore: 7,
      writingDate: "2026-06-08",
      createdAt: "2026-06-08T10:00:00.000Z",
      updatedAt: "2026-06-10T14:30:00.000Z",
      revisionCount: 2
    },
    {
      id: "essay-demo-2",
      title: "The impact of remote work",
      question: "More people are working from home rather than travelling to an office. Do the advantages outweigh the disadvantages?",
      content: "<p>Remote work has changed how many organisations operate. Although it can reduce social interaction, its benefits for flexibility and productivity are generally more significant.</p>",
      topic: "Work",
      essayType: "Advantages and Disadvantages",
      status: "已完成",
      targetScore: 7,
      currentScore: 0,
      writingDate: "2026-06-11",
      createdAt: "2026-06-11T09:20:00.000Z",
      updatedAt: "2026-06-11T09:20:00.000Z",
      revisionCount: 0
    },
    {
      id: "essay-demo-3",
      title: "Urban traffic and pollution",
      question: "What problems are caused by traffic congestion in cities, and what measures could solve them?",
      content: "<p>Traffic congestion is a serious challenge in many large cities, causing both environmental damage and a decline in residents' quality of life.</p>",
      topic: "Environment",
      essayType: "Problem and Solution",
      status: "需要重写",
      targetScore: 7,
      currentScore: 6,
      writingDate: "2026-06-04",
      createdAt: "2026-06-04T11:00:00.000Z",
      updatedAt: "2026-06-07T16:00:00.000Z",
      revisionCount: 1
    }
  ],
  scores: [
    {
      id: "score-demo-1",
      essayId: "essay-demo-1",
      taskResponse: 7,
      coherence: 7,
      lexicalResource: 7,
      grammar: 7,
      overallScore: 7,
      feedback: "观点清晰，结构完整，能够回应题目要求。",
      improvementAdvice: "第二个主体段可以加入更具体的例子，并增加复杂句式的准确性。",
      nextTarget: 7.5,
      createdAt: "2026-06-10T14:30:00.000Z"
    },
    {
      id: "score-demo-2",
      essayId: "essay-demo-3",
      taskResponse: 6,
      coherence: 6.5,
      lexicalResource: 6,
      grammar: 5.5,
      overallScore: 6,
      feedback: "能够识别主要问题，但论证不够展开。",
      improvementAdvice: "每个解决方案需要解释实施方式和预期效果。",
      nextTarget: 6.5,
      createdAt: "2026-06-07T16:00:00.000Z"
    }
  ],
  notes: [
    {
      id: "note-demo-1",
      essayId: "essay-demo-1",
      noteType: "好句积累",
      title: "让步结构",
      content: "While free university education could create a fairer society, ...",
      relatedText: "While free university education...",
      isSolved: true,
      createdAt: "2026-06-10T14:45:00.000Z",
      updatedAt: "2026-06-10T14:45:00.000Z"
    },
    {
      id: "note-demo-2",
      essayId: "essay-demo-3",
      noteType: "逻辑问题",
      title: "解决方案缺少展开",
      content: "说明公共交通投资如何具体减少私家车使用。",
      relatedText: "Governments should improve public transport.",
      isSolved: false,
      createdAt: "2026-06-07T16:10:00.000Z",
      updatedAt: "2026-06-07T16:10:00.000Z"
    }
  ],
  revisions: []
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...seedData, ...JSON.parse(raw) } : seedData;
  } catch {
    return seedData;
  }
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function stripHtml(html = "") {
  const node = document.createElement("div");
  node.innerHTML = html;
  return node.textContent || "";
}

function wordCount(html = "") {
  const text = stripHtml(html).trim();
  if (!text) return 0;
  const english = text.match(/[A-Za-z]+(?:['-][A-Za-z]+)*/g) || [];
  const chinese = text.match(/[\u4e00-\u9fff]/g) || [];
  return english.length + chinese.length;
}

function replaceEditorText(editor, offset, length, replacement) {
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let position = 0;
  let node;

  while ((node = walker.nextNode())) {
    const start = position;
    const end = start + node.nodeValue.length;
    nodes.push({ node, start, end });
    position = end;
  }

  const startEntry = nodes.find((entry) => offset >= entry.start && offset <= entry.end);
  const endOffset = offset + length;
  const endEntry = nodes.find((entry) => endOffset >= entry.start && endOffset <= entry.end);
  if (!startEntry || !endEntry) return false;

  const range = document.createRange();
  range.setStart(startEntry.node, offset - startEntry.start);
  range.setEnd(endEntry.node, endOffset - endEntry.start);
  range.deleteContents();
  range.insertNode(document.createTextNode(replacement));
  return true;
}

function replaceTextInHtml(html, target, replacement) {
  const needle = target?.trim();
  if (!needle) return { html, replaced: false };

  const container = document.createElement("div");
  container.innerHTML = html || "";
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let node;

  while ((node = walker.nextNode())) {
    const index = node.nodeValue.indexOf(needle);
    if (index === -1) continue;

    node.nodeValue = `${node.nodeValue.slice(0, index)}${replacement || ""}${node.nodeValue.slice(index + needle.length)}`;
    return { html: container.innerHTML, replaced: true };
  }

  return { html, replaced: false };
}

function extractDirectRevisionNotes(html, essayId, createdAt) {
  const container = document.createElement("div");
  container.innerHTML = html || "";
  const notes = [];
  let group = null;

  const flush = () => {
    if (!group || (!group.deletedText && !group.addedText)) return;
    const relatedText = group.deletedText || group.addedText;
    notes.push({
      id: uid("note"),
      essayId,
      noteType: "老师反馈",
      title: "正文直接修订",
      content: "由修订模式自动同步。",
      relatedText,
      deletedText: group.deletedText,
      addedText: group.addedText,
      source: "direct",
      revisionStatus: "",
      isSolved: false,
      createdAt,
      updatedAt: createdAt
    });
    group = null;
  };

  const walk = (node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE && child.classList.contains("direct-revision")) {
        if (!group) group = { deletedText: "", addedText: "" };
        if (child.classList.contains("revision-delete")) group.deletedText += child.textContent || "";
        if (child.classList.contains("revision-add")) group.addedText += child.textContent || "";
        return;
      }
      if (child.nodeType === Node.TEXT_NODE && child.nodeValue.trim()) {
        flush();
        return;
      }
      if (child.nodeType === Node.ELEMENT_NODE) walk(child);
    });
  };

  walk(container);
  flush();
  return notes;
}

function isAutoDirectRevisionNote(note) {
  return note?.source === "direct" || note?.title === "正文直接修订" || note?.content === "由修订模式自动同步。";
}

function parseVocabulary(text = "") {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [term, ...rest] = line.split(/\s*(?:\||-|：|:)\s*/);
      return {
        term: term?.trim() || line,
        meaning: rest.join(" - ").trim()
      };
    });
}

function selectionInside(element) {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return null;
  const range = selection.getRangeAt(0);
  if (!element.contains(range.commonAncestorContainer)) return null;
  return { selection, range };
}

function moveCaretAfter(node) {
  const range = document.createRange();
  const selection = window.getSelection();
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function makeRevisionSpan(className, text) {
  const span = document.createElement("span");
  span.className = className;
  span.dataset.trackChange = "true";
  span.textContent = text;
  return span;
}

function previousMeaningfulNode(range) {
  let node = range.startContainer;

  if (node.nodeType === Node.TEXT_NODE) {
    if (range.startOffset > 0) return node;
    node = node.previousSibling || node.parentNode?.previousSibling;
  } else {
    node = node.childNodes[range.startOffset - 1] || node.previousSibling;
  }

  while (node && node.nodeType === Node.TEXT_NODE && !node.nodeValue.length) {
    node = node.previousSibling;
  }
  return node;
}

function isDirectRevision(node, className) {
  return node?.nodeType === Node.ELEMENT_NODE
    && node.classList.contains("direct-revision")
    && node.classList.contains(className);
}

function buildAnnotatedHtml(html, notes) {
  const container = document.createElement("div");
  container.innerHTML = html || "";

  notes
    .filter((note) => note.relatedText?.trim() && note.revisionStatus !== "accepted" && !isAutoDirectRevisionNote(note))
    .forEach((note) => {
      const target = note.relatedText.trim();
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      let node;

      while ((node = walker.nextNode())) {
        const index = node.nodeValue.indexOf(target);
        if (index === -1) continue;

        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + target.length);
        const mark = document.createElement("mark");
        mark.className = note.revisionStatus === "rejected" || note.isSolved ? "essay-annotation essay-annotation-solved" : "essay-annotation";
        mark.dataset.noteId = note.id;
        mark.title = `批注：${note.title}`;
        range.surroundContents(mark);
        if (note.revisionStatus !== "rejected" && (note.deletedText || note.addedText)) {
          mark.innerHTML = "";
          if (note.deletedText) {
            const del = document.createElement("span");
            del.className = "revision-delete inline";
            del.textContent = note.deletedText;
            mark.appendChild(del);
          }
          if (note.deletedText && note.addedText) {
            mark.appendChild(document.createTextNode(" "));
          }
          if (note.addedText) {
            const add = document.createElement("span");
            add.className = "revision-add inline";
            add.textContent = note.addedText;
            mark.appendChild(add);
          }
        }
        break;
      }
    });

  return container.innerHTML;
}

function formatDate(value, includeTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {})
  }).format(date);
}

function calculateOverall(values) {
  const nums = ["taskResponse", "coherence", "lexicalResource", "grammar"].map((key) => Number(values[key]) || 0);
  if (nums.every((n) => n === 0)) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / 4) * 2) / 2;
}

function StatusBadge({ status }) {
  const styles = {
    草稿: "bg-slate-100 text-slate-600",
    已完成: "bg-blue-50 text-blue-700",
    已批改: "bg-sage-50 text-sage-700",
    需要重写: "bg-amber-50 text-amber-700"
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] || styles["草稿"]}`}>{status}</span>;
}

function ScorePill({ score }) {
  return (
    <span className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-bold ${score ? "bg-ink text-white" : "bg-slate-100 text-slate-400"}`}>
      {score ? score.toFixed(1) : "—"}
    </span>
  );
}

function EmptyState({ title, description, action }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-50 text-xl text-sage-700">✦</div>
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
      {action}
    </div>
  );
}

function Modal({ title, children, onClose, wide = false }) {
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div className={`max-h-[92vh] w-full overflow-y-auto rounded-3xl bg-white shadow-2xl ${wide ? "max-w-5xl" : "max-w-xl"}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Sidebar({ page, setPage, onNewEssay }) {
  return (
    <aside className="desktop-sidebar fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200/80 bg-white px-4 py-6">
      <div className="mb-8 flex items-center gap-3 px-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-lg font-black text-white">I</div>
        <div>
          <div className="font-bold tracking-tight">IELTS Studio</div>
          <div className="text-xs text-slate-400">Writing workspace</div>
        </div>
      </div>
      <button onClick={onNewEssay} className="mb-6 flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
        <span className="text-lg">＋</span> 新建作文
      </button>
      <nav className="space-y-1">
        {NAV_ITEMS.map(([id, label, icon]) => (
          <button key={id} onClick={() => setPage(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${page === id ? "bg-sage-50 text-sage-700" : "text-slate-500 hover:bg-slate-50 hover:text-ink"}`}>
            <span className="w-5 text-center text-base">{icon}</span>
            {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl bg-mist p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Daily reminder</div>
        <div className="mt-2 text-sm font-semibold">Small progress, every day.</div>
        <div className="mt-1 text-xs leading-5 text-slate-500">今天也写下一个更清晰的观点。</div>
      </div>
    </aside>
  );
}

function MobileNav({ page, setPage, onNewEssay }) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
      <button onClick={() => setPage("dashboard")} className="font-bold">IELTS Studio</button>
      <select value={page} onChange={(e) => setPage(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
        {NAV_ITEMS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
      </select>
      <button onClick={onNewEssay} className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white">＋</button>
    </div>
  );
}

function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-sage-600">{eyebrow}</div>
        <h1 className="text-3xl font-bold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function Dashboard({ data, openEssay, onNewEssay, setPage }) {
  const scored = data.essays.filter((essay) => essay.currentScore > 0);
  const average = scored.length ? scored.reduce((sum, essay) => sum + essay.currentScore, 0) / scored.length : 0;
  const recent = [...data.essays].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4);
  const topicCounts = TOPICS.map(([topic, cn]) => ({ topic, cn, count: data.essays.filter((e) => e.topic === topic).length })).sort((a, b) => b.count - a.count);
  const maxTopic = Math.max(...topicCounts.map((item) => item.count), 1);

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="早上好，继续向 7.5 分前进"
        description="查看你的写作节奏、最近反馈和下一步练习重点。"
        action={<button onClick={onNewEssay} className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white">＋ 写一篇新作文</button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["总作文", data.essays.length, "篇写作记录", "▤"],
          ["已批改", scored.length, `${data.essays.length ? Math.round((scored.length / data.essays.length) * 100) : 0}% 完成评分`, "✓"],
          ["平均分", average ? average.toFixed(1) : "—", "IELTS Band", "◎"],
          ["待解决笔记", data.notes.filter((n) => !n.isSolved).length, "条需要回顾", "✎"]
        ].map(([label, value, hint, icon]) => (
          <div key={label} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between text-sm text-slate-500"><span>{label}</span><span className="text-sage-600">{icon}</span></div>
            <div className="mt-5 text-3xl font-bold tracking-tight">{value}</div>
            <div className="mt-2 text-xs text-slate-400">{hint}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold">最近作文</h2>
              <p className="mt-1 text-xs text-slate-400">按最后修改时间排序</p>
            </div>
            <button onClick={() => setPage("essays")} className="text-sm font-semibold text-sage-600">查看全部 →</button>
          </div>
          <div className="space-y-2">
            {recent.map((essay) => (
              <button key={essay.id} onClick={() => openEssay(essay.id)} className="flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition hover:bg-mist">
                <ScorePill score={essay.currentScore} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{essay.title}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-400">
                    <span>{essay.topic}</span><span>·</span><span>{essay.essayType}</span><span>·</span><span>{formatDate(essay.updatedAt)}</span>
                  </div>
                </div>
                <StatusBadge status={essay.status} />
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="mb-6">
            <h2 className="font-bold">主题分布</h2>
            <p className="mt-1 text-xs text-slate-400">找到练习较少的写作主题</p>
          </div>
          <div className="space-y-4">
            {topicCounts.slice(0, 6).map((item) => (
              <div key={item.topic}>
                <div className="mb-2 flex justify-between text-xs"><span className="font-medium">{item.topic} · {item.cn}</span><span className="text-slate-400">{item.count}</span></div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-sage-500" style={{ width: `${(item.count / maxTopic) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-3xl bg-ink p-6 text-white shadow-soft">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-sage-100">Next focus</div>
            <h2 className="mt-2 text-xl font-bold">把反馈变成下一篇作文的检查清单</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">回顾未解决笔记，在动笔前选择一个结构问题和一个语言问题作为本次练习目标。</p>
          </div>
          <button onClick={() => setPage("notes")} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-ink">回顾笔记</button>
        </div>
      </section>
    </>
  );
}

function EssaysPage({ data, openEssay, editEssay, onNewEssay, deleteEssay }) {
  const [filters, setFilters] = useState({ search: "", topic: "", type: "", status: "", score: "", sort: "updated-desc" });
  const filtered = useMemo(() => {
    let items = data.essays.filter((essay) => {
      const query = filters.search.toLowerCase();
      return (!query || essay.title.toLowerCase().includes(query) || essay.question.toLowerCase().includes(query))
        && (!filters.topic || essay.topic === filters.topic)
        && (!filters.type || essay.essayType === filters.type)
        && (!filters.status || essay.status === filters.status)
        && (!filters.score || (filters.score === "unscored" ? !essay.currentScore : essay.currentScore >= Number(filters.score)));
    });
    return items.sort((a, b) => filters.sort === "date-asc"
      ? new Date(a.writingDate) - new Date(b.writingDate)
      : filters.sort === "score-desc"
        ? b.currentScore - a.currentScore
        : new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [data.essays, filters]);

  const fieldClass = "rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-sage-500";

  return (
    <>
      <PageHeader eyebrow="Library" title="作文库" description={`${data.essays.length} 篇作文，持续积累你的写作作品集。`} action={<button onClick={onNewEssay} className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white">＋ 新建作文</button>} />
      <div className="mb-5 rounded-3xl border border-slate-100 bg-white p-4 shadow-soft">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="搜索标题或题目..." className={`${fieldClass} xl:col-span-2`} />
          <select value={filters.topic} onChange={(e) => setFilters({ ...filters, topic: e.target.value })} className={fieldClass}><option value="">全部主题</option>{TOPICS.map(([v, cn]) => <option key={v} value={v}>{v} · {cn}</option>)}</select>
          <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className={fieldClass}><option value="">全部题型</option>{ESSAY_TYPES.map((v) => <option key={v}>{v}</option>)}</select>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className={fieldClass}><option value="">全部状态</option>{STATUSES.map((v) => <option key={v}>{v}</option>)}</select>
          <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} className={fieldClass}><option value="updated-desc">最近修改</option><option value="date-asc">最早写作</option><option value="score-desc">分数最高</option></select>
        </div>
      </div>
      {filtered.length ? (
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wider text-slate-400">
                <tr><th className="px-6 py-4">作文</th><th className="px-4 py-4">分类</th><th className="px-4 py-4">日期</th><th className="px-4 py-4">分数</th><th className="px-4 py-4">修改</th><th className="px-4 py-4">状态</th><th className="px-6 py-4"></th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((essay) => (
                  <tr key={essay.id} className="group hover:bg-slate-50/60">
                    <td className="px-6 py-4"><button onClick={() => openEssay(essay.id)} className="max-w-sm text-left"><div className="truncate text-sm font-semibold">{essay.title}</div><div className="mt-1 truncate text-xs text-slate-400">{essay.question}</div></button></td>
                    <td className="px-4 py-4"><div className="text-xs font-medium">{essay.topic}</div><div className="mt-1 max-w-44 truncate text-xs text-slate-400">{essay.essayType}</div></td>
                    <td className="px-4 py-4 text-sm text-slate-500">{formatDate(essay.writingDate)}</td>
                    <td className="px-4 py-4"><ScorePill score={essay.currentScore} /></td>
                    <td className="px-4 py-4 text-sm text-slate-500">{essay.revisionCount || 0} 次</td>
                    <td className="px-4 py-4"><StatusBadge status={essay.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => editEssay(essay.id)} className="rounded-lg px-2 py-1 text-sm text-sage-600 hover:bg-sage-50">编辑</button>
                      <button onClick={() => deleteEssay(essay.id)} className="ml-1 rounded-lg px-2 py-1 text-sm text-rose-500 hover:bg-rose-50">删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : <EmptyState title="没有匹配的作文" description="调整筛选条件，或开始一篇新的写作练习。" action={<button onClick={onNewEssay} className="mt-5 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white">新建作文</button>} />}
    </>
  );
}

function EssayEditor({ essay, onSave, onClose }) {
  const isNew = !essay;
  const editorRef = useRef(null);
  const [form, setForm] = useState({
    title: "", question: "", content: "", topic: "Education", essayType: "Opinion Essay",
    status: "草稿", targetScore: 7, writingDate: new Date().toISOString().slice(0, 10),
    modelEssay: "", keyVocabulary: "",
    ...(essay || {})
  });
  const [saved, setSaved] = useState(false);
  const [editorWords, setEditorWords] = useState(() => wordCount(form.content));
  const [grammarState, setGrammarState] = useState({ loading: false, matches: [], checked: false, error: "" });
  const [trackChanges, setTrackChanges] = useState(false);
  const latestForm = useRef(form);
  const trackChangesRef = useRef(false);

  useEffect(() => {
    latestForm.current = {
      ...form,
      content: editorRef.current?.innerHTML ?? form.content
    };
  }, [form]);
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = form.content || "";
    }
  }, []);
  useEffect(() => {
    trackChangesRef.current = trackChanges;
  }, [trackChanges]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (latestForm.current.title || stripHtml(latestForm.current.content).trim()) {
        localStorage.setItem("ielts-editor-draft", JSON.stringify(latestForm.current));
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const command = (name, value = null) => {
    editorRef.current?.focus();
    document.execCommand(name, false, value);
    const content = editorRef.current?.innerHTML || "";
    latestForm.current = { ...latestForm.current, content };
    setEditorWords(wordCount(content));
  };

  const syncEditorContent = () => {
    const content = editorRef.current?.innerHTML || "";
    latestForm.current = { ...latestForm.current, content };
    setEditorWords(wordCount(content));
  };

  const insertRevisionAddition = (text) => {
    const context = selectionInside(editorRef.current);
    if (!context || !text) return false;
    const { range } = context;

    if (!range.collapsed) {
      const deleted = range.toString();
      range.deleteContents();
      const fragment = document.createDocumentFragment();
      fragment.appendChild(makeRevisionSpan("revision-delete inline direct-revision", deleted));
      fragment.appendChild(document.createTextNode(" "));
      const addition = makeRevisionSpan("revision-add inline direct-revision", text);
      fragment.appendChild(addition);
      range.insertNode(fragment);
      moveCaretAfter(addition);
      syncEditorContent();
      return true;
    }

    const previous = previousMeaningfulNode(range);
    if (isDirectRevision(previous, "revision-add")) {
      previous.textContent += text;
      moveCaretAfter(previous);
      syncEditorContent();
      return true;
    }

    const addition = makeRevisionSpan("revision-add inline direct-revision", text);
    range.insertNode(addition);
    moveCaretAfter(addition);
    syncEditorContent();
    return true;
  };

  const markSelectionDeleted = () => {
    const context = selectionInside(editorRef.current);
    if (!context) return false;
    const { range } = context;

    if (!range.collapsed) {
      const deleted = range.toString();
      if (!deleted) return false;
      range.deleteContents();
      const deletion = makeRevisionSpan("revision-delete inline direct-revision", deleted);
      range.insertNode(deletion);
      moveCaretAfter(deletion);
      syncEditorContent();
      return true;
    }

    const previous = previousMeaningfulNode(range);
    if (isDirectRevision(previous, "revision-add")) {
      previous.textContent = previous.textContent.slice(0, -1);
      if (!previous.textContent) {
        const anchor = previous.previousSibling || previous.parentNode;
        previous.remove();
        if (anchor?.nodeType === Node.TEXT_NODE) {
          const caret = document.createRange();
          const selection = window.getSelection();
          caret.setStart(anchor, anchor.nodeValue.length);
          caret.collapse(true);
          selection.removeAllRanges();
          selection.addRange(caret);
        }
      } else {
        moveCaretAfter(previous);
      }
      syncEditorContent();
      return true;
    }

    if (isDirectRevision(previous, "revision-delete")) {
      const beforePrevious = previous.previousSibling;
      if (beforePrevious?.nodeType === Node.TEXT_NODE && beforePrevious.nodeValue.length) {
        const deleted = beforePrevious.nodeValue.slice(-1);
        beforePrevious.nodeValue = beforePrevious.nodeValue.slice(0, -1);
        previous.textContent = deleted + previous.textContent;
        moveCaretAfter(previous);
        syncEditorContent();
        return true;
      }
      return false;
    }

    if (range.startContainer.nodeType !== Node.TEXT_NODE || range.startOffset === 0) return false;
    const textNode = range.startContainer;
    const before = textNode.nodeValue.slice(0, range.startOffset - 1);
    const deleted = textNode.nodeValue.slice(range.startOffset - 1, range.startOffset);
    const after = textNode.nodeValue.slice(range.startOffset);
    const deletion = makeRevisionSpan("revision-delete inline direct-revision", deleted);
    const afterNode = document.createTextNode(after);
    textNode.nodeValue = before;
    textNode.parentNode.insertBefore(deletion, textNode.nextSibling);
    textNode.parentNode.insertBefore(afterNode, deletion.nextSibling);
    moveCaretAfter(deletion);
    syncEditorContent();
    return true;
  };

  const handleTrackInput = (event) => {
    if (!trackChanges) return;
    const inputType = event.inputType || event.nativeEvent?.inputType;
    const data = event.data || event.nativeEvent?.data;
    if (inputType === "insertText" && data) {
      event.preventDefault();
      insertRevisionAddition(data);
      return;
    }
    if (inputType === "insertFromPaste") {
      const pasted = event.clipboardData?.getData("text/plain") || event.nativeEvent?.dataTransfer?.getData("text/plain");
      if (pasted) {
        event.preventDefault();
        insertRevisionAddition(pasted);
      }
      return;
    }
    if (inputType === "deleteContentBackward" || inputType === "deleteContentForward" || inputType === "deleteByCut") {
      event.preventDefault();
      markSelectionDeleted();
    }
  };

  const handleTrackPaste = (event) => {
    if (!trackChangesRef.current) return;
    const pasted = event.clipboardData?.getData("text/plain");
    if (!pasted) return;
    event.preventDefault();
    insertRevisionAddition(pasted);
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const onBeforeInput = (event) => {
      if (!trackChangesRef.current) return;
      const inputType = event.inputType;
      if (inputType === "insertText" && event.data) {
        event.preventDefault();
        insertRevisionAddition(event.data);
        return;
      }
      if (inputType === "insertFromPaste") {
        const pasted = event.dataTransfer?.getData("text/plain");
        if (pasted) {
          event.preventDefault();
          insertRevisionAddition(pasted);
        }
        return;
      }
      if (inputType === "deleteContentBackward" || inputType === "deleteContentForward" || inputType === "deleteByCut") {
        if (markSelectionDeleted()) event.preventDefault();
      }
    };

    const onKeyDown = (event) => {
      if (!trackChangesRef.current) return;
      if (event.key === "Backspace" || event.key === "Delete") {
        if (markSelectionDeleted()) event.preventDefault();
      }
    };

    editor.addEventListener("beforeinput", onBeforeInput);
    editor.addEventListener("keydown", onKeyDown);
    editor.addEventListener("paste", handleTrackPaste);
    return () => {
      editor.removeEventListener("beforeinput", onBeforeInput);
      editor.removeEventListener("keydown", onKeyDown);
      editor.removeEventListener("paste", handleTrackPaste);
    };
  }, []);

  const resolveDirectRevisions = (mode) => {
    if (!editorRef.current) return;
    const changes = Array.from(editorRef.current.querySelectorAll(".direct-revision"));
    changes.forEach((node) => {
      if (node.classList.contains("revision-delete")) {
        if (mode === "accept") node.remove();
        else node.replaceWith(document.createTextNode(node.textContent));
      } else if (node.classList.contains("revision-add")) {
        if (mode === "accept") node.replaceWith(document.createTextNode(node.textContent));
        else node.remove();
      }
    });
    editorRef.current.normalize();
    syncEditorContent();
  };

  const submit = () => {
    const content = editorRef.current?.innerHTML || form.content;
    if (!form.title.trim()) return alert("请先填写作文标题。");
    onSave({ ...form, content });
  };

  const checkGrammar = async () => {
    const text = editorRef.current?.textContent || "";
    if (!text.trim()) return alert("请先输入英文作文正文。");
    if (text.length > 20000) return alert("免费语法检查单次最多检查约 20,000 个字符。");

    setGrammarState({ loading: true, matches: [], checked: false, error: "" });
    try {
      const response = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ text, language: "en-US", enabledOnly: "false" })
      });
      if (!response.ok) throw new Error(`LanguageTool returned ${response.status}`);
      const result = await response.json();
      setGrammarState({ loading: false, matches: result.matches || [], checked: true, error: "" });
    } catch {
      setGrammarState({
        loading: false,
        matches: [],
        checked: true,
        error: "暂时无法连接 LanguageTool。请稍后重试，或检查网络连接。"
      });
    }
  };

  const applyGrammarSuggestion = (match, replacement) => {
    if (!editorRef.current || !replaceEditorText(editorRef.current, match.offset, match.length, replacement)) {
      return alert("正文已发生变化，请重新检查语法后再应用建议。");
    }
    const content = editorRef.current.innerHTML;
    latestForm.current = { ...latestForm.current, content };
    setEditorWords(wordCount(content));
    setGrammarState({ loading: false, matches: [], checked: false, error: "" });
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sage-500";
  return (
    <Modal title={isNew ? "新建作文" : "编辑作文"} onClose={onClose} wide>
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_260px]">
        <div className="space-y-5">
          <div><label className="mb-2 block text-xs font-semibold text-slate-500">作文标题</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="给这篇作文一个清晰的标题" /></div>
          <div><label className="mb-2 block text-xs font-semibold text-slate-500">IELTS 题目原文</label><textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className={`${inputClass} min-h-24`} placeholder="Paste the original IELTS question here..." /></div>
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <label className="text-xs font-semibold text-slate-500">作文正文</label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTrackChanges(!trackChanges)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold shadow-sm ${trackChanges ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700 hover:bg-rose-100"}`}
                >
                  {trackChanges ? "修订模式已开启" : "开启修订模式"}
                </button>
                <button type="button" onClick={() => resolveDirectRevisions("accept")} className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">接受全部</button>
                <button type="button" onClick={() => resolveDirectRevisions("reject")} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100">拒绝全部</button>
                <span className="text-xs text-slate-400">{editorWords} words</span>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 focus-within:border-sage-500">
              <div className="flex flex-wrap gap-1 border-b border-slate-100 bg-slate-50 p-2">
                {[["bold", "B"], ["italic", "I"], ["formatBlock", "H2", "h2"], ["formatBlock", "P", "p"], ["hiliteColor", "高亮", "#fff0b8"], ["insertUnorderedList", "列表"]].map(([cmd, label, value]) => (
                  <button key={`${cmd}-${label}`} type="button" onClick={() => command(cmd, value)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white">{label}</button>
                ))}
                <button type="button" onClick={checkGrammar} disabled={grammarState.loading} className="ml-auto rounded-lg bg-sage-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
                  {grammarState.loading ? "检查中..." : "✓ 语法检查"}
                </button>
              </div>
              {trackChanges && (
                <div className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-xs leading-5 text-rose-700">
                  修订模式已开启：Backspace 会留下红色删除线，新输入或粘贴内容会显示为绿色。
                </div>
              )}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => {
                  const content = e.currentTarget.innerHTML;
                  latestForm.current = { ...latestForm.current, content };
                  setEditorWords(wordCount(content));
                }}
                data-placeholder="在这里开始写作..."
                className="editor-content editor-placeholder min-h-[360px] px-5 py-4 text-[15px] leading-7 outline-none"
              />
            </div>
            {(grammarState.checked || grammarState.loading) && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold">LanguageTool 检查结果</h3>
                    <p className="mt-1 text-xs text-slate-400">正文会发送到 LanguageTool 公共服务进行检查。</p>
                  </div>
                  {!grammarState.loading && <button type="button" onClick={() => setGrammarState({ loading: false, matches: [], checked: false, error: "" })} className="text-xs text-slate-400">关闭</button>}
                </div>
                {grammarState.error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{grammarState.error}</p>}
                {grammarState.checked && !grammarState.error && !grammarState.matches.length && <p className="mt-4 rounded-xl bg-sage-50 p-3 text-sm text-sage-700">没有发现明显的拼写或语法问题。</p>}
                {!!grammarState.matches.length && (
                  <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
                    {grammarState.matches.map((match, index) => {
                      const sourceText = editorRef.current?.textContent || "";
                      const original = sourceText.slice(match.offset, match.offset + match.length);
                      return (
                        <div key={`${match.offset}-${index}`} className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">{original || "问题位置"}</span>
                            <span className="text-xs text-slate-400">{match.rule?.category?.name || "Grammar"}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-700">{match.message}</p>
                          {!!match.replacements?.length && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {match.replacements.slice(0, 5).map((item) => (
                                <button key={item.value} type="button" onClick={() => applyGrammarSuggestion(match, item.value)} className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-sage-700 shadow-sm">
                                  替换为 “{item.value}”
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold text-emerald-600">高分范文</label>
              <textarea
                value={form.modelEssay || ""}
                onChange={(e) => setForm({ ...form, modelEssay: e.target.value })}
                className={`${inputClass} min-h-56 bg-emerald-50/30 leading-7`}
                placeholder="在这里写入或粘贴高分范文，方便和自己的作文对照复习。"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-orange-600">重点词汇</label>
              <textarea
                value={form.keyVocabulary || ""}
                onChange={(e) => setForm({ ...form, keyVocabulary: e.target.value })}
                className={`${inputClass} min-h-56 bg-orange-50/40 leading-7`}
                placeholder={"每行一个：\ndriverless cars | 无人驾驶汽车\nautonomous vehicles | 自动驾驶车辆\nroad safety | 道路安全"}
              />
              <p className="mt-2 text-xs leading-5 text-slate-400">支持 “英文 | 中文”、“英文 - 中文” 或 “英文：中文”。</p>
            </div>
          </div>
        </div>
        <aside className="space-y-4">
          <div><label className="mb-2 block text-xs font-semibold text-slate-500">主题</label><select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className={inputClass}>{TOPICS.map(([v, cn]) => <option key={v} value={v}>{v} · {cn}</option>)}</select></div>
          <div><label className="mb-2 block text-xs font-semibold text-slate-500">题型</label><select value={form.essayType} onChange={(e) => setForm({ ...form, essayType: e.target.value })} className={inputClass}>{ESSAY_TYPES.map((v) => <option key={v}>{v}</option>)}</select></div>
          <div><label className="mb-2 block text-xs font-semibold text-slate-500">状态</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>{STATUSES.map((v) => <option key={v}>{v}</option>)}</select></div>
          <div><label className="mb-2 block text-xs font-semibold text-slate-500">写作日期</label><input type="date" value={form.writingDate} onChange={(e) => setForm({ ...form, writingDate: e.target.value })} className={inputClass} /></div>
          <div><label className="mb-2 block text-xs font-semibold text-slate-500">目标分数</label><select value={form.targetScore} onChange={(e) => setForm({ ...form, targetScore: Number(e.target.value) })} className={inputClass}>{Array.from({ length: 11 }, (_, i) => 4 + i * 0.5).map((v) => <option key={v}>{v}</option>)}</select></div>
          <div className="rounded-2xl bg-sage-50 p-4 text-xs leading-5 text-sage-700">
            <div className="font-semibold">自动保存已开启</div>
            <div className="mt-1 text-sage-600">{saved ? "刚刚保存了临时草稿" : "每 5 秒保存一次编辑草稿"}</div>
          </div>
        </aside>
      </div>
      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
        <button onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100">取消</button>
        <button onClick={submit} className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white">保存作文</button>
      </div>
    </Modal>
  );
}

function ScoreEditor({ essay, score, onSave, onClose }) {
  const [form, setForm] = useState(score || { taskResponse: 0, coherence: 0, lexicalResource: 0, grammar: 0, feedback: "", improvementAdvice: "", nextTarget: essay.targetScore || 7 });
  const overall = calculateOverall(form);
  const scoreOptions = Array.from({ length: 19 }, (_, i) => i * 0.5);
  const rows = [
    ["taskResponse", "Task Response / Achievement", "是否完整回应题目并充分展开观点"],
    ["coherence", "Coherence and Cohesion", "结构、段落组织和衔接是否自然"],
    ["lexicalResource", "Lexical Resource", "词汇范围、准确性和搭配"],
    ["grammar", "Grammatical Range and Accuracy", "句式多样性和语法准确性"]
  ];
  return (
    <Modal title={`评分 · ${essay.title}`} onClose={onClose}>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between rounded-2xl bg-ink p-5 text-white">
          <div><div className="text-xs text-slate-300">Overall Band</div><div className="mt-1 text-sm font-semibold">四项平均，按 0.5 分取整</div></div>
          <div className="text-4xl font-black">{overall.toFixed(1)}</div>
        </div>
        <div className="space-y-3">
          {rows.map(([key, label, hint]) => (
            <div key={key} className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4">
              <div className="min-w-0 flex-1"><div className="text-sm font-semibold">{label}</div><div className="mt-1 text-xs text-slate-400">{hint}</div></div>
              <select value={form[key]} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} className="rounded-xl border border-slate-200 px-3 py-2 font-bold">{scoreOptions.map((v) => <option key={v}>{v}</option>)}</select>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-4">
          <div><label className="mb-2 block text-xs font-semibold text-slate-500">总体反馈</label><textarea value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} className="min-h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-sage-500" /></div>
          <div><label className="mb-2 block text-xs font-semibold text-slate-500">改进建议</label><textarea value={form.improvementAdvice} onChange={(e) => setForm({ ...form, improvementAdvice: e.target.value })} className="min-h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-sage-500" /></div>
          <div><label className="mb-2 block text-xs font-semibold text-slate-500">下次目标分</label><select value={form.nextTarget} onChange={(e) => setForm({ ...form, nextTarget: Number(e.target.value) })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">{scoreOptions.slice(8).map((v) => <option key={v}>{v}</option>)}</select></div>
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4"><button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500">取消</button><button onClick={() => onSave({ ...form, overallScore: overall })} className="rounded-xl bg-ink px-5 py-2 text-sm font-semibold text-white">保存评分</button></div>
    </Modal>
  );
}

function NoteEditor({ essayId, initialRelatedText = "", onSave, onClose }) {
  const [form, setForm] = useState({
    noteType: "词汇问题",
    title: "",
    content: "",
    relatedText: initialRelatedText,
    deletedText: initialRelatedText,
    addedText: "",
    isSolved: false
  });
  const inputClass = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sage-500";
  return (
    <Modal title="添加修订与批注" onClose={onClose}>
      <div className="space-y-4 p-6">
        <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          在作文详情页选中原文后创建批注，保存后对应句子会高亮。删除内容显示为红色删除线，新增内容显示为绿色。
        </div>
        <div><label className="mb-2 block text-xs font-semibold text-slate-500">笔记类型</label><select value={form.noteType} onChange={(e) => setForm({ ...form, noteType: e.target.value })} className={inputClass}>{NOTE_TYPES.map((v) => <option key={v}>{v}</option>)}</select></div>
        <div><label className="mb-2 block text-xs font-semibold text-slate-500">标题</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="一句话概括问题" /></div>
        <div><label className="mb-2 block text-xs font-semibold text-slate-500">对应原文（用于正文高亮）</label><textarea value={form.relatedText} onChange={(e) => setForm({ ...form, relatedText: e.target.value })} className={`${inputClass} min-h-20`} placeholder="先在作文正文中选中句子，或在这里粘贴原文" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold text-rose-600">删除内容</label>
            <textarea value={form.deletedText} onChange={(e) => setForm({ ...form, deletedText: e.target.value })} className={`${inputClass} min-h-24 border-rose-200 bg-rose-50/50`} placeholder="需要删除或替换的原文" />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-emerald-600">新增内容</label>
            <textarea value={form.addedText} onChange={(e) => setForm({ ...form, addedText: e.target.value })} className={`${inputClass} min-h-24 border-emerald-200 bg-emerald-50/50`} placeholder="修改后的表达" />
          </div>
        </div>
        {(form.deletedText || form.addedText) && (
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">修订预览</div>
            <div className="mt-3 text-sm leading-7">
              {form.deletedText && <span className="revision-delete">{form.deletedText}</span>}
              {form.deletedText && form.addedText && <span className="mx-2 text-slate-300">→</span>}
              {form.addedText && <span className="revision-add">{form.addedText}</span>}
            </div>
          </div>
        )}
        <div><label className="mb-2 block text-xs font-semibold text-slate-500">笔记内容</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={`${inputClass} min-h-28`} placeholder="记录问题、修改方式或反馈..." /></div>
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4"><button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500">取消</button><button onClick={() => form.title.trim() ? onSave({ ...form, essayId }) : alert("请填写笔记标题。")} className="rounded-xl bg-ink px-5 py-2 text-sm font-semibold text-white">保存笔记</button></div>
    </Modal>
  );
}

function EssayDetail({ essay, data, onBack, onEdit, onScore, onNote, toggleNote, acceptRevisionNote, rejectRevisionNote, restoreRevision }) {
  const score = [...data.scores].reverse().find((item) => item.essayId === essay.id);
  const notes = data.notes.filter((item) => item.essayId === essay.id);
  const revisions = data.revisions.filter((item) => item.essayId === essay.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const pendingNotes = notes.filter((note) => !isAutoDirectRevisionNote(note) && note.revisionStatus !== "accepted" && note.revisionStatus !== "rejected");
  const vocabulary = parseVocabulary(essay.keyVocabulary || "");
  const originalHtml = essay.originalContent || essay.content || "<p>暂无正文</p>";
  const articleRef = useRef(null);
  const [selectedText, setSelectedText] = useState("");
  const annotatedHtml = useMemo(() => buildAnnotatedHtml(essay.content || "<p>暂无正文</p>", notes), [essay.content, notes]);

  const addNoteFromSelection = () => {
    if (selectedText) {
      onNote(selectedText);
      window.getSelection()?.removeAllRanges();
      setSelectedText("");
      return;
    }
    onNote("");
  };

  const focusNote = (noteId) => {
    const note = document.getElementById(`note-${noteId}`);
    note?.scrollIntoView({ behavior: "smooth", block: "center" });
    note?.classList.add("note-focus");
    setTimeout(() => note?.classList.remove("note-focus"), 1600);
  };

  return (
    <>
      <button onClick={onBack} className="mb-6 text-sm font-semibold text-slate-500 hover:text-ink">← 返回作文库</button>
      <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2"><StatusBadge status={essay.status} /><span className="text-xs text-slate-400">{essay.topic}</span><span className="text-xs text-slate-300">·</span><span className="text-xs text-slate-400">{essay.essayType}</span></div>
          <h1 className="max-w-4xl text-3xl font-bold tracking-tight">{essay.title}</h1>
          <p className="mt-2 text-sm text-slate-400">写于 {formatDate(essay.writingDate)} · {wordCount(essay.content)} words · 修改 {essay.revisionCount || 0} 次</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addNoteFromSelection} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${selectedText ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-200 bg-white"}`}>
            ＋ {selectedText ? `批注已选文字（${selectedText.length}）` : "批注选中文本"}
          </button>
          <button onClick={onScore} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold">◎ 评分</button>
          <button onClick={onEdit} className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white">编辑作文</button>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <main className="space-y-6">
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
            <div className="text-xs font-bold uppercase tracking-wider text-sage-600">IELTS Question</div>
            <p className="mt-3 text-base font-medium leading-7">{essay.question || "未填写题目原文"}</p>
          </section>
          <section className="rounded-3xl border border-slate-100 bg-white p-7 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">原本作文</h2>
                <p className="mt-1 text-xs text-slate-400">保留第一次写作内容，不受后续修订影响。</p>
              </div>
              <span className="text-xs text-slate-400">{wordCount(originalHtml)} words</span>
            </div>
            <div className="editor-content rounded-3xl bg-slate-50 p-7 text-[15px] leading-8 text-slate-700" dangerouslySetInnerHTML={{ __html: originalHtml }} />
          </section>
          <article
            ref={articleRef}
            onMouseUp={() => {
              const selection = window.getSelection();
              const anchor = selection?.anchorNode;
              setSelectedText(anchor && articleRef.current?.contains(anchor) ? selection.toString().trim() : "");
            }}
            className="rounded-3xl border border-sage-100 bg-white p-7 shadow-soft"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-sage-700">修订作文</h2>
                <p className="mt-1 text-xs text-slate-400">显示当前正文、直接修订和对应批注。</p>
              </div>
              <span className="rounded-full bg-sage-50 px-3 py-1 text-xs font-semibold text-sage-700">{pendingNotes.filter((note) => note.relatedText).length} 处待处理修订</span>
            </div>
            <div className="mb-5 rounded-2xl bg-sage-50 px-4 py-3 text-xs text-sage-700">选中修订作文中的句子或段落，然后点击“批注选中文本”。</div>
            <div
              className="editor-content text-[15px] leading-8 text-slate-700"
              onClick={(event) => {
                const mark = event.target.closest("[data-note-id]");
                if (mark) focusNote(mark.dataset.noteId);
              }}
              dangerouslySetInnerHTML={{ __html: annotatedHtml }}
            />
          </article>
          <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-emerald-600">高分范文</h2>
                <p className="mt-1 text-xs text-slate-400">用于和自己的作文结构、词汇和论证展开做对照。</p>
              </div>
              <button onClick={onEdit} className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">编辑范文</button>
            </div>
            {essay.modelEssay?.trim() ? (
              <div className="model-essay whitespace-pre-wrap rounded-3xl bg-slate-50 p-7 text-[17px] leading-9 text-slate-800">{essay.modelEssay}</div>
            ) : (
              <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-5 text-sm text-emerald-700">还没有高分范文。点击“编辑范文”写入或粘贴一篇范文。</div>
            )}
          </section>
          <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-orange-600">重点词汇</h2>
                <p className="mt-1 text-xs text-slate-400">按主题积累可以直接复用的表达。</p>
              </div>
              <button onClick={onEdit} className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">编辑词汇</button>
            </div>
            {vocabulary.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {vocabulary.map((item, index) => (
                  <div key={`${item.term}-${index}`} className="rounded-2xl border border-orange-100 bg-orange-50/40 p-5">
                    <div className="text-lg font-bold text-slate-900">{item.term}</div>
                    {item.meaning && <div className="mt-3 text-base text-slate-500">{item.meaning}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-5 text-sm text-orange-700">还没有重点词汇。点击“编辑词汇”按行添加。</div>
            )}
          </section>
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between"><h2 className="font-bold">修改历史</h2><span className="text-xs text-slate-400">{revisions.length} 个版本</span></div>
            {revisions.length ? <div className="space-y-3">{revisions.map((revision) => (
              <div key={revision.id} className="flex items-center justify-between rounded-2xl bg-mist p-4">
                <div><div className="text-sm font-semibold">{revision.revisionNote || "编辑作文内容"}</div><div className="mt-1 text-xs text-slate-400">{formatDate(revision.createdAt, true)} · {revision.scoreBefore || "—"} → {revision.scoreAfter || "—"}</div></div>
                <button onClick={() => restoreRevision(revision)} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-sage-700">恢复此版本</button>
              </div>
            ))}</div> : <p className="text-sm text-slate-400">首次修改后，这里会自动保留历史版本。</p>}
          </section>
        </main>
        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between"><h2 className="font-bold">IELTS 评分</h2><ScorePill score={essay.currentScore} /></div>
            {score ? <>
              <div className="space-y-3">{[["Task Response", score.taskResponse], ["Coherence", score.coherence], ["Lexical Resource", score.lexicalResource], ["Grammar", score.grammar]].map(([label, value]) => <div key={label} className="flex items-center justify-between text-sm"><span className="text-slate-500">{label}</span><span className="font-bold">{Number(value).toFixed(1)}</span></div>)}</div>
              {score.feedback && <div className="mt-5 rounded-2xl bg-sage-50 p-4"><div className="text-xs font-bold text-sage-700">反馈</div><p className="mt-2 text-sm leading-6 text-sage-700">{score.feedback}</p></div>}
              {score.improvementAdvice && <div className="mt-3 rounded-2xl bg-amber-50 p-4"><div className="text-xs font-bold text-amber-700">改进建议</div><p className="mt-2 text-sm leading-6 text-amber-800">{score.improvementAdvice}</p></div>}
            </> : <button onClick={onScore} className="w-full rounded-xl border border-dashed border-slate-200 py-4 text-sm font-semibold text-slate-500">添加第一次评分</button>}
          </section>
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between"><h2 className="font-bold">修订与批注</h2><button onClick={() => onNote("")} className="text-sm font-semibold text-sage-600">＋ 添加</button></div>
            {notes.length ? <div className="space-y-3">{notes.map((note) => (
              <div id={`note-${note.id}`} key={note.id} className={`rounded-2xl border p-4 transition ${note.isSolved ? "border-slate-100 bg-slate-50 opacity-80" : "border-amber-100 bg-amber-50/50"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-[11px] font-bold text-sage-600">{note.noteType}</div>
                      {note.revisionStatus === "accepted" && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">已接受</span>}
                      {note.revisionStatus === "rejected" && <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">已拒绝</span>}
                      {isAutoDirectRevisionNote(note) && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">已同步</span>}
                      {!note.revisionStatus && (note.deletedText || note.addedText) && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">待审批</span>}
                    </div>
                    <div className="mt-1 text-sm font-semibold">{note.title}</div>
                  </div>
                  <button onClick={() => toggleNote(note.id)} className="text-xs text-slate-400">{note.isSolved ? "已解决" : "标记解决"}</button>
                </div>
                {note.relatedText && <blockquote className="mt-3 border-l-2 border-sage-300 pl-3 text-xs italic leading-5 text-slate-500">{note.relatedText}</blockquote>}
                {(note.deletedText || note.addedText) && (
                  <div className="mt-3 rounded-xl bg-white p-3 text-sm leading-6">
                    {note.deletedText && <span className="revision-delete">{note.deletedText}</span>}
                    {note.deletedText && note.addedText && <span className="mx-2 text-slate-300">→</span>}
                    {note.addedText && <span className="revision-add">{note.addedText}</span>}
                  </div>
                )}
                <p className="mt-3 text-sm leading-6 text-slate-600">{note.content}</p>
                {(note.deletedText || note.addedText) && !isAutoDirectRevisionNote(note) && note.revisionStatus !== "accepted" && note.revisionStatus !== "rejected" && (
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => acceptRevisionNote(note.id)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">接受修订</button>
                    <button onClick={() => rejectRevisionNote(note.id)} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-600">拒绝</button>
                  </div>
                )}
              </div>
            ))}</div> : <p className="text-sm text-slate-400">还没有笔记。读完作文后，记录一个最值得改进的地方。</p>}
          </section>
        </aside>
      </div>
    </>
  );
}

function CategoriesPage({ title, subtitle, items, data, type, onSelect }) {
  return (
    <>
      <PageHeader eyebrow="Explore" title={title} description={subtitle} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => {
          const value = Array.isArray(item) ? item[0] : item;
          const secondary = Array.isArray(item) ? item[1] : `IELTS writing format ${index + 1}`;
          const count = data.essays.filter((essay) => type === "topic" ? essay.topic === value : essay.essayType === value).length;
          return (
            <button key={value} onClick={() => onSelect(value)} className="rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-sage-200">
              <div className="flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-50 font-bold text-sage-700">{String(index + 1).padStart(2, "0")}</div><span className="text-sm font-bold text-slate-400">{count} 篇</span></div>
              <h2 className="mt-5 font-bold">{value}</h2><p className="mt-2 text-sm text-slate-400">{secondary}</p>
            </button>
          );
        })}
      </div>
    </>
  );
}

function NotesPage({ data, toggleNote, openEssay }) {
  const [type, setType] = useState("");
  const notes = data.notes.filter((note) => !type || note.noteType === type);
  return (
    <>
      <PageHeader eyebrow="Review" title="笔记与批注" description="把零散反馈整理成可重复使用的写作知识。" action={<select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"><option value="">全部类型</option>{NOTE_TYPES.map((v) => <option key={v}>{v}</option>)}</select>} />
      <div className="grid gap-4 lg:grid-cols-2">
        {notes.map((note) => {
          const essay = data.essays.find((item) => item.id === note.essayId);
          return <div key={note.id} className={`rounded-3xl border bg-white p-6 shadow-soft ${note.isSolved ? "border-slate-100 opacity-70" : "border-amber-100"}`}>
            <div className="flex justify-between gap-4"><div><span className="rounded-full bg-sage-50 px-2.5 py-1 text-xs font-bold text-sage-700">{note.noteType}</span><h2 className="mt-4 font-bold">{note.title}</h2></div><button onClick={() => toggleNote(note.id)} className="text-xs font-semibold text-slate-400">{note.isSolved ? "重新打开" : "标记解决"}</button></div>
            {note.relatedText && <blockquote className="mt-4 border-l-2 border-sage-300 pl-4 text-sm italic leading-6 text-slate-500">{note.relatedText}</blockquote>}
            {(note.deletedText || note.addedText) && (
              <div className="mt-4 rounded-2xl bg-mist p-4 text-sm leading-7">
                {note.deletedText && <span className="revision-delete">{note.deletedText}</span>}
                {note.deletedText && note.addedText && <span className="mx-2 text-slate-300">→</span>}
                {note.addedText && <span className="revision-add">{note.addedText}</span>}
              </div>
            )}
            <p className="mt-4 text-sm leading-6 text-slate-600">{note.content}</p>
            <button onClick={() => essay && openEssay(essay.id)} className="mt-5 text-xs font-semibold text-sage-600">{essay?.title || "作文已删除"} →</button>
          </div>;
        })}
      </div>
      {!notes.length && <EmptyState title="没有匹配的笔记" description="在作文详情页中添加词汇、语法、逻辑或反馈笔记。" />}
    </>
  );
}

function ScoresPage({ data, openEssay }) {
  const scores = [...data.scores].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return (
    <>
      <PageHeader eyebrow="Progress" title="评分记录" description="对照 IELTS 四项标准，观察每次练习的变化。" />
      <div className="space-y-4">{scores.map((score) => {
        const essay = data.essays.find((item) => item.id === score.essayId);
        if (!essay) return null;
        return <button key={score.id} onClick={() => openEssay(essay.id)} className="grid w-full gap-5 rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-soft md:grid-cols-[1fr_auto] md:items-center">
          <div><div className="flex flex-wrap items-center gap-3"><ScorePill score={score.overallScore} /><div><h2 className="font-bold">{essay.title}</h2><p className="mt-1 text-xs text-slate-400">{formatDate(score.createdAt)} · {essay.topic}</p></div></div>{score.improvementAdvice && <p className="mt-4 text-sm text-slate-500">{score.improvementAdvice}</p>}</div>
          <div className="grid grid-cols-4 gap-4 text-center">{[["TR", score.taskResponse], ["CC", score.coherence], ["LR", score.lexicalResource], ["GRA", score.grammar]].map(([label, value]) => <div key={label}><div className="text-xs text-slate-400">{label}</div><div className="mt-1 font-bold">{Number(value).toFixed(1)}</div></div>)}</div>
        </button>;
      })}</div>
      {!scores.length && <EmptyState title="还没有评分记录" description="打开一篇作文，按照 IELTS 四项标准完成评分。" />}
    </>
  );
}

function RevisionsPage({ data, openEssay }) {
  const revisions = [...data.revisions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return (
    <>
      <PageHeader eyebrow="Versions" title="修改历史" description="每次保存重要修改时，旧版本都会保留在这里。" />
      {revisions.length ? <div className="relative ml-3 border-l border-slate-200 pl-7">{revisions.map((revision) => {
        const essay = data.essays.find((e) => e.id === revision.essayId);
        return <div key={revision.id} className="relative mb-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-soft before:absolute before:-left-[35px] before:top-7 before:h-3 before:w-3 before:rounded-full before:bg-sage-500 before:ring-4 before:ring-mist">
          <div className="flex flex-col justify-between gap-3 sm:flex-row"><div><div className="text-xs text-slate-400">{formatDate(revision.createdAt, true)}</div><h2 className="mt-2 font-bold">{essay?.title || "作文已删除"}</h2><p className="mt-2 text-sm text-slate-500">{revision.revisionNote}</p></div>{essay && <button onClick={() => openEssay(essay.id)} className="self-start rounded-xl bg-sage-50 px-3 py-2 text-xs font-semibold text-sage-700">查看作文</button>}</div>
        </div>;
      })}</div> : <EmptyState title="还没有修改历史" description="编辑并保存一篇现有作文后，系统会记录修改前后的版本。" />}
    </>
  );
}

function SettingsPage({ resetData, exportData, importData }) {
  const fileRef = useRef(null);
  return (
    <>
      <PageHeader eyebrow="Preferences" title="设置" description="管理本地数据和学习工作区。" />
      <div className="max-w-2xl space-y-5">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft"><h2 className="font-bold">数据备份</h2><p className="mt-2 text-sm leading-6 text-slate-500">所有数据保存在当前浏览器的 localStorage。建议定期导出 JSON 备份。</p><div className="mt-5 flex flex-wrap gap-3"><button onClick={exportData} className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white">导出数据</button><button onClick={() => fileRef.current.click()} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold">导入数据</button><input ref={fileRef} type="file" accept=".json" className="hidden" onChange={(e) => importData(e.target.files[0])} /></div></section>
        <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-soft"><h2 className="font-bold text-rose-600">重置工作区</h2><p className="mt-2 text-sm leading-6 text-slate-500">删除当前浏览器中的全部作文、评分、笔记和修改历史，并恢复示例数据。</p><button onClick={resetData} className="mt-5 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600">重置全部数据</button></section>
      </div>
    </>
  );
}

function App() {
  const [data, setData] = useState(loadData);
  const [page, setPage] = useState("dashboard");
  const [selectedEssayId, setSelectedEssayId] = useState(null);
  const [editorEssayId, setEditorEssayId] = useState(undefined);
  const [showEditor, setShowEditor] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [noteRelatedText, setNoteRelatedText] = useState("");
  const selectedEssay = data.essays.find((essay) => essay.id === selectedEssayId);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const openEssay = (id) => { setSelectedEssayId(id); setPage("essay-detail"); window.scrollTo(0, 0); };
  const startNew = () => { setEditorEssayId(undefined); setShowEditor(true); };
  const editEssay = (id) => { setEditorEssayId(id); setShowEditor(true); };

  const saveEssay = (form) => {
    const now = new Date().toISOString();
    if (editorEssayId) {
      const old = data.essays.find((e) => e.id === editorEssayId);
      const changed = old.content !== form.content || old.title !== form.title || old.question !== form.question;
      const syncedNotes = extractDirectRevisionNotes(form.content, old.id, now);
      const revision = changed ? {
        id: uid("revision"), essayId: old.id, oldContent: old.content, newContent: form.content,
        revisionNote: "编辑并保存作文", scoreBefore: old.currentScore || 0, scoreAfter: old.currentScore || 0, createdAt: now
      } : null;
      setData({
        ...data,
        essays: data.essays.map((e) => e.id === editorEssayId ? { ...e, ...form, originalContent: e.originalContent || old.content, updatedAt: now, revisionCount: (e.revisionCount || 0) + (changed ? 1 : 0) } : e),
        notes: [
          ...data.notes.filter((note) => note.essayId !== old.id || !isAutoDirectRevisionNote(note)),
          ...syncedNotes
        ],
        revisions: revision ? [...data.revisions, revision] : data.revisions
      });
      setSelectedEssayId(editorEssayId);
      setPage("essay-detail");
    } else {
      const essayId = uid("essay");
      const syncedNotes = extractDirectRevisionNotes(form.content, essayId, now);
      const essay = { ...form, id: essayId, originalContent: form.content, currentScore: 0, createdAt: now, updatedAt: now, revisionCount: 0 };
      setData({ ...data, essays: [essay, ...data.essays], notes: syncedNotes.length ? [...data.notes, ...syncedNotes] : data.notes });
      setSelectedEssayId(essay.id);
      setPage("essay-detail");
    }
    localStorage.removeItem("ielts-editor-draft");
    setShowEditor(false);
  };

  const deleteEssay = (id) => {
    if (!confirm("确定删除这篇作文吗？相关评分、笔记和修改记录也会被删除。")) return;
    setData({
      essays: data.essays.filter((e) => e.id !== id),
      scores: data.scores.filter((s) => s.essayId !== id),
      notes: data.notes.filter((n) => n.essayId !== id),
      revisions: data.revisions.filter((r) => r.essayId !== id)
    });
  };

  const saveScore = (form) => {
    const now = new Date().toISOString();
    const score = { ...form, id: uid("score"), essayId: selectedEssayId, createdAt: now };
    setData({
      ...data,
      scores: [...data.scores, score],
      essays: data.essays.map((e) => e.id === selectedEssayId ? { ...e, currentScore: form.overallScore, status: "已批改", updatedAt: now } : e)
    });
    setShowScore(false);
  };

  const saveNote = (form) => {
    const now = new Date().toISOString();
    setData({ ...data, notes: [...data.notes, { ...form, revisionStatus: "", id: uid("note"), createdAt: now, updatedAt: now }] });
    setShowNote(false);
    setNoteRelatedText("");
  };

  const openNoteEditor = (relatedText = "") => {
    setNoteRelatedText(relatedText);
    setShowNote(true);
  };

  const toggleNote = (id) => setData({ ...data, notes: data.notes.map((note) => note.id === id ? { ...note, isSolved: !note.isSolved, updatedAt: new Date().toISOString() } : note) });

  const acceptRevisionNote = (id) => {
    const note = data.notes.find((item) => item.id === id);
    const essay = data.essays.find((item) => item.id === note?.essayId);
    if (!note || !essay) return;
    const target = note.deletedText || note.relatedText;
    const replacement = note.addedText || "";
    const result = replaceTextInHtml(essay.content, target, replacement);
    if (!result.replaced) return alert("没有在正文中找到对应原文，可能正文已经改动。请重新创建批注或手动编辑作文。");

    const now = new Date().toISOString();
    const revision = {
      id: uid("revision"),
      essayId: essay.id,
      oldContent: essay.content,
      newContent: result.html,
      revisionNote: `接受修订：${note.title}`,
      scoreBefore: essay.currentScore || 0,
      scoreAfter: essay.currentScore || 0,
      createdAt: now
    };

    setData({
      ...data,
      essays: data.essays.map((item) => item.id === essay.id ? { ...item, content: result.html, updatedAt: now, revisionCount: (item.revisionCount || 0) + 1 } : item),
      notes: data.notes.map((item) => item.id === id ? { ...item, revisionStatus: "accepted", isSolved: true, updatedAt: now } : item),
      revisions: [...data.revisions, revision]
    });
  };

  const rejectRevisionNote = (id) => {
    const now = new Date().toISOString();
    setData({
      ...data,
      notes: data.notes.map((note) => note.id === id ? { ...note, revisionStatus: "rejected", isSolved: true, updatedAt: now } : note)
    });
  };

  const restoreRevision = (revision) => {
    if (!confirm("确定恢复到这个旧版本吗？当前内容仍会保存在新的修改记录中。")) return;
    const essay = data.essays.find((e) => e.id === revision.essayId);
    const now = new Date().toISOString();
    const backup = { id: uid("revision"), essayId: essay.id, oldContent: essay.content, newContent: revision.oldContent, revisionNote: "恢复历史版本", scoreBefore: essay.currentScore, scoreAfter: essay.currentScore, createdAt: now };
    setData({ ...data, essays: data.essays.map((e) => e.id === essay.id ? { ...e, content: revision.oldContent, updatedAt: now, revisionCount: (e.revisionCount || 0) + 1 } : e), revisions: [...data.revisions, backup] });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ielts-writing-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed.essays)) throw new Error();
        setData({ essays: parsed.essays || [], scores: parsed.scores || [], notes: parsed.notes || [], revisions: parsed.revisions || [] });
        alert("数据导入成功。");
      } catch { alert("无法导入：文件格式不正确。"); }
    };
    reader.readAsText(file);
  };

  const selectCategory = (value) => {
    setPage("essays");
    setTimeout(() => alert(`已进入作文库。你可以使用筛选器查看 ${value} 分类。`), 50);
  };

  let content;
  if (page === "dashboard") content = <Dashboard data={data} openEssay={openEssay} onNewEssay={startNew} setPage={setPage} />;
  else if (page === "essays") content = <EssaysPage data={data} openEssay={openEssay} editEssay={editEssay} onNewEssay={startNew} deleteEssay={deleteEssay} />;
  else if (page === "topics") content = <CategoriesPage title="作文主题" subtitle="按 IELTS 高频主题建立系统化素材库。" items={TOPICS} data={data} type="topic" onSelect={selectCategory} />;
  else if (page === "types") content = <CategoriesPage title="作文题型" subtitle="熟悉不同题型的任务要求和结构策略。" items={ESSAY_TYPES} data={data} type="type" onSelect={selectCategory} />;
  else if (page === "notes") content = <NotesPage data={data} toggleNote={toggleNote} openEssay={openEssay} />;
  else if (page === "scores") content = <ScoresPage data={data} openEssay={openEssay} />;
  else if (page === "revisions") content = <RevisionsPage data={data} openEssay={openEssay} />;
  else if (page === "settings") content = <SettingsPage exportData={exportData} importData={importData} resetData={() => { if (confirm("确定重置全部数据吗？")) { localStorage.removeItem(STORAGE_KEY); setData(seedData); } }} />;
  else if (page === "essay-detail" && selectedEssay) content = <EssayDetail essay={selectedEssay} data={data} onBack={() => setPage("essays")} onEdit={() => editEssay(selectedEssay.id)} onScore={() => setShowScore(true)} onNote={openNoteEditor} toggleNote={toggleNote} acceptRevisionNote={acceptRevisionNote} rejectRevisionNote={rejectRevisionNote} restoreRevision={restoreRevision} />;
  else content = <Dashboard data={data} openEssay={openEssay} onNewEssay={startNew} setPage={setPage} />;

  return (
    <div className="min-h-screen bg-mist">
      <Sidebar page={page} setPage={setPage} onNewEssay={startNew} />
      <MobileNav page={page === "essay-detail" ? "essays" : page} setPage={setPage} onNewEssay={startNew} />
      <main className="px-4 py-8 lg:ml-64 lg:px-10 xl:px-14 xl:py-10"><div className="mx-auto max-w-7xl">{content}</div></main>
      {showEditor && <EssayEditor essay={editorEssayId ? data.essays.find((e) => e.id === editorEssayId) : null} onSave={saveEssay} onClose={() => setShowEditor(false)} />}
      {showScore && selectedEssay && <ScoreEditor essay={selectedEssay} score={[...data.scores].reverse().find((s) => s.essayId === selectedEssay.id)} onSave={saveScore} onClose={() => setShowScore(false)} />}
      {showNote && selectedEssay && <NoteEditor essayId={selectedEssay.id} initialRelatedText={noteRelatedText} onSave={saveNote} onClose={() => { setShowNote(false); setNoteRelatedText(""); }} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
