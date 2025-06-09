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
        div.innerHTML += `<div class="section-title" style="margin-top:30px; background:#e3eaf2; padding:8px 10px; border-radius:6px;">${sex === 'male' ? 'Garçons' : 'Filles'}</div>`;
        ages.forEach(age => {
            div.innerHTML += `<div style="margin:18px 0 6px 0; font-weight:bold; color:#3867d6;">Âge : ${age} ans</div>`;
            div.innerHTML += `<table class="block-table" style="margin-bottom:20px; background:#f9fbfd;">
            <tr style="background:#dbeafe;">
                <th style="width:40px;">#</th>
                <th style="width:120px;">Nom du critère</th>
                <th style="width:80px;">Score max</th>
                <th style="width:80px;">Min</th>
                <th style="width:80px;">Max</th>
            </tr>`;
            for (let i = 0; i < 7; i++) {
                div.innerHTML += `<tr>
                    <td>${i+1}</td>
                    <td><input type="text" id="label-${sex}-${age}-${i}" value="" placeholder="Nom..." style="width:110px;"></td>
                    <td><input type="number" id="score-${sex}-${age}-${i}" value="10" min="1" max="10" style="width:60px;"></td>
                    <td><input type="number" id="std-${sex}-${age}-${i}-min" value="0" style="width:60px;"></td>
                    <td><input type="number" id="std-${sex}-${age}-${i}-max" value="10" style="width:60px;"></td>
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
                const score = parseFloat(document.getElementById(`score-${sex}-${age}-${i}`).value);
                standards[sex][age].push({ min, max });
                gradeBlocks[sex][age].push([min, max]);
                gradeScores[sex][age].push([score]);
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
