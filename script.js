let standards = null;
let gradeNames = [];
let currentSex = 'male';
let currentAge = '12';
let rounding = 'round';
let direction = 'higher';
let gradeDirections = [];

async function loadStandards(jsonPath = 'standards.json') {
    const res = await fetch(jsonPath);
    const data = await res.json();
    standards = data.standards;
    gradeNames = data.gradeNames;
    gradeDirections = data.gradeDirections || Array(7).fill('higher');
}

function updateSliders() {
    const slidersDiv = document.getElementById('gradesSliders');
    slidersDiv.innerHTML = '';
    const stds = standards[currentSex][currentAge];
    gradeNames.forEach((name, i) => {
        const min = stds[i].min;
        const max = stds[i].max;
        const slider = document.createElement('div');
        slider.className = 'grade-slider';
        slider.innerHTML = `
            <label>${name}</label>
            <input type="range" min="${min}" max="${max}" step="${rounding === 'round' ? 1 : 0.01}" value="${min}" id="slider${i}">
            <input type="number" min="${min}" max="${max}" step="${rounding === 'round' ? 1 : 0.01}" value="${min}" id="input${i}">
            <select id="dir${i}" class="direction-select">
                <option value="higher" ${gradeDirections[i]==='higher'?'selected':''}>Plus haut meilleur</option>
                <option value="lower" ${gradeDirections[i]==='lower'?'selected':''}>Plus bas meilleur</option>
            </select>
        `;
        slidersDiv.appendChild(slider);
        // Synchronisation slider/number
        const range = slider.querySelector('input[type=range]');
        const number = slider.querySelector('input[type=number]');
        range.addEventListener('input', () => {
            number.value = range.value;
        });
        number.addEventListener('input', () => {
            range.value = number.value;
        });
        // Direction select
        const dirSelect = slider.querySelector('.direction-select');
        dirSelect.addEventListener('change', (e) => {
            gradeDirections[i] = e.target.value;
        });
    });
}

function calculateTotal(e) {
    e.preventDefault();
    let total = 0;
    let stds = standards[currentSex][currentAge];
    for (let i = 0; i < 7; i++) {
        let val = parseFloat(document.getElementById('input'+i).value);
        let min = stds[i].min;
        let max = stds[i].max;
        // Si "plus bas est meilleur", inverser la note
        if (gradeDirections[i] === 'lower') {
            val = max - (val - min);
        }
        total += val;
    }
    let percent = (total / 70) * 100;
    if (rounding === 'round') {
        percent = Math.round(percent);
    } else {
        percent = percent.toFixed(2);
    }
    document.getElementById('result').textContent = `Total : ${total} / 70  |  Pourcentage : ${percent} %`;
}

function handleFileUpload(evt) {
    const file = evt.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = JSON.parse(e.target.result);
        standards = data.standards;
        gradeNames = data.gradeNames;
        updateSliders();
    };
    reader.readAsText(file);
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
    document.getElementById('jsonFile').addEventListener('change', handleFileUpload);
    document.getElementById('gradesForm').addEventListener('submit', calculateTotal);
    updateSliders();
});
