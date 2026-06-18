/* Core application logic for GitHub Pages static deployment */

const STORAGE_KEYS = {
    loggedIn: "loggedIn",
    user: "user",
    activeTab: "activeTab",
    currentDiagnosis: "currentDiagnosis",
};

// Single medication dataset used across modules
const MEDICATIONS = [
    // SSRIs
    {
        name: "Fluoxetine",
        class: "SSRI",
        brand: "Prozac",
        indications: ["Major Depressive Disorder", "OCD", "Panic Disorder", "Bulimia Nervosa"],
        receptors: [
            { name: "SERT", affinity: "high" },
            { name: "5-HT2C", affinity: "moderate" },
        ],
        dosing: {
            depression: { start: "20mg", max: "80mg" },
            ocd: { start: "20mg", max: "80mg" },
            panic: { start: "10mg", max: "60mg" },
        },
    },
    {
        name: "Sertraline",
        class: "SSRI",
        brand: "Zoloft",
        indications: ["Major Depressive Disorder", "OCD", "Panic Disorder", "PTSD", "Social Anxiety"],
        receptors: [
            { name: "SERT", affinity: "high" },
            { name: "DAT", affinity: "low" },
        ],
        dosing: {
            depression: { start: "50mg", max: "200mg" },
            ocd: { start: "50mg", max: "200mg" },
            panic: { start: "25mg", max: "200mg" },
            ptsd: { start: "25-50mg", max: "200mg" },
        },
    },
    {
        name: "Paroxetine",
        class: "SSRI",
        brand: "Paxil",
        indications: ["Major Depressive Disorder", "Panic Disorder", "PTSD", "Social Anxiety"],
        receptors: [{ name: "SERT", affinity: "high" }],
        dosing: {
            depression: { start: "20mg", max: "50mg" },
            panic: { start: "10mg", max: "60mg" },
        },
    },
    {
        name: "Escitalopram",
        class: "SSRI",
        brand: "Lexapro",
        indications: ["Major Depressive Disorder", "Generalized Anxiety Disorder"],
        receptors: [{ name: "SERT", affinity: "very high" }],
        dosing: {
            depression: { start: "10mg", max: "20mg" },
            anxiety: { start: "5mg", max: "20mg" },
        },
    },
    {
        name: "Fluvoxamine",
        class: "SSRI",
        brand: "Luvox",
        indications: ["OCD"],
        receptors: [{ name: "SERT", affinity: "high" }],
        dosing: {
            ocd: { start: "50mg", max: "300mg" },
        },
    },

    // SNRIs
    {
        name: "Venlafaxine",
        class: "SNRI",
        brand: "Effexor",
        indications: ["Major Depressive Disorder", "Generalized Anxiety Disorder", "Panic Disorder", "Social Anxiety"],
        receptors: [
            { name: "SERT", affinity: "high" },
            { name: "NET", affinity: "moderate" },
        ],
        dosing: {
            depression: { start: "37.5-75mg", max: "375mg" },
            anxiety: { start: "37.5mg", max: "225mg" },
        },
    },
    {
        name: "Duloxetine",
        class: "SNRI",
        brand: "Cymbalta",
        indications: ["Major Depressive Disorder", "Generalized Anxiety Disorder", "Neuropathic Pain"],
        receptors: [
            { name: "SERT", affinity: "high" },
            { name: "NET", affinity: "high" },
        ],
        dosing: {
            depression: { start: "30mg", max: "120mg" },
            anxiety: { start: "30mg", max: "120mg" },
        },
    },

    // Atypical antidepressants
    {
        name: "Bupropion",
        class: "NDRI",
        brand: "Wellbutrin",
        indications: ["Major Depressive Disorder", "Smoking Cessation"],
        receptors: [
            { name: "DAT", affinity: "moderate" },
            { name: "NET", affinity: "moderate" },
        ],
        dosing: {
            depression: { start: "150mg", max: "450mg" },
            smoking: { start: "150mg", max: "300mg" },
        },
    },
    {
        name: "Mirtazapine",
        class: "Atypical Antidepressant",
        brand: "Remeron",
        indications: ["Major Depressive Disorder"],
        receptors: [
            { name: "5-HT2A", affinity: "antagonist" },
            { name: "H1", affinity: "high" },
        ],
        dosing: {
            depression: { start: "15mg", max: "45mg" },
        },
    },

    // Mood stabilizer
    {
        name: "Lithium",
        class: "Mood Stabilizer",
        brand: "Lithobid",
        indications: ["Bipolar Disorder"],
        receptors: [
            { name: "GSK-3β", affinity: "inhibitor" },
            { name: "Inositol", affinity: "indirect" },
        ],
        dosing: {
            bipolar: { start: "300mg bid", max: "target level 0.6–1.2 mEq/L" },
        },
    },

    // Antipsychotics (minimal set to support planner)
    {
        name: "Aripiprazole",
        class: "Atypical Antipsychotic",
        brand: "Abilify",
        indications: ["Schizophrenia", "Bipolar Disorder", "Major Depressive Disorder (adjunct)"],
        receptors: [
            { name: "D2", affinity: "partial agonist" },
            { name: "5-HT1A", affinity: "partial agonist" },
            { name: "5-HT2A", affinity: "antagonist" },
        ],
        dosing: {
            schizophrenia: { start: "10-15mg", max: "30mg" },
            bipolar: { start: "15mg", max: "30mg" },
            depression: { start: "2-5mg", max: "15mg" },
        },
    },
    {
        name: "Quetiapine",
        class: "Atypical Antipsychotic",
        brand: "Seroquel",
        indications: ["Schizophrenia", "Bipolar Disorder", "Major Depressive Disorder (adjunct)"],
        receptors: [
            { name: "5-HT2A", affinity: "high" },
            { name: "D2", affinity: "moderate" },
            { name: "H1", affinity: "high" },
        ],
        dosing: {
            schizophrenia: { start: "50mg", max: "800mg" },
            bipolar: { start: "50mg", max: "800mg" },
            depression: { start: "50mg", max: "300mg" },
        },
    },
    {
        name: "Risperidone",
        class: "Atypical Antipsychotic",
        brand: "Risperdal",
        indications: ["Schizophrenia", "Bipolar Disorder"],
        receptors: [
            { name: "D2", affinity: "high" },
            { name: "5-HT2A", affinity: "high" },
        ],
        dosing: {
            schizophrenia: { start: "1mg", max: "6mg" },
            bipolar: { start: "1-2mg", max: "6mg" },
        },
    },

    // Benzodiazepine (short-term use mention only)
    {
        name: "Clonazepam",
        class: "Benzodiazepine",
        brand: "Klonopin",
        indications: ["Panic Disorder", "Seizure Disorders"],
        receptors: [{ name: "GABA-A", affinity: "positive allosteric modulator" }],
        dosing: {
            panic: { start: "0.25mg", max: "4mg" },
        },
    },
];

