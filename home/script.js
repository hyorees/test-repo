// 날짜, 기분, 메모, 할일 데이터 저장용
let selectedDate = new Date();
let moods = JSON.parse(localStorage.getItem('moods') || '{}');
let memos = JSON.parse(localStorage.getItem('memos') || '{}');
let todos = JSON.parse(localStorage.getItem('todos') || '{}');

function formatDate(date) {
    return date.toISOString().slice(0, 10);
}

function renderCalendar() {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    document.getElementById('monthYear').textContent = `${year}년 ${month + 1}월`;

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    let html = '';
    let day = 1 - firstDay;
    for (let i = 0; i < 6; i++) {
        html += '<tr>';
        for (let j = 0; j < 7; j++, day++) {
            if (day < 1 || day > lastDate) {
                html += '<td></td>';
            } else {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                let classes = [];
                if (formatDate(selectedDate) === dateStr) classes.push('selected');
                if (moods[dateStr]) classes.push('has-mood');
                const currentDate = new Date(year, month, day);
                const dayOfWeek = currentDate.getDay();
                if(dayOfWeek === 0) classes.push('sunday');
                html += `<td class="${classes.join(' ')}" data-date="${dateStr}">${day}`;
                if (moods[dateStr]) {
                    html += `<span class="mood-icon">${getMoodIcon(moods[dateStr])}</span>`;
                }
                html += `</td>`;
            }
        }
        html += '</tr>';
    }
    document.getElementById('calendarBody').innerHTML = html;

    // 날짜 클릭 이벤트
    document.querySelectorAll('.calendar td[data-date]').forEach(td => {
        td.onclick = () => {
            selectedDate = new Date(td.dataset.date);
            renderCalendar();
            renderMood();
            renderMemo();
            renderTodos();
        };
    });
}

function getMoodIcon(mood) {
    switch (mood) {
        case 'happy':
            return '😊';
        case 'sad':
            return '😢';
        case 'angry':
            return '😠';
        case 'neutral':
            return '😐';
        case 'tired':
            return '🥱';
        case 'smile':
            return '😁';
        default:
            return '';
    }
}

function renderMood() {
    const dateStr = formatDate(selectedDate);
    document.querySelectorAll('.mood-select span').forEach(span => {
        span.classList.toggle('selected', moods[dateStr] === span.dataset.mood);
        span.onclick = () => {
            if (moods[dateStr] === span.dataset.mood) {
                delete moods[dateStr];
            } else {
                moods[dateStr] = span.dataset.mood;
            }
            localStorage.setItem('moods', JSON.stringify(moods));
            renderCalendar();
            renderMood();
        };
    });
}

function renderMemo() {
    const dateStr = formatDate(selectedDate);
    document.getElementById('memo').value = memos[dateStr] || '';
}

function renderTodos() {
    const dateStr = formatDate(selectedDate);
    const list = todos[dateStr] || [];
    const ul = document.getElementById('todoList');
    const activeCategory = document.querySelector('.tab.active').dataset.category;

    ul.innerHTML = '';
    list.forEach((item, idx) => {
        // 전체가 아닐 때만 카테고리 필터링
        if (activeCategory && activeCategory !== '' && item.category !== activeCategory) return;

        const li = document.createElement('li');
        if (item.done) li.classList.add('completed');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.done;
        checkbox.onchange = () => {
            item.done = checkbox.checked;
            localStorage.setItem('todos', JSON.stringify(todos));
            renderTodos();
        };

        const span = document.createElement('span');
        span.textContent = item.text;

        // 카테고리 표시
        if (item.category) {
            const categorySpan = document.createElement('span');
            let categoryText = '';
            switch (item.category) {
                case 'work': categoryText = ' 🏫'; break;
                case 'personal': categoryText = ' 🙎‍♀️'; break;
                case 'exercise': categoryText = ' 🏊'; break;
                case 'shopping': categoryText = ' 🛒'; break;
            }
            categorySpan.textContent = categoryText;
            categorySpan.style.fontSize = '0.9em';
            span.appendChild(categorySpan);
        }

        const editBtn = document.createElement('button');
        editBtn.textContent = '✏️';
        editBtn.onclick = () => {
            const editContainer = document.createElement('div');
            editContainer.style.display = 'flex';
            editContainer.style.gap = '5px';
            editContainer.style.flex = '1';
            
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.value = item.text;
            textInput.style.flex = '1';
            
            const categorySelect = document.createElement('select');
            categorySelect.innerHTML = `
                <option value="">기본</option>
                <option value="work">🏫 학교</option>
                <option value="personal">🙎‍♀️ 개인</option>
                <option value="exercise">🏊 운동</option>
                <option value="shopping">🛒 쇼핑</option>
            `;
            categorySelect.value = item.category || '';
            categorySelect.style.fontSize = '0.8em';
            
            const saveChanges = () => {
                item.text = textInput.value;
                item.category = categorySelect.value;
                localStorage.setItem('todos', JSON.stringify(todos));
                renderTodos();
            };
            
            textInput.onkeydown = (e) => {
                if (e.key === 'Enter') saveChanges();
            };
            
            editContainer.appendChild(textInput);
            editContainer.appendChild(categorySelect);
            li.replaceChild(editContainer, span);
            textInput.focus();
            
            const handleClickOutside = (e) => {
                if (!editContainer.contains(e.target)) {
                    saveChanges();
                    document.removeEventListener('click', handleClickOutside);
                }
            };
            
            setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 0);
        };

        const delBtn = document.createElement('button');
        delBtn.textContent = '🗑️';
        delBtn.onclick = () => {
            list.splice(idx, 1);
            todos[dateStr] = list;
            localStorage.setItem('todos', JSON.stringify(todos));
            renderTodos();
        };

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(editBtn);
        li.appendChild(delBtn);
        ul.appendChild(li);
    });
}

