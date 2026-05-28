const fs = require('fs');
let content = fs.readFileSync('src/app/tests/[testId]/take/page.tsx', 'utf8');

content = content.replace(
  `              {/* MCQ Single Option */}
              {currentQuestion.type === 'mcq-single' && (
                <div className="space-y-3">
                  {currentQuestion.options.map((opt: string, idx: number) => (
                    <label key={idx} className={\`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                      \${answers[currentQuestion.questionId] === opt 
                        ? 'bg-blue-500/20 border-blue-500 text-blue-100' 
                        : 'bg-muted border-border hover:bg-muted text-foreground/90'
                      }\`}
                    >
                      <input 
                        type="radio" 
                        name={currentQuestion.questionId} 
                        className="hidden"
                        checked={answers[currentQuestion.questionId] === opt}
                        onChange={() => handleAnswerSelect(currentQuestion.questionId, opt)}
                      />
                      <div className={\`w-5 h-5 rounded-full border flex items-center justify-center
                        \${answers[currentQuestion.questionId] === opt ? 'border-blue-400' : 'border-border'}
                      \`}>
                        {answers[currentQuestion.questionId] === opt && <div className="w-2.5 h-2.5 bg-blue-400 rounded-full" />}
                      </div>
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}`,
  `              {/* MCQ Single Option */}
              {currentQuestion.type === 'mcq-single' && (
                <div className="space-y-3">
                  {currentQuestion.options.map((opt: string, idx: number) => (
                    <label key={idx} className={\`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                      \${answers[currentQuestion.questionId] === idx 
                        ? 'bg-blue-500/20 border-blue-500 text-blue-100 font-medium' 
                        : 'bg-card border-border hover:bg-muted text-foreground/90'
                      }\`}
                    >
                      <input 
                        type="radio" 
                        name={currentQuestion.questionId} 
                        className="hidden"
                        checked={answers[currentQuestion.questionId] === idx}
                        onChange={() => handleAnswerSelect(currentQuestion.questionId, idx)}
                      />
                      <div className={\`w-5 h-5 rounded-full border flex items-center justify-center shrink-0
                        \${answers[currentQuestion.questionId] === idx ? 'border-blue-500' : 'border-border'}
                      \`}>
                        {answers[currentQuestion.questionId] === idx && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                      </div>
                      <span className="flex-1">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* MCQ Multiple Option */}
              {currentQuestion.type === 'mcq-multiple' && (
                <div className="space-y-3">
                  {currentQuestion.options.map((opt: string, idx: number) => {
                    const isSelected = Array.isArray(answers[currentQuestion.questionId]) && answers[currentQuestion.questionId].includes(idx);
                    return (
                      <label key={idx} className={\`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                        \${isSelected 
                          ? 'bg-blue-500/20 border-blue-500 text-blue-100 font-medium' 
                          : 'bg-card border-border hover:bg-muted text-foreground/90'
                        }\`}
                      >
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={isSelected}
                          onChange={(e) => {
                            const prev = Array.isArray(answers[currentQuestion.questionId]) ? answers[currentQuestion.questionId] : [];
                            if (e.target.checked) {
                              handleAnswerSelect(currentQuestion.questionId, [...prev, idx]);
                            } else {
                              handleAnswerSelect(currentQuestion.questionId, prev.filter((i: number) => i !== idx));
                            }
                          }}
                        />
                        <div className={\`w-5 h-5 rounded border flex items-center justify-center shrink-0
                          \${isSelected ? 'border-blue-500 bg-blue-500' : 'border-border'}
                        \`}>
                          {isSelected && <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </div>
                        <span className="flex-1">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}`
);

fs.writeFileSync('src/app/tests/[testId]/take/page.tsx', content);
console.log('Added mcq-multiple to TakeTestPage');
