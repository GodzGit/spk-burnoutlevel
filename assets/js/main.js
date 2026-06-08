/* main.js */
import { openModal, closeModal, initModals } from './ui/modal.js';
import { updateStatisticsUI } from './ui/statistics.js';
import { updateActivityFeedUI } from './ui/activityFeed.js';
import { evaluateInference } from './fuzzy/inference.js';
import { calculateCentroid, getBurnoutCategory } from './fuzzy/defuzzification.js';
import { createParticipant } from './services/participantService.js';
import { createAssessment } from './services/assessmentService.js';

// State assessment wizard
let currentStep = 1;
let participantData = null;
let fuzzyResults = null;

// Referensi DOM Wizard (hanya diakses di halaman assessment)
function getWizardSteps() {
  return {
    1: document.getElementById('wizard-step-1'),
    2: document.getElementById('wizard-step-2'),
    3: document.getElementById('wizard-step-3'),
    4: document.getElementById('wizard-step-4'),
    5: document.getElementById('wizard-step-5')
  };
}

// Fungsi navigasi wizard
function showStep(stepNum) {
  const steps = getWizardSteps();
  Object.keys(steps).forEach(s => {
    if (steps[s]) {
      steps[s].classList.remove('active');
    }
  });
  if (steps[stepNum]) {
    steps[stepNum].classList.add('active');
  }
  currentStep = stepNum;
}

// Reset Form & Wizard
function resetWizard() {
  currentStep = 1;
  participantData = null;
  fuzzyResults = null;
  
  const inputNama = document.getElementById('input-nama');
  const inputProdi = document.getElementById('input-prodi');
  const inputSemester = document.getElementById('input-semester');
  
  if (inputNama) inputNama.value = '';
  if (inputProdi) inputProdi.value = '';
  if (inputSemester) inputSemester.value = '1';
  
  // Reset sliders
  const sliderBeban = document.getElementById('slider-beban');
  const valBeban = document.getElementById('val-beban');
  if (sliderBeban) sliderBeban.value = '50';
  if (valBeban) valBeban.textContent = '50';
  
  const sliderTidur = document.getElementById('slider-tidur');
  const valTidur = document.getElementById('val-tidur');
  if (sliderTidur) sliderTidur.value = '6';
  if (valTidur) valTidur.textContent = '6';
  
  const sliderAktivitas = document.getElementById('slider-aktivitas');
  const valAktivitas = document.getElementById('val-aktivitas');
  if (sliderAktivitas) sliderAktivitas.value = '50';
  if (valAktivitas) valAktivitas.textContent = '50';

  // Reset reCAPTCHA jika g-recaptcha tersedia di global scope
  if (window.grecaptcha) {
    try {
      window.grecaptcha.reset();
    } catch(e) {
      console.warn("reCAPTCHA reset bypassed:", e);
    }
  }
  
  // Reset Checklist Loading
  const checkItems = document.querySelectorAll('.checklist-item');
  checkItems.forEach(item => {
    item.className = 'checklist-item';
    const icon = item.querySelector('.checklist-icon');
    if (icon) icon.innerHTML = '';
  });
  
  // Reset Progress Circle
  const progressCircle = document.getElementById('result-circle-bar');
  if (progressCircle) {
    progressCircle.style.strokeDashoffset = '440';
  }

  showStep(1);
}

// Inisialisasi Slider live value
function initSliders() {
  const sliders = [
    { id: 'slider-beban', valId: 'val-beban' },
    { id: 'slider-tidur', valId: 'val-tidur' },
    { id: 'slider-aktivitas', valId: 'val-aktivitas' }
  ];

  sliders.forEach(slider => {
    const el = document.getElementById(slider.id);
    const valEl = document.getElementById(slider.valId);
    if (el && valEl) {
      el.addEventListener('input', (e) => {
        valEl.textContent = e.target.value;
      });
    }
  });
}

