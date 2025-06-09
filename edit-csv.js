// Script pour éditer standards.csv dans une interface web
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
    rows.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><select>${['male','female'].map(s => `<option value="${s}"${row['Sexe']===s?' selected':''}>${s}</option>`).join('')}</select></td>
            <td><input type="number" min="10" max="20" value="${row['Âge']||''}"></td>
            <td><input type="text" value="${row['Activité']||''}"></td>
            <td><input type="number" min="1" max="10" value="${row['ScoreMax']||''}"></td>
            <td><input type="number" value="${row['Min']||''}"></td>
            <td><input type="number" value="${row['Max']||''}"></td>
            <td><select>${['higher','lower'].map(d => `<option value="${d}"${row['Direction']===d?' selected':''}>${d}</option>`).join('')}</select></td>
            <td><button type="button" class="delRowBtn">✖</button></td>
        `;
        // Synchronisation
        tr.querySelectorAll('input,select').forEach((input, i) => {
            input.addEventListener('input', () => {
                const keys = ['Sexe','Âge','Activité','ScoreMax','Min','Max','Direction'];
                row[keys[i]] = input.value;
            });
        });
        tr.querySelector('.delRowBtn').onclick = () => {
            rows.splice(idx, 1);
            renderTable(rows);
        };
        tbody.appendChild(tr);
    });
}

function downloadCSV(rows) {
    const csv = toCSV(rows);
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'standards.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function loadCSVFile(file, cb) {
    const reader = new FileReader();
    reader.onload = e => cb(e.target.result);
    reader.readAsText(file);
}

document.addEventListener('DOMContentLoaded', () => {
    let rows = [];
    // Charger le CSV existant si possible
    fetch('standards.csv').then(r => r.ok ? r.text() : '').then(text => {
        if (text) rows = parseCSV(text);
        else rows = [{Sexe:'male',Âge:'12',Activité:'Course à pied',ScoreMax:'10',Min:'0',Max:'10',Direction:'higher'}];
        renderTable(rows);
    });
    document.getElementById('addRowBtn').onclick = () => {
        rows.push({Sexe:'male',Âge:'12',Activité:'',ScoreMax:'10',Min:'0',Max:'10',Direction:'higher'});
        renderTable(rows);
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
