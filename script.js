// ==========================================
// 1. CÁC HÀM TOÀN CỤC & XỬ LÝ GIAO DIỆN
// ==========================================

// Hàm chuyển đổi chế độ Sáng / Tối
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const btn = document.getElementById("themeBtn");
    if (currentTheme === "dark") {
        document.documentElement.removeAttribute("data-theme");
        btn.innerHTML = "🌙 Chế độ tối";
        localStorage.setItem("uit_gpa_theme_store", "light"); // Lưu trạng thái sáng
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
        btn.innerHTML = "☀️ Chế độ sáng";
        localStorage.setItem("uit_gpa_theme_store", "dark"); // Lưu trạng thái tối
    }
}

// Hàm tạo cấu trúc HTML cho một dòng môn học
function createRowHTML(data = {}) {
    const code = data.code || "";
    const name = data.name || "";
    const credits = data.credits || "3";
    const qt = data.qt || "";
    const th = data.th || "";
    const gk = data.gk || "";
    const ck = data.ck || "";
    const expected = data.expected || "";
    const w_qt = data.w_qt !== undefined ? data.w_qt : "10";
    const w_th = data.w_th !== undefined ? data.w_th : "20";
    const w_gk = data.w_gk !== undefined ? data.w_gk : "30";
    const w_ck = data.w_ck !== undefined ? data.w_ck : "40";

    return `
        <td><input type="text" class="sub-code" placeholder="Mã MH" value="${code}"></td>
        <td><input type="text" class="sub-name" placeholder="Tên môn học" value="${name}"></td>
        <td><input type="number" class="sub-credits" min="1" value="${credits}"></td>
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

// Hàm thêm dòng mới
function addRow() {
    const table = document.getElementById("subjectTable").getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.innerHTML = createRowHTML();
    calculateSingleRow(newRow);
    saveData(); // Tự động lưu lại trạng thái bảng mới
}

// Hàm xóa dòng
function deleteRow(button) {
    const tbody = button.closest('tbody');
    if (tbody.rows.length > 1) {
        tbody.removeChild(button.closest('tr'));
        saveData(); // Tự động lưu sau khi xóa
    } else {
        alert("Phải giữ lại ít nhất một môn học!");
    }
}


// ==========================================
// 2. LOGIC TÍNH TOÁN ĐIỂM SỐ
// ==========================================

// Quy đổi điểm hệ 10 sang hệ 4 theo quy chế UIT
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

// Xếp loại học lực dựa trên GPA hệ 4
function getRank(gpa4) {
    if (gpa4 >= 3.6) return "Xuất sắc";
    if (gpa4 >= 3.2) return "Giỏi";
    if (gpa4 >= 2.5) return "Khá";
    if (gpa4 >= 2.0) return "Trung bình";
    return "Yếu/Kém";
}

// Tính toán thời gian thực cho duy nhất 1 hàng môn học
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
    
    // Kiểm tra xem tổng tỉ lệ phần trăm có bằng 100% không
    if (Math.abs(totalWeight - 1) > 0.001) {
        if (avgCell) {
            avgCell.innerText = "Sai %";
            avgCell.style.color = "var(--error-color)";
        }
        return; 
    } else {
        if (avgCell) avgCell.style.color = "var(--primary-color)";
    }

    const inputQt = row.querySelector(".sub-qt");
    const inputTh = row.querySelector(".sub-th");
    const inputGk = row.querySelector(".sub-gk");
    const inputCk = row.querySelector(".sub-ck");
    const expectedInput = row.querySelector(".sub-expected");

    // Clear các ô tự động tính toán từ lần trước để tránh sai số
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

    // Tính toán điểm kỳ vọng gánh kèo cho các cột trống
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
                if (requiredScore > 10) input.classList.add("over-limit"); // Tô đỏ nếu bất khả thi
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

    const subjectAvg10 = (qt * w_qt) + (th * w_th) + (gk * w_gk) + (ck * w_ck);
    if (avgCell && !isNaN(subjectAvg10)) {
        avgCell.innerText = subjectAvg10.toFixed(2);
    }
}

// Tính tổng học kỳ khi bấm nút "Tính toán tổng GPA"
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
        if (avgText === "Sai %") {
            hasError = true;
            return;
        }

        const w_qt = (parseFloat(row.querySelector(".w-qt").value) || 0) / 100;
        const w_th = (parseFloat(row.querySelector(".w-th").value) || 0) / 100;
        const w_gk = (parseFloat(row.querySelector(".w-gk").value) || 0) / 100;
        const w_ck = (parseFloat(row.querySelector(".w-ck").value) || 0) / 100;

        const qt = parseFloat(row.querySelector(".sub-qt").value) || 0;
        const th = parseFloat(row.querySelector(".sub-th").value) || 0;
        const gk = parseFloat(row.querySelector(".sub-gk").value) || 0;
        const ck = parseFloat(row.querySelector(".sub-ck").value) || 0;

        const subjectAvg10 = (qt * w_qt) + (th * w_th) + (gk * w_gk) + (ck * w_ck);

        totalCredits += credits;
        totalPoints10 += subjectAvg10 * credits;
        totalPoints4 += convertToHệ4(subjectAvg10) * credits;
    });

    if (hasError) {
        alert("⚠️ Có môn học nhập sai tổng % (không bằng 100%). Sửa lỗi màu đỏ trước khi tính!");
        return;
    }

    if (totalCredits === 0) {
        alert("Vui lòng nhập ít nhất 1 môn có số tín chỉ lớn hơn 0!");
        return;
    }

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
// 3. QUẢN LÝ LƯU TRỮ LOCAL STORAGE (ĐÃ FIX LỖI PATH)
// ==========================================

// Hàm lưu ngầm toàn bộ dữ liệu bảng vào trình duyệt (Đổi tên Key độc quyền)
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
    // Sử dụng Key độc quyền để không bị lỗi phân tách folder của GitHub Pages
    localStorage.setItem("uit_gpa_data_store", JSON.stringify(data));
}

// Hàm tải dữ liệu cũ lên lại giao diện khi load trang
function loadData() {
    // Phục hồi giao diện sáng/tối
    if (localStorage.getItem("uit_gpa_theme_store") === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        document.getElementById("themeBtn").innerHTML = "☀️ Chế độ sáng";
    }

    // Phục hồi dữ liệu bảng điểm
    const savedData = localStorage.getItem("uit_gpa_data_store");
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            const tbody = document.querySelector("#subjectTable tbody");
            if (data && data.length > 0) {
                tbody.innerHTML = ""; // Clear hàng mẫu mặc định trong HTML
                data.forEach(item => {
                    const newRow = tbody.insertRow();
                    newRow.innerHTML = createRowHTML(item);
                    calculateSingleRow(newRow); // Chạy hàm tính toán luôn cho môn đó
                });
            }
        } catch (e) {
            console.error("Lỗi phục hồi dữ liệu bảng:", e);
        }
    } else {
        // Nếu là lần đầu tiên mở web (chưa có data lưu trữ), tính toán hàng mẫu mặc định
        document.querySelectorAll("#subjectTable tbody tr").forEach(row => calculateSingleRow(row));
    }
}


// ==========================================
// 4. KHỞI ĐỘNG VÀ LẮNG NGHE SỰ KIỆN
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
    loadData(); // Gọi hàm lôi dữ liệu cũ lên ngay khi vừa dựng DOM xong

    const table = document.getElementById('subjectTable');
    if (table) {
        // Lắng nghe sự kiện người dùng nhập dữ liệu liên tục (Real-time)
        table.addEventListener('input', function(event) {
            if (event.target.tagName === "INPUT") {
                const row = event.target.closest('tr');
                if (row) calculateSingleRow(row);
                saveData(); // Gõ tới đâu lưu ngầm tới đó
            }
        });
    }

    // Lắng nghe phím Enter chỉ cập nhật riêng dòng môn học đó
    document.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && event.target.tagName === "INPUT") {
            event.preventDefault(); 
            const row = event.target.closest('tr');
            if (row) calculateSingleRow(row);
            saveData(); // Lưu lại dữ liệu sau khi bấm Enter
        }
    });
});