// ==========================================
// 1. QUẢN LÝ DROPDOWN & TÌM KIẾM
// ==========================================
function toggleMainMenu(event) {
    event.stopPropagation(); 
    const container = document.getElementById("presetDropdownContainer");
    container.classList.toggle("show");
    
    if (container.classList.contains("show")) {
        setTimeout(() => document.getElementById("subjectSearch").focus(), 50);
    }
}

window.onclick = function(event) {
    if (!event.target.closest('.dropdown')) {
        const dropdown = document.getElementById("presetDropdownContainer");
        if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
}

function filterSubjects() {
    const query = document.getElementById("subjectSearch").value.toLowerCase();
    const catList = document.getElementById("presetDropdownMenu");
    const resList = document.getElementById("searchResults");

    if (query.trim() === "") {
        catList.style.display = "block";
        resList.style.display = "none";
        return;
    }

    catList.style.display = "none";
    resList.style.display = "block";
    resList.innerHTML = ""; 

    let found = false;
    PRESET_DATA.forEach(group => {
        group.subjects.forEach(data => {
            if (data.code.toLowerCase().includes(query) || data.name.toLowerCase().includes(query)) {
                found = true;
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.className = "dropdown-item";
                a.innerHTML = `<strong style="color: var(--primary-color);">${data.code}</strong> &nbsp; - &nbsp; ${data.name}`;
                a.style.fontWeight = "400";
                
                a.onclick = function(e) {
                    e.preventDefault(); 
                    const table = document.getElementById("subjectTable").getElementsByTagName('tbody')[0];
                    const newRow = table.insertRow();
                    newRow.innerHTML = createRowHTML(data);
                    attachDragEvents(newRow);
                    calculateSingleRow(newRow);
                    saveData();
                    
                    document.getElementById("presetDropdownContainer").classList.remove('show');
                    document.getElementById("subjectSearch").value = ""; 
                    filterSubjects(); 
                };
                li.appendChild(a);
                resList.appendChild(li);
            }
        });
    });

    if (!found) {
        resList.innerHTML = `<li class="dropdown-item" style="color: var(--error-color); justify-content: center; cursor: default;">❌ Không tìm thấy môn học</li>`;
    }
}

// ==========================================
// 2. KÉO THẢ (DRAG & DROP)
// ==========================================
let dragSrcEl = null;

function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.classList.add('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) { e.preventDefault(); }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) { e.stopPropagation(); }
    
    if (dragSrcEl !== this) {
        const tbody = this.parentNode;
        const rows = Array.from(tbody.children);
        const srcIndex = rows.indexOf(dragSrcEl);
        const tgtIndex = rows.indexOf(this);

        if (srcIndex < tgtIndex) {
            this.after(dragSrcEl);
        } else {
            this.before(dragSrcEl);
        }
    }
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    const rows = document.querySelectorAll('#subjectTable tbody tr');
    rows.forEach(row => row.classList.remove('drag-over'));
    saveData(); 
}

function attachDragEvents(row) {
    row.setAttribute('draggable', 'true');
    row.addEventListener('dragstart', handleDragStart, false);
    row.addEventListener('dragenter', handleDragEnter, false);
    row.addEventListener('dragover', handleDragOver, false);
    row.addEventListener('dragleave', handleDragLeave, false);
    row.addEventListener('drop', handleDrop, false);
    row.addEventListener('dragend', handleDragEnd, false);
}

// ==========================================
// 3. TẠO HTML ROW & XỬ LÝ GIAO DIỆN CHUNG
// ==========================================
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const btn = document.getElementById("themeBtn");
    if (currentTheme === "dark") {
        document.documentElement.removeAttribute("data-theme");
        btn.innerHTML = "🌙 Chế độ tối";
        localStorage.setItem("uit_gpa_theme_store", "light"); 
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
        btn.innerHTML = "☀️ Chế độ sáng";
        localStorage.setItem("uit_gpa_theme_store", "dark"); 
    }
}

