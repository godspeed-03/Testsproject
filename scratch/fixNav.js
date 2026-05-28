const fs = require('fs');
let content = fs.readFileSync('src/app/tests/[testId]/take/page.tsx', 'utf8');

// 1. Fix rehydration to jump to last question
content = content.replace(
  `          setAnswers(restoredAnswers);
          setQuestionTimes(restoredTimes);
          setQuestionStatuses(restoredStatuses);
        }`,
  `          setAnswers(restoredAnswers);
          setQuestionTimes(restoredTimes);
          setQuestionStatuses(restoredStatuses);

          // Jump to the furthest unanswered question
          let found = false;
          for (let sIdx = 0; sIdx < data.test.testJSON.sections.length; sIdx++) {
            const sec = data.test.testJSON.sections[sIdx];
            for (let qIdx = 0; qIdx < sec.questions.length; qIdx++) {
              const qId = sec.questions[qIdx].questionId;
              if (restoredStatuses[qId] !== 'answered') {
                setCurrentSectionIndex(sIdx);
                setCurrentQuestionIndex(qIdx);
                found = true;
                break;
              }
            }
            if (found) break;
          }
        }`
);

// 2. Fix canGoNext to allow progressing if already answered previously
content = content.replace(
  `  const canGoNext = !isPracticeMode || !!qFeedback;`,
  `  const canGoNext = !isPracticeMode || !!qFeedback || questionStatuses[currentQuestion.questionId] === 'answered';`
);

// 3. Fix handleNavigate to hard-block practice mode bypassing
content = content.replace(
  `  const handleNavigate = (nextSIdx: number, nextQIdx: number) => {`,
  `  const handleNavigate = (nextSIdx: number, nextQIdx: number) => {
    // Hard block practice mode forward navigation without saving
    if (isPracticeMode && !canGoNext) {
      const isFuture = nextSIdx > currentSectionIndex || (nextSIdx === currentSectionIndex && nextQIdx > currentQuestionIndex);
      if (isFuture) return;
    }`
);

// 4. In Auto-navigate, if in practice mode, force "Save Answer" instead of silently skipping
content = content.replace(
  `  // Auto-navigate if per-question timer exhausts
  useEffect(() => {
    if (isPerQuestionMode && displayTimeLeft === 0 && !loading && !submitting && test && currentSection && currentQuestion) {
      if (currentSectionIndex === test.testJSON.sections.length - 1 && currentQuestionIndex === currentSection.questions.length - 1) {
        handleSubmitTest();
      } else {
        if (currentQuestionIndex < currentSection.questions.length - 1) {
          handleNavigate(currentSectionIndex, currentQuestionIndex + 1);
        } else {
          handleNavigate(currentSectionIndex + 1, 0);
        }
      }
    }
  }, [displayTimeLeft, isPerQuestionMode, currentSectionIndex, currentQuestionIndex, loading, submitting, test, currentSection, currentQuestion, handleNavigate, handleSubmitTest]);`,
  `  // Auto-navigate if per-question timer exhausts
  useEffect(() => {
    if (isPerQuestionMode && displayTimeLeft === 0 && !loading && !submitting && test && currentSection && currentQuestion) {
      if (isPracticeMode && !canGoNext) {
         // Force evaluation instead of skipping
         handleSaveAnswer(currentQuestion.questionId);
      } else {
        if (currentSectionIndex === test.testJSON.sections.length - 1 && currentQuestionIndex === currentSection.questions.length - 1) {
          handleSubmitTest();
        } else {
          if (currentQuestionIndex < currentSection.questions.length - 1) {
            handleNavigate(currentSectionIndex, currentQuestionIndex + 1);
          } else {
            handleNavigate(currentSectionIndex + 1, 0);
          }
        }
      }
    }
  }, [displayTimeLeft, isPerQuestionMode, isPracticeMode, canGoNext, currentSectionIndex, currentQuestionIndex, loading, submitting, test, currentSection, currentQuestion, handleNavigate, handleSubmitTest]);`
);

fs.writeFileSync('src/app/tests/[testId]/take/page.tsx', content);
console.log('Fixed navigation bypass and rehydration bugs');
