import { Icon } from "@/components/Icon";
import { InstallButton, ThemeToggle } from "@/components/AppControls";

const previewBooks = [
  { title: "Atomic Habits", meta: "James Clear", image: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg" },
  { title: "The Psychology of Money", meta: "Morgan Housel", image: "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg" },
  { title: "Deep Work", meta: "Cal Newport", image: "https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg" },
  { title: "Essentialism", meta: "Greg McKeown", image: "https://covers.openlibrary.org/b/isbn/9780804137386-L.jpg" },
  { title: "Make Time", meta: "Jake Knapp & John Zeratsky", image: "https://covers.openlibrary.org/b/isbn/9780525572428-L.jpg" },
  { title: "Thinking, Fast and Slow", meta: "Daniel Kahneman", image: "https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg" }
];

const previewLearning = [
  { title: "How to Study for Exams", meta: "Ali Abdaal", image: "https://i.ytimg.com/vi/Lt54CX9DmS4/hqdefault.jpg" },
  { title: "Belajar Jadi Gen Z dari Aqeela", meta: "Raditya Dika", image: "https://i.ytimg.com/vi/aOZ5A9r_sAw/hqdefault.jpg" },
  { title: "How to Focus to Change Your Brain", meta: "Huberman Lab Essentials", image: "https://i.ytimg.com/vi/4AwyVTHEU3s/hqdefault.jpg" },
  { title: "The Top Study Habits to Improve Learning", meta: "Huberman Lab Clips", image: "https://i.ytimg.com/vi/1bszFX_XcbU/hqdefault.jpg" }
];

const benefits = [
  { icon:"calendar", title:"Bangun habit, bukan sekadar koleksi", text:"Catat durasi baca dan belajar per hari, lihat streak, target, dan kalender aktivitasmu." },
  { icon:"book", title:"Semua bacaan dalam satu tempat", text:"Simpan buku, progress halaman, sesi baca, review, wishlist, dan status selesai." },
  { icon:"play", title:"Belajar dari video tetap terarah", text:"Simpan YouTube, podcast, webinar, atau course lalu catat durasi dan progresnya." },
  { icon:"bulb", title:"Insight tidak hilang begitu saja", text:"Highlight, catatan, dan takeaway terkumpul di Knowledge Vault pribadi." },
  { icon:"chart", title:"Lihat perkembanganmu dengan jelas", text:"Rekap bulanan menunjukkan buku, video, halaman, durasi baca, dan durasi belajar." },
  { icon:"lock", title:"Local-first dan tetap milikmu", text:"Data personal utama disimpan di perangkatmu. Arunika tidak memerlukan akun untuk jurnal pribadi." }
] as const;

const faqs = [
  ["Apakah ini langganan bulanan?","Tidak. Arunika Pro dibeli sekali. Harga promo saat ini Rp49.000."],
  ["Data buku dan catatan saya disimpan di mana?","Arunika menggunakan pendekatan local-first. Buku, sesi, habit, insight, dan data personal utama disimpan di perangkatmu."],
  ["Bisa dipasang seperti aplikasi?","Bisa. Arunika adalah PWA dan dapat dipasang dari browser yang mendukung instalasi aplikasi web."],
  ["Bisa dipakai untuk video YouTube?","Bisa. Simpan URL YouTube di Learning Tracker, lalu buka kembali video aslinya langsung dari Arunika."],
  ["Berapa perangkat untuk satu lisensi?","Lisensi Arunika Pro mendukung maksimal 2 perangkat sesuai konfigurasi lisensi saat ini."],
  ["Bisa dicoba sebelum beli?","Bisa. Mode Demo berisi contoh buku, learning, habit, dan insight supaya kamu bisa merasakan aplikasinya terlebih dahulu."]
];

export default function LandingPage(){
  return <main className="stream-landing conversion-landing">
    <header className="landing-stream-nav">
      <a href="/" className="stream-wordmark landing-wordmark">ARUNIKA</a>
      <nav>
        <a href="#manfaat">Manfaat</a>
        <a href="#jelajah">Buku</a>
        <a href="#learning">Learning</a>
        <a href="#cara">Cara Kerja</a>
        <a href="#pro">Pro</a>
      </nav>
      <div className="landing-nav-actions">
        <ThemeToggle compact />
        <a href="/activate" className="landing-login">Aktivasi</a>
        <a href="/pro" className="landing-demo landing-buy">Dapatkan Pro</a>
      </div>
    </header>

    <section className="landing-cinema-hero conversion-hero">
      <div className="cinema-grid real-covers" aria-hidden="true">
        {previewBooks.map((book,index)=><div className={"cinema-poster p"+(index+1)} key={book.title}><img src={book.image} alt=""/><span className="cinema-poster-shade"/><small>{book.title}</small></div>)}
      </div>
      <div className="cinema-vignette"/>
      <div className="landing-cinema-copy conversion-hero-copy">
        <div className="hero-brandline"><span className="hero-a">A</span><span>READ · LEARN · GROW</span></div>
        <h1>Bukan cuma selesai baca. <em>Buat kebiasaan belajarmu benar-benar tumbuh.</em></h1>
        <p>Arunika menyatukan buku, video, sesi, habit, insight, dan rekap bulanan dalam satu aplikasi local-first yang terasa seperti perpustakaan streaming pribadimu.</p>

        <div className="hero-offer-card">
          <span className="offer-label">HARGA PROMO ARUNIKA PRO</span>
          <div className="offer-price-row"><del>Rp100.000</del><strong>Rp49.000</strong><span>sekali bayar</span></div>
          <small>Tanpa langganan bulanan. Maksimal 2 perangkat.</small>
        </div>

        <div className="stream-hero-actions landing-actions conversion-actions">
          <a className="netflix-play conversion-buy" href="/pro"><Icon name="crown" size={19}/> Dapatkan Pro Rp49.000</a>
          <a className="netflix-more" href="/app"><Icon name="play" size={19}/> Coba Demo Gratis</a>
          <InstallButton hero />
        </div>

        <div className="landing-proof conversion-proof">
          <div className="landing-proof-item"><b>Local-first</b><span>Data jurnal tetap di perangkat</span></div>
          <div className="landing-proof-item"><b>Habit tracker</b><span>Baca + belajar dalam satu kalender</span></div>
          <div className="landing-proof-item"><b>Sekali bayar</b><span>Tidak ada biaya bulanan</span></div>
        </div>
      </div>
    </section>

    <section className="landing-value-strip">
      <div><strong>Buku</strong><span>Progress, sesi, review & wishlist</span></div>
      <div><strong>Learning</strong><span>YouTube, podcast, webinar & course</span></div>
      <div><strong>Habit</strong><span>Durasi baca + belajar harian</span></div>
      <div><strong>Insight</strong><span>Rekap bulanan & knowledge vault</span></div>
    </section>

    <section className="landing-product-stage" aria-label="Preview aplikasi Arunika">
      <div className="product-stage-copy">
        <span className="section-tag">LIHAT SEBELUM MEMBELI</span>
        <h2>Satu ruang yang membuat membaca dan belajar terasa <em>teratur.</em></h2>
        <p>Buka Demo gratis untuk mencoba pengalaman aslinya. Preview ini menunjukkan bagaimana progres, habit, dan knowledge tampil di Arunika.</p>
        <div className="product-stage-actions">
          <a className="netflix-play" href="/app"><Icon name="play" size={17}/> Jelajah Demo</a>
          <a className="netflix-more" href="/pro"><Icon name="crown" size={17}/> Lihat Arunika Pro</a>
        </div>
      </div>
      <div className="product-stage-device">
        <div className="product-stage-window">
          <div className="product-stage-topbar"><span className="stream-wordmark">ARUNIKA</span><div><i/><i/><i/></div></div>
          <div className="product-stage-body">
            <aside className="product-stage-sidebar">
              <span className="active"><Icon name="home" size={14}/></span>
              <span><Icon name="book" size={14}/></span>
              <span><Icon name="play" size={14}/></span>
              <span><Icon name="calendar" size={14}/></span>
              <span><Icon name="bulb" size={14}/></span>
            </aside>
            <div className="product-stage-main">
              <div className="stage-welcome"><small>SELAMAT DATANG KEMBALI</small><strong>Teruskan ritmemu.</strong></div>
              <div className="stage-kpis">
                <div><small>Buku selesai</small><strong>3</strong><span>bulan ini</span></div>
                <div><small>Halaman</small><strong>428</strong><span>bulan ini</span></div>
                <div><small>Durasi baca</small><strong>6j 24m</strong><span>bulan ini</span></div>
                <div><small>Belajar</small><strong>4j 12m</strong><span>bulan ini</span></div>
              </div>
              <div className="stage-grid">
                <article className="stage-now-reading">
                  <div className="stage-book-art"><span>A</span></div>
                  <div><small>LANJUTKAN MEMBACA</small><h3>Atomic Habits</h3><p>198 / 320 halaman</p><div className="stage-progress"><span/></div><button><Icon name="book" size={13}/> Catat sesi</button></div>
                </article>
                <article className="stage-habit-card">
                  <div><small>HABIT MINGGU INI</small><strong>5 hari aktif</strong></div>
                  <div className="stage-week">{[1,1,0,1,1,1,0].map((active,i)=><span className={active?"active":""} key={i}><i/></span>)}</div>
                  <div className="stage-legend"><span><i className="reading"/>Baca</span><span><i className="learning"/>Belajar</span></div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="landing-benefit-section" id="manfaat">
      <div className="conversion-section-copy">
        <span className="section-tag">KENAPA ARUNIKA</span>
        <h2>Kamu tidak butuh lebih banyak konten. Kamu butuh sistem untuk benar-benar <em>menjalankannya.</em></h2>
        <p>Buku yang dibeli, video yang disimpan, dan insight yang menarik sering berhenti sebagai niat. Arunika membantu menjadikannya ritme harian yang bisa dilihat dan dilanjutkan.</p>
      </div>
      <div className="conversion-benefit-grid">
        {benefits.map(item=><article className="conversion-benefit-card" key={item.title}>
          <span className="conversion-benefit-icon"><Icon name={item.icon as any} size={22}/></span>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>)}
      </div>
    </section>

    <section className="landing-stream-section" id="jelajah">
      <div className="landing-section-head">
        <span className="section-tag">READING LOG</span>
        <h2>Perpustakaan pribadi yang membuatmu ingin kembali membaca.</h2>
        <p>Sampul, progress, status, sesi, dan review tampil visual. Bukan spreadsheet yang terasa seperti pekerjaan tambahan.</p>
      </div>
      <div className="landing-rail book-cover-rail">
        {previewBooks.map((book)=><div className="landing-media-card" key={book.title}><div className="landing-book-cover"><img src={book.image} alt={book.title}/></div><strong>{book.title}</strong><span>{book.meta}</span></div>)}
      </div>
      <div className="inline-conversion-cta">
        <div><strong>Sudah punya banyak buku yang ingin diselesaikan?</strong><span>Mulai dari satu sesi hari ini.</span></div>
        <a href="/app">Coba Demo <Icon name="arrow" size={15}/></a>
      </div>
    </section>

    <section className="landing-stream-section learning-preview-section" id="learning">
      <div className="landing-section-head">
        <span className="section-tag">LEARNING TRACKER</span>
        <h2>Belajar dari video tanpa kehilangan jejak.</h2>
        <p>Simpan konten yang sedang dipelajari, catat sesi menonton, lanjutkan progres, dan masukkan takeaway penting ke vault pribadimu.</p>
      </div>
      <div className="landing-learning-grid">
        {previewLearning.map((item)=><article className="landing-learning-card" key={item.title}><div className="landing-video-thumb"><img src={item.image} alt={item.title}/><span className="landing-play"><Icon name="play" size={18}/></span></div><strong>{item.title}</strong><span>{item.meta} · YouTube</span></article>)}
      </div>
    </section>

    <section className="conversion-habit-showcase">
      <div className="conversion-section-copy">
        <span className="section-tag">DAILY HABIT TRACKER</span>
        <h2>Yang dibangun bukan cuma jumlah buku. <em>Tapi kebiasaannya.</em></h2>
        <p>Setiap sesi baca dan belajar masuk ke tracker harian. Kamu bisa melihat berapa halaman, berapa video, dan berapa menit yang benar-benar kamu jalankan.</p>
        <div className="habit-showcase-points">
          <span><Icon name="check" size={16}/> Target halaman per hari</span>
          <span><Icon name="check" size={16}/> Target durasi baca</span>
          <span><Icon name="check" size={16}/> Target durasi belajar</span>
          <span><Icon name="check" size={16}/> Kalender baca + nonton</span>
        </div>
      </div>
      <div className="habit-preview-card">
        <div className="habit-preview-head"><span>SEPTEMBER 2026</span><strong>Hari ini</strong></div>
        <div className="habit-preview-stats">
          <div><small>Buku</small><strong>2</strong></div>
          <div><small>Halaman</small><strong>24</strong></div>
          <div><small>Video</small><strong>1</strong></div>
        </div>
        <div className="habit-preview-duration">
          <span><i className="preview-dot reading"/>Baca <strong>32 mnt</strong></span>
          <span><i className="preview-dot learning"/>Belajar <strong>28 mnt</strong></span>
        </div>
        <div className="habit-preview-week">
          {[["S",0],["S",1],["R",1],["K",0],["J",1],["S",1],["M",0]].map(([label,active],i)=><div className={active?"active":""} key={i}><span>{label}</span><i/></div>)}
        </div>
      </div>
    </section>

    <section className="landing-feature-showcase" id="fitur">
      <div className="feature-showcase-copy">
        <span className="section-tag">SATU ALUR</span>
        <h2>Baca. Belajar. Catat. Lihat progres.</h2>
        <p>Semua fitur dibuat saling terhubung. Sesi yang kamu catat otomatis membentuk habit dan rekap, sehingga kamu tidak perlu mengisi angka yang sama berulang-ulang.</p>
        <div className="feature-pill-grid">
          {[
            ["book","Reading Log"],
            ["clock","Reading Session"],
            ["play","Learning Session"],
            ["calendar","Habit Tracker"],
            ["bulb","Knowledge Vault"],
            ["chart","Monthly Recap"]
          ].map(([icon,label])=><span key={label}><Icon name={icon as any} size={18}/>{label}</span>)}
        </div>
      </div>
      <div className="feature-screen">
        <div className="screen-nav"><span className="stream-wordmark">ARUNIKA</span><i/><i/><i/></div>
        <div className="screen-feature real-screen-feature">
          <img src="https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg" alt="Atomic Habits"/>
          <div className="screen-feature-gradient"/>
          <div className="screen-feature-copy"><small>LANJUTKAN MEMBACA</small><h3>Atomic Habits</h3><p>James Clear · Self Development</p><div className="fake-progress"><span/></div><button><Icon name="book" size={15}/> Catat Baca</button></div>
        </div>
        <div className="screen-row">{previewLearning.map((item,i)=><div key={item.title} className={"screen-card sc"+(i+1)}><img src={item.image} alt=""/></div>)}</div>
      </div>
    </section>

    <section className="conversion-how-section" id="cara">
      <div className="conversion-section-copy centered">
        <span className="section-tag">MULAI TANPA RIBET</span>
        <h2>Tiga langkah untuk mulai.</h2>
        <p>Coba dulu aplikasinya. Kalau cocok, aktivasi Pro dan mulai isi koleksimu sendiri.</p>
      </div>
      <div className="conversion-steps">
        <article><span>01</span><h3>Coba Demo</h3><p>Jelajahi semua tab dengan data contoh agar kamu tahu bagaimana Arunika bekerja.</p><a href="/app">Buka Demo <Icon name="arrow" size={14}/></a></article>
        <article><span>02</span><h3>Ambil Pro</h3><p>Bayar Rp49.000 sekali. Setelah pembayaran dikonfirmasi, kode aktivasi dikirim ke email.</p><a href="/pro">Beli Pro <Icon name="arrow" size={14}/></a></article>
        <article><span>03</span><h3>Mulai dari kosong</h3><p>Setelah aktivasi, data Demo dibersihkan dan ruang Arunika menjadi milik koleksimu sendiri.</p><a href="/activate">Sudah punya kode? <Icon name="arrow" size={14}/></a></article>
      </div>
    </section>

    <section className="landing-pro-section conversion-pricing-section" id="pro">
      <div className="conversion-price-card">
        <div className="conversion-price-copy">
          <span className="section-tag">ARUNIKA PRO</span>
          <h2>Kalau satu aplikasi bisa membantu kebiasaan belajarmu lebih konsisten, <em>Rp49.000 terasa sederhana.</em></h2>
          <p>Buka koleksi tanpa batas, tracker penuh, backup & restore, knowledge vault, insight, serta pengalaman PWA lengkap.</p>
          <div className="conversion-price-features">
            <span><Icon name="check" size={16}/> Koleksi buku tanpa batas</span>
            <span><Icon name="check" size={16}/> Learning tracker tanpa batas</span>
            <span><Icon name="check" size={16}/> Habit baca + belajar</span>
            <span><Icon name="check" size={16}/> Backup & restore lokal</span>
            <span><Icon name="check" size={16}/> Maksimal 2 perangkat</span>
            <span><Icon name="check" size={16}/> PWA untuk HP & laptop</span>
          </div>
        </div>
        <div className="conversion-price-box">
          <span className="promo-chip">PROMO SAAT INI</span>
          <del>Rp100.000</del>
          <strong>Rp49.000</strong>
          <small>sekali bayar · tanpa biaya bulanan</small>
          <a href="/pro" className="netflix-play conversion-main-cta"><Icon name="crown" size={18}/> Dapatkan Arunika Pro</a>
          <a href="/app" className="conversion-text-link">Masih ragu? Coba Demo dulu →</a>
        </div>
      </div>
    </section>

    <section className="conversion-faq-section">
      <div className="conversion-section-copy centered">
        <span className="section-tag">FAQ</span>
        <h2>Sebelum kamu mulai.</h2>
      </div>
      <div className="conversion-faq-list">
        {faqs.map(([q,a])=><details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}
      </div>
    </section>

    <section className="conversion-final-cta">
      <span className="hero-a">A</span>
      <h2>Apa yang kamu baca hari ini bisa hilang besok—atau jadi sesuatu yang tumbuh.</h2>
      <p>Catat yang dibaca. Simpan yang dipelajari. Tumbuh setiap hari.</p>
      <div>
        <a href="/pro" className="netflix-play"><Icon name="crown" size={18}/> Ambil Pro Rp49.000</a>
        <a href="/app" className="netflix-more"><Icon name="play" size={18}/> Coba Demo</a>
      </div>
    </section>

    <footer className="stream-footer"><span className="stream-wordmark">ARUNIKA</span><p>Catat yang dibaca. Simpan yang dipelajari. Tumbuh setiap hari.</p><small>© 2026 Arunika</small></footer>
  </main>;
}