function createRowHTML(data = {}) {
    const code = data.code || "";
    const name = data.name || "";
    const credits = data.credits || "3";
    const qt = data.qt || "";
    const th = data.th || "";
    const gk = data.gk || "";
    const ck = data.ck || "";
    const expected = data.expected || "";
    const w_qt = data.w_qt !== undefined ? data.w_qt : "20";
    const w_th = data.w_th !== undefined ? data.w_th : "0";
    const w_gk = data.w_gk !== undefined ? data.w_gk : "20";
    const w_ck = data.w_ck !== undefined ? data.w_ck : "60";

    return `
        <td><div class="drag-handle" title="Kéo để di chuyển">☰</div></td>
        <td><input type="text" class="sub-code borderless" placeholder="Mã MH" value="${code}"></td>
        <td><input type="text" class="sub-name borderless" placeholder="Tên môn học" value="${name}"></td>
        <td><input type="number" class="sub-credits borderless" min="1" value="${credits}"></td>
        <td>
            <div class="grade-cell">
                <input type="text" class="sub-grade sub-qt" placeholder="Trống" value="${qt}">
                <div class="weight-input-wrapper"><input type="number" class="w-qt" value="${w_qt}" min="0" max="100">%</div>
            </div>
        </td>
        <td>
            <div class="grade-cell">
                <input type="text" class="sub-grade sub-th" placeholder="Trống" value="${th}">
                <div class="weight-input-wrapper"><input type="number" class="w-th" value="${w_th}" min="0" max="100">%</div>
            </div>
        </td>
        <td>
            <div class="grade-cell">
                <input type="text" class="sub-grade sub-gk" placeholder="Trống" value="${gk}">
                <div class="weight-input-wrapper"><input type="number" class="w-gk" value="${w_gk}" min="0" max="100">%</div>
            </div>
        </td>
        <td>
            <div class="grade-cell">
                <input type="text" class="sub-grade sub-ck" placeholder="Trống" value="${ck}">
                <div class="weight-input-wrapper"><input type="number" class="w-ck" value="${w_ck}" min="0" max="100">%</div>
            </div>
        </td>
        <td class="final-grade">-</td>
        <td><input type="number" class="sub-expected" min="0" max="10" step="0.1" placeholder="Mục tiêu" value="${expected}"></td>
        <td><button class="btn btn-delete" onclick="deleteRow(this)">Xóa</button></td>
    `;
}

function addRow() {
    const table = document.getElementById("subjectTable").getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.innerHTML = createRowHTML();
    attachDragEvents(newRow);
    calculateSingleRow(newRow);
    saveData();
}

function deleteRow(button) {
    const tbody = button.closest('tbody');
    if (tbody.rows.length > 1) {
        tbody.removeChild(button.closest('tr'));
        saveData(); 
    } else {
        alert("Phải giữ lại ít nhất một môn học!");
    }
}

// ==========================================
// 4. THUẬT TOÁN TÍNH TOÁN ĐIỂM SỐ (ĐÃ THÊM LÀM TRÒN)
// ==========================================
function convertToHệ4(grade10) {
    if (grade10 >= 8.5) return 4.0;
    if (grade10 >= 8.0) return 3.5;
    if (grade10 >= 7.0) return 3.0;
    if (grade10 >= 6.5) return 2.5;
    if (grade10 >= 5.5) return 2.0;
    if (grade10 >= 5.0) return 1.5;
    if (grade10 >= 4.0) return 1.0;
    return 0.0;
}

function getRank(gpa4) {
    if (gpa4 >= 3.6) return "Xuất sắc";
    if (gpa4 >= 3.2) return "Giỏi";
    if (gpa4 >= 2.5) return "Khá";
    if (gpa4 >= 2.0) return "Trung bình";
    return "Yếu/Kém";
}

