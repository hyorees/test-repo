let selectedDate = new Date();

function formatYearMonth(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function updateMonthYearDisplay() {
  const monthYear = document.getElementById('monthYear');
  monthYear.textContent = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월`;
}

// 기분별 한 달 데이터 집계
function aggregateMoodData(yearMonth) {
  const moods = JSON.parse(localStorage.getItem('moods') || '{}');
  const moodCounts = {
    happy: 0,
    sad: 0,
    angry: 0,
    neutral: 0,
    tired: 0,
    smile: 0,
  };

  for (const dateStr in moods) {
    if (dateStr.startsWith(yearMonth)) {
      const mood = moods[dateStr];
      if (moodCounts[mood] !== undefined) {
        moodCounts[mood]++;
      }
    }
  }

  return moodCounts;
}

function getMoodLabelsAndColors() {
  return {
    labels: ['행복 😊', '슬픔 😢', '화남 😠', '무감정 😐', '피곤 🥱', '미소 😁'],
    colors: [
      '#888888',  // 밝은 회색
      '#AAAAAA',  // 더 밝은 회색
      '#CCCCCC',  // 아주 밝은 회색
      '#EEEEEE',  // 거의 흰색에 가까운 회색
      '#999999',  // 중간 밝기 회색
      '#BBBBBB',
    ],
    keys: ['happy', 'sad', 'angry', 'neutral', 'tired', 'smile'],
  };
}

let moodChart;

function renderMoodChart() {
  const yearMonth = formatYearMonth(selectedDate);
  const moodData = aggregateMoodData(yearMonth);
  const { labels, colors, keys } = getMoodLabelsAndColors();

  const data = keys.map(key => moodData[key] || 0);

  if (moodChart) {
    moodChart.data.datasets[0].data = data;
    moodChart.options.plugins.title.text = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 기분 통계`;
    moodChart.update();
  } else {
    const ctx = document.getElementById('moodChart').getContext('2d');
    moodChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '횟수',
          data: data,
          backgroundColor: colors,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 기분 통계`,
            font: { size: 18, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            stepSize: 1,
            ticks: {
              precision: 0,
              color: '#333',
            },
            grid: {
              color: '#eee',
            }
          },
          x: {
            ticks: { color: '#333' },
            grid: { display: false }
          }
        }
      }
    });
  }
}

document.getElementById('prevMonth').addEventListener('click', () => {
  selectedDate.setMonth(selectedDate.getMonth() - 1);
  updateMonthYearDisplay();
  renderMoodChart();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  selectedDate.setMonth(selectedDate.getMonth() + 1);
  updateMonthYearDisplay();
  renderMoodChart();
});

window.onload = () => {
  updateMonthYearDisplay();
  renderMoodChart();
};
