const fs = require('fs');
const file = 'app/admin/page.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add showCalendar state
if (!content.includes('const [showCalendar, setShowCalendar] = useState(false);')) {
  content = content.replace(
    'const [filterDate, setFilterDate] = useState(\'\');',
    'const [filterDate, setFilterDate] = useState(\'\');\n  const [showCalendar, setShowCalendar] = useState(false);'
  );
}

// 2. Add datesWithTests useMemo and tileContent before return (
const calendarHelpers = `
  const datesWithTests = useMemo(() => {
    const dates = new Set();
    athletes.forEach(a => {
      if (a.test_date) dates.add(a.test_date.split('T')[0]);
    });
    return dates;
  }, [athletes]);

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const d = new Date(date);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      const dateStr = d.toISOString().split('T')[0];
      if (datesWithTests.has(dateStr)) {
        return (
          <div className="flex justify-center items-center mt-1">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-sm"></div>
          </div>
        );
      }
    }
    return null;
  };
`;

if (!content.includes('const datesWithTests = useMemo')) {
  // Find the return statement of the component
  const returnIdx = content.indexOf('return (');
  if (returnIdx !== -1) {
    content = content.slice(0, returnIdx) + calendarHelpers + '\n  ' + content.slice(returnIdx);
  }
}

// 3. Replace <input type="date" /> with custom calendar popover
const oldInputRegex = /<input\s+type="date"[\s\S]*?\/>/;

const newCalendarHtml = `
                  <div className="relative">
                    <button 
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="bg-white border border-slate-200 text-xs text-slate-600 rounded-full px-3 py-1.5 outline-none hover:border-[#2563eb] transition-all flex items-center gap-2 shadow-sm"
                    >
                      📅 {filterDate ? formatDateForDisplay(filterDate) : 'Semua Tanggal'}
                    </button>
                    
                    {showCalendar && (
                      <div className="absolute z-50 mt-2 p-2 bg-white rounded-xl shadow-2xl border border-slate-100 left-0 w-[300px]">
                        <div className="flex justify-between items-center mb-2 px-2">
                           <span className="text-xs font-bold text-slate-500">Pilih Tanggal</span>
                           <button onClick={() => setShowCalendar(false)} className="text-slate-400 hover:text-rose-500 font-bold">&times;</button>
                        </div>
                        <Calendar 
                            onChange={(date) => {
                              const d = new Date(date);
                              d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                              setFilterDate(d.toISOString().split('T')[0]);
                              setShowCalendar(false);
                            }}
                            value={filterDate ? new Date(filterDate) : null}
                            tileContent={tileContent}
                            className="border-none text-xs rounded-lg shadow-sm w-full"
                        />
                      </div>
                    )}
                  </div>
`;

content = content.replace(oldInputRegex, newCalendarHtml);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated calendar with yellow dots.');