function calculateSingleRow(row) {
    let w_qt_el = row.querySelector(".w-qt");
    let w_th_el = row.querySelector(".w-th");
    let w_gk_el = row.querySelector(".w-gk");
    let w_ck_el = row.querySelector(".w-ck");

    if (!w_qt_el || !w_th_el || !w_gk_el || !w_ck_el) return;

    let w_qt = (parseFloat(w_qt_el.value) || 0) / 100;
    let w_th = (parseFloat(w_th_el.value) || 0) / 100;
    let w_gk = (parseFloat(w_gk_el.value) || 0) / 100;
    let w_ck = (parseFloat(w_ck_el.value) || 0) / 100;

    const avgCell = row.querySelector(".final-grade");
    const totalWeight = w_qt + w_th + w_gk + w_ck;
    
    if (Math.abs(totalWeight - 1) > 0.001) {
        if (avgCell) { avgCell.innerText = "Sai %"; avgCell.style.color = "var(--error-color)"; }
        return; 
    } else {
        if (avgCell) avgCell.style.color = "var(--primary-color)";
    }

    const inputQt = row.querySelector(".sub-qt");
    const inputTh = row.querySelector(".sub-th");
    const inputGk = row.querySelector(".sub-gk");
    const inputCk = row.querySelector(".sub-ck");
    const expectedInput = row.querySelector(".sub-expected");

    [inputQt, inputTh, inputGk, inputCk].forEach(input => {
        if (input && input.classList.contains("auto-calculated")) {
            input.value = "";
            input.classList.remove("auto-calculated", "over-limit");
        }
    });

    let qt = inputQt.value.trim() === "" ? null : parseFloat(inputQt.value);
    let th = inputTh.value.trim() === "" ? null : parseFloat(inputTh.value);
    let gk = inputGk.value.trim() === "" ? null : parseFloat(inputGk.value);
    let ck = inputCk.value.trim() === "" ? null : parseFloat(inputCk.value);
    let expected = expectedInput.value.trim() === "" ? null : parseFloat(expectedInput.value);

    if (expected !== null && !isNaN(expected)) {
        let currentPoints = 0;
        let missingWeight = 0;
        let missingInputs = [];

        if (qt !== null && !isNaN(qt)) currentPoints += qt * w_qt; else if (w_qt > 0) { missingWeight += w_qt; missingInputs.push(inputQt); }
        if (th !== null && !isNaN(th)) currentPoints += th * w_th; else if (w_th > 0) { missingWeight += w_th; missingInputs.push(inputTh); }
        if (gk !== null && !isNaN(gk)) currentPoints += gk * w_gk; else if (w_gk > 0) { missingWeight += w_gk; missingInputs.push(inputGk); }
        if (ck !== null && !isNaN(ck)) currentPoints += ck * w_ck; else if (w_ck > 0) { missingWeight += w_ck; missingInputs.push(inputCk); }

        if (missingInputs.length > 0 && missingWeight > 0) {
            let requiredScore = (expected - currentPoints) / missingWeight;
            if (requiredScore < 0) requiredScore = 0;

            missingInputs.forEach(input => {
                input.value = requiredScore.toFixed(1);
                input.classList.add("auto-calculated");
                if (requiredScore > 10) input.classList.add("over-limit"); 
                else input.classList.remove("over-limit");
            });

            if (qt === null && w_qt > 0) qt = requiredScore;
            if (th === null && w_th > 0) th = requiredScore;
            if (gk === null && w_gk > 0) gk = requiredScore;
            if (ck === null && w_ck > 0) ck = requiredScore;
        }
    } else {
        if (qt === null) qt = 0;
        if (th === null) th = 0;
        if (gk === null) gk = 0;
        if (ck === null) ck = 0;
    }

    // LÀM TRÒN ĐIỂM HỆ 10 THEO CHUẨN UIT (1 CHỮ SỐ THẬP PHÂN)
    let subjectAvg10 = (qt * w_qt) + (th * w_th) + (gk * w_gk) + (ck * w_ck);
    subjectAvg10 = Math.round((subjectAvg10 + Number.EPSILON) * 10) / 10;
    
    if (avgCell && !isNaN(subjectAvg10)) {
        avgCell.innerText = subjectAvg10.toFixed(1); // Hiển thị chuẩn 1 số (vd: 9.7)
    }
}