document.getElementById('prevMonth').onclick = () => {
    selectedDate.setMonth(selectedDate.getMonth() - 1);
    renderCalendar();
    renderMood();
    renderMemo();
    renderTodos();
};
document.getElementById('todayBtn').onclick = () => {
    selectedDate = new Date();
    renderCalendar();
    renderMood();
    renderMemo();
    renderTodos();
}
document.getElementById('nextMonth').onclick = () => {
    selectedDate.setMonth(selectedDate.getMonth() + 1);
    renderCalendar();
    renderMood();
    renderMemo();
    renderTodos();
};
document.getElementById('saveMemo').onclick = () => {
    const dateStr = formatDate(selectedDate);
    memos[dateStr] = document.getElementById('memo').value;
    localStorage.setItem('memos', JSON.stringify(memos));
    alert('메모가 저장되었습니다!');
};
document.getElementById('addTodo').onclick = () => {
    const dateStr = formatDate(selectedDate);
    const input = document.getElementById('todoInput');
    const category = document.getElementById('categorySelect').value;

    if (!input.value.trim()) return;

    // 기본 할 일 목록 추가
    if (!todos[dateStr]) todos[dateStr] = [];
    todos[dateStr].push({
        text: input.value,
        done: false,
        category: category  // 카테고리 정보 저장
    });

    localStorage.setItem('todos', JSON.stringify(todos));
    input.value = '';
    renderTodos();
};

// 탭 클릭 이벤트
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // 활성 탭 변경
        document.querySelector('.tab.active').classList.remove('active');
        tab.classList.add('active');

        // 카테고리 선택 변경
        const category = tab.dataset.category;
        document.getElementById('categorySelect').value = category;

        // 할 일 목록 필터링 및 표시
        renderTodos();
    });
});

// 카테고리 선택 변경 이벤트
document.getElementById('categorySelect').addEventListener('change', function () {
    const selectedCategory = this.value;
    const todoInput = document.getElementById('todoInput');
    const newCategoryDiv = document.getElementById('newCategoryDiv');

    if (selectedCategory === 'new') {
        newCategoryDiv.style.display = 'block';
        todoInput.style.display = 'none';
    } else {
        newCategoryDiv.style.display = 'none';
        todoInput.style.display = 'block';
    }
});

document.getElementById('todoInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('addTodo').click();
    }
});

document.getElementById('addNewCategoryButton').onclick = function () {
    const newCategoryInput = document.getElementById('newCategoryInput');
    const newCategoryName = newCategoryInput.value.trim();
    const categorySelect = document.getElementById('categorySelect');

    if (!newCategoryName) {
        alert('카테고리 이름을 입력하세요!');
        return;
    }

    // 이미 있는 카테고리인지 확인
    for (let i = 0; i < categorySelect.options.length; i++) {
        if (categorySelect.options[i].text === newCategoryName) {
            alert('이미 존재하는 카테고리입니다!');
            return;
        }
    }

    // 새 옵션 추가 (value는 영문/숫자/한글 모두 허용)
    const newOption = document.createElement('option');
    newOption.value = newCategoryName;
    newOption.text = newCategoryName;
    // '새 카테고리 만들기' 옵션 바로 위에 추가
    categorySelect.insertBefore(newOption, categorySelect.options[categorySelect.options.length - 1]);
    categorySelect.value = newCategoryName;

    // 입력창 초기화 및 숨김
    newCategoryInput.value = '';
    document.getElementById('newCategoryDiv').style.display = 'none';
    document.getElementById('todoInput').style.display = 'block';
};

window.onload = () => {
    renderCalendar();
    renderMood();
    renderMemo();
    renderTodos();
}; 