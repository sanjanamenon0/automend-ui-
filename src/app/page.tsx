'use client'
import { useState, useEffect, useRef } from 'react'
import { Plus, Zap, Activity, Clock, Edit2, ChevronRight, Trash2, GitBranch } from 'lucide-react'
import { SAMPLE_PROJECTS, Project, ProjectStatus } from '@/lib/data'

const STATUS_STYLES: Record<ProjectStatus, { dot: string; badge: string; label: string }> = {
  active:  { dot: 'bg-[#2ec4b6]', badge: 'bg-teal-500/10 text-teal-400 border-teal-500/30', label: 'Active' },
  paused:  { dot: 'bg-[#ffbe0b]', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', label: 'Paused' },
  draft:   { dot: 'bg-gray-500',  badge: 'bg-gray-500/10 text-gray-400 border-gray-500/30', label: 'Draft' },
}

function NewProjectModal({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (name: string, desc: string) => void
}) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#111827] border border-[#1e2d4a] rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-1">New Project</h2>
        <p className="text-sm text-[#7b8db0] mb-5">Create a new AutoMend project</p>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#7b8db0] mb-1.5 uppercase tracking-wider">Project Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Fraud Detection API"
              className="w-full bg-[#0a0e1a] border border-[#1e2d4a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#3a4a6b] focus:outline-none focus:border-[#2ec4b6] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7b8db0] mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="What model does this project monitor?"
              rows={3}
              className="w-full bg-[#0a0e1a] border border-[#1e2d4a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#3a4a6b] focus:outline-none focus:border-[#2ec4b6] transition-colors resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm text-[#7b8db0] border border-[#1e2d4a] rounded-lg hover:border-[#2e3d5a] hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onCreate(name, desc)}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#2ec4b6] text-[#0a0e1a] rounded-lg hover:bg-[#25a99d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  )
}

