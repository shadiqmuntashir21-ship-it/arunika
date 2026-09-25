import { Icon } from "@/components/Icon";

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

export default function LandingPage(){
  return <main className="stream-landing">
    <header className="landing-stream-nav">
      <a href="/" className="stream-wordmark landing-wordmark">ARUNIKA</a>
      <nav>
        <a href="#jelajah">Jelajah</a>
        <a href="#learning">Learning</a>
        <a href="#fitur">Fitur</a>
        <a href="#pro">Pro</a>
      </nav>
      <div className="landing-nav-actions">
        <a href="/activate" className="landing-login">Aktivasi</a>
        <a href="/app" className="landing-demo">Coba Demo</a>
      </div>
    </header>

    <section className="landing-cinema-hero">
      <div className="cinema-grid real-covers" aria-hidden="true">
        {previewBooks.map((book,index)=><div className={"cinema-poster p"+(index+1)} key={book.title}><img src={book.image} alt=""/><span className="cinema-poster-shade"/><small>{book.title}</small></div>)}
      </div>
      <div className="cinema-vignette"/>
      <div className="landing-cinema-copy">
        <div className="hero-brandline"><span className="hero-a">A</span><span>READ · LEARN · GROW</span></div>
        <h1>Semua yang kamu baca dan pelajari, <em>akhirnya punya tempat.</em></h1>
        <p>Arunika mengubah reading journal menjadi pengalaman aplikasi yang visual: lanjutkan bacaan, simpan insight, track learning, dan lihat perkembanganmu seperti menjelajah koleksi pribadi.</p>
        <div className="stream-hero-actions landing-actions">
          <a className="netflix-play" href="/app"><Icon name="play" size={20}/> Mulai Demo</a>
          <a className="netflix-more" href="#fitur"><span className="info-dot">i</span> Pelajari Arunika</a>
        </div>
        <div className="landing-proof"><span><b>Local-first</b> data tetap di perangkat</span><span><b>PWA</b> bisa dipasang seperti aplikasi</span><span><b>Rp25.000</b> sekali bayar untuk Pro</span></div>
      </div>
    </section>

    <section className="landing-stream-section" id="jelajah">
      <div className="landing-section-head"><h2>Seperti punya perpustakaan streaming pribadi.</h2><p>Mode demo sudah diisi contoh sampul buku nyata agar pengalaman awal terasa hidup. Setelah Pro diaktifkan, koleksi contoh dibersihkan dan ruangnya menjadi milik pengguna sepenuhnya.</p></div>
      <div className="landing-rail book-cover-rail">
        {previewBooks.map((book)=><div className="landing-media-card" key={book.title}><div className="landing-book-cover"><img src={book.image} alt={book.title}/></div><strong>{book.title}</strong><span>{book.meta}</span></div>)}
      </div>
    </section>

    <section className="landing-stream-section learning-preview-section" id="learning">
      <div className="landing-section-head"><h2>Learning tracker yang langsung terasa nyata.</h2><p>Thumbnail demo menggunakan konten YouTube nyata sebagai contoh visual. Nantinya pengguna mengisi video, podcast, webinar, atau course mereka sendiri.</p></div>
      <div className="landing-learning-grid">
        {previewLearning.map((item)=><article className="landing-learning-card" key={item.title}><div className="landing-video-thumb"><img src={item.image} alt={item.title}/><span className="landing-play"><Icon name="play" size={18}/></span></div><strong>{item.title}</strong><span>{item.meta} · YouTube</span></article>)}
      </div>
    </section>

    <section className="landing-feature-showcase" id="fitur">
      <div className="feature-showcase-copy"><span className="section-tag">SATU APLIKASI</span><h2>Baca. Belajar. Simpan. Ulangi.</h2><p>Setiap fitur dibuat mengikuti alur nyata: temukan yang ingin dibaca, lanjutkan progress, catat sesi, simpan highlight, lalu lihat pola kebiasaan dan insight.</p>
        <div className="feature-pill-grid">
          {[
            ["book","Reading Log"],
            ["clock","Reading Session"],
            ["play","Learning Tracker"],
            ["calendar","Habit Tracker"],
            ["bulb","Knowledge Vault"],
            ["chart","Insights & Recap"]
          ].map(([icon,label])=><span key={label}><Icon name={icon as any} size={18}/>{label}</span>)}
        </div>
      </div>
      <div className="feature-screen">
        <div className="screen-nav"><span className="stream-wordmark">ARUNIKA</span><i/><i/><i/></div>
        <div className="screen-feature real-screen-feature">
          <img src="https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg" alt="Atomic Habits"/>
          <div className="screen-feature-gradient"/>
          <div className="screen-feature-copy"><small>LANJUTKAN MEMBACA</small><h3>Atomic Habits</h3><p>James Clear · Self Development</p><div className="fake-progress"><span/></div><button><Icon name="play" size={15}/> Lanjut Baca</button></div>
        </div>
        <div className="screen-row">{previewLearning.map((item,i)=><div key={item.title} className={"screen-card sc"+(i+1)}><img src={item.image} alt=""/></div>)}</div>
      </div>
    </section>

    <section className="landing-pro-section" id="pro">
      <div className="pro-cinema-card">
        <div><span className="section-tag">ARUNIKA PRO</span><h2>Kalau sudah cocok, buka semuanya.</h2><p>Koleksi tanpa batas, backup & restore, akses Pro, dan pengalaman PWA penuh. Aktivasi menggunakan kode lisensi + PIN. Saat aktivasi pertama berhasil, data contoh Demo dihapus agar akun Pro dimulai dari koleksi kosong.</p></div>
        <div className="pro-price"><small>SEKALI BAYAR</small><strong>Rp25.000</strong><div className="pro-actions"><a href="/pro" className="netflix-play">Lihat Pro</a><a href="/activate" className="netflix-more">Aktivasi</a></div></div>
      </div>
    </section>

    <footer className="stream-footer"><span className="stream-wordmark">ARUNIKA</span><p>Catat yang dibaca. Simpan yang dipelajari. Tumbuh setiap hari.</p><small>© 2026 Arunika</small></footer>
  </main>;
}