// Animasi checklist proses fuzzy
function runFuzzyCalculationAnimation() {
  return new Promise((resolve) => {
    const tasks = [
      { id: 'task-fuzzifikasi', text: 'Fuzzifikasi input criteria...' },
      { id: 'task-rules', text: 'Evaluasi 27 rule base...' },
      { id: 'task-inferensi', text: 'Inferensi Mamdani MIN-MAX...' },
      { id: 'task-defuzzifikasi', text: 'Defuzzifikasi Centroid (COA)...' }
    ];

    let currentTaskIdx = 0;

    function nextTask() {
      if (currentTaskIdx > 0) {
        // Tandai task sebelumnya selesai
        const prevTask = document.getElementById(tasks[currentTaskIdx - 1].id);
        if (prevTask) {
          prevTask.classList.remove('active');
          prevTask.classList.add('completed');
          const icon = prevTask.querySelector('.checklist-icon');
          if (icon) icon.innerHTML = '✓';
        }
      }

      if (currentTaskIdx < tasks.length) {
        // Aktifkan task sekarang
        const curTask = document.getElementById(tasks[currentTaskIdx].id);
        if (curTask) {
          curTask.classList.add('active');
          const icon = curTask.querySelector('.checklist-icon');
          if (icon) icon.innerHTML = '<div class="checklist-spinner"></div>';
        }
        currentTaskIdx++;
        setTimeout(nextTask, 600); // Jeda animasi per langkah (600ms)
      } else {
        // Semua selesai
        resolve();
      }
    }

    nextTask();
  });
}

// Menghitung Fuzzy Mamdani berdasarkan input slider
function executeFuzzyMamdani() {
  const beban = parseFloat(document.getElementById('slider-beban').value);
  const tidur = parseFloat(document.getElementById('slider-tidur').value);
  const aktivitas = parseFloat(document.getElementById('slider-aktivitas').value);

  console.log(`Menjalankan Fuzzy Mamdani dengan input - Beban: ${beban}, Tidur: ${tidur}, Aktivitas: ${aktivitas}`);

  // 1. Evaluasi Inferensi (Mamdani MIN-MAX)
  const inferenceResult = evaluateInference(beban, tidur, aktivitas);

  // 2. Defuzzifikasi Centroid
  const score = calculateCentroid(inferenceResult.outputs, 0.5);
  const category = getBurnoutCategory(score);

  console.log(`Hasil Perhitungan - Skor: ${score.toFixed(2)}%, Kategori: ${category}`);

  return {
    inputs: { beban, tidur, aktivitas },
    score: score,
    category: category
  };
}

// Rekomendasi berdasarkan kategori burnout
function getRecommendationText(category, score) {
  if (category === 'Rendah') {
    return "Tingkat burnout rendah. Pertahankan keseimbangan akademik, istirahat cukup, dan terus jaga aktivitas positif.";
  } else if (category === 'Sedang') {
    return "Tingkat burnout sedang. Evaluasi manajemen waktu, tingkatkan kualitas tidur, kurangi beban berlebih.";
  } else {
    return "Tingkat burnout tinggi. Segera konsultasi dengan dosen pembimbing atau psikolog. Prioritaskan istirahat dan delegasi tugas.";
  }
}

// Tampilkan Hasil di Step 5
function displayResults(results) {
  const score = Math.round(results.score);
  const category = results.category;
  
  // Set Skor dan Kategori
  const elScore = document.getElementById('result-score');
  const elCategory = document.getElementById('result-category');
  const elRecommendation = document.getElementById('result-recommendation');
  
  if (elScore) elScore.textContent = `${score}%`;
  if (elCategory) {
    elCategory.textContent = `Burnout ${category}`;
    elCategory.className = `badge ${category.toLowerCase()}`;
    elCategory.style.border = 'var(--border-width) solid var(--color-black)';
    elCategory.style.padding = '0.4rem 0.8rem';
    elCategory.style.borderRadius = 'var(--border-radius)';
    elCategory.style.fontWeight = '800';
    elCategory.style.fontSize = '1.1rem';
    
    // Warna sesuai kategori
    if (category === 'Rendah') {
      elCategory.style.backgroundColor = 'var(--color-success-bg)';
      elCategory.style.color = 'var(--color-success)';
    } else if (category === 'Sedang') {
      elCategory.style.backgroundColor = 'var(--color-warning-bg)';
      elCategory.style.color = 'var(--color-warning)';
    } else {
      elCategory.style.backgroundColor = 'var(--color-danger-bg)';
      elCategory.style.color = 'var(--color-danger)';
    }
  }
  
  // Set Teks Rekomendasi
  if (elRecommendation) {
    elRecommendation.textContent = getRecommendationText(category, score);
  }

  // Animasi Progress Circle SVG (stroke-dasharray: 440)
  const progressCircle = document.getElementById('result-circle-bar');
  if (progressCircle) {
    const offset = 440 - (440 * score / 100);
    setTimeout(() => {
      progressCircle.style.strokeDashoffset = offset;
    }, 100);
  }
}