const INDICATION_OPTIONS = [
    { value: "depression", label: "Depression" },
    { value: "anxiety", label: "Anxiety" },
    { value: "psychosis", label: "Psychosis" },
    { value: "bipolar", label: "Bipolar Disorder" },
];

function safeJsonParse(value, fallback = null) {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function normalizeSymptomLabel(symptomKey) {
    return String(symptomKey)
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (c) => c.toUpperCase())
        .trim();
}

// Tab logic with persistence (used by inline onclick handlers)
window.openTab = function openTab(evt, tabName) {
    const contents = document.getElementsByClassName("tabcontent");
    const links = document.getElementsByClassName("tablinks");

    for (let i = 0; i < contents.length; i++) contents[i].style.display = "none";
    for (let i = 0; i < links.length; i++) links[i].className = links[i].className.replace(" active", "");

    const target = document.getElementById(tabName);
    if (target) target.style.display = "block";

    if (evt?.currentTarget) evt.currentTarget.className += " active";
    localStorage.setItem(STORAGE_KEYS.activeTab, tabName);
};

function requireAuthOrRedirect() {
    const loggedIn = localStorage.getItem(STORAGE_KEYS.loggedIn) === "true";
    if (!loggedIn) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function renderMedicationCards(meds) {
    const medicationList = document.getElementById("medicationList");
    if (!medicationList) return;

    medicationList.innerHTML = "";
    meds.forEach((med) => {
        const card = document.createElement("div");
        card.className = "medication-card";

        const receptorHTML = (med.receptors || [])
            .map((r) => `<div class="receptor-item">${r.name} <span class="receptor-affinity">(${r.affinity})</span></div>`)
            .join("");

        const indicationsHTML = (med.indications || []).map((i) => `<li>${i}</li>`).join("");

        card.innerHTML = `
            <div class="medication-header">
                <span class="medication-name">${med.name}</span>
                <span class="medication-class">${med.class}${med.brand ? ` · ${med.brand}` : ""}</span>
            </div>
            <div class="medication-body">
                <p><strong>Indications</strong></p>
                <ul>${indicationsHTML || "<li>—</li>"}</ul>
                <p><strong>Receptor activity (high-level)</strong></p>
                <div class="receptor-grid">${receptorHTML || "<div class=\"receptor-item\">—</div>"}</div>
            </div>
        `;
        medicationList.appendChild(card);
    });
}

function populateDosingDropdown() {
    const select = document.getElementById("calcMedication");
    if (!select) return;

    // Keep the placeholder option at index 0, clear the rest
    while (select.options.length > 1) select.remove(1);

    MEDICATIONS
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((med) => {
            const option = document.createElement("option");
            option.value = med.name;
            option.textContent = `${med.name} (${med.class})`;
            select.appendChild(option);
        });
}

function assessPatient() {
    const symptomCheckboxes = document.querySelectorAll(
        '#moodSymptoms input[type="checkbox"]:checked, #anxietySymptoms input[type="checkbox"]:checked, #psychoticSymptoms input[type="checkbox"]:checked'
    );
    const selectedSymptoms = Array.from(symptomCheckboxes).map((cb) => cb.value);

    const riskCheckboxes = document.querySelectorAll('#riskFlags input[type="checkbox"]:checked');
    const selectedRiskFlags = Array.from(riskCheckboxes).map((cb) => cb.value);

    const patientAge = parseInt(document.getElementById("patientAge")?.value, 10);
    const patientGender = document.getElementById("patientGender")?.value || "";
    const medicalHistory = document.getElementById("medicalHistory")?.value?.trim() || "";
    const symptomDurationWeeks = parseInt(document.getElementById("symptomDurationWeeks")?.value, 10);
    const severityLevel = document.getElementById("severityLevel")?.value || "";
    const functionalImpairment = document.getElementById("functionalImpairment")?.value || "";
    const additionalNotes = document.getElementById("additionalNotes")?.value?.trim() || "";

    const diagnoses = [];

    if (selectedSymptoms.includes("depressedMood") && selectedSymptoms.includes("anhedonia")) {
        if (selectedSymptoms.includes("elevatedMood") || selectedSymptoms.includes("irritability")) {
            diagnoses.push("Bipolar Disorder (screen positive)");
        } else {
            diagnoses.push("Major Depressive Disorder (screen positive)");
        }
    }

    if (selectedSymptoms.includes("excessiveWorry") && selectedSymptoms.includes("panicAttacks")) {
        diagnoses.push("Panic symptoms + generalized anxiety symptoms (screen positive)");
    } else if (selectedSymptoms.includes("excessiveWorry")) {
        diagnoses.push("Generalized anxiety symptoms (screen positive)");
    } else if (selectedSymptoms.includes("panicAttacks")) {
        diagnoses.push("Panic symptoms (screen positive)");
    }

    if (selectedSymptoms.includes("socialAnxiety")) diagnoses.push("Social anxiety symptoms (screen positive)");
    if (selectedSymptoms.includes("ocdSymptoms")) diagnoses.push("OCD symptoms (screen positive)");
    if (selectedSymptoms.includes("ptsdSymptoms")) diagnoses.push("PTSD symptoms (screen positive)");
    if (selectedSymptoms.includes("hallucinations") || selectedSymptoms.includes("delusions")) diagnoses.push("Psychotic symptoms (screen positive)");

    if (diagnoses.length === 0) diagnoses.push("No clear screening signal from selected items");

    const resultsDiv = document.getElementById("diagnosisResults");
    if (resultsDiv) {
        const symptomList = selectedSymptoms.length ? selectedSymptoms.map(normalizeSymptomLabel).join(", ") : "—";
        const riskList = selectedRiskFlags.length ? selectedRiskFlags.map(normalizeSymptomLabel).join(", ") : "—";
        const ageText = Number.isFinite(patientAge) ? String(patientAge) : "—";
        const durationText = Number.isFinite(symptomDurationWeeks) ? `${symptomDurationWeeks} week(s)` : "—";

        const highRisk =
            selectedRiskFlags.includes("riskPlan") ||
            selectedRiskFlags.includes("riskIntent") ||
            selectedRiskFlags.includes("riskHI");

        const contextHtml = `
            <div class="diagnosis-result">
                <h3>Screening summary</h3>
                <p><strong>Patient:</strong> Age ${ageText}${patientGender ? ` · ${patientGender}` : ""}</p>
                <p><strong>Duration:</strong> ${durationText}${severityLevel ? ` · <strong>Severity:</strong> ${severityLevel}` : ""}${functionalImpairment ? ` · <strong>Impairment:</strong> ${functionalImpairment}` : ""}</p>
                <p><strong>Selected symptoms:</strong> ${symptomList}</p>
                <p><strong>Risk flags:</strong> ${riskList}</p>
                ${
                    highRisk
                        ? `<p class="text-warning"><i class="fas fa-exclamation-triangle"></i> High-risk flag selected. Use emergency/safety protocols and consider urgent evaluation.</p>`
                        : ""
                }
                ${medicalHistory ? `<p><strong>History/context:</strong> ${medicalHistory}</p>` : ""}
                ${additionalNotes ? `<p><strong>Notes:</strong> ${additionalNotes}</p>` : ""}
            </div>
        `;

        const signalHtml = diagnoses
            .map(
                (d) => `
                <div class="diagnosis-result">
                    <h3>${d}</h3>
                    <p><small>This is a screening-style signal based on selected items. Confirm with full criteria, timeline, and differential.</small></p>
                </div>
            `
            )
            .join("");

        resultsDiv.innerHTML = contextHtml + signalHtml;
    }

    const container = document.getElementById("assessmentResults");
    if (container) container.style.display = "block";

    localStorage.setItem(
        STORAGE_KEYS.currentDiagnosis,
        JSON.stringify({
            diagnoses,
            symptoms: selectedSymptoms,
            riskFlags: selectedRiskFlags,
            context: {
                patientAge: Number.isFinite(patientAge) ? patientAge : null,
                patientGender: patientGender || null,
                symptomDurationWeeks: Number.isFinite(symptomDurationWeeks) ? symptomDurationWeeks : null,
                severityLevel: severityLevel || null,
                functionalImpairment: functionalImpairment || null,
                medicalHistory: medicalHistory || null,
                additionalNotes: additionalNotes || null,
            },
            createdAt: new Date().toISOString(),
        })
    );
}

function recommendedPlanForDiagnosisLabel(diagnosisLabel) {
    // Keep high-level suggestions; clinicians should verify against guidelines and patient specifics.
    const d = diagnosisLabel.toLowerCase();

    if (d.includes("major depressive")) {
        return {
            meds: ["Escitalopram", "Sertraline", "Bupropion", "Venlafaxine", "Duloxetine"],
            therapy: ["Cognitive Behavioral Therapy (CBT)", "Interpersonal Therapy (IPT)"],
        };
    }

    if (d.includes("bipolar")) {
        return {
            meds: ["Lithium", "Quetiapine", "Aripiprazole"],
            therapy: ["Psychoeducation", "Family-focused therapy"],
        };
    }

    if (d.includes("generalized anxiety")) {
        return {
            meds: ["Escitalopram", "Sertraline", "Venlafaxine", "Duloxetine"],
            therapy: ["CBT", "Mindfulness-based interventions"],
        };
    }

    if (d.includes("panic")) {
        return {
            meds: ["Sertraline", "Paroxetine", "Clonazepam (short-term only)"],
            therapy: ["CBT with exposure"],
        };
    }

    if (d.includes("social anxiety")) {
        return {
            meds: ["Sertraline", "Paroxetine", "Venlafaxine"],
            therapy: ["CBT", "Exposure-based practice"],
        };
    }

    if (d.includes("ocd")) {
        return {
            meds: ["Fluoxetine", "Sertraline", "Fluvoxamine"],
            therapy: ["Exposure and Response Prevention (ERP)"],
        };
    }

    if (d.includes("ptsd")) {
        return {
            meds: ["Sertraline", "Paroxetine", "Venlafaxine"],
            therapy: ["Trauma-focused psychotherapy (e.g., TF-CBT)", "EMDR"],
        };
    }

    if (d.includes("psychotic")) {
        return {
            meds: ["Aripiprazole", "Quetiapine", "Risperidone"],
            therapy: ["CBT for psychosis (CBTp)", "Family interventions / social support"],
        };
    }

    return {
        meds: ["Consider referral for further evaluation"],
        therapy: ["Consider referral for further evaluation"],
    };
}

function pickDoseString(med, diagnosisContext) {
    if (!med?.dosing) return "—";

    const keys = Object.keys(med.dosing);
    if (!keys.length) return "—";

    const key = diagnosisContext && med.dosing[diagnosisContext] ? diagnosisContext : keys[0];
    const info = med.dosing[key];
    return info ? `${info.start} to ${info.max}` : "—";
}

function formatGender(gender) {
    if (!gender) return "";
    const g = String(gender).trim().toLowerCase();
    if (!g) return "";
    return g[0].toUpperCase() + g.slice(1);
}

function clinicalNoteFromAssessment(diagnosisData) {
    const ctx = diagnosisData?.context || {};
    const symptoms = Array.isArray(diagnosisData?.symptoms) ? diagnosisData.symptoms : [];
    const riskFlags = Array.isArray(diagnosisData?.riskFlags) ? diagnosisData.riskFlags : [];
    const dxSignals = Array.isArray(diagnosisData?.diagnoses) ? diagnosisData.diagnoses : [];

    const age = Number.isFinite(ctx.patientAge) ? ctx.patientAge : null;
    const gender = ctx.patientGender ? formatGender(ctx.patientGender) : null;
    const duration = Number.isFinite(ctx.symptomDurationWeeks) ? `${ctx.symptomDurationWeeks} week(s)` : null;
    const severity = ctx.severityLevel || null;
    const impairment = ctx.functionalImpairment || null;

    const symptomText = symptoms.length ? symptoms.map(normalizeSymptomLabel).join(", ") : "—";
    const riskText = riskFlags.length ? riskFlags.map(normalizeSymptomLabel).join(", ") : "—";
    const signalText = dxSignals.length ? dxSignals.join("; ") : "—";

    const highRisk = riskFlags.includes("riskPlan") || riskFlags.includes("riskIntent") || riskFlags.includes("riskHI");

    const lines = [];
    lines.push("CLINICAL NOTE (screening summary; clinician-drafted)");
    lines.push("");
    lines.push("HPI:");
    lines.push(
        `- Presenting symptoms: ${symptomText}`
    );
    lines.push(
        `- Duration: ${duration || "—"}`
    );
    lines.push(
        `- Severity: ${severity || "—"}; Functional impairment: ${impairment || "—"}`
    );
    lines.push(
        `- Screening signals: ${signalText}`
    );
    lines.push("");
    lines.push("Context / PMH (patient-reported):");
    lines.push(`- ${ctx.medicalHistory ? ctx.medicalHistory : "—"}`);
    lines.push("");
    lines.push("Risk assessment flags (not exhaustive):");
    lines.push(`- ${riskText}`);
    if (highRisk) {
        lines.push("- HIGH-RISK FLAG PRESENT: follow emergency/safety protocol and consider urgent evaluation.");
    }
    lines.push("");
    lines.push("Additional notes:");
    lines.push(`- ${ctx.additionalNotes ? ctx.additionalNotes : "—"}`);
    lines.push("");
    lines.push("Plan (high-level; verify with guidelines/labeling and patient specifics):");
    if (dxSignals.length) {
        dxSignals.forEach((d) => {
            const plan = recommendedPlanForDiagnosisLabel(d);
            const meds = (plan.meds || []).join(", ") || "—";
            const therapy = (plan.therapy || []).join(", ") || "—";
            lines.push(`- For ${d}: meds: ${meds}; therapy/supports: ${therapy}.`);
        });
    } else {
        lines.push("- —");
    }
    lines.push("");
    lines.push("Demographics:");
    lines.push(`- Age: ${age ?? "—"}${gender ? `; Gender: ${gender}` : ""}`);
    lines.push("");
    lines.push("Disclaimer: Generated from selected inputs for documentation support only. Not a diagnosis or prescribing instruction.");

    return lines.join("\n");
}

async function copyTextToClipboard(text) {
    const value = String(text || "");
    if (!value) return false;

    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(value);
            return true;
        }
    } catch {
        // fall back below
    }

    // Fallback: temporary textarea + execCommand
    try {
        const el = document.createElement("textarea");
        el.value = value;
        el.setAttribute("readonly", "true");
        el.style.position = "fixed";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(el);
        return ok;
    } catch {
        return false;
    }
}