function calculateTotalGPA() {
    document.querySelectorAll("#subjectTable tbody tr").forEach(row => calculateSingleRow(row));

    const rows = document.querySelectorAll("#subjectTable tbody tr");
    let totalCredits = 0;
    let totalPoints10 = 0;
    let totalPoints4 = 0;
    let hasError = false;

    rows.forEach((row) => {
        const credits = parseInt(row.querySelector(".sub-credits").value);
        if (isNaN(credits) || credits <= 0) return;

        const avgText = row.querySelector(".final-grade").innerText;
        if (avgText === "Sai %") { hasError = true; return; }

        const w_qt = (parseFloat(row.querySelector(".w-qt").value) || 0) / 100;
        const w_th = (parseFloat(row.querySelector(".w-th").value) || 0) / 100;
        const w_gk = (parseFloat(row.querySelector(".w-gk").value) || 0) / 100;
        const w_ck = (parseFloat(row.querySelector(".w-ck").value) || 0) / 100;

        const qt = parseFloat(row.querySelector(".sub-qt").value) || 0;
        const th = parseFloat(row.querySelector(".sub-th").value) || 0;
        const gk = parseFloat(row.querySelector(".sub-gk").value) || 0;
        const ck = parseFloat(row.querySelector(".sub-ck").value) || 0;

        // TÍNH LẠI VÀ LÀM TRÒN ĐIỂM TỪNG MÔN TRƯỚC KHI CỘNG VÀO TỔNG
        let subjectAvg10 = (qt * w_qt) + (th * w_th) + (gk * w_gk) + (ck * w_ck);
        subjectAvg10 = Math.round((subjectAvg10 + Number.EPSILON) * 10) / 10;

        totalCredits += credits;
        totalPoints10 += subjectAvg10 * credits;
        totalPoints4 += convertToHệ4(subjectAvg10) * credits;
    });

    if (hasError) { alert("⚠️ Có môn học nhập sai tổng % (không bằng 100%). Sửa lỗi màu đỏ trước khi tính!"); return; }
    if (totalCredits === 0) { alert("Vui lòng nhập ít nhất 1 môn có số tín chỉ lớn hơn 0!"); return; }

    const finalGpa10 = (totalPoints10 / totalCredits).toFixed(2);
    const finalGpa4 = (totalPoints4 / totalCredits).toFixed(2);
    const rank = getRank(parseFloat(finalGpa4));

    document.getElementById("resTotalCredits").innerText = totalCredits;
    document.getElementById("resGpa10").innerText = finalGpa10;
    document.getElementById("resGpa4").innerText = finalGpa4;
    document.getElementById("resRank").innerText = rank;
    
    document.getElementById("resultBox").style.display = "block";
}

// ==========================================
// 5. LOCAL STORAGE
// ==========================================
function saveData() {
    const rows = document.querySelectorAll("#subjectTable tbody tr");
    const data = [];
    rows.forEach(row => {
        data.push({
            code: row.querySelector(".sub-code").value,
            name: row.querySelector(".sub-name").value,
            credits: row.querySelector(".sub-credits").value,
            qt: row.querySelector(".sub-qt").value,
            th: row.querySelector(".sub-th").value,
            gk: row.querySelector(".sub-gk").value,
            ck: row.querySelector(".sub-ck").value,
            expected: row.querySelector(".sub-expected").value,
            w_qt: row.querySelector(".w-qt").value,
            w_th: row.querySelector(".w-th").value,
            w_gk: row.querySelector(".w-gk").value,
            w_ck: row.querySelector(".w-ck").value
        });
    });
    localStorage.setItem("uit_gpa_data_store", JSON.stringify(data));
}

