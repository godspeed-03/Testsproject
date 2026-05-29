'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, AlertTriangle, FileJson, Save, Settings, GripVertical, Plus, Trash2, Edit3, Eye } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function EditTestPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = use(params);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'settings' | 'questions'>('settings');
  
  const [testData, setTestData] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // For JSON Add Question
  const [showAddJson, setShowAddJson] = useState<number | null>(null);
  const [addJsonStr, setAddJsonStr] = useState('');
  
  // For Section Toggles
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  const toggleSection = (idx: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [idx]: prev[idx] === undefined ? false : !prev[idx] // default is expanded (true or undefined), so click means false
    }));
  };

  const toLocalISOString = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch(`/api/tests/${testId}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);
        
        if (!data.test.settings) {
          data.test.settings = { 
            isLive: true, 
            strictSectionOrder: false, 
            goLiveDate: new Date().toISOString(),
            allowPracticeMode: true,
            allowTestMode: true,
            timingMode: 'full' 
          };
        } else if (!data.test.settings.goLiveDate) {
          data.test.settings.goLiveDate = new Date().toISOString();
        }
        
        setTestData(data.test);
      } catch (err: any) {
        setError(err.message || 'Failed to load test');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  // Section Handlers
  const handleSectionRename = (index: number, newName: string) => {
    const newData = { ...testData };
    newData.testJSON.sections[index].sectionName = newName;
    setTestData(newData);
  };

  const handleSectionMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === testData.testJSON.sections.length - 1) return;
    
    const newData = { ...testData };
    const sections = [...newData.testJSON.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    const temp = sections[index];
    sections[index] = sections[targetIndex];
    sections[targetIndex] = temp;
    
    newData.testJSON.sections = sections;
    setTestData(newData);
  };

  // Question Edit Handlers
  const handleQuestionChange = (sIdx: number, qIdx: number, field: string, value: any) => {
    const newData = { ...testData };
    newData.testJSON.sections[sIdx].questions[qIdx][field] = value;
    setTestData(newData);
  };

  const handleOptionChange = (sIdx: number, qIdx: number, optIdx: number, value: string) => {
    const newData = { ...testData };
    newData.testJSON.sections[sIdx].questions[qIdx].options[optIdx] = value;
    setTestData(newData);
  };

  const toggleCorrectAnswer = (sIdx: number, qIdx: number, optValue: any, type: string) => {
    const newData = { ...testData };
    const q = newData.testJSON.sections[sIdx].questions[qIdx];
    
    if (type === 'mcq-single' || type === 'true-false') {
      q.correctAnswer = [optValue];
    } else if (type === 'mcq-multiple') {
      const exists = q.correctAnswer.includes(optValue);
      if (exists) {
        q.correctAnswer = q.correctAnswer.filter((a: any) => a !== optValue);
      } else {
        q.correctAnswer.push(optValue);
      }
    }
    setTestData(newData);
  };

  const deleteQuestion = (sIdx: number, qIdx: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    const newData = { ...testData };
    newData.testJSON.sections[sIdx].questions.splice(qIdx, 1);
    setTestData(newData);
  };

  const handleAddQuestionJSON = (sIdx: number) => {
    try {
      const q = JSON.parse(addJsonStr);
      if (!q.questionId || !q.type || !q.question) throw new Error('Missing required fields (questionId, type, question)');
      
      const newData = { ...testData };
      newData.testJSON.sections[sIdx].questions.push(q);
      setTestData(newData);
      
      setAddJsonStr('');
      setShowAddJson(null);
      setSuccess('Question added!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (e: any) {
      alert('Invalid JSON: ' + e.message);
    }
  };

  // Save All Changes
  const handleSaveChanges = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // Recalculate totals
      let totalQuestions = 0;
      testData.testJSON.sections.forEach((sec: any) => {
        totalQuestions += sec.questions?.length || 0;
      });

      const res = await fetch(`/api/tests/${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName: testData.testName,
          settings: testData.settings,
          testJSON: testData.testJSON,
          totalQuestions
        })
      });

      if (!res.ok) throw new Error('Failed to update test');
      
      setSuccess('All changes saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex-1 flex justify-center items-center py-20"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>;
  }

  if (!testData) return null;

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <Button onClick={handleSaveChanges} disabled={saving} className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20">
          {saving ? 'Saving...' : <><Save size={16} className="mr-2" /> Save All Changes</>}
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Editing: {testData.testName}</h1>
        <p className="text-muted-foreground">Test ID: {testId}</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 text-sm flex items-start gap-3">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-lg mb-6 text-sm flex items-center gap-3">
          <CheckCircle size={18} />
          <p className="font-semibold">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border mb-6">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'settings' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-card'}`}
        >
          <Settings size={16} /> Metadata & Sections
        </button>
        <button 
          onClick={() => setActiveTab('questions')}
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'questions' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-card'}`}
        >
          <FileJson size={16} /> Edit Questions UI
        </button>
      </div>

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Basic Information</h3>
              <div className="mb-4">
                <label className="text-xs text-muted-foreground mb-1 block">Test Name</label>
                <Input 
                  value={testData.testName}
                  onChange={(e) => {
                    const newData = { ...testData, testName: e.target.value };
                    newData.testJSON.testName = e.target.value;
                    setTestData(newData);
                  }}
                  className="bg-card border-border text-foreground"
                />
              </div>
              <div className="mb-4">
                <label className="text-xs text-muted-foreground mb-1 block">Total Time (seconds)</label>
                <Input 
                  type="number"
                  value={testData.testJSON?.totalTime || ''}
                  onChange={(e) => {
                    const newData = { ...testData };
                    if (newData.testJSON) newData.testJSON.totalTime = Number(e.target.value);
                    setTestData(newData);
                  }}
                  className="bg-card border-border text-foreground"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Test Behavior Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    className="w-5 h-5 rounded border-border text-blue-600 focus:ring-blue-500 bg-card"
                    checked={testData.settings.strictSectionOrder}
                    onChange={(e) => setTestData({
                      ...testData,
                      settings: { ...testData.settings, strictSectionOrder: e.target.checked }
                    })}
                  />
                  <span className="text-muted-foreground text-sm">
                    <strong className="text-foreground block">Strict Section Order</strong>
                    Require users to attempt sections in exact order.
                  </span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    className="w-5 h-5 rounded border-border text-green-600 focus:ring-green-500 bg-card"
                    checked={testData.settings.isLive}
                    onChange={(e) => setTestData({
                      ...testData,
                      settings: { ...testData.settings, isLive: e.target.checked }
                    })}
                  />
                  <span className="text-muted-foreground text-sm">
                    <strong className="text-foreground block">Test is Live</strong>
                    If unchecked, the test will be hidden from students.
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    className="w-5 h-5 rounded border-border text-purple-600 focus:ring-purple-500 bg-card"
                    checked={testData.settings.allowPracticeMode}
                    onChange={(e) => setTestData({
                      ...testData,
                      settings: { ...testData.settings, allowPracticeMode: e.target.checked }
                    })}
                  />
                  <span className="text-muted-foreground text-sm">
                    <strong className="text-foreground block">Allow Practice Mode</strong>
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    className="w-5 h-5 rounded border-border text-orange-600 focus:ring-orange-500 bg-card"
                    checked={testData.settings.allowTestMode}
                    onChange={(e) => setTestData({
                      ...testData,
                      settings: { ...testData.settings, allowTestMode: e.target.checked }
                    })}
                  />
                  <span className="text-muted-foreground text-sm">
                    <strong className="text-foreground block">Allow Test Mode</strong>
                  </span>
                </label>

                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-sm">
                    <strong className="text-foreground block mb-2">Timing Mode</strong>
                  </span>
                  <select 
                    className="w-full h-10 bg-card border border-border rounded text-sm px-3 text-foreground outline-none focus:border-blue-500"
                    value={testData.settings.timingMode || 'full'}
                    onChange={(e) => setTestData({
                      ...testData,
                      settings: { ...testData.settings, timingMode: e.target.value }
                    })}
                  >
                    <option value="full">Full Test Timer</option>
                    <option value="per-question">Per-Question Timer</option>
                    <option value="both">Let Student Choose</option>
                  </select>
                </div>
              </div>

              {testData.settings.isLive && (
                <div className="mt-6 p-5 rounded-xl border border-blue-500/30 bg-blue-500/5 shadow-inner">
                  <label className="block text-muted-foreground text-sm mb-3">
                    <strong className="text-foreground block text-base mb-1">Schedule Go-Live Date & Time (IST)</strong>
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="datetime-local" 
                      className="bg-card border border-border text-foreground text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64 transition-all"
                      value={testData.settings.goLiveDate ? toLocalISOString(new Date(testData.settings.goLiveDate)) : ''}
                      onChange={(e) => {
                        setTestData({
                          ...testData,
                          settings: { ...testData.settings, goLiveDate: e.target.value ? new Date(e.target.value).toISOString() : null }
                        });
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Reorder & Rename Sections</h3>
              <div className="space-y-3">
                {testData.testJSON.sections.map((section: any, idx: number) => (
                  <div key={section.sectionId} className="flex items-center gap-3 bg-card p-3 rounded-lg border border-border">
                    <div className="flex flex-col text-muted-foreground">
                      <button onClick={() => handleSectionMove(idx, 'up')} disabled={idx === 0} className="hover:text-foreground disabled:opacity-30">▲</button>
                      <button onClick={() => handleSectionMove(idx, 'down')} disabled={idx === testData.testJSON.sections.length - 1} className="hover:text-foreground disabled:opacity-30">▼</button>
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
                          const newData = { ...testData };
                          newData.testJSON.sections[idx].sectionTime = Number(e.target.value);
                          setTestData(newData);
                        }}
                        className="bg-muted border-border text-foreground h-9 w-24 text-center"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="space-y-8">
          {testData.testJSON.sections.map((section: any, sIdx: number) => {
            const isExpanded = expandedSections[sIdx] !== false; // defaults to true
            return (
            <div key={section.sectionId} className="border border-border rounded-xl overflow-hidden bg-card">
              <div 
                className="bg-muted p-4 border-b border-border flex justify-between items-center cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => toggleSection(sIdx)}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-foreground">{section.sectionName}</h3>
                  <span className="text-muted-foreground font-normal text-sm">({section.questions.length} questions)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setShowAddJson(sIdx); setExpandedSections(p => ({...p, [sIdx]: true})); }} className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                    <Plus size={14} className="mr-2" /> Add Question (JSON)
                  </Button>
                  <span className="text-muted-foreground text-sm">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>
              
              {isExpanded && (
                <>
                  {showAddJson === sIdx && (
                <div className="p-6 bg-card border-b border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Paste Question JSON</h4>
                  <textarea 
                    className="w-full h-40 bg-muted border border-border rounded p-3 text-xs font-mono text-foreground focus:outline-none focus:border-blue-500 mb-3"
                    placeholder={`{\n  "questionId": "new-q-1",\n  "type": "mcq-single",\n  "question": "Your question?",\n  "options": ["A", "B"],\n  "correctAnswer": ["A"]\n}`}
                    value={addJsonStr}
                    onChange={(e) => setAddJsonStr(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowAddJson(null)}>Cancel</Button>
                    <Button size="sm" onClick={() => handleAddQuestionJSON(sIdx)}>Add to Section</Button>
                  </div>
                </div>
              )}

              <div className="p-4 space-y-6">
                {section.questions.map((q: any, qIdx: number) => (
                  <div key={q.questionId} className="bg-card border border-border rounded-lg p-5 relative group">
                    <button onClick={() => deleteQuestion(sIdx, qIdx)} className="absolute top-4 right-4 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={18} />
                    </button>
                    
                    <div className="flex gap-4 mb-4">
                      <div className="w-16">
                        <label className="text-xs text-muted-foreground block mb-1">ID</label>
                        <Input value={q.questionId} onChange={(e) => handleQuestionChange(sIdx, qIdx, 'questionId', e.target.value)} className="h-8 bg-card border-border text-xs px-2" />
                      </div>
                      <div className="w-32">
                        <label className="text-xs text-muted-foreground block mb-1">Type</label>
                        <select 
                          value={q.type} 
                          onChange={(e) => handleQuestionChange(sIdx, qIdx, 'type', e.target.value)}
                          className="w-full h-8 bg-card border border-border rounded text-xs px-2 text-foreground outline-none focus:border-blue-500"
                        >
                          <option value="mcq-single">MCQ (Single)</option>
                          <option value="mcq-multiple">MCQ (Multiple)</option>
                          <option value="true-false">True/False</option>
                        </select>
                      </div>
                      <div className="w-32">
                        <label className="text-xs text-muted-foreground block mb-1">Topic</label>
                        <Input value={q.topic || ''} onChange={(e) => handleQuestionChange(sIdx, qIdx, 'topic', e.target.value)} className="h-8 bg-card border-border text-xs px-2" />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-xs text-muted-foreground block mb-1">Question Text</label>
                      <textarea 
                        value={q.question}
                        onChange={(e) => handleQuestionChange(sIdx, qIdx, 'question', e.target.value)}
                        className="w-full min-h-[80px] bg-card border border-border rounded p-3 text-sm text-foreground focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {q.type !== 'true-false' && (
                      <div className="mb-4">
                        <label className="text-xs text-muted-foreground block mb-2">Options & Correct Answers (Check correct ones)</label>
                        <div className="space-y-2">
                          {q.options?.map((opt: string, optIdx: number) => {
                            const isCorrect = q.correctAnswer?.includes(opt);
                            return (
                              <div key={optIdx} className="flex items-center gap-3">
                                <input 
                                  type={q.type === 'mcq-single' ? 'radio' : 'checkbox'} 
                                  name={`correct-${sIdx}-${qIdx}`}
                                  checked={isCorrect}
                                  onChange={() => toggleCorrectAnswer(sIdx, qIdx, opt, q.type)}
                                  className="w-4 h-4 cursor-pointer text-blue-500 bg-card border-border"
                                />
                                <Input 
                                  value={opt}
                                  onChange={(e) => handleOptionChange(sIdx, qIdx, optIdx, e.target.value)}
                                  className={`h-9 bg-card flex-1 ${isCorrect ? 'border-green-500/50 text-green-400' : 'border-border text-foreground'}`}
                                />
                                <button 
                                  onClick={() => {
                                    const newData = { ...testData };
                                    newData.testJSON.sections[sIdx].questions[qIdx].options.splice(optIdx, 1);
                                    setTestData(newData);
                                  }}
                                  className="text-muted-foreground hover:text-red-400"
                                >
                                  &times;
                                </button>
                              </div>
                            );
                          })}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              const newData = { ...testData };
                              newData.testJSON.sections[sIdx].questions[qIdx].options.push('New Option');
                              setTestData(newData);
                            }}
                            className="text-xs text-blue-400 mt-1 h-7 px-2"
                          >
                            + Add Option
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="mb-2">
                      <label className="text-xs text-muted-foreground block mb-1">Explanation</label>
                      <textarea 
                        value={q.explanation || ''}
                        onChange={(e) => handleQuestionChange(sIdx, qIdx, 'explanation', e.target.value)}
                        className="w-full h-16 bg-card border border-border rounded p-2 text-xs text-foreground/90 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )})}
        </div>
      )}
    </div>
  );
}