function generateTreatmentPlan() {
    const diagnosisData = safeJsonParse(localStorage.getItem(STORAGE_KEYS.currentDiagnosis), null);
    if (!diagnosisData?.diagnoses?.length) return;

    const treatmentPlanContainer = document.getElementById("treatmentPlanContainer");
    if (!treatmentPlanContainer) return;

    treatmentPlanContainer.innerHTML = "";

    const ctx = diagnosisData.context || {};
    const riskFlags = Array.isArray(diagnosisData.riskFlags) ? diagnosisData.riskFlags : [];
    const highRisk = riskFlags.includes("riskPlan") || riskFlags.includes("riskIntent") || riskFlags.includes("riskHI");

    const header = document.createElement("div");
    header.className = "diagnosis-result";
    header.innerHTML = `
        <h3>Patient context (from assessment)</h3>
        <p><strong>Age:</strong> ${Number.isFinite(ctx.patientAge) ? ctx.patientAge : "—"}${ctx.patientGender ? ` · <strong>Gender:</strong> ${ctx.patientGender}` : ""}</p>
        <p><strong>Duration:</strong> ${Number.isFinite(ctx.symptomDurationWeeks) ? `${ctx.symptomDurationWeeks} week(s)` : "—"}${ctx.severityLevel ? ` · <strong>Severity:</strong> ${ctx.severityLevel}` : ""}${ctx.functionalImpairment ? ` · <strong>Impairment:</strong> ${ctx.functionalImpairment}` : ""}</p>
        <p><strong>Risk flags:</strong> ${riskFlags.length ? riskFlags.map(normalizeSymptomLabel).join(", ") : "—"}</p>
        ${
            highRisk
                ? `<p class="text-warning"><i class="fas fa-exclamation-triangle"></i> High-risk flag selected. Prioritize safety planning and urgent evaluation per protocol.</p>`
                : ""
        }
        ${ctx.medicalHistory ? `<p><strong>History/context:</strong> ${ctx.medicalHistory}</p>` : ""}
        ${ctx.additionalNotes ? `<p><strong>Notes:</strong> ${ctx.additionalNotes}</p>` : ""}
    `;
    treatmentPlanContainer.appendChild(header);

    const noteCard = document.createElement("div");
    noteCard.className = "diagnosis-result";
    const noteText = clinicalNoteFromAssessment(diagnosisData);
    noteCard.innerHTML = `
        <h3>Printable clinical note (paste-ready)</h3>
        <p><small>Tip: Edit as needed before using in an EMR. This is a template generated from your inputs.</small></p>
        <div class="form-group">
            <label for="clinicalNoteText">Note text</label>
            <textarea id="clinicalNoteText" class="form-control" style="min-height: 260px;">${noteText.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</textarea>
        </div>
        <div style="display:flex; gap:10px; flex-wrap: wrap;">
            <button id="copyClinicalNoteBtn" class="btn btn-primary" type="button"><i class="fas fa-copy"></i> Copy note</button>
            <button id="selectClinicalNoteBtn" class="btn btn-outline" type="button">Select all</button>
        </div>
        <div id="copyNoteStatus" style="margin-top:10px;"></div>
    `;
    treatmentPlanContainer.appendChild(noteCard);

    diagnosisData.diagnoses.forEach((diagnosis) => {
        const section = document.createElement("div");
        section.className = "diagnosis-result";

        const plan = recommendedPlanForDiagnosisLabel(diagnosis);
        const medsHTML = (plan.meds || [])
            .map((name) => {
                const med = MEDICATIONS.find((m) => m.name === name);
                if (!med) return `<li>${name}</li>`;
                return `<li><strong>${med.name}</strong> (${med.class}) — typical: ${pickDoseString(med)}</li>`;
            })
            .join("");

        const therapyHTML = (plan.therapy || []).map((t) => `<li>${t}</li>`).join("");

        section.innerHTML = `
            <h3>Treatment Plan (high-level) for: ${diagnosis}</h3>
            <div class="treatment-plan">
                <h4>Medication options</h4>
                <ul>${medsHTML || "<li>—</li>"}</ul>
                <h4>Psychotherapy / supports</h4>
                <ul>${therapyHTML || "<li>—</li>"}</ul>
                <p style="margin-top:10px;"><small><strong>Reminder:</strong> verify patient-specific contraindications, interactions, pregnancy/lactation risks, and monitoring requirements.</small></p>
            </div>
        `;

        treatmentPlanContainer.appendChild(section);
    });

    const printBtn = document.createElement("button");
    printBtn.className = "btn btn-primary print-btn";
    printBtn.innerHTML = '<i class="fas fa-print"></i> Save as PDF';
    printBtn.onclick = () => {
        const element = document.getElementById("treatmentPlanContainer");
        if (!element || !window.html2pdf) return;
        window.html2pdf().from(element).save("treatment_plan.pdf");
    };
    treatmentPlanContainer.appendChild(printBtn);

    // Note actions (after elements exist)
    const noteEl = document.getElementById("clinicalNoteText");
    const statusEl = document.getElementById("copyNoteStatus");
    document.getElementById("selectClinicalNoteBtn")?.addEventListener("click", () => {
        noteEl?.focus();
        noteEl?.select();
    });
    document.getElementById("copyClinicalNoteBtn")?.addEventListener("click", async () => {
        const ok = await copyTextToClipboard(noteEl?.value || "");
        if (statusEl) {
            statusEl.innerHTML = ok
                ? '<p style="margin:0;"><small><strong>Copied.</strong> You can paste into your EMR.</small></p>'
                : '<p style="margin:0;" class="text-warning"><small><strong>Copy failed.</strong> Use “Select all” then copy manually.</small></p>';
        }
    });

    const tabBtn = document.querySelector('.tablinks[onclick*="treatmentPlanner"]');
    tabBtn?.click();
}

