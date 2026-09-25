import { Icon } from "@/components/Icon";

const previewBooks = [
  { title: "Atomic Habits", meta: "Self Development", mark: "A" },
  { title: "Psychology of Money", meta: "Financial", mark: "P" },
  { title: "Deep Work", meta: "Productivity", mark: "D" },
  { title: "Pareto Learning", meta: "Learning", mark: "P" },
  { title: "The Creative Habit", meta: "Creativity", mark: "C" },
  { title: "How to Learn Better", meta: "Knowledge", mark: "H" }
];

export default function LandingPage(){
  return <main className="stream-landing">
    <header className="landing-stream-nav">
      <a href="/" className="stream-wordmark landing-wordmark">ARUNIKA</a>
      <nav>
        <a href="#jelajah">Jelajah</a>
        <a href="#fitur">Fitur</a>
        <a href="#pro">Pro</a>
      </nav>
      <div className="landing-nav-actions">
        <a href="/activate" className="landing-login">Aktivasi</a>
        <a href="/app" className="landing-demo">Coba Demo</a>
      </div>
    </header>

    <section className="landing-cinema-hero">
      <div className="cinema-grid" aria-hidden="true">
        {previewBooks.map((book,index)=><div className={"cinema-poster p"+(index+1)} key={book.title}><span>{book.mark}</span><small>{book.meta}</small></div>)}
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
        <div className="landing-proof"><span><b>Local-first</b> data tetap di perangkat</span><span><b>PWA</b> bisa dipasang seperti aplikasi</span><span><b>Rp20.000</b> sekali bayar untuk Pro</span></div>
      </div>
    </section>

    <section className="landing-stream-section" id="jelajah">
      <div className="landing-section-head"><h2>Seperti punya perpustakaan streaming pribadi.</h2><p>Bukan dashboard yang penuh kotak. Kontenmu menjadi pusat pengalaman.</p></div>
      <div className="landing-rail">
        {previewBooks.map((book,index)=><div className="landing-media-card" key={book.title}><div className={"landing-poster lp"+(index+1)}><span>{book.mark}</span><small>{book.meta}</small></div><strong>{book.title}</strong><span>{book.meta}</span></div>)}
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
        <div className="screen-feature"><small>LANJUTKAN MEMBACA</small><h3>Atomic Habits</h3><p>James Clear · Self Development</p><div className="fake-progress"><span/></div><button><Icon name="play" size={15}/> Lanjut Baca</button></div>
        <div className="screen-row">{[1,2,3,4].map(i=><div key={i} className={"screen-card sc"+i}><span>{i}</span></div>)}</div>
      </div>
    </section>

    <section className="landing-pro-section" id="pro">
      <div className="pro-cinema-card">
        <div><span className="section-tag">ARUNIKA PRO</span><h2>Kalau sudah cocok, buka semuanya.</h2><p>Koleksi tanpa batas, backup & restore, akses Pro, dan pengalaman PWA penuh. Aktivasi menggunakan kode lisensi + PIN.</p></div>
        <div className="pro-price"><small>SEKALI BAYAR</small><strong>Rp20.000</strong><div className="pro-actions"><a href="/pro" className="netflix-play">Lihat Pro</a><a href="/activate" className="netflix-more">Aktivasi</a></div></div>
      </div>
    </section>

    <footer className="stream-footer"><span className="stream-wordmark">ARUNIKA</span><p>Catat yang dibaca. Simpan yang dipelajari. Tumbuh setiap hari.</p><small>© 2026 Arunika</small></footer>
  </main>;
}
