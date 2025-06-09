// Script pour la page de création de standards.json
const ages = [12, 13, 14, 15, 16, 17];
const sexes = ["male", "female"];
const defaultGradeNames = [
    "Course à pied", "Pompes", "Abdominaux", "Souplesse", "Saut en longueur", "Lancer de balle", "Vitesse"
];
const defaultDirections = ["higher", "higher", "higher", "higher", "higher", "higher", "higher"];

function createStandardsBlocksInputs() {
    const div = document.getElementById('standardsBlocks');
    div.innerHTML = '';
    sexes.forEach(sex => {
        ages.forEach(age => {
            div.innerHTML += `<div class="section-title" style="margin-top:18px;">${sex === 'male' ? 'Garçon' : 'Fille'} - ${age} ans</div>`;
            div.innerHTML += `<table class="block-table"><tr><th>Critère</th><th>Min</th><th>Max</th><th>Blocs (virgule)</th><th>Scores (virgule)</th></tr>`;
            for (let i = 0; i < 7; i++) {
                div.innerHTML += `<tr>
                    <td>${i+1}</td>
                    <td><input type="number" id="std-${sex}-${age}-${i}-min" value="0" style="width:50px;"></td>
                    <td><input type="number" id="std-${sex}-${age}-${i}-max" value="10" style="width:50px;"></td>
                    <td><input type="text" id="blocks-${sex}-${age}-${i}" value="0,2,4,6,8,10" style="width:110px;"></td>
                    <td><input type="text" id="scores-${sex}-${age}-${i}" value="0,2,4,6,8,10" style="width:110px;"></td>
                </tr>`;
            }
            div.innerHTML += `</table>`;
        });
    });
}

function generateJSON() {
    const rounding = document.getElementById('rounding').value;
    const gradeNames = [];
    const gradeDirections = [];
    for (let i = 0; i < 7; i++) {
        gradeNames.push(document.getElementById(`gradeName${i}`).value);
        gradeDirections.push(document.getElementById(`gradeDir${i}`).value);
    }
    // Standards, Blocks, Scores
    let standards = { male: {}, female: {} };
    let gradeBlocks = { male: {}, female: {} };
    let gradeScores = { male: {}, female: {} };
    sexes.forEach(sex => {
        standards[sex] = {};
        gradeBlocks[sex] = {};
        gradeScores[sex] = {};
        ages.forEach(age => {
            standards[sex][age] = [];
            gradeBlocks[sex][age] = [];
            gradeScores[sex][age] = [];
            for (let i = 0; i < 7; i++) {
                const min = parseFloat(document.getElementById(`std-${sex}-${age}-${i}-min`).value);
                const max = parseFloat(document.getElementById(`std-${sex}-${age}-${i}-max`).value);
                const blocks = document.getElementById(`blocks-${sex}-${age}-${i}`).value.split(',').map(Number);
                const scores = document.getElementById(`scores-${sex}-${age}-${i}`).value.split(',').map(Number);
                standards[sex][age].push({ min, max });
                gradeBlocks[sex][age].push(blocks);
                gradeScores[sex][age].push(scores);
            }
        });
    });
    const obj = {
        standards,
        gradeNames,
        gradeDirections,
        rounding,
        gradeBlocks,
        gradeScores
    };
    return obj;
}

function updateJSONOutput() {
    const obj = generateJSON();
    document.getElementById('jsonOutput').textContent = JSON.stringify(obj, null, 2);
}

document.addEventListener('DOMContentLoaded', () => {
    // Les inputs de critères sont déjà dans le HTML
    createStandardsBlocksInputs();
    updateJSONOutput();
    document.getElementById('standardForm').addEventListener('input', updateJSONOutput);
    document.getElementById('generateBtn').addEventListener('click', updateJSONOutput);
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const obj = generateJSON();
        const blob = new Blob([JSON.stringify(obj, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'standards.json';
        a.click();
        URL.revokeObjectURL(url);
    });
});
