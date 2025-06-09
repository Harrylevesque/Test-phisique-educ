// Script pour éditer standards.csv dans une interface web
// Ajout d'une gestion intelligente des activités, âges, sexes et échelons
const ages = [12, 13, 14, 15, 16, 17];
const sexes = ["male", "female"];
let activities = ["Course à pied", "Pompes", "Abdominaux", "Souplesse", "Saut en longueur", "Lancer de balle", "Vitesse"];

function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((h, i) => obj[h.trim()] = values[i] ? values[i].trim() : '');
        return obj;
    });
}

function toCSV(rows) {
    if (!rows.length) return '';
    const headers = Object.keys(rows[0]);
    const lines = [headers.join(',')];
    rows.forEach(row => {
        lines.push(headers.map(h => row[h]).join(','));
    });
    return lines.join('\n');
}

function renderTable(rows) {
    const tbody = document.getElementById('csvTableBody');
    tbody.innerHTML = '';
    // Calcul des totaux dynamiques
    let totalBySexAge = {};
    rows.forEach(row => {
        const key = row['Sexe'] + '-' + row['Âge'];
        if (!totalBySexAge[key]) totalBySexAge[key] = 0;
        totalBySexAge[key] += Number(row['ScoreMax']) || 0;
    });
    rows.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><select>${sexes.map(s => `<option value="${s}"${row['Sexe']===s?' selected':''}>${s}</option>`).join('')}</select></td>
            <td><select>${ages.map(a => `<option value="${a}"${row['Âge']==a?' selected':''}>${a}</option>`).join('')}</select></td>
            <td><input type="text" value="${row['Activité']||''}" class="activity-input"></td>
            <td><input type="text" value="${row['Nom']||row['Activité']||''}" class="nom-input"></td>
            <td><input type="number" min="1" max="20" value="${row['ScoreMax']||''}"></td>
            <td><input type="number" value="${row['Min']||''}"></td>
            <td><input type="number" value="${row['Max']||''}"></td>
            <td><select>${['higher','lower'].map(d => `<option value="${d}"${row['Direction']===d?' selected':''}>${d}</option>`).join('')}</select></td>
            <td><button type="button" class="editEchelonsBtn">Échelons</button></td>
            <td><button type="button" class="delRowBtn">✖</button></td>
        `;
        // Synchronisation
        tr.querySelectorAll('input,select').forEach((input, i) => {
            input.addEventListener('input', () => {
                const keys = ['Sexe','Âge','Activité','Nom','ScoreMax','Min','Max','Direction'];
                row[keys[i]] = input.value;
            });
        });
        // Gestion des échelons
        tr.querySelector('.editEchelonsBtn').onclick = () => {
            editEchelonsModal(row);
        };
        tr.querySelector('.delRowBtn').onclick = () => {
            rows.splice(idx, 1);
            renderTable(rows);
        };
        tbody.appendChild(tr);
    });
    // Affichage des totaux interactifs
    const totalDiv = document.getElementById('totauxSexAge');
    if (totalDiv) {
        totalDiv.innerHTML = '';
    } else {
        const newDiv = document.createElement('div');
        newDiv.id = 'totauxSexAge';
        document.querySelector('.container').insertBefore(newDiv, document.getElementById('csvForm'));
    }
    const tDiv = document.getElementById('totauxSexAge');
    tDiv.innerHTML = '<b>Totaux par sexe et âge :</b><br>' + Object.entries(totalBySexAge).map(([k,v]) => `${k} : ${v}`).join(' | ');
}

function addActivityToAll(activity) {
    // Demander le nom à afficher pour chaque sexe/âge
    sexes.forEach(sex => {
        ages.forEach(age => {
            let customName = prompt(`Nom affiché pour ${activity} (${sex === 'male' ? 'garçon' : 'fille'}, ${age} ans) :`, activity);
            rows.push({Sexe:sex,Âge:String(age),Activité:activity,Nom:customName,ScoreMax:'10',Min:'0',Max:'10',Direction:'higher',Echelons:''});
        });
    });
    renderTable(rows);
}

function editEchelonsModal(row) {
    const val = row['Echelons'] || '';
    const input = prompt('Entrez les échelons séparés par des virgules (ex: 0,2,4,6,8,10):', val);
    if (input !== null) {
        row['Echelons'] = input;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.rows = [];
    // Charger le CSV existant si possible
    fetch('standards.csv').then(r => r.ok ? r.text() : '').then(text => {
        if (text) rows = parseCSV(text);
        else rows = [{Sexe:'male',Âge:'12',Activité:'Course à pied',ScoreMax:'10',Min:'0',Max:'10',Direction:'higher',Echelons:''}];
        renderTable(rows);
    });
    document.getElementById('addRowBtn').onclick = () => {
        const activity = prompt('Nom de la nouvelle activité à ajouter à tous les âges et sexes ?');
        if (activity && !activities.includes(activity)) {
            activities.push(activity);
            addActivityToAll(activity);
        } else if (activity) {
            alert('Cette activité existe déjà.');
        }
    };
    document.getElementById('downloadBtn').onclick = () => downloadCSV(rows);
    document.getElementById('csvFileInput').onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        loadCSVFile(file, text => {
            rows = parseCSV(text);
            renderTable(rows);
        });
    };
});
