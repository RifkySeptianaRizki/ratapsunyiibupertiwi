document.addEventListener('DOMContentLoaded', () => {
    // --- PENGATURAN MUSIK ---
    const musicTracks = [
        { name: 'Visi Misi', path: 'music/Visi-Misi.mp3' },
        { name: 'Korupsi', path: 'music/3.mp3' },
        { name: 'Adegan Sedih', path: 'music/BC ADEGAN SEDIH.mp3' },
        { name: 'Telepon', path: 'music/EFEK SUARA MEMANGGIL TELEPON _ CALLING SOUND EFFECT.mp3' },
        { name: 'Bertengkar', path: 'music/BERTENGKAR.mp3' },
        { name: 'Intrograsi KPK', path: 'music/INTOGRASI KPK.mp3' },
        { name: 'Penari Akhir', path: 'music/BC PENARI AKHIR.mp3' },
        { name: 'Ending', path: 'music/ENDINGGGGGG.mp3' },
    ];

    // Elemen HTML yang sudah ada
    const soundboardControls = document.getElementById('soundboard-controls');
    const nowPlayingTrack = document.getElementById('now-playing-track');
    const stopButton = document.getElementById('stop-button');
    const volumeSlider = document.getElementById('volume-slider');

    // =================== VARIABEL BARU ===================
    const seekSlider = document.getElementById('seek-slider');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    // =====================================================

    let audio = new Audio();
    let currentTrackButton = null;
    let fadeOutInterval = null;

    // Fungsi untuk memformat waktu dari detik menjadi MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Fungsi untuk membuat tombol-tombol musik (Tidak berubah)
    function createButtons() {
        musicTracks.forEach(track => {
            const button = document.createElement('button');
            button.className = 'track-button';
            button.textContent = track.name;
            button.dataset.path = track.path;
            
            button.addEventListener('click', () => {
                playTrack(track, button);
            });

            soundboardControls.appendChild(button);
        });
    }

    // Fungsi utama untuk memutar musik (Tidak berubah)
    function playTrack(track, button) {
        if (!audio.paused && audio.src !== new URL(track.path, window.location.href).href) {
            fadeOutStop(() => {
                startNewTrack(track, button);
            });
        } else if (audio.paused) {
            startNewTrack(track, button);
        }
    }
    
    // Fungsi untuk memulai track baru (Sedikit perubahan)
    function startNewTrack(track, button) {
        if (currentTrackButton) {
            currentTrackButton.classList.remove('playing');
        }

        audio.src = track.path;
        audio.volume = volumeSlider.value;
        audio.play();

        nowPlayingTrack.textContent = track.name;
        button.classList.add('playing');
        currentTrackButton = button;
    }

    // Fungsi FADE OUT dan STOP (Sedikit perubahan untuk reset UI)
    function fadeOutStop(callback) {
        if (audio.paused) {
            if (callback) callback();
            return;
        }

        clearInterval(fadeOutInterval); 
        const initialVolume = audio.volume;
        const fadeDuration = 1500;
        const fadeSteps = 50;
        const volumeDecrement = initialVolume / fadeSteps;

        fadeOutInterval = setInterval(() => {
            if (audio.volume > volumeDecrement) {
                audio.volume -= volumeDecrement;
            } else {
                clearInterval(fadeOutInterval);
                audio.pause();
                audio.currentTime = 0;
                audio.volume = initialVolume;
                
                // Reset UI
                nowPlayingTrack.textContent = '---';
                if (currentTrackButton) {
                    currentTrackButton.classList.remove('playing');
                    currentTrackButton = null;
                }
                resetProgressUI(); // <-- PANGGIL FUNGSI RESET BARU

                if (callback) callback();
            }
        }, fadeDuration / fadeSteps);
    }
    
    // =================== FUNGSI BARU UNTUK RESET UI PROGRES ===================
    function resetProgressUI() {
        seekSlider.value = 0;
        currentTimeEl.textContent = '00:00';
        durationEl.textContent = '00:00';
    }
    // ==========================================================================

    // Event listener untuk tombol STOP ALL (Tidak berubah)
    stopButton.addEventListener('click', () => fadeOutStop());

    // Event listener untuk slider volume (Tidak berubah)
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });

    // =================== EVENT LISTENER BARU UNTUK AUDIO ===================

    // 1. Saat metadata lagu (seperti durasi) sudah termuat
    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
        seekSlider.max = audio.duration;
    });

    // 2. Saat waktu pemutaran berubah (lagu sedang berjalan)
    audio.addEventListener('timeupdate', () => {
        seekSlider.value = audio.currentTime;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    // 3. Saat lagu selesai diputar
    audio.addEventListener('ended', () => {
        if (currentTrackButton) {
            currentTrackButton.classList.remove('playing');
        }
        nowPlayingTrack.textContent = '---';
        currentTrackButton = null;
        resetProgressUI();
    });

    // ================= EVENT LISTENER BARU UNTUK SEEK SLIDER =================
    seekSlider.addEventListener('input', () => {
        audio.currentTime = seekSlider.value;
    });

    // Panggil fungsi untuk membuat tombol saat halaman dimuat
    createButtons();
});