/* =========================================================
       ESTADO DA APLICAÇÃO
    ========================================================= */

    const STORAGE_KEY = "aguaNaContaV2";

    const defaultState = {

        name: "",

        consumption: null,

        comparisons: [],

        challenges: [
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],

        points: 0

    };


    let state = loadState();


    const challengeData = [

        {
            title: "Reduza o tempo do banho",
            description:
                "Tente reduzir alguns minutos do seu próximo banho.",
            points: 20
        },

        {
            title: "Feche a torneira ao escovar os dentes",
            description:
                "Evite deixar a água correndo durante a escovação.",
            points: 20
        },

        {
            title: "Use a máquina quando estiver cheia",
            description:
                "Evite ciclos com pouca roupa sempre que possível.",
            points: 20
        },

        {
            title: "Verifique possíveis vazamentos",
            description:
                "Observe torneiras, descargas e pontos hidráulicos.",
            points: 25
        },

        {
            title: "Reutilize água quando possível",
            description:
                "Identifique uma oportunidade segura de reaproveitamento.",
            points: 25
        },

        {
            title: "Reduza outros desperdícios",
            description:
                "Escolha uma situação da sua rotina para economizar água.",
            points: 20
        },

        {
            title: "Incentive outra pessoa",
            description:
                "Compartilhe uma atitude de economia com alguém.",
            points: 30
        }

    ];


    /* =========================================================
       STORAGE
    ========================================================= */

    function loadState() {

        try {

            const saved =
                localStorage.getItem(STORAGE_KEY);

            if (!saved) {

                return {
                    ...defaultState,
                    challenges: [...defaultState.challenges]
                };

            }

            const parsed = JSON.parse(saved);

            return {
                ...defaultState,
                ...parsed,
                challenges:
                    Array.isArray(parsed.challenges)
                        ? parsed.challenges
                        : [...defaultState.challenges],
                comparisons:
                    Array.isArray(parsed.comparisons)
                        ? parsed.comparisons
                        : []
            };

        } catch (error) {

            console.error(error);

            return {
                ...defaultState,
                challenges: [...defaultState.challenges]
            };

        }

    }


    function saveState() {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );

    }


    /* =========================================================
       INICIALIZAÇÃO
    ========================================================= */

    document.addEventListener(
        "DOMContentLoaded",
        function() {

            if (state.name) {

                showApplication();

            }

            renderChallenges();
            renderHistory();
            updateDashboard();
            updateImpact();

            setDefaultMonths();

        }
    );


    function setDefaultMonths() {

        const now = new Date();

        const current =
            now.toISOString().slice(0, 7);

        const previousDate =
            new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1
            );

        const previous =
            previousDate
                .toISOString()
                .slice(0, 7);

        const previousInput =
            document.getElementById("previousMonth");

        const currentInput =
            document.getElementById("currentMonth");

        if (previousInput && !previousInput.value) {

            previousInput.value = previous;

        }

        if (currentInput && !currentInput.value) {

            currentInput.value = current;

        }

    }


    /* =========================================================
       INÍCIO
    ========================================================= */

    function startPlatform() {

        const input =
            document.getElementById("userName");

        const name =
            input.value.trim();

        if (!name) {

            showToast(
                "Digite seu nome para continuar.",
                "warning"
            );

            input.focus();

            return;

        }

        state.name = name;

        saveState();

        showApplication();

        showToast(
            `Olá, ${name}! Sua jornada começou. 💧`,
            "success"
        );

    }


    function showApplication() {

        document
            .getElementById("welcomeScreen")
            .classList.add("hidden");

        document
            .getElementById("app")
            .classList.remove("hidden");

        updateUserInterface();

        navigate("dashboard");

    }


    function updateUserInterface() {

        const name =
            state.name || "Usuário";

        document
            .getElementById("topUserName")
            .textContent = name;

        document
            .getElementById("userAvatar")
            .textContent =
                name.charAt(0).toUpperCase();

        document
            .getElementById("dashboardGreeting")
            .textContent =
                `Olá, ${name}! 👋`;

    }


    /* =========================================================
       NAVEGAÇÃO
    ========================================================= */

    function navigate(page) {

        document
            .querySelectorAll(".page")
            .forEach(section => {

                section.classList.remove("active");

            });

        const target =
            document.getElementById(
                `page-${page}`
            );

        if (target) {

            target.classList.add("active");

        }


        document
            .querySelectorAll(".nav-item")
            .forEach(item => {

                item.classList.toggle(
                    "active",
                    item.dataset.page === page
                );

            });


        const labels = {

            dashboard: "Dashboard",

            consumo: "Meu Consumo",

            conta: "Minha Economia",

            desafio: "Desafio 7 Dias",

            impacto: "Impacto",

            sobre: "Sobre o projeto"

        };

        document
            .getElementById("breadcrumb")
            .textContent =
                labels[page] || "Água na Conta";


        if (page === "dashboard") {

            updateDashboard();

        }

        if (page === "conta") {

            renderHistory();

        }

        if (page === "desafio") {

            renderChallenges();

        }

        if (page === "impacto") {

            updateImpact();

        }


        const sidebar =
            document.getElementById("sidebar");

        sidebar.classList.remove("open");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    function toggleSidebar() {

        document
            .getElementById("sidebar")
            .classList.toggle("open");

    }


    /* =========================================================
       CONSUMO
    ========================================================= */

    function calculateConsumption() {

        const people =
            Math.max(
                1,
                Number(
                    document.getElementById("people").value
                ) || 1
            );

        const minutes =
            Number(
                document.getElementById("showerMinutes").value
            ) || 10;

        const showers =
            Number(
                document.getElementById("showers").value
            ) || 1;

        const washer =
            Number(
                document.getElementById("washer").value
            ) || 3;

        const tap =
            document.getElementById("tap").value;


        /*
            Estimativas educativas.
            Os valores não representam medição oficial.
        */

        const shower =
            people *
            minutes *
            showers *
            30 *
            9;


        const washingMachine =
            washer *
            4.33 *
            120;


        const tapWaste =
            tap === "nao"
                ? people * 5 * 30
                : 0;


        const total =
            Math.round(
                shower +
                washingMachine +
                tapWaste
            );


        const potentialSaving =
            Math.round(
                total * 0.20
            );


        let profile;

        if (total < 9000) {

            profile = "Moderado";

        } else if (total < 15000) {

            profile = "Atenção";

        } else {

            profile = "Alto";

        }


        state.consumption = {

            total,

            shower: Math.round(shower),

            washingMachine:
                Math.round(washingMachine),

            tapWaste:
                Math.round(tapWaste),

            potentialSaving,

            profile,

            date: new Date().toISOString()

        };


        saveState();

        renderConsumption();

        updateDashboard();

        showToast(
            "Estimativa atualizada! 💧",
            "success"
        );

    }


    function renderConsumption() {

        if (!state.consumption) {

            return;

        }

        const data =
            state.consumption;


        document
            .getElementById("consumptionTotal")
            .textContent =
                formatNumber(data.total);


        document
            .getElementById("consumptionProfile")
            .textContent =
                data.profile;


        const total =
            Math.max(data.total, 1);


        const showerPercent =
            Math.min(
                100,
                data.shower / total * 100
            );


        const machinePercent =
            Math.min(
                100,
                data.washingMachine / total * 100
            );


        const tapPercent =
            Math.min(
                100,
                data.tapWaste / total * 100
            );


        document
            .getElementById("consumptionBreakdown")
            .innerHTML = `

                <div class="breakdown-item">

                    <div class="breakdown-header">

                        <span>🚿 Banhos</span>

                        <span class="breakdown-value">
                            ${formatNumber(data.shower)} L
                        </span>

                    </div>

                    <div class="progress-track">

                        <div
                            class="progress-bar"
                            style="width:${showerPercent}%"
                        ></div>

                    </div>

                </div>


                <div class="breakdown-item">

                    <div class="breakdown-header">

                        <span>👕 Máquina de lavar</span>

                        <span class="breakdown-value">
                            ${formatNumber(data.washingMachine)} L
                        </span>

                    </div>

                    <div class="progress-track">

                        <div
                            class="progress-bar"
                            style="width:${machinePercent}%"
                        ></div>

                    </div>

                </div>


                <div class="breakdown-item">

                    <div class="breakdown-header">

                        <span>🚰 Torneira</span>

                        <span class="breakdown-value">
                            ${formatNumber(data.tapWaste)} L
                        </span>

                    </div>

                    <div class="progress-track">

                        <div
                            class="progress-bar"
                            style="width:${tapPercent}%"
                        ></div>

                    </div>

                </div>


                <div class="saving-box">

                    <strong>
                        💡 Potencial de economia:
                        ${formatNumber(data.potentialSaving)} L/mês
                    </strong>

                    <span>
                        Estimativa educativa considerando
                        uma redução de aproximadamente 20%.
                    </span>

                </div>

            `;

    }


    /* =========================================================
       COMPARAÇÃO DE CONTAS
    ========================================================= */

    function compareBills() {

        const previous =
            Number(
                document.getElementById("previousBill").value
            );

        const current =
            Number(
                document.getElementById("currentBill").value
            );


        if (
            !previous ||
            previous <= 0 ||
            current < 0
        ) {

            showToast(
                "Informe valores válidos para as duas contas.",
                "warning"
            );

            return;

        }


        const previousM3Input =
            document.getElementById("previousM3").value;

        const currentM3Input =
            document.getElementById("currentM3").value;


        const previousM3 =
            previousM3Input === ""
                ? null
                : Number(previousM3Input);


        const currentM3 =
            currentM3Input === ""
                ? null
                : Number(currentM3Input);


        const previousMonth =
            document.getElementById("previousMonth").value;

        const currentMonth =
            document.getElementById("currentMonth").value;


        const difference =
            previous - current;


        let percentage = 0;

        if (previous > 0) {

            percentage =
                (difference / previous) * 100;

        }


        const isSaving =
            difference > 0;


        const isEqual =
            difference === 0;


        let level = "Sem redução";

        if (isSaving) {

            if (percentage < 10) {

                level = "Baixa";

            } else if (percentage < 20) {

                level = "Média";

            } else if (percentage < 30) {

                level = "Boa";

            } else {

                level = "Excelente";

            }

        }


        let m3Difference = null;
        let litersDifference = null;
        let consumptionPercentage = null;


        if (
            previousM3 !== null &&
            currentM3 !== null &&
            previousM3 > 0 &&
            currentM3 >= 0
        ) {

            m3Difference =
                previousM3 - currentM3;

            litersDifference =
                m3Difference * 1000;

            consumptionPercentage =
                (
                    m3Difference /
                    previousM3
                ) * 100;

        }


        const comparison = {

            id: Date.now(),

            createdAt:
                new Date().toISOString(),

            previousMonth,

            currentMonth,

            previousBill: previous,

            currentBill: current,

            difference,

            percentage,

            isSaving,

            isEqual,

            level,

            previousM3,

            currentM3,

            m3Difference,

            litersDifference,

            consumptionPercentage

        };


        state.comparisons.push(comparison);

        saveState();


        renderComparison(comparison);

        renderHistory();

        updateDashboard();

        updateImpact();


        showToast(
            isSaving
                ? "Comparação registrada com sucesso! 💰"
                : "Comparação registrada.",
            isSaving ? "success" : "warning"
        );

    }


    function renderComparison(data) {

        const result =
            document.getElementById(
                "comparisonResult"
            );


        let financialClass =
            data.isSaving
                ? "highlight"
                : data.isEqual
                    ? ""
                    : "warning";


        let mainMessage = "";


        if (data.isSaving) {

            mainMessage = `
                🌿 <strong>Boa evolução, ${escapeHtml(state.name)}!</strong>
                Sua conta diminuiu
                <strong>${formatCurrency(data.difference)}</strong>,
                representando uma redução de
                <strong>${formatPercent(data.percentage)}</strong>.
            `;

        } else if (data.isEqual) {

            mainMessage = `
                📊 <strong>Sua conta permaneceu igual.</strong>
                O valor registrado nos dois períodos foi
                ${formatCurrency(data.currentBill)}.
            `;

        } else {

            mainMessage = `
                📌 <strong>O valor da conta aumentou.</strong>
                Houve um aumento de
                <strong>${formatCurrency(Math.abs(data.difference))}</strong>.
                Use também o consumo em m³ para entender melhor
                a variação.
            `;

        }


        let consumptionHtml = "";

        if (
            data.previousM3 !== null &&
            data.currentM3 !== null
        ) {

            const consumptionSaving =
                data.m3Difference > 0;


            consumptionHtml = `

                <div class="result-grid">

                    <div class="result-box">

                        <span>Consumo anterior</span>

                        <strong>
                            ${formatM3(data.previousM3)}
                        </strong>

                        <small>
                            ${formatNumber(data.previousM3 * 1000)} L
                        </small>

                    </div>


                    <div class="result-box">

                        <span>Consumo atual</span>

                        <strong>
                            ${formatM3(data.currentM3)}
                        </strong>

                        <small>
                            ${formatNumber(data.currentM3 * 1000)} L
                        </small>

                    </div>


                    <div class="result-box ${
                        consumptionSaving
                            ? "highlight"
                            : data.m3Difference < 0
                                ? "warning"
                                : ""
                    }">

                        <span>
                            ${consumptionSaving
                                ? "Redução de consumo"
                                : data.m3Difference < 0
                                    ? "Aumento de consumo"
                                    : "Variação"
                            }
                        </span>

                        <strong>
                            ${
                                data.m3Difference > 0
                                    ? `-${formatM3(data.m3Difference)}`
                                    : formatM3(Math.abs(data.m3Difference))
                            }
                        </strong>

                        <small>
                            ${
                                data.litersDifference > 0
                                    ? `≈ ${formatNumber(Math.abs(data.litersDifference))} litros`
                                    : data.litersDifference < 0
                                        ? `≈ +${formatNumber(Math.abs(data.litersDifference))} litros`
                                        : "Sem alteração"
                            }
                        </small>

                    </div>


                    <div class="result-box">

                        <span>Variação</span>

                        <strong>
                            ${formatPercent(Math.abs(data.consumptionPercentage))}
                        </strong>

                        <small>
                            ${
                                data.consumptionPercentage > 0
                                    ? "redução"
                                    : data.consumptionPercentage < 0
                                        ? "aumento"
                                        : "sem alteração"
                            }
                        </small>

                    </div>

                </div>

                ${renderConsumptionBars(data)}

            `;

        }


        result.className = "";

        result.style.display = "block";

        result.innerHTML = `

            <div style="padding:22px;">

                <div class="result-grid">

                    <div class="result-box">

                        <span>Conta anterior</span>

                        <strong>
                            ${formatCurrency(data.previousBill)}
                        </strong>

                        <small>
                            ${formatMonth(data.previousMonth)}
                        </small>

                    </div>


                    <div class="result-box">

                        <span>Conta atual</span>

                        <strong>
                            ${formatCurrency(data.currentBill)}
                        </strong>

                        <small>
                            ${formatMonth(data.currentMonth)}
                        </small>

                    </div>


                    <div class="result-box ${financialClass}">

                        <span>
                            ${
                                data.isSaving
                                    ? "Economia"
                                    : data.isEqual
                                        ? "Variação"
                                        : "Aumento"
                            }
                        </span>

                        <strong>
                            ${
                                data.isSaving
                                    ? formatCurrency(data.difference)
                                    : data.isEqual
                                        ? "R$ 0,00"
                                        : `+${formatCurrency(Math.abs(data.difference))}`
                            }
                        </strong>

                        <small>
                            ${
                                data.isSaving
                                    ? `${formatPercent(data.percentage)} de redução`
                                    : data.isEqual
                                        ? "Sem redução"
                                        : `${formatPercent(Math.abs(data.percentage))} de aumento`
                            }
                        </small>

                    </div>


                    <div class="result-box">

                        <span>Nível</span>

                        <strong style="font-size:18px;">
                            ${data.level}
                        </strong>

                        <small>
                            classificação da redução
                        </small>

                    </div>

                </div>


                ${renderFinancialBars(data)}


                ${consumptionHtml}


                ${
                    data.isSaving
                        ? renderLevelCard(data)
                        : ""
                }


                <div class="interpretation">

                    ${mainMessage}

                </div>

            </div>

        `;

    }


    function renderFinancialBars(data) {

        const max =
            Math.max(
                data.previousBill,
                data.currentBill,
                1
            );


        const previousWidth =
            data.previousBill / max * 100;


        const currentWidth =
            data.currentBill / max * 100;


        return `

            <div class="comparison-visual">

                <h4>
                    💵 Comparação financeira
                </h4>

                <div class="bar-row">

                    <div class="bar-label">

                        <span>
                            Conta anterior
                        </span>

                        <strong>
                            ${formatCurrency(data.previousBill)}
                        </strong>

                    </div>

                    <div class="bar-track">

                        <div
                            class="bar previous"
                            style="width:${previousWidth}%"
                        ></div>

                    </div>

                </div>


                <div class="bar-row">

                    <div class="bar-label">

                        <span>
                            Conta atual
                        </span>

                        <strong>
                            ${formatCurrency(data.currentBill)}
                        </strong>

                    </div>

                    <div class="bar-track">

                        <div
                            class="bar current"
                            style="width:${currentWidth}%"
                        ></div>

                    </div>

                </div>

            </div>

        `;

    }


    function renderConsumptionBars(data) {

        const max =
            Math.max(
                data.previousM3,
                data.currentM3,
                1
            );


        const previousWidth =
            data.previousM3 / max * 100;


        const currentWidth =
            data.currentM3 / max * 100;


        return `

            <div class="comparison-visual">

                <h4>
                    💧 Comparação de consumo
                </h4>

                <div class="bar-row">

                    <div class="bar-label">

                        <span>
                            Consumo anterior
                        </span>

                        <strong>
                            ${formatM3(data.previousM3)}
                        </strong>

                    </div>

                    <div class="bar-track">

                        <div
                            class="bar previous"
                            style="width:${previousWidth}%"
                        ></div>

                    </div>

                </div>


                <div class="bar-row">

                    <div class="bar-label">

                        <span>
                            Consumo atual
                        </span>

                        <strong>
                            ${formatM3(data.currentM3)}
                        </strong>

                    </div>

                    <div class="bar-track">

                        <div
                            class="bar current"
                            style="width:${currentWidth}%"
                        ></div>

                    </div>

                </div>

            </div>

        `;

    }


    function renderLevelCard(data) {

        let active = 1;

        if (data.percentage >= 30) {

            active = 4;

        } else if (data.percentage >= 20) {

            active = 3;

        } else if (data.percentage >= 10) {

            active = 2;

        }


        return `

            <div class="level-card">

                <h4>
                    SEU NÍVEL DE ECONOMIA
                </h4>

                <strong>
                    ${data.level}
                </strong>

                <div class="level-scale">

                    ${[1,2,3,4]
                        .map(
                            item =>
                                `<div class="level-item ${
                                    item <= active
                                        ? "active"
                                        : ""
                                }"></div>`
                        )
                        .join("")
                    }

                </div>

                <div class="level-labels">

                    <span>Baixa</span>
                    <span>Média</span>
                    <span>Boa</span>
                    <span>Excelente</span>

                </div>

            </div>

        `;

    }


    /* =========================================================
       HISTÓRICO
    ========================================================= */

    function renderHistory() {

        const container =
            document.getElementById(
                "historyContainer"
            );


        if (!container) {

            return;

        }


        if (!state.comparisons.length) {

            container.innerHTML = `

                <div class="history-empty">

                    📚<br><br>

                    Você ainda não registrou comparações.

                    <br>

                    Registre suas contas para começar
                    a construir seu histórico.

                </div>

            `;

            return;

        }


        const sorted =
            [...state.comparisons]
                .sort(
                    (a,b) =>
                        b.id - a.id
                );


        container.innerHTML = `

            <div class="history-table-wrapper">

                <table class="history-table">

                    <thead>

                        <tr>

                            <th>Período</th>

                            <th>Anterior</th>

                            <th>Atual</th>

                            <th>Resultado</th>

                            <th>Redução</th>

                            <th>Nível</th>

                            <th></th>

                        </tr>

                    </thead>

                    <tbody>

                        ${
                            sorted.map(item => `

                                <tr>

                                    <td>
                                        ${
                                            formatMonth(item.currentMonth)
                                        }
                                    </td>

                                    <td>
                                        ${formatCurrency(item.previousBill)}
                                    </td>

                                    <td>
                                        ${formatCurrency(item.currentBill)}
                                    </td>

                                    <td>

                                        ${
                                            item.difference > 0
                                                ? `<span style="color:var(--success);font-weight:800;">
                                                    -${formatCurrency(item.difference)}
                                                  </span>`
                                                : item.difference < 0
                                                    ? `<span style="color:var(--danger);font-weight:800;">
                                                        +${formatCurrency(Math.abs(item.difference))}
                                                      </span>`
                                                    : "R$ 0,00"
                                        }

                                    </td>

                                    <td>

                                        ${
                                            item.isSaving
                                                ? formatPercent(item.percentage)
                                                : "—"
                                        }

                                    </td>

                                    <td>

                                        ${
                                            item.isSaving
                                                ? `<span class="level-tag">${item.level}</span>`
                                                : `<span class="level-tag" style="background:var(--warning-light);color:var(--warning);">
                                                    Sem redução
                                                  </span>`
                                        }

                                    </td>

                                    <td>

                                        <button
                                            class="delete-history"
                                            onclick="deleteComparison(${item.id})"
                                            aria-label="Excluir comparação"
                                        >
                                            ×
                                        </button>

                                    </td>

                                </tr>

                            `).join("")
                        }

                    </tbody>

                </table>

            </div>

        `;

    }


    function deleteComparison(id) {

        state.comparisons =
            state.comparisons.filter(
                item => item.id !== id
            );

        saveState();

        renderHistory();

        updateDashboard();

        updateImpact();

        showToast(
            "Comparação removida.",
            "warning"
        );

    }


    function clearHistory() {

        if (!state.comparisons.length) {

            showToast(
                "O histórico já está vazio.",
                "warning"
            );

            return;

        }


        const confirmed =
            confirm(
                "Deseja realmente apagar todo o histórico de comparações?"
            );


        if (!confirmed) {

            return;

        }


        state.comparisons = [];

        saveState();

        renderHistory();

        updateDashboard();

        updateImpact();

        showToast(
            "Histórico apagado.",
            "warning"
        );

    }


    /* =========================================================
       DESAFIOS
    ========================================================= */

    function renderChallenges() {

        const container =
            document.getElementById(
                "challengeList"
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            challengeData
                .map(
                    (challenge, index) => {

                        const completed =
                            state.challenges[index] === true;


                        return `

                            <div
                                class="challenge-item ${
                                    completed
                                        ? "completed"
                                        : ""
                                }"
                            >

                                <div class="challenge-day">

                                    ${
                                        completed
                                            ? "✓"
                                            : `D${index + 1}`
                                    }

                                </div>


                                <div class="challenge-content">

                                    <h3>
                                        ${challenge.title}
                                    </h3>

                                    <p>
                                        ${challenge.description}
                                    </p>

                                    <span class="points">
                                        +${challenge.points} pontos
                                    </span>

                                </div>


                                <button
                                    class="challenge-check"
                                    onclick="toggleChallenge(${index})"
                                >

                                    ${
                                        completed
                                            ? "Concluído"
                                            : "Concluir"
                                    }

                                </button>

                            </div>

                        `;

                    }
                )
                .join("");


        updateChallengeHeader();

    }


    function toggleChallenge(index) {

        if (
            state.challenges[index]
        ) {

            showToast(
                "Este desafio já foi concluído.",
                "warning"
            );

            return;

        }


        state.challenges[index] = true;

        state.points +=
            challengeData[index].points;


        saveState();

        renderChallenges();

        updateDashboard();

        updateImpact();


        showToast(
            `Desafio concluído! +${challengeData[index].points} pontos 🏆`,
            "success"
        );

    }


    function updateChallengeHeader() {

        const completed =
            state.challenges
                .filter(Boolean)
                .length;


        const total =
            challengeData.length;


        const percent =
            Math.round(
                completed / total * 100
            );


        document
            .getElementById("challengePoints")
            .textContent =
                state.points;


        document
            .getElementById("challengeProgressBar")
            .style.width =
                `${percent}%`;


        document
            .getElementById("challengeSummary")
            .textContent =
                completed === total
                    ? "Parabéns! Você completou todos os desafios. 🌱"
                    : `${completed} de ${total} desafios concluídos. Continue!`;

    }


    /* =========================================================
       DASHBOARD
    ========================================================= */

    function updateDashboard() {

        if (!document.getElementById("app")) {

            return;

        }


        updateUserInterface();


        /* CONSUMO */

        document
            .getElementById("metricConsumption")
            .textContent =
                state.consumption
                    ? formatNumber(
                        state.consumption.total
                    )
                    : "—";


        /* ECONOMIA */

        const totalSavings =
            state.comparisons
                .filter(
                    item => item.difference > 0
                )
                .reduce(
                    (sum, item) =>
                        sum + item.difference,
                    0
                );


        document
            .getElementById("metricSavings")
            .textContent =
                formatCurrency(totalSavings);


        /* REDUÇÃO */

        const latest =
            [...state.comparisons]
                .sort(
                    (a,b) =>
                        b.id - a.id
                )[0];


        document
            .getElementById("metricReduction")
            .textContent =
                latest && latest.isSaving
                    ? formatPercent(latest.percentage)
                    : "—";


        /* DESAFIO */

        const completed =
            state.challenges
                .filter(Boolean)
                .length;


        document
            .getElementById("metricChallenge")
            .textContent =
                `${completed}/7`;


        /* NÍVEL */

        let level =
            latest && latest.isSaving
                ? latest.level
                : "Ainda não calculado";


        document
            .getElementById("dashboardLevel")
            .textContent =
                level;


        /* GRÁFICO */

        renderDashboardChart();


        /* ÚLTIMA COMPARAÇÃO */

        renderDashboardLastComparison();


        /* DESAFIO */

        const challengePercent =
            Math.round(
                completed / 7 * 100
            );


        document
            .getElementById("dashboardChallengePercent")
            .textContent =
                `${challengePercent}%`;


        document
            .getElementById("dashboardChallengeBar")
            .style.width =
                `${challengePercent}%`;


        document
            .getElementById("dashboardChallengeText")
            .textContent =
                completed === 0
                    ? "Você ainda não concluiu desafios."
                    : completed === 7
                        ? "Você completou todos os desafios! 🌱"
                        : `${completed} desafio(s) concluído(s). Continue sua jornada!`;


        /* OBJETIVO */

        updateGoal(completed, latest);

    }


    function renderDashboardLastComparison() {

        const container =
            document.getElementById(
                "dashboardLastComparison"
            );


        const latest =
            [...state.comparisons]
                .sort(
                    (a,b) =>
                        b.id - a.id
                )[0];


        if (!latest) {

            container.innerHTML = `

                <div class="history-empty">

                    📊<br><br>

                    Ainda não há comparação registrada.

                    <br><br>

                    <button
                        class="btn btn-primary"
                        onclick="navigate('conta')"
                    >
                        Registrar primeira conta
                    </button>

                </div>

            `;

            return;

        }


        container.innerHTML = `

            <div class="result-grid">

                <div class="result-box">

                    <span>Anterior</span>

                    <strong>
                        ${formatCurrency(latest.previousBill)}
                    </strong>

                </div>

                <div class="result-box">

                    <span>Atual</span>

                    <strong>
                        ${formatCurrency(latest.currentBill)}
                    </strong>

                </div>

                <div class="result-box ${
                    latest.isSaving
                        ? "highlight"
                        : latest.difference < 0
                            ? "warning"
                            : ""
                }">

                    <span>
                        ${
                            latest.isSaving
                                ? "Economia"
                                : latest.difference < 0
                                    ? "Aumento"
                                    : "Variação"
                        }
                    </span>

                    <strong>
                        ${
                            latest.isSaving
                                ? formatCurrency(latest.difference)
                                : latest.difference < 0
                                    ? `+${formatCurrency(Math.abs(latest.difference))}`
                                    : "R$ 0,00"
                        }
                    </strong>

                </div>

                <div class="result-box">

                    <span>Redução</span>

                    <strong>
                        ${
                            latest.isSaving
                                ? formatPercent(latest.percentage)
                                : "—"
                        }
                    </strong>

                </div>

            </div>


            <button
                class="btn btn-secondary btn-full"
                onclick="navigate('conta')"
            >
                Ver análise completa →
            </button>

        `;

    }


    function renderDashboardChart() {

        const container =
            document.getElementById(
                "dashboardChart"
            );


        if (!state.comparisons.length) {

            container.innerHTML = `

                <div class="history-empty">

                    📈<br><br>

                    Seu gráfico aparecerá aqui
                    depois que você registrar
                    suas contas.

                </div>

            `;

            return;

        }


        const data =
            [...state.comparisons]
                .sort(
                    (a,b) =>
                        a.id - b.id
                )
                .slice(-6);


        const max =
            Math.max(
                ...data.map(
                    item =>
                        Math.max(
                            item.previousBill,
                            item.currentBill
                        )
                ),
                1
            );


        container.innerHTML = `

            <div style="
                height:250px;
                display:flex;
                align-items:flex-end;
                gap:15px;
                padding:10px 5px 0;
            ">

                ${
                    data.map(
                        item => {

                            const previousHeight =
                                Math.max(
                                    8,
                                    item.previousBill /
                                    max *
                                    190
                                );


                            const currentHeight =
                                Math.max(
                                    8,
                                    item.currentBill /
                                    max *
                                    190
                                );


                            return `

                                <div style="
                                    flex:1;
                                    height:100%;
                                    display:flex;
                                    flex-direction:column;
                                    justify-content:flex-end;
                                    align-items:center;
                                ">

                                    <div style="
                                        display:flex;
                                        align-items:flex-end;
                                        gap:4px;
                                        height:205px;
                                    ">

                                        <div
                                            title="Anterior: ${formatCurrency(item.previousBill)}"
                                            style="
                                                width:13px;
                                                height:${previousHeight}px;
                                                background:#a9c4c8;
                                                border-radius:5px 5px 0 0;
                                            "
                                        ></div>

                                        <div
                                            title="Atual: ${formatCurrency(item.currentBill)}"
                                            style="
                                                width:13px;
                                                height:${currentHeight}px;
                                                background:linear-gradient(180deg,#22a6b3,#087f8c);
                                                border-radius:5px 5px 0 0;
                                            "
                                        ></div>

                                    </div>

                                    <div style="
                                        margin-top:7px;
                                        font-size:9px;
                                        color:var(--text-light);
                                        text-align:center;
                                        max-width:65px;
                                    ">
                                        ${formatMonthShort(item.currentMonth)}
                                    </div>

                                </div>

                            `;

                        }
                    ).join("")
                }

            </div>


            <div style="
                display:flex;
                justify-content:center;
                gap:18px;
                margin-top:10px;
                font-size:10px;
                color:var(--text-light);
            ">

                <span>
                    <i style="
                        display:inline-block;
                        width:9px;
                        height:9px;
                        border-radius:2px;
                        background:#a9c4c8;
                        margin-right:4px;
                    "></i>
                    Anterior
                </span>

                <span>
                    <i style="
                        display:inline-block;
                        width:9px;
                        height:9px;
                        border-radius:2px;
                        background:#087f8c;
                        margin-right:4px;
                    "></i>
                    Atual
                </span>

            </div>

        `;

    }


    function updateGoal(completed, latest) {

        const title =
            document.getElementById(
                "goalTitle"
            );

        const percent =
            document.getElementById(
                "goalPercent"
            );

        const bar =
            document.getElementById(
                "goalBar"
            );

        const description =
            document.getElementById(
                "goalDescription"
            );


        if (!latest && completed === 0) {

            title.textContent =
                "Faça sua primeira análise";

            percent.textContent =
                "0%";

            bar.style.width =
                "0%";

            description.textContent =
                "Registre uma conta para começar a acompanhar sua evolução.";

            return;

        }


        if (latest && latest.isSaving && latest.percentage >= 30) {

            title.textContent =
                "Você alcançou 30% de redução!";

            percent.textContent =
                "100%";

            bar.style.width =
                "100%";

            description.textContent =
                "Excelente! Continue mantendo seus hábitos.";

            return;

        }


        if (completed < 7) {

            const p =
                Math.round(
                    completed / 7 * 100
                );


            title.textContent =
                "Complete o Desafio 7 Dias";

            percent.textContent =
                `${p}%`;

            bar.style.width =
                `${p}%`;

            description.textContent =
                `${completed}/7 desafios concluídos.`;

            return;

        }


        title.textContent =
            "Continue acompanhando sua evolução";

        percent.textContent =
            "100%";

        bar.style.width =
            "100%";

        description.textContent =
            "Registre novas contas para acompanhar sua evolução.";

    }


    /* =========================================================
       IMPACTO
    ========================================================= */

    function updateImpact() {

        const liters =
            state.comparisons
                .reduce(
                    (sum, item) =>
                        sum +
                        (
                            item.litersDifference > 0
                                ? item.litersDifference
                                : 0
                        ),
                    0
                );


        const savings =
            state.comparisons
                .reduce(
                    (sum, item) =>
                        sum +
                        (
                            item.difference > 0
                                ? item.difference
                                : 0
                        ),
                    0
                );


        const challenges =
            state.challenges
                .filter(Boolean)
                .length;


        document
            .getElementById("impactLiters")
            .textContent =
                `${formatNumber(liters)} L`;


        document
            .getElementById("impactMoney")
            .textContent =
                formatCurrency(savings);


        document
            .getElementById("impactChallenges")
            .textContent =
                challenges;


        document
            .getElementById("impactComparisons")
            .textContent =
                state.comparisons.length;

    }


    /* =========================================================
       FORMATAÇÃO
    ========================================================= */

    function formatCurrency(value) {

        return Number(value || 0)
            .toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

    }


    function formatNumber(value) {

        return Number(value || 0)
            .toLocaleString(
                "pt-BR",
                {
                    maximumFractionDigits: 0
                }
            );

    }


    function formatM3(value) {

        return Number(value || 0)
            .toLocaleString(
                "pt-BR",
                {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                }
            ) + " m³";

    }


    function formatPercent(value) {

        return Number(value || 0)
            .toLocaleString(
                "pt-BR",
                {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 1
                }
            ) + "%";

    }


    function formatMonth(value) {

        if (!value) {

            return "Período não informado";

        }


        const [
            year,
            month
        ] =
            value.split("-");


        const date =
            new Date(
                Number(year),
                Number(month) - 1,
                1
            );


        return date.toLocaleDateString(
            "pt-BR",
            {
                month: "long",
                year: "numeric"
            }
        );

    }


    function formatMonthShort(value) {

        if (!value) {

            return "—";

        }


        const [
            year,
            month
        ] =
            value.split("-");


        const date =
            new Date(
                Number(year),
                Number(month) - 1,
                1
            );


        return date.toLocaleDateString(
            "pt-BR",
            {
                month: "short",
                year: "numeric"
            }
        );

    }


    /* =========================================================
       SEGURANÇA BÁSICA PARA TEXTOS DO USUÁRIO
    ========================================================= */

    function escapeHtml(text) {

        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =========================================================
       TOAST
    ========================================================= */

    function showToast(message, type = "") {

        const container =
            document.getElementById(
                "toastContainer"
            );


        const toast =
            document.createElement("div");


        toast.className =
            `toast ${type}`;


        toast.textContent =
            message;


        container.appendChild(toast);


        setTimeout(
            () => {

                toast.style.opacity = "0";
                toast.style.transform =
                    "translateY(10px)";

                setTimeout(
                    () => toast.remove(),
                    250
                );

            },
            3000
        );

    }


    /* =========================================================
       CARREGAR CONSUMO SALVO
    ========================================================= */

    setTimeout(
        () => {

            if (state.consumption) {

                renderConsumption();

            }

        },
        100
    );