function loadData() {
    if (localStorage.getItem("uit_gpa_theme_store") === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        document.getElementById("themeBtn").innerHTML = "☀️ Chế độ sáng";
    }

    const savedData = localStorage.getItem("uit_gpa_data_store");
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            const tbody = document.querySelector("#subjectTable tbody");
            if (data && data.length > 0) {
                tbody.innerHTML = ""; 
                data.forEach(item => {
                    const newRow = tbody.insertRow();
                    newRow.innerHTML = createRowHTML(item);
                    attachDragEvents(newRow); 
                    calculateSingleRow(newRow); 
                });
            }
        } catch (e) {
            console.error("Lỗi phục hồi dữ liệu:", e);
        }
    } else {
        addRow(); 
    }
}

// ==========================================
// 6. CẤU TRÚC PRESET MÔN CE & TẠO MENU CHÍNH
// ==========================================
const PRESET_DATA = [
    {
        category: "📚 Khối Đại Cương",
        subjects: [
            { code: "IT001", name: "Nhập môn lập trình", credits: 3, w_qt: 20, w_gk: 0, w_th: 40, w_ck: 40 },
            { code: "IT003", name: "Cấu trúc Dữ liệu", credits: 3, w_qt: 20, w_gk: 0, w_th: 40, w_ck: 40 },
            { code: "PH002", name: "Nhập môn mạch số", credits: 3, w_qt: 15, w_gk: 15, w_th: 20, w_ck: 50 },
            { code: "IT006", name: "Kiến trúc máy tính", credits: 3, w_qt: 30, w_gk: 20, w_th: 0, w_ck: 50 },
            { code: "MA006", name: "Giải tích", credits: 3, w_qt: 20, w_gk: 20, w_th: 0, w_ck: 60 },
            { code: "MA003", name: "Đại số tuyến tính", credits: 3, w_qt: 20, w_gk: 20, w_th: 0, w_ck: 60 },
            { code: "MA004", name: "Cấu trúc rời rạc", credits: 3, w_qt: 20, w_gk: 20, w_th: 0, w_ck: 60 },
            { code: "MA005", name: "Xác suất thống kê", credits: 3, w_qt: 20, w_gk: 20, w_th: 0, w_ck: 60 }
        ]
    },
    {
        category: "💻 Cơ Sở Ngành (TKVM)",
        subjects: [
            { code: "CE006", name: "Giới thiệu ngành TKVM", credits: 3, w_qt: 50, w_gk: 0, w_th: 0, w_ck: 50 },
            { code: "CE126", name: "Vật lý bán dẫn và ứng dụng", credits: 3, w_qt: 20, w_gk: 0, w_th: 30, w_ck: 50 },
            { code: "CE125", name: "Kỹ thuật phân tích mạch", credits: 3, w_qt: 30, w_gk: 0, w_th: 20, w_ck: 50 },
            { code: "CE118", name: "Thiết kế luận lý số", credits: 3, w_qt: 25, w_gk: 0, w_th: 25, w_ck: 50 },
            { code: "CE119", name: "Thực hành kiến trúc máy tính", credits: 1, w_qt: 0, w_gk: 0, w_th: 0, w_ck: 100 },
            { code: "CE124", name: "Các thiết bị và mạch điện tử", credits: 3, w_qt: 25, w_gk: 0, w_th: 25, w_ck: 50 },
            { code: "CE103", name: "Vi xử lý - Vi điều khiển", credits: 3, w_qt: 20, w_gk: 0, w_th: 30, w_ck: 50 },
            { code: "IT007", name: "Hệ điều hành", credits: 3, w_qt: 15, w_gk: 15, w_th: 20, w_ck: 50 },
            { code: "CE213", name: "Thiết kế hệ thống số với HDL", credits: 3, w_qt: 20, w_gk: 0, w_th: 30, w_ck: 50 },
            { code: "CE226", name: "Thiết kế VLSI", credits: 3, w_qt: 20, w_gk: 0, w_th: 30, w_ck: 50 },
            { code: "CE436", name: "Xử lý tín hiệu số và ứng dụng", credits: 3, w_qt: 20, w_gk: 0, w_th: 30, w_ck: 50 },
            { code: "CE433", name: "SoC Design", credits: 3, w_qt: 20, w_gk: 0, w_th: 30, w_ck: 50 }
        ]
    },
    {
        category: "🌍 Khối Lý luận Xã hội",
        subjects: [
            { code: "SS003", name: "Tư tưởng Hồ Chí Minh", credits: 2, w_qt: 50, w_gk: 0, w_th: 0, w_ck: 50 },
            { code: "SS004", name: "Kỹ năng nghề nghiệp", credits: 2, w_qt: 40, w_gk: 0, w_th: 0, w_ck: 60 },
            { code: "SS006", name: "Pháp luật đại cương", credits: 2, w_qt: 0, w_gk: 40, w_th: 0, w_ck: 60 },
            { code: "SS007", name: "Triết học Mác-Lênin", credits: 3, w_qt: 50, w_gk: 0, w_th: 0, w_ck: 50 },
            { code: "SS008", name: "Kinh tế chính trị Mác-Lênin", credits: 2, w_qt: 50, w_gk: 0, w_th: 0, w_ck: 50 },
            { code: "SS009", name: "Chủ nghĩa xã hội khoa học", credits: 2, w_qt: 50, w_gk: 0, w_th: 0, w_ck: 50 },
            { code: "SS010", name: "Lịch sử Đảng", credits: 2, w_qt: 50, w_gk: 0, w_th: 0, w_ck: 50 },
        ]
    }
];