function WorkflowsPopover({ project, onClose }: { project: Project; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div ref={ref} className="absolute top-0 left-full ml-2 w-64 bg-[#111827] border border-[#1e2d4a] rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1e2d4a]">
        <p className="text-xs font-semibold text-white">{project.name}</p>
        <p className="text-xs text-[#7b8db0] mt-0.5">Workflows</p>
      </div>

      {project.workflows.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <GitBranch size={20} className="text-[#3a4a6b] mx-auto mb-2" />
          <p className="text-xs text-[#3a4a6b]">No workflows yet</p>
        </div>
      ) : (
        <div className="p-2">
          {project.workflows.map(w => (
            <button
              key={w.id}
              onClick={() => { window.location.href = `/workflow/${w.id}` }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#1e2d4a] transition-colors group text-left"
            >
              <div>
                <p className="text-xs font-medium text-white group-hover:text-[#2ec4b6] transition-colors">{w.name}</p>
                <p className="text-xs text-[#7b8db0] mt-0.5">{w.description}</p>
              </div>
              <Edit2 size={12} className="text-[#3a4a6b] group-hover:text-[#2ec4b6] shrink-0 ml-2 transition-colors" />
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
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[#1e2d4a] text-xs text-[#3a4a6b] hover:border-[#2ec4b6]/50 hover:text-[#2ec4b6] transition-colors"
        >
          <Plus size={12} /> Add New Workflow
        </button>
      </div>
    </div>
  )
}

function ProjectCard({ project, onDelete, onRename }: {
  project: Project
  onDelete: () => void
  onRename: (id: string, name: string) => void
}) {
  const s = STATUS_STYLES[project.status]
  const [showWorkflows, setShowWorkflows] = useState(false)
  const [editingName, setEditingName] = useState<string | null>(null)

  return (
    <div className="relative group bg-[#111827] border border-[#1e2d4a] rounded-xl p-5 hover:border-[#2ec4b6]/40 transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${s.dot} mt-0.5 shrink-0`} />
          {editingName !== null ? (
            <input
              autoFocus
              value={editingName}
              onChange={e => setEditingName(e.target.value)}
              onBlur={() => {
                onRename(project.id, editingName)
                setEditingName(null)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  onRename(project.id, editingName)
                  setEditingName(null)
                }
                if (e.key === 'Escape') setEditingName(null)
              }}
              className="text-sm font-semibold bg-transparent border-b border-[#2ec4b6] text-white focus:outline-none w-36"
            />
          ) : (
            <h3 className="font-semibold text-white text-sm">{project.name}</h3>
          )}
          <button
            onClick={() => setEditingName(project.name)}
            className="text-[#3a4a6b] hover:text-[#2ec4b6] transition-colors"
          >
            <Edit2 size={11} />
          </button>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${s.badge} shrink-0`}>{s.label}</span>
      </div>

      <p className="text-xs text-[#7b8db0] mb-4 leading-relaxed line-clamp-2">{project.description}</p>

      <div className="flex items-center gap-4 text-xs text-[#3a4a6b] mb-4">
        <span className="flex items-center gap-1.5">
          <GitBranch size={11} className="text-[#2ec4b6]" />
          {project.workflows?.length || 0} workflow{(project.workflows?.length || 0) !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={11} />
          {project.lastRun ? project.lastRun : 'Never run'}
        </span>
        <span className="flex items-center gap-1.5">
          <Activity size={11} />
          {project.createdAt}
        </span>
      </div>

      <div className="flex gap-2 pt-3 border-t border-[#1e2d4a]">
        <button
          onClick={() => setShowWorkflows(!showWorkflows)}
          className="flex items-center gap-1.5 text-xs text-[#7b8db0] hover:text-[#2ec4b6] transition-colors px-2 py-1 rounded hover:bg-teal-500/5"
        >
          <ChevronRight size={12} className={`transition-transform ${showWorkflows ? 'rotate-90' : ''}`} />
          View Workflows
        </button>
        <button onClick={onDelete} className="flex items-center gap-1.5 text-xs text-[#7b8db0] hover:text-[#e63946] transition-colors px-2 py-1 rounded hover:bg-red-500/5 ml-auto">
          <Trash2 size={12} />
        </button>
      </div>

      {showWorkflows && (
        <WorkflowsPopover project={project} onClose={() => setShowWorkflows(false)} />
      )}
    </div>
  )
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | ProjectStatus>('all')

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

  const handleDelete = (id: string) => {
    saveProjects(projects.filter(p => p.id !== id))
  }

  const handleRename = (id: string, name: string) => {
    saveProjects(projects.map(p => p.id === id ? { ...p, name } : p))
  }

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
    <div className="min-h-screen bg-[#0a0e1a]">
      <header className="border-b border-[#1e2d4a] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e63946] to-[#2ec4b6] flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-semibold text-white tracking-tight">AutoMend</span>
          <span className="text-[#3a4a6b] text-xs font-mono">v1.0</span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#2ec4b6] text-[#0a0e1a] text-sm font-medium rounded-lg hover:bg-[#25a99d] transition-colors"
        >
          <Plus size={15} /> New Project
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Projects</h1>
          <p className="text-sm text-[#7b8db0]">Manage your MLOps models and remediation workflows</p>
        </div>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex gap-1 bg-[#111827] border border-[#1e2d4a] rounded-lg p-1">
            {(['all', 'active', 'paused', 'draft'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs rounded-md capitalize transition-colors ${
                  filter === f ? 'bg-[#1e2d4a] text-white' : 'text-[#7b8db0] hover:text-white'
                }`}
              >
                {f} <span className="opacity-60 ml-1">{counts[f]}</span>
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="flex-1 max-w-xs bg-[#111827] border border-[#1e2d4a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#3a4a6b] focus:outline-none focus:border-[#2ec4b6] transition-colors"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-[#3a4a6b]">
            <Zap size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                onDelete={() => handleDelete(p.id)}
                onRename={handleRename}
              />
            ))}
            <button
              onClick={() => setShowModal(true)}
              className="border border-dashed border-[#1e2d4a] rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-[#3a4a6b] hover:border-[#2ec4b6]/50 hover:text-[#2ec4b6] transition-all min-h-[180px] group"
            >
              <div className="w-10 h-10 rounded-full border border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={18} />
              </div>
              <span className="text-sm font-medium">Add New Project</span>
            </button>
          </div>
        )}
      </main>

      {showModal && <NewProjectModal onClose={() => setShowModal(false)} onCreate={handleCreate} />}
    </div>
  )
}