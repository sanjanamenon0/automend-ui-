'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Plus, Zap, Activity, Clock, Edit2, ChevronRight, ChevronDown, Trash2, GitBranch } from 'lucide-react'
import { SAMPLE_PROJECTS, Project, ProjectStatus } from '@/lib/data'

// ─── Variants — hero only ─────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
}

const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.96, transition: { duration: 0.15, ease: 'easeIn' } },
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<ProjectStatus, { dot: string; badge: string; label: string; accentGradient: string }> = {
  active: {
    dot:            'bg-[#4ADE80]',
    badge:          'bg-[#0a2e1a] text-[#4ADE80] border-[#1a4a2a]',
    label:          'Active',
    accentGradient: 'linear-gradient(90deg, transparent, #4ADE80, transparent)',
  },
  paused: {
    dot:            'bg-[#E8935A]',
    badge:          'bg-[#2e1a0a] text-[#E8935A] border-[#4a2a1a]',
    label:          'Paused',
    accentGradient: 'linear-gradient(90deg, transparent, #E8935A, transparent)',
  },
  draft: {
    dot:            'bg-[#444444]',
    badge:          'bg-[#1a1a1a] text-[#666] border-[#2a2a2a]',
    label:          'Draft',
    accentGradient: 'linear-gradient(90deg, transparent, #444444, transparent)',
  },
}

