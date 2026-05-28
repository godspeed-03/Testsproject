const fs = require('fs');
let content = fs.readFileSync('src/app/tests/[testId]/take/page.tsx', 'utf8');

content = content.replace(
  'const [answers, setAnswers] = useState<Record<string, any>>({});',
  `const [answers, setAnswers] = useState<Record<string, any>>({});
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const [questionStatuses, setQuestionStatuses] = useState<Record<string, 'seen'|'answered'|'review'>>({});`
);

content = content.replace(
  `        // Rehydrate answers from previous session
        if (attemptData.attempt.responses && attemptData.attempt.responses.length > 0) {
          const restoredAnswers: Record<string, any> = {};
          attemptData.attempt.responses.forEach((r: any) => {
            restoredAnswers[r.questionId] = r.selectedAnswer;
          });
          setAnswers(restoredAnswers);
        }`,
  `        // Rehydrate answers from previous session
        if (attemptData.attempt.responses && attemptData.attempt.responses.length > 0) {
          const restoredAnswers: Record<string, any> = {};
          const restoredTimes: Record<string, number> = {};
          const restoredStatuses: Record<string, 'seen'|'answered'|'review'> = {};
          attemptData.attempt.responses.forEach((r: any) => {
            if (r.selectedAnswer !== undefined && r.selectedAnswer !== null) {
              restoredAnswers[r.questionId] = r.selectedAnswer;
            }
            restoredTimes[r.questionId] = r.timeTaken || 0;
            restoredStatuses[r.questionId] = r.status || 'seen';
          });
          setAnswers(restoredAnswers);
          setQuestionTimes(restoredTimes);
          setQuestionStatuses(restoredStatuses);
        }`
);

content = content.replace(
  `  const handleSaveAnswer = async (questionId: string) => {
    const timeSpentOnQuestion = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    try {
      const res = await fetch(\`/api/attempts/\${attemptId}/submit-answer\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          selectedAnswer: answers[questionId],
          timeTaken: timeSpentOnQuestion,
          timeLeft: timeLeft
        })
      });
      const data = await res.json();
      if (res.ok && data.explanation !== undefined) {
        // Practice mode feedback
        setFeedback(prev => ({
          ...prev,
          [questionId]: data
        }));
      }
    } catch (error) {
      console.error('Failed to save answer', error);
    }
  };`,
  `  const syncQuestionData = (qId: string, additionalTime: number, forceStatus?: 'seen'|'answered'|'review') => {
    setQuestionTimes(prev => {
      const newTotalTime = (prev[qId] || 0) + additionalTime;
      
      setQuestionStatuses(prevStatus => {
        let newStatus = forceStatus || prevStatus[qId] || 'seen';
        if (!forceStatus && answers[qId] !== undefined && newStatus !== 'review') {
          newStatus = 'answered';
        }
        
        // Background sync
        fetch(\`/api/attempts/\${attemptId}/sync-progress\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: qId,
            selectedAnswer: answers[qId],
            timeTaken: newTotalTime,
            status: newStatus,
            timeLeft: timeLeft
          })
        }).then(res => res.json()).then(data => {
          if (data.explanation !== undefined) {
            setFeedback(prevF => ({ ...prevF, [qId]: data }));
          }
        }).catch(console.error);

        return { ...prevStatus, [qId]: newStatus };
      });
      
      return { ...prev, [qId]: newTotalTime };
    });
  };

  const handleNavigate = (nextSIdx: number, nextQIdx: number) => {
    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    const currentQId = test.testJSON.sections[currentSectionIndex].questions[currentQuestionIndex].questionId;
    
    syncQuestionData(currentQId, timeSpent);
    
    setCurrentSectionIndex(nextSIdx);
    setCurrentQuestionIndex(nextQIdx);
  };
  
  const handleSaveAnswer = (questionId: string) => {
    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    questionStartTimeRef.current = Date.now(); // reset so we don't double count if they stay on page
    syncQuestionData(questionId, timeSpent, 'answered');
  };
  
  const handleReviewToggle = (questionId: string) => {
    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    questionStartTimeRef.current = Date.now();
    const currentStatus = questionStatuses[questionId];
    const newStatus = currentStatus === 'review' ? (answers[questionId] ? 'answered' : 'seen') : 'review';
    syncQuestionData(questionId, timeSpent, newStatus);
  };`
);

