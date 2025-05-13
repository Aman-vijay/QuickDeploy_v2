/* ---------- src/pages/Dashboard.tsx ---------- */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Github,
  Rocket,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/Buttons';

/* ── Type definitions ───────────────────────── */
interface User {
  username: string;
  email?: string | null;
  avatarUrl?: string | null;
  deployments: number;
}

interface Project {
  id: number;
  name: string;
  repo: string;
  status: 'not-deployed' | 'pending' | 'deployed' | 'failed';
  createdAt: string;
  commits?: number;
  branches?: number;
  deploymentUrl?: string;
  error?: string;
}

interface ApiUserResponse {
  user: User;
}
interface ApiReposResponse {
  repos: Array<{
    id: number;
    name: string;
    full_name: string;
    created_at: string;
    size: number;
  }>;
}

/* ── Status badge ───────────────────────────── */
const StatusBadge = ({ status }: { status: Project['status'] }) => {
  const styles = {
    deployed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'not-deployed': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  } as const;
  const icons = {
    deployed: <CheckCircle size={16} className="inline mr-1" />,
    pending: <Clock size={16} className="inline mr-1" />,
    failed: <AlertCircle size={16} className="inline mr-1" />,
    'not-deployed': <Clock size={16} className="inline mr-1" />,
  } as const;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {icons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

/* ── Metric card component ──────────────────── */
const Card = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col gap-2">
    <p className="text-gray-600 dark:text-gray-400">{title}</p>
    <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
      {icon} {value}
    </p>
  </div>
);

/* ── Project card component ─────────────────── */
const ProjectCard = ({
  project,
  onDeploy,
}: {
  project: Project;
  onDeploy: (repo: string) => void;
}) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{project.name}</h3>
      <StatusBadge status={project.status} />
    </div>

    <p className="text-gray-600 dark:text-gray-400 mb-2">
      <strong>Repository:</strong> {project.repo}
    </p>

    <div className="mt-4">
      {project.status === 'deployed' ? (
        <Button
          variant="primary"
          onClick={() => window.open(project.deploymentUrl, '_blank')}
          icon={<Rocket size={16} />}
        >
          View Deployment
        </Button>
      ) : (
        <Button
          variant={project.status === 'failed' ? 'danger' : 'secondary'}
          disabled={project.status === 'pending'}
          icon={<Rocket size={16} />}
          onClick={() => onDeploy(project.repo)}
        >
          {project.status === 'pending' ? 'Deploying…' : 'Deploy Now'}
        </Button>
      )}

      {project.status === 'failed' && (
        <p className="text-red-500 text-sm mt-2">{project.error}</p>
      )}
    </div>

    <div className="mt-4 flex justify-between text-gray-500 dark:text-gray-400 text-sm">
      <span>Commits: {project.commits ?? 'N/A'}</span>
      <span>Branches: {project.branches ?? 'N/A'}</span>
    </div>
  </div>
);

/* ── Dashboard page ─────────────────────────── */
const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  /* fetch user + repos */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    (async () => {
      try {
        const [{ data: u }, { data: r }] = await Promise.all([
          axios.get<ApiUserResponse>('http://localhost:8000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get<ApiReposResponse>('http://localhost:8000/api/auth/github/repos', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser(u.user);
        setProjects(
          r.repos.map((repo) => ({
            id: repo.id,
            name: repo.name,
            repo: repo.full_name,
            status: 'not-deployed',
            createdAt: repo.created_at,
            commits: repo.size,
            branches: 1,
          }))
        );

        setIsVisible(true);
        setLoading(false);
      } catch (err) {
        console.error(err);
        navigate('/login');
      }
    })();
  }, [navigate]);

  /* deploy handler */
  const handleDeploy = async (repoFullName: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.repo === repoFullName
          ? { ...p, status: 'pending', error: undefined }
          : p
      )
    );

    try {
      const { data } = await axios.post<{ url: string }>(
        'http://localhost:8000/api/auth/deploy',
        { repoFullName },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setProjects((prev) =>
        prev.map((p) =>
          p.repo === repoFullName
            ? { ...p, status: 'deployed', deploymentUrl: data.url }
            : p
        )
      );
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Deployment failed.  Please try again.';
      setProjects((prev) =>
        prev.map((p) =>
          p.repo === repoFullName ? { ...p, status: 'failed', error: msg } : p
        )
      );
    }
  };

  /* metrics */
  const total = projects.length;
  const deployed = projects.filter((p) => p.status === 'deployed').length;
  const rate = total ? (deployed / total) * 100 : 0;
  const latest =
    total &&
    new Date(
      [...projects].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0].createdAt
    ).toLocaleDateString();

  /* render */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 py-12 px-4">
      <div className="container mx-auto">
        <div
          className={`transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          {/* metric cards */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card title="Total Projects" value={total} icon={<Github size={18} />} />
              <Card title="Deployments" value={user?.deployments ?? 0} icon={<Rocket size={18} />} />
              <Card title="Deployment Rate" value={`${rate.toFixed(1)}%`} />
              <Card title="Latest Project" value={latest || 'N/A'} />
            </div>
          )}

          {/* project grid */}
          {loading ? (
            <p className="text-center text-gray-600 dark:text-gray-300">Loading…</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} onDeploy={handleDeploy} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