function calculateDose() {
    const medicationName = document.getElementById("calcMedication")?.value;
    const weight = parseFloat(document.getElementById("calcPatientWeight")?.value);
    const indication = document.getElementById("calcIndication")?.value;
    const renalFunction = document.getElementById("calcRenalFunction")?.value || "normal";

    if (!medicationName || !indication) {
        alert("Please select a medication and indication.");
        return;
    }

    const med = MEDICATIONS.find((m) => m.name === medicationName);
    if (!med) {
        alert("Medication not found in database.");
        return;
    }

    const doseInfo = med.dosing?.[indication] || (med.dosing ? Object.values(med.dosing)[0] : null);
    if (!doseInfo) {
        alert("No dosing information available for this medication.");
        return;
    }

    let html = `
        <p><strong>${med.name}</strong> (${med.class})</p>
        <p>Indication: <strong>${INDICATION_OPTIONS.find((o) => o.value === indication)?.label || indication}</strong></p>
        <p>Typical: ${doseInfo.start} initially, up to ${doseInfo.max}</p>
    `;

    if (renalFunction !== "normal" && ["Lithium", "Venlafaxine", "Quetiapine"].includes(med.name)) {
        html += `<p class="text-warning"><i class="fas fa-exclamation-triangle"></i> Renal impairment selected: verify labeling/guidelines and consider dose reduction + monitoring.</p>`;
    }

    if (Number.isFinite(weight) && weight > 0 && ["Lithium", "Quetiapine"].includes(med.name)) {
        const factor = Math.round((weight / 70) * 100) / 100;
        html += `<p><small>Weight entered: ${weight} kg (rough scaling factor vs 70 kg: ${factor}×). Use clinical judgment—do not dose purely by weight.</small></p>`;
    }

    const rec = document.getElementById("doseRecommendation");
    const results = document.getElementById("doseResults");
    if (rec) rec.innerHTML = html;
    if (results) results.style.display = "block";
}

