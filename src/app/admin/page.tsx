'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Users, LayoutList, Clock, Search, FileJson, Edit3, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/tests/list');
      const data = await res.json();
      if (res.ok) {
        setTests(data.tests);
      }
    } catch (error) {
      console.error('Failed to fetch tests', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/tests/${testId}`, { method: 'DELETE' });
      if (res.ok) {
        setTests(tests.filter(t => t.testId !== testId));
      } else {
        alert('Failed to delete test');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your test library and view student attempts.</p>
        </div>
        <Link href="/admin/tests/create" className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Create New Test
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard icon={<LayoutList size={24} className="text-blue-400" />} title="Total Tests" value={tests.length.toString()} />
        <StatCard icon={<Users size={24} className="text-violet-400" />} title="Total Attempts" value="--" />
        <StatCard icon={<FileJson size={24} className="text-green-400" />} title="JSON Validated" value="100%" />
      </div>

      <div className="glass-panel p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Your Tests</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Search tests..." 
              className="bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileJson className="text-muted-foreground" size={28} />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No tests found</h3>
            <p className="text-muted-foreground mb-6">You haven't created any tests yet.</p>
            <Link href="/admin/tests/create" className="btn-primary inline-flex items-center gap-2">
              <Plus size={18} />
              Create First Test
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Test Name</th>
                  <th className="pb-3 font-medium">Test ID</th>
                  <th className="pb-3 font-medium">Questions</th>
                  <th className="pb-3 font-medium">Time (Sec)</th>
                  <th className="pb-3 font-medium">Created Date</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {tests.map(test => (
                  <tr key={test._id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="py-4 font-medium text-foreground">
                      <div>
                        {test.testName}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${test.settings?.isLive !== false ? 'bg-green-500/10 text-green-400' : 'bg-card0/10 text-muted-foreground'}`}>
                            {test.settings?.isLive !== false ? 'Live' : 'Draft'}
                          </span>
                          {test.settings?.strictSectionOrder && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                              Strict Order
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-muted-foreground">{test.testId}</td>
                    <td className="py-4 text-muted-foreground">{test.totalQuestions}</td>
                    <td className="py-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {Math.floor(test.totalTime / 60)} Mins
                      </div>
                    </td>
                    <td className="py-4 text-muted-foreground">{new Date(test.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => router.push(`/admin/tests/${test.testId}/edit`)}
                          className="p-2 text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors" title="Edit Test"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTest(test.testId)}
                          className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded transition-colors" title="Delete Test"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
  return (
    <div className="glass-panel p-6 flex items-center gap-4">
      <div className="p-3 bg-muted rounded-lg border border-border">
        {icon}
      </div>
      <div>
        <p className="text-muted-foreground text-sm mb-1">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