content = content.replace(
  `                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    setCurrentQuestionIndex(prev => prev - 1);
                  } else if (currentSectionIndex > 0) {
                    setCurrentSectionIndex(prev => prev - 1);
                    setCurrentQuestionIndex(test.testJSON.sections[currentSectionIndex - 1].questions.length - 1);
                  }
                }}`,
  `                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    handleNavigate(currentSectionIndex, currentQuestionIndex - 1);
                  } else if (currentSectionIndex > 0) {
                    handleNavigate(currentSectionIndex - 1, test.testJSON.sections[currentSectionIndex - 1].questions.length - 1);
                  }
                }}`
);

content = content.replace(
  `                onClick={() => {
                  if (currentQuestionIndex < currentSection.questions.length - 1) {
                    setCurrentQuestionIndex(prev => prev + 1);
                  } else if (currentSectionIndex < test.testJSON.sections.length - 1) {
                    setCurrentSectionIndex(prev => prev + 1);
                    setCurrentQuestionIndex(0);
                  }
                }}`,
  `                onClick={() => {
                  if (currentQuestionIndex < currentSection.questions.length - 1) {
                    handleNavigate(currentSectionIndex, currentQuestionIndex + 1);
                  } else if (currentSectionIndex < test.testJSON.sections.length - 1) {
                    handleNavigate(currentSectionIndex + 1, 0);
                  }
                }}`
);

content = content.replace(
  `                    <button
                      key={q.questionId}
                      onClick={() => {
                        setCurrentSectionIndex(sIdx);
                        setCurrentQuestionIndex(qIdx);
                      }}
                      className={\`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-all \${
                        isCurrent 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                          : answers[q.questionId] !== undefined
                            ? 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
                            : 'bg-card border border-border text-foreground hover:bg-muted'
                      }\`}
                    >`,
  `                    <button
                      key={q.questionId}
                      onClick={() => handleNavigate(sIdx, qIdx)}
                      className={\`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-all \${
                        isCurrent 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                          : questionStatuses[q.questionId] === 'review'
                            ? 'bg-orange-500/20 text-orange-600 border border-orange-500/50'
                            : questionStatuses[q.questionId] === 'answered' || answers[q.questionId] !== undefined
                              ? 'bg-green-500/20 text-green-600 border border-green-500/50'
                              : questionStatuses[q.questionId] === 'seen'
                                ? 'bg-muted border border-border text-foreground/50'
                                : 'bg-card border border-border text-foreground hover:bg-muted'
                      }\`}
                    >`
);

content = content.replace(
  `              {/* Actions for current question */}
              <div className="mt-8 flex justify-end">`,
  `              {/* Actions for current question */}
              <div className="mt-8 flex justify-between items-center">
                <button 
                  onClick={() => handleReviewToggle(currentQuestion.questionId)}
                  className={\`text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg transition-all \${questionStatuses[currentQuestion.questionId] === 'review' ? 'text-orange-600 bg-orange-500/10' : 'text-muted-foreground hover:bg-muted'}\`}
                >
                  <AlertCircle size={16} />
                  {questionStatuses[currentQuestion.questionId] === 'review' ? 'Marked for Review' : 'Mark for Review'}
                </button>
                <div className="flex gap-3">`
);

content = content.replace(
  `                <button 
                  onClick={() => handleSaveAnswer(currentQuestion.questionId)}
                  className="btn-secondary text-sm"
                >
                  Save Answer
                </button>
              </div>`,
  `                <button 
                  onClick={() => handleSaveAnswer(currentQuestion.questionId)}
                  className="btn-secondary text-sm"
                >
                  Save Answer
                </button>
                </div>
              </div>`
);

fs.writeFileSync('src/app/tests/[testId]/take/page.tsx', content);
console.log('TakeTestPage modified successfully.');