function renderDropdownMenu() {
    const menu = document.getElementById("presetDropdownMenu");
    if (!menu) return;
    
    menu.innerHTML = ""; 
    
    PRESET_DATA.forEach(group => {
        const liGroup = document.createElement("li");
        liGroup.className = "dropdown-item-container";
        
        const groupLink = document.createElement("a");
        groupLink.className = "dropdown-item";
        groupLink.innerHTML = `${group.category} <span style="font-size: 10px; color: #9ca3af;">▶</span>`;
        liGroup.appendChild(groupLink);

        const ulSubmenu = document.createElement("ul");
        ulSubmenu.className = "submenu";

        group.subjects.forEach(data => {
            const liSub = document.createElement("li");
            const subLink = document.createElement("a");
            subLink.className = "dropdown-item";
            subLink.innerText = `${data.code} - ${data.name}`;
            
            subLink.onclick = function(e) {
                e.preventDefault(); 
                
                const table = document.getElementById("subjectTable").getElementsByTagName('tbody')[0];
                const newRow = table.insertRow();
                newRow.innerHTML = createRowHTML(data);
                attachDragEvents(newRow); 
                calculateSingleRow(newRow);
                saveData();
                
                document.getElementById("presetDropdownContainer").classList.remove('show');
            };
            liSub.appendChild(subLink);
            ulSubmenu.appendChild(liSub);
        });

        liGroup.appendChild(ulSubmenu);
        menu.appendChild(liGroup);
    });
}

// ==========================================
// 7. KHỞI CHẠY HỆ THỐNG
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    renderDropdownMenu();
    loadData(); 

    const table = document.getElementById('subjectTable');
    if (table) {
        table.addEventListener('input', function(event) {
            if (event.target.tagName === "INPUT") {
                const row = event.target.closest('tr');
                if (row) calculateSingleRow(row);
                saveData(); 
            }
        });
    }

    document.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && event.target.tagName === "INPUT") {
            event.preventDefault(); 
            const row = event.target.closest('tr');
            if (row) calculateSingleRow(row);
            saveData(); 
        }
    });
});