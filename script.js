let standards = null;
let gradeNames = [];
let currentSex = 'male';
let currentAge = '12';
let rounding = 'round';
let direction = 'higher';
let gradeDirections = [];
let gradeBlocks = {};

async function loadStandards(jsonPath = 'standards.json') {
    const res = await fetch(jsonPath);
    const data = await res.json();
    standards = data.standards;
    gradeNames = data.gradeNames;
    gradeDirections = data.gradeDirections || Array(7).fill('higher');
    rounding = data.rounding || 'round';
    gradeBlocks = data.gradeBlocks;
}

function updateSliders() {
    const slidersDiv = document.getElementById('gradesSliders');
    slidersDiv.innerHTML = '';
    const stds = standards[currentSex][currentAge];
    gradeNames.forEach((name, i) => {
        const min = stds[i].min;
        const max = stds[i].max;
        const box = document.createElement('div');
        box.className = 'grade-slider';
        box.innerHTML = `
            <label>${name}</label>
            <input type="number" min="${min}" max="${max}" step="${rounding === 'round' ? 1 : 0.01}" value="${min}" id="input${i}">
            <select id="dir${i}" class="direction-select">
                <option value="higher" ${gradeDirections[i]==='higher'?'selected':''}>Plus haut meilleur</option>
                <option value="lower" ${gradeDirections[i]==='lower'?'selected':''}>Plus bas meilleur</option>
            </select>
        `;
        slidersDiv.appendChild(box);
        // Direction select
        const dirSelect = box.querySelector('.direction-select');
        dirSelect.addEventListener('change', (e) => {
            gradeDirections[i] = e.target.value;
        });
    });
}

function getBlockGrade(val, blocks, dir) {
    // blocks = [0,2,4,6,8,10] => 0-1.99=0, 2-3.99=2, ...
    if (dir === 'lower') blocks = [...blocks].reverse();
    for (let i = 0; i < blocks.length-1; i++) {
        if (val >= blocks[i] && val < blocks[i+1]) return blocks[i];
    }
    return blocks[blocks.length-1];
}

function calculateTotal(e) {
    e.preventDefault();
    let total = 0;
    let stds = standards[currentSex][currentAge];
    let blocks = gradeBlocks[currentSex][currentAge];
    for (let i = 0; i < 7; i++) {
        let val = parseFloat(document.getElementById('input'+i).value);
        let dir = gradeDirections[i];
        let blockArr = blocks[i];
        let grade = getBlockGrade(val, blockArr, dir);
        total += grade;
    }
    let percent = (total / 70) * 100;
    if (rounding === 'round') {
        percent = Math.round(percent);
    } else {
        percent = percent.toFixed(2);
    }
    document.getElementById('result').textContent = `Total : ${total} / 70  |  Pourcentage : ${percent} %`;
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadStandards();
    document.getElementById('sex').addEventListener('change', e => {
        currentSex = e.target.value;
        updateSliders();
    });
    document.getElementById('age').addEventListener('change', e => {
        currentAge = e.target.value;
        updateSliders();
    });
    document.getElementById('rounding').addEventListener('change', e => {
        rounding = e.target.value;
        updateSliders();
    });
    document.getElementById('direction').addEventListener('change', e => {
        direction = e.target.value;
    });
    document.getElementById('gradesForm').addEventListener('submit', calculateTotal);
    updateSliders();
});
