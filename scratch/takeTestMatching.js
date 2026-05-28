const fs = require('fs');
let content = fs.readFileSync('src/app/tests/[testId]/take/page.tsx', 'utf8');

content = content.replace(
  `              {/* True/False Option */}`,
  `              {/* Matching Option */}
              {currentQuestion.type === 'matching' && (
                <div className="space-y-4">
                  {currentQuestion.pairs.map((pair: any, idx: number) => {
                    const rightOptions = [...currentQuestion.pairs].map(p => p.right).sort();
                    const currentValue = answers[currentQuestion.questionId]?.[pair.left] || '';
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border bg-card border-border">
                        <div className="flex-1 font-medium">{pair.left}</div>
                        <select 
                          className="flex-1 p-2 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          value={currentValue}
                          onChange={(e) => {
                            const prev = answers[currentQuestion.questionId] || {};
                            handleAnswerSelect(currentQuestion.questionId, { ...prev, [pair.left]: e.target.value });
                          }}
                        >
                          <option value="" disabled>Select match...</option>
                          {rightOptions.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* True/False Option */}`
);

fs.writeFileSync('src/app/tests/[testId]/take/page.tsx', content);
console.log('Added matching to TakeTestPage');