// ─── New Project Modal ────────────────────────────────────────────────────────
function NewProjectModal({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (name: string, desc: string) => void
}) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-black/60"
        style={{ background: '#111111', border: '1px solid #1f1f1f' }}
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B4EC4] to-[#6B7FE8] flex items-center justify-center">
            <Plus size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">New Project</h2>
            <p className="text-xs text-[#666]">Create a new AutoMend project</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#666] mb-1.5 uppercase tracking-widest">Project Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Fraud Detection API"
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none transition-colors"
              style={{ background: '#0a0a0a', border: '1px solid #2a2a2a' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#666] mb-1.5 uppercase tracking-widest">Description</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="What model does this project monitor?"
              rows={3}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none transition-colors resize-none"
              style={{ background: '#0a0a0a', border: '1px solid #2a2a2a' }}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm text-[#666] rounded-xl hover:text-white transition-colors"
            style={{ border: '1px solid #2a2a2a' }}
          >
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onCreate(name, desc)}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2.5 text-sm font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{ background: '#E8935A', color: '#000000' }}
          >
            Create Project
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Workflows Popover — portal-rendered so it floats above all cards ─────────
function WorkflowsPopover({ project, anchorEl, onClose }: {
  project: Project
  anchorEl: HTMLElement
  onClose: () => void
}) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const rect = anchorEl.getBoundingClientRect()
  const top  = rect.bottom + window.scrollY + 4
  const left = rect.left   + window.scrollX

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !anchorEl.contains(e.target as Node)
      ) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose, anchorEl])

  return createPortal(
    <motion.div
      ref={popoverRef}
      style={{ position: 'absolute', top, left, width: 256, zIndex: 9999, background: '#111111', border: '1px solid #1f1f1f' }}
      className="rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <div className="px-4 py-3" style={{ borderBottom: '1px solid #1f1f1f', background: '#0a0a0a' }}>
        <p className="text-xs font-semibold text-white">{project.name}</p>
        <p className="text-xs text-[#555] mt-0.5">Workflows</p>
      </div>

      {project.workflows.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <GitBranch size={20} className="text-[#333] mx-auto mb-2" />
          <p className="text-xs text-[#555]">No workflows yet</p>
        </div>
      ) : (
        <div className="p-2">
          {project.workflows.map(w => (
            <button
              key={w.id}
              onClick={() => { window.location.href = `/workflow/${w.id}` }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group text-left hover:bg-[#1f1f1f]"
            >
              <div>
                <p className="text-xs font-medium text-white group-hover:text-[#6B7FE8] transition-colors">{w.name}</p>
                <p className="text-xs text-[#555] mt-0.5">{w.description}</p>
              </div>
              <Edit2 size={12} className="text-[#333] group-hover:text-[#6B7FE8] shrink-0 ml-2 transition-colors" />
            </button>
          ))}
        </div>
      )}

      <div className="px-2 pb-2">
        <button
          onClick={() => {
            const newWorkflowId = `${project.id}-${Date.now()}`
            const savedProjects = localStorage.getItem('automend-projects')
            const projects = savedProjects ? JSON.parse(savedProjects) : []
            const updated = projects.map((p: Project) =>
              p.id === project.id
                ? { ...p, workflows: [...(p.workflows || []), { id: newWorkflowId, name: 'New Workflow', description: '', createdAt: new Date().toISOString().split('T')[0] }] }
                : p
            )
            localStorage.setItem('automend-projects', JSON.stringify(updated))
            window.location.href = `/workflow/${newWorkflowId}`
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#555] hover:border-[#E8935A]/60 hover:text-[#E8935A] transition-colors"
          style={{ border: '1px dashed #2a2a2a' }}
        >
          <Plus size={12} /> Add New Workflow
        </button>
      </div>
    </motion.div>,
    document.body
  )
}

// ─── Project Card — plain div, CSS-only hover (no framer layout issues) ───────
function ProjectCard({ project, onDelete, onRename, onStatusChange }: {
  project: Project
  onDelete: () => void
  onRename: (id: string, name: string) => void
  onStatusChange: (id: string, status: ProjectStatus) => void
}) {
  const s = STATUS_STYLES[project.status]
  const [showWorkflows, setShowWorkflows] = useState(false)
  const [showStatus, setShowStatus]       = useState(false)
  const [editingName, setEditingName]     = useState<string | null>(null)
  const workflowBtnRef = useRef<HTMLButtonElement>(null)

  return (
    <div
      className="relative group rounded-xl p-5 transition-all duration-200 hover:-translate-y-1"
      style={{ background: '#111111', border: '1px solid #1f1f1f' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#1f1f1f')}
    >
      {/* Status accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px rounded-t-xl"
        style={{ background: s.accentGradient }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${s.dot} mt-0.5 shrink-0`} />
          {editingName !== null ? (
            <input
              autoFocus
              value={editingName}
              onChange={e => setEditingName(e.target.value)}
              onBlur={() => { onRename(project.id, editingName); setEditingName(null) }}
              onKeyDown={e => {
                if (e.key === 'Enter') { onRename(project.id, editingName); setEditingName(null) }
                if (e.key === 'Escape') setEditingName(null)
              }}
              className="text-sm font-semibold bg-transparent border-b border-[#E8935A] text-white focus:outline-none w-36"
            />
          ) : (
            <h3 className="font-semibold text-white text-sm" style={{ letterSpacing: '-0.01em' }}>{project.name}</h3>
          )}
          <button
            onClick={() => setEditingName(project.name)}
            className="text-[#333] hover:text-[#E8935A] transition-colors"
          >
            <Edit2 size={11} />
          </button>
        </div>

        {/* Status badge + dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowStatus(!showStatus)}
            className={`text-xs px-2 py-0.5 rounded-full border ${s.badge} flex items-center gap-1`}
          >
            {s.label}
            <ChevronDown size={9} />
          </button>
          <AnimatePresence>
            {showStatus && (
              <motion.div
                className="absolute right-0 top-full mt-1 rounded-lg shadow-xl shadow-black/60 z-50 overflow-hidden w-28"
                style={{ background: '#111111', border: '1px solid #1f1f1f' }}
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                {(['active', 'paused', 'draft'] as ProjectStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => { onStatusChange(project.id, status); setShowStatus(false) }}
                    className={`w-full text-left px-3 py-2 text-xs capitalize hover:bg-[#1f1f1f] transition-colors ${
                      project.status === status ? 'text-white font-medium' : 'text-[#555]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-xs text-[#666] mb-4 leading-relaxed line-clamp-2">{project.description}</p>

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs mb-4">
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <GitBranch size={10} className="text-[#6B7FE8]" />
          <span className="text-[#6B7FE8]">{project.workflows?.length || 0}</span>
          <span className="text-[#555]">workflow{(project.workflows?.length || 0) !== 1 ? 's' : ''}</span>
        </span>
        <span className="flex items-center gap-1.5 text-[#555]">
          <Clock size={11} />
          {project.lastRun ? project.lastRun : 'Never run'}
        </span>
        <span className="flex items-center gap-1.5 text-[#555]">
          <Activity size={11} />
          {project.createdAt}
        </span>
      </div>

      {/* Footer */}
      <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid #1f1f1f' }}>
        <button
          ref={workflowBtnRef}
          onClick={() => setShowWorkflows(!showWorkflows)}
          className={`flex items-center gap-1.5 text-xs font-medium transition-all px-3 py-1.5 rounded-lg ${
            showWorkflows
              ? 'bg-[#1a1a1a] text-[#6B7FE8] border border-[#2a2a2a]'
              : 'text-[#6B7FE8] hover:bg-[#1a1a1a]'
          }`}
        >
          <ChevronRight size={12} className={`transition-transform ${showWorkflows ? 'rotate-90' : ''}`} />
          View Workflows
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 text-xs text-[#333] hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-500/5 ml-auto"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <AnimatePresence>
        {showWorkflows && workflowBtnRef.current && (
          <WorkflowsPopover
            project={project}
            anchorEl={workflowBtnRef.current}
            onClose={() => setShowWorkflows(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Home Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [projects, setProjects]   = useState<Project[]>([])
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState<'all' | ProjectStatus>('all')

  useEffect(() => {
    const saved = localStorage.getItem('automend-projects')
    if (saved) {
      setProjects(JSON.parse(saved))
    } else {
      setProjects(SAMPLE_PROJECTS)
      localStorage.setItem('automend-projects', JSON.stringify(SAMPLE_PROJECTS))
    }
  }, [])

  const saveProjects = (updated: Project[]) => {
    setProjects(updated)
    localStorage.setItem('automend-projects', JSON.stringify(updated))
  }

  const handleCreate = (name: string, desc: string) => {
    const newProject: Project = {
      id: String(Date.now()),
      name,
      description: desc,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      lastRun: null,
      workflows: [],
    }
    const updated = [newProject, ...projects]
    localStorage.setItem('automend-projects', JSON.stringify(updated))
    setProjects(updated)
    setShowModal(false)
  }

  const handleDelete       = (id: string) => saveProjects(projects.filter(p => p.id !== id))
  const handleRename       = (id: string, name: string) => saveProjects(projects.map(p => p.id === id ? { ...p, name } : p))
  const handleStatusChange = (id: string, status: ProjectStatus) => saveProjects(projects.map(p => p.id === id ? { ...p, status } : p))

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || p.status === filter
    return matchSearch && matchFilter
  })

  const counts = {
    all:    projects.length,
    active: projects.filter(p => p.status === 'active').length,
    paused: projects.filter(p => p.status === 'paused').length,
    draft:  projects.filter(p => p.status === 'draft').length,
  }

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header
        className="px-6 py-3 flex items-center justify-between sticky top-0 z-10"
        style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #1a1a1a' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3B4EC4] to-[#6B7FE8] flex items-center justify-center ring-1 ring-[#6B7FE8]/30">
            <Zap size={14} className="text-white" />
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            AutoMend
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: '#1A1A1A', color: '#666', border: '1px solid #2a2a2a' }}>v1.0</span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-colors"
          style={{ background: '#E8935A', color: '#000000', borderRadius: 10 }}
          onMouseEnter={e => (e.currentTarget.style.background = '#d4804a')}
          onMouseLeave={e => (e.currentTarget.style.background = '#E8935A')}
        >
          <Plus size={15} /> New Project
        </button>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <div className="px-6 pt-14 pb-8 max-w-5xl mx-auto text-center">

        <motion.h1
          className="mb-5"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: 56, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1.0, color: '#FFFFFF' }}
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
        >
          From Alert to Action<br />
          <span style={{ color: '#E8935A' }}>in </span>
          <span style={{
            background: 'linear-gradient(90deg, #6B7FE8, #C084FC)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Seconds</span>
        </motion.h1>

        <motion.p
          style={{ color: '#6B7588', fontSize: 15, fontWeight: 400 }}
          className="max-w-md mx-auto leading-relaxed"
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
        >
          AutoMend detects anomalies in your ML models and triggers the right remediation
          workflow with no manual intervention needed.
        </motion.p>

        <motion.div
          className="flex gap-4 mt-8 justify-center flex-wrap"
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
        >
          {[
            { label: 'Active',    value: counts.active, color: '#E8935A' },
            { label: 'Workflows', value: projects.reduce((acc, p) => acc + (p.workflows?.length || 0), 0), color: '#6B7FE8' },
            { label: 'Draft',     value: counts.draft,  color: '#444444' },
          ].map(stat => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 px-6 py-3 min-w-[90px] transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: '#111111', border: '1px solid #1f1f1f', borderRadius: 14 }}
            >
              <span className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</span>
              <span style={{ fontSize: 10, color: '#444444', letterSpacing: '0.1em' }} className="uppercase">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 pb-14">

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div
            className="flex gap-1 rounded-xl p-1"
            style={{ background: '#111111', border: '1px solid #1f1f1f' }}
          >
            {(['all', 'active', 'paused', 'draft'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-all font-medium ${
                  filter === f
                    ? 'bg-[#1f1f1f] text-white'
                    : 'text-[#555555] hover:text-white'
                }`}
              >
                {f} <span className="opacity-50 ml-1">{counts[f]}</span>
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="flex-1 max-w-xs rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition-colors"
            style={{ background: '#111111', border: '1px solid #1f1f1f' }}
          />
          <span className="text-xs text-[#555] ml-auto">
            {filtered.length} project{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl border border-dashed border-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
              <Zap size={24} className="text-[#333]" />
            </div>
            <p className="text-sm font-medium text-[#555]">No projects found</p>
            <p className="text-xs mt-1 text-[#333]">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                onDelete={() => handleDelete(p.id)}
                onRename={handleRename}
                onStatusChange={handleStatusChange}
              />
            ))}

            <button
              onClick={() => setShowModal(true)}
              className="rounded-xl p-5 flex flex-col items-center justify-center gap-3 text-[#333] min-h-[180px]
                transition-all duration-200 hover:text-[#E8935A] hover:-translate-y-1"
              style={{ border: '1px dashed #2a2a2a' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#E8935A80')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
            >
              <div className="w-12 h-12 rounded-2xl border border-dashed border-current flex items-center justify-center transition-all duration-200 hover:scale-110">
                <Plus size={20} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">New Project</p>
                <p className="text-xs opacity-60 mt-0.5">Add a model to monitor</p>
              </div>
            </button>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showModal && <NewProjectModal onClose={() => setShowModal(false)} onCreate={handleCreate} />}
      </AnimatePresence>
    </div>
  )
}
