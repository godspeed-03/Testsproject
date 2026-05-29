'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, AlertTriangle, FileJson, Eye, Save, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function CreateTestPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [jsonInput, setJsonInput] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toLocalISOString = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().slice(0, 16);
  };

  const handleValidateJSON = () => {
    setError('');
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.testId || !parsed.testName || !parsed.sections) {
        throw new Error('JSON missing required fields: testId, testName, or sections.');
      }
      
      // Merge with defaults so any missing fields are automatically populated
      parsed.settings = {
        isLive: parsed.settings?.isLive ?? true,
        strictSectionOrder: parsed.settings?.strictSectionOrder ?? false,
        goLiveDate: parsed.settings?.goLiveDate || new Date().toISOString(), // Auto-fill with current time
        allowPracticeMode: parsed.settings?.allowPracticeMode ?? true,
        allowTestMode: parsed.settings?.allowTestMode ?? true,
        timingMode: parsed.settings?.timingMode || 'full'
      };
      
      setParsedData(parsed);
      setStep(2);
    } catch (e: any) {
      setError(e.message || 'Invalid JSON format. Please check for syntax errors.');
    }
  };

  const handleSectionRename = (index: number, newName: string) => {
    const newData = { ...parsedData };
    newData.sections[index].sectionName = newName;
    setParsedData(newData);
  };

  const handleSectionMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === parsedData.sections.length - 1) return;
    
    const newData = { ...parsedData };
    const sections = [...newData.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    const temp = sections[index];
    sections[index] = sections[targetIndex];
    sections[targetIndex] = temp;
    
    newData.sections = sections;
    setParsedData(newData);
  };

  const handleSaveFinal = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/tests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create test');
      }

      setSuccess('Test created successfully!');
      setTimeout(() => {
        router.push('/admin');
      }, 1500);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const insertTemplate = () => {
    const template = {
      testId: `test-${Date.now()}`,
      testName: "Sample Mathematics Test",
      totalTime: 3600,
      sections: [
        {
          sectionId: "sec-1",
          sectionName: "Algebra Basics",
          sectionTime: 1800,
          questions: [
            {
              questionId: "q1",
              type: "mcq-single",
              question: "What is 2 + 2?",
              topic: "Basic Math",
              options: ["3", "4", "5", "6"],
              correctAnswer: ["4"],
              explanation: "2 + 2 = 4",
              difficulty: "easy"
            },
            {
              questionId: "q2",
              type: "true-false",
              question: "Earth is flat.",
              topic: "Geography",
              correctAnswer: [false],
              explanation: "Earth is spherical.",
              difficulty: "easy"
            }
          ]
        },
        {
          sectionId: "sec-2",
          sectionName: "Advanced Algebra",
          sectionTime: 1800,
          questions: [
            {
              questionId: "q3",
              type: "mcq-multiple",
              question: "Which of these are prime numbers?",
              topic: "Prime Numbers",
              options: ["2", "4", "7", "9"],
              correctAnswer: ["2", "7"],
              explanation: "2 and 7 are prime numbers.",
              difficulty: "medium"
            }
          ]
        }
      ]
    };
    setJsonInput(JSON.stringify(template, null, 2));
  };

  const renderStep1 = () => (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-4">
        <label className="block text-sm font-medium text-foreground/90">Test Configuration (JSON)</label>
        <button 
          onClick={insertTemplate}
          className="text-xs text-blue-400 hover:text-blue-300 font-medium bg-blue-500/10 px-3 py-1.5 rounded transition-colors"
        >
          Load Template
        </button>
      </div>

      <textarea
        className="w-full h-96 bg-card border border-border rounded-lg p-4 text-sm font-mono text-foreground/90 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-6 custom-scrollbar leading-relaxed"
        placeholder="Paste JSON here..."
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        spellCheck="false"
      ></textarea>

      <div className="flex justify-end gap-4">
        <Link href="/admin">
          <Button variant="outline" className="border-border text-foreground/90 hover:text-foreground">
            Cancel
          </Button>
        </Link>
        <Button 
          onClick={handleValidateJSON}
          disabled={!jsonInput.trim()}
          className="bg-blue-600 hover:bg-blue-500"
        >
          <Eye size={16} className="mr-2" />
          Preview Test
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => {
    if (!parsedData) return null;

    let totalQuestions = 0;
    const questionTypes: Record<string, number> = {};
    
    parsedData.sections.forEach((section: any) => {
      totalQuestions += section.questions?.length || 0;
      section.questions?.forEach((q: any) => {
        questionTypes[q.type] = (questionTypes[q.type] || 0) + 1;
      });
    });

    return (
      <div className="space-y-6">
        {/* Test Summary Metadata */}
        <Card className="bg-muted border-border">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Test Name</p>
                <p className="font-medium text-foreground">{parsedData.testName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Total Time (seconds)</p>
                <Input 
                  type="number"
                  value={parsedData.totalTime}
                  onChange={(e) => setParsedData({ ...parsedData, totalTime: Number(e.target.value) })}
                  className="h-8 bg-card border-border text-sm text-foreground max-w-[120px]"
                />
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Total Sections</p>
                <p className="font-medium text-foreground">{parsedData.sections.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Total Questions</p>
                <p className="font-medium text-foreground">{totalQuestions}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-2">Question Types Breakdown</p>
              <div className="flex gap-4">
                {Object.entries(questionTypes).map(([type, count]) => (
                  <span key={type} className="px-2.5 py-1 bg-muted rounded-md text-xs font-medium text-foreground/90">
                    {type}: <strong className="text-foreground ml-1">{count}</strong>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Global Settings */}
        <Card className="bg-muted border-border">
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Test Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  className="w-5 h-5 rounded border-border text-blue-600 focus:ring-blue-500 bg-card"
                  checked={parsedData.settings.strictSectionOrder}
                  onChange={(e) => setParsedData({
                    ...parsedData,
                    settings: { ...parsedData.settings, strictSectionOrder: e.target.checked }
                  })}
                />
                <span className="text-foreground/90 text-sm">
                  <strong className="text-foreground block">Strict Section Order</strong>
                  Require users to attempt sections in the exact order specified below.
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  className="w-5 h-5 rounded border-border text-green-600 focus:ring-green-500 bg-card"
                  checked={parsedData.settings.isLive}
                  onChange={(e) => setParsedData({
                    ...parsedData,
                    settings: { ...parsedData.settings, isLive: e.target.checked }
                  })}
                />
                <span className="text-foreground/90 text-sm">
                  <strong className="text-foreground block">Publish Test Immediately</strong>
                  If unchecked, the test will be saved as a draft.
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  className="w-5 h-5 rounded border-border text-purple-600 focus:ring-purple-500 bg-card"
                  checked={parsedData.settings.allowPracticeMode}
                  onChange={(e) => setParsedData({
                    ...parsedData,
                    settings: { ...parsedData.settings, allowPracticeMode: e.target.checked }
                  })}
                />
                <span className="text-foreground/90 text-sm">
                  <strong className="text-foreground block">Allow Practice Mode</strong>
                  Allow students to take this test with immediate feedback.
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  className="w-5 h-5 rounded border-border text-orange-600 focus:ring-orange-500 bg-card"
                  checked={parsedData.settings.allowTestMode}
                  onChange={(e) => setParsedData({
                    ...parsedData,
                    settings: { ...parsedData.settings, allowTestMode: e.target.checked }
                  })}
                />
                <span className="text-foreground/90 text-sm">
                  <strong className="text-foreground block">Allow Test Mode</strong>
                  Allow students to take this test as a timed assessment.
                </span>
              </label>
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <label className="block text-foreground/90 text-sm mb-2">
                <strong className="text-foreground block">Timing Mode</strong>
                Choose how the timer behaves during the test.
              </label>
              <select 
                className="bg-card border border-border text-foreground text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 w-full md:w-auto"
                value={parsedData.settings.timingMode}
                onChange={(e) => setParsedData({
                  ...parsedData,
                  settings: { ...parsedData.settings, timingMode: e.target.value }
                })}
              >
                <option value="full">Full Test Timing (Default)</option>
                <option value="per-question">Per-Question Timing</option>
              </select>
            </div>

            {parsedData.settings.isLive && (
              <div className="mt-6 p-5 rounded-xl border border-blue-500/30 bg-blue-500/5 shadow-inner">
                <label className="block text-foreground/90 text-sm mb-3">
                  <strong className="text-foreground block text-base mb-1">Schedule Go-Live Date & Time (IST)</strong>
                  Specify exactly when this test should appear on student dashboards.
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="datetime-local" 
                    className="bg-card border border-border text-foreground text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64 transition-all"
                    value={parsedData.settings.goLiveDate ? toLocalISOString(new Date(parsedData.settings.goLiveDate)) : ''}
                    onChange={(e) => {
                      setParsedData({
                        ...parsedData,
                        settings: { 
                          ...parsedData.settings, 
                          goLiveDate: e.target.value ? new Date(e.target.value).toISOString() : null 
                        }
                      });
                    }}
                  />
                  <span className="text-xs text-muted-foreground font-medium px-2 py-1 bg-muted rounded">Timezone: IST</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sections Reordering & Renaming */}
        <Card className="bg-muted border-border">
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Review & Manage Sections</h3>
            <p className="text-sm text-muted-foreground mb-6">You can rename sections and drag the arrows to change the order in which they appear.</p>
            
            <div className="space-y-3">
              {parsedData.sections.map((section: any, idx: number) => (
                <div key={section.sectionId} className="flex items-center gap-3 bg-card p-3 rounded-lg border border-border">
                  <div className="flex flex-col text-muted-foreground">
                    <button 
                      onClick={() => handleSectionMove(idx, 'up')}
                      disabled={idx === 0}
                      className="hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ▲
                    </button>
                    <button 
                      onClick={() => handleSectionMove(idx, 'down')}
                      disabled={idx === parsedData.sections.length - 1}
                      className="hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ▼
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Section Name</label>
                    <Input 
                      value={section.sectionName}
                      onChange={(e) => handleSectionRename(idx, e.target.value)}
                      className="bg-muted border-border text-foreground h-9"
                    />
                  </div>
                  
                  <div className="px-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Time (sec)</p>
                    <Input 
                      type="number"
                      value={section.sectionTime}
                      onChange={(e) => {
                        const newData = { ...parsedData };
                        newData.sections[idx].sectionTime = Number(e.target.value);
                        setParsedData(newData);
                      }}
                      className="bg-muted border-border text-foreground h-9 w-24 text-center"
                    />
                  </div>
                  <div className="px-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Questions</p>
                    <p className="text-sm font-medium text-foreground">{section.questions?.length || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-8">
          <Button variant="outline" className="border-border text-foreground/90 hover:text-foreground" onClick={() => setStep(1)}>
            Back to Editor
          </Button>
          <Button 
            onClick={handleSaveFinal}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 min-w-[140px]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <><Save size={16} className="mr-2" /> Finalize & Create Test</>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full">
      <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm font-medium">
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <FileJson className="text-blue-400" />
            Create New Test
          </h1>
          <p className="text-muted-foreground">Step {step} of 2: {step === 1 ? 'Configure JSON' : 'Preview & Settings'}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 text-sm flex items-start gap-3">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-lg mb-6 text-sm flex items-center gap-3">
          <CheckCircle size={18} />
          <p className="font-semibold">{success}</p>
        </div>
      )}

      {step === 1 ? renderStep1() : renderStep2()}
    </div>
  );
}