function wireSearch() {
    const medSearch = document.getElementById("medicationSearch");
    if (medSearch) {
        medSearch.addEventListener("input", (e) => {
            const searchTerm = String(e.target.value || "").toLowerCase().trim();
            const cards = document.querySelectorAll(".medication-card");

            cards.forEach((card) => {
                const name = card.querySelector(".medication-name")?.textContent?.toLowerCase() || "";
                const klass = card.querySelector(".medication-class")?.textContent?.toLowerCase() || "";
                card.style.display = !searchTerm || name.includes(searchTerm) || klass.includes(searchTerm) ? "block" : "none";
            });
        });
    }

    const receptorSearch = document.getElementById("receptorSearch");
    if (receptorSearch) {
        receptorSearch.addEventListener("input", (e) => {
            const searchTerm = String(e.target.value || "").toLowerCase().trim();
            const items = document.querySelectorAll(".receptor-item");

            items.forEach((item) => {
                const text = item.textContent?.toLowerCase() || "";
                item.style.display = !searchTerm || text.includes(searchTerm) ? "block" : "none";
            });
        });
    }
}

function wireAuthHeader() {
    const user = safeJsonParse(localStorage.getItem(STORAGE_KEYS.user), {});
    const userDisplay = document.getElementById("userDisplay");
    if (userDisplay) userDisplay.textContent = user?.username ? `Welcome, ${user.username}` : "";

    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn?.addEventListener("click", () => {
        localStorage.removeItem(STORAGE_KEYS.loggedIn);
        localStorage.removeItem(STORAGE_KEYS.user);
        window.location.href = "login.html";
    });
}