// Inisialisasi Alur Event Wizard (Hanya pada halaman assessment)
function initWizard() {
  // --- STEP 1: Form Identitas ---
  const btnNext1 = document.getElementById('btn-wizard-next-1');
  if (btnNext1) {
    btnNext1.addEventListener('click', () => {
      const nama = document.getElementById('input-nama').value.trim();
      const prodi = document.getElementById('input-prodi').value.trim();
      const semester = parseInt(document.getElementById('input-semester').value, 10);

      if (!nama || !prodi || isNaN(semester)) {
        alert("Mohon isi seluruh data identitas Anda.");
        return;
      }

      participantData = { nama, prodi, semester };
      showStep(2);
    });
  }

  // --- STEP 2: reCAPTCHA ---
  const btnNext2 = document.getElementById('btn-wizard-next-2');
  if (btnNext2) {
    btnNext2.addEventListener('click', () => {
      if (window.grecaptcha) {
        const response = window.grecaptcha.getResponse();
        if (response.length === 0) {
          alert("Silakan selesaikan Google reCAPTCHA terlebih dahulu untuk verifikasi keamanan.");
          return;
        }
      }
      showStep(3);
    });
  }

  // --- STEP 3: Sliders ---
  const btnProcess = document.getElementById('btn-wizard-process');
  if (btnProcess) {
    btnProcess.addEventListener('click', async () => {
      showStep(4);
      
      // 1. Jalankan perhitungan fuzzy
      fuzzyResults = executeFuzzyMamdani();
      
      // 2. Jalankan animasi checklist agar meyakinkan mahasiswa
      await runFuzzyCalculationAnimation();

      // 3. Simpan ke database Supabase
      try {
        const savedParticipant = await createParticipant(
          participantData.nama,
          participantData.prodi,
          participantData.semester
        );

        await createAssessment({
          participant_id: savedParticipant.id,
          beban_akademik: fuzzyResults.inputs.beban,
          durasi_tidur: fuzzyResults.inputs.tidur,
          aktivitas_non_akademik: fuzzyResults.inputs.aktivitas,
          burnout_score: fuzzyResults.score,
          burnout_category: fuzzyResults.category
        });

        console.log("Sinkronisasi database berhasil.");
      } catch (dbError) {
        console.error("Kesalahan sinkronisasi database. Melanjutkan visualisasi hasil lokal.", dbError);
      }

      // Tampilkan hasil final
      displayResults(fuzzyResults);
      showStep(5);
    });
  }

  // --- STEP 5: Selesai & Kembali ke Beranda ---
  const btnFinish = document.getElementById('btn-finish');
  if (btnFinish) {
    btnFinish.addEventListener('click', () => {
      resetWizard();
      window.location.href = "index.html?openHistory=true"; // Kembali ke beranda & langsung buka modal riwayat
    });
  }
}

// Scroll Spy untuk Navigasi aktif di Landing Page
function initScrollSpy() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.navbar .nav-link');
  
  if (sections.length === 0 || navLinks.length === 0) return;

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY || document.documentElement.scrollTop;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      // Berikan offset agar aktif sebelum benar-benar di atas layar
      if (scrollPos >= (sectionTop - 120)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href.includes(current)) {
        link.classList.add('active');
      }
    });
  });
}

// Inisialisasi awal web app
document.addEventListener('DOMContentLoaded', () => {
  // Inisialisasi modal global (termasuk trigger klik luar modal)
  initModals();

  // Ambil elemen penciri halaman
  const isAssessmentPage = document.getElementById('slider-beban') !== null;

  if (isAssessmentPage) {
    // Jalankan inisialisasi form wizard di halaman assessment.html
    initSliders();
    initWizard();
    resetWizard();
  } else {
    // Jalankan inisialisasi scroll spy & load statistik di halaman index.html
    initScrollSpy();
    updateStatisticsUI();
    
    // Hubungkan tombol riwayat di navbar untuk membuka modal
    const btnViewHistory = document.getElementById('nav-view-history');
    if (btnViewHistory) {
      btnViewHistory.addEventListener('click', (e) => {
        e.preventDefault();
        updateActivityFeedUI();
        openModal('modal-activity-feed');
      });
    }

    // Pengecekan otomatis parameter query untuk langsung membuka modal riwayat (setelah selesai mengisi assessment)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openHistory') === 'true') {
      updateActivityFeedUI();
      openModal('modal-activity-feed');
    }
  }
});
