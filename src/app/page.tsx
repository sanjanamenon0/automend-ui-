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
const STATUS_STYLES: Record<ProjectStatus, { dot: string; badge: string; label: string; barColor: string; chipBg: string; chipColor: string; hoverShadow: string; glowColor: string }> = {
  active: {
    dot:        'bg-[#4ADE80]',
    badge:      'bg-[#0a2e1a] text-[#4ADE80] border-[#1a4a2a]',
    label:      'Active',
    barColor:   '#4ADE80',
    chipBg:     'rgba(74,222,128,0.10)',
    chipColor:  '#4ADE80',
    hoverShadow: '0 8px 40px rgba(74,222,128,0.18), 0 2px 12px rgba(74,222,128,0.10)',
    glowColor:  'rgba(74,222,128,0.10)',
  },
  paused: {
    dot:        'bg-[#E8935A]',
    badge:      'bg-[#2e1a0a] text-[#E8935A] border-[#4a2a1a]',
    label:      'Paused',
    barColor:   '#E8935A',
    chipBg:     'rgba(232,147,90,0.10)',
    chipColor:  '#E8935A',
    hoverShadow: '0 8px 40px rgba(232,147,90,0.18), 0 2px 12px rgba(232,147,90,0.10)',
    glowColor:  'rgba(232,147,90,0.10)',
  },
  draft: {
    dot:        'bg-[#444444]',
    badge:      'bg-[#1a1a1a] text-[#666] border-[#2a2a2a]',
    label:      'Draft',
    barColor:   '#333333',
    chipBg:     'rgba(100,100,100,0.08)',
    chipColor:  '#555555',
    hoverShadow: '0 8px 40px rgba(100,100,100,0.12), 0 2px 12px rgba(100,100,100,0.06)',
    glowColor:  'rgba(100,100,100,0.06)',
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

// ─── Project Card ─────────────────────────────────────────────────────────────
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
      className="relative group rounded-xl p-5"
      style={{
        background: 'linear-gradient(145deg, #141414 0%, #0f0f0f 100%)',
        border: '1px solid #1f1f1f',
        transition: 'border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#2a2a2a'
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = s.hoverShadow
        const glow = e.currentTarget.querySelector<HTMLElement>('.card-glow')
        if (glow) glow.style.opacity = '1'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#1f1f1f'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
        const glow = e.currentTarget.querySelector<HTMLElement>('.card-glow')
        if (glow) glow.style.opacity = '0'
      }}
    >
      {/* Hover glow bloom — status-coloured radial behind card */}
      <div
        className="card-glow absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 100%, ${s.glowColor}, transparent)`,
          opacity: 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Left accent bar */}
      <div
        className="absolute top-0 left-0 bottom-0 w-[3px] rounded-l-xl"
        style={{ background: `linear-gradient(180deg, ${s.barColor} 0%, transparent 100%)` }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
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

        {/* Status chip + dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowStatus(!showStatus)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
            style={{ background: s.chipBg, color: s.chipColor, border: `1px solid ${s.chipColor}22` }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.chipColor }} />
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
        {/* Workflows pill */}
        <span
          className="flex items-center gap-1.5 px-2 py-1"
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 999, fontSize: 11 }}
        >
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
    <div className="min-h-screen grain" style={{ background: '#080808' }}>

      {/* ── Ambient aurora blobs ─────────────────────────────────────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        {/* Blob 1 — indigo/periwinkle, top-left */}
        <div
          className="aurora-1 absolute rounded-full"
          style={{
            width: 800,
            height: 600,
            top: '-10%',
            left: '-15%',
            background: 'radial-gradient(ellipse, rgba(107,127,232,0.35) 0%, rgba(107,127,232,0.12) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Blob 2 — saffron, bottom-right */}
        <div
          className="aurora-2 absolute rounded-full"
          style={{
            width: 700,
            height: 600,
            bottom: '-15%',
            right: '-15%',
            background: 'radial-gradient(ellipse, rgba(232,147,90,0.30) 0%, rgba(232,147,90,0.10) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Blob 3 — violet, center */}
        <div
          className="aurora-3 absolute rounded-full"
          style={{
            width: 600,
            height: 500,
            top: '25%',
            left: '35%',
            background: 'radial-gradient(ellipse, rgba(192,132,252,0.20) 0%, rgba(192,132,252,0.06) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header
        className="px-6 py-3 flex items-center justify-between sticky top-0 z-20"
        style={{
          background: 'rgba(8,8,8,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Gradient border bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent 0%, #2a2a2a 20%, #3B4EC4 50%, #2a2a2a 80%, transparent 100%)' }} />
        {/* Inner glow — sits just below nav */}
        <div className="absolute bottom-0 left-1/2 pointer-events-none"
          style={{ width: 400, height: 60, transform: 'translate(-50%, 50%)',
            background: 'radial-gradient(ellipse, rgba(107,127,232,0.06) 0%, transparent 70%)', zIndex: -1 }} />

        <div className="flex items-center gap-3">
          {/* Logo with glow ring */}
          <div className="relative">
            <div className="absolute inset-0 rounded-lg"
              style={{ background: 'rgba(107,127,232,0.25)', filter: 'blur(6px)', transform: 'scale(1.3)' }} />
            <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-[#3B4EC4] to-[#818cf8] flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
          </div>

          {/* Brand name with gradient */}
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(90deg, #ffffff 0%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'inline-block',
          }}>
            AutoMend
          </span>

          <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: '#141414', color: '#555', border: '1px solid #222' }}>v1.0</span>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all"
          style={{ background: '#E8935A', color: '#000000', borderRadius: 10, boxShadow: '0 0 16px rgba(232,147,90,0.30)' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#d4804a'; e.currentTarget.style.boxShadow = '0 0 24px rgba(232,147,90,0.50)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#E8935A'; e.currentTarget.style.boxShadow = '0 0 16px rgba(232,147,90,0.30)' }}
        >
          <Plus size={15} /> New Project
        </button>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <div className="px-6 pt-14 pb-8 max-w-5xl mx-auto text-center relative" style={{ zIndex: 1 }}>

        {/* Glow 1 — periwinkle, centered behind heading */}
        <div
          className="absolute left-1/2 pointer-events-none"
          style={{
            top: 0,
            width: 600,
            height: 300,
            transform: 'translateX(-50%)',
            background: 'radial-gradient(ellipse, rgba(107,127,232,0.12) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />
        {/* Glow 2 — saffron, slightly lower and offset right */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: 120,
            left: '55%',
            width: 400,
            height: 200,
            transform: 'translateX(-50%)',
            background: 'radial-gradient(ellipse, rgba(232,147,90,0.07) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />

        <motion.h1
          className="mb-0"
          style={{
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: 76,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.0,
            color: '#FFFFFF',
            position: 'relative',
            zIndex: 1,
          }}
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
        >
          From Alert to Action<br />
          <span style={{ color: '#E8935A' }}>in </span>
          <span style={{
            display: 'inline-block',
            background: 'linear-gradient(100deg, #818cf8 0%, #a78bfa 40%, #e879f9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Seconds</span>
        </motion.h1>

        <motion.p
          style={{
            color: '#555e6e',
            fontSize: 16,
            fontWeight: 400,
            marginTop: 24,
            marginBottom: 44,
            position: 'relative',
            zIndex: 1,
          }}
          className="max-w-lg mx-auto leading-relaxed"
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
        >
          AutoMend detects anomalies in your ML models and triggers
          the right remediation workflow with <span style={{ color: '#8892a4' }}>no manual intervention needed.</span>
        </motion.p>

        {/* Stats — 3 separate cards */}
        <motion.div
          className="inline-flex justify-center gap-3"
          style={{ position: 'relative', zIndex: 1 }}
          variants={fadeUp} initial="hidden" animate="visible" custom={3}
        >
          {[
            { label: 'Active',    value: counts.active,
              color: '#4ADE80', border: 'rgba(74,222,128,0.20)' },
            { label: 'Workflows', value: projects.reduce((acc, p) => acc + (p.workflows?.length || 0), 0),
              color: '#818cf8', border: 'rgba(129,140,248,0.20)' },
            { label: 'Draft',     value: counts.draft,
              color: '#555',    border: '#222' },
          ].map(stat => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1.5 px-7 py-4 rounded-2xl min-w-[100px]"
              style={{
                background: '#111111',
                border: `1px solid ${stat.border}`,
              }}
            >
              <span className="text-2xl font-bold tabular-nums" style={{ color: stat.color }}>{stat.value}</span>
              <span style={{ fontSize: 10, color: '#444', letterSpacing: '0.12em' }} className="uppercase">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 pb-14" style={{ position: 'relative', zIndex: 1 }}>

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
              className="add-card group rounded-xl flex flex-col items-center justify-center gap-4 min-h-[180px] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 w-full"
              style={{ background: 'transparent' }}
              onMouseEnter={e => {
                const svg = e.currentTarget.querySelector<SVGElement>('.add-border')
                if (svg) svg.style.opacity = '1'
                const bg = e.currentTarget.querySelector<HTMLElement>('.add-bg')
                if (bg) bg.style.opacity = '1'
              }}
              onMouseLeave={e => {
                const svg = e.currentTarget.querySelector<SVGElement>('.add-border')
                if (svg) svg.style.opacity = '0.4'
                const bg = e.currentTarget.querySelector<HTMLElement>('.add-bg')
                if (bg) bg.style.opacity = '0'
              }}
            >
              {/* SVG animated dashed border */}
              <svg className="add-border absolute inset-0 w-full h-full rounded-xl pointer-events-none"
                style={{ opacity: 0.4, transition: 'opacity 0.3s ease' }}
              >
                <rect
                  x="1" y="1"
                  width="calc(100% - 2px)" height="calc(100% - 2px)"
                  rx="11" ry="11"
                  fill="none"
                  stroke="url(#dashGrad)"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  style={{ animation: 'dash-march 1s linear infinite' }}
                />
                <defs>
                  <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%"   stopColor="#6B7FE8" />
                    <stop offset="50%"  stopColor="#E8935A" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Hover background bloom */}
              <div className="add-bg absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse 80% 70% at 50% 100%, rgba(107,127,232,0.06) 0%, transparent 70%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                }}
              />

              {/* Plus icon with pulse */}
              <div
                className="add-card-plus relative w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(107,127,232,0.15) 0%, rgba(232,147,90,0.10) 100%)',
                  border: '1px solid rgba(107,127,232,0.25)',
                  color: '#6B7FE8',
                }}
              >
                <Plus size={20} />
              </div>

              <div className="text-center relative">
                <p className="text-sm font-semibold text-[#555] group-hover:text-white transition-colors duration-300">New Project</p>
                <p className="text-xs text-[#333] group-hover:text-[#666] mt-0.5 transition-colors duration-300">Add a model to monitor</p>
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