function initTabs() {
    const defaultTab = localStorage.getItem(STORAGE_KEYS.activeTab) || "medicationGuide";
    const btn = [...document.getElementsByClassName("tablinks")].find((b) => b.getAttribute("onclick")?.includes(defaultTab));
    (btn || document.getElementsByClassName("tablinks")[0])?.click();
}

// ---------- Distribution Functions (kept as existing feature set) ----------
function showResult(element, html, type = "") {
    if (!element) return;
    element.innerHTML = html;
    element.className = `result-box show ${type ? type + "-box" : ""}`;
}

window.calculateWeightBasedDose = function calculateWeightBasedDose() {
    const weight = parseFloat(document.getElementById("patientWeight")?.value);
    const medication = document.getElementById("medicationSelect")?.value;
    const resultDiv = document.getElementById("weightBasedResult");

    if (!Number.isFinite(weight) || weight <= 0 || !medication) {
        showResult(resultDiv, "Please enter weight and select medication", "warning");
        return;
    }

    const dosing = {
        fluoxetine: { minDose: 0.5, maxDose: 0.8, unit: "mg/kg/day" },
        sertraline: { minDose: 0.5, maxDose: 1.5, unit: "mg/kg/day" },
        venlafaxine: { minDose: 1, maxDose: 2, unit: "mg/kg/day" },
        bupropion: { minDose: 2, maxDose: 3, unit: "mg/kg/day" },
    };

    const med = dosing[medication];
    if (!med) {
        showResult(resultDiv, "No dosing rule configured for that selection", "warning");
        return;
    }

    const minTotal = Math.round(weight * med.minDose);
    const maxTotal = Math.round(weight * med.maxDose);

    showResult(
        resultDiv,
        `
        <h4>Weight-Based Dosing Results</h4>
        <p>Estimated daily dose range: <strong>${minTotal}-${maxTotal} mg/day</strong></p>
        <p><small>Rule: ${med.minDose}-${med.maxDose} ${med.unit}. Verify with labeling/guidelines and clinical context.</small></p>
    `
    );
};

window.calculateRenalAdjustedDose = function calculateRenalAdjustedDose() {
    const crCl = parseFloat(document.getElementById("creatinineClearance")?.value);
    const medication = document.getElementById("renalMedSelect")?.value;
    const resultDiv = document.getElementById("renalAdjustmentResult");

    if (!Number.isFinite(crCl) || crCl <= 0 || !medication) {
        showResult(resultDiv, "Please enter creatinine clearance and select medication", "warning");
        return;
    }

    const adjustments = {
        lithium(cr) {
            if (cr > 60) return "Often no adjustment required; monitor levels and renal function per protocol.";
            if (cr > 30) return "Consider dose reduction and closer level monitoring; consult local guidance.";
            return "Avoid or specialist-only use; consult local guidance.";
        },
        gabapentin(cr) {
            if (cr > 60) return "Normal dosing range; adjust based on indication and tolerability.";
            if (cr > 30) return "Reduced dosing typically required; consult labeling/local protocol.";
            if (cr > 15) return "Further reduction typically required; consult labeling/local protocol.";
            return "Substantial reduction typically required; consult labeling/local protocol.";
        },
        pregabalin(cr) {
            if (cr > 60) return "Normal dosing range; adjust based on indication and tolerability.";
            if (cr > 30) return "Reduced dosing typically required; consult labeling/local protocol.";
            if (cr > 15) return "Further reduction typically required; consult labeling/local protocol.";
            return "Substantial reduction typically required; consult labeling/local protocol.";
        },
    };

    const fn = adjustments[medication];
    if (!fn) {
        showResult(resultDiv, "No renal adjustment rule configured for that selection", "warning");
        return;
    }

    const recommendation = fn(crCl);
    showResult(
        resultDiv,
        `
        <h4>Renal Dose Considerations</h4>
        <p>Creatinine clearance: <strong>${crCl} mL/min</strong></p>
        <p>${recommendation}</p>
    `,
        "info"
    );
};

window.evaluateDrugLevel = function evaluateDrugLevel() {
    const level = parseFloat(document.getElementById("drugLevel")?.value);
    const medication = document.getElementById("monitoringMedSelect")?.value;
    const resultDiv = document.getElementById("drugLevelResult");

    if (!Number.isFinite(level) || level <= 0 || !medication) {
        showResult(resultDiv, "Please enter drug level and select medication", "warning");
        return;
    }

    const ranges = {
        lithium: { min: 0.6, max: 1.2, unit: "mEq/L", toxic: 1.5 },
        valproate: { min: 50, max: 100, unit: "mcg/mL", toxic: 120 },
        carbamazepine: { min: 4, max: 12, unit: "mcg/mL", toxic: 15 },
        clozapine: { min: 350, max: 600, unit: "ng/mL", toxic: 1000 },
    };

    const range = ranges[medication];
    if (!range) {
        showResult(resultDiv, "No reference range configured for that selection", "warning");
        return;
    }

    let status = "therapeutic";
    if (level < range.min) status = "subtherapeutic";
    if (level > range.max) status = "supratherapeutic";
    if (level > range.toxic) status = "potentially toxic";

    showResult(
        resultDiv,
        `
        <h4>Therapeutic Drug Monitoring (TDM)</h4>
        <p>Current level: <strong>${level} ${range.unit}</strong></p>
        <p>Reference range: ${range.min}-${range.max} ${range.unit}</p>
        <p>Status: <strong>${status.toUpperCase()}</strong></p>
        <p><small>Ranges vary by indication, timing (trough), and lab. Always interpret clinically.</small></p>
    `,
        status === "therapeutic" ? "info" : "warning"
    );
};

window.checkInteractions = function checkInteractions() {
    const selectedMeds = Array.from(document.querySelectorAll("#interactionMedList input:checked")).map((i) => i.value);
    const resultDiv = document.getElementById("interactionResult");

    if (selectedMeds.length < 2) {
        showResult(resultDiv, "Please select at least two medications to check interactions", "warning");
        return;
    }

    // Educational examples only (not exhaustive)
    const interactions = {
        fluoxetine: {
            lithium: "Potential serotonin toxicity risk; monitor clinically and consider levels per protocol.",
            clozapine: "May increase clozapine exposure; monitor and consult labeling/local protocol.",
        },
        lithium: {
            fluoxetine: "Potential serotonin toxicity risk; monitor clinically.",
            carbamazepine: "Neurotoxicity risk reported; monitor closely and consult local guidance.",
        },
        carbamazepine: {
            lithium: "Neurotoxicity risk reported; monitor closely and consult local guidance.",
        },
    };

    let found = false;
    let html = "<h4>Drug Interaction Summary (non-exhaustive)</h4><ul>";

    for (let i = 0; i < selectedMeds.length; i++) {
        for (let j = i + 1; j < selectedMeds.length; j++) {
            const a = selectedMeds[i];
            const b = selectedMeds[j];
            const msg = interactions[a]?.[b] || interactions[b]?.[a];
            if (msg) {
                found = true;
                html += `<li><strong>${a} + ${b}:</strong> ${msg}</li>`;
            }
        }
    }

    html += "</ul>";
    html += found
        ? '<p><small>Verify with a dedicated interaction checker and product labeling.</small></p>'
        : "<p>No example interactions in this demo set. This does not mean the combination is safe.</p>";

    showResult(resultDiv, html, found ? "warning" : "info");
};

window.getClinicalGuidance = function getClinicalGuidance() {
    const scenario = document.getElementById("clinicalScenario")?.value;
    const resultDiv = document.getElementById("clinicalGuidanceResult");

    if (!scenario) {
        showResult(resultDiv, "Please select a clinical scenario", "warning");
        return;
    }

    const guidance = {
        elderly: `
            <h4>Elderly patients (>65)</h4>
            <ul>
                <li>Start low, go slow; reassess frequently.</li>
                <li>Review falls risk, anticholinergic burden, QT risk, and polypharmacy.</li>
                <li>Adjust for renal/hepatic function when relevant.</li>
            </ul>
        `,
        pregnancy: `
            <h4>Pregnancy</h4>
            <ul>
                <li>Balance maternal illness risk vs medication exposure; document shared decision-making.</li>
                <li>Verify agent-specific pregnancy/lactation safety with authoritative references.</li>
            </ul>
        `,
        hepatic: `
            <h4>Hepatic impairment</h4>
            <ul>
                <li>Consider dose reductions and slower titration for hepatically metabolized agents.</li>
                <li>Monitor labs as indicated; avoid known hepatotoxicity where possible.</li>
            </ul>
        `,
        bleeding: `
            <h4>Bleeding risk</h4>
            <ul>
                <li>SSRIs/SNRIs may increase bleeding risk, especially with NSAIDs/anticoagulants.</li>
                <li>Consider GI protection and monitoring per local guidance.</li>
            </ul>
        `,
    };

    showResult(resultDiv, guidance[scenario] || "No guidance available for that selection.", "info");
};

// ---------- Boot ----------
document.addEventListener("DOMContentLoaded", () => {
    if (!requireAuthOrRedirect()) return;

    wireAuthHeader();
    renderMedicationCards(MEDICATIONS);
    populateDosingDropdown();

    const assessBtn = document.getElementById("assessBtn");
    assessBtn?.addEventListener("click", assessPatient);

    const generatePlanBtn = document.getElementById("generatePlanBtn");
    generatePlanBtn?.addEventListener("click", generateTreatmentPlan);

    const calculateDoseBtn = document.getElementById("calculateDoseBtn");
    calculateDoseBtn?.addEventListener("click", calculateDose);

    wireSearch();
    initTabs();
});